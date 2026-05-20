import {
  AtSign,
  Camera,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Sprout,
} from "lucide-react";
import Image from "next/image";

import type { PublicLandingContent } from "@/app/actions/public-content/types";
import { BannerCarousel } from "@/components/landing/banner-carousel";
import { BrandButtonLink } from "@/components/landing/brand-button";
import { EventsCarousel } from "@/components/landing/events-carousel";
import { MenuCarousel } from "@/components/landing/menu-carousel";
import { MotionSection } from "@/components/landing/motion-shell";
import { SiteHeader } from "@/components/landing/site-header";
import { getMenuCategoriesWithProducts, groupMenuProductsByType } from "@/lib/menu-products";
import { humanizeMenuProductType } from "@/lib/menu-product-type";
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

export function PublicLanding({ content, warning }: PublicLandingProps) {
  const products = content.products.filter((product) => product.isPublished !== false);
  const productsByType = groupMenuProductsByType(products);
  const menuCategories = getMenuCategoriesWithProducts(productsByType);
  const featuredProduct = products.find((product) => product.isFeatured) ?? products[0];
  const events = content.events.filter(
    (event) => event.isActive !== false && event.isPublished !== false && event.status !== "CANCELLED",
  );
  const awards = content.awards.filter((award) => award.isPublished !== false);
  const media = content.media.filter((item) => item.type === "IMAGE" && item.isPublic !== false).slice(0, 8);
  const siteName = content.projectConfig.siteName ?? env.NEXT_PUBLIC_SITE_NAME ?? "Cafe de Reyes";
  const address = content.projectConfig.address ?? "Quetzaltenango, Guatemala";
  const hours = content.projectConfig.hours ?? "Horarios publicados desde configuracion del proyecto";
  const mapUrl = content.projectConfig.mapUrl ?? "https://maps.google.com/?q=Quetzaltenango%20Guatemala";
  const instagramUrl = content.projectConfig.instagramUrl ?? "https://www.instagram.com/";
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
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr]">
            <SectionLabel dark number="02" eyebrow="Menu destacado" />
            <SectionHeading dark title="El menu cambia porque la busqueda continua." />
          </div>

          <div className="mt-14 grid gap-14 lg:grid-cols-2">
            {menuCategories.length ? (
              menuCategories.map((type) => (
                <MenuCarousel
                  emptyText={`No hay ${humanizeMenuProductType(type).toLowerCase()} publicados por el momento.`}
                  key={type}
                  products={productsByType[type]}
                  title={humanizeMenuProductType(type)}
                />
              ))
            ) : (
              <div className="border border-dashed border-[var(--blanco-roto)]/20 p-6 text-sm text-[var(--gris-suave)] lg:col-span-2">
                No hay productos publicados en el menu por el momento.
              </div>
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
        className="bg-[var(--negro-profundo)] px-5 py-20 text-[var(--blanco-roto)] sm:px-8 lg:px-12 lg:py-28"
        id="reconocimientos"
      >
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <SectionLabel dark number="04" eyebrow="Reconocimientos" />
            <Image
              alt="Cafe de Reyes"
              className="mt-10 h-auto w-64 object-contain"
              height={384}
              src="/brand/reyes-logo-full-white-transparent.png"
              width={570}
            />
            <h2 className="font-display mt-10 max-w-xl text-5xl leading-none sm:text-7xl">
              El reconocimiento es consecuencia.
            </h2>
          </div>
          <AwardsCarousel awards={awards} emptyText="Los logros publicados apareceran aqui con un tratamiento sobrio." />
        </div>
      </MotionSection>

      <MotionSection className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="eventos">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr]">
            <SectionLabel number="05" eyebrow="Eventos" />
            <SectionHeading title="Encuentros para entender el cafe, no solo tomarlo." copy="Catas, lanzamientos de lote y experiencias que hacen visible el oficio." />
          </div>
          <div className="mt-14">
            <EventsCarousel emptyText="No hay eventos publicados por el momento." events={events} />
          </div>
        </div>
      </MotionSection>

      <MotionSection className="bg-[var(--gris-suave)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="galeria">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_1fr]">
            <SectionLabel number="06" eyebrow="Galeria" />
            <SectionHeading
              title="Barra, producto, proceso y memoria visual."
              copy="Un grid asimetrico para fotografia real, textura de proceso y contenido social con direccion editorial."
            />
          </div>
          <div className="mt-14 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] lg:grid-cols-4">
            {media.length ? (
              media.map((item, index) => (
                <EditorialImage
                  alt="Cafe de Reyes"
                  className={cn(index === 0 && "col-span-2 row-span-2", index === 3 && "lg:row-span-2", index === 5 && "lg:col-span-2")}
                  key={item.id}
                  src={item.value}
                />
              ))
            ) : (
              <EmptyState text="La galeria publica del CMS aparecera aqui." />
            )}
          </div>
        </div>
      </MotionSection>

      <MotionSection className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28" id="visitanos">
        <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[0.78fr_1fr]">
          <div>
            <SectionLabel number="07" eyebrow="Visitanos" />
            <h2 className="font-display mt-10 text-balance text-5xl leading-none sm:text-7xl">
              Desde Xela, una barra que vale el viaje.
            </h2>
            <div className="mt-10 space-y-4 text-[var(--gris-oscuro)]">
              <p className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--azul-grisaceo)]" />
                {address}
              </p>
              <p className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[var(--azul-grisaceo)]" />
                {hours}
              </p>
              <a className="flex items-center gap-3 transition hover:text-[var(--negro-profundo)]" href={instagramUrl}>
                <AtSign className="h-5 w-5 text-[var(--azul-grisaceo)]" />
                Instagram como bitacora visual de la barra
              </a>
            </div>
            <BrandButtonLink className="mt-9" href={mapUrl} target="_blank">
              Como llegar
              <Navigation className="h-4 w-4" />
            </BrandButtonLink>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_0.72fr]">
            <EditorialImage className="min-h-[28rem]" src={locationImage} alt="Cafe de Reyes en Quetzaltenango" />
            <div className="relative min-h-[28rem] overflow-hidden bg-[var(--negro-profundo)] p-6 text-[var(--blanco-roto)]">
              <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(249,246,242,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(249,246,242,0.5)_1px,transparent_1px)] [background-size:44px_44px]" />
              <div className="relative flex h-full min-h-[25rem] flex-col justify-between border border-[var(--blanco-roto)]/18 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--azul-grisaceo)]">Mapa sobrio</p>
                <div>
                  <p className="font-display text-6xl leading-none">Xela</p>
                  <p className="mt-4 max-w-sm leading-7 text-[var(--gris-suave)]">
                    Punto de partida para una experiencia de origen, tecnica y hospitalidad.
                  </p>
                </div>
                <Compass className="h-8 w-8 text-[var(--azul-grisaceo)]" />
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      <footer className="bg-[var(--negro-profundo)] px-5 py-14 text-[var(--blanco-roto)] sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1480px] gap-10 md:grid-cols-[1fr_1fr_0.8fr]">
          <div>
            <Image
              alt={siteName}
              className="h-auto w-56 object-contain"
              height={384}
              src="/brand/reyes-logo-full-white-transparent.png"
              width={570}
            />
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--gris-suave)]">
              Origen, tecnica y memoria en cada taza.
            </p>
          </div>
          <nav className="grid gap-3 text-sm text-[var(--gris-suave)] sm:grid-cols-2">
            <a href="#menu">Menu</a>
            <a href="#origen">Origen</a>
            <a href="#eventos">Eventos</a>
            <a href="#reconocimientos">Reconocimientos</a>
            <a href="#galeria">Galeria</a>
            <a href="#visitanos">Visitanos</a>
          </nav>
          <div className="text-sm leading-7 text-[var(--gris-suave)] md:text-right">
            <p>{address}</p>
            <p>{hours}</p>
            <a className="inline-flex items-center gap-2 text-[var(--azul-grisaceo)]" href={instagramUrl}>
              Instagram <Camera className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
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

function EmptyState({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div className={cn("border border-dashed p-6 text-sm", dark ? "border-[var(--blanco-roto)]/20 text-[var(--gris-suave)]" : "border-[var(--linea)] text-[var(--gris-medio)]")}>
      {text}
    </div>
  );
}
