import Image from "next/image";
import Link from "next/link";
import { AuthHeader } from "@/components/organisms/AuthHeader";
import { RegistrationForm } from "@/components/organisms/RegistrationForm";

export const RegisterPage = ({ next }: { next: string }) => {
  return (
    <div className="flex flex-col bg-[#f3f0ff] min-h-dvh text-slate-900">
      <AuthHeader next={next} />

      <div className="relative flex flex-col flex-1 isolate overflow-hidden">
        <Image
          src="/images/register_page_image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-35 sm:opacity-65 lg:opacity-100"
        />

        <main className="flex flex-1 justify-center items-start lg:items-center px-4 sm:px-6 py-7 sm:py-10">
          <section
            aria-labelledby="register-page-title"
            className="bg-white shadow-[0_20px_60px_rgba(70,48,150,0.14)] p-5 sm:p-8 lg:p-10 border border-white/70 rounded-[20px] w-full max-w-[480px]"
          >
            <div className="mb-6 text-center">
              <p className="font-bold text-[#6341DB] text-[11px] sm:text-xs tracking-[0.14em]">
                TU PRÓXIMO RETO EMPIEZA AQUÍ
              </p>
              <h1
                id="register-page-title"
                className="mt-3 font-bold text-slate-950 text-3xl sm:text-4xl tracking-tight"
              >
                Crea tu cuenta
              </h1>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                Practica, comparte y aprende en comunidad.
              </p>
            </div>

            <RegistrationForm next={next} />
          </section>
        </main>

        <footer className="relative z-10 px-5 pb-6 text-center">
          <Link
            href="/"
            className="inline-flex rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] font-semibold text-[#6341DB] text-sm hover:underline"
          >
            ← Volver al inicio
          </Link>
          <p className="mt-2 text-slate-500 text-xs">
            Quiizzer · Aprende. Practica. Comparte.
          </p>
        </footer>
      </div>
    </div>
  );
};
