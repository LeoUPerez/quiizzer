import Image from "next/image";
import Link from "next/link";

interface BrandProps {
  compact?: boolean;
  linked?: boolean;
}

export const Brand = ({ compact = false, linked = true }: BrandProps) => {
  const content = (
    <>
      <span
        className={`relative shrink-0 overflow-hidden ${
          compact ? "w-8 h-8" : "w-9 h-9"
        }`}
      >
        <Image
          src="/images/app_icon.png"
          alt=""
          fill
          sizes={compact ? "32px" : "36px"}
          className="object-contain"
          priority={!compact}
        />
      </span>
      <span className={compact ? "font-semibold text-slate-900" : "font-bold text-xl tracking-tight"}>
        Quiizzer
      </span>
    </>
  );

  if (!linked) {
    return <div className="flex items-center gap-2.5 text-slate-950">{content}</div>;
  }

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-slate-950"
      aria-label="Quiizzer, inicio"
    >
      {content}
    </Link>
  );
};
