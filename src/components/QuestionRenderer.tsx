"use client";

import React from "react";
import { cx } from "@/src/components/ui";
import type { QuestionDto } from "@/src/types/api";

export interface QuestionRendererProps {
  question: QuestionDto;
  value: string | undefined;
  onChange: (optionId: string) => void;
}

const MultipleChoiceQuestion: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => (
  <fieldset className="space-y-3">
    <legend className="sr-only">Opciones</legend>
    {question.options.map((opt) => {
      const selected = value === opt.id;
      return (
        <label
          key={opt.id}
          className={cx(
            "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition",
            selected
              ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          <input
            type="radio"
            name={`q-${question.id}`}
            value={opt.id}
            checked={selected}
            onChange={() => onChange(opt.id)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="flex justify-center items-center bg-slate-100 rounded-full w-7 h-7 font-bold text-slate-600 text-xs uppercase shrink-0">
            {opt.id}
          </span>
          <span className="text-slate-800 text-sm sm:text-base">{opt.text}</span>
        </label>
      );
    })}
  </fieldset>
);

const TrueFalseQuestion: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => (
  <div className="gap-4 grid grid-cols-2">
    {question.options.map((opt) => {
      const selected = value === opt.id;
      const isTrue = opt.id === "True";
      return (
        <button
          key={opt.id}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(opt.id)}
          className={cx(
            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-8 text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            selected && isTrue &&
              "border-emerald-500 bg-emerald-50 text-emerald-800 focus-visible:ring-emerald-500",
            selected && !isTrue &&
              "border-rose-500 bg-rose-50 text-rose-800 focus-visible:ring-rose-500",
            !selected &&
              "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-indigo-500",
          )}
        >
          <span className="text-3xl" aria-hidden="true">
            {isTrue ? "✓" : "✗"}
          </span>
          {opt.text}
        </button>
      );
    })}
  </div>
);

const FillInTheBlankQuestion: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const [before, after] = question.statement.split("___");
  const selectedText = question.options.find((o) => o.id === value)?.text;

  return (
    <div className="space-y-6">
      <p className="bg-slate-50 p-5 border border-slate-300 border-dashed rounded-xl text-slate-800 text-base sm:text-lg leading-relaxed">
        {before}
        <span
          className={cx(
            "mx-1 inline-block min-w-[9rem] rounded-md border-b-2 px-2 text-center font-semibold",
            selectedText
              ? "border-indigo-500 bg-indigo-50 text-indigo-800"
              : "border-slate-400 text-slate-400",
          )}
        >
          {selectedText ?? "________"}
        </span>
        {after}
      </p>

      <div>
        <label
          htmlFor={`select-q-${question.id}`}
          className="block mb-2 font-medium text-slate-700 text-sm"
        >
          Selecciona la opción que completa el enunciado:
        </label>
        <select
          id={`select-q-${question.id}`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white shadow-sm px-3 py-2.5 border border-slate-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-800 text-sm"
        >
          <option value="" disabled>
            — Elige una opción —
          </option>
          {question.options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.text}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.id)}
              className={cx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                selected
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = (props) => {
  switch (props.question.type) {
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    case "true_false":
      return <TrueFalseQuestion {...props} />;
    case "fill_in_the_blank":
      return <FillInTheBlankQuestion {...props} />;
    default:
      return null;
  }
};
