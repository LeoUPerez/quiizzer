import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { handle, HttpError, orThrow, readJson } from "@/src/lib/api/http";
import { loadProfile, validateRegistration } from "@/src/lib/api/profile";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/src/lib/supabase/server";

/** GET /api/profile — perfil registrado en este navegador, o null. */
export async function GET() {
  return handle(async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ profile: null });

    const profile = await loadProfile(createSupabaseAdminClient(), user.id);
    return NextResponse.json({ profile });
  });
}

/**
 * Devuelve el usuario de Auth que corresponde a un correo, creándolo si no
 * existe. Un correo es siempre una única cuenta.
 *
 * Orden de preferencia: una cuenta permanente con ese correo; si solo hay
 * cuentas anónimas antiguas (de antes de este cambio), la más vieja se
 * convierte en permanente asignándole el correo.
 */
const resolveUserForEmail = async (
  admin: SupabaseClient,
  email: string,
  fullName: string,
): Promise<User> => {
  const rows = orThrow(
    await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: true }),
  ) as Array<{ id: string }>;

  const found = (
    await Promise.all(rows.map((r) => admin.auth.admin.getUserById(r.id)))
  )
    .map((r) => r.data.user)
    .filter((u): u is User => u !== null);

  const permanent = found.find((u) => !u.is_anonymous);
  if (permanent) return permanent;

  const legacyAnonymous = found[0];
  if (legacyAnonymous) {
    const { data, error } = await admin.auth.admin.updateUserById(legacyAnonymous.id, {
      email,
      email_confirm: true,
    });
    if (!error && data.user) return data.user;
  }

  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!created.error && created.data.user) return created.data.user;

  // El correo ya existe en Auth pero sin perfil asociado a ese correo.
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new HttpError(500, error.message);
  const byEmail = data.users.find((u) => u.email?.toLowerCase() === email);
  if (!byEmail) {
    throw new HttpError(500, created.error?.message ?? "No se pudo crear la cuenta");
  }
  return byEmail;
};

/**
 * Traslada al usuario destino los intentos de otros perfiles con el mismo
 * correo y elimina esas cuentas si son anónimas.
 */
const mergeProfilesByEmail = async (
  admin: SupabaseClient,
  targetUserId: string,
  email: string,
): Promise<void> => {
  const others = orThrow(
    await admin.from("profiles").select("id").eq("email", email).neq("id", targetUserId),
  ) as Array<{ id: string }>;
  if (others.length === 0) return;

  const otherIds = others.map((p) => p.id);
  orThrow(await admin.from("attempts").update({ user_id: targetUserId }).in("user_id", otherIds));

  await Promise.all(
    otherIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      if (data.user?.is_anonymous) await admin.auth.admin.deleteUser(id);
    }),
  );
};

/**
 * POST /api/profile { fullName, email } — registra al alumno y deja su sesión
 * en cookies. Si el correo ya tiene cuenta, entra en esa misma cuenta, así
 * que su progreso lo sigue desde cualquier navegador.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const { fullName, email } = validateRegistration(await readJson(request));
    const admin = createSupabaseAdminClient();

    const user = await resolveUserForEmail(admin, email, fullName);
    await mergeProfilesByEmail(admin, user.id, email);

    orThrow(
      await admin
        .from("profiles")
        .upsert({ id: user.id, email, full_name: fullName }, { onConflict: "id" }),
    );

    // Sesión sin contraseña: se genera un enlace mágico en el servidor y se
    // canjea aquí mismo. No se envía ningún correo.
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) throw new HttpError(500, link.error.message);

    const supabase = await createSupabaseServerClient();
    const { error: sessionError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: link.data.properties.hashed_token,
    });
    if (sessionError) throw new HttpError(500, sessionError.message);

    return NextResponse.json({ profile: { id: user.id, email, fullName } }, { status: 201 });
  });
}
