"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Coffee, Search, X } from "lucide-react";
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

type MenuEmptyStateProps = {
  text: string;
  eyebrow?: string;
  description?: string;
};

export function MenuEmptyState({
  text,
  eyebrow = "Menu en pausa",
  description = "Cuando haya nuevos cafes y platillos, los presentaremos aqui como parte de la experiencia en barra.",
}: MenuEmptyStateProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="border-y border-[var(--blanco-roto)]/12 py-16"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[var(--azul-grisaceo)]/82">
        {eyebrow}
      </p>
      <p className="font-display mt-5 max-w-xl text-3xl leading-tight text-[var(--blanco-roto)]/84">
        {text}
      </p>
      <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--gris-suave)]/62">
        {description}
      </p>
      <motion.div
        animate={{ scaleX: 1 }}
        className="mt-8 h-px w-24 origin-left bg-[var(--blanco-roto)]/28"
        initial={{ scaleX: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
      />
    </motion.div>
  );
}

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
  const emptyStateEyebrow = activeQuery ? "Sin resultados" : "Menu en pausa";
  const emptyStateDescription = activeQuery
    ? "Prueba con otro nombre de cafe, platillo o preparacion."
    : "Cuando haya nuevos cafes y platillos, los presentaremos aqui como parte de la experiencia en barra.";

  const fetchProducts = useCallback((nextType: MenuProductType, nextQuery: string) => {
    const normalizedQuery = nextQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setActiveType(nextType);
    setActiveQuery(normalizedQuery);
    setPageIndex(0);
    setFilterError(null);
    setVisibleProducts(filterProductsByQuery(initialProductsByType[nextType] ?? [], normalizedQuery));

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
        <div className="mb-9 overflow-x-auto border-b border-[var(--blanco-roto)]/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-end gap-10">
          {categories.map((type) => (
            <button
              className={cn(
                "relative pb-5 text-xs font-semibold uppercase tracking-[0.22em] transition duration-300",
                type === activeType
                  ? "text-[var(--blanco-roto)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-[var(--blanco-roto)]"
                  : "text-[var(--gris-suave)]/58 hover:text-[var(--gris-suave)]",
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
        </div>
      ) : null}

      <div className="flex flex-col gap-4 pb-7 lg:flex-row lg:items-center">
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
          <div className="group flex h-12 w-full items-center border border-[var(--blanco-roto)]/14 bg-black/18 transition duration-300 hover:border-[var(--blanco-roto)]/28 focus-within:border-[var(--azul-grisaceo)]/55 focus-within:bg-black/28">
            <Search className="ml-4 h-4 w-4 text-[var(--gris-suave)]/54 transition group-focus-within:text-[var(--azul-grisaceo)]" />
            <input
              aria-label="Buscar productos del menu"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-[var(--blanco-roto)] outline-none placeholder:text-[var(--gris-medio)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar café o platillo..."
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
            <BrandButton aria-label="Pagina anterior del menu" className="rounded-full border-[var(--blanco-roto)]/18 hover:border-[var(--blanco-roto)]/45" onClick={goToPrevious} size="icon" type="button" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </BrandButton>
            <BrandButton aria-label="Siguiente pagina del menu" className="rounded-full border-[var(--blanco-roto)]/18 hover:border-[var(--blanco-roto)]/45" onClick={goToNext} size="icon" type="button" variant="ghost">
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
        <MenuEmptyState
          description={emptyStateDescription}
          eyebrow={emptyStateEyebrow}
          text={resolvedEmptyText}
        />
      )}
    </div>
  );
}

function MenuItem({ product }: { product: MenuProduct }) {
  const priceLabel = formatPrice(product.priceCents);
  const showAvailability = hasDisplayablePrice(product.priceCents) && product.isAvailable === false;

  return (
    <article className="group grid min-h-[10.5rem] gap-6 py-6 transition duration-300 hover:bg-[var(--blanco-roto)]/[0.025] sm:grid-cols-[9.5rem_1fr] sm:px-3">
      <EditorialImage className="aspect-[4/3] sm:aspect-[1.18/1]" src={product.imageUrl} alt={product.name} />
      <div className="flex min-w-0 flex-col justify-center">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <h4 className="font-display text-3xl leading-none text-[var(--blanco-roto)] transition duration-300 group-hover:text-white sm:text-[2.65rem]">
              {product.name}
            </h4>
            <RichText className="mt-3 max-w-2xl text-sm leading-6 text-[var(--gris-suave)]/72" html={product.description} />
          </div>
          <div className="hidden items-center gap-5 pb-1 sm:flex">
            <span className="h-px w-16 bg-[var(--blanco-roto)]/25 transition duration-300 group-hover:w-20 group-hover:bg-[var(--azul-grisaceo)]/70" />
            {priceLabel ? (
              <p className="font-display shrink-0 text-3xl leading-none text-[var(--blanco-roto)]">{priceLabel}</p>
            ) : null}
          </div>
        </div>
        {priceLabel ? (
          <p className="mt-5 border-t border-[var(--blanco-roto)]/12 pt-3 font-display text-2xl leading-none text-[var(--blanco-roto)] sm:hidden">
            {priceLabel}
          </p>
        ) : null}
        {showAvailability ? (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gris-medio)]">
            Fuera de temporada
          </p>
        ) : null}
      </div>
    </article>
  );
}

function EditorialImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-[var(--gris-oscuro)] ring-1 ring-[var(--blanco-roto)]/8", className)}>
      {src ? (
        <Image className="object-cover transition duration-700 group-hover:scale-[1.04]" src={src} alt={alt} fill sizes="(min-width: 640px) 9.5rem, 42vw" />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center">
          <div
            aria-hidden
            className="flex h-11 w-11 items-center justify-center border border-[var(--blanco-roto)]/10"
          >
            <Coffee className="h-5 w-5 text-[var(--gris-suave)]/32" strokeWidth={1.25} />
          </div>
        </div>
      )}
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
