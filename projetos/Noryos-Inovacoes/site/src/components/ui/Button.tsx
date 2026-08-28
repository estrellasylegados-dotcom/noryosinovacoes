import Link from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-6 py-3.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--color-cyan)] text-[var(--color-ink)] hover:bg-[#5ddfff]",
  secondary:
    "border border-[var(--color-border-strong)] text-[var(--color-text)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]",
  ghost: "text-[var(--color-text)] underline decoration-[var(--color-border-strong)] underline-offset-4 hover:decoration-[var(--color-cyan)]",
};

type LinkButtonProps = { href: string; variant?: Variant; children: React.ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>;

export function ButtonLink({ href, variant = "primary", children, className = "", ...rest }: LinkButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  const cls = `${base} ${variants[variant]} ${className}`;

  if (isExternal) {
    return (
      <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
