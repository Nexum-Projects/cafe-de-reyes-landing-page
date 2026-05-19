"use client";

import { ArrowDownRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { BrandButton, BrandButtonLink } from "@/components/landing/brand-button";

const navItems = [
  ["Inicio", "#inicio"],
  ["Menu", "#menu"],
  ["Origen", "#origen"],
  ["Eventos", "#eventos"],
  ["Reconocimientos", "#reconocimientos"],
  ["Galeria", "#galeria"],
  ["Visitanos", "#visitanos"],
];

export function SiteHeader({ siteName }: { siteName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 4);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 overflow-visible text-[var(--blanco-roto)] transition-all duration-500 ease-out",
        isScrolled || isOpen
          ? "border-b border-[var(--blanco-roto)]/12 bg-[var(--negro-profundo)]/86 shadow-2xl shadow-black/18 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      {!isScrolled && !isOpen ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/72 via-black/34 to-transparent"
        />
      ) : null}

      <nav className="relative z-10 mx-auto flex h-24 max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a aria-label={siteName} className="group flex items-center gap-4" href="#inicio">
          <Image
            alt={siteName}
            className="h-16 w-auto object-contain transition group-hover:opacity-80 sm:h-[4.5rem]"
            height={384}
            priority
            src="/brand/reyes-logo-full-white-transparent.png"
            width={570}
          />
        </a>

        <div className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gris-suave)]/82 lg:flex">
          {navItems.map(([label, href]) => (
            <a className="transition hover:text-[var(--blanco-roto)]" href={href} key={href}>
              {label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <BrandButtonLink href="#menu" size="sm" variant="secondary">
            Ver menu
            <ArrowDownRight className="h-4 w-4" />
          </BrandButtonLink>
        </div>

        <BrandButton
          aria-expanded={isOpen}
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          className="lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </BrandButton>
      </nav>

      {isOpen ? (
        <div className="border-t border-[var(--blanco-roto)]/12 bg-[var(--negro-profundo)]/94 px-5 py-5 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-[1480px] gap-1">
            {navItems.map(([label, href]) => (
              <a
                className="border-b border-[var(--blanco-roto)]/10 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--gris-suave)]"
                href={href}
                key={href}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </a>
            ))}
            <BrandButtonLink className="mt-4 w-full" href="#menu" onClick={() => setIsOpen(false)}>
              Ver menu
              <ArrowDownRight className="h-4 w-4" />
            </BrandButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
