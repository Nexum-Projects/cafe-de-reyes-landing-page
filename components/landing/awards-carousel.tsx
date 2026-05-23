"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { Award as AwardItem } from "@/app/actions/public-content/types";
import { RichText } from "@/components/landing/rich-text";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 2;

type AwardsCarouselProps = {
  awards: AwardItem[];
  emptyText: string;
};

export function AwardsCarousel({ awards, emptyText }: AwardsCarouselProps) {
  const timelineAwards = useMemo(() => sortAwardsByDate(awards), [awards]);
  const pages = useMemo(() => chunkItems(timelineAwards, PAGE_SIZE), [timelineAwards]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;

  if (!timelineAwards.length) {
    return <EmptyState text={emptyText} />;
  }

  function goToPrevious() {
    if (!hasManyPages) {
      return;
    }

    setPageIndex((current) => (current - 1 + pages.length) % pages.length);
  }

  function goToNext() {
    if (!hasManyPages) {
      return;
    }

    setPageIndex((current) => (current + 1) % pages.length);
  }

  return (
    <div className="min-w-0">
      <div className="mb-10 flex flex-col gap-5 border-b border-[var(--blanco-roto)]/12 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-[var(--gris-suave)]/55">
            Linea de prestigio
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[var(--azul-grisaceo)]/75">
            {String(safePageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
          </p>
        </div>

        {hasManyPages ? (
          <div className="flex items-center gap-3">
            <button
              aria-label="Pagina anterior de reconocimientos"
              className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-[var(--blanco-roto)]/24 text-[var(--gris-suave)]/76 transition duration-300 hover:border-[var(--blanco-roto)] hover:bg-[var(--blanco-roto)]/6 hover:text-[var(--blanco-roto)]"
              onClick={goToPrevious}
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Siguiente pagina de reconocimientos"
              className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-[var(--blanco-roto)]/24 text-[var(--gris-suave)]/76 transition duration-300 hover:border-[var(--blanco-roto)] hover:bg-[var(--blanco-roto)]/6 hover:text-[var(--blanco-roto)]"
              onClick={goToNext}
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--azul-grisaceo)]/75">
            {String(timelineAwards.length).padStart(2, "0")} hitos
          </p>
        )}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -22 }}
            initial={{ opacity: 0, x: 22 }}
            key={safePageIndex}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {page.map((award, index) => (
              <TimelineAward award={award} index={index} isLast={index === page.length - 1} key={award.id} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {hasManyPages ? (
        <div className="mt-9 flex items-center gap-2">
          {pages.map((_, index) => (
            <button
              aria-label={`Ir a pagina ${index + 1} de reconocimientos`}
              className={cn(
                "h-px transition-all duration-300",
                index === safePageIndex
                  ? "w-12 bg-[var(--blanco-roto)]"
                  : "w-7 bg-[var(--blanco-roto)]/22 hover:bg-[var(--blanco-roto)]/50",
              )}
              key={index}
              onClick={() => setPageIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TimelineAward({ award, index, isLast }: { award: AwardItem; index: number; isLast: boolean }) {
  const year = getAwardYear(award.awardedAt);

  return (
    <motion.article
      className="group grid grid-cols-[4.4rem_1.25rem_minmax(0,1fr)] gap-4 sm:grid-cols-[6.5rem_1.5rem_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[7.5rem_1.5rem_minmax(0,1fr)]"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.46, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.32 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="pt-1">
        <p className="font-display text-4xl leading-none text-[var(--blanco-roto)]/92 transition duration-300 group-hover:text-[var(--blanco-roto)] sm:text-6xl lg:text-[4.6rem]">
          {year}
        </p>
      </div>

      <div className="flex flex-col items-center pt-3">
        <span className="h-2.5 w-2.5 rounded-full border border-[var(--blanco-roto)]/70 bg-[var(--negro-profundo)] shadow-[0_0_0_5px_rgba(249,246,242,0.04)] transition duration-300 group-hover:border-[var(--azul-grisaceo)] group-hover:shadow-[0_0_0_7px_rgba(133,148,170,0.08)]" />
        {!isLast ? <span className="mt-4 h-full min-h-72 w-px bg-gradient-to-b from-[var(--blanco-roto)]/28 to-[var(--blanco-roto)]/6" /> : null}
      </div>

      <div className={cn("pb-14 sm:pb-[4.5rem]", isLast && "pb-0")}>
        <div className="grid gap-6 border-b border-[var(--blanco-roto)]/10 pb-14 transition duration-300 group-hover:border-[var(--blanco-roto)]/20 md:grid-cols-[minmax(12rem,17rem)_minmax(0,1fr)] md:gap-8">
          <AwardImage src={award.imageUrl} alt={award.title} />

          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[var(--azul-grisaceo)]/80">
              {award.sourceName ?? formatDate(award.awardedAt)}
            </p>
            <h3 className="font-display mt-4 max-w-2xl text-4xl leading-[0.98] text-balance text-[var(--blanco-roto)] sm:text-5xl">
              {award.title}
            </h3>
            <RichText
              className="mt-5 max-w-xl text-sm leading-7 text-[var(--gris-suave)]/70 sm:text-base sm:leading-8"
              html={award.description}
            />
            {award.sourceUrl ? (
              <a
                className="mt-7 inline-flex w-fit items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--gris-suave)]/62 transition duration-300 hover:text-[var(--blanco-roto)]"
                href={award.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Ver reconocimiento
                <span className="h-px w-9 bg-current transition duration-300 group-hover:w-12" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function AwardImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative aspect-[4/3] min-h-48 overflow-hidden bg-[var(--gris-oscuro)]/70">
      {src ? (
        <Image
          className="object-cover opacity-[0.88] saturate-[0.86] transition duration-700 ease-out group-hover:scale-[1.025] group-hover:opacity-100 group-hover:saturate-100"
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 17rem, (min-width: 768px) 34vw, 70vw"
        />
      ) : (
        <div className="flex h-full min-h-48 items-center justify-center border border-[var(--blanco-roto)]/10 text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--gris-suave)]/45">
          Reconocimiento
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 border border-[var(--blanco-roto)]/10 transition duration-300 group-hover:border-[var(--blanco-roto)]/24" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-y border-[var(--blanco-roto)]/12 py-16">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[var(--azul-grisaceo)]/82">
        En pausa
      </p>
      <p className="font-display mt-5 max-w-xl text-3xl leading-tight text-[var(--blanco-roto)]/84">
        {text}
      </p>
      <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--gris-suave)]/62">
        Cuando haya nuevos reconocimientos, los presentaremos aqui como parte de nuestra historia.
      </p>
      <div className="mt-8 h-px w-24 bg-[var(--blanco-roto)]/28" />
    </div>
  );
}

function sortAwardsByDate(awards: AwardItem[]) {
  return [...awards].sort((a, b) => {
    const first = a.awardedAt ? new Date(a.awardedAt).getTime() : 0;
    const second = b.awardedAt ? new Date(b.awardedAt).getTime() : 0;

    return second - first;
  });
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getAwardYear(value?: string | null) {
  if (!value) {
    return "----";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "----";
  }

  return String(date.getFullYear());
}
