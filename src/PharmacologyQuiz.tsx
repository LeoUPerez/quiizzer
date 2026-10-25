"use client";

import React, { useCallback, useEffect, useState } from "react";
import { QuizApplication } from "@/components/templates/QuizApplication";
import { useAuthModal } from "@/hooks/useAuthModal";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import type { AttemptDetailDto, ProfileDto, QuizSummaryDto } from "@/types/api";

type Route = { view: "dashboard" } | { view: "attempt"; attemptId: string };

/** Acción que quedó en espera hasta que el alumno se registre. */
type PendingAction =
  { kind: "start" | "retake"; quiz: QuizSummaryDto };

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
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const { openAuth } = useAuthModal();
  const [catalogFilters] = useState(() => {
    if (typeof window === "undefined") return { subject: null, topic: null };
    const params = new URLSearchParams(window.location.search);
    return { subject: params.get("subject"), topic: params.get("topic") };
  });

  const fail = useCallback((e: unknown) => setError(errorMessage(e)), []);

  const loadQuizzes = useCallback(async () => {
    try {
      const { quizzes: list } = await api.listQuizzes();
      setQuizzes(list);
    } catch (e) {
      fail(e);
    }
  }, [fail]);

  const handleAuthenticated = useCallback((authenticatedProfile: ProfileDto) => {
    setProfile(authenticatedProfile);
    void loadQuizzes();
  }, [loadQuizzes]);

  const requestAuthentication = useCallback(() => {
    openAuth({ onAuthenticated: handleAuthenticated });
  }, [handleAuthenticated, openAuth]);

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
          setPendingAction({ kind: "start", quiz });
          requestAuthentication();
        } else {
          fail(e);
        }
        setBusy(false);
      }
    },
    [openAttempt, fail, requestAuthentication],
  );

  /** Si no hay registro, abre el modal y deja la acción en espera. */
  const withProfile = useCallback(
    (action: Extract<PendingAction, { quiz: QuizSummaryDto }>) => {
      if (profile) {
        void startNewAttempt(action.quiz);
      } else {
        setPendingAction(action);
        requestAuthentication();
      }
    },
    [profile, requestAuthentication, startNewAttempt],
  );

  const handleSignIn = useCallback(() => {
    requestAuthentication();
  }, [requestAuthentication]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("signin") === "1") handleSignIn();
  }, [handleSignIn]);

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

  const resumePendingAction = useCallback(() => {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    void startNewAttempt(action.quiz);
  }, [pendingAction, startNewAttempt]);

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

  return <QuizApplication
    profile={profile} quizzes={quizzes} route={route} detail={detail} currentIndex={currentIndex}
    busy={busy} busyLabel={busyLabel} error={error}
    pendingAction={pendingAction} onResumePending={resumePendingAction} onDismissPending={() => setPendingAction(null)}
    subjectFilter={catalogFilters.subject} topicFilter={catalogFilters.topic} onDismissError={() => setError(null)} onStart={handleStart}
    onReview={handleReview} onRetake={handleRetake} onSwitchUser={handleSwitchUser}
    onSignIn={handleSignIn} onAnswer={handleAnswer} onNavigate={handleNavigate}
    onFinish={handleFinish} onExit={goDashboard}
  />;
};

export default PharmacologyQuizApp;
