import Link from "next/link";
import type { ReactNode } from "react";
import { QuirqLogo } from "./quirq-logo";
import { SocialLinks } from "./social-links";

type FooterLink = { href: string; label: string; newTab?: boolean };
const LINKS: readonly FooterLink[] = [
  { href: "/products", label: "Space" },
  { href: "/xo", label: "Cloud" },
  { href: "/docs", label: "Docs" },
  { href: "/research", label: "Research" },
  { href: "/writing", label: "Writing" },
  { href: "mailto:hello@quirq.ai", label: "Contact" },
];

export function SiteFooter({
  links = LINKS,
  brandSuffix = null,
  note = "Space · XO · Machine Speed",
  trailing = <SocialLinks />,
}: {
  links?: readonly FooterLink[];
  brandSuffix?: ReactNode;
  note?: ReactNode;
  trailing?: ReactNode;
} = {}) {
  return (
    <footer className="relative mt-16 border-t border-border bg-background py-8 text-foreground">
      <div className="site-container flex flex-wrap items-start justify-between gap-8">
        <div>
          <Link
            href="/"
            aria-label="quirq, home"
            className="inline-flex min-h-11 items-center gap-3 rounded-md"
          >
            <QuirqLogo alt="" className="h-6 w-auto" />
            {brandSuffix != null && (
              <span className="text-sm text-muted-foreground">{brandSuffix}</span>
            )}
          </Link>
          {note != null && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                className="inline-flex min-h-11 items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
              >
                {link.label}
                {link.newTab && <span className="sr-only">(opens in a new tab)</span>}
              </a>
            ))}
          </nav>
          {trailing}
        </div>
      </div>
    </footer>
  );
}
