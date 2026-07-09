import { Sprout } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import type {
  ActionButton,
  ActionButtonType,
  ProjectLocation,
  PublicLandingContent,
} from "@/app/actions/public-content/types";
import { ActionButtonIcon } from "@/components/landing/action-button-icon";
import { BannerCarousel } from "@/components/landing/banner-carousel";
import { BrandButtonLink } from "@/components/landing/brand-button";
import { EventsCarousel } from "@/components/landing/events-carousel";
import { GalleryCarousel } from "@/components/landing/gallery-carousel";
import { LocationsCarousel } from "@/components/landing/locations-carousel";
import { MenuCarousel, MenuEmptyState } from "@/components/landing/menu-carousel";
import { MotionSection } from "@/components/landing/motion-shell";
import { OpeningHoursSection } from "@/components/landing/opening-hours-section";
import { PackagedCoffeeCarousel, PackagedCoffeeEmptyState } from "@/components/landing/packaged-coffee-carousel";
import { SiteHeader } from "@/components/landing/site-header";
import { buildActionButtonHref, humanizeActionButtonType } from "@/lib/action-button-type";
import { getPackagedCoffeeProducts, groupMenuProductsByType, hasMenuProducts } from "@/lib/menu-products";
import { cn } from "@/lib/utils";
import { env } from "@/utils/env";
import { AwardsCarousel } from "./awards-carousel";

type PublicLandingProps = {
  content: PublicLandingContent;
  warning?: string;
};

const traceability = [
  ["Región", "Tierras altas de Quetzaltenango"],
  ["Proceso", "Lavado, natural o experimental"],
  ["Varietal", "Según cosecha disponible"],
  ["Productor", "Relación directa"],
  ["Altitud", "Lectura técnica del perfil"],
  ["Finca", "Lotes con nombre propio"],
];

type VisitAction = {
  id: string;
  type: ActionButtonType;
  label: string;
  href: string;
  sortOrder: number;
  target?: "_self" | "_blank";
};

const primaryVisitButtonStyle = {
  backgroundColor: "var(--negro-profundo)",
  borderColor: "var(--negro-profundo)",
  color: "var(--blanco-roto)",
};

export function PublicLanding({ content, warning }: PublicLandingProps) {
  const products = content.products.filter((product) => product.isPublished !== false);
  const productsByType = groupMenuProductsByType(products);
  const hasMenu = hasMenuProducts(productsByType);
  const packagedCoffeeProducts = getPackagedCoffeeProducts(products);
  const events = content.events;
  const awards = content.awards.filter((award) => award.isPublished !== false);
  const media = content.media.filter((item) => item.type === "IMAGE" && item.isPublic !== false);
  const locations = getPublishedLocations(content.locations ?? []);
  const primaryLocation = locations[0];
  const siteName = content.projectConfig.siteName ?? env.NEXT_PUBLIC_SITE_NAME ?? "Café de Reyes";
  const address = primaryLocation?.fullAddress ?? content.projectConfig.address ?? "Guatemala, Quetzaltenango, Quetzaltenango";
  const visitActions = getVisitActions(content.actionButtons).slice(0, 3);
  const locationImage = media[2]?.value ?? media[0]?.value;

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--blanco-roto)] text-[var(--negro-profundo)]">
      <SiteHeader siteName={siteName} />

      {warning ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,640px)] -translate-x-1/2 border border-[var(--azul-grisaceo)]/40 bg-[var(--blanco-roto)]/96 px-4 py-3 text-sm text-[var(--negro-profundo)] shadow-2xl backdrop-blur">
          {warning}
        </div>
      ) : null}

      <BannerCarousel banners={content.banners} media={media} />

      <MotionSection className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="origen">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_1fr]">
            <SectionLabel number="01" eyebrow="Origen" />
            <div>
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display max-w-4xl text-balance text-5xl leading-[0.96] sm:text-7xl">
                    Xela como razón. La barra como método.
                  </h2>
                  <div className="mt-10 grid gap-8 text-[var(--gris-oscuro)] lg:grid-cols-2">
                    <p className="text-xl leading-9">
                      Café de Reyes comunica origen sin convertirlo en adorno. Cada taza parte de una pregunta concreta:
                      quién lo cultiva, dónde crece, cómo se procesa y qué revela en barra.
                    </p>
                    <p className="leading-8">
                      La experiencia se apoya en técnica, trazabilidad y hospitalidad precisa. La búsqueda continua se nota
                      en el menú, en el tostado, en la forma de explicar y en la memoria que deja cada lote.
                    </p>
                  </div>
                </div>
                <Image
                  alt="Barra de Café"
                  className="h-auto w-36 shrink-0 mix-blend-multiply opacity-90 sm:w-44"
                  height={196}
                  src="/brand/reyes-barra-cafe-black.png"
                  width={368}
                />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-12 border-t border-[var(--linea)] pt-14 lg:grid-cols-[0.86fr_1fr] lg:items-center lg:gap-20">
            <div className="max-w-2xl">
              <EditorialBadge>La búsqueda</EditorialBadge>
              <div className="mt-8 space-y-6 text-lg leading-9 text-[var(--carbon)]">
                <p>
                  En Quetzaltenango, sin presupuesto de marketing ni nombre en el circuito internacional, nació una obsesión
                  simple: que cada taza dijera exactamente de dónde viene. Tostado, cata y barra como método.
                </p>
                <p>
                  Hoy esa obsesión tiene un lugar físico. La barra de Café de Reyes está abierta a propósito, no hay nada
                  detrás de una puerta. Cuando pedís un café, ves el proceso completo: el grano, el tueste, la extracción,
                  la decisión detrás de cada taza.
                </p>
                <p>
                  No venimos a convencerte con una lista de premios. Venimos a que te sientes en la barra y lo compruebes
                  vos mismo.
                </p>
              </div>
              <p className="font-display mt-10 max-w-xl text-3xl font-semibold italic leading-snug text-[var(--negro-profundo)]">
                &ldquo;El café tiene nombre, apellido y dirección. Y este solo existe aquí.&rdquo;
              </p>
            </div>

            <figure className="mx-auto w-fit max-w-full overflow-hidden border border-(--linea) lg:mx-0 lg:justify-self-end">
              <Image
                alt="Diego preparando café en barra"
                className="block h-auto w-full max-w-[400px]"
                height={6000}
                sizes="(min-width: 1024px) 400px, 100vw"
                src="/landing/DSC04626.jpg"
                width={3376}
              />
            </figure>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-[var(--negro-profundo)] px-5 py-20 text-[var(--blanco-roto)] sm:px-8 lg:px-12 lg:py-28" id="menu">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_1fr]">
            <SectionLabel dark number="02" eyebrow="Menú destacado" />
            <div>
              <h2 className="font-display max-w-4xl text-balance text-4xl leading-[0.95] text-[var(--blanco-roto)] sm:text-6xl lg:text-[4.65rem]">
                El menú cambia porque la búsqueda continúa.
              </h2>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--azul-grisaceo)]/85">
                Café de especialidad · cocina · temporada
              </p>
            </div>
          </div>

          <div className="mt-12">
            {hasMenu ? (
              <MenuCarousel
                emptyText="Por el momento no hay productos publicados en esta categoría."
                initialProductsByType={productsByType}
              />
            ) : (
              <MenuEmptyState text="Por el momento no hay productos publicados en el menú." />
            )}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="trazabilidad">
        <div className="mx-auto grid max-w-[1480px] gap-14 lg:grid-cols-[0.88fr_1fr]">
          <div>
            <SectionLabel number="03" eyebrow="Trazabilidad" />
            <h2 className="font-display mt-10 max-w-3xl text-balance text-5xl leading-none sm:text-7xl">
              Sabemos de dónde viene. Sabemos quién lo hace.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--gris-oscuro)]">
              La información técnica no se esconde: se ordena. Región, proceso, varietal, productor, altitud y finca
              aparecen como parte natural de la experiencia.
            </p>
          </div>
          <div className="grid border-t border-[var(--linea)] sm:grid-cols-2">
            {traceability.map(([label, value]) => (
              <div className="min-h-36 border-b border-[var(--linea)] py-6 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6" key={label}>
                <Sprout className="mb-5 h-5 w-5 text-[var(--azul-grisaceo)]" />
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--gris-medio)]">{label}</p>
                <p className="font-display mt-4 text-3xl leading-none text-[var(--negro-profundo)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection
        className="bg-[var(--negro-profundo)] px-5 py-24 text-[var(--blanco-roto)] sm:px-8 lg:px-12 lg:py-32"
        id="reconocimientos"
      >
        <div className="mx-auto grid max-w-[1480px] gap-16 lg:grid-cols-[0.76fr_1.24fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionLabel dark number="04" eyebrow="Reconocimientos" />
            <div className="mt-10 h-px w-24 bg-[var(--blanco-roto)]/28" />
            <h2 className="font-display mt-9 max-w-lg text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-[4.15rem]">
              El reconocimiento es consecuencia.
            </h2>
            <p className="mt-8 max-w-md text-base leading-8 text-[var(--gris-suave)]/66">
              Cada taza, cada detalle y cada decisión nos han llevado hasta aquí.
            </p>
          </div>
          <AwardsCarousel awards={awards} emptyText="Por el momento no hay logros publicados." />
        </div>
      </MotionSection>

      <MotionSection className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32" id="eventos">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_1fr]">
            <SectionLabel number="05" eyebrow="Eventos" />
            <div>
              <h2 className="font-display max-w-4xl text-balance text-4xl leading-[0.98] text-[var(--negro-profundo)] sm:text-6xl lg:text-[4.65rem]">
                Experiencias alrededor del café.
              </h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-[var(--gris-oscuro)]">
                Catas, brunches y encuentros creados para compartir, aprender y disfrutar.
              </p>
              <div className="mt-9 h-px w-24 bg-[var(--negro-profundo)]/28" />
            </div>
          </div>
          <div className="mt-14">
            <EventsCarousel emptyText="Por el momento no hay eventos publicados." events={events} />
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-(--carbon) px-5 py-20 text-(--blanco-roto) sm:px-8 lg:px-12 lg:py-28" id="cafes">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_1fr]">
            <SectionLabel dark number="06" eyebrow="Los cafés de esta temporada" />
            <div>
              <h2 className="font-display max-w-4xl text-balance text-4xl leading-[0.95] text-(--blanco-roto) sm:text-6xl lg:text-[4.65rem]">
                Lo que Café de Reyes está tostando ahora.
              </h2>
              <p className="mt-7 max-w-2xl text-base leading-8 text-(--gris-suave)/72">
                Cada lote se cata antes de salir a la venta. Esto es lo que hay disponible esta semana.
              </p>
            </div>
          </div>

          <div className="mt-12">
            {packagedCoffeeProducts.length ? (
              <PackagedCoffeeCarousel
                emptyText="Por el momento no hay cafés empacados publicados."
                initialProducts={packagedCoffeeProducts}
              />
            ) : (
              <PackagedCoffeeEmptyState text="Por el momento no hay cafés empacados publicados." />
            )}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-[var(--gris-suave)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="galeria">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr]">
            <SectionLabel number="07" eyebrow="Galería" />
            <SectionHeading
              title="Barra, producto, proceso y memoria visual."
              copy="Lo que queda cuando la barra, el café y el oficio se vuelven imagen."
            />
          </div>
          <div className="mt-14">
            <GalleryCarousel emptyText="Por el momento no hay imágenes publicadas en la galería." media={media} />
          </div>
        </div>
      </MotionSection>

      <section id="visitanos" className="bg-[var(--blanco-roto)] text-[var(--negro-profundo)]">
        <div className="mx-auto grid max-w-[1680px] lg:grid-cols-[55fr_45fr]">
          <div className="px-5 pb-20 pt-24 sm:px-8 lg:px-16 lg:pb-24 lg:pt-28 xl:px-20">
            <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--gris-oscuro)]">
              <span>Visítanos</span>
              <span className="h-px w-20 bg-[var(--gris-medio)]/45" />
            </div>

            <h2 className="font-display mt-9 max-w-4xl text-balance text-5xl leading-[0.92] sm:text-7xl lg:text-[5.8rem]">
              Desde Xela,<br />
              una barra que<br />
              vale el viaje.
            </h2>

            <p className="mt-8 max-w-xl whitespace-pre-line text-base leading-8 text-[var(--gris-oscuro)]">
              Café de Reyes nació en Quetzaltenango.{"\n\n"}
              Un espacio donde el origen, la técnica y la hospitalidad se encuentran en una barra abierta para descubrir.
            </p>

            <OpeningHoursSection openingHours={content.openingHours} />

            {visitActions.length ? (
              <div className="mt-9">
                <SectionMicroHeading label="Síguenos" />
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {visitActions.map((action, index) => (
                    <BrandButtonLink
                      className={cn(
                        "w-full sm:w-auto",
                        index === 0 &&
                          "[--button-bg:var(--negro-profundo)] [--button-border:var(--negro-profundo)] [--button-fg:var(--blanco-roto)]",
                      )}
                      href={action.href}
                      key={action.id}
                      style={index === 0 ? primaryVisitButtonStyle : undefined}
                      target={action.target}
                      variant={index === 0 ? "primary" : "secondary"}
                    >
                      <ActionButtonIcon type={action.type} />
                      {action.label}
                    </BrandButtonLink>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-h-[30rem] border-t border-[var(--linea)] lg:min-h-full lg:border-l lg:border-t-0">
            <LocationsCarousel fallbackAddress={address} fallbackImage={locationImage} locations={locations} />
          </div>
        </div>

        <footer className="bg-[var(--negro-profundo)] px-5 py-12 text-[var(--blanco-roto)] sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-10 text-center md:grid-cols-2 md:items-center">
              <div className="flex justify-center">
                <Image
                  alt={siteName}
                  className="h-auto w-60 object-contain"
                  height={384}
                  src="/brand/reyes-logo-full-white-transparent.png"
                  width={570}
                />
              </div>

              <nav className="text-sm">
                <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--azul-grisaceo)]">
                  Explorar
                </p>
                <div className="grid justify-center gap-3 text-[var(--gris-suave)]/86">
                  <FooterLink href="#menu">Menú</FooterLink>
                  <FooterLink href="#origen">Origen</FooterLink>
                  <FooterLink href="#eventos">Eventos</FooterLink>
                  <FooterLink href="#cafes">Cafés</FooterLink>
                  <FooterLink href="#reconocimientos">Reconocimientos</FooterLink>
                  <FooterLink href="#galeria">Galería</FooterLink>
                  <FooterLink href="#visitanos">Visítanos</FooterLink>
                </div>
              </nav>

            </div>

            <div className="mt-12 border-t border-[var(--blanco-roto)]/12 pt-6 text-center text-sm text-[var(--gris-suave)]/70">
              <p>© 2026 Café de Reyes. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}

function SectionLabel({ number, eyebrow, dark = false }: { number: string; eyebrow: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em]", dark ? "text-[var(--gris-suave)]" : "text-[var(--gris-medio)]")}>
      <span className="text-[var(--azul-grisaceo)]">{number}</span>
      <span className="h-px w-12 bg-current opacity-30" />
      <span>{eyebrow}</span>
    </div>
  );
}

function EditorialBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex border border-[var(--negro-profundo)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gris-oscuro)]">
      {children}
    </span>
  );
}

function SectionHeading({ title, copy, dark = false }: { title: string; copy?: string; dark?: boolean }) {
  return (
    <div>
      <h2 className={cn("font-display max-w-4xl text-balance text-5xl leading-none sm:text-7xl", dark ? "text-[var(--blanco-roto)]" : "text-[var(--negro-profundo)]")}>
        {title}
      </h2>
      {copy ? (
        <p className={cn("mt-7 max-w-2xl text-lg leading-8", dark ? "text-[var(--gris-suave)]/82" : "text-[var(--gris-oscuro)]")}>{copy}</p>
      ) : null}
    </div>
  );
}

function SectionMicroHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--negro-profundo)]">{label}</p>
      <span className="h-px flex-1 bg-[var(--linea)]" />
    </div>
  );
}

function FooterLink({
  children,
  href,
  target,
  className,
}: {
  children: ReactNode;
  href: string;
  target?: string;
  className?: string;
}) {
  return (
    <a
      className={cn("w-fit text-[var(--gris-suave)]/82 transition hover:text-[var(--blanco-roto)]", className)}
      href={href}
      rel={target === "_blank" ? "noreferrer" : undefined}
      target={target}
    >
      {children}
    </a>
  );
}

function getPublishedLocations(locations: ProjectLocation[]) {
  return locations
    .filter((location) => location.isActive !== false && location.isPublished !== false)
    .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0));
}

function getVisitActions(actionButtons: ActionButton[]): VisitAction[] {
  const publishedActions = actionButtons
    .filter((action) => action.isActive !== false && action.isPublished !== false && (action.url || action.value))
    .sort((first, second) => (first.sortOrder ?? 0) - (second.sortOrder ?? 0));

  return publishedActions.reduce<VisitAction[]>((actions, action) => {
      const value = action.url ?? action.value;
      const href = buildActionButtonHref(action.type, value);

      if (!href) {
        return actions;
      }

      actions.push({
        id: action.id,
        type: action.type,
        label: action.label ?? humanizeActionButtonType(action.type),
        href,
        sortOrder: action.sortOrder ?? 0,
        target: action.target ?? "_blank",
      });

      return actions;
  }, []);
}

