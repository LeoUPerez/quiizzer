"use client";

import Link from "next/link";
import { Brand } from "@/components/atoms/Brand";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAuthModal } from "@/hooks/useAuthModal";
import type { ProfileDto } from "@/types/api";

interface PublicHeaderProps {
  active?: "home" | "exams";
  profile?: ProfileDto | null;
  onSwitchUser?: () => void;
}

const navClass = (active: boolean) =>
  active
    ? "relative py-2 font-semibold text-[#6341DB] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#6341DB]"
    : "py-2 font-medium text-slate-600 transition-colors hover:text-[#6341DB]";

export const PublicHeader = ({ active = "home", profile = null, onSwitchUser }: PublicHeaderProps) => {
  const { openAuth } = useAuthModal();

  return (
    <header className="bg-white border-slate-200/80 border-b shrink-0">
      <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-6 gap-y-3 mx-auto px-5 sm:px-8 py-3 max-w-7xl">
        <Brand />
        <nav aria-label="Navegación principal" className="flex items-center gap-6 order-3 sm:order-none sm:text-[15px] text-sm">
          <Link href="/" aria-current={active === "home" ? "page" : undefined} className={navClass(active === "home")}>Inicio</Link>
          <Link href="/examenes" aria-current={active === "exams" ? "page" : undefined} className={navClass(active === "exams")}>Exámenes</Link>
        </nav>
        {profile && onSwitchUser ? (
          <ProfileAvatar profile={profile} onSwitchUser={onSwitchUser} />
        ) : (
          <button type="button" onClick={() => openAuth()} className="hover:bg-violet-50 px-4 py-2 border border-[#6341DB] rounded-xl focus:outline-none focus-visible:ring-[#6341DB] focus-visible:ring-2 focus-visible:ring-offset-2 font-semibold text-[#6341DB] text-sm transition-colors">Iniciar sesión</button>
        )}
      </div>
    </header>
  );
};
