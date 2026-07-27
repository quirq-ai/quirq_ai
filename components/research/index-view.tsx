import Link from "next/link";
import { Reveal, Rise } from "@/components/ui/primitives";
import {
  POSTS,
  TOPICS,
  postsInTopic,
  totalReadingMinutes,
  type IndexView,
} from "@/lib/research";
import { LeadCard, PostCard } from "./card";

/**
 * The one listing surface. The front page, every numbered page, and every
 * topic archive render through here from a resolved IndexView, so the three
 * routes above it stay thin and cannot drift apart.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Where page n of a pool lives. Page one is the pool's own bare URL. */
const pageHref = (basePath: string, page: number) =>
  page === 1 ? basePath : `${basePath}/page/${page}`;

/** A counted fact about the program, read straight off the data. */
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <p className="flex items-baseline gap-2.5">
      <span className="numeric text-[19px] font-semibold text-ink">{value}</span>
      <span className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
        {label}
      </span>
    </p>
  );
}

function TopicChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "focus-on-ink inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] text-void uppercase"
          : "inline-flex items-center gap-2 rounded-full border border-hair px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase transition-colors duration-300 hover:border-ink/30 hover:text-ink"
      }
    >
      {label}
      <span className={active ? "numeric text-void/55" : "numeric text-faint"}>
        {pad(count)}
      </span>
    </Link>
  );
}

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

function Pagination({
  basePath,
  page,
  pageCount,
}: {
  basePath: string;
  page: number;
  pageCount: number;
}) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  // Labelled by position, not by date: the stream is in reading order, so
  // "newer" and "older" would both be claims the data does not make.
  return (
    <nav
      aria-label="Research pages"
      className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-hair pt-7"
    >
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1)}
          rel="prev"
          className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
        >
          <span aria-hidden>&larr;</span> Previous
        </Link>
      ) : (
        // Kept in flow rather than dropped, so the page numbers do not slide
        // sideways between page one and page two.
        <span className="label text-faint/50" aria-hidden>
          &larr; Previous
        </span>
      )}

      <ol className="flex items-center gap-1.5">
        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span
                aria-current="page"
                className="numeric flex h-9 w-9 items-center justify-center rounded-full border border-ink/25 bg-white/[0.06] font-mono text-[11px] text-ink"
              >
                {pad(n)}
              </span>
            ) : (
              <Link
                href={pageHref(basePath, n)}
                aria-label={`Page ${n}`}
                className="numeric flex h-9 w-9 items-center justify-center rounded-full border border-transparent font-mono text-[11px] text-faint transition-colors duration-300 hover:border-hair hover:text-ink"
              >
                {pad(n)}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {page < pageCount ? (
        <Link
          href={pageHref(basePath, page + 1)}
          rel="next"
          className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
        >
          Next <span aria-hidden>&rarr;</span>
        </Link>
      ) : (
        <span className="label text-faint/50" aria-hidden>
          Next &rarr;
        </span>
      )}
    </nav>
  );
}

export function ResearchIndexView({ view }: { view: IndexView }) {
  const { topic, lead, cards, page, pageCount, total } = view;
  const basePath = topic ? `/research/topic/${topic.slug}` : "/research";

  // One line, wherever the reader is: which slice of the program this is.
  const standing = topic
    ? `${total} ${total === 1 ? "note" : "notes"} in ${topic.label}`
    : pageCount > 1
      ? `Page ${page} of ${pageCount} · ${total} notes`
      : `${total} notes`;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pt-24 pb-4 sm:px-8 sm:pt-28 lg:px-11">
      {/* Two columns from lg, so the masthead is as tall as its tallest half
          rather than the sum of both, and the feature card below it stays on
          the first screen of a laptop. Bottom-aligned: the headline and the
          standfirst sit on one baseline. */}
      <header className="grid gap-y-7 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-x-14">
        <div>
          <Rise className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: "var(--spectrum)" }}
            />
            <span className="label">The thesis</span>
            <span className="spectrum-rule h-px w-12 opacity-70" />
          </Rise>

          {/* The paper's own title, broken and treated exactly as its hero
              breaks it in app/whitepaper/beats.tsx, so the index and the paper
              read as one argument. Revise the two together. */}
          <h1 className="display-sm mt-5">
            <Reveal delay={0.05}>A unit of work</Reveal>
            <Reveal delay={0.13}>
              {/* Styling only: research pages carry no live stage behind the
                  scrim, so there is no light to cut a hole for. */}
              for <span className="glass-text">intelligence</span>.
            </Reveal>
          </h1>
        </div>

        <div>
          <Rise delay={0.22}>
            <p className="lede max-w-[48ch] lg:text-[16px]">
              Experiments, frameworks, and field notes from the program behind
              quirq. Hypotheses ship with falsifiers; results land here as they
              land.
            </p>
          </Rise>

          <Rise delay={0.28}>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-9 gap-y-3">
              <Stat value={POSTS.length} label="notes" />
              <Stat value={TOPICS.length} label="topics" />
              <Stat value={totalReadingMinutes} label="minutes of reading" />
            </div>
          </Rise>

          {/* The argument in one place, and the version of record. Bottom of
              the column, so on a wide screen they sit on the headline's
              baseline rather than floating mid-masthead. */}
          <Rise delay={0.34}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/whitepaper"
                className="focus-on-ink group inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-void uppercase transition-transform duration-300 hover:-translate-y-0.5"
              >
                Read the whitepaper
                <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              {/* The PDF keeps its new tab: it is a document, not a page. */}
              <a
                href="/whitepaper/pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink/85 uppercase transition-colors duration-300 hover:border-ink/30 hover:text-ink"
              >
                The PDF version
                <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </Rise>
        </div>
      </header>

      <Rise delay={0.34}>
        <div className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-3 border-t border-hair pt-6 sm:mt-9">
          <nav
            aria-label="Research topics"
            className="flex flex-wrap items-center gap-2.5"
          >
            <TopicChip
              href="/research"
              label="All notes"
              count={POSTS.length}
              active={!topic}
            />
            {TOPICS.map((it) => (
              <TopicChip
                key={it.slug}
                href={`/research/topic/${it.slug}`}
                label={it.label}
                count={postsInTopic(it.slug).length}
                active={topic?.slug === it.slug}
              />
            ))}
          </nav>

          {/* Its own line on phones, the far end of the rail from sm. */}
          <p className="w-full font-mono text-[10px] tracking-[0.14em] text-faint uppercase sm:ml-auto sm:w-auto sm:text-right">
            {standing}
          </p>
        </div>
      </Rise>

      {topic && (
        <Rise delay={0.38}>
          <p className="mt-6 max-w-[62ch] text-[14.5px] leading-[1.7] text-dim">
            {topic.blurb}
          </p>
        </Rise>
      )}

      {lead && (
        <Rise delay={0.42} className="mt-9 sm:mt-11">
          <LeadCard post={lead} />
        </Rise>
      )}

      {cards.length > 0 && (
        // Three across only when there are three to fill the row; a short tail
        // (page two, a small archive) reads better as wider cards than as one
        // narrow column with an empty third of the page beside it.
        <div
          className={`mt-12 grid gap-x-8 gap-y-12 border-t border-hair pt-12 sm:grid-cols-2 ${
            cards.length >= 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {cards.map((post, i) => (
            <Rise key={post.slug} delay={0.06 + i * 0.06}>
              <PostCard post={post} />
            </Rise>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <Pagination basePath={basePath} page={page} pageCount={pageCount} />
      )}

      <Rise delay={0.2}>
        <p className="mt-10 font-mono text-[10.5px] leading-relaxed tracking-[0.08em] text-faint">
          Adapted from the XO research program ·{" "}
          <a
            href="https://docs.xo.builders/research"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-dim"
          >
            docs.xo.builders/research
          </a>
        </p>
      </Rise>
    </div>
  );
}
