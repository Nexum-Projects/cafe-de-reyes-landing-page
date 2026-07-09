"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { MediaItem } from "@/app/actions/public-content/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type GalleryCarouselProps = {
  media: MediaItem[];
  emptyText: string;
};

export function GalleryCarousel({ media, emptyText }: GalleryCarouselProps) {
  const pages = useMemo(() => chunkItems(media, PAGE_SIZE), [media]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const activeImage = activeImageIndex === null ? null : media[activeImageIndex];
  const activeDisplayIndex = activeImageIndex ?? 0;
  const hasManyImages = media.length > 1;

  useEffect(() => {
    if (activeImageIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImageIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setActiveImageIndex((current) => {
          if (current === null) {
            return current;
          }

          return (current - 1 + media.length) % media.length;
        });
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((current) => {
          if (current === null) {
            return current;
          }

          return (current + 1) % media.length;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, media.length]);

  function goToPrevious() {
    if (pages.length === 0) {
      return;
    }

    setPageIndex((current) => (current - 1 + pages.length) % pages.length);
  }

  function goToNext() {
    if (pages.length === 0) {
      return;
    }

    setPageIndex((current) => (current + 1) % pages.length);
  }

  function goToPreviousImage() {
    setActiveImageIndex((current) => {
      if (current === null) {
        return current;
      }

      return (current - 1 + media.length) % media.length;
    });
  }

  function goToNextImage() {
    setActiveImageIndex((current) => {
      if (current === null) {
        return current;
      }

      return (current + 1) % media.length;
    });
  }

  if (!media.length) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="min-w-0">
      {hasManyPages ? (
        <div className="mb-5 flex items-center justify-between gap-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--gris-medio)]">
            {String(safePageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-3">
            <button
              aria-label="Página anterior de galería"
              className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-[var(--negro-profundo)]/24 text-[var(--gris-oscuro)] transition duration-300 hover:border-[var(--negro-profundo)] hover:bg-[var(--negro-profundo)]/5 hover:text-[var(--negro-profundo)]"
              onClick={goToPrevious}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Siguiente página de galería"
              className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-[var(--negro-profundo)]/24 text-[var(--gris-oscuro)] transition duration-300 hover:border-[var(--negro-profundo)] hover:bg-[var(--negro-profundo)]/5 hover:text-[var(--negro-profundo)]"
              onClick={goToNext}
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] lg:grid-cols-4"
            exit={{ opacity: 0, x: -26 }}
            initial={{ opacity: 0, x: 26 }}
            key={safePageIndex}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            {page.map((item, index) => (
              <GalleryImage
                alt="Café de Reyes"
                className={getGalleryItemClassName(index)}
                key={item.id}
                onClick={() => setActiveImageIndex(safePageIndex * PAGE_SIZE + index)}
                src={item.value}
              />
            ))}
            {Array.from({ length: PAGE_SIZE - page.length }).map((_, index) => {
              const galleryIndex = page.length + index;

              return (
                <div
                  aria-hidden
                  className={cn("pointer-events-none opacity-0", getGalleryItemClassName(galleryIndex))}
                  key={`gallery-placeholder-${safePageIndex}-${galleryIndex}`}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {hasManyPages ? (
        <div className="mt-6 flex items-center gap-2">
          {pages.map((_, index) => (
            <button
              aria-label={`Ir a página ${index + 1} de galería`}
              className={cn(
                "h-px transition-all",
                index === safePageIndex
                  ? "w-12 bg-[var(--negro-profundo)]"
                  : "w-7 bg-[var(--negro-profundo)]/20 hover:bg-[var(--negro-profundo)]/45",
              )}
              key={index}
              onClick={() => setPageIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[90] bg-[var(--negro-profundo)]/96 text-[var(--blanco-roto)]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada de galería"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-7">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--gris-suave)]/72">
                {String(activeDisplayIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
              </p>
            </div>

            <button
              aria-label="Cerrar galería"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center border border-[var(--blanco-roto)]/22 text-[var(--blanco-roto)] transition hover:border-[var(--blanco-roto)] hover:bg-[var(--blanco-roto)] hover:text-[var(--negro-profundo)] sm:right-8 sm:top-7"
              onClick={() => setActiveImageIndex(null)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            {hasManyImages ? (
              <>
                <button
                  aria-label="Imagen anterior"
                  className="absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--blanco-roto)]/22 text-[var(--blanco-roto)] transition hover:border-[var(--blanco-roto)] hover:bg-[var(--blanco-roto)] hover:text-[var(--negro-profundo)] sm:left-8"
                  onClick={goToPreviousImage}
                  type="button"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Siguiente imagen"
                  className="absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[var(--blanco-roto)]/22 text-[var(--blanco-roto)] transition hover:border-[var(--blanco-roto)] hover:bg-[var(--blanco-roto)] hover:text-[var(--negro-profundo)] sm:right-8"
                  onClick={goToNextImage}
                  type="button"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <div className="flex h-full items-center justify-center px-5 py-20 sm:px-20">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[76vh] w-full max-w-[1320px]"
                exit={{ opacity: 0, y: 10 }}
                initial={{ opacity: 0, y: 10 }}
                key={activeImage.id}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <Image
                  alt="Café de Reyes"
                  className="object-contain"
                  fill
                  priority
                  sizes="100vw"
                  src={activeImage.value}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function GalleryImage({
  src,
  alt,
  className,
  onClick,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label="Abrir imagen de galería"
      className={cn("group relative overflow-hidden bg-[var(--gris-suave)] text-left", className)}
      onClick={onClick}
      type="button"
    >
      {src ? (
        <Image
          alt={alt}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          src={src}
        />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center text-xs uppercase tracking-[0.2em] text-[var(--gris-medio)]">
          Sin imagen
        </div>
      )}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-y border-[var(--linea)] py-16">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[var(--azul-grisaceo)]">
        Galería en pausa
      </p>
      <p className="font-display mt-5 max-w-xl text-3xl leading-tight text-[var(--negro-profundo)]">
        {text}
      </p>
      <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--gris-oscuro)]/75">
        Cuando haya nuevas fotografías, este espacio mostrará la barra, el producto y la experiencia.
      </p>
      <div className="mt-8 h-px w-24 bg-[var(--negro-profundo)]/24" />
    </div>
  );
}

function getGalleryItemClassName(index: number) {
  return cn(
    index === 0 && "col-span-2 row-span-2",
    index === 3 && "lg:row-span-2",
    index === 5 && "lg:col-span-2",
  );
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
