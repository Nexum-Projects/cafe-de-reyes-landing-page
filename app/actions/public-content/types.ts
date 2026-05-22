import type { MenuProductType } from "@/lib/menu-product-type";

export type { MenuProductType };

export type BannerButton = {
  id?: string;
  label: string;
  url: string;
  variant?: "PRIMARY" | "SECONDARY" | null;
  target?: "_self" | "_blank" | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
};

export type Banner = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
  buttons?: BannerButton[];
};

export type MenuProduct = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  type: MenuProductType;
  priceCents?: number | null;
  isAvailable?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

export type EventLocation = {
  id?: string;
  eventId?: string;
  fullAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  startDate?: string;
  endDate?: string | null;
  location?: string | EventLocation | null;
  priceCents?: number | null;
  status?: "ACTIVE" | "CANCELLED" | "FINISHED";
  isActive?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

export type EventOrder = "ASC" | "DESC";

export type AwardOrder = "ASC" | "DESC";

export type Award = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  awardedAt?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

export type MediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  value: string;
  sortOrder?: number;
  isPublic?: boolean;
};

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type OpeningHour = {
  id: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  isPublished?: boolean;
};

export type ActionButtonType = "INSTAGRAM" | "FACEBOOK" | "EMAIL" | "UBER" | "WAZE" | "WHATSAPP";

export type ActionButton = {
  id: string;
  label?: string | null;
  url?: string | null;
  target?: "_self" | "_blank" | null;
  type: ActionButtonType;
  variant?: "PRIMARY" | "SECONDARY" | null;
  value: string;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
};

export type ProjectLocation = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  latitude: number;
  longitude: number;
  fullAddress: string;
  isActive?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectConfig = {
  address?: string | null;
  hours?: string | null;
  instagramUrl?: string | null;
  mapUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  siteName?: string | null;
};

export type DataResponse<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    totalObjects: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type SingleDataResponse<T> = {
  data: T;
};

export type PublicLandingContent = {
  banners: Banner[];
  products: MenuProduct[];
  events: EventItem[];
  awards: Award[];
  media: MediaItem[];
  openingHours: OpeningHour[];
  actionButtons: ActionButton[];
  locations: ProjectLocation[];
  projectConfig: ProjectConfig;
};
