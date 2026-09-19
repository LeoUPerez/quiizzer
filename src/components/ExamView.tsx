"use client";

import React, { useEffect, useState } from "react";
import { QuestionRenderer } from "@/src/components/QuestionRenderer";
import { cx, TYPE_LABEL } from "@/src/components/ui";
import type { QuestionDto, QuizHeaderDto } from "@/src/types/api";

interface ExamViewProps {
  quiz: QuizHeaderDto;
  questions: QuestionDto[];
  answers: Record<number, string>;
  currentIndex: number;
  busy: boolean;
  onAnswer: (questionId: number, optionId: string) => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  onExit: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  quiz,
  questions,
  answers,
  currentIndex,
  busy,
  onAnswer,
  onNavigate,
  onFinish,
  onExit,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = questions.length;
  const index = Math.min(Math.max(currentIndex, 0), total - 1);
  const question: QuestionDto | undefined = questions[index];
  const answeredCount = Object.keys(answers).length;
  const unanswered = questions.filter((q) => answers[q.id] === undefined);

  const handleFinishClick = () => {
    if (unanswered.length > 0) {
      setConfirmOpen(true);
    } else {
      onFinish();
    }
  };

  // Navegación con teclado (flechas)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (confirmOpen) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "SELECT" || tag === "INPUT") return;
      if (e.key === "ArrowRight" && index < total - 1) onNavigate(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, total, onNavigate, confirmOpen]);

  if (!question) return null;

  return (
    <div className="mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      {/* Cabecera */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onExit}
            className="font-medium text-indigo-600 hover:text-indigo-800 text-sm"
          >
            ← Volver al listado
          </button>
          <p className="mt-2 font-medium text-indigo-600 text-xs uppercase tracking-wider">
            {quiz.subject}
          </p>
          <h1 className="mt-0.5 font-bold text-slate-900 text-xl sm:text-2xl">{quiz.title}</h1>
          <p className="text-slate-600 text-sm">{quiz.topic}</p>
        </div>
        <div className="bg-white shadow-sm px-4 py-2 rounded-xl ring-1 ring-slate-200 text-right shrink-0">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Pregunta</p>
          <p className="font-bold text-slate-900 text-lg">
            {index + 1}{" "}
            <span className="font-medium text-slate-500 text-sm">de {total}</span>
          </p>
        </div>
      </div>

      {/* Barra de progreso + saltos por pregunta */}
      <div className="mb-8">
        <div className="bg-slate-200 rounded-full w-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 rounded-full h-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {questions.map((q, i) => {
            const answered = answers[q.id] !== undefined;
            const active = i === index;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onNavigate(i)}
                aria-label={`Ir a la pregunta ${i + 1}`}
                aria-current={active ? "step" : undefined}
                className={cx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                  active && "bg-indigo-600 text-white ring-2 ring-indigo-300",
                  !active && answered && "bg-emerald-100 text-emerald-800",
                  !active && !answered && "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {i + 1}
              </button>
            );
          })}
          <span className="ml-auto text-slate-500 text-xs">
            {answeredCount}/{total} respondidas
          </span>
        </div>
      </div>

      {/* Tarjeta de pregunta */}
      <section className="bg-white shadow-sm p-6 sm:p-8 border border-slate-200 rounded-2xl">
        <span className="inline-flex items-center bg-indigo-50 px-2.5 py-0.5 rounded-full ring-1 ring-indigo-200 ring-inset font-semibold text-indigo-700 text-xs">
          {TYPE_LABEL[question.type]}
        </span>
        {question.type !== "fill_in_the_blank" && (
          <h2 className="mt-4 font-semibold text-slate-900 text-lg sm:text-xl leading-relaxed">
            {question.statement}
          </h2>
        )}
        <div className="mt-6">
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(optionId) => onAnswer(question.id, optionId)}
          />
        </div>
      </section>

      {/* Navegación */}
      <div className="flex sm:flex-row flex-col-reverse sm:justify-between sm:items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          disabled={index === 0}
          className="bg-white hover:bg-slate-50 disabled:opacity-40 shadow-sm px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm transition disabled:cursor-not-allowed"
        >
          ← Atrás
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleFinishClick}
            disabled={busy}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm px-5 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 font-semibold text-white text-sm transition"
          >
            {busy ? "Calificando…" : "Finalizar examen"}
          </button>
          <button
            type="button"
            onClick={() => onNavigate(index + 1)}
            disabled={index === total - 1}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 shadow-sm px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition disabled:cursor-not-allowed"
          >
            Adelante →
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="z-50 fixed inset-0 flex justify-center items-center bg-slate-900/50 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="bg-white shadow-xl p-6 rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title" className="font-bold text-slate-900 text-lg">
              ¿Finalizar con preguntas sin responder?
            </h3>
            <p className="mt-2 text-slate-600 text-sm">
              Tienes{" "}
              <strong className="text-slate-900">
                {unanswered.length} {unanswered.length === 1 ? "pregunta" : "preguntas"}
              </strong>{" "}
              sin responder (
              {unanswered
                .map((q) => questions.findIndex((x) => x.id === q.id) + 1)
                .join(", ")}
              ). Se contarán como incorrectas.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="bg-white hover:bg-slate-50 px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm"
              >
                Seguir respondiendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onFinish();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold text-white text-sm"
              >
                Finalizar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
