import Link from "next/link";
import { QuirqLogo } from "@/components/ui/quirq-logo";
import { SocialLinks } from "@/components/ui/social-links";

/**
 * The three link columns, carried over from the deck's `FOOTER_COLUMNS`.
 *
 * The labels are authored in caps because that is how they were written, not
 * because a `text-transform` produced them: `.label` uppercases too, but a
 * screen reader and a copy/paste both get the real string this way.
 */
const FOOTER_COLUMNS = [
  [
    { label: "PRODUCTS", href: "/dashboard" },
    { label: "RESEARCH", href: "/research" },
    { label: "WRITING", href: "/research" },
  ],
  [
    { label: "GET STARTED", href: "/products" },
    { label: "DOCUMENTATION", href: "/what-is-quirq" },
    { label: "WHITE PAPER", href: "/whitepaper" },
  ],
  [
    { label: "MACHINE SPEED", href: "/how-it-works" },
    { label: "LLM.TXT", href: "/llm.txt" },
    { label: "XO.BUILDERS", href: "https://xo.builders", newTab: true },
  ],
] as const;

/**
 * The home page's own footer. `SiteFooter` serves the inner routes and keeps
 * its spectrum hairline; this surface already carries two value steps of its
 * own (the #202020 plate, then the #1a1a1a bar), and a rainbow rule on top of
 * both would be one signal too many.
 *
 * A server component on purpose: nothing here animates or reacts, so it has no
 * business in the client bundle.
 */
export function HomeFooter() {
  return (
    <footer className="relative border-t border-hair-soft bg-[#202020]">
      <div className="mx-auto grid w-full max-w-[1180px] gap-y-8 px-5 pt-6 pb-12 sm:px-8 lg:grid-cols-[200px_minmax(0,1fr)_auto] lg:gap-x-[clamp(56px,8vw,120px)] lg:px-11">
        <div className="flex items-center">
          <QuirqLogo className="h-[22px] w-auto" />
        </div>

        <nav aria-label="Footer navigation">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column, columnIndex) => (
              <ul
                key={columnIndex}
                className="flex flex-col items-start gap-2"
              >
                {column.map((link) => (
                  <li key={link.label}>
                    {/*
                      The negative margins cancel the padding exactly, so the
                      tap target grows to 40px without shifting a single
                      baseline. Same trick as components/ui/footer.tsx.
                    */}
                    {"newTab" in link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${link.label} (opens in a new tab)`}
                        className="label -mx-2 -my-2 px-2 py-2 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="label -mx-2 -my-2 px-2 py-2 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </nav>

        <SocialLinks className="lg:justify-self-end" />
      </div>

      {/*
        A normal flow row, not the absolutely pinned bar the Figma drew: pinned,
        it would overlap the columns the moment the nav wrapped to two.
      */}
      <div className="grid h-8 place-items-center bg-[#1a1a1a] font-mono text-[10px] tracking-[0.1em] text-dim uppercase">
        COPYRIGHT 2026 • QUIRQ · BY XO LABS
      </div>
    </footer>
  );
}
