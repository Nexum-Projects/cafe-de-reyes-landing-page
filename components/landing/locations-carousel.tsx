"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, MapPinned } from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { FaUber } from "react-icons/fa";
import { SiWaze } from "react-icons/si";

import type { ProjectLocation } from "@/app/actions/public-content/types";

type LocationsCarouselProps = {
  fallbackAddress: string;
  fallbackImage?: string | null;
  locations: ProjectLocation[];
};

type LocationAction = {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  sortOrder: number;
};

export function LocationsCarousel({ fallbackAddress, fallbackImage, locations }: LocationsCarouselProps) {
  const sortedLocations = useMemo(
    () =>
      [...locations]
        .filter((location) => location.isActive !== false && location.isPublished !== false)
        .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0)),
    [locations],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = sortedLocations.length ? activeIndex % sortedLocations.length : 0;
  const activeLocation = sortedLocations[safeActiveIndex] ?? null;
  const hasManyLocations = sortedLocations.length > 1;
  const visualImage = activeLocation?.imageUrl ?? fallbackImage;
  const address = activeLocation?.fullAddress ?? fallbackAddress;
  const actions = activeLocation ? getLocationActions(activeLocation) : [];

  function goToPrevious() {
    if (!hasManyLocations) {
      return;
    }

    setActiveIndex((current) => (current - 1 + sortedLocations.length) % sortedLocations.length);
  }

  function goToNext() {
    if (!hasManyLocations) {
      return;
    }

    setActiveIndex((current) => (current + 1) % sortedLocations.length);
  }

  return (
    <div className="relative h-full min-h-[34rem] overflow-hidden bg-[var(--negro-profundo)] text-[var(--blanco-roto)] lg:min-h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0, scale: 1.015 }}
          initial={{ opacity: 0, scale: 1.025 }}
          key={activeLocation?.id ?? visualImage ?? "location-fallback"}
          transition={{ duration: 0.62, ease: "easeOut" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {visualImage ? (
              <Image
                alt={activeLocation?.title ?? "Café de Reyes en Quetzaltenango"}
                className="object-cover"
                fill
                priority={false}
                sizes="(min-width: 1024px) 45vw, 100vw"
                src={visualImage}
              />
            ) : (
              <div className="h-full bg-[radial-gradient(circle_at_50%_22%,rgba(133,148,170,.22),rgba(11,11,11,.92)_46%,rgba(0,0,0,1)_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-black/14" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,11,.18),rgba(11,11,11,0)_56%)]" />
          </div>

          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 sm:inset-x-7 sm:top-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gris-suave)]/70">
                {sortedLocations.length ? `${String(safeActiveIndex + 1).padStart(2, "0")} / ${String(sortedLocations.length).padStart(2, "0")}` : "00 / 00"}
              </p>
              <span className="mt-4 block h-px w-20 bg-[var(--azul-grisaceo)]/65" />
            </div>
            {hasManyLocations ? (
              <div className="flex items-center gap-2">
                <button
                  aria-label="Ubicación anterior"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--blanco-roto)]/28 bg-black/10 text-[var(--blanco-roto)] backdrop-blur transition hover:border-[var(--blanco-roto)]/60 hover:bg-[var(--blanco-roto)]/10"
                  onClick={goToPrevious}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  aria-label="Siguiente ubicación"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--blanco-roto)]/28 bg-black/10 text-[var(--blanco-roto)] backdrop-blur transition hover:border-[var(--blanco-roto)]/60 hover:bg-[var(--blanco-roto)]/10"
                  onClick={goToNext}
                  type="button"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
            <div className="max-w-xl border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur-2xl sm:p-7">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--azul-grisaceo)]">
                Encuéntranos
              </p>
              <h3 className="font-display mt-4 text-4xl leading-none sm:text-5xl">
                {activeLocation?.title ?? "Café de Reyes"}
              </h3>
              <p className="mt-5 max-w-md text-sm leading-6 text-[var(--gris-suave)]/78">
                <MapPinned className="mr-2 inline h-4 w-4 align-[-0.18em] text-[var(--azul-grisaceo)]" />
                {address}
              </p>
            </div>
            {actions.length ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {actions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <a
                      className="inline-flex h-11 items-center justify-center gap-2 border border-white/18 bg-black/30 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--blanco-roto)] backdrop-blur-xl transition hover:border-white/45 hover:bg-white/[0.08] hover:text-[var(--blanco-roto)]"
                      href={action.href}
                      key={action.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon className="h-4 w-4" />
                      {action.label}
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function getLocationActions(location: ProjectLocation): LocationAction[] {
  const encodedTitle = encodeURIComponent(location.title);
  const encodedCoordinates = `${location.latitude}%2C${location.longitude}`;

  return [
    {
      href: `https://www.google.com/maps/search/?api=1&query=${encodedCoordinates}`,
      icon: MapPinned,
      label: "Google Maps",
      sortOrder: 1,
    },
    {
      href: `https://waze.com/ul?ll=${location.latitude},${location.longitude}`,
      icon: SiWaze,
      label: "Waze",
      sortOrder: 2,
    },
    {
      href: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${location.latitude}&dropoff[longitude]=${location.longitude}&dropoff[nickname]=${encodedTitle}`,
      icon: FaUber,
      label: "Uber",
      sortOrder: 3,
    },
  ].sort((first, second) => first.sortOrder - second.sortOrder);
}
