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
  type: "DRINK" | "FOOD";
  priceCents?: number | null;
  isAvailable?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

export type EventItem = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  startDate?: string;
  endDate?: string | null;
  location?: string | null;
  priceCents?: number | null;
  status?: "ACTIVE" | "CANCELLED" | "FINISHED";
  isActive?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

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
  drinks: MenuProduct[];
  food: MenuProduct[];
  events: EventItem[];
  awards: Award[];
  media: MediaItem[];
  projectConfig: ProjectConfig;
};
