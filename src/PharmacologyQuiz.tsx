"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Dashboard } from "@/src/components/Dashboard";
import { ExamView } from "@/src/components/ExamView";
import { RegisterModal } from "@/src/components/RegisterModal";
import { ResultsView } from "@/src/components/ResultsView";
import { LoadingOverlay } from "@/src/components/Spinner";
import { api, ApiError, errorMessage } from "@/src/lib/api-client";
import type { AttemptDetailDto, ProfileDto, QuizSummaryDto } from "@/src/types/api";

type Route = { view: "dashboard" } | { view: "attempt"; attemptId: string };

/** Acción que quedó en espera hasta que el alumno se registre. */
type PendingAction =
  | { kind: "start" | "retake"; quiz: QuizSummaryDto }
  | { kind: "signin" };

interface Props {
  initialProfile: ProfileDto | null;
}

const firstUnansweredIndex = (detail: AttemptDetailDto): number => {
  const i = detail.questions.findIndex((q) => detail.attempt.answers[q.id] === undefined);
  return i === -1 ? 0 : i;
};

const scrollTop = () => window.scrollTo({ top: 0 });

const PharmacologyQuizApp: React.FC<Props> = ({ initialProfile }) => {
  const [profile, setProfile] = useState<ProfileDto | null>(initialProfile);
  const [quizzes, setQuizzes] = useState<QuizSummaryDto[] | null>(null);
  const [route, setRoute] = useState<Route>({ view: "dashboard" });
  const [detail, setDetail] = useState<AttemptDetailDto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Cargando…");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const fail = useCallback((e: unknown) => setError(errorMessage(e)), []);

  const loadQuizzes = useCallback(async () => {
    try {
      const { quizzes: list } = await api.listQuizzes();
      setQuizzes(list);
    } catch (e) {
      fail(e);
    }
  }, [fail]);

  useEffect(() => {
    void loadQuizzes();
  }, [loadQuizzes]);

  const openAttempt = useCallback(
    async (attemptId: string) => {
      setBusyLabel("Abriendo examen…");
      setBusy(true);
      setError(null);
      try {
        const d = await api.getAttempt(attemptId);
        setDetail(d);
        setCurrentIndex(firstUnansweredIndex(d));
        setRoute({ view: "attempt", attemptId });
        scrollTop();
      } catch (e) {
        fail(e);
      } finally {
        setBusy(false);
      }
    },
    [fail],
  );

  const startNewAttempt = useCallback(
    async (quiz: QuizSummaryDto) => {
      setBusyLabel("Abriendo examen…");
      setBusy(true);
      setError(null);
      try {
        const { attemptId } = await api.createAttempt(quiz.id);
        await openAttempt(attemptId);
      } catch (e) {
        // Sin registro (sesión perdida o perfil incompleto): se pide de nuevo.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setProfile(null);
          setPending({ kind: "start", quiz });
        } else {
          fail(e);
        }
        setBusy(false);
      }
    },
    [openAttempt, fail],
  );

  /** Si no hay registro, abre el modal y deja la acción en espera. */
  const withProfile = useCallback(
    (action: Extract<PendingAction, { quiz: QuizSummaryDto }>) => {
      if (profile) {
        void startNewAttempt(action.quiz);
      } else {
        setRegisterError(null);
        setPending(action);
      }
    },
    [profile, startNewAttempt],
  );

  const handleSignIn = useCallback(() => {
    setRegisterError(null);
    setPending({ kind: "signin" });
  }, []);

  const handleStart = useCallback(
    (quiz: QuizSummaryDto) => {
      const latest = quiz.latestAttempt;
      if (latest && !latest.completedAt) void openAttempt(latest.id);
      else withProfile({ kind: "start", quiz });
    },
    [openAttempt, withProfile],
  );

  const handleReview = useCallback(
    (quiz: QuizSummaryDto) => {
      if (quiz.latestAttempt) void openAttempt(quiz.latestAttempt.id);
    },
    [openAttempt],
  );

  const handleRetake = useCallback(
    (quiz: QuizSummaryDto) => withProfile({ kind: "retake", quiz }),
    [withProfile],
  );

  const handleRegister = useCallback(
    async (fullName: string, email: string) => {
      if (!pending) return;
      setBusyLabel(pending.kind === "signin" ? "Iniciando sesión…" : "Abriendo examen…");
      setBusy(true);
      setRegisterError(null);
      try {
        const { profile: created } = await api.register(fullName, email);
        setProfile(created);
        const action = pending;
        setPending(null);
        if (action.kind === "signin") {
          // Solo identificarse: se recarga el listado con su progreso.
          await loadQuizzes();
          setBusy(false);
          return;
        }
        await startNewAttempt(action.quiz);
      } catch (e) {
        setRegisterError(errorMessage(e));
        setBusy(false);
      }
    },
    [pending, startNewAttempt, loadQuizzes],
  );

  const handleAnswer = useCallback(
    (questionId: number, optionId: string) => {
      if (!detail || detail.completed) return;
      const attemptId = detail.attempt.id;

      // Actualización optimista; el servidor es quien califica.
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              attempt: {
                ...prev.attempt,
                answers: { ...prev.attempt.answers, [questionId]: optionId },
              },
            }
          : prev,
      );

      api.saveAnswer(attemptId, questionId, optionId).catch(fail);
    },
    [detail, fail],
  );

  const handleNavigate = useCallback(
    (index: number) => {
      if (!detail) return;
      const max = detail.questions.length - 1;
      setCurrentIndex(Math.min(Math.max(index, 0), max));
    },
    [detail],
  );

  const handleFinish = useCallback(async () => {
    if (!detail || detail.completed) return;
    setBusyLabel("Calificando…");
    setBusy(true);
    setError(null);
    try {
      const graded = await api.completeAttempt(detail.attempt.id);
      setDetail(graded);
      scrollTop();
      void loadQuizzes();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }, [detail, loadQuizzes, fail]);

  const goDashboard = useCallback(() => {
    setRoute({ view: "dashboard" });
    setDetail(null);
    setError(null);
    void loadQuizzes();
    scrollTop();
  }, [loadQuizzes]);

  /** Cierra la sesión anónima de este navegador para que otra persona se registre. */
  const handleSwitchUser = useCallback(async () => {
    try {
      await api.signOut();
    } catch (e) {
      fail(e);
      return;
    }
    setProfile(null);
    setDetail(null);
    setRoute({ view: "dashboard" });
    void loadQuizzes();
  }, [fail, loadQuizzes]);

  let content: React.ReactNode;

  if (route.view === "attempt" && detail) {
    const quizSummary: QuizSummaryDto = {
      ...detail.quiz,
      questionCount: detail.questions.length,
      latestAttempt: null,
    };
    content = detail.completed ? (
      <ResultsView
        quiz={detail.quiz}
        questions={detail.questions}
        answers={detail.attempt.answers}
        score={detail.attempt.score}
        completedAt={detail.attempt.completedAt}
        busy={busy}
        onRetake={() => handleRetake(quizSummary)}
        onExit={goDashboard}
      />
    ) : (
      <ExamView
        quiz={detail.quiz}
        questions={detail.questions}
        answers={detail.attempt.answers}
        currentIndex={currentIndex}
        busy={busy}
        onAnswer={handleAnswer}
        onNavigate={handleNavigate}
        onFinish={handleFinish}
        onExit={goDashboard}
      />
    );
  } else {
    content = (
      <Dashboard
        quizzes={quizzes}
        profile={profile}
        busy={busy}
        onStart={handleStart}
        onReview={handleReview}
        onRetake={handleRetake}
        onSwitchUser={handleSwitchUser}
        onSignIn={handleSignIn}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 antialiased">
      {error && (
        <div
          role="alert"
          className="top-0 z-40 sticky flex justify-between items-center gap-4 bg-rose-50 px-4 py-3 border-rose-200 border-b text-rose-800 text-sm"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="font-semibold hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}
      {content}
      {busy && !pending && <LoadingOverlay label={busyLabel} />}
      {pending && (
        <RegisterModal
          quizTitle={pending.kind === "signin" ? null : pending.quiz.title}
          busy={busy}
          error={registerError}
          onSubmit={handleRegister}
          onCancel={() => {
            if (!busy) setPending(null);
          }}
        />
      )}
    </div>
  );
};

export default PharmacologyQuizApp;
