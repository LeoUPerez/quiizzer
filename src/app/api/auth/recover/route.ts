import { NextResponse } from "next/server";
import { handle, HttpError, readJson } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  return handle(async () => {
    const input = await readJson<{ email?: unknown }>(request);
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    if (!email) throw new HttpError(400, "Escribe tu correo electrónico");

    const origin = new URL(request.url).origin;
    const callback = new URL("/api/auth/callback", origin);
    callback.searchParams.set("next", "/?resetPassword=1");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callback.toString(),
    });
    if (error) throw new HttpError(400, error.message);

    return NextResponse.json({ ok: true });
  });
}
