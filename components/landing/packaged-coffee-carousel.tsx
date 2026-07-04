"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { getPublicPackagedCoffeeProducts } from "@/app/actions/public-content";
import type { MenuProduct } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { humanizeProductMeasurementUnit } from "@/lib/menu-product-type";
import { cn, formatPrice, hasDisplayablePrice } from "@/lib/utils";

const PAGE_SIZE = 3;

type PackagedCoffeeCarouselProps = {
  emptyText: string;
  initialProducts: MenuProduct[];
};

export function PackagedCoffeeCarousel({ emptyText, initialProducts }: PackagedCoffeeCarouselProps) {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [visibleProducts, setVisibleProducts] = useState<MenuProduct[]>(initialProducts);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const didMountRef = useRef(false);
  const requestIdRef = useRef(0);
  const pages = useMemo(() => chunkProducts(visibleProducts, PAGE_SIZE), [visibleProducts]);
  const [pageIndex, setPageIndex] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;
  const resolvedEmptyText = activeQuery ? "No encontramos cafes empacados para esa busqueda." : emptyText;
  const emptyStateEyebrow = activeQuery ? "Sin resultados" : "Cafe en pausa";
  const emptyStateDescription = activeQuery
    ? "Prueba con otro nombre de lote, origen o proceso."
    : "Cuando haya nuevos lotes empacados, apareceran aqui como parte de la temporada.";

  const fetchProducts = useCallback((nextQuery: string) => {
    const normalizedQuery = nextQuery.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setActiveQuery(normalizedQuery);
    setPageIndex(0);
    setFilterError(null);
    setVisibleProducts(filterProductsByQuery(initialProducts, normalizedQuery));

    startTransition(async () => {
      const response = await getPublicPackagedCoffeeProducts(normalizedQuery);
      const fallbackProducts = filterProductsByQuery(initialProducts, normalizedQuery);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setVisibleProducts(response.error ? fallbackProducts : response.data);
      setFilterError(response.error ?? null);
    });
  }, [initialProducts]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const searchTimeout = window.setTimeout(() => {
      fetchProducts(query);
    }, 320);

    return () => window.clearTimeout(searchTimeout);
  }, [fetchProducts, query]);

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
      <div className="flex flex-col gap-4 pb-7 lg:flex-row lg:items-center">
        <div className="flex w-full flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="min-w-22">
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-(--gris-medio)">
              {visibleProducts.length ? `${String(safePageIndex + 1).padStart(2, "0")} / ${String(Math.max(pages.length, 1)).padStart(2, "0")}` : "00 / 00"}
            </p>
            {isPending ? (
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-(--azul-grisaceo)">
                Buscando
              </p>
            ) : null}
          </div>
          <div className="group flex h-12 w-full items-center border border-(--blanco-roto)/14 bg-black/18 transition duration-300 hover:border-(--blanco-roto)/28 focus-within:border-(--azul-grisaceo)/55 focus-within:bg-black/28">
            <Search className="ml-4 h-4 w-4 text-(--gris-suave)/54 transition group-focus-within:text-(--azul-grisaceo)" />
            <input
              aria-label="Buscar cafes empacados"
              className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-(--blanco-roto) outline-none placeholder:text-(--gris-medio)"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar lote, origen o proceso..."
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Limpiar busqueda"
                className="inline-flex h-full w-10 items-center justify-center text-(--gris-medio) transition hover:text-(--blanco-roto)"
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
            <BrandButton aria-label="Pagina anterior de cafes empacados" className="rounded-full border-(--blanco-roto)/18 hover:border-(--blanco-roto)/45" onClick={goToPrevious} size="icon" type="button" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </BrandButton>
            <BrandButton aria-label="Siguiente pagina de cafes empacados" className="rounded-full border-(--blanco-roto)/18 hover:border-(--blanco-roto)/45" onClick={goToNext} size="icon" type="button" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
          </div>
        ) : null}
      </div>

      {filterError ? (
        <div className="mb-3 min-h-5">
          <p className="text-sm text-(--gris-medio)">{filterError}</p>
        </div>
      ) : null}

      {visibleProducts.length ? (
        <>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="grid border border-(--blanco-roto)/12 sm:grid-cols-2 lg:grid-cols-3"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={`${activeQuery}-${safePageIndex}`}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                {page.map((product) => (
                  <PackagedCoffeeCard product={product} key={product.id} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {hasManyPages ? (
            <div className="mt-6 flex items-center gap-2">
              {pages.map((_, index) => (
                <button
                  aria-label={`Ir a pagina ${index + 1} de cafes empacados`}
                  className={cn(
                    "h-px transition-all",
                    index === safePageIndex
                      ? "w-12 bg-(--blanco-roto)"
                      : "w-7 bg-(--blanco-roto)/25 hover:bg-(--blanco-roto)/55",
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
        <PackagedCoffeeEmptyState
          description={emptyStateDescription}
          eyebrow={emptyStateEyebrow}
          text={resolvedEmptyText}
        />
      )}
    </div>
  );
}

function PackagedCoffeeCard({ product }: { product: MenuProduct }) {
  const pricingLabel = formatPackagedCoffeePricing(product);
  const showAvailability = hasDisplayablePrice(product.priceCents) && product.isAvailable === false;

  return (
    <article className="group flex min-h-124 flex-col border-b border-(--blanco-roto)/12 bg-(--carbon) p-5 transition duration-300 hover:bg-(--negro-profundo) sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
      <EditorialImage alt={product.name} src={product.imageUrl} />
      <div className="flex flex-1 flex-col pt-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-(--azul-grisaceo)/70" />
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--gris-medio)">
            Cafe empacado
          </p>
        </div>
        <h3 className="font-display text-3xl leading-none text-(--blanco-roto) transition duration-300 group-hover:text-white">
          {product.name}
        </h3>
        <RichText className="mt-4 text-sm leading-7 text-(--gris-suave)/70" html={product.description} />
        {pricingLabel ? (
          <p className="mt-auto pt-7 text-sm font-semibold text-(--blanco-roto)">{pricingLabel}</p>
        ) : null}
        {showAvailability ? (
          <p className={cn("text-xs font-semibold uppercase tracking-[0.22em] text-(--gris-medio)", pricingLabel ? "mt-3" : "mt-auto pt-7")}>
            Fuera de temporada
          </p>
        ) : null}
      </div>
    </article>
  );
}

function EditorialImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative aspect-4/3 overflow-hidden bg-(--gris-oscuro) ring-1 ring-(--blanco-roto)/8">
      {src ? (
        <Image className="object-cover transition duration-700 group-hover:scale-[1.04]" src={src} alt={alt} fill sizes="(min-width: 1024px) 29vw, (min-width: 640px) 46vw, 100vw" />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-xs uppercase tracking-[0.2em] text-(--gris-suave)">
          Sin imagen
        </div>
      )}
    </div>
  );
}

type PackagedCoffeeEmptyStateProps = {
  text: string;
  eyebrow?: string;
  description?: string;
};

export function PackagedCoffeeEmptyState({
  text,
  eyebrow = "Cafe en pausa",
  description = "Cuando haya nuevos lotes empacados, apareceran aqui como parte de la temporada.",
}: PackagedCoffeeEmptyStateProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="border-y border-(--blanco-roto)/12 py-16"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-(--azul-grisaceo)/82">
        {eyebrow}
      </p>
      <p className="font-display mt-5 max-w-xl text-3xl leading-tight text-(--blanco-roto)/84">
        {text}
      </p>
      <p className="mt-5 max-w-lg text-sm leading-7 text-(--gris-suave)/62">
        {description}
      </p>
      <motion.div
        animate={{ scaleX: 1 }}
        className="mt-8 h-px w-24 origin-left bg-(--blanco-roto)/28"
        initial={{ scaleX: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
      />
    </motion.div>
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
    [product.name, product.description, formatPackagedCoffeePricing(product)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

function formatPackagedCoffeePricing(product: MenuProduct) {
  const priceLabel = formatPrice(product.priceCents);
  const measurementLabel = formatProductMeasurement(product);

  if (priceLabel && measurementLabel) {
    return `${priceLabel} — ${measurementLabel}`;
  }

  return priceLabel ?? measurementLabel;
}

function formatProductMeasurement(product: MenuProduct) {
  const { measurementUnit, measurementValue } = product;

  if (measurementValue === null || measurementValue === undefined || !measurementUnit) {
    return null;
  }

  const numericValue = typeof measurementValue === "number" ? measurementValue : Number(measurementValue);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const unit = humanizeProductMeasurementUnit(measurementUnit);

  if (!unit) {
    return null;
  }

  const displayValue = Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toLocaleString("es-GT", { maximumFractionDigits: 2 });

  return `${displayValue} ${unit}`;
}
