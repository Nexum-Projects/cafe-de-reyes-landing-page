"use client";

import { useEffect, useState } from "react";

import type { OpeningHour } from "@/app/actions/public-content/types";
import {
  getOpeningHourCards,
  getOpeningHoursStatus,
  type OpeningHourCardData,
  type OpeningHoursStatus,
} from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

type OpeningHoursSectionProps = {
  openingHours: OpeningHour[];
};

export function OpeningHoursSection({ openingHours }: OpeningHoursSectionProps) {
  const [status, setStatus] = useState<OpeningHoursStatus>(() => getOpeningHoursStatus(openingHours));
  const [cards, setCards] = useState<OpeningHourCardData[]>(() => getOpeningHourCards(openingHours));

  useEffect(() => {
    const refreshStatus = () => {
      setStatus(getOpeningHoursStatus(openingHours));
      setCards(getOpeningHourCards(openingHours));
    };

    refreshStatus();

    const intervalId = window.setInterval(refreshStatus, 60_000);

    return () => window.clearInterval(intervalId);
  }, [openingHours]);

  if (!cards.length) {
    return null;
  }

  const todaySchedule = cards.find((hour) => hour.day === status.today);
  const statusLabel = getStatusLabel(status);

  return (
    <div className="mt-10">
      <SectionMicroHeading label="Horarios" />

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={cn(
            "inline-flex border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em]",
            status.isOpen
              ? "border-(--negro-profundo) text-(--negro-profundo)"
              : "border-(--linea) text-(--gris-medio)",
          )}
        >
          {statusLabel}
        </span>

        {todaySchedule ? (
          <p className="text-xs uppercase tracking-[0.18em] text-(--gris-oscuro)">
            Hoy · {todaySchedule.open} – {todaySchedule.close}
          </p>
        ) : status.hasSchedule && !status.hasTodaySchedule ? (
          <p className="text-xs uppercase tracking-[0.18em] text-(--gris-medio)">Hoy sin horario publicado</p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((hour) => (
          <OpeningHourCard hour={hour} isToday={hour.day === status.today} key={hour.day} />
        ))}
      </div>
    </div>
  );
}

function OpeningHourCard({ hour, isToday }: { hour: OpeningHourCardData; isToday: boolean }) {
  return (
    <div
      className={cn(
        "border-l pl-3 text-sm transition-colors",
        isToday ? "border-(--negro-profundo) bg-(--negro-profundo)/4 py-3 pr-2" : "border-(--linea)",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.2em]",
          isToday ? "text-(--negro-profundo)" : "text-(--gris-medio)",
        )}
      >
        {hour.dayLabel}
      </p>
      <p className={cn("mt-4", isToday ? "text-(--negro-profundo)" : "text-(--gris-oscuro)")}>{hour.open}</p>
      <p className={cn("mt-1", isToday ? "text-(--negro-profundo)" : "text-(--gris-oscuro)")}>{hour.close}</p>
    </div>
  );
}

function SectionMicroHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-(--negro-profundo)">{label}</p>
      <span className="h-px flex-1 bg-(--linea)" />
    </div>
  );
}

function getStatusLabel(status: OpeningHoursStatus) {
  if (!status.hasTodaySchedule) {
    return "Cerrado hoy";
  }

  return status.isOpen ? "Abierto ahora" : "Cerrado ahora";
}
