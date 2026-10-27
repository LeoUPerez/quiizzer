"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthModal, type AuthView } from "@/components/organisms/AuthModal";
import type { ProfileDto } from "@/types/api";

interface OpenAuthOptions {
  view?: AuthView;
  onAuthenticated?: (profile: ProfileDto) => void;
}

interface AuthModalContextValue {
  openAuth: (options?: OpenAuthOptions) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>("login");
  const triggerRef = useRef<HTMLElement | null>(null);
  const authenticatedCallback = useRef<OpenAuthOptions["onAuthenticated"]>(undefined);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const openAuth = useCallback((options?: OpenAuthOptions) => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    authenticatedCallback.current = options?.onAuthenticated;
    setInitialView(options?.view ?? "login");
    setOpen(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetPassword") === "1") openAuth({ view: "reset" });
  }, [openAuth]);

  const handleAuthenticated = useCallback((profile: ProfileDto) => {
    authenticatedCallback.current?.(profile);
    close();
  }, [close]);

  return (
    <AuthModalContext.Provider value={{ openAuth }}>
      {children}
      <AuthModal open={open} initialView={initialView} onClose={close} onAuthenticated={handleAuthenticated} />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal debe usarse dentro de AuthModalProvider");
  return context;
};
