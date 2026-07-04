import type { OpeningHour, WeekDay } from "@/app/actions/public-content/types";

const GUATEMALA_TIME_ZONE = "America/Guatemala";

const WEEK_DAYS: WeekDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  FRIDAY: "Vie",
  MONDAY: "Lun",
  SATURDAY: "Sab",
  SUNDAY: "Dom",
  THURSDAY: "Jue",
  TUESDAY: "Mar",
  WEDNESDAY: "Mie",
};

export type OpeningHourCardData = {
  close: string;
  day: WeekDay;
  dayLabel: string;
  endTime: string;
  open: string;
  startTime: string;
};

export type OpeningHoursStatus = {
  hasSchedule: boolean;
  hasTodaySchedule: boolean;
  isOpen: boolean;
  today: WeekDay;
};

export function getOpeningHourCards(openingHours: OpeningHour[]): OpeningHourCardData[] {
  return openingHours
    .filter((hour) => hour.isActive !== false && hour.isPublished !== false)
    .sort((first, second) => getWeekDayIndex(first.day) - getWeekDayIndex(second.day))
    .map((hour) => ({
      close: formatTime(hour.endTime),
      day: hour.day,
      dayLabel: getWeekDayShortLabel(hour.day),
      endTime: hour.endTime,
      open: formatTime(hour.startTime),
      startTime: hour.startTime,
    }));
}

export function getOpeningHoursStatus(
  openingHours: OpeningHour[],
  referenceDate = new Date(),
): OpeningHoursStatus {
  const cards = getOpeningHourCards(openingHours);
  const today = getCurrentWeekDay(referenceDate);
  const todaySchedule = cards.find((card) => card.day === today);

  if (!cards.length) {
    return {
      hasSchedule: false,
      hasTodaySchedule: false,
      isOpen: false,
      today,
    };
  }

  if (!todaySchedule) {
    return {
      hasSchedule: true,
      hasTodaySchedule: false,
      isOpen: false,
      today,
    };
  }

  return {
    hasSchedule: true,
    hasTodaySchedule: true,
    isOpen: isOpenAtTime(todaySchedule.startTime, todaySchedule.endTime, referenceDate),
    today,
  };
}

export function isOpenAtTime(startTime: string, endTime: string, referenceDate = new Date()) {
  const currentMinutes = getMinutesInTimeZone(referenceDate, GUATEMALA_TIME_ZONE);
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || currentMinutes === null) {
    return false;
  }

  if (endMinutes > startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function getCurrentWeekDay(referenceDate: Date): WeekDay {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: GUATEMALA_TIME_ZONE,
    weekday: "long",
  }).format(referenceDate);

  const map: Record<string, WeekDay> = {
    Friday: "FRIDAY",
    Monday: "MONDAY",
    Saturday: "SATURDAY",
    Sunday: "SUNDAY",
    Thursday: "THURSDAY",
    Tuesday: "TUESDAY",
    Wednesday: "WEDNESDAY",
  };

  return map[weekday] ?? "MONDAY";
}

function getMinutesInTimeZone(referenceDate: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(referenceDate);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? NaN);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? NaN);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function parseTimeToMinutes(value: string) {
  const [hourValue, minuteValue] = value.split(":");

  if (!hourValue || minuteValue === undefined) {
    return null;
  }

  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function getWeekDayIndex(day: WeekDay) {
  return WEEK_DAYS.indexOf(day);
}

function getWeekDayShortLabel(day: WeekDay) {
  return WEEK_DAY_LABELS[day];
}

function formatTime(value: string) {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
