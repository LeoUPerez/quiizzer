import { NextResponse } from "next/server";
import { handle, orThrow } from "@/src/lib/api/http";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/src/lib/supabase/server";
import type { QuizSummaryDto } from "@/src/types/api";

interface QuizRow {
  id: string;
  subject: string;
  title: string;
  topic: string;
}

interface AttemptRow {
  id: string;
  quiz_id: string;
  score: number | null;
  completed_at: string | null;
  attempt_answers: Array<{ count: number }>;
}

/**
 * GET /api/quizzes — listado público de exámenes. Si el navegador tiene
 * sesión, incluye el último intento de ese usuario en cada examen.
 */
export async function GET() {
  return handle(async () => {
    const admin = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [quizzes, questionRows, attempts] = await Promise.all([
      admin
        .from("quizzes")
        .select("id, subject, title, topic")
        .eq("is_public", true)
        .order("subject", { ascending: true })
        .order("created_at", { ascending: true })
        .then((r) => orThrow(r) as QuizRow[]),
      admin
        .from("questions")
        .select("quiz_id")
        .then((r) => orThrow(r) as Array<{ quiz_id: string }>),
      user
        ? supabase
            .from("attempts")
            .select("id, quiz_id, score, completed_at, attempt_answers(count)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .then((r) => orThrow(r) as AttemptRow[])
        : Promise.resolve([] as AttemptRow[]),
    ]);

    const questionCount = new Map<string, number>();
    for (const q of questionRows) {
      questionCount.set(q.quiz_id, (questionCount.get(q.quiz_id) ?? 0) + 1);
    }

    // Los intentos vienen del más reciente al más antiguo: el primero por examen gana.
    const latestByQuiz = new Map<string, AttemptRow>();
    for (const a of attempts) {
      if (!latestByQuiz.has(a.quiz_id)) latestByQuiz.set(a.quiz_id, a);
    }

    const result: QuizSummaryDto[] = quizzes.map((quiz) => {
      const latest = latestByQuiz.get(quiz.id);
      return {
        id: quiz.id,
        subject: quiz.subject,
        title: quiz.title,
        topic: quiz.topic,
        questionCount: questionCount.get(quiz.id) ?? 0,
        latestAttempt: latest
          ? {
              id: latest.id,
              answeredCount: latest.attempt_answers[0]?.count ?? 0,
              score: latest.score,
              completedAt: latest.completed_at,
            }
          : null,
      };
    });

    return NextResponse.json({ quizzes: result });
  });
}
