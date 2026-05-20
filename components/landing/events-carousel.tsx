"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowRight,
  ArrowUpAZ,
  CalendarDays,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { getPublicEvents } from "@/app/actions/public-content";
import type { EventItem, EventOrder } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 3;
const EVENT_TIME_ZONE = "America/Guatemala";

type EventsCarouselProps = {
  events: EventItem[];
  emptyText: string;
};

export function EventsCarousel({ events, emptyText }: EventsCarouselProps) {
  const [order, setOrder] = useState<EventOrder>("DESC");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [visibleEvents, setVisibleEvents] = useState(events);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const didMountRef = useRef(false);
  const requestIdRef = useRef(0);
  const skipDebouncedSearchRef = useRef(false);
  const pages = useMemo(() => chunkItems(visibleEvents, PAGE_SIZE), [visibleEvents]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;
  const resolvedEmptyText = activeQuery
    ? `No hay eventos para "${activeQuery}".`
    : emptyText;

  const fetchEvents = useCallback((nextOrder: EventOrder, nextQuery: string) => {
    const normalizedQuery = nextQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setOrder(nextOrder);
    setActiveQuery(normalizedQuery);
    setPageIndex(0);
    setFilterError(null);

    startTransition(async () => {
      const response = await getPublicEvents(nextOrder, normalizedQuery);
      const publishedEvents = filterPublishedEvents(response.data);
      const fallbackEvents = filterEventsByQuery(sortEvents(events, nextOrder), normalizedQuery);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setVisibleEvents(response.error ? fallbackEvents : publishedEvents);
      setFilterError(response.error ?? null);
    });
  }, [events]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (skipDebouncedSearchRef.current) {
      skipDebouncedSearchRef.current = false;
      return;
    }

    const searchTimeout = window.setTimeout(() => {
      fetchEvents(order, query);
    }, 320);

    return () => window.clearTimeout(searchTimeout);
  }, [fetchEvents, order, query]);

  function changeOrder(nextOrder: EventOrder) {
    if (nextOrder === order && !filterError) {
      return;
    }

    skipDebouncedSearchRef.current = true;
    fetchEvents(nextOrder, query);
  }

  function clearSearch() {
    setQuery("");
  }

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
      <div className="flex flex-col gap-2 pb-5 lg:flex-row lg:items-center">
        <div className="flex w-full flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-[5.5rem]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--gris-medio)]">
              {visibleEvents.length ? `${String(safePageIndex + 1).padStart(2, "0")} / ${String(Math.max(pages.length, 1)).padStart(2, "0")}` : "00 / 00"}
            </p>
            {isPending ? (
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--azul-grisaceo)]">
                Buscando
              </p>
            ) : null}
          </div>
          <div className="flex h-11 w-full items-center border border-[var(--linea)] bg-[var(--blanco-roto)]/72">
            <Search className="ml-3 h-4 w-4 text-[var(--azul-grisaceo)]" />
            <input
              aria-label="Buscar eventos"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--negro-profundo)] outline-none placeholder:text-[var(--gris-medio)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar evento"
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Limpiar busqueda"
                className="inline-flex h-full w-10 items-center justify-center text-[var(--gris-medio)] transition hover:text-[var(--negro-profundo)]"
                onClick={clearSearch}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0">
          <button
            className={cn(
              "inline-flex h-11 items-center gap-2 border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition",
              order === "DESC"
                ? "border-[var(--negro-profundo)] bg-[var(--negro-profundo)] text-[var(--blanco-roto)]"
                : "border-[var(--linea)] text-[var(--gris-oscuro)] hover:border-[var(--negro-profundo)]",
            )}
            disabled={isPending}
            onClick={() => changeOrder("DESC")}
            type="button"
          >
            <ArrowUpAZ className="h-4 w-4" />
            Recientes
          </button>
          <button
            className={cn(
              "inline-flex h-11 items-center gap-2 border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition",
              order === "ASC"
                ? "border-[var(--negro-profundo)] bg-[var(--negro-profundo)] text-[var(--blanco-roto)]"
                : "border-[var(--linea)] text-[var(--gris-oscuro)] hover:border-[var(--negro-profundo)]",
            )}
            disabled={isPending}
            onClick={() => changeOrder("ASC")}
            type="button"
          >
            <ArrowDownAZ className="h-4 w-4" />
            Antiguos
          </button>
          {hasManyPages ? (
            <div className="flex items-center gap-2">
              <BrandButton aria-label="Pagina anterior de eventos" onClick={goToPrevious} size="icon" type="button" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </BrandButton>
              <BrandButton aria-label="Siguiente pagina de eventos" onClick={goToNext} size="icon" type="button" variant="ghost">
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
            </div>
          ) : null}
        </div>
      </div>

      {activeQuery || filterError ? (
        <div className="mb-3 min-h-5">
          {activeQuery ? (
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--gris-medio)]">
              Busqueda: {activeQuery}
            </p>
          ) : null}
          {filterError ? <p className="mt-2 text-sm text-[var(--gris-medio)]">{filterError}</p> : null}
        </div>
      ) : null}

      {visibleEvents.length ? (
        <>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[var(--linea)]"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={`${order}-${activeQuery}-${safePageIndex}`}
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
        <EmptyState text={resolvedEmptyText} />
      )}
    </div>
  );
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <article className="grid gap-6 py-7 lg:grid-cols-[10rem_13rem_1fr] lg:items-start">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--azul-grisaceo)]">
        <CalendarDays className="mb-3 h-5 w-5" />
        {formatEventDateRange(event.startDate, event.endDate)}
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

function filterPublishedEvents(events: EventItem[]) {
  return events.filter(
    (event) => event.isActive !== false && event.isPublished !== false && event.status !== "CANCELLED",
  );
}

function sortEvents(events: EventItem[], order: EventOrder) {
  return [...events].sort((a, b) => {
    const first = a.startDate ? new Date(a.startDate).getTime() : 0;
    const second = b.startDate ? new Date(b.startDate).getTime() : 0;

    return order === "ASC" ? first - second : second - first;
  });
}

function filterEventsByQuery(events: EventItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return events;
  }

  return events.filter((event) =>
    [event.title, event.description, event.location]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

function formatEventDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate) {
    return "Proximamente";
  }

  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return "Proximamente";
  }

  const dateFormatter = new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("es-GT", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  });
  const startDay = dateFormatter.format(start);
  const startTime = timeFormatter.format(start);

  if (!endDate) {
    return `${startDay} · ${startTime}`;
  }

  const end = new Date(endDate);

  if (Number.isNaN(end.getTime())) {
    return `${startDay} · ${startTime}`;
  }

  const endDay = dateFormatter.format(end);
  const endTime = timeFormatter.format(end);

  if (startDay === endDay) {
    return `${startDay} · ${startTime} - ${endTime}`;
  }

  return `${startDay} · ${startTime} - ${endDay} · ${endTime}`;
}
