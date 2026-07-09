export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export function hasDisplayablePrice(priceCents?: number | string | null) {
  if (priceCents === null || priceCents === undefined || priceCents === "") {
    return false;
  }

  const cents = typeof priceCents === "number" ? priceCents : Number(priceCents);

  return Number.isFinite(cents) && cents > 0;
}

export function formatPrice(cents?: number | string | null) {
  if (!hasDisplayablePrice(cents)) {
    return null;
  }

  const value = typeof cents === "number" ? cents : Number(cents);

  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Próximamente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Próximamente";
  }

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
