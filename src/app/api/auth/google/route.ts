import { NextResponse } from "next/server";
import { handle, HttpError, readJson } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  return handle(async () => {
    const input = await readJson<{ next?: unknown }>(request);
    const next = typeof input.next === "string" && input.next.startsWith("/")
      ? input.next
      : "/";
    const origin = new URL(request.url).origin;
    const callback = new URL("/api/auth/callback", origin);
    callback.searchParams.set("next", next);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (error || !data.url) throw new HttpError(400, error?.message ?? "No se pudo iniciar Google");

    return NextResponse.json({ url: data.url });
  });
}
