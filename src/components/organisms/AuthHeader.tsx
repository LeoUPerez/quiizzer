"use client";

import { useRouter } from "next/navigation";
import { Brand } from "@/components/atoms/Brand";
import { useAuthModal } from "@/hooks/useAuthModal";

export const AuthHeader = ({ next = "/" }: { next?: string }) => {
  const router = useRouter();
  const { openAuth } = useAuthModal();

  return (
    <header className="relative z-10 bg-white/95 border-slate-200/80 border-b backdrop-blur-sm">
      <div className="flex justify-between items-center gap-4 mx-auto px-5 sm:px-8 py-4 max-w-7xl">
        <Brand />
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:inline text-slate-600 text-sm">
            ¿Ya tienes cuenta?
          </span>
          <button
            type="button"
            onClick={() => openAuth({ onAuthenticated: () => router.push(next) })}
            className="hover:bg-violet-50 px-4 py-2 border border-[#6341DB] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 font-semibold text-[#6341DB] text-sm transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </header>
  );
};
