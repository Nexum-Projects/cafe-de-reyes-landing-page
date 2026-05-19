"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { MenuProduct } from "@/app/actions/public-content/types";
import { BrandButton } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { cn, formatPrice } from "@/lib/utils";

const PAGE_SIZE = 3;

type MenuCarouselProps = {
  products: MenuProduct[];
  title: string;
  emptyText: string;
};

export function MenuCarousel({ products, title, emptyText }: MenuCarouselProps) {
  const pages = useMemo(() => chunkProducts(products, PAGE_SIZE), [products]);
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex] ?? [];
  const hasManyPages = pages.length > 1;

  function goToPrevious() {
    setPageIndex((current) => (current - 1 + pages.length) % pages.length);
  }

  function goToNext() {
    setPageIndex((current) => (current + 1) % pages.length);
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-5 border-b border-[var(--blanco-roto)]/18 pb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gris-suave)]">{title}</h3>
          {hasManyPages ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--gris-medio)]">
              {String(pageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
            </p>
          ) : null}
        </div>

        {hasManyPages ? (
          <div className="flex items-center gap-2">
            <BrandButton aria-label={`Pagina anterior de ${title}`} onClick={goToPrevious} size="icon" type="button" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </BrandButton>
            <BrandButton aria-label={`Siguiente pagina de ${title}`} onClick={goToNext} size="icon" type="button" variant="ghost">
              <ArrowRight className="h-4 w-4" />
            </BrandButton>
          </div>
        ) : null}
      </div>

      {products.length ? (
        <>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[var(--blanco-roto)]/16"
                exit={{ opacity: 0, x: -26 }}
                initial={{ opacity: 0, x: 26 }}
                key={`${title}-${pageIndex}`}
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
                  aria-label={`Ir a pagina ${index + 1} de ${title}`}
                  className={cn(
                    "h-px transition-all",
                    index === pageIndex
                      ? "w-12 bg-[var(--blanco-roto)]"
                      : "w-7 bg-[var(--blanco-roto)]/25 hover:bg-[var(--blanco-roto)]/55",
                  )}
                  key={`${title}-${index}`}
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

function MenuItem({ product }: { product: MenuProduct }) {
  return (
    <article className="group grid min-h-[12rem] gap-5 py-7 sm:grid-cols-[8rem_1fr]">
      <EditorialImage className="aspect-square" src={product.imageUrl} alt={product.name} />
      <div>
        <div className="flex items-start justify-between gap-5">
          <h4 className="font-display text-4xl leading-none">{product.name}</h4>
          <p className="shrink-0 text-sm font-semibold text-[var(--blanco-roto)]">{formatPrice(product.priceCents)}</p>
        </div>
        <RichText className="mt-4 leading-7 text-[var(--gris-suave)]/82" html={product.description} />
        <p
          className={cn(
            "mt-5 text-xs font-semibold uppercase tracking-[0.22em]",
            product.isAvailable === false ? "text-[var(--gris-medio)]" : "text-[var(--azul-grisaceo)]",
          )}
        >
          {product.isAvailable === false ? "Fuera de temporada" : "Disponible"}
        </p>
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
  return <div className="border border-dashed border-[var(--blanco-roto)]/20 p-6 text-sm text-[var(--gris-suave)]">{text}</div>;
}

function chunkProducts(products: MenuProduct[], size: number) {
  const chunks: MenuProduct[][] = [];

  for (let index = 0; index < products.length; index += size) {
    chunks.push(products.slice(index, index + size));
  }

  return chunks;
}
