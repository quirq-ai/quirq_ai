import type { Metadata } from "next";
import Link from "next/link";
import { BodyBlock } from "@/components/prose/body";
import { Reveal, Rise } from "@/components/ui/primitives";
import { SECTIONS, WHITEPAPER, readingMinutes } from "@/lib/whitepaper";

export const metadata: Metadata = {
  title: "Whitepaper",
  description: WHITEPAPER.dek,
  openGraph: {
    type: "article",
    title: WHITEPAPER.title,
    description: WHITEPAPER.dek,
    url: "/whitepaper",
  },
};

/** Section ordinals are the paper's own numbers; unnumbered matter gets a dot. */
const ordinal = (n: number | null) => (n === null ? "·" : String(n).padStart(2, "0"));

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

/** The contents list. Rendered twice: in the flow, and sticky beside the text. */
function Contents({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Paper contents" className={className}>
      <p className="label">Contents</p>
      <ol className="mt-4 space-y-2.5">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex gap-3 text-[13.5px] leading-[1.5] text-ink/65 transition-colors hover:text-ink"
            >
              <span className="numeric shrink-0 pt-px font-mono text-[10.5px] text-faint transition-colors group-hover:text-dim">
                {ordinal(section.number)}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function Whitepaper() {
  return (
    // The text column stays the 760px of a research note, so the paper reads
    // like the rest of the site. From xl the contents rail sits beside it and
    // the pair centres together; below xl the same list is in the flow.
    <div className="mx-auto w-full max-w-[760px] px-5 pt-24 sm:px-8 sm:pt-28 xl:max-w-[1052px] xl:grid xl:grid-cols-[760px_212px] xl:gap-x-20">
      <article>
        <header>
          <Rise>
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
              <span
                className="h-2 w-2 rounded-[3px]"
                style={{ background: "var(--spectrum)" }}
              />
              <span>Whitepaper</span>
              <span aria-hidden>·</span>
              <span>{WHITEPAPER.date}</span>
              <span aria-hidden>·</span>
              <span>{WHITEPAPER.pages} pages</span>
              <span aria-hidden>·</span>
              <span>{readingMinutes} min read</span>
            </p>
          </Rise>

          {/* Broken and treated exactly as the research index breaks it in
              components/research/index-view.tsx, so the index and the paper
              read as one argument. Revise the two together. */}
          <h1 className="display-sm mt-6">
            <Reveal delay={0.05}>A unit of work</Reveal>
            <Reveal delay={0.13}>
              {/* Styling only: this page carries no live stage behind the
                  scrim, so there is no light to cut a hole for. */}
              for <span className="glass-text">intelligence</span>.
            </Reveal>
          </h1>

          <Rise delay={0.2}>
            <p className="mt-6 max-w-[54ch] text-[16.5px] leading-[1.7] text-ink/75">
              {WHITEPAPER.dek}
            </p>
          </Rise>

          <Rise delay={0.26}>
            <p className="mt-5 font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
              {WHITEPAPER.authors} ·{" "}
              <a
                href={`mailto:${WHITEPAPER.correspondence}`}
                className="underline decoration-hair underline-offset-4 transition-colors hover:text-dim"
              >
                {WHITEPAPER.correspondence}
              </a>
            </p>
          </Rise>

          <Rise delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* The PDF keeps its new tab: it is a document, not a page. */}
              <a
                href="/whitepaper/pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-on-ink group inline-flex items-center gap-3 rounded-full bg-ink py-3 pr-3 pl-5 font-mono text-[11px] tracking-[0.14em] text-void uppercase transition-transform duration-300 hover:-translate-y-0.5"
              >
                Download the paper
                <span className="numeric rounded-full bg-void/12 px-2.5 py-1 text-[10px] tracking-[0.1em] text-void/70">
                  PDF · {WHITEPAPER.pdfSize} · {WHITEPAPER.version}
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>

              <Link
                href="/research"
                className="group inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink/85 uppercase transition-colors duration-300 hover:border-ink/30 hover:text-ink"
              >
                Research notes
                <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              <a
                href="/llm.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink/85 uppercase transition-colors duration-300 hover:border-ink/30 hover:text-ink"
              >
                llm.txt
                <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </Rise>

          {/* The reference page's standing note, and the honest one: what the
              reader is getting, and where to send a correction. */}
          <Rise delay={0.38}>
            <p className="mt-7 max-w-[62ch] border-t border-hair pt-6 text-[13.5px] leading-[1.7] text-dim">
              Every claim in the paper is tiered (sourced, derived, measured,
              open) against a public validation program, and the open ones carry
              the result that would refute them. This page is the paper in full;
              the typeset PDF is the version of record.
            </p>
          </Rise>
        </header>

        <Rise delay={0.42}>
          <section
            aria-labelledby="abstract"
            className="mt-12 rounded-2xl border border-hair bg-black/40 p-6 sm:p-7"
          >
            <h2 id="abstract" className="label">
              Abstract
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-ink/75">
              {WHITEPAPER.abstract}
            </p>
          </section>
        </Rise>

        {/* Below xl the rail has nowhere to sit, so the same list runs in the
            flow instead. The two are mutually exclusive by display, so only
            one is ever in the accessibility tree. */}
        <Rise delay={0.46}>
          <Contents className="mt-12 border-t border-hair pt-7 xl:hidden" />
        </Rise>

        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-28"
          >
            <h2
              id={`${section.id}-heading`}
              className="mt-16 flex items-baseline gap-3 text-[clamp(21px,2.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
            >
              <span className="numeric shrink-0 font-mono text-[12px] tracking-[0.1em] text-faint">
                {ordinal(section.number)}
              </span>
              {section.title}
            </h2>

            {section.blocks.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}
          </section>
        ))}

        <footer className="mt-16 border-t border-hair pt-7">
          <p className="font-mono text-[10.5px] leading-relaxed tracking-[0.08em] text-faint">
            {WHITEPAPER.title} · {WHITEPAPER.date} ·{" "}
            <a
              href="/whitepaper/pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-dim"
            >
              the typeset PDF
              <span className="sr-only">(opens in a new tab)</span>
            </a>{" "}
            is the version of record. Questions or corrections:{" "}
            <a
              href={`mailto:${WHITEPAPER.correspondence}`}
              className="underline underline-offset-4 transition-colors hover:text-dim"
            >
              {WHITEPAPER.correspondence}
            </a>
            .
          </p>
        </footer>
      </article>

      {/* The rail only exists where there is room for it beside the column. */}
      <aside className="hidden xl:block">
        <Contents className="sticky top-28" />
      </aside>
    </div>
  );
}
