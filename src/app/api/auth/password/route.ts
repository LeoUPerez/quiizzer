import { NextResponse } from "next/server";
import { handle, HttpError, readJson } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  return handle(async () => {
    const input = await readJson<{ password?: unknown }>(request);
    const password = typeof input.password === "string" ? input.password : "";
    if (password.length < 8) throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres");

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new HttpError(401, "El enlace de recuperación no es válido o expiró");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new HttpError(400, error.message);
    return NextResponse.json({ ok: true });
  });
}
