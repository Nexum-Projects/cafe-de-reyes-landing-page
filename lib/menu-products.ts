import type { MenuProduct, ProductCategory } from "@/app/actions/public-content/types";
import {
  getMenuCategorySection,
  getMenuProductSection,
  humanizeMenuProductType,
  isMenuProductType,
  menuCategoryToSlug,
  type MenuSection,
} from "@/lib/menu-product-type";

function compareBySortOrder(a: { sortOrder?: number | null }, b: { sortOrder?: number | null }) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

export function resolveProductCategoryId(product: MenuProduct): string | null {
  return product.categoryId ?? product.category?.id ?? null;
}

function syntheticCategoryFromEnum(menuCategory: MenuProduct["menuCategory"]): ProductCategory | null {
  if (!menuCategory || !isMenuProductType(menuCategory)) {
    return null;
  }

  const slug = menuCategoryToSlug(menuCategory);
  if (!slug) {
    return null;
  }

  return {
    id: `demo-${slug}`,
    name: humanizeMenuProductType(menuCategory),
    slug,
    catalogKind: "MENU_ITEM",
    menuSection: getMenuProductSection(menuCategory),
    isPublished: true,
    sortOrder: 0,
  };
}

export function groupMenuProductsByCategory(
  products: MenuProduct[],
  categories: ProductCategory[],
): {
  categories: ProductCategory[];
  productsByCategoryId: Record<string, MenuProduct[]>;
} {
  const catalog = new Map<string, ProductCategory>();

  for (const category of categories) {
    if (category.isPublished === false) {
      continue;
    }

    catalog.set(category.id, category);
  }

  const productsByCategoryId: Record<string, MenuProduct[]> = {};

  for (const product of products) {
    if (product.isPublished === false || product.type !== "MENU_ITEM") {
      continue;
    }

    let category = product.category ?? null;
    let categoryId = resolveProductCategoryId(product);

    if (!categoryId && product.menuCategory) {
      const slug = menuCategoryToSlug(product.menuCategory);
      const fromCatalog = [...catalog.values()].find((item) => item.slug === slug);
      if (fromCatalog) {
        category = fromCatalog;
        categoryId = fromCatalog.id;
      } else {
        category = syntheticCategoryFromEnum(product.menuCategory);
        categoryId = category?.id ?? null;
      }
    }

    if (!categoryId) {
      continue;
    }

    if (category && !catalog.has(categoryId)) {
      catalog.set(categoryId, category);
    }

    if (!catalog.has(categoryId)) {
      continue;
    }

    productsByCategoryId[categoryId] ??= [];
    productsByCategoryId[categoryId].push(product);
  }

  for (const categoryId of Object.keys(productsByCategoryId)) {
    productsByCategoryId[categoryId].sort(compareBySortOrder);
  }

  const visible = [...catalog.values()]
    .filter((category) => (productsByCategoryId[category.id] ?? []).length > 0)
    .sort(compareBySortOrder);

  return {
    categories: visible,
    productsByCategoryId,
  };
}

export function getMenuCategoriesForSection(
  categories: ProductCategory[],
  section: MenuSection,
): ProductCategory[] {
  return categories.filter((category) => getMenuCategorySection(category.menuSection) === section);
}

export function getAvailableMenuSections(categories: ProductCategory[]): MenuSection[] {
  return (["DRINKS", "FOOD"] as const).filter(
    (section) => getMenuCategoriesForSection(categories, section).length > 0,
  );
}

export function hasMenuProducts(categories: ProductCategory[]): boolean {
  return categories.length > 0;
}

export function getInitialMenuSelection(
  categories: ProductCategory[],
  productsByCategoryId: Record<string, MenuProduct[]>,
) {
  const sections = getAvailableMenuSections(categories);
  const section = sections[0] ?? "DRINKS";
  const sectionCategories = getMenuCategoriesForSection(categories, section);
  const category = sectionCategories[0];

  return {
    section,
    category,
    products: category ? productsByCategoryId[category.id] ?? [] : [],
  };
}

export function getPackagedCoffeeProducts(products: MenuProduct[]): MenuProduct[] {
  return products
    .filter((product) => product.isPublished !== false && product.type === "PACKAGED_COFFEE")
    .sort(compareBySortOrder);
}
