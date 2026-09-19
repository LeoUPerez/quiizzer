"use client";

import React, { useState } from "react";

interface RegisterModalProps {
  /** Examen que se abrirá al terminar; sin él, es un inicio de sesión simple. */
  quizTitle: string | null;
  busy: boolean;
  error: string | null;
  onSubmit: (fullName: string, email: string) => void;
  onCancel: () => void;
}

/** Pide nombre y correo la primera vez que el alumno intenta tomar un examen. */
export const RegisterModal: React.FC<RegisterModalProps> = ({
  quizTitle,
  busy,
  error,
  onSubmit,
  onCancel,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      className="z-50 fixed inset-0 flex justify-center items-center bg-slate-900/50 p-4"
      onClick={onCancel}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(fullName, email);
        }}
        onClick={(e) => e.stopPropagation()}
        className="space-y-4 bg-white shadow-xl p-6 rounded-2xl w-full max-w-md"
      >
        <div>
          <h3 id="register-title" className="font-bold text-slate-900 text-lg">
            {quizTitle ? "Antes de empezar, regístrate" : "Iniciar sesión"}
          </h3>
          <p className="mt-1 text-slate-600 text-sm">
            {quizTitle ? (
              <>
                Vas a tomar <strong className="text-slate-900">{quizTitle}</strong>.{" "}
              </>
            ) : null}
            Usamos tu nombre y correo para guardar tu progreso y tus resultados. Si ya te
            registraste antes, escribe el mismo correo para recuperarlos.
          </p>
        </div>

        <div>
          <label htmlFor="register-name" className="block mb-1 font-medium text-slate-700 text-sm">
            Nombre completo
          </label>
          <input
            id="register-name"
            type="text"
            required
            autoFocus
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-sm"
          />
        </div>

        <div>
          <label htmlFor="register-email" className="block mb-1 font-medium text-slate-700 text-sm">
            Correo electrónico
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-sm"
          />
        </div>

        {error && (
          <p role="alert" className="bg-rose-50 p-3 rounded-lg text-rose-800 text-sm">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="bg-white hover:bg-slate-50 px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold text-white text-sm"
          >
            {busy ? "Guardando…" : quizTitle ? "Registrarme y empezar" : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
};
