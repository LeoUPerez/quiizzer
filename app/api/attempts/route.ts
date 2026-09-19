import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/api/auth";
import { handle, HttpError, orThrow, readJson } from "@/src/lib/api/http";
import { requireProfile } from "@/src/lib/api/profile";
import { createSupabaseAdminClient } from "@/src/lib/supabase/server";

/**
 * POST /api/attempts { quizId } — crea un intento nuevo. Exige que el
 * usuario haya registrado nombre y correo (403 si no).
 */
export async function POST(request: Request) {
  return handle(async () => {
    const { user } = await requireUser();
    const admin = createSupabaseAdminClient();
    await requireProfile(admin, user.id);

    const body = await readJson<{ quizId?: unknown }>(request);
    if (typeof body.quizId !== "string" || body.quizId.length === 0) {
      throw new HttpError(400, "quizId es obligatorio");
    }

    const quiz = orThrow(
      await admin
        .from("quizzes")
        .select("id")
        .eq("id", body.quizId)
        .eq("is_public", true)
        .maybeSingle(),
    ) as { id: string } | null;
    if (!quiz) throw new HttpError(404, "Examen no encontrado");

    const created = orThrow(
      await admin
        .from("attempts")
        .insert({ quiz_id: quiz.id, user_id: user.id })
        .select("id")
        .single(),
    ) as { id: string };

    return NextResponse.json({ attemptId: created.id }, { status: 201 });
  });
}
