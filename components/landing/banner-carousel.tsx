"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { Banner, MediaItem } from "@/app/actions/public-content/types";
import { BrandButton, BrandButtonLink } from "@/components/landing/brand-button";
import { RichText } from "@/components/landing/rich-text";
import { cn } from "@/lib/utils";

type BannerCarouselProps = {
  banners: Banner[];
  media: MediaItem[];
};

const defaultBanner: Banner = {
  id: "default-banner",
  title: "Café con nombre, apellido y dirección.",
  description: "Desde Quetzaltenango, una barra de especialidad donde el origen se revela taza por taza.",
  imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1800&q=88",
  buttons: [
    { label: "Ver menú", url: "#menu", variant: "PRIMARY" },
    { label: "Cómo llegar", url: "#visitanos", variant: "SECONDARY" },
  ],
};

export function BannerCarousel({ banners, media }: BannerCarouselProps) {
  const slides = useMemo(() => {
    const active = banners.filter((banner) => banner.isActive !== false && banner.isPublished !== false);
    return active.length > 0 ? active : [defaultBanner];
  }, [banners]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = slides[activeIndex] ?? slides[0];
  const hasManySlides = slides.length > 1;
  const activeButtons = activeBanner.buttons?.filter((button) => button.isActive !== false);

  useEffect(() => {
    if (!hasManySlides) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7600);

    return () => window.clearInterval(interval);
  }, [hasManySlides, slides.length]);

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[var(--negro-profundo)] text-[var(--blanco-roto)]" id="inicio">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(249,246,242,0.72)_1px,transparent_1px),linear-gradient(90deg,rgba(249,246,242,0.72)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent_0,transparent_7rem,black_13rem)]" />
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 0.48, scale: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0, scale: 1.015 }}
          initial={{ opacity: 0, scale: 1.025 }}
          key={`${activeBanner.id}-${activeBanner.imageUrl}`}
          transition={{ duration: 0.72, ease: "easeOut" }}
        >
          <EditorialImage
            alt={activeBanner.title}
            className="h-full w-full"
            priority
            src={activeBanner.imageUrl ?? media[1]?.value ?? defaultBanner.imageUrl}
          />
        </motion.div>
      </AnimatePresence>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/18 to-transparent"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,11,0.68)_0%,rgba(11,11,11,0.48)_48%,rgba(11,11,11,0.14)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1480px] flex-col justify-center px-5 py-16 pt-24 sm:px-8 lg:px-12 lg:py-20">
        <div className="max-w-5xl">
          <p className="mb-6 max-w-xl border-l border-[var(--azul-grisaceo)] pl-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gris-suave)]">
            Origen · técnica · trazabilidad · Xela
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              initial={{ opacity: 0, y: 20 }}
              key={activeBanner.id}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--azul-grisaceo)]">
                {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </p>
              <h1 className="font-display max-w-4xl text-balance text-[clamp(3.35rem,9.4vw,8.6rem)] leading-[0.88] text-[var(--blanco-roto)]">
                {activeBanner.title}
              </h1>
              <RichText className="mt-7 max-w-2xl text-base leading-8 text-[var(--gris-suave)] sm:text-lg" html={activeBanner.description} />
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {(activeButtons?.length ? activeButtons : defaultBanner.buttons)?.map((button) => (
                  <BrandButtonLink
                    href={button.url}
                    key={`${button.label}-${button.url}`}
                    target={button.target ?? "_self"}
                    variant={button.variant === "SECONDARY" ? "secondary" : "primary"}
                  >
                    {button.label}
                    <ArrowDownRight className="h-4 w-4" />
                  </BrandButtonLink>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {hasManySlides ? (
            <div className="mt-8 flex items-center gap-3">
              <BrandButton aria-label="Banner anterior" onClick={goToPrevious} size="icon" type="button" variant="ghost">
                <ChevronLeft className="h-5 w-5" />
              </BrandButton>
              <div className="flex items-center gap-2">
                {slides.map((banner, index) => (
                  <button
                    aria-label={`Ver banner ${index + 1}`}
                    className={cn(
                      "h-px transition-all",
                      index === activeIndex
                        ? "w-12 bg-[var(--blanco-roto)]"
                        : "w-7 bg-[var(--blanco-roto)]/30 hover:bg-[var(--blanco-roto)]/60",
                    )}
                    key={banner.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <BrandButton aria-label="Siguiente banner" onClick={goToNext} size="icon" type="button" variant="ghost">
                <ChevronRight className="h-5 w-5" />
              </BrandButton>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function EditorialImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-[var(--carbon)]", className)}>
      {src ? (
        <Image alt={alt} className="object-cover" fill fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} priority={priority} sizes="(min-width: 1024px) 44vw, 100vw" src={src} />
      ) : (
        <div className="flex h-full min-h-56 items-center justify-center text-xs uppercase tracking-[0.2em] text-[var(--gris-suave)]">
          Sin imagen
        </div>
      )}
    </div>
  );
}
