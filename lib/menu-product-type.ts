/** Categorias de productos de menu alineadas con `MenuProductCategory` del ContentHubApi. */
export const MENU_PRODUCT_TYPES = [
  "HOT_DRINKS",
  "COLD_DRINKS",
  "PLATES",
  "BRUNCH",
  "SEASONAL_FOOD",
  "SEASONAL_DRINK",
  "ESPRESSO",
  "MILK_DRINKS",
  "FILTERED_COFFEE",
  "INFUSION",
  "COLD_BREW",
  "SIGNATURE_DRINKS",
  "NON_COFFEE",
  "STARTERS",
  "SANDWICHES",
  "DESSERTS",
] as const;

export type MenuProductType = (typeof MENU_PRODUCT_TYPES)[number];

export type MenuSection = "DRINKS" | "FOOD";

export const MENU_DRINK_CATEGORIES = [
  "ESPRESSO",
  "MILK_DRINKS",
  "FILTERED_COFFEE",
  "INFUSION",
  "COLD_BREW",
  "HOT_DRINKS",
  "COLD_DRINKS",
  "SIGNATURE_DRINKS",
  "NON_COFFEE",
  "SEASONAL_DRINK",
] as const satisfies readonly MenuProductType[];

export const MENU_FOOD_CATEGORIES = [
  "STARTERS",
  "BRUNCH",
  "PLATES",
  "SANDWICHES",
  "DESSERTS",
  "SEASONAL_FOOD",
] as const satisfies readonly MenuProductType[];

export const MENU_SECTION_LABELS: Record<MenuSection, string> = {
  DRINKS: "Bebidas",
  FOOD: "Comidas",
};

export const DEFAULT_MENU_PRODUCT_TYPE: MenuProductType = "HOT_DRINKS";

export const PRODUCT_TYPES = ["MENU_ITEM", "PACKAGED_COFFEE", "MERCHANDISE", "OTHER"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_MEASUREMENT_UNITS = ["GRAMS", "KILOGRAMS", "MILLILITERS", "LITERS", "UNITS"] as const;
export type ProductMeasurementUnit = (typeof PRODUCT_MEASUREMENT_UNITS)[number];

export const MENU_PRODUCT_TYPE_LABELS: Record<MenuProductType, string> = {
  HOT_DRINKS: "Bebidas calientes",
  COLD_DRINKS: "Bebidas frías",
  PLATES: "Platos",
  BRUNCH: "Brunch",
  SEASONAL_FOOD: "Comida de temporada",
  SEASONAL_DRINK: "Bebida de temporada",
  ESPRESSO: "Espresso",
  MILK_DRINKS: "Bebidas con leche",
  FILTERED_COFFEE: "Café filtrado",
  INFUSION: "Infusiones",
  COLD_BREW: "Cold brew",
  SIGNATURE_DRINKS: "Bebidas de la casa",
  NON_COFFEE: "Sin café",
  STARTERS: "Entradas",
  SANDWICHES: "Sándwiches",
  DESSERTS: "Postres",
};

export function isMenuProductType(value: string | undefined | null): value is MenuProductType {
  return MENU_PRODUCT_TYPES.includes(value as MenuProductType);
}

export function humanizeMenuProductType(type: MenuProductType | string | null | undefined): string {
  if (type && isMenuProductType(type)) {
    return MENU_PRODUCT_TYPE_LABELS[type];
  }

  return "Desconocido";
}

export function getMenuProductSection(type: MenuProductType): MenuSection {
  return (MENU_DRINK_CATEGORIES as readonly MenuProductType[]).includes(type) ? "DRINKS" : "FOOD";
}

export function humanizeMenuSection(section: MenuSection): string {
  return MENU_SECTION_LABELS[section];
}

export function humanizeProductType(type: ProductType | string | null | undefined): string {
  switch (type) {
    case "MENU_ITEM":
      return "Producto de menu";
    case "PACKAGED_COFFEE":
      return "Cafe empacado";
    case "MERCHANDISE":
      return "Mercancia";
    case "OTHER":
      return "Otro";
    default:
      return "Desconocido";
  }
}

export function humanizeProductMeasurementUnit(unit: ProductMeasurementUnit | string | null | undefined): string {
  switch (unit) {
    case "GRAMS":
      return "g";
    case "KILOGRAMS":
      return "kg";
    case "MILLILITERS":
      return "ml";
    case "LITERS":
      return "L";
    case "UNITS":
      return "unidades";
    default:
      return "";
  }
}
