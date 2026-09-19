import type { AttemptDetailDto, ProfileDto, QuizSummaryDto } from "@/src/types/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const request = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : response.statusText;
    throw new ApiError(response.status, message);
  }

  return body as T;
};

export const api = {
  listQuizzes: () => request<{ quizzes: QuizSummaryDto[] }>("/api/quizzes"),

  getProfile: () => request<{ profile: ProfileDto | null }>("/api/profile"),

  register: (fullName: string, email: string) =>
    request<{ profile: ProfileDto }>("/api/profile", {
      method: "POST",
      body: JSON.stringify({ fullName, email }),
    }),

  createAttempt: (quizId: string) =>
    request<{ attemptId: string }>("/api/attempts", {
      method: "POST",
      body: JSON.stringify({ quizId }),
    }),

  getAttempt: (attemptId: string) => request<AttemptDetailDto>(`/api/attempts/${attemptId}`),

  saveAnswer: (attemptId: string, questionId: number, selectedAnswer: string) =>
    request<{ ok: true }>(`/api/attempts/${attemptId}/answers`, {
      method: "PUT",
      body: JSON.stringify({ questionId, selectedAnswer }),
    }),

  completeAttempt: (attemptId: string) =>
    request<AttemptDetailDto>(`/api/attempts/${attemptId}/complete`, { method: "POST" }),

  signOut: () => request<{ ok: true }>("/api/auth/signout", { method: "POST" }),
};

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado";
