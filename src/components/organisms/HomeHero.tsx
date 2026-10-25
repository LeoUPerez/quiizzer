import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, LockIcon } from "@/components/atoms/icons";

export const HomeHero = () => {
  return (
    <section className="lg:flex lg:flex-1 bg-[#f7f5ff]">
      <div className="items-center gap-8 lg:gap-12 grid lg:grid-cols-2 mx-auto px-5 sm:px-8 py-12 sm:py-16 lg:py-8 lg:w-full max-w-7xl">
        <div className="max-w-xl">
          <p className="font-bold text-[#6341DB] text-xs tracking-[0.16em]">
            APRENDE EN COMUNIDAD
          </p>
          <h1 className="mt-5 font-bold text-slate-950 lg:text-[3.6rem] text-4xl sm:text-5xl leading-[1.08] tracking-tight">
            Lo que sabes crece cuando lo compartes.
          </h1>
          <p className="mt-6 max-w-lg text-slate-600 text-lg leading-8">
            Explora exámenes creados por otras personas y encuentra tu próximo reto.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4 mt-9">
            <Link href="/" className="inline-flex items-center gap-2 bg-[#6341DB] hover:bg-[#5132c4] shadow-sm px-5 py-3 rounded-xl focus:outline-none focus-visible:ring-[#6341DB] focus-visible:ring-2 focus-visible:ring-offset-2 font-semibold text-white transition-colors">
              Explorar exámenes <ArrowRightIcon />
            </Link>
            <Link href="/registro" className="font-semibold text-[#6341DB] hover:text-[#5132c4] hover:underline underline-offset-4">
              Crear una cuenta
            </Link>
          </div>
          <p className="flex items-center gap-2 mt-7 text-slate-500 text-sm">
            <LockIcon /> Puedes explorar libremente. Inicia sesión para tomar un examen.
          </p>
        </div>
        <div className="justify-self-center w-full max-w-xl">
          <Image src="/images/login_page_image.png" alt="Personas colaborando y aprendiendo juntas" width={1536} height={1024} priority className="mx-auto w-full h-auto lg:max-h-[42vh] object-contain" />
        </div>
      </div>
    </section>
  );
};
