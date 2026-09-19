import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError, orThrow } from "@/src/lib/api/http";
import type { ProfileDto } from "@/src/types/api";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

/** Perfil del usuario, o null si aún no ha registrado su correo. */
export const loadProfile = async (
  admin: SupabaseClient,
  userId: string,
): Promise<ProfileDto | null> => {
  const row = orThrow(
    await admin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .maybeSingle(),
  ) as ProfileRow | null;

  if (!row || !row.email) return null;
  return { id: row.id, email: row.email, fullName: row.full_name ?? "" };
};

/** Lanza 403 si el usuario no ha completado el registro (nombre y correo). */
export const requireProfile = async (
  admin: SupabaseClient,
  userId: string,
): Promise<ProfileDto> => {
  const profile = await loadProfile(admin, userId);
  if (!profile) throw new HttpError(403, "Registra tu nombre y correo para tomar un examen");
  return profile;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistration = (input: {
  fullName?: unknown;
  email?: unknown;
}): { fullName: string; email: string } => {
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (fullName.length < 2) throw new HttpError(400, "Escribe tu nombre");
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "El correo no es válido");

  return { fullName, email };
};
