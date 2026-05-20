"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { EventItem } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 3;

type EventsCarouselProps = {
  events: EventItem[];
  emptyText: string;
};

export function EventsCarousel({ events, emptyText }: EventsCarouselProps) {
  const pages = useMemo(() => chunkItems(events, PAGE_SIZE), [events]);
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
        <div className="flex items-center justify-between gap-5 border-b border-[var(--linea)] pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--gris-medio)]">
            {String(safePageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-2">
            <BrandButton aria-label="Pagina anterior de eventos" onClick={goToPrevious} size="icon" type="button" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </BrandButton>
            <BrandButton aria-label="Siguiente pagina de eventos" onClick={goToNext} size="icon" type="button" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
          </div>
        </div>
      ) : null}

      {events.length ? (
        <>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[var(--linea)]"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={safePageIndex}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                {page.map((event) => (
                  <EventRow event={event} key={event.id} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {hasManyPages ? (
            <div className="mt-6 flex items-center gap-2">
              {pages.map((_, index) => (
                <button
                  aria-label={`Ir a pagina ${index + 1} de eventos`}
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
        </>
      ) : (
        <EmptyState text={emptyText} />
      )}
    </div>
  );
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <article className="grid gap-6 py-7 lg:grid-cols-[10rem_13rem_1fr] lg:items-start">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--azul-grisaceo)]">
        <CalendarDays className="mb-3 h-5 w-5" />
        {formatDate(event.startDate)}
      </p>
      <EventImage className="aspect-[4/3]" src={event.imageUrl} alt={event.title} />
      <div>
        <h3 className="font-display text-4xl leading-none">{event.title}</h3>
        {event.location ? <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[var(--gris-medio)]">{event.location}</p> : null}
        <RichText className="mt-5 max-w-3xl leading-7 text-[var(--gris-oscuro)]" html={event.description} />
      </div>
    </article>
  );
}

function EventImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden bg-[var(--gris-suave)]", className)}>
      {src ? (
        <Image className="object-cover transition duration-700 group-hover:scale-[1.035]" src={src} alt={alt} fill sizes="(min-width: 1024px) 32vw, 100vw" />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center text-xs uppercase tracking-[0.2em] text-[var(--gris-medio)]">
          Sin imagen
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="border border-dashed border-[var(--linea)] p-6 text-sm text-[var(--gris-medio)]">{text}</div>;
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
