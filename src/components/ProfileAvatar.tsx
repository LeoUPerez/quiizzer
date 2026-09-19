"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ProfileDto } from "@/src/types/api";

interface ProfileAvatarProps {
  profile: ProfileDto;
  onSwitchUser: () => void;
}

/** "Ana María Pérez" → "AP"; "ana@x.com" → "A" si no hay nombre. */
export const initialsOf = (fullName: string, email: string): string => {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[words.length - 1]?.[0] ?? ""}`.toUpperCase();
  }
  if (words.length === 1) return (words[0] ?? "").slice(0, 2).toUpperCase();
  return email.slice(0, 1).toUpperCase();
};

/** Círculo con iniciales; al pulsarlo muestra los datos y la opción de cambiar de usuario. */
export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ profile, onSwitchUser }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Cuenta de ${profile.fullName || profile.email}`}
        title={profile.fullName || profile.email}
        className="flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 w-11 h-11 font-bold text-white text-sm transition"
      >
        {initialsOf(profile.fullName, profile.email)}
      </button>

      {open && (
        <div
          role="menu"
          className="right-0 z-30 absolute bg-white shadow-lg mt-2 border border-slate-200 rounded-xl w-64 overflow-hidden"
        >
          <div className="px-4 py-3 border-slate-100 border-b">
            <p className="font-semibold text-slate-900 text-sm truncate">{profile.fullName}</p>
            <p className="text-slate-500 text-xs truncate">{profile.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSwitchUser();
            }}
            className="hover:bg-slate-50 px-4 py-2.5 w-full font-medium text-slate-700 text-sm text-left transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};
