import { Sprout } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import type {
  ActionButton,
  ActionButtonType,
  OpeningHour,
  ProjectLocation,
  PublicLandingContent,
  WeekDay,
} from "@/app/actions/public-content/types";
import { ActionButtonIcon } from "@/components/landing/action-button-icon";
import { BannerCarousel } from "@/components/landing/banner-carousel";
import { BrandButtonLink } from "@/components/landing/brand-button";
import { EventsCarousel } from "@/components/landing/events-carousel";
import { GalleryCarousel } from "@/components/landing/gallery-carousel";
import { LocationsCarousel } from "@/components/landing/locations-carousel";
import { MenuCarousel, MenuEmptyState } from "@/components/landing/menu-carousel";
import { MotionSection } from "@/components/landing/motion-shell";
import { SiteHeader } from "@/components/landing/site-header";
import { buildActionButtonHref, humanizeActionButtonType } from "@/lib/action-button-type";
import { getMenuCategoriesWithProducts, groupMenuProductsByType } from "@/lib/menu-products";
import { cn } from "@/lib/utils";
import { env } from "@/utils/env";
import { AwardsCarousel } from "./awards-carousel";

type PublicLandingProps = {
  content: PublicLandingContent;
  warning?: string;
};

const traceability = [
  ["Region", "Tierras altas de Quetzaltenango"],
  ["Proceso", "Lavado, natural o experimental"],
  ["Varietal", "Segun cosecha disponible"],
  ["Productor", "Relacion directa"],
  ["Altitud", "Lectura tecnica del perfil"],
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
  const menuCategories = getMenuCategoriesWithProducts(productsByType);
  const featuredProduct = products.find((product) => product.isFeatured) ?? products[0];
  const events = content.events;
  const awards = content.awards.filter((award) => award.isPublished !== false);
  const media = content.media.filter((item) => item.type === "IMAGE" && item.isPublic !== false);
  const locations = getPublishedLocations(content.locations ?? []);
  const primaryLocation = locations[0];
  const siteName = content.projectConfig.siteName ?? env.NEXT_PUBLIC_SITE_NAME ?? "Cafe de Reyes";
  const address = primaryLocation?.fullAddress ?? content.projectConfig.address ?? "Guatemala, Quetzaltenango, Quetzaltenango";
  const visitActions = getVisitActions(content.actionButtons).slice(0, 3);
  const openingHourCards = getOpeningHourCards(content.openingHours);
  const originImage = media[1]?.value ?? featuredProduct?.imageUrl;
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
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="group">
            <EditorialImage className="min-h-[28rem] lg:min-h-[42rem]" src={originImage} alt="Barra y proceso de Cafe de Reyes" />
          </div>
          <div className="max-w-3xl lg:pb-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <SectionLabel number="01" eyebrow="Origen" />
              <Image
                alt="Barra de Cafe"
                className="h-auto w-44 mix-blend-multiply sm:w-52"
                height={196}
                src="/brand/reyes-barra-cafe-black.png"
                width={368}
              />
            </div>
            <h2 className="font-display mt-10 text-balance text-5xl leading-[0.96] sm:text-7xl">
              Xela como razon. La barra como metodo.
            </h2>
            <div className="mt-10 grid gap-8 text-[var(--gris-oscuro)] lg:grid-cols-2">
              <p className="text-xl leading-9">
                Cafe de Reyes comunica origen sin convertirlo en adorno. Cada taza parte de una pregunta concreta:
                quien lo cultiva, donde crece, como se procesa y que revela en barra.
              </p>
              <p className="leading-8">
                La experiencia se apoya en tecnica, trazabilidad y hospitalidad precisa. La busqueda continua se nota
                en el menu, en el tostado, en la forma de explicar y en la memoria que deja cada lote.
              </p>
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-[var(--negro-profundo)] px-5 py-20 text-[var(--blanco-roto)] sm:px-8 lg:px-12 lg:py-28" id="menu">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.34fr_1fr]">
            <SectionLabel dark number="02" eyebrow="Menu destacado" />
            <div>
              <h2 className="font-display max-w-4xl text-balance text-4xl leading-[0.95] text-[var(--blanco-roto)] sm:text-6xl lg:text-[4.65rem]">
                El menu cambia porque la busqueda continua.
              </h2>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--azul-grisaceo)]/85">
                Cafe de especialidad · Cocina · Temporada
              </p>
            </div>
          </div>

          <div className="mt-12">
            {menuCategories.length ? (
              <MenuCarousel
                categories={menuCategories}
                emptyText="Por el momento no hay productos publicados en esta categoria."
                initialProductsByType={productsByType}
              />
            ) : (
              <MenuEmptyState text="Por el momento no hay productos publicados en el menu." />
            )}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="trazabilidad">
        <div className="mx-auto grid max-w-[1480px] gap-14 lg:grid-cols-[0.88fr_1fr]">
          <div>
            <SectionLabel number="03" eyebrow="Trazabilidad" />
            <h2 className="font-display mt-10 max-w-3xl text-balance text-5xl leading-none sm:text-7xl">
              Sabemos de donde viene. Sabemos quien lo hace.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--gris-oscuro)]">
              La informacion tecnica no se esconde: se ordena. Region, proceso, varietal, productor, altitud y finca
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
            <Image
              alt="Cafe de Reyes"
              className="mt-12 h-auto w-40 object-contain opacity-[0.86] sm:w-44"
              height={384}
              src="/brand/reyes-logo-full-white-transparent.png"
              width={570}
            />
            <div className="mt-10 h-px w-24 bg-[var(--blanco-roto)]/28" />
            <h2 className="font-display mt-9 max-w-lg text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-[4.15rem]">
              El reconocimiento es consecuencia.
            </h2>
            <p className="mt-8 max-w-md text-base leading-8 text-[var(--gris-suave)]/66">
              Cada taza, cada detalle y cada decision nos han llevado hasta aqui.
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
                Experiencias alrededor del cafe.
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

      <MotionSection className="bg-[var(--gris-suave)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="galeria">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr]">
            <SectionLabel number="06" eyebrow="Galeria" />
            <SectionHeading
              title="Barra, producto, proceso y memoria visual."
              copy="Imágenes de la barra, el café y el oficio que dan forma a la experiencia desde Xela."
            />
          </div>
          <div className="mt-14">
            <GalleryCarousel emptyText="Por el momento no hay imagenes publicadas en la galeria." media={media} />
          </div>
        </div>
      </MotionSection>

      <section id="visitanos" className="bg-[var(--blanco-roto)] text-[var(--negro-profundo)]">
        <div className="mx-auto grid max-w-[1680px] lg:grid-cols-[55fr_45fr]">
          <div className="px-5 pb-20 pt-24 sm:px-8 lg:px-16 lg:pb-24 lg:pt-28 xl:px-20">
            <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--gris-oscuro)]">
              <span>Visitanos</span>
              <span className="h-px w-20 bg-[var(--gris-medio)]/45" />
            </div>

            <h2 className="font-display mt-9 max-w-4xl text-balance text-5xl leading-[0.92] sm:text-7xl lg:text-[5.8rem]">
              Desde Xela,<br />
              una barra que<br />
              vale el viaje.
            </h2>

            <p className="mt-8 max-w-xl whitespace-pre-line text-base leading-8 text-[var(--gris-oscuro)]">
              Cafe de Reyes nacio en Quetzaltenango.{"\n\n"}
              Un espacio donde el origen, la tecnica y la hospitalidad se encuentran en una barra abierta para descubrir.
            </p>

            {openingHourCards.length ? (
              <div className="mt-10">
                <SectionMicroHeading label="Horarios" />
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {openingHourCards.map((hour) => (
                    <OpeningHourCard close={hour.close} day={hour.day} key={hour.day} open={hour.open} />
                  ))}
                </div>
              </div>
            ) : null}

            {visitActions.length ? (
              <div className="mt-9">
                <SectionMicroHeading label="Siguenos" />
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
                  <FooterLink href="#menu">Menu</FooterLink>
                  <FooterLink href="#origen">Origen</FooterLink>
                  <FooterLink href="#eventos">Eventos</FooterLink>
                  <FooterLink href="#reconocimientos">Reconocimientos</FooterLink>
                  <FooterLink href="#galeria">Galeria</FooterLink>
                  <FooterLink href="#visitanos">Visitanos</FooterLink>
                </div>
              </nav>

            </div>

            <div className="mt-12 border-t border-[var(--blanco-roto)]/12 pt-6 text-center text-sm text-[var(--gris-suave)]/70">
              <p>© 2026 Cafe de Reyes. Todos los derechos reservados.</p>
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

function OpeningHourCard({ day, open, close }: { day: string; open: string; close: string }) {
  return (
    <div className="border-l border-[var(--linea)] pl-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--negro-profundo)]">{day}</p>
      <p className="mt-4 text-[var(--gris-oscuro)]">{open}</p>
      <p className="mt-1 text-[var(--gris-oscuro)]">{close}</p>
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

function EditorialImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden bg-[var(--gris-suave)]", className)}>
      {src ? (
        <Image className="object-cover transition duration-700 group-hover:scale-[1.035]" src={src} alt={alt} fill sizes="(min-width: 1024px) 32vw, 100vw" />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center text-xs uppercase tracking-[0.2em] text-[var(--gris-medio)]">Sin imagen</div>
      )}
    </div>
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

function getOpeningHourCards(openingHours: OpeningHour[]) {
  return openingHours
    .filter((hour) => hour.isActive !== false && hour.isPublished !== false)
    .sort((first, second) => getWeekDayIndex(first.day) - getWeekDayIndex(second.day))
    .map((hour) => ({
      close: formatTime(hour.endTime),
      day: getWeekDayShortLabel(hour.day),
      open: formatTime(hour.startTime),
    }));
}

function getWeekDayIndex(day: WeekDay) {
  return WEEK_DAYS.indexOf(day);
}

const WEEK_DAYS: WeekDay[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function getWeekDayShortLabel(day: WeekDay) {
  const labels: Record<WeekDay, string> = {
    FRIDAY: "Vie",
    MONDAY: "Lun",
    SATURDAY: "Sab",
    SUNDAY: "Dom",
    THURSDAY: "Jue",
    TUESDAY: "Mar",
    WEDNESDAY: "Mie",
  };

  return labels[day];
}

function formatTime(value: string) {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}
