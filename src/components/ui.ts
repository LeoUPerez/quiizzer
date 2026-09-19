import type { AttemptSummaryDto, QuestionType } from "@/src/types/api";

export const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

export type ExamStatus = "not_started" | "in_progress" | "completed";

export const getStatus = (attempt: AttemptSummaryDto | null): ExamStatus => {
  if (!attempt) return "not_started";
  if (attempt.completedAt) return "completed";
  return attempt.answeredCount > 0 ? "in_progress" : "not_started";
};

export const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Selección múltiple",
  true_false: "Verdadero / Falso",
  fill_in_the_blank: "Completar",
};

export const STATUS_META: Record<ExamStatus, { label: string; badge: string }> = {
  not_started: {
    label: "Sin empezar",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  in_progress: {
    label: "En progreso",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  completed: {
    label: "Completado",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
};
