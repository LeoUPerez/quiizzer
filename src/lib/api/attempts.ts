import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError, orThrow } from "@/src/lib/api/http";
import type {
  AttemptDetailDto,
  GradedQuestionDto,
  OptionDto,
  QuestionDto,
  QuestionType,
} from "@/src/types/api";

interface AttemptRow {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

interface QuestionRow {
  id: number;
  type: QuestionType;
  statement: string;
  correct_answer?: string;
  explanation?: string;
}

interface OptionRow {
  question_id: number;
  option_key: string;
  text: string;
}

interface AnswerRow {
  question_id: number;
  selected_answer: string;
}

/** Orden de opciones: True antes que False; el resto alfabético (a, b, c, d). */
const compareOptionKeys = (a: string, b: string): number => {
  const rank = (k: string) => (k === "True" ? 0 : k === "False" ? 1 : 2);
  return rank(a) - rank(b) || a.localeCompare(b);
};

/**
 * Carga un intento con su examen y preguntas. Solo devuelve respuestas
 * correctas y explicaciones cuando el intento ya está finalizado; para eso
 * usa el cliente admin, porque esas columnas no son legibles con la sesión.
 */
export const loadAttemptDetail = async (
  supabase: SupabaseClient,
  admin: SupabaseClient,
  attemptId: string,
): Promise<AttemptDetailDto> => {
  const attempt = orThrow(
    await supabase
      .from("attempts")
      .select("id, quiz_id, user_id, score, completed_at, created_at")
      .eq("id", attemptId)
      .maybeSingle(),
  ) as AttemptRow | null;
  if (!attempt) throw new HttpError(404, "Intento no encontrado");

  const quiz = orThrow(
    await supabase
      .from("quizzes")
      .select("id, subject, title, topic")
      .eq("id", attempt.quiz_id)
      .maybeSingle(),
  ) as { id: string; subject: string; title: string; topic: string } | null;
  if (!quiz) throw new HttpError(404, "Examen no encontrado");

  const completed = attempt.completed_at !== null;

  const questions = orThrow(
    await (completed ? admin : supabase)
      .from("questions")
      .select(
        completed
          ? "id, type, statement, correct_answer, explanation"
          : "id, type, statement",
      )
      .eq("quiz_id", attempt.quiz_id)
      .order("id", { ascending: true }),
  ) as unknown as QuestionRow[];

  const questionIds = questions.map((q) => q.id);

  const [options, answers] = await Promise.all([
    supabase
      .from("question_options")
      .select("question_id, option_key, text")
      .in("question_id", questionIds)
      .then((r) => orThrow(r) as OptionRow[]),
    supabase
      .from("attempt_answers")
      .select("question_id, selected_answer")
      .eq("attempt_id", attemptId)
      .then((r) => orThrow(r) as AnswerRow[]),
  ]);

  const optionsByQuestion = new Map<number, OptionDto[]>();
  for (const o of options) {
    const list = optionsByQuestion.get(o.question_id) ?? [];
    list.push({ id: o.option_key, text: o.text });
    optionsByQuestion.set(o.question_id, list);
  }
  for (const list of optionsByQuestion.values()) {
    list.sort((a, b) => compareOptionKeys(a.id, b.id));
  }

  const toDto = (q: QuestionRow): QuestionDto => ({
    id: q.id,
    type: q.type,
    statement: q.statement,
    options: optionsByQuestion.get(q.id) ?? [],
  });

  const attemptDto = {
    id: attempt.id,
    quizId: attempt.quiz_id,
    score: attempt.score,
    completedAt: attempt.completed_at,
    createdAt: attempt.created_at,
    answers: Object.fromEntries(
      answers.map((a) => [a.question_id, a.selected_answer]),
    ) as Record<number, string>,
  };

  if (!completed) {
    return { completed: false, attempt: attemptDto, quiz, questions: questions.map(toDto) };
  }

  const graded: GradedQuestionDto[] = questions.map((q) => ({
    ...toDto(q),
    correctAnswer: q.correct_answer ?? "",
    explanation: q.explanation ?? "",
  }));
  return { completed: true, attempt: attemptDto, quiz, questions: graded };
};

/** Devuelve el intento abierto del usuario o lanza 404/409. */
export const requireOpenAttempt = async (
  supabase: SupabaseClient,
  attemptId: string,
): Promise<AttemptRow> => {
  const attempt = orThrow(
    await supabase
      .from("attempts")
      .select("id, quiz_id, user_id, score, completed_at, created_at")
      .eq("id", attemptId)
      .maybeSingle(),
  ) as AttemptRow | null;
  if (!attempt) throw new HttpError(404, "Intento no encontrado");
  if (attempt.completed_at) throw new HttpError(409, "El intento ya fue finalizado");
  return attempt;
};
