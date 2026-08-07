import type { Metadata } from "next";
import Link from "next/link";
import { InstallCommand } from "@/components/ui/install-command";
import { Reveal, Rise } from "@/components/ui/primitives";
import { RELEASE_NOTES, SECTIONS, type DocEntry } from "@/lib/docs";

const DESCRIPTION =
  "Documentation for quirq: what the unit is, how to deploy an environment, the unit-of-work guides in reading order, the research program, and the engine reference.";

export const metadata: Metadata = {
  title: "Docs",
  description: DESCRIPTION,
  openGraph: { title: "Docs", description: DESCRIPTION, url: "/docs" },
  twitter: { description: DESCRIPTION },
};

const pad = (n: number) => String(n + 1).padStart(2, "0");

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One entry. Internal destinations use Link; the few that leave the site say
 * so with a mark and an announcement, the way the rest of the site does.
 */
function Entry({ entry, index }: { entry: DocEntry; index: number }) {
  const inner = (
    <>
      <span className="numeric shrink-0 pt-0.5 font-mono text-[11px] tracking-[0.16em] text-faint transition-colors group-hover:text-dim">
        {pad(index)}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-[16.5px] font-semibold tracking-[-0.015em] text-ink">
            {entry.title}
          </span>
          {entry.start ? (
            <span className="rounded-full border border-hair px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-dim uppercase">
              Start here
            </span>
          ) : null}
          {entry.external ? (
            <Arrow className="text-faint transition-colors group-hover:text-ink" />
          ) : null}
        </span>
        <span className="mt-1.5 block text-[13.5px] leading-[1.65] text-dim">
          {entry.blurb}
        </span>
      </span>
    </>
  );

  const className =
    "group flex gap-4 border-t border-hair py-5 transition-colors hover:bg-white/[0.02]";

  if (entry.external) {
    return (
      <a
        href={entry.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={entry.href} className={className}>
      {inner}
    </Link>
  );
}

export default function Docs() {
  return (
    <div className="mx-auto w-full max-w-[860px] px-5 pt-24 pb-4 sm:px-8 sm:pt-28">
      <header>
        <Rise className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{ background: "var(--spectrum)" }}
          />
          <span className="label">Documentation</span>
          <span className="spectrum-rule h-px w-12 opacity-70" />
        </Rise>

        <h1 className="display-sm mt-5">
          <Reveal delay={0.05}>Everything, and</Reveal>
          <Reveal delay={0.13}>
            where to <span className="glass-text">start</span>.
          </Reveal>
        </h1>

        <Rise delay={0.2}>
          {/* `.lede` is declared unlayered in globals.css and Tailwind's
              utilities sit in @layer utilities, so the width it sets wins on
              cascade order no matter the specificity. Hence the `!`. */}
          <p className="lede mt-6 !max-w-[58ch] lg:text-[16px]">
            The unit explained in reading order, the research it rests on, and
            the reference for the engine this site runs on. Every page listed
            here is one that exists; nothing below is a placeholder.
          </p>
        </Rise>

        <Rise delay={0.26}>
          <div className="mt-8">
            <p className="label">Run it on your own machine</p>
            <div className="mt-3.5 w-fit">
              <InstallCommand />
            </div>
          </div>
        </Rise>

        {/* The contents, so a long index is navigable from its own top. */}
        <Rise delay={0.32}>
          <nav
            aria-label="Documentation sections"
            className="mt-10 flex flex-wrap gap-2.5 border-t border-hair pt-7"
          >
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-hair px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase transition-colors duration-300 hover:border-ink/30 hover:text-ink"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </Rise>
      </header>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="mt-16 scroll-mt-28"
        >
          <h2
            id={`${section.id}-heading`}
            className="text-[clamp(21px,2.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          >
            {section.title}
          </h2>
          <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.7] text-dim">
            {section.blurb}
          </p>

          <div className="mt-7 border-b border-hair">
            {section.entries.map((entry, i) => (
              <Entry key={entry.href} entry={entry} index={i} />
            ))}
          </div>
        </section>
      ))}

      {/* Called out rather than buried: this is the promise the Writings page
          makes when it points "Changelog → Docs" at this page. */}
      <section
        aria-labelledby="release-notes-heading"
        className="mt-16 rounded-2xl border border-hair bg-black/40 p-6 sm:p-7"
      >
        <h2 id="release-notes-heading" className="label">
          Release notes
        </h2>
        <p className="mt-4 max-w-[62ch] text-[14.5px] leading-[1.7] text-dim">
          {RELEASE_NOTES.blurb}
        </p>
        <a
          href={RELEASE_NOTES.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink/85 uppercase transition-colors duration-300 hover:border-ink/30 hover:text-ink"
        >
          Open the changelog
          <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </section>

      <p className="mt-12 font-mono text-[10.5px] leading-relaxed tracking-[0.08em] text-faint">
        Something missing? Tell us at{" "}
        <a
          href="mailto:hello@quirq.ai"
          className="underline underline-offset-4 transition-colors hover:text-dim"
        >
          hello@quirq.ai
        </a>
        .
      </p>
    </div>
  );
}
