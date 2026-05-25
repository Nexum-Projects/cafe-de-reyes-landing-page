import type { Metadata } from "next";

import type {
  ActionButton,
  OpeningHour,
  PublicLandingContent,
  WeekDay,
} from "@/app/actions/public-content/types";
import { buildActionButtonHref } from "@/lib/action-button-type";
import { env } from "@/utils/env";

const DEFAULT_DESCRIPTION =
  "Cafe de Reyes en Quetzaltenango (Xela). Cafe de especialidad con origen, trazabilidad y hospitalidad en barra.";

const DEFAULT_KEYWORDS = [
  "cafe de reyes",
  "cafe de especialidad",
  "quetzaltenango",
  "xela",
  "guatemala",
  "cafeteria",
  "barra de cafe",
  "cafe guatemala",
];

const SCHEMA_DAYS: Record<WeekDay, string> = {
  FRIDAY: "Friday",
  MONDAY: "Monday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
  THURSDAY: "Thursday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
};

export function getSiteUrl() {
  const configuredUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return configuredUrl.replace(/\/$/, "");
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const siteName = env.NEXT_PUBLIC_SITE_NAME;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} | Cafe de especialidad en Quetzaltenango`,
      template: `%s | ${siteName}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    applicationName: siteName,
    category: "food",
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        {
          url: "/brand/185caa23.png",
          type: "image/png",
        },
      ],
      apple: "/brand/185caa23.png",
      shortcut: "/brand/185caa23.png",
    },
    openGraph: {
      type: "website",
      locale: "es_GT",
      url: siteUrl,
      siteName,
      title: `${siteName} | Cafe de especialidad en Quetzaltenango`,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: "/brand/reyes-logo-full-black.png",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Cafe de especialidad en Quetzaltenango`,
      description: DEFAULT_DESCRIPTION,
      images: ["/brand/reyes-logo-full-black.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function buildLandingMetadata(content: PublicLandingContent): Metadata {
  const siteName = content.projectConfig.siteName ?? env.NEXT_PUBLIC_SITE_NAME;
  const featuredBanner = content.banners.find(
    (banner) => banner.isPublished !== false && banner.isActive !== false,
  );
  const description = getLandingDescription(content, featuredBanner?.description);
  const title = `${siteName} | Cafe de especialidad en Quetzaltenango`;
  const imageUrl = getLandingImage(content, featuredBanner?.imageUrl);

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "es_GT",
      url: getSiteUrl(),
      siteName,
      title,
      description,
      images: imageUrl
        ? [{ url: imageUrl, alt: siteName }]
        : [{ url: "/brand/reyes-logo-full-black.png", alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : ["/brand/reyes-logo-full-black.png"],
    },
  };
}

export function buildLocalBusinessJsonLd(content: PublicLandingContent) {
  const siteName = content.projectConfig.siteName ?? env.NEXT_PUBLIC_SITE_NAME;
  const location =
    content.locations.find((item) => item.isPublished !== false && item.isActive !== false) ??
    content.locations[0];
  const featuredBanner = content.banners.find(
    (banner) => banner.isPublished !== false && banner.isActive !== false,
  );
  const description = getLandingDescription(content, featuredBanner?.description);
  const imageUrl = getLandingImage(content, featuredBanner?.imageUrl);
  const sameAs = getSameAsLinks(content.actionButtons, content.projectConfig.instagramUrl);
  const openingHoursSpecification = getOpeningHoursSpecification(content.openingHours);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: siteName,
    description,
    url: getSiteUrl(),
    image: imageUrl ? [imageUrl] : [`${getSiteUrl()}/brand/reyes-logo-full-black.png`],
    address: {
      "@type": "PostalAddress",
      streetAddress: location?.fullAddress ?? content.projectConfig.address ?? undefined,
      addressLocality: "Quetzaltenango",
      addressRegion: "Quetzaltenango",
      addressCountry: "GT",
    },
    areaServed: {
      "@type": "City",
      name: "Quetzaltenango",
    },
    servesCuisine: "Cafe de especialidad",
  };

  if (location?.latitude !== undefined && location?.longitude !== undefined) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  if (content.projectConfig.phone) {
    jsonLd.telephone = content.projectConfig.phone;
  }

  if (content.projectConfig.email) {
    jsonLd.email = content.projectConfig.email;
  }

  if (sameAs.length) {
    jsonLd.sameAs = sameAs;
  }

  if (openingHoursSpecification.length) {
    jsonLd.openingHoursSpecification = openingHoursSpecification;
  }

  return jsonLd;
}

function getLandingDescription(content: PublicLandingContent, bannerDescription?: string | null) {
  const cleanedBannerDescription = stripHtml(bannerDescription);

  if (cleanedBannerDescription) {
    return cleanedBannerDescription;
  }

  const locationDescription = stripHtml(
    content.locations.find((item) => item.isPublished !== false && item.isActive !== false)?.description,
  );

  if (locationDescription) {
    return locationDescription;
  }

  return DEFAULT_DESCRIPTION;
}

function getLandingImage(content: PublicLandingContent, bannerImageUrl?: string | null) {
  if (bannerImageUrl) {
    return bannerImageUrl;
  }

  const featuredProduct = content.products.find(
    (product) => product.isPublished !== false && product.isFeatured,
  );

  if (featuredProduct?.imageUrl) {
    return featuredProduct.imageUrl;
  }

  const publicImage = content.media.find((item) => item.type === "IMAGE" && item.isPublic !== false);

  return publicImage?.value ?? null;
}

function getSameAsLinks(actionButtons: ActionButton[], instagramUrl?: string | null) {
  const links = new Set<string>();

  if (instagramUrl) {
    links.add(instagramUrl);
  }

  for (const action of actionButtons) {
    if (action.isActive === false || action.isPublished === false) {
      continue;
    }

    if (action.type === "EMAIL" || action.type === "WHATSAPP") {
      continue;
    }

    const href = buildActionButtonHref(action.type, action.url ?? action.value);

    if (href?.startsWith("http")) {
      links.add(href);
    }
  }

  return [...links];
}

function getOpeningHoursSpecification(openingHours: OpeningHour[]) {
  return openingHours
    .filter((hour) => hour.isActive !== false && hour.isPublished !== false)
    .map((hour) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[hour.day],
      opens: normalizeSchemaTime(hour.startTime),
      closes: normalizeSchemaTime(hour.endTime),
    }));
}

function normalizeSchemaTime(value: string) {
  const [hourValue, minuteValue] = value.split(":");

  if (!hourValue || !minuteValue) {
    return value;
  }

  return `${hourValue.padStart(2, "0")}:${minuteValue.padStart(2, "0")}`;
}

function stripHtml(value?: string | null) {
  return value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}
