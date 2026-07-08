import type { MenuProduct } from "@/app/actions/public-content/types";
import {
  MENU_DRINK_CATEGORIES,
  MENU_FOOD_CATEGORIES,
  MENU_PRODUCT_TYPES,
  type MenuProductType,
  type MenuSection,
  isMenuProductType,
} from "@/lib/menu-product-type";

function compareBySortOrder(a: MenuProduct, b: MenuProduct) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

const MENU_SECTION_CATEGORIES: Record<MenuSection, readonly MenuProductType[]> = {
  DRINKS: MENU_DRINK_CATEGORIES,
  FOOD: MENU_FOOD_CATEGORIES,
};

export function groupMenuProductsByType(products: MenuProduct[]): Record<MenuProductType, MenuProduct[]> {
  const grouped = Object.fromEntries(
    MENU_PRODUCT_TYPES.map((type) => [type, [] as MenuProduct[]]),
  ) as Record<MenuProductType, MenuProduct[]>;

  for (const product of products) {
    if (product.isPublished === false) {
      continue;
    }

    const category = product.menuCategory ?? (isMenuProductType(product.type) ? product.type : null);
    if (product.type === "MENU_ITEM" && isMenuProductType(category)) {
      grouped[category].push(product);
    }
  }

  for (const type of MENU_PRODUCT_TYPES) {
    grouped[type].sort(compareBySortOrder);
  }

  return grouped;
}

export function getMenuCategoriesWithProducts(
  productsByType: Record<MenuProductType, MenuProduct[]>,
): MenuProductType[] {
  return MENU_PRODUCT_TYPES.filter((type) => productsByType[type].length > 0);
}

export function getMenuCategoriesForSection(
  productsByType: Record<MenuProductType, MenuProduct[]>,
  section: MenuSection,
): MenuProductType[] {
  return MENU_SECTION_CATEGORIES[section].filter((type) => productsByType[type].length > 0);
}

export function getAvailableMenuSections(
  productsByType: Record<MenuProductType, MenuProduct[]>,
): MenuSection[] {
  return (["DRINKS", "FOOD"] as const).filter(
    (section) => getMenuCategoriesForSection(productsByType, section).length > 0,
  );
}

export function hasMenuProducts(productsByType: Record<MenuProductType, MenuProduct[]>): boolean {
  return getMenuCategoriesWithProducts(productsByType).length > 0;
}

export function getInitialMenuSelection(productsByType: Record<MenuProductType, MenuProduct[]>) {
  const sections = getAvailableMenuSections(productsByType);
  const section = sections[0] ?? "DRINKS";
  const categories = getMenuCategoriesForSection(productsByType, section);
  const type = categories[0];

  return {
    section,
    type,
    products: type ? productsByType[type] : [],
  };
}

export function getPackagedCoffeeProducts(products: MenuProduct[]): MenuProduct[] {
  return products
    .filter((product) => product.isPublished !== false && product.type === "PACKAGED_COFFEE")
    .sort(compareBySortOrder);
}
