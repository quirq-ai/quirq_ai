import type { ReactNode } from "react";

/**
 * The shared furniture for the home page.
 *
 * Server-safe on purpose: every export here is plain markup with no hooks, so
 * the server-rendered sections (the footer, the feature visuals) can import it
 * without dragging a client boundary along. That is also why this file joins
 * class names locally instead of importing `cn` from ui/primitives, which is a
 * "use client" module and throws when called during a server render.
 */
export const classes = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/**
 * Three vertical rhythms, and only three.
 *
 * `chapter` marks the page's structural breaks (the definition, the feature
 * grid, the layer stack); `normal` is a working section; `tight` is for a shelf
 * that belongs to the thing above it more than to the thing below.
 *
 * Tuned against a 1440x900 laptop rather than a 27-inch desktop, which is where
 * this page is actually read. The deck's own spacing was drawn at presentation
 * scale and reads as zoomed-in on a laptop: at the previous values a single
 * chapter break ate a third of the viewport before any content arrived.
 */
const PAD = {
  tight: "py-12 sm:py-14",
  normal: "py-16 sm:py-20",
  chapter: "py-20 sm:py-24 lg:py-28",
} as const;

/**
 * The home page's type scale.
 *
 * Deliberately one step below the site's `.display` / `.display-sm` tokens, and
 * deliberately not a change to those tokens: the story pages use them at full
 * size over the live stage, where a headline is competing with a glass form for
 * the eye. This page is a dense marketing read with seven feature cards, and at
 * display scale it only ever shows the reader two of them at a time.
 *
 * Exported as constants rather than restated per section so the nine sections
 * cannot drift apart the next time one of them is edited alone.
 */
export const TYPE = {
  /**
   * A chapter opener: the single-line centred headline that starts a movement.
   *
   * The deck ran two heading tiers, and the first pass of this rebuild
   * flattened them into one. That was a mistake worth naming: with the chapter
   * openers dropped to the working-section size, "What is a quirq?" sat at 38px
   * above a 19px medium-weight answer, and two sizes that close read as one
   * grey block with no hierarchy at all. The tiers are back, one step down from
   * the deck's presentation scale.
   *
   * Only the centred single-line openers use this. The feature grid's headline
   * is two lines, which already gives it the weight of a chapter without the
   * extra size.
   */
  chapterHeading:
    "text-[clamp(28px,3.6vw,48px)] leading-[1.04] font-semibold tracking-[-0.035em] text-ink",
  /** A working section's h2. */
  heading:
    "text-[clamp(24px,2.9vw,38px)] leading-[1.06] font-semibold tracking-[-0.032em] text-ink",
  /** A card or accordion h3. */
  cardTitle:
    "text-[clamp(16px,1.25vw,20px)] leading-[1.2] font-semibold tracking-[-0.022em] text-ink",
  /** Body copy inside a card or panel. Never text-faint on those surfaces. */
  cardBody:
    "text-[clamp(12.5px,0.95vw,14.5px)] leading-[1.5] text-dim",
  /** The all-caps mono heads in the workflow and ROI lists. */
  monoHead:
    "font-mono text-[clamp(11px,1.05vw,14px)] tracking-[0.1em] font-medium",
} as const;

export function Section({
  id,
  labelledBy,
  rhythm = "normal",
  className,
  children,
}: {
  id: string;
  labelledBy?: string;
  rhythm?: keyof typeof PAD;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={classes("relative w-full", PAD[rhythm], className)}
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        {children}
      </div>
    </section>
  );
}

/**
 * The panel material, carried over from the deck.
 *
 * The one place this page steps outside `border-hair`: these plates are a
 * light grey rather than black, and a 10%-of-ink hairline disappears on them.
 */
export const CARD =
  "relative overflow-hidden rounded-[20px] border border-white/[0.16] " +
  "bg-[linear-gradient(180deg,rgba(54,54,54,0.86),rgba(25,25,25,0.87))]";

/**
 * Chrome for a product screenshot.
 *
 * The captures are opaque near-black plates, so they must not be screen-blended
 * the way the rendered art is: screen would wash the UI out. They get a real
 * bezel instead, which also stops a dark screenshot from dissolving into a dark
 * page.
 */
export function ScreenFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classes(
        "relative overflow-hidden rounded-[18px] border border-white/[0.14] bg-[#090b0d] sm:rounded-[22px]",
        "shadow-[0_28px_90px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/[0.06] ring-inset"
      />
    </div>
  );
}
