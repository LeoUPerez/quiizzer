import { NextResponse } from "next/server";
import { handle, HttpError, readJson } from "@/lib/api/http";
import { loadProfile } from "@/lib/api/profile";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

export async function POST(request: Request) {
  return handle(async () => {
    const input = await readJson<{ email?: unknown; password?: unknown }>(request);
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";

    if (!email || !password) throw new HttpError(400, "Completa tu correo y contraseña");

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new HttpError(401, "El correo o la contraseña no son correctos");
    }

    const profile = await loadProfile(createSupabaseAdminClient(), data.user.id);
    if (!profile) {
      throw new HttpError(403, "La cuenta existe, pero aún no tiene un perfil de Quiizzer");
    }

    return NextResponse.json({ profile });
  });
}
