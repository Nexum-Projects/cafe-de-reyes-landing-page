# Categorías dinámicas en la landing — plan de implementación

**Versión:** `v1.1`  
**Fecha:** 2026-09-13  
**Ambiente:** cafe-de-reyes-landing-page, rama `feature/dynamic-product-categories`  
**Dirigido a:** equipo de desarrollo Content Hub

> **Para agentes:** implementar este plan tarea por tarea. No tocar API ni
> CMS en esta entrega. El contrato público ya está en
> `content-hub-api` PR #1.

**Goal:** El menú de la landing agrupa por categorías públicas del API
(`categoryId` / `sortOrder` / `name`), no por el enum
`MENU_PRODUCT_TYPES`.

**Architecture:** Un GET extra de categorías y un GET de productos. El
carrusel arma las tabs con `category.name`. Bebidas/Comidas se
conservan mapeando el `slug` seed (`hot-drinks`, `espresso`, …). Las
categorías nuevas van a la sección **Más**.

**Tech Stack:** Next.js App Router, server actions, `fetch` público.
API: `/api/public/projects/{projectId}/product-categories` y
`/api/public/projects/{projectId}/menu-products`.

**Spec:** este documento + plan API
`content-hub-api@feature/dynamic-product-categories:docs/plans/2026-09-13-categorias-productos-dinamicas.md` §7.9 y §9.

## Global Constraints

- No inventar endpoints. Solo GET público.
- Filtrar productos por `categoryId`. Dejar de enviar `menuCategory`.
- `menuCategory` queda solo como fallback de lectura del demo estático.
- No mostrar categoría pública sin al menos un producto publicado.
- No agregar bloque de mercancía: la landing no tiene esa sección.
- Café empacado no cambia: sigue filtrando `type=PACKAGED_COFFEE`.
- No commitear `.env` ni `.DS_Store`.

---

## 1. Por qué falla hoy

La landing **no rompe** contra el API nuevo: `menuCategory` sigue en
lectura y el filtro `?menuCategory=HOT_DRINKS` sigue en 200.

Lo que falla es el modelo de agrupación:

1. `groupMenuProductsByType` solo mete un producto si
   `product.menuCategory` está en el enum. Un producto con
   `categoryId` y `menuCategory` null desaparece.
2. Las tabs salen de `MENU_PRODUCT_TYPES` / `MENU_DRINK_CATEGORIES` /
   `MENU_FOOD_CATEGORIES`. Una categoría creada en el CMS (por ejemplo
   “Bebidas de octubre”) nunca aparece.
3. `getPublicMenuProducts` pide `menuCategory: type`. Eso no lista
   productos de una categoría dinámica.
4. `humanizeMenuProductType` devuelve `"Desconocido"` si el valor no
   es del enum. El nombre real vive en `category.name`.

El repo git de la landing es
`front/cafe-de-reyes-landing-page/cafe-de-reyes-landing-page`.
La carpeta `cms/` no es un repo: crear la rama desde esa raíz falla
con `fatal: not a git repository`.

---

## 2. Contrato que consume la landing

```
GET /api/public/projects/{projectId}/product-categories
    ?pagination=false
    &orderBy=sortOrder
    &order=ASC
    &catalogKind=MENU_ITEM

GET /api/public/projects/{projectId}/menu-products
    ?pagination=false
    &orderBy=sortOrder
    &order=ASC
    &type=MENU_ITEM
    &categoryId={uuid}
```

El listado inicial de la home puede seguir siendo un solo
`GET .../menu-products` (todos los tipos) y agrupar en cliente.

Producto público (ya verificado en local, 2026-09-13):

```json
{
  "id": "84361ead-2431-4159-a546-6bd1f50c7333",
  "name": "Americano",
  "type": "MENU_ITEM",
  "menuCategory": "HOT_DRINKS",
  "categoryId": "77259b3c-96e9-4e47-9528-50a3235874fa",
  "category": {
    "id": "77259b3c-96e9-4e47-9528-50a3235874fa",
    "name": "Bebidas calientes",
    "slug": "hot-drinks",
    "catalogKind": "MENU_ITEM",
    "sortOrder": 0,
    "isPublished": true
  }
}
```

Ignorar `hibernateLazyInitializer` si viene en `category`.

Categoría pública:

```json
{
  "id": "77259b3c-96e9-4e47-9528-50a3235874fa",
  "name": "Bebidas calientes",
  "slug": "hot-drinks",
  "catalogKind": "MENU_ITEM",
  "sortOrder": 0,
  "isPublished": true
}
```

Proyecto local de evidencia: `ddfdb0ca-686c-4186-8781-f6af6abdc5df`.

---

## 3. Decisión de UX

| Opción | Qué hace | Contra |
|--------|----------|--------|
| A. Una sola fila de tabs | Solo `category.name` en `sortOrder` | Se pierde Bebidas/Comidas |
| B. Slug seed + sección Más | Conserva las dos tabs; slugs nuevos van a Más | Una sección extra si hay temporada |
| C. Cambiar el API | Campo `section` DRINKS/FOOD | Fuera de este PR |

**Se elige B.** Los 16 slugs seed (`hot-drinks` … `desserts`) siguen
en Bebidas o Comidas. Cualquier otro slug publicado con productos va
a **Más**.

Mapa local (slug → sección):

- Bebidas: `espresso`, `milk-drinks`, `filtered-coffee`, `infusion`,
  `cold-brew`, `hot-drinks`, `cold-drinks`, `signature-drinks`,
  `non-coffee`, `seasonal-drink`
- Comidas: `starters`, `brunch`, `plates`, `sandwiches`, `desserts`,
  `seasonal-food`

No inferir sección por el nombre. No tocar el API.

---

## 4. Archivos

| Acción | Ruta |
|--------|------|
| Crear | `docs/README.md` |
| Crear | `docs/plans/2026-09-13-landing-categorias-productos-dinamicas.md` |
| Modificar | `app/actions/public-content/types.ts` — `ProductCategory`, `categoryId` / `category` en producto, `categories` en el payload de landing |
| Modificar | `app/actions/public-content/index.ts` — GET categorías; filtro `categoryId`; demo con categorías seed |
| Modificar | `lib/menu-products.ts` — agrupar por `categoryId`; tabs desde categorías públicas |
| Modificar | `lib/menu-product-type.ts` — mapa slug → sección; enum solo para demo/fallback |
| Modificar | `components/landing/menu-carousel.tsx` — tabs por categoría (`id` + `name`) |
| Modificar | `components/landing/public-landing.tsx` — pasar categorías al carrusel |
| Modificar | `package.json` — versión `0.1.0` → `0.2.0` |

---

## 5. Tareas

### Task 1: Tipos y fetch público

- [x] Tipo `ProductCategory` (`id`, `name`, `slug`, `catalogKind`,
      `sortOrder`, `isPublished`).
- [x] `MenuProduct.categoryId` y `MenuProduct.category`.
- [x] `PublicResource` incluye `"product-categories"`.
- [x] Fetch de categorías en `getPublicLandingContent`.
- [x] `getPublicMenuProducts(categoryId, query)` envía `categoryId`,
      no `menuCategory`.

### Task 2: Agrupación

- [x] `groupMenuProductsByCategory(products, categories)`: solo
      categorías publicadas con ≥1 producto `MENU_ITEM` publicado.
- [x] Orden de tabs = `category.sortOrder`, no el enum.
- [x] Label = `category.name`. Fallback: `menuCategory` del demo.
- [x] `getMenuCategoriesForSection` usa el mapa de slugs + **Más**.

### Task 3: Carrusel

- [x] Estado activo es `categoryId` (UUID), no `MenuProductType`.
- [x] Click de tab llama `getPublicMenuProducts(categoryId, query)`.
- [x] Demo estático: categorías seed con los mismos slugs/nombres
      actuales para no romper el fallback sin API.

### Task 4: Fuera de alcance

- Mercancía / bloque `catalogKind=MERCHANDISE`.
- Quitar el enum del API.
- Campo `section` en `ProductCategory`.
- Landing en otro idioma o rediseño visual.

---

## 6. Validación

```bash
cd /Users/danieltistoj/Documents/trabajo/cafe-de-reyes/cms/front/cafe-de-reyes-landing-page/cafe-de-reyes-landing-page
yarn lint
yarn build
yarn dev   # puerto distinto de 3000 si el CMS ya lo usa
```

En el browser, contra API local (`:8080`) y proyecto
`ddfdb0ca-686c-4186-8781-f6af6abdc5df`:

1. Tabs del menú usan nombres del API (Bebidas calientes, Espresso, …).
2. Cambiar de tab lista productos de esa `categoryId`.
3. Una categoría nueva publicada con producto `MENU_ITEM` aparece en
   **Más**.
4. Categoría publicada sin productos no aparece.
5. Sin API: se ve el menú demo, no un crash.

---

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| `v1.1` | 2026-09-13 | Implementado en landing. App `0.2.0`. |
| `v1.0` | 2026-09-13 | Plan inicial: GET público, agrupar por `categoryId`, tabs por `name`, sección Más para slugs nuevos |
