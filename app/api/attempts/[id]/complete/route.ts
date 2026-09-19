import { NextResponse } from "next/server";
import { loadAttemptDetail, requireOpenAttempt } from "@/src/lib/api/attempts";
import { requireUser } from "@/src/lib/api/auth";
import { handle, orThrow } from "@/src/lib/api/http";
import { createSupabaseAdminClient } from "@/src/lib/supabase/server";

/**
 * POST /api/attempts/:id/complete — recalifica todas las respuestas en el
 * servidor, guarda la nota y cierra el intento. Devuelve el detalle calificado.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { supabase, user } = await requireUser();
    const { id } = await params;
    const attempt = await requireOpenAttempt(supabase, id);
    const admin = createSupabaseAdminClient();

    const [questions, answers] = await Promise.all([
      admin
        .from("questions")
        .select("id, correct_answer")
        .eq("quiz_id", attempt.quiz_id)
        .then((r) => orThrow(r) as Array<{ id: number; correct_answer: string }>),
      admin
        .from("attempt_answers")
        .select("id, question_id, selected_answer, is_correct")
        .eq("attempt_id", attempt.id)
        .then(
          (r) =>
            orThrow(r) as Array<{
              id: string;
              question_id: number;
              selected_answer: string;
              is_correct: boolean;
            }>,
        ),
    ]);

    const correctById = new Map(questions.map((q) => [q.id, q.correct_answer]));

    // Se recalifica siempre desde la fuente de verdad, sin confiar en is_correct previo.
    let score = 0;
    const fixes: Array<PromiseLike<unknown>> = [];
    for (const a of answers) {
      const isCorrect = correctById.get(a.question_id) === a.selected_answer;
      if (isCorrect) score += 1;
      if (isCorrect !== a.is_correct) {
        fixes.push(
          admin.from("attempt_answers").update({ is_correct: isCorrect }).eq("id", a.id),
        );
      }
    }
    await Promise.all(fixes);

    orThrow(
      await admin
        .from("attempts")
        .update({ score, completed_at: new Date().toISOString() })
        .eq("id", attempt.id)
        .eq("user_id", user.id),
    );

    const detail = await loadAttemptDetail(supabase, admin, attempt.id);
    return NextResponse.json(detail);
  });
}
