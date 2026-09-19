/* Contratos compartidos entre las rutas de API (app/api) y el cliente (src). */

export type QuestionType = "multiple_choice" | "true_false" | "fill_in_the_blank";

export interface OptionDto {
  /** Clave de la opción: "a".."d" o "True"/"False". */
  id: string;
  text: string;
}

/** Pregunta tal como la ve el alumno mientras responde: sin respuesta correcta. */
export interface QuestionDto {
  id: number;
  type: QuestionType;
  statement: string;
  options: OptionDto[];
}

/** Pregunta con la solución; solo se entrega cuando el intento está finalizado. */
export interface GradedQuestionDto extends QuestionDto {
  correctAnswer: string;
  explanation: string;
}

export interface AttemptSummaryDto {
  id: string;
  answeredCount: number;
  score: number | null;
  completedAt: string | null;
}

export interface QuizSummaryDto {
  id: string;
  /** Área o materia: "Farmacología", "Bioquímica"… */
  subject: string;
  title: string;
  topic: string;
  questionCount: number;
  /** Último intento del usuario en este examen, si existe. */
  latestAttempt: AttemptSummaryDto | null;
}

export interface AttemptDto {
  id: string;
  quizId: string;
  score: number | null;
  completedAt: string | null;
  createdAt: string;
  /** questionId -> clave de opción seleccionada */
  answers: Record<number, string>;
}

export interface QuizHeaderDto {
  id: string;
  subject: string;
  title: string;
  topic: string;
}

export type AttemptDetailDto =
  | { completed: false; attempt: AttemptDto; quiz: QuizHeaderDto; questions: QuestionDto[] }
  | { completed: true; attempt: AttemptDto; quiz: QuizHeaderDto; questions: GradedQuestionDto[] };

/** Datos que el alumno registra antes de tomar un examen. */
export interface ProfileDto {
  id: string;
  email: string;
  fullName: string;
}
