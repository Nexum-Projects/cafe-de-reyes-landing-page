"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, ArrowLeft, ArrowRight, ArrowUpAZ, Award, Search, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { getPublicAwards } from "@/app/actions/public-content";
import type { Award as AwardItem, AwardOrder } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 3;

type AwardsCarouselProps = {
  awards: AwardItem[];
  emptyText: string;
};

export function AwardsCarousel({ awards, emptyText }: AwardsCarouselProps) {
  const [order, setOrder] = useState<AwardOrder>("DESC");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [visibleAwards, setVisibleAwards] = useState(awards);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const didMountRef = useRef(false);
  const requestIdRef = useRef(0);
  const skipDebouncedSearchRef = useRef(false);
  const pages = useMemo(() => chunkItems(visibleAwards, PAGE_SIZE), [visibleAwards]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;
  const resolvedEmptyText = activeQuery ? "No se encuentran logros para la busqueda." : emptyText;

  const fetchAwards = useCallback((nextOrder: AwardOrder, nextQuery: string) => {
    const normalizedQuery = nextQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setOrder(nextOrder);
    setActiveQuery(normalizedQuery);
    setPageIndex(0);
    setFilterError(null);

    startTransition(async () => {
      const response = await getPublicAwards(nextOrder, normalizedQuery);
      const fallbackAwards = filterAwardsByQuery(sortAwards(awards, nextOrder), normalizedQuery);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setVisibleAwards(response.error ? fallbackAwards : response.data);
      setFilterError(response.error ?? null);
    });
  }, [awards]);

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
      fetchAwards(order, query);
    }, 320);

    return () => window.clearTimeout(searchTimeout);
  }, [fetchAwards, order, query]);

  function changeOrder(nextOrder: AwardOrder) {
    if (nextOrder === order && !filterError) {
      return;
    }

    skipDebouncedSearchRef.current = true;
    fetchAwards(nextOrder, query);
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
              {visibleAwards.length ? `${String(safePageIndex + 1).padStart(2, "0")} / ${String(Math.max(pages.length, 1)).padStart(2, "0")}` : "00 / 00"}
            </p>
            {isPending ? (
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--azul-grisaceo)]">
                Buscando
              </p>
            ) : null}
          </div>
          <div className="flex h-11 w-full items-center border border-[var(--blanco-roto)]/18 bg-[var(--carbon)]/18">
            <Search className="ml-3 h-4 w-4 text-[var(--azul-grisaceo)]" />
            <input
              aria-label="Buscar logros"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--blanco-roto)] outline-none placeholder:text-[var(--gris-medio)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar logro"
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Limpiar busqueda"
                className="inline-flex h-full w-10 items-center justify-center text-[var(--gris-medio)] transition hover:text-[var(--blanco-roto)]"
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
                ? "border-[var(--blanco-roto)] bg-[var(--blanco-roto)] text-[var(--negro-profundo)]"
                : "border-[var(--blanco-roto)]/20 text-[var(--gris-suave)] hover:border-[var(--blanco-roto)]/55",
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
                ? "border-[var(--blanco-roto)] bg-[var(--blanco-roto)] text-[var(--negro-profundo)]"
                : "border-[var(--blanco-roto)]/20 text-[var(--gris-suave)] hover:border-[var(--blanco-roto)]/55",
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
              <BrandButton aria-label="Pagina anterior de reconocimientos" onClick={goToPrevious} size="icon" type="button" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
              </BrandButton>
              <BrandButton aria-label="Siguiente pagina de reconocimientos" onClick={goToNext} size="icon" type="button" variant="ghost">
                <ArrowRight className="h-4 w-4" />
              </BrandButton>
            </div>
          ) : null}
        </div>
      </div>

      {filterError ? (
        <div className="mb-3 min-h-5">
          <p className="text-sm text-[var(--gris-medio)]">{filterError}</p>
        </div>
      ) : null}

      {visibleAwards.length ? (
        <>
          <div className="relative min-h-[33rem] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[var(--blanco-roto)]/16"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={`${order}-${activeQuery}-${safePageIndex}`}
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
        <EmptyState text={resolvedEmptyText} />
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
  return (
    <div className="flex justify-center py-12 text-center">
      <p className="max-w-xl text-sm leading-7 text-[var(--gris-medio)]">{text}</p>
    </div>
  );
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function sortAwards(awards: AwardItem[], order: AwardOrder) {
  return [...awards].sort((a, b) => {
    const first = a.awardedAt ? new Date(a.awardedAt).getTime() : 0;
    const second = b.awardedAt ? new Date(b.awardedAt).getTime() : 0;

    return order === "ASC" ? first - second : second - first;
  });
}

function filterAwardsByQuery(awards: AwardItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return awards;
  }

  return awards.filter((award) =>
    [award.title, award.description, award.sourceName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}
