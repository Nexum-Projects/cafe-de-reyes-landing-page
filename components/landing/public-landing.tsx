import { Sprout } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import type { PublicLandingContent } from "@/app/actions/public-content/types";
import { BannerCarousel } from "@/components/landing/banner-carousel";
import { BrandButtonLink } from "@/components/landing/brand-button";
import { EventsCarousel } from "@/components/landing/events-carousel";
import { GalleryCarousel } from "@/components/landing/gallery-carousel";
import { MenuCarousel } from "@/components/landing/menu-carousel";
import { MotionSection } from "@/components/landing/motion-shell";
import { SiteHeader } from "@/components/landing/site-header";
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

export function PublicLanding({ content, warning }: PublicLandingProps) {
  const products = content.products.filter((product) => product.isPublished !== false);
  const productsByType = groupMenuProductsByType(products);
  const menuCategories = getMenuCategoriesWithProducts(productsByType);
  const featuredProduct = products.find((product) => product.isFeatured) ?? products[0];
  const events = content.events;
  const awards = content.awards.filter((award) => award.isPublished !== false);
  const media = content.media.filter((item) => item.type === "IMAGE" && item.isPublic !== false);
  const siteName = content.projectConfig.siteName ?? env.NEXT_PUBLIC_SITE_NAME ?? "Cafe de Reyes";
  const address = content.projectConfig.address ?? "Quetzaltenango, Guatemala";
  const hours = content.projectConfig.hours ?? "Lunes - Domingo\n7:00 AM - 7:00 PM";
  const mapUrl = content.projectConfig.mapUrl ?? "https://maps.google.com/?q=Quetzaltenango%20Guatemala";
  const instagramUrl = content.projectConfig.instagramUrl ?? "https://www.instagram.com/";
  const instagramHandle = getInstagramHandle(instagramUrl) ?? "@cafedereyes";
  const whatsAppUrl = getWhatsAppUrl(content.projectConfig.phone);
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

          <div className="mt-14">
            {menuCategories.length ? (
              <MenuCarousel
                categories={menuCategories}
                emptyText="No hay productos publicados en esta categoria por el momento."
                initialProductsByType={productsByType}
              />
            ) : (
              <div className="py-12 text-center text-sm text-[var(--gris-medio)]">
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
              copy="Imagenes de la barra abierta, el producto y el oficio que sostienen la experiencia desde Xela."
            />
          </div>
          <div className="mt-14">
            <GalleryCarousel emptyText="La galeria publica del CMS aparecera aqui." media={media} />
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

            <div className="mt-10 grid gap-7 border-y border-[var(--linea)] py-7 sm:grid-cols-3">
              <VisitMeta label="Quetzaltenango" value="Guatemala" />
              <VisitMeta label="Horario" value={hours} />
              <VisitMeta label="Instagram" value={instagramHandle} />
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <BrandButtonLink
                className="w-full sm:w-auto"
                href={mapUrl}
                style={{
                  backgroundColor: "var(--negro-profundo)",
                  borderColor: "var(--negro-profundo)",
                  color: "var(--blanco-roto)",
                }}
                target="_blank"
              >
                Como llegar
              </BrandButtonLink>
              <BrandButtonLink className="w-full sm:w-auto" href={instagramUrl} target="_blank" variant="secondary">
                Ver Instagram
              </BrandButtonLink>
            </div>

            <p className="font-display mt-7 max-w-xl text-xl italic leading-snug text-[var(--gris-medio)]">
              Una barra construida para quienes buscan cafe con identidad.
            </p>
          </div>

          <div className="relative min-h-[30rem] border-t border-[var(--linea)] lg:min-h-full lg:border-l lg:border-t-0">
            <EditorialImage className="h-full min-h-[30rem]" src={locationImage} alt="Cafe de Reyes en Quetzaltenango" />
            <div className="absolute right-6 top-6 border border-[var(--blanco-roto)]/18 bg-[var(--negro-profundo)]/78 p-6 text-[var(--blanco-roto)] backdrop-blur-sm sm:right-10 sm:top-10 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--blanco-roto)]">Xela</p>
              <p className="mt-5 max-w-[12rem] text-lg leading-7 text-[var(--gris-suave)]">
                Quetzaltenango, Guatemala
              </p>
              <div className="mt-6 h-px w-16 bg-[var(--azul-grisaceo)]/80" />
            </div>
          </div>
        </div>

        <footer className="bg-[var(--negro-profundo)] px-5 py-12 text-[var(--blanco-roto)] sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr_1fr]">
              <div>
                <Image
                  alt={siteName}
                  className="h-auto w-60 object-contain"
                  height={384}
                  src="/brand/reyes-logo-full-white-transparent.png"
                  width={570}
                />
                <p className="font-display mt-6 max-w-sm text-2xl italic leading-tight text-[var(--gris-suave)]">
                  Origen, tecnica y memoria en cada taza.
                </p>
                <div className="mt-5 h-px w-16 bg-[var(--azul-grisaceo)]/80" />
                <p className="mt-5 text-sm leading-7 text-[var(--gris-suave)]/76">
                  Desde Quetzaltenango, Guatemala.
                </p>
              </div>

              <nav className="text-sm">
                <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--azul-grisaceo)]">
                  Explorar
                </p>
                <div className="grid gap-3 text-[var(--gris-suave)]/86">
                  <FooterLink href="#menu">Menu</FooterLink>
                  <FooterLink href="#origen">Origen</FooterLink>
                  <FooterLink href="#eventos">Eventos</FooterLink>
                  <FooterLink href="#reconocimientos">Reconocimientos</FooterLink>
                  <FooterLink href="#galeria">Galeria</FooterLink>
                  <FooterLink href="#visitanos">Visitanos</FooterLink>
                </div>
              </nav>

              <div className="text-sm leading-7 text-[var(--gris-suave)]/82">
                <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--azul-grisaceo)]">
                  Contacto
                </p>
                <p>{address}</p>
                <div className="mt-5 whitespace-pre-line">{hours}</div>
                <div className="mt-7 h-px w-40 bg-[var(--azul-grisaceo)]/70" />
                <div className="mt-6 grid gap-3">
                  <FooterLink href={instagramUrl} target="_blank">
                    Instagram {instagramHandle}
                  </FooterLink>
                  {whatsAppUrl ? (
                    <FooterLink href={whatsAppUrl} target="_blank">
                      WhatsApp {content.projectConfig.phone}
                    </FooterLink>
                  ) : null}
                  <FooterLink href={mapUrl} target="_blank">
                    Como llegar
                  </FooterLink>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-5 border-t border-[var(--blanco-roto)]/12 pt-6 text-center text-sm text-[var(--gris-suave)]/70 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <span className="hidden md:block" />
              <p>© 2026 Cafe de Reyes. Todos los derechos reservados.</p>
              <div className="flex justify-center md:justify-end">
                <FooterLink href={instagramUrl} target="_blank">
                  Instagram -&gt;
                </FooterLink>
              </div>
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

function VisitMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--negro-profundo)]">{label}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--gris-oscuro)]">{value}</p>
    </div>
  );
}

function FooterLink({
  children,
  href,
  target,
}: {
  children: ReactNode;
  href: string;
  target?: string;
}) {
  return (
    <a
      className="w-fit text-[var(--gris-suave)]/82 transition hover:text-[var(--blanco-roto)]"
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

function getInstagramHandle(url: string) {
  try {
    const parsedUrl = new URL(url);
    const handle = parsedUrl.pathname.split("/").filter(Boolean)[0];

    return handle ? `@${handle}` : null;
  } catch {
    return null;
  }
}

function getWhatsAppUrl(phone?: string | null) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");

  return digits ? `https://wa.me/${digits}` : null;
}
