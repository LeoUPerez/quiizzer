import type { AttemptDetailDto, ProfileDto, QuizSummaryDto } from "@/types/api";

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

  register: (fullName: string, email: string, password: string) =>
    request<{ profile: ProfileDto }>("/api/profile", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ profile: ProfileDto }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  recoverPassword: (email: string) =>
    request<{ ok: true }>("/api/auth/recover", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  updatePassword: (password: string) =>
    request<{ ok: true }>("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),

  googleSignInUrl: (next: string) =>
    request<{ url: string }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ next }),
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
