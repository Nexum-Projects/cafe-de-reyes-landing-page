"use server";

import { env } from "@/utils/env";

import type {
  ActionButton,
  Award,
  AwardOrder,
  Banner,
  DataResponse,
  EventItem,
  EventOrder,
  MediaItem,
  MenuProduct,
  MenuProductType,
  OpeningHour,
  ProjectConfig,
  ProjectLocation,
  PublicLandingContent,
  SingleDataResponse,
} from "./types";

type PublicResource =
  | "banners"
  | "menu-products"
  | "events"
  | "awards"
  | "media"
  | "opening-hours"
  | "action-buttons"
  | "locations";

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
    return { orderBy: "startDate", order: "DESC" };
  }

  if (resource === "awards") {
    return { orderBy: "awardedAt", order: "DESC" };
  }

  if (resource === "opening-hours") {
    return { orderBy: "day", order: "ASC" };
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

function sortFallbackEvents(events: EventItem[], order: EventOrder) {
  return [...events].sort((a, b) => {
    const first = a.startDate ? new Date(a.startDate).getTime() : 0;
    const second = b.startDate ? new Date(b.startDate).getTime() : 0;

    return order === "ASC" ? first - second : second - first;
  });
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

function filterFallbackEventsByQuery(events: EventItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return events;
  }

  return events.filter((event) =>
    [event.title, event.description, getEventLocationLabel(event.location)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

function sortFallbackMenuProducts(products: MenuProduct[]) {
  return [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function filterFallbackMenuProductsByQuery(products: MenuProduct[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

function sortFallbackAwards(awards: Award[], order: AwardOrder) {
  return [...awards].sort((a, b) => {
    const first = a.awardedAt ? new Date(a.awardedAt).getTime() : 0;
    const second = b.awardedAt ? new Date(b.awardedAt).getTime() : 0;

    return order === "ASC" ? first - second : second - first;
  });
}

function filterFallbackAwardsByQuery(awards: Award[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return awards;
  }

  return awards.filter((award) =>
    [award.title, award.description, award.sourceName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

export async function getPublicMenuProducts(
  type: MenuProductType,
  query = "",
  projectId = env.NEXT_PUBLIC_PROJECT_ID,
): Promise<{
  data: MenuProduct[];
  error?: string;
  missingProjectId?: boolean;
}> {
  const normalizedQuery = query.trim();
  const fallbackProducts = filterFallbackMenuProductsByQuery(
    sortFallbackMenuProducts(
      fallbackContent.products.filter((product) => product.type === "MENU_ITEM" && product.menuCategory === type),
    ),
    normalizedQuery,
  );

  if (!projectId) {
    return {
      data: fallbackProducts,
      error: "Configura NEXT_PUBLIC_PROJECT_ID para consumir productos reales del CMS.",
      missingProjectId: true,
    };
  }

  try {
    const products = await fetchPublicList<MenuProduct>(projectId, "menu-products", {
      type: "MENU_ITEM",
      menuCategory: type,
      ...(normalizedQuery ? { query: normalizedQuery } : {}),
    });

    return { data: products };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo conectar con la API pública.";

    return {
      data: fallbackProducts,
      error: `Mostrando productos demo porque la API no respondió: ${detail}`,
    };
  }
}

export async function getPublicPackagedCoffeeProducts(
  query = "",
  projectId = env.NEXT_PUBLIC_PROJECT_ID,
): Promise<{
  data: MenuProduct[];
  error?: string;
  missingProjectId?: boolean;
}> {
  const normalizedQuery = query.trim();
  const fallbackProducts = filterFallbackMenuProductsByQuery(
    sortFallbackMenuProducts(
      fallbackContent.products.filter((product) => product.type === "PACKAGED_COFFEE"),
    ),
    normalizedQuery,
  );

  if (!projectId) {
    return {
      data: fallbackProducts,
      error: "Configura NEXT_PUBLIC_PROJECT_ID para consumir cafés empacados reales del CMS.",
      missingProjectId: true,
    };
  }

  try {
    const products = await fetchPublicList<MenuProduct>(projectId, "menu-products", {
      type: "PACKAGED_COFFEE",
      ...(normalizedQuery ? { query: normalizedQuery } : {}),
    });

    return { data: products };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo conectar con la API pública.";

    return {
      data: fallbackProducts,
      error: `Mostrando cafés demo porque la API no respondió: ${detail}`,
    };
  }
}

export async function getPublicAwards(
  order: AwardOrder = "DESC",
  query = "",
  projectId = env.NEXT_PUBLIC_PROJECT_ID,
): Promise<{
  data: Award[];
  error?: string;
  missingProjectId?: boolean;
}> {
  const normalizedQuery = query.trim();
  const fallbackAwards = filterFallbackAwardsByQuery(
    sortFallbackAwards(fallbackContent.awards, order),
    normalizedQuery,
  );

  if (!projectId) {
    return {
      data: fallbackAwards,
      error: "Configura NEXT_PUBLIC_PROJECT_ID para consumir logros reales del CMS.",
      missingProjectId: true,
    };
  }

  try {
    const awards = await fetchPublicList<Award>(projectId, "awards", {
      orderBy: "awardedAt",
      order,
      ...(normalizedQuery ? { query: normalizedQuery } : {}),
    });

    return { data: awards };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo conectar con la API pública.";

    return {
      data: fallbackAwards,
      error: `Mostrando logros demo porque la API no respondió: ${detail}`,
    };
  }
}

export async function getPublicEvents(
  order: EventOrder = "DESC",
  query = "",
  projectId = env.NEXT_PUBLIC_PROJECT_ID,
): Promise<{
  data: EventItem[];
  error?: string;
  missingProjectId?: boolean;
}> {
  const normalizedQuery = query.trim();
  const fallbackEvents = filterFallbackEventsByQuery(
    sortFallbackEvents(fallbackContent.events, order),
    normalizedQuery,
  );

  if (!projectId) {
    return {
      data: fallbackEvents,
      error: "Configura NEXT_PUBLIC_PROJECT_ID para consumir eventos reales del CMS.",
      missingProjectId: true,
    };
  }

  try {
    const events = await fetchPublicList<EventItem>(projectId, "events", {
      orderBy: "startDate",
      order,
      ...(normalizedQuery ? { query: normalizedQuery } : {}),
    });

    return { data: events };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo conectar con la API pública.";

    return {
      data: fallbackEvents,
      error: `Mostrando eventos demo porque la API no respondió: ${detail}`,
    };
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
    const [banners, products, events, awards, media, openingHours, actionButtons, locations, projectConfig] = await Promise.all([
      fetchPublicList<Banner>(projectId, "banners"),
      fetchPublicList<MenuProduct>(projectId, "menu-products"),
      fetchPublicList<EventItem>(projectId, "events"),
      fetchPublicList<Award>(projectId, "awards"),
      fetchPublicList<MediaItem>(projectId, "media", { isPublic: true }),
      fetchPublicList<OpeningHour>(projectId, "opening-hours", { isPublished: true }),
      fetchPublicList<ActionButton>(projectId, "action-buttons", { isPublished: true }),
      fetchPublicList<ProjectLocation>(projectId, "locations", { isPublished: true }),
      fetchProjectConfig(projectId),
    ]);

    return {
      data: {
        banners,
        products,
        events,
        awards,
        media,
        openingHours,
        actionButtons,
        locations,
        projectConfig,
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo conectar con la API pública.";

    return {
      data: fallbackContent,
      error: `Mostrando contenido demo porque la API no respondió: ${detail}`,
    };
  }
}

const fallbackContent: PublicLandingContent = {
  banners: [
    {
      id: "demo-banner",
      title: "Café con nombre, apellido y dirección.",
      description:
        "Desde Quetzaltenango, una barra de especialidad donde el origen se revela taza por taza.",
      imageUrl:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1800&q=88",
      buttons: [
        { label: "Ver menú", url: "#menu", variant: "PRIMARY" },
        { label: "Cómo llegar", url: "#visitanos", variant: "SECONDARY" },
      ],
    },
  ],
  products: [
    {
      id: "hot-1",
      name: "Filtro Xela",
      description: "Lote de altura con lectura limpia, dulzor medio y final persistente.",
      type: "MENU_ITEM",
      menuCategory: "HOT_DRINKS",
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
      description: "Extracción precisa para revelar proceso, varietal y memoria del lote.",
      type: "MENU_ITEM",
      menuCategory: "ESPRESSO",
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
      description: "Extracción en frío, cuerpo suave y notas de cacao.",
      type: "MENU_ITEM",
      menuCategory: "COLD_BREW",
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
      description: "Pan artesanal, producto local y una composición pensada para acompañar la taza.",
      type: "MENU_ITEM",
      menuCategory: "PLATES",
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
      description: "Huevos, pan de masa madre y acompañamiento de temporada.",
      type: "MENU_ITEM",
      menuCategory: "BRUNCH",
      sortOrder: 1,
      priceCents: 6800,
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
    {
      id: "packaged-1",
      name: "Lote Xela de temporada",
      description: "Café tostado por Diego con perfil dulce, acidez limpia y lectura clara del origen.",
      type: "PACKAGED_COFFEE",
      sortOrder: 1,
      measurementValue: 340,
      measurementUnit: "GRAMS",
      priceCents: 9500,
      imageUrl:
        "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isFeatured: true,
      isPublished: true,
    },
    {
      id: "packaged-2",
      name: "Microlote lavado",
      description: "Una selección de temporada catada antes de salir a la venta en la barra.",
      type: "PACKAGED_COFFEE",
      sortOrder: 2,
      measurementValue: 250,
      measurementUnit: "GRAMS",
      priceCents: 8200,
      imageUrl:
        "https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
    {
      id: "packaged-3",
      name: "Tueste para filtro",
      description: "Café empacado para preparar en casa sin perder la lectura del lote.",
      type: "PACKAGED_COFFEE",
      sortOrder: 3,
      measurementValue: 1,
      measurementUnit: "KILOGRAMS",
      priceCents: 18500,
      imageUrl:
        "https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=900&q=86",
      isAvailable: true,
      isPublished: true,
    },
  ],
  events: [
    {
      id: "event-1",
      title: "Cata de microlotes",
      description:
        "Una lectura guiada por perfiles de tueste, aromas, procesos y métodos de preparación.",
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
      sourceName: "Guía internacional",
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
  openingHours: [],
  actionButtons: [],
  locations: [
    {
      id: "location-1",
      title: "Barra de Xela",
      description: "La barra abierta donde origen, técnica y hospitalidad se encuentran.",
      fullAddress: "Quetzaltenango, Guatemala",
      imageUrl:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=88",
      isActive: true,
      isPublished: true,
      latitude: 14.8451374,
      longitude: -91.5173042,
      sortOrder: 0,
    },
  ],
  projectConfig: {
    address: "Guatemala, Quetzaltenango, Quetzaltenango",
    hours: "Horarios publicados desde configuración del proyecto",
    instagramUrl: "https://www.instagram.com/",
    mapUrl: "https://maps.google.com/?q=Quetzaltenango%20Guatemala",
    siteName: "Café de Reyes",
  },
};
