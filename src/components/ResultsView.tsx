"use client";

import React from "react";
import { cx, TYPE_LABEL } from "@/src/components/ui";
import type { GradedQuestionDto, QuizHeaderDto } from "@/src/types/api";

interface ResultsViewProps {
  quiz: QuizHeaderDto;
  questions: GradedQuestionDto[];
  answers: Record<number, string>;
  score: number | null;
  completedAt: string | null;
  busy: boolean;
  onRetake: () => void;
  onExit: () => void;
}

const renderStatementWithAnswer = (q: GradedQuestionDto, optionId?: string): string => {
  if (q.type !== "fill_in_the_blank") return q.statement;
  const text = q.options.find((o) => o.id === optionId)?.text ?? "______";
  return q.statement.replace("___", `[${text}]`);
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  quiz,
  questions,
  answers,
  score: storedScore,
  completedAt,
  busy,
  onRetake,
  onExit,
}) => {
  const total = questions.length;
  const score =
    storedScore ??
    questions.reduce((acc, q) => (answers[q.id] === q.correctAnswer ? acc + 1 : acc), 0);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 70;

  const optionText = (q: GradedQuestionDto, id?: string) =>
    q.options.find((o) => o.id === id)?.text;

  return (
    <div className="mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <button
        type="button"
        onClick={onExit}
        className="font-medium text-indigo-600 hover:text-indigo-800 text-sm"
      >
        ← Volver al listado
      </button>

      {/* Resumen */}
      <section
        className={cx(
          "mt-4 rounded-2xl border p-8 text-center shadow-sm",
          passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50",
        )}
      >
        <p className="font-medium text-slate-600 text-sm uppercase tracking-wider">
          Resultado · {quiz.subject}
        </p>
        <h1 className="mt-1 font-bold text-slate-900 text-2xl">{quiz.title}</h1>
        <div className="flex justify-center items-center gap-6 mt-6">
          <div
            className={cx(
              "flex h-32 w-32 flex-col items-center justify-center rounded-full border-8",
              passed ? "border-emerald-500 text-emerald-700" : "border-rose-500 text-rose-700",
            )}
          >
            <span className="font-extrabold text-3xl">{pct}%</span>
            <span className="font-semibold text-xs">
              {score}/{total}
            </span>
          </div>
        </div>
        <p
          className={cx(
            "mt-5 text-lg font-semibold",
            passed ? "text-emerald-800" : "text-rose-800",
          )}
        >
          {passed
            ? "¡Excelente! Has aprobado el examen."
            : "Sigue estudiando. Revisa las explicaciones a continuación."}
        </p>
        {completedAt && (
          <p className="mt-1 text-slate-500 text-xs">
            Completado el{" "}
            {new Date(completedAt).toLocaleString("es-ES", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onRetake}
            disabled={busy}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm px-5 py-2.5 rounded-lg font-semibold text-white text-sm"
          >
            Repetir examen
          </button>
          <button
            type="button"
            onClick={onExit}
            className="bg-white hover:bg-slate-50 shadow-sm px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm"
          >
            Ir al listado
          </button>
        </div>
      </section>

      {/* Desglose */}
      <h2 className="mt-10 font-bold text-slate-900 text-lg">Desglose de respuestas</h2>
      <ol className="space-y-4 mt-4">
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const correct = userAnswer === q.correctAnswer;
          const skipped = userAnswer === undefined;
          return (
            <li
              key={q.id}
              className={cx(
                "rounded-2xl border bg-white p-5 shadow-sm",
                correct ? "border-emerald-200" : "border-rose-200",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cx(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                    correct ? "bg-emerald-500" : "bg-rose-500",
                  )}
                  aria-label={correct ? "Correcta" : "Incorrecta"}
                >
                  {correct ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Pregunta {i + 1}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium text-[11px] text-slate-600">
                      {TYPE_LABEL[q.type]}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-slate-900">
                    {renderStatementWithAnswer(q, q.correctAnswer)}
                  </p>

                  <dl className="gap-2 grid sm:grid-cols-2 mt-3 text-sm">
                    <div
                      className={cx(
                        "rounded-lg p-3",
                        correct ? "bg-emerald-50" : skipped ? "bg-slate-50" : "bg-rose-50",
                      )}
                    >
                      <dt className="font-semibold text-slate-500 text-xs uppercase">
                        Tu respuesta
                      </dt>
                      <dd
                        className={cx(
                          "mt-0.5 font-medium",
                          correct
                            ? "text-emerald-800"
                            : skipped
                              ? "italic text-slate-500"
                              : "text-rose-800",
                        )}
                      >
                        {skipped ? "Sin responder" : optionText(q, userAnswer) ?? userAnswer}
                      </dd>
                    </div>
                    {!correct && (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <dt className="font-semibold text-slate-500 text-xs uppercase">
                          Respuesta correcta
                        </dt>
                        <dd className="mt-0.5 font-medium text-emerald-800">
                          {optionText(q, q.correctAnswer) ?? q.correctAnswer}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <p className="bg-indigo-50/60 mt-3 p-3 border-indigo-400 border-l-4 rounded-lg text-slate-700 text-sm leading-relaxed">
                    <span className="font-semibold text-indigo-800">Explicación: </span>
                    {q.explanation}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
