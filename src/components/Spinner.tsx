"use client";

import React from "react";
import { cx } from "@/src/components/ui";

interface SpinnerProps {
  className?: string;
  label?: string;
}

/** Círculo giratorio accesible. */
export const Spinner: React.FC<SpinnerProps> = ({ className, label = "Cargando" }) => (
  <span
    role="status"
    aria-label={label}
    className={cx(
      "inline-block animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600",
      className ?? "h-8 w-8",
    )}
  />
);

/** Velo sobre toda la pantalla mientras se espera al servidor. */
export const LoadingOverlay: React.FC<{ label?: string }> = ({ label }) => (
  <div
    className="z-40 fixed inset-0 flex flex-col justify-center items-center gap-3 bg-slate-50/70 backdrop-blur-[1px]"
    aria-live="polite"
  >
    <Spinner className="w-10 h-10" label={label ?? "Cargando"} />
    {label && <p className="font-medium text-slate-600 text-sm">{label}</p>}
  </div>
);
