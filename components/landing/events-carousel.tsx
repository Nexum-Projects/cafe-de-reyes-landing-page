"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, MapPinned } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { EventItem } from "@/app/actions/public-content/types";
import { RichText } from "@/components/landing/rich-text";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 2;
const EVENT_TIME_ZONE = "America/Guatemala";

type EventsCarouselProps = {
  events: EventItem[];
  emptyText: string;
};

type EventMode = "upcoming" | "past";

type EventLocationLinkType = "uber" | "waze" | "maps";

type EventLocationLink = {
  href: string;
  icon: (props: { className?: string }) => ReactNode;
  label: string;
  type: EventLocationLinkType;
};

export function EventsCarousel({ events, emptyText }: EventsCarouselProps) {
  const [mode, setMode] = useState<EventMode>("upcoming");
  const [pageIndex, setPageIndex] = useState(0);
  const orderedEvents = useMemo(() => sortEvents(events, mode), [events, mode]);
  const pages = useMemo(() => chunkItems(orderedEvents, PAGE_SIZE), [orderedEvents]);
  const safePageIndex = pages.length === 0 ? 0 : pageIndex % pages.length;
  const page = pages[safePageIndex] ?? [];
  const hasManyPages = pages.length > 1;

  function changeMode(nextMode: EventMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setPageIndex(0);
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
      <div className="mb-10 flex flex-col gap-6 border-b border-[var(--linea)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-8">
          <EventTab active={mode === "upcoming"} label="Proximos" onClick={() => changeMode("upcoming")} />
          <EventTab active={mode === "past"} label="Pasados" onClick={() => changeMode("past")} />
        </div>

        <div className="flex items-center justify-between gap-5 sm:justify-end">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--azul-grisaceo)]">
            {pages.length ? `${String(safePageIndex + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}` : "00 / 00"}
          </p>
          {hasManyPages ? (
            <div className="flex items-center gap-3">
              <button
                aria-label="Pagina anterior de eventos"
                className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-[var(--negro-profundo)]/24 text-[var(--gris-oscuro)] transition duration-300 hover:border-[var(--negro-profundo)] hover:bg-[var(--negro-profundo)]/5 hover:text-[var(--negro-profundo)]"
                onClick={goToPrevious}
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Siguiente pagina de eventos"
                className="inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-[var(--negro-profundo)]/24 text-[var(--gris-oscuro)] transition duration-300 hover:border-[var(--negro-profundo)] hover:bg-[var(--negro-profundo)]/5 hover:text-[var(--negro-profundo)]"
                onClick={goToNext}
                type="button"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {page.length ? (
        <>
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="grid gap-8 lg:grid-cols-2"
                exit={{ opacity: 0, x: -22 }}
                initial={{ opacity: 0, x: 22 }}
                key={`${mode}-${safePageIndex}`}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              >
                {page.map((event, index) => (
                  <EventExperienceCard event={event} index={index} key={event.id} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {hasManyPages ? (
            <div className="mt-9 flex items-center gap-2">
              {pages.map((_, index) => (
                <button
                  aria-label={`Ir a pagina ${index + 1} de eventos`}
                  className={cn(
                    "h-px transition-all duration-300",
                    index === safePageIndex
                      ? "w-12 bg-[var(--negro-profundo)]"
                      : "w-7 bg-[var(--negro-profundo)]/22 hover:bg-[var(--negro-profundo)]/50",
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

function EventTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={cn(
        "relative pb-3 text-xs font-semibold uppercase tracking-[0.24em] transition duration-300",
        active ? "text-[var(--negro-profundo)]" : "text-[var(--gris-medio)] hover:text-[var(--negro-profundo)]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left bg-current transition duration-300",
          active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
        )}
      />
    </button>
  );
}

function EventExperienceCard({ event, index }: { event: EventItem; index: number }) {
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const dateParts = getEventDateParts(event.startDate, event.endDate);
  const locationLabel = getEditorialLocationLabel(event.location);
  const locationLinks = getEventLocationLinks(event);

  return (
    <motion.article
      className="group grid gap-5 pt-1 md:grid-cols-[5.5rem_minmax(0,1fr)] md:gap-7"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.46, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.3 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-end justify-between gap-5 md:block">
        <div>
          <p className="font-display text-6xl leading-[0.82] text-[var(--negro-profundo)] md:text-7xl">
            {dateParts.day}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--azul-grisaceo)]">
            {dateParts.month}
          </p>
        </div>
        <div className="text-right md:mt-8 md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gris-oscuro)]">
            {dateParts.startTime}
          </p>
          <span className="my-2 block h-px w-8 bg-[var(--linea)] md:w-10" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gris-medio)]">
            {dateParts.endTime}
          </p>
        </div>
      </div>

      <div>
        <EventImage src={event.imageUrl} alt={event.title} />
        <div className="pt-7">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--azul-grisaceo)]">
            {getEventCategory(event)}
          </p>
          <h3 className="font-display mt-4 max-w-xl text-4xl leading-[0.98] text-balance text-[var(--negro-profundo)] sm:text-5xl">
            {event.title}
          </h3>
          {locationLabel ? (
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--gris-oscuro)]">
              {locationLabel}
            </p>
          ) : null}
          <RichText className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-[var(--gris-oscuro)]" html={event.description} />

          {locationLinks.length ? (
            <div className="relative mt-7 w-fit">
              <button
                aria-expanded={directionsOpen}
                className="inline-flex h-10 items-center justify-center gap-3 border border-[var(--negro-profundo)]/18 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--negro-profundo)] transition duration-300 hover:border-[var(--negro-profundo)]"
                onClick={() => setDirectionsOpen((current) => !current)}
                type="button"
              >
                <MapPinned className="h-4 w-4" />
                Como llegar
                <ChevronDown className={cn("h-4 w-4 transition duration-300", directionsOpen && "rotate-180")} />
              </button>
              {directionsOpen ? (
                <div className="absolute left-0 top-full z-20 mt-2 min-w-52 border border-[var(--linea)] bg-[var(--blanco-roto)] p-2 shadow-2xl">
                  {locationLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <a
                        className="flex h-10 items-center gap-3 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--gris-oscuro)] transition duration-300 hover:bg-[var(--negro-profundo)]/6 hover:text-[var(--negro-profundo)]"
                        href={link.href}
                        key={link.label}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function EventImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative h-72 overflow-hidden bg-[var(--gris-suave)] sm:h-80 lg:h-[22rem]">
      {src ? (
        <Image
          className="object-cover saturate-[0.92] transition duration-700 ease-out group-hover:scale-[1.025] group-hover:saturate-100"
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 35vw, (min-width: 640px) 70vw, 100vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center border border-[var(--linea)] text-center text-[0.65rem] uppercase tracking-[0.24em] text-[var(--gris-medio)]">
          Experiencia
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 border border-[var(--linea)] transition duration-300 group-hover:border-[var(--negro-profundo)]/24" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--negro-profundo)]/20 to-transparent" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-y border-[var(--linea)] py-16">
      <p className="font-display max-w-xl text-3xl leading-tight text-[var(--negro-profundo)]">{text}</p>
      <div className="mt-8 h-px w-24 bg-[var(--negro-profundo)]/28" />
    </div>
  );
}

function sortEvents(events: EventItem[], mode: EventMode) {
  const publishedEvents = events.filter((event) => event.isPublished !== false);

  return publishedEvents.sort((a, b) => {
    const first = getEventTime(a.startDate);
    const second = getEventTime(b.startDate);

    return mode === "upcoming" ? second - first : first - second;
  });
}

function getEventTime(value?: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getEventCategory(event: EventItem) {
  const text = `${event.title} ${event.description ?? ""}`.toLowerCase();

  if (text.includes("brunch")) {
    return "Brunch especial";
  }

  if (text.includes("cata") || text.includes("microlote")) {
    return "Cata";
  }

  if (text.includes("cena")) {
    return "Cena especial";
  }

  if (text.includes("aniversario")) {
    return "Encuentro especial";
  }

  return "Experiencia cafe";
}

function getEditorialLocationLabel(location: EventItem["location"]) {
  const locationLabel = getEventLocationLabel(location);

  if (!locationLabel) {
    return null;
  }

  if (/cafe|café/i.test(locationLabel)) {
    return "Cafe de Reyes · Quetzaltenango";
  }

  return locationLabel;
}

function getEventLocationLabel(location: EventItem["location"]) {
  if (!location) {
    return null;
  }

  if (typeof location === "string") {
    return location;
  }

  return location.fullAddress ?? null;
}

function getEventCoordinates(location: EventItem["location"]) {
  if (!location || typeof location === "string") {
    return null;
  }

  const { latitude, longitude } = location;

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return null;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function getEventLocationLinks(event: EventItem): EventLocationLink[] {
  const coordinates = getEventCoordinates(event.location);

  if (!coordinates) {
    return [];
  }

  const { latitude, longitude } = coordinates;
  const eventName = encodeURIComponent(event.title);
  const encodedCoordinates = `${latitude}%2C${longitude}`;

  return [
    {
      href: `https://www.google.com/maps/search/?api=1&query=${encodedCoordinates}`,
      icon: MapPinned,
      label: "Google Maps",
      type: "maps",
    },
    {
      href: `https://waze.com/ul?ll=${latitude},${longitude}`,
      icon: WazeIcon,
      label: "Waze",
      type: "waze",
    },
    {
      href: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${eventName}`,
      icon: UberIcon,
      label: "Uber",
      type: "uber",
    },
  ];
}

function getEventDateParts(startDate?: string | null, endDate?: string | null) {
  if (!startDate) {
    return {
      day: "--",
      endTime: "--:--",
      month: "Pronto",
      startTime: "--:--",
    };
  }

  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return {
      day: "--",
      endTime: "--:--",
      month: "Pronto",
      startTime: "--:--",
    };
  }

  const day = new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }).format(start);
  const month = new Intl.DateTimeFormat("es-GT", {
    month: "short",
    timeZone: EVENT_TIME_ZONE,
  })
    .format(start)
    .replace(".", "");
  const timeFormatter = new Intl.DateTimeFormat("es-GT", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  });
  const startTime = timeFormatter.format(start);

  if (!endDate) {
    return {
      day,
      endTime: "--:--",
      month,
      startTime,
    };
  }

  const end = new Date(endDate);

  return {
    day,
    endTime: Number.isNaN(end.getTime()) ? "--:--" : timeFormatter.format(end),
    month,
    startTime,
  };
}

function UberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.79674 6.92303V12.982H4.59704V12.654C4.21727 12.9302 3.75983 13.0769 3.26786 13.0769C1.92143 13.0769 0.9375 12.0671 0.9375 10.6689V6.92303H2.13721V10.6171C2.13721 11.4111 2.64643 11.9722 3.37144 11.9722C4.09644 11.9722 4.5884 11.4025 4.5884 10.6171V6.92303H5.79674Z" />
      <path d="M10.5954 9.07215C10.1639 8.62334 9.57697 8.38167 8.92101 8.38167C8.45494 8.38167 8.00613 8.5284 7.62636 8.80459V6.92303H6.46118V12.982H7.61773V12.654C7.9975 12.9302 8.45494 13.0769 8.9469 13.0769C10.2329 13.0769 11.2773 12.0239 11.2773 10.7207C11.2773 10.1079 11.027 9.5037 10.5954 9.07215ZM10.1207 10.7207C10.1207 11.4284 9.56833 11.9894 8.86923 11.9894C8.17875 11.9808 7.6091 11.4111 7.6091 10.7207C7.6091 10.0302 8.17012 9.45191 8.86923 9.45191C9.56833 9.45191 10.1207 10.0216 10.1207 10.7207Z" />
      <path d="M16.1822 10.7466C16.1822 9.40876 15.2155 8.40757 13.9295 8.40757C12.6435 8.40757 11.625 9.45192 11.625 10.7466C11.625 12.0412 12.6435 13.0769 14.0071 13.0769C14.8098 13.0769 15.4917 12.7403 15.9319 12.1362L16.0354 11.9981L15.1723 11.3507L15.0688 11.4888C14.8012 11.8427 14.456 12.0153 14.0071 12.0153C13.472 12.0153 13.0232 11.6873 12.8506 11.1954H16.1822V10.7466ZM14.9479 10.1942H12.8765C13.0664 9.754 13.4548 9.47781 13.9208 9.47781C14.3869 9.47781 14.7753 9.754 14.9479 10.1942Z" />
      <path d="M19.0624 8.52836V9.65039H18.5531C18.0957 9.65039 17.7936 10.0043 17.7936 10.5307V13.0769H16.6284V8.57152H17.785V8.80455C17.9662 8.66646 18.182 8.58015 18.4323 8.54562V8.52836H19.0624Z" />
    </svg>
  );
}

function WazeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14.5833 8.25829C14.1667 8.25829 13.8333 7.92496 13.8333 7.50829C13.8333 7.09163 14.1667 6.75829 14.5833 6.75829C15 6.75829 15.3333 7.09163 15.3333 7.50829C15.3333 7.93329 15 8.26663 14.5833 8.26663V8.25829ZM9.5 7.50829C9.5 7.08329 9.16666 6.75829 8.75 6.75829C8.33333 6.75829 8 7.09996 8 7.50829C8 7.91663 8.33333 8.25829 8.75 8.25829C9.16666 8.25829 9.5 7.92496 9.5 7.50829ZM15.25 11.1666C15.4333 10.8 15.2833 10.3583 14.9167 10.1666C14.55 9.98329 14.1 10.125 13.9083 10.4916C13.8833 10.5416 13.2333 11.75 11.6583 11.75C10.0833 11.75 9.44166 10.5583 9.40833 10.4916C9.225 10.125 8.775 9.97496 8.40833 10.1583C8.04166 10.3416 7.89166 10.7916 8.075 11.1666C8.11666 11.25 9.14166 13.25 11.6667 13.25C14.1917 13.25 15.2083 11.25 15.25 11.1666ZM16.225 15.4083C16.4583 15.7833 16.5833 16.2166 16.5833 16.6666C16.5833 18 15.5 19.0833 14.1667 19.0833C13.075 19.0833 12.1417 18.35 11.85 17.35C11.5167 17.3916 11.175 17.4166 10.8333 17.4166C10.4917 17.4166 10.15 17.4166 9.8 17.4C9.49166 18.375 8.575 19.0833 7.5 19.0833C6.16666 19.0833 5.08333 18 5.08333 16.6666V16.575C3.14166 15.8333 1.76666 14.575 0.983329 12.8083C0.816663 12.4416 0.974996 12.0083 1.33333 11.8333C2.48333 11.25 2.58333 10.2 2.58333 9.16663C2.58333 4.61663 6.28333 0.916626 10.8333 0.916626C15.3833 0.916626 19.0833 4.61663 19.0833 9.16663C19.0833 11.6583 17.975 13.8916 16.225 15.4083ZM8.41666 16.6666C8.41666 16.1583 8.00833 15.75 7.5 15.75C6.99166 15.75 6.58333 16.1583 6.58333 16.6666C6.58333 17.175 6.99166 17.5833 7.5 17.5833C8.00833 17.5833 8.41666 17.175 8.41666 16.6666ZM15 16.2833C14.9167 16.3333 14.8417 16.375 14.7583 16.4166C14.6417 16.4833 14.525 16.5416 14.4083 16.6C14.0583 16.775 13.6917 16.9166 13.325 17.0333C13.4667 17.3583 13.7917 17.5833 14.1667 17.5833C14.675 17.5833 15.0833 17.175 15.0833 16.6666C15.0833 16.5333 15.0583 16.4083 15 16.2833ZM17.5833 9.16663C17.5833 5.44163 14.5583 2.41663 10.8333 2.41663C7.10833 2.41663 4.08333 5.44163 4.08333 9.16663C4.08333 9.94996 4.08333 11.6666 2.65 12.7666C3.29166 13.8666 4.26666 14.6583 5.6 15.175C6.04166 14.6083 6.73333 14.25 7.5 14.25C8.56666 14.25 9.46666 14.9416 9.79166 15.9C10.15 15.9166 10.5 15.9166 10.8333 15.9166C11.3 15.9166 11.7583 15.8666 12.1917 15.7833L12.3417 15.75C12.4 15.7333 12.4667 15.7166 12.525 15.7C12.6667 15.6666 12.8083 15.625 12.95 15.5833C12.9667 15.575 12.975 15.5666 12.9833 15.5666C13.1417 15.5083 13.3083 15.45 13.4583 15.3833C13.6583 15.3 13.8583 15.2083 14.05 15.1C14.1333 15.0583 14.2083 15.0166 14.2917 14.9666C14.4333 14.8833 14.575 14.7916 14.7083 14.7L14.875 14.575C16.5167 13.3416 17.5833 11.375 17.5833 9.16663Z" />
    </svg>
  );
}
