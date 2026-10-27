import { Brand } from "@/components/atoms/Brand";

export const PublicFooter = () => {
  return (
    <footer className="bg-white mt-auto border-slate-200 border-t shrink-0">
      <div className="flex items-center gap-3 mx-auto px-5 sm:px-8 py-3 max-w-7xl text-slate-500 text-sm">
        <Brand compact />
        <span aria-hidden="true">·</span>
        <span>Aprende. Practica. Comparte.</span>
      </div>
    </footer>
  );
};
