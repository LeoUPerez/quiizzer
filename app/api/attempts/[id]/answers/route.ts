import { NextResponse } from "next/server";
import { requireOpenAttempt } from "@/src/lib/api/attempts";
import { requireUser } from "@/src/lib/api/auth";
import { handle, HttpError, orThrow, readJson } from "@/src/lib/api/http";
import { createSupabaseAdminClient } from "@/src/lib/supabase/server";

/** PUT /api/attempts/:id/answers { questionId, selectedAnswer } — guarda o cambia una respuesta. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { supabase } = await requireUser();
    const { id } = await params;
    const body = await readJson<{ questionId?: unknown; selectedAnswer?: unknown }>(request);

    if (typeof body.questionId !== "number" || !Number.isInteger(body.questionId)) {
      throw new HttpError(400, "questionId debe ser un entero");
    }
    if (typeof body.selectedAnswer !== "string" || body.selectedAnswer.length === 0) {
      throw new HttpError(400, "selectedAnswer es obligatorio");
    }

    const attempt = await requireOpenAttempt(supabase, id);

    // La opción debe existir para esa pregunta y la pregunta pertenecer al examen.
    const option = orThrow(
      await supabase
        .from("question_options")
        .select("option_key, questions!inner(quiz_id)")
        .eq("question_id", body.questionId)
        .eq("option_key", body.selectedAnswer)
        .eq("questions.quiz_id", attempt.quiz_id)
        .maybeSingle(),
    ) as { option_key: string } | null;
    if (!option) throw new HttpError(400, "Opción o pregunta inválida para este examen");

    const admin = createSupabaseAdminClient();
    const question = orThrow(
      await admin
        .from("questions")
        .select("correct_answer")
        .eq("id", body.questionId)
        .single(),
    ) as { correct_answer: string };

    orThrow(
      await admin.from("attempt_answers").upsert(
        {
          attempt_id: attempt.id,
          question_id: body.questionId,
          selected_answer: body.selectedAnswer,
          is_correct: question.correct_answer === body.selectedAnswer,
        },
        { onConflict: "attempt_id,question_id" },
      ),
    );

    return NextResponse.json({ ok: true });
  });
}
