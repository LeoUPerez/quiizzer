"use client";

import { useState } from "react";

interface LoginFormProps {
  busy: boolean;
  error: string | null;
  onForgotPassword: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = ({ busy, error, onForgotPassword, onSubmit }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!EMAIL_RE.test(email.trim())) nextErrors.email = "Escribe un correo válido.";
    if (!password) nextErrors.password = "Escribe tu contraseña.";
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(email.trim().toLowerCase(), password);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block mb-1.5 font-medium text-slate-800 text-sm">
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          className="px-3.5 py-3 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full text-slate-900 text-sm"
        />
        {fieldErrors.email && <p id="login-email-error" className="mt-1 text-rose-600 text-xs">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className="block mb-1.5 font-medium text-slate-800 text-sm">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
            className="px-3.5 py-3 pr-20 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full text-slate-900 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="top-1/2 right-3 absolute -translate-y-1/2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] font-semibold text-[#6341DB] text-xs"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {fieldErrors.password && <p id="login-password-error" className="mt-1 text-rose-600 text-xs">{fieldErrors.password}</p>}
      </div>

      <div className="text-right">
        <button type="button" onClick={onForgotPassword} className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] font-medium text-[#6341DB] text-sm hover:underline">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <p role="alert" className="bg-rose-50 p-3 rounded-lg text-rose-700 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="flex justify-center items-center gap-2 bg-[#6341DB] hover:bg-[#5132c4] disabled:opacity-60 px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 w-full font-semibold text-white transition-colors"
      >
        <span>{busy ? "Iniciando sesión…" : "Iniciar sesión"}</span>
        {!busy && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
};
