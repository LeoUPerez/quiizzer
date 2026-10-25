"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton } from "@/components/molecules/GoogleSignInButton";
import { useAuthModal } from "@/hooks/useAuthModal";
import { api, errorMessage } from "@/lib/api-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegistrationFormProps {
  next: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
}

export const RegistrationForm = ({ next }: RegistrationFormProps) => {
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busyAction, setBusyAction] = useState<"register" | "google" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const continueAfterAuthentication = () => {
    router.push(next);
    router.refresh();
  };

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: FieldErrors = {};
    if (name.trim().length < 2) errors.name = "Escribe tu nombre.";
    if (!EMAIL_RE.test(email.trim())) errors.email = "Escribe un correo válido.";
    if (password.length < 8) errors.password = "Usa al menos 8 caracteres.";
    if (!acceptedTerms) errors.terms = "Debes aceptar los términos y la política de privacidad.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBusyAction("register");
    setFormError(null);
    try {
      await api.register(name.trim(), email.trim().toLowerCase(), password);
      continueAfterAuthentication();
    } catch (caught) {
      setFormError(errorMessage(caught));
    } finally {
      setBusyAction(null);
    }
  };

  const registerWithGoogle = async () => {
    setBusyAction("google");
    setFormError(null);
    try {
      const { url } = await api.googleSignInUrl(next);
      window.location.assign(url);
    } catch (caught) {
      setFormError(errorMessage(caught));
      setBusyAction(null);
    }
  };

  return (
    <div>
      <GoogleSignInButton
        busy={busyAction === "google"}
        onClick={registerWithGoogle}
      />

      <div className="flex items-center gap-3 my-5 text-slate-400 text-xs">
        <span className="bg-slate-200 h-px flex-1" />
        <span>o regístrate con tu correo</span>
        <span className="bg-slate-200 h-px flex-1" />
      </div>

      <form onSubmit={register} noValidate className="space-y-4">
        <div>
          <label htmlFor="registration-name" className="block mb-1.5 font-medium text-slate-800 text-sm">
            Nombre
          </label>
          <input
            id="registration-name"
            autoComplete="name"
            placeholder="Tu nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "registration-name-error" : undefined}
            className="px-3.5 py-3 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full min-h-12 text-slate-900 text-sm"
          />
          {fieldErrors.name && <p id="registration-name-error" className="mt-1 text-rose-600 text-xs">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="registration-email" className="block mb-1.5 font-medium text-slate-800 text-sm">
            Correo electrónico
          </label>
          <input
            id="registration-email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "registration-email-error" : undefined}
            className="px-3.5 py-3 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full min-h-12 text-slate-900 text-sm"
          />
          {fieldErrors.email && <p id="registration-email-error" className="mt-1 text-rose-600 text-xs">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="registration-password" className="block mb-1.5 font-medium text-slate-800 text-sm">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="registration-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby="registration-password-help registration-password-error"
              className="px-3.5 py-3 pr-20 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6341DB]/20 w-full min-h-12 text-slate-900 text-sm"
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
          <p id="registration-password-help" className="mt-1.5 text-slate-500 text-xs">
            Mínimo 8 caracteres.
          </p>
          {fieldErrors.password && <p id="registration-password-error" className="mt-1 text-rose-600 text-xs">{fieldErrors.password}</p>}
        </div>

        <div>
          <label className="flex items-start gap-3 text-slate-600 text-sm">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              aria-invalid={Boolean(fieldErrors.terms)}
              aria-describedby={fieldErrors.terms ? "registration-terms-error" : undefined}
              className="mt-0.5 border-slate-300 rounded focus:ring-[#6341DB] w-4 h-4 accent-[#6341DB]"
            />
            <span>Acepto los Términos y la Política de privacidad.</span>
          </label>
          {fieldErrors.terms && <p id="registration-terms-error" className="mt-1 text-rose-600 text-xs">{fieldErrors.terms}</p>}
        </div>

        {formError && (
          <p role="alert" className="bg-rose-50 p-3 rounded-lg text-rose-700 text-sm">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={Boolean(busyAction)}
          className="flex justify-center items-center gap-2 bg-[#6341DB] hover:bg-[#5132c4] disabled:opacity-60 px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 w-full min-h-12 font-semibold text-white transition-colors"
        >
          <span>{busyAction === "register" ? "Creando cuenta…" : "Crear cuenta"}</span>
          {busyAction !== "register" && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="mt-5 text-slate-600 text-sm text-center">
        ¿Ya tienes una cuenta?{" "}
        <button
          type="button"
          onClick={() => openAuth({ onAuthenticated: continueAfterAuthentication })}
          className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] font-semibold text-[#6341DB] hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </div>
  );
};
