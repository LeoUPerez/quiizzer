import Image from "next/image";
import Link from "next/link";

export interface PracticeCategory {
  name: string;
  href: string;
  imageSrc: string;
}

export const CategoryCard = ({ name, href, imageSrc }: PracticeCategory) => {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 sm:gap-3 bg-[#f7f5ff] hover:bg-[#f0edff] px-3 sm:px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 min-w-0 min-h-[68px] text-[#6341DB] transition-colors"
    >
      <span className="relative w-10 sm:w-11 h-10 sm:h-11 shrink-0 transition-transform group-hover:scale-105">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 639px) 40px, 44px"
          className="object-contain"
        />
      </span>
      <span className="min-w-0 font-semibold text-sm sm:text-base break-words">
        {name}
      </span>
    </Link>
  );
};
