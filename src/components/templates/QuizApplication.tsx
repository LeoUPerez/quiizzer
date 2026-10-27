"use client";

import { Dashboard } from "@/components/Dashboard";
import { ExamView } from "@/components/ExamView";
import { ResultsView } from "@/components/ResultsView";
import { LoadingOverlay } from "@/components/Spinner";
import type { AttemptDetailDto, ProfileDto, QuizSummaryDto } from "@/types/api";

type Route = { view: "dashboard" } | { view: "attempt"; attemptId: string };
type PendingAction = { kind: "start" | "retake"; quiz: QuizSummaryDto };

interface QuizApplicationProps {
  profile: ProfileDto | null;
  quizzes: QuizSummaryDto[] | null;
  route: Route;
  detail: AttemptDetailDto | null;
  currentIndex: number;
  busy: boolean;
  busyLabel: string;
  error: string | null;
  pendingAction: PendingAction | null;
  subjectFilter: string | null;
  topicFilter: string | null;
  onDismissError: () => void;
  onRetry: () => void;
  onResumePending: () => void;
  onDismissPending: () => void;
  onStart: (quiz: QuizSummaryDto) => void;
  onReview: (quiz: QuizSummaryDto) => void;
  onRetake: (quiz: QuizSummaryDto) => void;
  onSwitchUser: () => void;
  onSignIn: () => void;
  onAnswer: (questionId: number, optionId: string) => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  onExit: () => void;
}

export const QuizApplication = ({
  profile, quizzes, route, detail, currentIndex, busy, busyLabel, error, pendingAction,
  subjectFilter, topicFilter, onDismissError, onRetry, onResumePending, onDismissPending, onStart, onReview, onRetake, onSwitchUser, onSignIn, onAnswer,
  onNavigate, onFinish, onExit,
}: QuizApplicationProps) => {
  const content = route.view === "attempt" && detail ? (() => {
    const quizSummary: QuizSummaryDto = {
      ...detail.quiz,
      questionCount: detail.questions.length,
      questionTypes: [...new Set(detail.questions.map((question) => question.type))],
      createdAt: "",
      authorName: null,
      latestAttempt: null,
    };
    return detail.completed ? (
      <ResultsView quiz={detail.quiz} questions={detail.questions} answers={detail.attempt.answers} score={detail.attempt.score} completedAt={detail.attempt.completedAt} busy={busy} onRetake={() => onRetake(quizSummary)} onExit={onExit} />
    ) : (
      <ExamView quiz={detail.quiz} questions={detail.questions} answers={detail.attempt.answers} currentIndex={currentIndex} busy={busy} onAnswer={onAnswer} onNavigate={onNavigate} onFinish={onFinish} onExit={onExit} />
    );
  })() : (
    <Dashboard quizzes={quizzes} profile={profile} busy={busy} subjectFilter={subjectFilter} topicFilter={topicFilter} onStart={onStart} onReview={onReview} onRetake={onRetake} onSwitchUser={onSwitchUser} onSignIn={onSignIn} />
  );

  return <div className="bg-slate-50 min-h-screen font-sans text-slate-900 antialiased">
    {error && <div role="alert" className="top-0 z-40 sticky flex justify-between items-center gap-4 bg-rose-50 px-4 py-3 border-rose-200 border-b text-rose-800 text-sm"><span>{error}</span><div className="flex gap-3"><button type="button" onClick={onRetry} className="font-semibold hover:underline">Intentar de nuevo</button><button type="button" onClick={onDismissError} className="font-semibold hover:underline">Cerrar</button></div></div>}
    {profile && pendingAction && (
      <div role="status" className="right-4 bottom-4 left-4 z-40 fixed flex sm:flex-row flex-col sm:items-center gap-3 bg-white shadow-xl mx-auto p-4 border border-violet-200 rounded-2xl max-w-xl">
        <p className="flex-1 text-slate-700 text-sm">
          Sesión iniciada. Continúa cuando quieras con <strong>{pendingAction.quiz.title}</strong>.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onDismissPending} className="px-3 py-2 rounded-lg font-semibold text-slate-600 text-sm hover:bg-slate-50">Ahora no</button>
          <button type="button" onClick={onResumePending} className="bg-[#6341DB] hover:bg-[#5132c4] px-3 py-2 rounded-lg font-semibold text-white text-sm">Continuar</button>
        </div>
      </div>
    )}
    {content}
    {busy && <LoadingOverlay label={busyLabel} />}
  </div>;
};
