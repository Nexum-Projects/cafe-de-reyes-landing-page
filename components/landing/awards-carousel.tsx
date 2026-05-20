"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { Award as AwardItem } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 3;

type AwardsCarouselProps = {
  awards: AwardItem[];
  emptyText: string;
};

export function AwardsCarousel({ awards, emptyText }: AwardsCarouselProps) {
  const pages = useMemo(() => chunkItems(awards, PAGE_SIZE), [awards]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;

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

  return (
    <div className="min-w-0">
      {hasManyPages ? (
        <div className="flex items-center justify-between gap-5 border-b border-[var(--blanco-roto)]/18 pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--gris-medio)]">
            {String(safePageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-2">
            <BrandButton aria-label="Pagina anterior de reconocimientos" onClick={goToPrevious} size="icon" type="button" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </BrandButton>
            <BrandButton aria-label="Siguiente pagina de reconocimientos" onClick={goToNext} size="icon" type="button" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
          </div>
        </div>
      ) : null}

      {awards.length ? (
        <>
          <div className="relative min-h-[33rem] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[var(--blanco-roto)]/16"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={safePageIndex}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                {page.map((award) => (
                  <AwardRow award={award} key={award.id} />
                ))}
                {Array.from({ length: PAGE_SIZE - page.length }).map((_, index) => (
                  <AwardPlaceholder key={`placeholder-${safePageIndex}-${index}`} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {hasManyPages ? (
            <div className="mt-6 flex items-center gap-2">
              {pages.map((_, index) => (
                <button
                  aria-label={`Ir a pagina ${index + 1} de reconocimientos`}
                  className={cn(
                    "h-px transition-all",
                    index === safePageIndex
                      ? "w-12 bg-[var(--blanco-roto)]"
                      : "w-7 bg-[var(--blanco-roto)]/25 hover:bg-[var(--blanco-roto)]/55",
                  )}
                  key={index}
                  onClick={() => setPageIndex(index)}
                  type="button"
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState text={emptyText} />
      )}
    </div>
  );
}

function AwardRow({ award }: { award: AwardItem }) {
  return (
    <article className="grid h-44 gap-5 py-7 sm:grid-cols-[4.5rem_9rem_1fr]">
      <div className="flex h-16 w-16 items-center justify-center border border-[var(--blanco-roto)]/20 text-[var(--azul-grisaceo)]">
        <Award className="h-7 w-7" />
      </div>
      <AwardImage className="aspect-[4/3]" src={award.imageUrl} alt={award.title} />
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--gris-suave)]/72">
          {award.sourceName ?? formatDate(award.awardedAt)}
        </p>
        <h3 className="font-display mt-2 text-4xl leading-none">{award.title}</h3>
        <RichText className="mt-4 max-w-2xl leading-7 text-[var(--gris-suave)]/82" html={award.description} />
        {award.sourceUrl ? (
          <a className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--azul-grisaceo)]" href={award.sourceUrl}>
            Fuente
          </a>
        ) : null}
      </div>
    </article>
  );
}

function AwardPlaceholder() {
  return <article aria-hidden className="h-44 py-7 opacity-0" />;
}

function AwardImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden bg-[var(--gris-oscuro)]", className)}>
      {src ? (
        <Image className="object-cover transition duration-700 group-hover:scale-[1.035]" src={src} alt={alt} fill sizes="9rem" />
      ) : (
        <div className="flex h-full min-h-28 items-center justify-center text-xs uppercase tracking-[0.2em] text-[var(--gris-suave)]">
          Sin imagen
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="border border-dashed border-[var(--blanco-roto)]/20 p-6 text-sm text-[var(--gris-suave)]">{text}</div>;
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
