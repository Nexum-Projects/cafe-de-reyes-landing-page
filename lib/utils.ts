export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(cents?: number | null) {
  if (typeof cents !== "number") {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Proximamente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Proximamente";
  }

  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
