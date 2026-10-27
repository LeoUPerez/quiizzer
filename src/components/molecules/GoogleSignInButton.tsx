import { GoogleLogo } from "@/components/atoms/GoogleLogo";

interface GoogleSignInButtonProps {
  busy: boolean;
  onClick: () => void;
}

export const GoogleSignInButton = ({ busy, onClick }: GoogleSignInButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="relative flex justify-center items-center gap-3 bg-white hover:bg-slate-50 disabled:opacity-60 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 w-full font-semibold text-slate-800 text-sm transition-colors"
    >
      <GoogleLogo />
      {busy ? "Conectando con Google…" : "Continuar con Google"}
    </button>
  );
};
