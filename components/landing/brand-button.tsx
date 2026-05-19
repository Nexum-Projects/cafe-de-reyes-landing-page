import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "default" | "sm" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "border-[var(--button-border,var(--negro-profundo))] bg-[var(--button-bg,var(--negro-profundo))] text-[var(--button-fg,var(--blanco-roto))] hover:border-[var(--gris-oscuro)] hover:bg-[var(--gris-oscuro)]",
  secondary: "border-current bg-transparent text-current hover:bg-current/10",
  ghost: "border-transparent bg-transparent text-current hover:border-current/20 hover:bg-current/10",
};

const sizeClasses: Record<Size, string> = {
  default: "h-12 px-6",
  sm: "h-10 px-4",
  icon: "h-11 w-11 px-0",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 border text-xs font-semibold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--azul-grisaceo)] disabled:pointer-events-none disabled:opacity-50";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
};

export function buttonClassName(variant: Variant = "primary", size: Size = "default", className?: string) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function BrandButton({ children, className, variant = "primary", size = "default", ...props }: ButtonProps) {
  return (
    <button className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function BrandButtonLink({
  children,
  className,
  variant = "primary",
  size = "default",
  target,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={buttonClassName(variant, size, className)}
      rel={target === "_blank" ? "noreferrer" : undefined}
      target={target}
      {...props}
    >
      {children}
    </a>
  );
}
