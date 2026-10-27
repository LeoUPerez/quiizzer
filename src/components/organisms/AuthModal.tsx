"use client";

import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/atoms/Brand";
import { GoogleSignInButton } from "@/components/molecules/GoogleSignInButton";
import { LoginForm } from "@/components/molecules/LoginForm";
import { api, errorMessage } from "@/lib/api-client";
import type { ProfileDto } from "@/types/api";

export type AuthView = "login" | "recover" | "reset";

interface AuthModalProps {
  open: boolean;
  initialView: AuthView;
  onClose: () => void;
  onAuthenticated: (profile: ProfileDto) => void;
}

const focusableSelector = "button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";

export const AuthModal = ({ open, initialView, onClose, onAuthenticated }: AuthModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<AuthView>(initialView);
  const [busyAction, setBusyAction] = useState<"form" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!open) return;
    setView(initialView);
    setError(null);
    setNotice(null);
  }, [initialView, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const authenticate = async (email: string, password: string) => {
    setBusyAction("form");
    setError(null);
    try {
      const { profile } = await api.login(email, password);
      onAuthenticated(profile);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  };

  const signInWithGoogle = async () => {
    setBusyAction("google");
    setError(null);
    try {
      const next = `${window.location.pathname}${window.location.search}`;
      const { url } = await api.googleSignInUrl(next);
      window.location.assign(url);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusyAction(null);
    }
  };

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("form");
    setError(null);
    try {
      await api.updatePassword(newPassword);
      setNotice("Tu contraseña fue actualizada. Ya puedes iniciar sesión.");
      setView("login");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  };

  const recover = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("form");
    setError(null);
    setNotice(null);
    try {
      await api.recoverPassword(recoveryEmail);
      setNotice("Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  };

  const changeView = (nextView: AuthView) => {
    setView(nextView);
    setError(null);
    setNotice(null);
  };

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busyAction) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
        className="relative bg-white shadow-2xl p-6 sm:p-8 rounded-[20px] w-full max-w-[440px] max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={Boolean(busyAction)}
          aria-label="Cerrar inicio de sesión"
          className="top-4 right-4 absolute grid place-items-center hover:bg-slate-100 disabled:opacity-50 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] w-9 h-9 text-slate-500 text-2xl"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="flex justify-center"><Brand linked={false} /></div>
        <div className="mt-6 text-center">
          <h2 id="auth-modal-title" className="font-bold text-slate-950 text-2xl tracking-tight">
            {view === "login" ? "Inicia sesión en Quiizzer" : view === "recover" ? "Recupera tu contraseña" : "Crea una nueva contraseña"}
          </h2>
          <p id="auth-modal-description" className="mt-2 text-slate-600 text-sm">
            {view === "login" ? "Continúa practicando y guarda tus resultados." : view === "recover" ? "Te enviaremos instrucciones a tu correo." : "Usa al menos 8 caracteres."}
          </p>
        </div>

        {view === "login" && (
          <div className="mt-6">
            {notice && (
              <p role="status" className="mb-4 bg-emerald-50 p-3 rounded-lg text-emerald-800 text-sm">
                {notice}
              </p>
            )}
            <GoogleSignInButton busy={busyAction === "google"} onClick={signInWithGoogle} />
            <div className="flex items-center gap-3 my-5 text-slate-400 text-xs">
              <span className="bg-slate-200 h-px flex-1" />
              <span>o continúa con tu correo</span>
              <span className="bg-slate-200 h-px flex-1" />
            </div>
            <LoginForm busy={busyAction === "form"} error={error} onForgotPassword={() => changeView("recover")} onSubmit={authenticate} />
            {busyAction === "google" && error && <p role="alert" className="mt-3 bg-rose-50 p-3 rounded-lg text-rose-700 text-sm">{error}</p>}
            <div className="mt-6 pt-5 border-slate-200 border-t text-center text-slate-600 text-sm">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  const next = `${window.location.pathname}${window.location.search}`;
                  window.location.assign(`/registro?next=${encodeURIComponent(next)}`);
                }}
                className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] font-semibold text-[#6341DB] hover:underline"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        )}

        {view === "recover" && (
          <form onSubmit={recover} className="space-y-4 mt-6">
            <div><label htmlFor="recovery-email" className="block mb-1.5 font-medium text-slate-800 text-sm">Correo electrónico</label><input id="recovery-email" required type="email" autoComplete="email" placeholder="tu@correo.com" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} className="px-3.5 py-3 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full text-sm" /></div>
            {error && <p role="alert" className="bg-rose-50 p-3 rounded-lg text-rose-700 text-sm">{error}</p>}
            {notice && <p role="status" className="bg-emerald-50 p-3 rounded-lg text-emerald-800 text-sm">{notice}</p>}
            <button type="submit" disabled={busyAction === "form"} className="bg-[#6341DB] hover:bg-[#5132c4] disabled:opacity-60 px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 w-full font-semibold text-white">{busyAction === "form" ? "Enviando…" : "Enviar instrucciones"}</button>
            <button type="button" onClick={() => changeView("login")} className="w-full font-semibold text-[#6341DB] text-sm hover:underline">Volver a iniciar sesión</button>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={updatePassword} className="space-y-4 mt-6">
            <div><label htmlFor="new-password" className="block mb-1.5 font-medium text-slate-800 text-sm">Nueva contraseña</label><input id="new-password" required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="px-3.5 py-3 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full text-sm" /></div>
            {error && <p role="alert" className="bg-rose-50 p-3 rounded-lg text-rose-700 text-sm">{error}</p>}
            <button type="submit" disabled={busyAction === "form"} className="bg-[#6341DB] hover:bg-[#5132c4] disabled:opacity-60 px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 w-full font-semibold text-white">{busyAction === "form" ? "Actualizando…" : "Actualizar contraseña"}</button>
          </form>
        )}
      </div>
    </div>
  );
};
