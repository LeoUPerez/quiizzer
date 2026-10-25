"use client";

import Link from "next/link";
import { Brand } from "@/components/atoms/Brand";
import { useAuthModal } from "@/hooks/useAuthModal";

export const PublicHeader = () => {
  const { openAuth } = useAuthModal();

  return (
    <header className="bg-white border-slate-200/80 border-b">
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-6 gap-y-3 mx-auto px-5 sm:px-8 py-4 max-w-7xl">
        <Brand />
        <nav aria-label="Navegación principal" className="flex items-center gap-6 order-3 sm:order-none sm:text-[15px] text-sm">
          <Link href="/inicio" aria-current="page" className="after:bottom-0 after:left-0 after:absolute relative after:bg-[#6341DB] py-2 after:rounded-full after:w-full after:h-0.5 font-semibold text-[#6341DB]">Inicio</Link>
          <Link href="/" className="py-2 font-medium text-slate-600 hover:text-[#6341DB] transition-colors">Exámenes</Link>
        </nav>
        <button type="button" onClick={() => openAuth()} className="hover:bg-violet-50 px-4 py-2 border border-[#6341DB] rounded-xl focus:outline-none focus-visible:ring-[#6341DB] focus-visible:ring-2 focus-visible:ring-offset-2 font-semibold text-[#6341DB] text-sm transition-colors">Iniciar sesión</button>
      </div>
    </header>
  );
};
