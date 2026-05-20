"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { getPublicMenuProducts } from "@/app/actions/public-content";
import type { MenuProduct, MenuProductType } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { humanizeMenuProductType } from "@/lib/menu-product-type";
import { cn, formatPrice, hasDisplayablePrice } from "@/lib/utils";

const PAGE_SIZE = 3;

type MenuCarouselProps = {
  categories: MenuProductType[];
  emptyText: string;
  initialProductsByType: Record<MenuProductType, MenuProduct[]>;
};

export function MenuCarousel({ categories, emptyText, initialProductsByType }: MenuCarouselProps) {
  const initialType = categories[0];
  const [activeType, setActiveType] = useState<MenuProductType | undefined>(initialType);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [visibleProducts, setVisibleProducts] = useState<MenuProduct[]>(
    initialType ? initialProductsByType[initialType] : [],
  );
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const didMountRef = useRef(false);
  const requestIdRef = useRef(0);
  const skipDebouncedSearchRef = useRef(false);
  const pages = useMemo(() => chunkProducts(visibleProducts, PAGE_SIZE), [visibleProducts]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;
  const resolvedEmptyText = activeQuery
    ? "No se encuentran productos para la busqueda."
    : emptyText;

  const fetchProducts = useCallback((nextType: MenuProductType, nextQuery: string) => {
    const normalizedQuery = nextQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setActiveType(nextType);
    setActiveQuery(normalizedQuery);
    setPageIndex(0);
    setFilterError(null);

    startTransition(async () => {
      const response = await getPublicMenuProducts(nextType, normalizedQuery);
      const fallbackProducts = filterProductsByQuery(initialProductsByType[nextType] ?? [], normalizedQuery);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setVisibleProducts(response.error ? fallbackProducts : response.data);
      setFilterError(response.error ?? null);
    });
  }, [initialProductsByType]);

  useEffect(() => {
    if (!activeType) {
      return;
    }

    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (skipDebouncedSearchRef.current) {
      skipDebouncedSearchRef.current = false;
      return;
    }

    const searchTimeout = window.setTimeout(() => {
      fetchProducts(activeType, query);
    }, 320);

    return () => window.clearTimeout(searchTimeout);
  }, [activeType, fetchProducts, query]);

  function changeType(nextType: MenuProductType) {
    if (nextType === activeType && !filterError) {
      return;
    }

    skipDebouncedSearchRef.current = true;
    fetchProducts(nextType, query);
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
      {categories.length ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((type) => (
            <button
              className={cn(
                "h-11 border px-4 text-xs font-semibold uppercase tracking-[0.16em] transition",
                type === activeType
                  ? "border-[var(--blanco-roto)] bg-[var(--blanco-roto)] text-[var(--negro-profundo)]"
                  : "border-[var(--blanco-roto)]/20 text-[var(--gris-suave)] hover:border-[var(--blanco-roto)]/55",
              )}
              disabled={isPending}
              key={type}
              onClick={() => changeType(type)}
              type="button"
            >
              {humanizeMenuProductType(type)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 pb-5 lg:flex-row lg:items-center">
        <div className="flex w-full flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-[5.5rem]">
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--gris-medio)]">
              {visibleProducts.length ? `${String(safePageIndex + 1).padStart(2, "0")} / ${String(Math.max(pages.length, 1)).padStart(2, "0")}` : "00 / 00"}
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
              aria-label="Buscar productos del menu"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--blanco-roto)] outline-none placeholder:text-[var(--gris-medio)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto"
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

        {hasManyPages ? (
          <div className="flex items-center gap-2">
            <BrandButton aria-label="Pagina anterior del menu" onClick={goToPrevious} size="icon" type="button" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </BrandButton>
            <BrandButton aria-label="Siguiente pagina del menu" onClick={goToNext} size="icon" type="button" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
          </div>
        ) : null}
      </div>

      {filterError ? (
        <div className="mb-3 min-h-5">
          <p className="text-sm text-[var(--gris-medio)]">{filterError}</p>
        </div>
      ) : null}

      {visibleProducts.length ? (
        <>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[var(--blanco-roto)]/16"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={`${activeType}-${activeQuery}-${safePageIndex}`}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                {page.map((product) => (
                  <MenuItem product={product} key={product.id} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {hasManyPages ? (
            <div className="mt-6 flex items-center gap-2">
              {pages.map((_, index) => (
                <button
                  aria-label={`Ir a pagina ${index + 1} del menu`}
                  className={cn(
                    "h-px transition-all",
                    index === safePageIndex
                      ? "w-12 bg-[var(--blanco-roto)]"
                      : "w-7 bg-[var(--blanco-roto)]/25 hover:bg-[var(--blanco-roto)]/55",
                  )}
                  key={`${activeType}-${index}`}
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

function MenuItem({ product }: { product: MenuProduct }) {
  const priceLabel = formatPrice(product.priceCents);
  const showAvailability = hasDisplayablePrice(product.priceCents) && product.isAvailable === false;

  return (
    <article className="group grid min-h-[12rem] gap-5 py-7 sm:grid-cols-[8rem_1fr]">
      <EditorialImage className="aspect-square" src={product.imageUrl} alt={product.name} />
      <div>
        <div className={cn("flex items-start gap-5", priceLabel && "justify-between")}>
          <h4 className="font-display text-4xl leading-none">{product.name}</h4>
          {priceLabel ? (
            <p className="shrink-0 text-sm font-semibold text-[var(--blanco-roto)]">{priceLabel}</p>
          ) : null}
        </div>
        <RichText className="mt-4 leading-7 text-[var(--gris-suave)]/82" html={product.description} />
        {showAvailability ? (
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gris-medio)]">
            Fuera de temporada
          </p>
        ) : null}
      </div>
    </article>
  );
}

function EditorialImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden bg-[var(--gris-oscuro)]", className)}>
      {src ? (
        <Image className="object-cover transition duration-700 group-hover:scale-[1.035]" src={src} alt={alt} fill sizes="8rem" />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center text-xs uppercase tracking-[0.2em] text-[var(--gris-suave)]">
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

function chunkProducts(products: MenuProduct[], size: number) {
  const chunks: MenuProduct[][] = [];

  for (let index = 0; index < products.length; index += size) {
    chunks.push(products.slice(index, index + size));
  }

  return chunks;
}

function filterProductsByQuery(products: MenuProduct[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}
