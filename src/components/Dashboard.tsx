"use client";

import React from "react";
import { ProfileAvatar } from "@/src/components/ProfileAvatar";
import { Spinner } from "@/src/components/Spinner";
import { cx, getStatus, STATUS_META } from "@/src/components/ui";
import type { ProfileDto, QuizSummaryDto } from "@/src/types/api";

interface DashboardProps {
  quizzes: QuizSummaryDto[] | null;
  profile: ProfileDto | null;
  busy: boolean;
  onStart: (quiz: QuizSummaryDto) => void;
  onReview: (quiz: QuizSummaryDto) => void;
  onRetake: (quiz: QuizSummaryDto) => void;
  onSwitchUser: () => void;
  onSignIn: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quizzes,
  profile,
  busy,
  onStart,
  onReview,
  onRetake,
  onSwitchUser,
  onSignIn,
}) => {
  const list = quizzes ?? [];
  const completedCount = list.filter(
    (q) => getStatus(q.latestAttempt) === "completed",
  ).length;

  // Agrupa por área conservando el orden en que llegan del servidor.
  const bySubject = new Map<string, QuizSummaryDto[]>();
  for (const quiz of list) {
    const group = bySubject.get(quiz.subject) ?? [];
    group.push(quiz);
    bySubject.set(quiz.subject, group);
  }
  const subjects = Array.from(bySubject.keys());

  return (
    <div className="mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      <header className="flex justify-between items-start gap-4 mb-10">
        <div>
          <p className="font-medium text-indigo-600 text-sm uppercase tracking-wider">
            {subjects.length > 0 ? subjects.join(" · ") : "Ciencias de la salud"}
          </p>
          <h1 className="mt-1 font-bold text-slate-900 text-3xl sm:text-4xl tracking-tight">
            Banco de exámenes
          </h1>
          <p className="mt-2 text-slate-600">
            {!quizzes
              ? "Cargando exámenes…"
              : profile
                ? `${completedCount} de ${list.length} exámenes completados.`
                : "Explora los exámenes. Para tomar uno te pediremos tu nombre y correo."}
          </p>
        </div>
        {profile ? (
          <ProfileAvatar profile={profile} onSwitchUser={onSwitchUser} />
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 font-semibold text-white text-sm transition shrink-0"
          >
            Iniciar sesión
          </button>
        )}
      </header>

      {!quizzes && (
        <div className="flex justify-center py-16">
          <Spinner label="Cargando exámenes" />
        </div>
      )}

      {quizzes && list.length === 0 && (
        <div className="bg-white p-8 border border-slate-200 border-dashed rounded-2xl text-center">
          <p className="text-slate-600">Todavía no hay exámenes publicados.</p>
          <p className="mt-1 text-slate-500 text-sm">
            Carga los exámenes en Supabase y marca <code className="bg-slate-100 px-1.5 py-0.5 rounded">is_public</code>{" "}
            para que aparezcan aquí.
          </p>
        </div>
      )}

      {subjects.map((subject) => (
        <section key={subject} className="mb-12 last:mb-0">
          <div className="flex items-baseline gap-3 mb-5">
            <h2 className="font-bold text-slate-900 text-xl">{subject}</h2>
            <span className="text-slate-500 text-sm">
              {bySubject.get(subject)?.length ?? 0}{" "}
              {(bySubject.get(subject)?.length ?? 0) === 1 ? "examen" : "exámenes"}
            </span>
          </div>
          <QuizGrid
            quizzes={bySubject.get(subject) ?? []}
            busy={busy}
            onStart={onStart}
            onReview={onReview}
            onRetake={onRetake}
          />
        </section>
      ))}
    </div>
  );
};

interface QuizGridProps {
  quizzes: QuizSummaryDto[];
  busy: boolean;
  onStart: (quiz: QuizSummaryDto) => void;
  onReview: (quiz: QuizSummaryDto) => void;
  onRetake: (quiz: QuizSummaryDto) => void;
}

const QuizGrid: React.FC<QuizGridProps> = ({ quizzes, busy, onStart, onReview, onRetake }) => {
  return (
    <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const attempt = quiz.latestAttempt;
          const status = getStatus(attempt);
          const meta = STATUS_META[status];
          const answered = attempt?.answeredCount ?? 0;
          const total = quiz.questionCount;
          const pct =
            attempt?.score != null && total > 0
              ? Math.round((attempt.score / total) * 100)
              : null;

          return (
            <article
              key={quiz.id}
              className="flex flex-col bg-white shadow-sm hover:shadow-md p-6 border border-slate-200 rounded-2xl transition"
            >
              <div className="flex justify-between items-start gap-3">
                <span
                  className={cx(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                    meta.badge,
                  )}
                >
                  {meta.label}
                </span>
                <span className="text-slate-500 text-xs">{total} preguntas</span>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 text-lg leading-snug">
                {quiz.title}
              </h3>
              <p className="mt-1 text-slate-600 text-sm">{quiz.topic}</p>

              <div className="flex-1 mt-5">
                {status === "completed" && attempt?.score != null && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                      Calificación final
                    </p>
                    <p className="mt-1 font-bold text-slate-900 text-2xl">
                      {attempt.score}/{total}{" "}
                      <span
                        className={cx(
                          "text-base font-semibold",
                          (pct ?? 0) >= 70 ? "text-emerald-600" : "text-rose-600",
                        )}
                      >
                        ({pct}%)
                      </span>
                    </p>
                  </div>
                )}
                {status === "in_progress" && (
                  <div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Respondidas</span>
                      <span>
                        {answered}/{total}
                      </span>
                    </div>
                    <div className="bg-slate-100 mt-1.5 rounded-full w-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 rounded-full h-full transition-all"
                        style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
                {status === "not_started" && (
                  <p className="text-slate-500 text-sm">
                    Aún no has respondido ninguna pregunta.
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                {status === "not_started" && (
                  <button
                    type="button"
                    disabled={busy || total === 0}
                    onClick={() => onStart(quiz)}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 w-full font-semibold text-white text-sm transition"
                  >
                    Iniciar
                  </button>
                )}
                {status === "in_progress" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onStart(quiz)}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 w-full font-semibold text-white text-sm transition"
                  >
                    Continuar
                  </button>
                )}
                {status === "completed" && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onReview(quiz)}
                      className="flex-1 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-sm px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 font-semibold text-slate-700 text-sm transition"
                    >
                      Revisar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRetake(quiz)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 font-semibold text-white text-sm transition"
                    >
                      Repetir
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
    </div>
  );
};
