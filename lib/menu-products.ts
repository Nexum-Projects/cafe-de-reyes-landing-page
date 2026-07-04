import type { MenuProduct } from "@/app/actions/public-content/types";
import {
  MENU_PRODUCT_TYPES,
  type MenuProductType,
  isMenuProductType,
} from "@/lib/menu-product-type";

function compareBySortOrder(a: MenuProduct, b: MenuProduct) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

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

export function getPackagedCoffeeProducts(products: MenuProduct[]): MenuProduct[] {
  return products
    .filter((product) => product.isPublished !== false && product.type === "PACKAGED_COFFEE")
    .sort(compareBySortOrder);
}
