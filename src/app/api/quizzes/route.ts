import { NextResponse } from "next/server";
import { handle, orThrow } from "@/lib/api/http";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { QuestionType, QuizSummaryDto } from "@/types/api";

interface QuizRow {
  id: string;
  subject: string;
  title: string;
  topic: string;
  user_id: string;
  created_at: string;
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
        .select("id, subject, title, topic, user_id, created_at")
        .eq("is_public", true)
        .order("subject", { ascending: true })
        .order("created_at", { ascending: true })
        .then((r) => orThrow(r) as QuizRow[]),
      admin
        .from("questions")
        .select("quiz_id, type")
        .then((r) => orThrow(r) as Array<{ quiz_id: string; type: QuestionType }>),
      user
        ? supabase
            .from("attempts")
            .select("id, quiz_id, score, completed_at, attempt_answers(count)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .then((r) => orThrow(r) as AttemptRow[])
        : Promise.resolve([] as AttemptRow[]),
    ]);

    const authorIds = [...new Set(quizzes.map((quiz) => quiz.user_id))];
    const profiles = authorIds.length > 0
      ? orThrow(
          await admin.from("profiles").select("id, full_name").in("id", authorIds),
        ) as Array<{ id: string; full_name: string | null }>
      : [];
    const authorById = new Map(profiles.map((profile) => [profile.id, profile.full_name]));

    const questionCount = new Map<string, number>();
    const questionTypes = new Map<string, Set<QuestionType>>();
    for (const q of questionRows) {
      questionCount.set(q.quiz_id, (questionCount.get(q.quiz_id) ?? 0) + 1);
      const types = questionTypes.get(q.quiz_id) ?? new Set<QuestionType>();
      types.add(q.type);
      questionTypes.set(q.quiz_id, types);
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
        questionTypes: [...(questionTypes.get(quiz.id) ?? [])],
        createdAt: quiz.created_at,
        authorName: authorById.get(quiz.user_id) ?? null,
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
