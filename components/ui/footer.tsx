import { Mark } from "./primitives";

const LINKS = [
  { href: "/demo", label: "Demo", newTab: false },
  { href: "/journey", label: "Journey", newTab: false },
  // The dashboard is not in the nav (its breakpoints are spent), so the
  // footer is where it stays reachable from every page.
  { href: "/dashboard", label: "Dashboard", newTab: false },
  { href: "/whitepaper", label: "Whitepaper", newTab: false },
  // The nav has no room for Beats at any breakpoint, so this is its only
  // route in. It is a dev deep-dive, which is why it lost the seat.
  { href: "/beats", label: "Beats", newTab: false },
  // The engine walkthrough is a dev deep-dive like Beats, so the footer is
  // its only route in.
  { href: "/engine", label: "Engine", newTab: false },
  // Same reasoning: the journey loader is a tool, and the footer is where the
  // tools live.
  { href: "/journey/load", label: "Loader", newTab: false },
  { href: "/llm.txt", label: "llm.txt", newTab: true },
  { href: "https://xo.builders", label: "xo.builders", newTab: true },
  { href: "mailto:suraj@xo.builders", label: "Contact", newTab: false },
];

/**
 * The compact footer for inner pages. The home page keeps its own footer
 * inside the invite beat, where it needs a gradient base to sit on over the
 * glass; this one lives on plain black and needs none of that.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-24">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-end justify-between gap-7 px-5 pb-9 sm:px-8 lg:px-11">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark className="h-[18px] w-auto text-ink" />
            <span className="font-mark text-[17px] font-semibold">quirq</span>
            <span className="text-[13px] text-faint">· by XO Labs</span>
          </div>
          <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
            Tokens meter consumption.{" "}
            <span className="glass-text">Quirqs meter delivery.</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-5 sm:gap-7">
          {LINKS.map((link) => (
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
        </div>
      </div>
      <div className="spectrum-rule h-px w-full opacity-50" />
    </footer>
  );
}
