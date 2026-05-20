"use server";

import { env } from "@/utils/env";

import type {
  Award,
  Banner,
  DataResponse,
  EventItem,
  MediaItem,
  MenuProduct,
  ProjectConfig,
  PublicLandingContent,
  SingleDataResponse,
} from "./types";

type PublicResource = "banners" | "menu-products" | "events" | "awards" | "media";

function buildUrl(path: string, params?: Record<string, string | number | boolean>) {
  const url = new URL(`${env.NEXT_PUBLIC_API_URL}${path}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url;
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function getPublicListOrder(resource: PublicResource): { orderBy: string; order: "ASC" | "DESC" } {
  if (resource === "events") {
    return { orderBy: "startDate", order: "ASC" };
  }

  if (resource === "awards") {
    return { orderBy: "awardedAt", order: "DESC" };
  }

  return { orderBy: "sortOrder", order: "ASC" };
}

async function fetchPublicList<T>(
  projectId: string,
  resource: PublicResource,
  params?: Record<string, string | number | boolean>,
) {
  const { orderBy, order } = getPublicListOrder(resource);

  const response = await fetchJson<DataResponse<T>>(
    buildUrl(`/public/projects/${projectId}/${resource}`, {
      pagination: false,
      orderBy,
      order,
      ...params,
    }),
  );

  return response.data ?? [];
}

async function fetchProjectConfig(projectId: string): Promise<ProjectConfig> {
  try {
    const response = await fetchJson<SingleDataResponse<ProjectConfig>>(
      buildUrl(`/public/projects/${projectId}/configuration`),
    );

    return response.data ?? {};
  } catch {
    return {};
  }
}

export async function getPublicLandingContent(projectId = env.NEXT_PUBLIC_PROJECT_ID): Promise<{
  data: PublicLandingContent;
  error?: string;
  missingProjectId?: boolean;
}> {
  if (!projectId) {
    return {
      data: fallbackContent,
      error: "Configura NEXT_PUBLIC_PROJECT_ID para consumir el contenido real del CMS.",
      missingProjectId: true,
    };
  }

  try {
    const [banners, products, events, awards, media, projectConfig] = await Promise.all([
      fetchPublicList<Banner>(projectId, "banners"),
      fetchPublicList<MenuProduct>(projectId, "menu-products"),
      fetchPublicList<EventItem>(projectId, "events"),
      fetchPublicList<Award>(projectId, "awards"),
      fetchPublicList<MediaItem>(projectId, "media", { isPublic: true }),
      fetchProjectConfig(projectId),
    ]);

    return {
      data: {
        banners,
        products,
        events,
        awards,
        media,
        projectConfig,
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo conectar con el API publico.";

    return {
      data: fallbackContent,
      error: `Mostrando contenido demo porque el API no respondio: ${detail}`,
    };
  }
}

const fallbackContent: PublicLandingContent = {
  banners: [
    {
      id: "demo-banner",
      title: "Cafe con nombre, apellido y direccion.",
      description:
        "Desde Quetzaltenango, una barra de especialidad donde el origen se revela taza por taza.",
      imageUrl:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1800&q=88",
      buttons: [
        { label: "Ver menu", url: "#menu", variant: "PRIMARY" },
        { label: "Como llegar", url: "#visitanos", variant: "SECONDARY" },
      ],
    },
  ],
  products: [
    {
      id: "hot-1",
      name: "Filtro Xela",
      description: "Lote de altura con lectura limpia, dulzor medio y final persistente.",
      type: "HOT_DRINKS",
      sortOrder: 1,
      priceCents: 3200,
      imageUrl:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isFeatured: true,
      isPublished: true,
    },
    {
      id: "hot-2",
      name: "Espresso de origen",
      description: "Extraccion precisa para revelar proceso, varietal y memoria del lote.",
      type: "HOT_DRINKS",
      sortOrder: 2,
      priceCents: 3600,
      imageUrl:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
    {
      id: "cold-1",
      name: "Cold brew de temporada",
      description: "Extraccion en frio, cuerpo suave y notas de cacao.",
      type: "COLD_DRINKS",
      sortOrder: 1,
      priceCents: 3400,
      imageUrl:
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
    {
      id: "plate-1",
      name: "Tostada de temporada",
      description: "Pan artesanal, producto local y una composicion pensada para acompanar la taza.",
      type: "PLATES",
      sortOrder: 1,
      priceCents: 5400,
      imageUrl:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
    {
      id: "brunch-1",
      name: "Brunch de barra",
      description: "Huevos, pan de masa madre y acompanamiento de temporada.",
      type: "BRUNCH",
      sortOrder: 1,
      priceCents: 6800,
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
  ],
  events: [
    {
      id: "event-1",
      title: "Cata de microlotes",
      description:
        "Una lectura guiada por perfiles de tueste, aromas, procesos y metodos de preparacion.",
      imageUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=86",
      startDate: new Date().toISOString(),
      location: "Barra principal",
      isActive: true,
      isPublished: true,
    },
  ],
  awards: [
    {
      id: "award-1",
      title: "Top 100 mundial",
      description:
        "Un reconocimiento presentado como consecuencia del trabajo: origen, consistencia y criterio sostenido.",
      sourceName: "Guia internacional",
      awardedAt: new Date().toISOString(),
      isFeatured: true,
      isPublished: true,
    },
  ],
  media: [
    {
      id: "media-1",
      type: "IMAGE",
      value: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=86",
      isPublic: true,
    },
    {
      id: "media-2",
      type: "IMAGE",
      value: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=86",
      isPublic: true,
    },
    {
      id: "media-3",
      type: "IMAGE",
      value: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=86",
      isPublic: true,
    },
    {
      id: "media-4",
      type: "IMAGE",
      value: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=86",
      isPublic: true,
    },
  ],
  projectConfig: {
    address: "Quetzaltenango, Guatemala",
    hours: "Horarios publicados desde configuracion del proyecto",
    instagramUrl: "https://www.instagram.com/",
    mapUrl: "https://maps.google.com/?q=Quetzaltenango%20Guatemala",
    siteName: "Cafe de Reyes",
  },
};
