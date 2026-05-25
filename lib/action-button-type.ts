/** Alineado con `com.contenthub_api.ContentHubApi.enums.ActionButtonType`. */
export const ACTION_BUTTON_TYPES = [
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "YOUTUBE",
  "WHATSAPP",
  "X",
  "LINKEDIN",
  "THREADS",
  "PINTEREST",
  "SNAPCHAT",
  "EMAIL",
] as const;

export type ActionButtonType = (typeof ACTION_BUTTON_TYPES)[number];

export const ACTION_BUTTON_SOCIAL_TYPES = ACTION_BUTTON_TYPES.filter(
  (type): type is Exclude<ActionButtonType, "EMAIL" | "WHATSAPP"> => type !== "EMAIL" && type !== "WHATSAPP",
);

export const ACTION_BUTTON_TYPE_LABELS: Record<ActionButtonType, string> = {
  EMAIL: "Correo",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  PINTEREST: "Pinterest",
  SNAPCHAT: "Snapchat",
  THREADS: "Threads",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  X: "X",
  YOUTUBE: "YouTube",
};

export function isActionButtonType(value: string | undefined | null): value is ActionButtonType {
  return ACTION_BUTTON_TYPES.includes(value as ActionButtonType);
}

export function humanizeActionButtonType(type: ActionButtonType | string | null | undefined): string {
  if (type && isActionButtonType(type)) {
    return ACTION_BUTTON_TYPE_LABELS[type];
  }

  return "Desconocido";
}

export function buildActionButtonHref(type: ActionButtonType, value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (type === "EMAIL") {
    return trimmedValue.startsWith("mailto:") ? trimmedValue : `mailto:${trimmedValue}`;
  }

  if (type === "WHATSAPP") {
    if (trimmedValue.startsWith("http")) {
      return trimmedValue;
    }

    const digits = trimmedValue.replace(/\D/g, "");

    return digits ? `https://wa.me/${digits}` : trimmedValue;
  }

  if (trimmedValue.startsWith("http")) {
    return trimmedValue;
  }

  const handle = trimmedValue.replace(/^@/, "");

  switch (type) {
    case "INSTAGRAM":
      return `https://www.instagram.com/${handle}`;
    case "FACEBOOK":
      return `https://www.facebook.com/${handle}`;
    case "TIKTOK":
      return `https://www.tiktok.com/@${handle}`;
    case "YOUTUBE":
      return `https://www.youtube.com/@${handle}`;
    case "X":
      return `https://x.com/${handle}`;
    case "LINKEDIN":
      return `https://www.linkedin.com/in/${handle}`;
    case "THREADS":
      return `https://www.threads.net/@${handle}`;
    case "PINTEREST":
      return `https://www.pinterest.com/${handle}`;
    case "SNAPCHAT":
      return `https://www.snapchat.com/add/${handle}`;
    default:
      return trimmedValue;
  }
}
