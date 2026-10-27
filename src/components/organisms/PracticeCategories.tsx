"use client";

import { useEffect, useRef, useState } from "react";
import {
  CategoryCard,
  type PracticeCategory,
} from "@/components/molecules/CategoryCard";

const categories: PracticeCategory[] = [
  { name: "Bioquímica", href: "/examenes?subject=Bioquímica", imageSrc: "/images/biochemistry.png" },
  { name: "Programación", href: "/examenes?subject=Programación", imageSrc: "/images/programming.png" },
  { name: "Matemáticas", href: "/examenes?subject=Matemáticas", imageSrc: "/images/math.png" },
  { name: "Anatomía", href: "/examenes?subject=Anatomía", imageSrc: "/images/anatomy.png" },
  { name: "Física", href: "/examenes?subject=Física", imageSrc: "/images/physics.png" },
  { name: "Química", href: "/examenes?subject=Química", imageSrc: "/images/chemistry.png" },
  { name: "Biología", href: "/examenes?subject=Biología", imageSrc: "/images/biology.png" },
  { name: "Historia", href: "/examenes?subject=Historia", imageSrc: "/images/history.png" },
  { name: "Idiomas", href: "/examenes?subject=Idiomas", imageSrc: "/images/languages.png" },
];

const getCardsPerView = () => {
  if (window.matchMedia("(min-width: 1024px)").matches) return 5;
  if (window.matchMedia("(min-width: 640px)").matches) return 3;
  return 1.5;
};

export const PracticeCategories = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1.5);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const updateCardsPerView = () => setCardsPerView(getCardsPerView());

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxIndex = Math.max(Math.floor(categories.length - cardsPerView), 0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (maxIndex === 0 || isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 3500);

    return () => window.clearInterval(timer);
  }, [isPaused, maxIndex]);

  const showPrevious = () => {
    setActiveIndex((current) => (current <= 0 ? maxIndex : current - 1));
  };

  const showNext = () => {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX === null || endX === undefined) return;

    const distance = endX - startX;
    if (Math.abs(distance) < 40) return;

    if (distance > 0) showPrevious();
    else showNext();
  };

  const offset = `${(activeIndex * 100) / cardsPerView}%`;
  const leftMask = activeIndex > 0 ? "transparent 0, black 2.5rem," : "black 0,";
  const rightMask = activeIndex < maxIndex
    ? "black calc(100% - 2.5rem), transparent 100%"
    : "black 100%";
  const carouselMask = `linear-gradient(to right, ${leftMask} ${rightMask})`;

  return (
    <section className="bg-white" aria-labelledby="practice-categories-title">
      <div className="mx-auto px-5 sm:px-8 py-10 sm:py-12 lg:py-7 max-w-7xl">
        <div className="flex justify-between items-end gap-4">
          <h2
            id="practice-categories-title"
            className="font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight"
          >
            Descubre qué puedes practicar
          </h2>
        </div>

        <div
          className="relative mt-6 touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
            setIsPaused(true);
          }}
          onTouchEnd={(event) => {
            handleTouchEnd(event);
            setIsPaused(false);
          }}
        >
          <div
            className="-mx-2 overflow-hidden"
            style={{ maskImage: carouselMask, WebkitMaskImage: carouselMask }}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${offset})` }}
            >
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="px-2 basis-2/3 sm:basis-1/3 lg:basis-1/5 shrink-0"
                >
                  <CategoryCard {...category} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {maxIndex > 0 && (
          <div
            className="flex justify-between sm:justify-center items-center gap-4 mt-4"
            aria-label="Controles del carrusel"
          >
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Mostrar temas anteriores"
              className="sm:hidden place-items-center grid bg-violet-50 active:bg-violet-100 rounded-full focus:outline-none focus-visible:ring-[#6341DB] focus-visible:ring-2 w-11 h-11 font-bold text-[#6341DB] text-xl transition-colors"
            >
              ←
            </button>

            <div className="flex justify-center gap-2">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Mostrar grupo de temas ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={`rounded-full w-2.5 sm:w-2 h-2.5 sm:h-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6341DB] focus-visible:ring-offset-2 ${
                    activeIndex === index
                      ? "bg-[#6341DB]"
                      : "bg-violet-200 hover:bg-violet-300"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={showNext}
              aria-label="Mostrar más temas"
              className="sm:hidden place-items-center grid bg-violet-50 active:bg-violet-100 rounded-full focus:outline-none focus-visible:ring-[#6341DB] focus-visible:ring-2 w-11 h-11 font-bold text-[#6341DB] text-xl transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
