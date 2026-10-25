import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/";

  if (!code) return NextResponse.redirect(new URL("/?authError=google", url.origin));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/?authError=google", url.origin));
  }

  const metadata = data.user.user_metadata;
  const fullName = typeof metadata.full_name === "string"
    ? metadata.full_name
    : typeof metadata.name === "string"
      ? metadata.name
      : data.user.email.split("@")[0] ?? "Usuario";

  await createSupabaseAdminClient().from("profiles").upsert(
    { id: data.user.id, email: data.user.email.toLowerCase(), full_name: fullName },
    { onConflict: "id" },
  );

  return NextResponse.redirect(new URL(next, url.origin));
}
