"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { GlobeIcon } from "@/components/atoms/icons";
import { PublicFooter } from "@/components/organisms/PublicFooter";
import { PublicHeader } from "@/components/organisms/PublicHeader";
import type { ProfileDto, QuestionType, QuizSummaryDto } from "@/types/api";

interface DashboardProps {
  quizzes: QuizSummaryDto[] | null;
  profile: ProfileDto | null;
  busy: boolean;
  subjectFilter?: string | null;
  topicFilter?: string | null;
  onStart: (quiz: QuizSummaryDto) => void;
  onReview: (quiz: QuizSummaryDto) => void;
  onRetake: (quiz: QuizSummaryDto) => void;
  onSwitchUser: () => void;
  onSignIn: () => void;
}

type QuestionRange = "1-10" | "11-20" | "21-30" | "31+";
type OpenFilter = "category" | "questions" | "types" | null;

const questionRanges: Array<{ id: QuestionRange; label: string; matches: (count: number) => boolean }> = [
  { id: "1-10", label: "1–10 preguntas", matches: (count) => count >= 1 && count <= 10 },
  { id: "11-20", label: "11–20 preguntas", matches: (count) => count >= 11 && count <= 20 },
  { id: "21-30", label: "21–30 preguntas", matches: (count) => count >= 21 && count <= 30 },
  { id: "31+", label: "31 o más preguntas", matches: (count) => count >= 31 },
];

const questionTypeOptions: Array<{ id: QuestionType; label: string }> = [
  { id: "multiple_choice", label: "Selección múltiple" },
  { id: "true_false", label: "Verdadero o falso" },
  { id: "fill_in_the_blank", label: "Completar espacios" },
];

const categoryImages: Record<string, string> = {
  Bioquímica: "/images/biochemistry.png",
  Programación: "/images/programming.png",
  Matemáticas: "/images/math.png",
  Anatomía: "/images/anatomy.png",
  Física: "/images/physics.png",
  Química: "/images/chemistry.png",
  Biología: "/images/biology.png",
  Historia: "/images/history.png",
  Idiomas: "/images/languages.png",
};

const selectionLabel = (values: string[]) => {
  const first = values[0];
  if (!first) return null;
  if (values.length === 1) return first;
  return `${first} y ${values.length - 1} más`;
};

export const Dashboard = ({ quizzes, profile, busy, subjectFilter, topicFilter, onStart, onReview, onRetake, onSwitchUser }: DashboardProps) => {
  const [search, setSearch] = useState(topicFilter ?? "");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase());
  const [categories, setCategories] = useState<string[]>(subjectFilter ? [subjectFilter] : []);
  const [draftCategories, setDraftCategories] = useState(categories);
  const [ranges, setRanges] = useState<QuestionRange[]>([]);
  const [draftRanges, setDraftRanges] = useState<QuestionRange[]>([]);
  const [types, setTypes] = useState<QuestionType[]>([]);
  const [draftTypes, setDraftTypes] = useState<QuestionType[]>([]);
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSummaryDto | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const availableCategories = useMemo(
    () => [...new Set((quizzes ?? []).map((quiz) => quiz.subject))].sort((a, b) => a.localeCompare(b, "es")),
    [quizzes],
  );

  useEffect(() => {
    if (!openFilter) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && filtersRef.current?.contains(event.target as Node)) return;
      setOpenFilter(null);
      setDraftCategories(categories);
      setDraftRanges(ranges);
      setDraftTypes(types);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [categories, openFilter, ranges, types]);

  const filtered = useMemo(() => {
    const result = (quizzes ?? []).filter((quiz) => {
      const haystack = `${quiz.title} ${quiz.topic} ${quiz.authorName ?? ""}`.toLocaleLowerCase();
      const categoryMatch = categories.length === 0 || categories.includes(quiz.subject);
      const rangeMatch = ranges.length === 0 || questionRanges.some((range) => ranges.includes(range.id) && range.matches(quiz.questionCount));
      const typeMatch = types.length === 0 || types.some((type) => quiz.questionTypes.includes(type));
      return (!deferredSearch || haystack.includes(deferredSearch)) && categoryMatch && rangeMatch && typeMatch;
    });
    return result.sort((a, b) => {
      const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === "recent" ? difference : -difference;
    });
  }, [categories, deferredSearch, quizzes, ranges, sort, types]);

  const hasFilters = search.length > 0 || categories.length > 0 || ranges.length > 0 || types.length > 0 || sort !== "recent";
  const clearAll = () => {
    setSearch("");
    setCategories([]);
    setDraftCategories([]);
    setRanges([]);
    setDraftRanges([]);
    setTypes([]);
    setDraftTypes([]);
    setSort("recent");
    setOpenFilter(null);
  };

  return (
    <div className="flex flex-col bg-[#f8f7ff] h-dvh overflow-hidden text-slate-900">
      <PublicHeader active="exams" profile={profile} onSwitchUser={onSwitchUser} />
      <main className="flex flex-col flex-1 mx-auto px-4 sm:px-6 py-5 sm:py-6 w-full max-w-7xl min-h-0 overflow-hidden">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="font-bold text-slate-950 text-4xl sm:text-5xl tracking-tight">Explora exámenes</h1>
            <p className="mt-2 text-slate-600 text-base sm:text-lg">Encuentra exámenes públicos creados por la comunidad.</p>
          </div>
        </div>

        <div className="relative mt-5">
          <span aria-hidden="true" className="top-1/2 left-4 absolute text-slate-500 text-xl -translate-y-1/2">⌕</span>
          <label htmlFor="exam-search" className="sr-only">Buscar exámenes</label>
          <input id="exam-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título, tema o autor..." className="bg-white py-3 pr-12 pl-12 border border-slate-300 focus:border-[#6341DB] rounded-xl focus:outline-none focus:ring-[#6341DB]/20 focus:ring-2 w-full min-h-13 text-sm" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda" className="top-1/2 right-4 absolute rounded focus-visible:ring-[#6341DB] focus-visible:ring-2 text-slate-500 -translate-y-1/2">×</button>}
        </div>

        <div ref={filtersRef} className="relative gap-3 grid lg:grid-cols-[minmax(0,1fr)_auto] mt-4 min-w-0">
          <div className="flex flex-wrap items-start gap-2 min-w-0">
            <FilterChip label="Categoría" summary={selectionLabel(categories)} open={openFilter === "category"} onOpen={() => { setDraftCategories(categories); setOpenFilter(openFilter === "category" ? null : "category"); }} onClear={() => { setCategories([]); setDraftCategories([]); }}>
              <FilterPanel title="Filtrar por categoría" align="left" onApply={() => { setCategories(draftCategories); setOpenFilter(null); }}>
                {availableCategories.map((category) => <FilterCheckbox key={category} label={category} checked={draftCategories.includes(category)} onChange={() => setDraftCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} />)}
              </FilterPanel>
            </FilterChip>
            <FilterChip label="Preguntas" summary={selectionLabel(ranges.map((range) => questionRanges.find((item) => item.id === range)?.label ?? range))} open={openFilter === "questions"} onOpen={() => { setDraftRanges(ranges); setOpenFilter(openFilter === "questions" ? null : "questions"); }} onClear={() => { setRanges([]); setDraftRanges([]); }}>
              <FilterPanel title="Filtrar por preguntas" align="center" onApply={() => { setRanges(draftRanges); setOpenFilter(null); }}>
                {questionRanges.map((range) => <FilterCheckbox key={range.id} label={range.label} checked={draftRanges.includes(range.id)} onChange={() => setDraftRanges((current) => current.includes(range.id) ? current.filter((item) => item !== range.id) : [...current, range.id])} />)}
              </FilterPanel>
            </FilterChip>
            <FilterChip label="Tipo" summary={selectionLabel(types.map((type) => questionTypeOptions.find((item) => item.id === type)?.label ?? type))} open={openFilter === "types"} onOpen={() => { setDraftTypes(types); setOpenFilter(openFilter === "types" ? null : "types"); }} onClear={() => { setTypes([]); setDraftTypes([]); }}>
              <FilterPanel title="Filtrar por tipo" align="right" onApply={() => { setTypes(draftTypes); setOpenFilter(null); }}>
                {questionTypeOptions.map((type) => <FilterCheckbox key={type.id} label={type.label} checked={draftTypes.includes(type.id)} onChange={() => setDraftTypes((current) => current.includes(type.id) ? current.filter((item) => item !== type.id) : [...current, type.id])} />)}
              </FilterPanel>
            </FilterChip>
            {hasFilters && <button type="button" onClick={clearAll} className="px-2 min-h-9 font-semibold text-[#6341DB] text-xs sm:text-sm hover:underline">Limpiar filtros</button>}
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <section className="flex flex-col flex-1 mt-5 min-h-0" aria-label="Resultados de exámenes">
          <p className="mb-3 text-slate-600 text-sm">{filtered.length} {filtered.length === 1 ? "examen disponible" : "exámenes disponibles"}</p>
          <div className="flex-1 pr-1 pb-4 min-h-0 overflow-y-auto overscroll-contain">
            {!quizzes ? <ExamSkeletons /> : filtered.length > 0 ? (
              <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                {filtered.map((quiz) => <PublicExamCard key={quiz.id} quiz={quiz} onDetails={() => setSelectedQuiz(quiz)} />)}
              </div>
            ) : (
              <div className="bg-white p-10 border border-slate-200 border-dashed rounded-2xl text-center"><p className="font-semibold text-slate-800">{quizzes.length === 0 ? "Todavía no hay exámenes publicados." : "No encontramos exámenes con esos filtros."}</p>{hasFilters && <button type="button" onClick={clearAll} className="mt-3 font-semibold text-[#6341DB] hover:underline">Limpiar filtros</button>}</div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
      {selectedQuiz && (
        <ExamDetails
          quiz={selectedQuiz}
          busy={busy}
          onClose={() => setSelectedQuiz(null)}
          onTake={() => { setSelectedQuiz(null); onStart(selectedQuiz); }}
          onReview={() => { setSelectedQuiz(null); onReview(selectedQuiz); }}
          onRetake={() => { setSelectedQuiz(null); onRetake(selectedQuiz); }}
        />
      )}
    </div>
  );
};

const FilterChip = ({ label, summary, open, onOpen, onClear, children }: { label: string; summary: string | null; open: boolean; onOpen: () => void; onClear: () => void; children: React.ReactNode }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);
  return <div className="relative min-w-0 max-w-full"><div className={`flex items-center border rounded-full max-w-full min-h-9 min-w-0 ${summary ? "border-[#6341DB] bg-violet-50" : "border-slate-300 bg-white"}`}>{summary && <button type="button" onClick={onClear} aria-label={`Limpiar filtro ${label}`} className="pr-1 pl-3 min-h-9 text-[#6341DB] shrink-0">×</button>}<button ref={triggerRef} type="button" onClick={onOpen} aria-expanded={open} className="flex items-center px-3 min-w-0 max-w-[min(17rem,calc(100vw-2rem))] min-h-9 font-semibold text-[#6341DB] text-xs sm:text-sm"><span className="truncate">{label}{summary ? ` | ${summary}` : "  +"}</span></button></div>{open && children}</div>;
};

const panelAlignment = {
  left: "left-0",
  center: "left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0",
  right: "right-0 sm:right-auto sm:left-0",
};

const FilterPanel = ({ title, align, onApply, children }: { title: string; align: keyof typeof panelAlignment; onApply: () => void; children: React.ReactNode }) => (
  <div
    role="group"
    aria-label={title}
    className={`top-full z-50 absolute bg-white shadow-xl mt-2 p-3 sm:p-4 border border-slate-200 rounded-xl w-[min(15rem,calc(100vw-2rem))] sm:w-72 ${panelAlignment[align]}`}
  >
    <h2 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h2>
    <div className="space-y-1 my-2 sm:my-3 max-h-[min(12rem,45vh)] overflow-y-auto">
      {children}
    </div>
    <button
      type="button"
      onClick={onApply}
      className="bg-[#6341DB] hover:bg-[#5132c4] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg w-full font-semibold text-white text-sm"
    >
      Aplicar filtros
    </button>
  </div>
);

const FilterCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => <label className="flex items-center gap-2.5 min-h-8 text-slate-700 text-xs sm:text-sm"><input type="checkbox" checked={checked} onChange={onChange} className="rounded w-4 h-4 sm:w-5 sm:h-5 accent-[#6341DB] shrink-0" />{label}</label>;

const sortOptions = [
  { value: "recent" as const, label: "Más recientes" },
  { value: "oldest" as const, label: "Más antiguos" },
];

const SortDropdown = ({ value, onChange }: { value: "recent" | "oldest"; onChange: (value: "recent" | "oldest") => void }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = sortOptions.find((option) => option.value === value) ?? sortOptions[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="flex lg:justify-self-end items-center gap-2 text-slate-600 text-xs sm:text-sm">
      <span className="font-medium whitespace-nowrap">Ordenar por:</span>
      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex justify-between items-center gap-3 bg-white hover:bg-violet-50 shadow-sm px-4 py-2 border border-slate-300 hover:border-violet-300 focus:border-[#6341DB] rounded-full focus:outline-none focus:ring-[#6341DB]/20 focus:ring-2 min-w-36 min-h-9 font-semibold text-slate-900 transition-colors"
        >
          <span>{selected?.label}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`w-4 h-4 text-[#6341DB] transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <div role="listbox" aria-label="Ordenar exámenes" className="top-full right-0 z-40 absolute bg-white shadow-xl mt-2 p-1.5 border border-slate-200 rounded-xl min-w-44 overflow-hidden">
            {sortOptions.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg w-full font-medium text-sm text-left transition-colors ${active ? "bg-violet-100 text-[#6341DB]" : "text-slate-700 hover:bg-violet-50"}`}
                >
                  <span aria-hidden="true" className="w-4 text-[#6341DB]">{active ? "✓" : ""}</span>
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const PublicExamCard = ({ quiz, onDetails }: { quiz: QuizSummaryDto; onDetails: () => void }) => {
  const image = categoryImages[quiz.subject];
  const initials = quiz.authorName?.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <article className="flex flex-col bg-white p-5 border border-slate-200 rounded-xl min-w-0 min-h-64 overflow-hidden">
      <div className="flex justify-between items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {image && (
            <Image
              src={image}
              alt=""
              width={22}
              height={22}
              className="shrink-0 object-contain"
            />
          )}
          <span className="inline-flex bg-violet-100 px-3 py-1 rounded-full max-w-full font-semibold text-[#6341DB] text-xs truncate">
            {quiz.subject}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 text-sm shrink-0">
          <GlobeIcon className="w-5 h-5" />
          Público
        </span>
      </div>
      <h2 title={quiz.title} className="mt-3 font-bold text-slate-950 text-xl break-words line-clamp-2">
        {quiz.title}
      </h2>
      <p className="mt-1 text-slate-600 text-sm break-words line-clamp-2">
        {quiz.topic}
      </p>
      <div className="flex justify-between items-center gap-3 mt-auto pt-5 min-w-0 text-slate-600 text-sm">
        <span className="min-w-0 truncate">
          {quiz.authorName ? (
            <>
              <span className="inline-grid place-items-center bg-violet-100 mr-2 rounded-full w-9 h-9 font-semibold text-[#6341DB]">
                {initials}
              </span>
              {quiz.authorName}
            </>
          ) : null}
        </span>
        <span className="shrink-0">{quiz.questionCount} preguntas</span>
      </div>
      <button
        type="button"
        onClick={onDetails}
        className="hover:bg-violet-50 mt-4 border border-[#6341DB] rounded-lg focus:outline-none focus-visible:ring-[#6341DB] focus-visible:ring-2 w-full min-h-10 font-semibold text-[#6341DB] text-sm"
      >
        Ver detalles →
      </button>
    </article>
  );
};

const ExamSkeletons = () => <div aria-label="Cargando exámenes" className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="bg-white p-5 border border-slate-200 rounded-xl h-64 animate-pulse"><div className="bg-violet-100 rounded-full w-24 h-7" /><div className="bg-slate-200 mt-5 rounded w-4/5 h-6" /><div className="bg-slate-100 mt-3 rounded w-full h-4" /><div className="bg-slate-100 mt-2 rounded w-2/3 h-4" /></div>)}</div>;

const ExamDetails = ({ quiz, busy, onClose, onTake, onReview, onRetake }: { quiz: QuizSummaryDto; busy: boolean; onClose: () => void; onTake: () => void; onReview: () => void; onRetake: () => void }) => {
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [onClose]);
  const completed = Boolean(quiz.latestAttempt?.completedAt);
  return <div className="z-40 fixed inset-0 flex justify-center items-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="exam-detail-title" className="relative bg-white shadow-2xl p-6 sm:p-8 rounded-2xl w-full max-w-lg"><button type="button" onClick={onClose} aria-label="Cerrar detalles" className="top-4 right-4 absolute text-slate-500 text-2xl">×</button><span className="inline-flex bg-violet-100 px-3 py-1 rounded-full font-semibold text-[#6341DB] text-xs">{quiz.subject}</span><h2 id="exam-detail-title" className="mt-4 pr-8 font-bold text-slate-950 text-2xl">{quiz.title}</h2><p className="mt-2 text-slate-600">{quiz.topic}</p><p className="mt-5 text-slate-600 text-sm">{quiz.questionCount} preguntas{quiz.authorName ? ` · Creado por ${quiz.authorName}` : ""}</p>{completed ? <div className="flex gap-3 mt-6"><button type="button" disabled={busy} onClick={onReview} className="flex-1 border border-[#6341DB] rounded-xl font-semibold text-[#6341DB]">Revisar</button><button type="button" disabled={busy} onClick={onRetake} className="flex-1 bg-[#6341DB] px-4 py-3 rounded-xl font-semibold text-white">Repetir</button></div> : <button type="button" disabled={busy || quiz.questionCount === 0} onClick={onTake} className="bg-[#6341DB] hover:bg-[#5132c4] disabled:opacity-50 mt-6 px-4 py-3 rounded-xl w-full font-semibold text-white">{quiz.latestAttempt ? "Continuar examen →" : "Tomar examen →"}</button>}</div></div>;
};
