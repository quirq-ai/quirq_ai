import type { ReactNode } from "react";
import { QuirqLogo } from "./quirq-logo";
import { SocialLinks } from "./social-links";

type FooterLink = {
  href: string;
  label: string;
  newTab?: boolean;
};

/**
 * The footer rail.
 *
 * Deliberately short. The developer deep-dives that used to live here (the
 * journey studio and its loader, the dashboard, beats, the engine walkthrough)
 * came off: they are build documentation rather than places a reader of this
 * site is looking for, and /docs indexes them under Engine reference, which is
 * now their route in.
 */
const LINKS: readonly FooterLink[] = [
  { href: "/demo", label: "Demo", newTab: false },
  { href: "/docs", label: "Docs", newTab: false },
  { href: "/whitepaper", label: "Whitepaper", newTab: false },
  { href: "/llm.txt", label: "llm.txt", newTab: true },
  { href: "https://xo.builders", label: "xo.builders", newTab: true },
  { href: "mailto:suraj@xo.builders", label: "Contact", newTab: false },
];

/**
 * The compact footer shell shared by the research surface and the home page.
 * Its content slots keep route-specific labels out of the visual component.
 */
export function SiteFooter({
  links = LINKS,
  brandSuffix = "· by XO Labs",
  note = (
    <>
      Tokens meter consumption.{" "}
      <span className="glass-text">Quirqs meter delivery.</span>
    </>
  ),
  trailing = <SocialLinks />,
}: {
  links?: readonly FooterLink[];
  brandSuffix?: ReactNode;
  note?: ReactNode;
  trailing?: ReactNode;
} = {}) {
  return (
    <footer className="relative mt-24">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-end justify-between gap-7 px-5 pb-9 sm:px-8 lg:px-11">
        <div>
          <div className="flex items-center gap-2.5">
            <QuirqLogo className="h-[22px] w-auto" />
            {brandSuffix == null ? null : (
              <span className="text-[13px] text-faint">{brandSuffix}</span>
            )}
          </div>
          <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
            {note}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-7">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              rel={link.newTab ? "noopener noreferrer" : undefined}
              className="label px-2 py-2 -mx-2 -my-2 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          {trailing}
        </div>
      </div>
      <div className="spectrum-rule h-px w-full opacity-50" />
    </footer>
  );
}
