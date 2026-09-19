import { NextResponse } from "next/server";
import { handle } from "@/src/lib/api/http";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

/** POST /api/auth/signout — cierra la sesión y borra las cookies. */
export async function POST() {
  return handle(async () => {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  });
}
