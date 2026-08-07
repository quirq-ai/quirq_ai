"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { CARD, ScreenFrame, Section, TYPE, classes } from "@/components/home/shell";
import {
  ContextLadder,
  DeployTimeline,
  EfficiencyPanel,
  RuntimeLattice,
  ScalingArcs,
} from "@/components/home/feature-visuals";
import { Mark, Reveal } from "@/components/ui/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The feature grid.
 *
 * Two of these cards used to ship as flat PNGs that had the panel border and
 * the panel gradient baked into the export, so they were the only two panels on
 * the page that could not inherit a token. Every card now wears the shared
 * `CARD` material and the art is drawn on top of it, which is why the wide
 * cards look identical to the narrow ones at the edges.
 */

type CardId =
  | "scaling"
  | "production"
  | "context"
  | "cost"
  | "runtime"
  | "security"
  | "efficiency";

type Card = {
  id: CardId;
  title: string;
  body: string;
  /** Spans two columns from `sm` up. */
  wide?: boolean;
};

/**
 * DOM order is reading order at every width, so this array is the only place
 * the sequence is stated. The two wide cards land at the start of a row in both
 * the two-column and the three-column grid, which is what keeps the rows solid
 * with no filler cell: 2+1 / 1+2 / 1+1+1 at `lg`.
 */
const CARDS: Card[] = [
  {
    id: "scaling",
    title: "Dynamic Scaling",
    body: "Spin up an environment with the press of a button. Our proprietary scaling solution auto provisions the capacity, specs and location you need.",
    wide: true,
  },
  {
    id: "production",
    title: "Production-ready",
    body: "Deploy direct to AWS, GCP, Azure or any Terraform compatible stack.",
  },
  {
    id: "context",
    title: "Context Optimization",
    body: "Our engine interprets your goals and draws from your data.",
  },
  {
    id: "cost",
    title: "Unified Cost Observability",
    body: "Each environment comes with our Quirq analytics software that details the costs, time spent, and tasks of your agents in real-time.",
    wide: true,
  },
  {
    id: "runtime",
    title: "Universal Runtime",
    body: "Use any model, harness or framework within your environment.",
  },
  {
    id: "security",
    title: "Security & Compliance",
    body: "Our software can be deployed under your existing compliance standards.",
  },
  {
    id: "efficiency",
    title: "Efficiency Charts",
    body: "Understand the human input to agent output efficiency ratio.",
  },
];

const RUNTIME_CHIPS = [
  "Memory",
  "Context",
  "Skills",
  "Artifacts",
  "Documents",
  "Git",
  "Integrations",
  "MCP",
] as const;

/** The box the flow-layout visuals sit in: whatever height the copy left over. */
const VISUAL_WELL =
  "relative z-10 flex min-h-0 flex-1 items-center px-6 pt-7 pb-6 sm:px-7 sm:pt-8 sm:pb-7";

function CardVisual({ id }: { id: CardId }) {
  switch (id) {
    // Absolute and full-bleed: the bands radiate from a focus just inside the
    // card's own bottom-right corner, so they need the whole box, not the
    // leftover space under the copy.
    case "scaling":
      return <ScalingArcs />;

    case "production":
      return (
        <div className={VISUAL_WELL}>
          <DeployTimeline />
        </div>
      );

    // The ladder is capped from the outside rather than by overriding its own
    // `max-w`: two arbitrary max-width utilities on one element resolve by CSS
    // source order, which is not something a caller should be betting on.
    case "context":
      return (
        <div className={VISUAL_WELL}>
          <div className="mx-auto w-full max-w-[240px]">
            <ContextLadder />
          </div>
        </div>
      );

    // The capture runs off the bottom edge of the card, so the frame drops its
    // bottom border and radius rather than drawing a seam mid-image. `ml-auto`
    // with the cap keeps it pinned to the right as it stops growing: the export
    // is 803px at 1x and this box is otherwise wider than that between `sm` and
    // `lg`, where the wide card fills the whole container.
    case "cost":
      return (
        <div className="absolute inset-x-0 top-[40%] bottom-0 left-5 ml-auto max-w-[803px] sm:left-8">
          <ScreenFrame className="h-full rounded-b-none border-b-0">
            <Image
              src="/assets/home-v9/cost-card-art.png"
              alt="Quirq session clusters grouped by agent: Claude Code, Cursor and Codex."
              fill
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 64px), 50vw"
              // Not `object-top`. The capture opens on ~35% of empty screen
              // above the first cluster, and once the cards came down to a
              // 384x408 aspect this window got short enough that top-aligning
              // showed the empty part and cropped the labelled clusters away.
              // 30% keeps a sliver of the bezel and lands the clusters in view.
              className="object-cover object-[center_30%]"
            />
          </ScreenFrame>
        </div>
      );

    case "runtime":
      return (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 pt-7 pb-6 sm:px-7 sm:pt-8 sm:pb-7">
          <RuntimeLattice />
          {/* Real list semantics: these are eight named capabilities, not
              decoration, and they are the only text on this card that says
              what a runtime actually carries. */}
          <ul
            aria-label="Runtime capabilities"
            className="flex flex-wrap justify-center gap-1"
          >
            {RUNTIME_CHIPS.map((chip) => (
              <li
                key={chip}
                className="rounded-[5px] bg-white/[0.13] px-2 py-1 font-mono text-[9.5px] font-medium tracking-[0.02em] text-dim"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      );

    // Three dashed rings closing on the mark. Inline rather than in
    // feature-visuals because it is four spans with no data behind it; the
    // exports there each encode something (steps, tiles, a ramp).
    //
    // It is sized off card WIDTH (aspect-square w-[74%]) but placed off card
    // HEIGHT, so the two move independently: when the cards came down to a
    // 384x408 aspect the outer ring started running past the bottom edge,
    // worst at 1023px where it overshot by 128px and read as truncated rather
    // than as a bleed. 26% clears it at every width measured.
    case "security":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute top-[26%] left-1/2 aspect-square w-[74%] -translate-x-1/2"
        >
          <span className="absolute inset-0 rounded-full border border-dashed border-white/[0.28]" />
          <span className="absolute inset-10 rounded-full border border-dashed border-white/[0.28]" />
          <span className="absolute inset-20 rounded-full border border-dashed border-white/[0.28]" />
          <Mark className="absolute top-1/2 left-1/2 h-7 w-auto -translate-x-1/2 -translate-y-1/2 text-white/70" />
        </div>
      );

    case "efficiency":
      return (
        <div className={VISUAL_WELL}>
          <EfficiencyPanel />
        </div>
      );
  }
}

export function Features() {
  return (
    <Section
      id="home-features"
      labelledBy="features-title"
      rhythm="chapter"
      className="isolate"
    >
      {/* The burst is an opaque near-black plate, so `mix-blend-screen` is what
          removes the rectangle. Its core is blown out to white and the headline
          sits directly on it, so the bottom-fading overlay below and the
          `.over-stage` shadow on the h2 are both load-bearing for contrast at
          some width, not belt-and-braces. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(58vw,820px)]"
      >
        <Image
          src="/assets/home-v9/feature-burst.png"
          alt=""
          fill
          sizes="100vw"
          className="plate-top object-cover object-top opacity-80 mix-blend-screen"
        />
        <span className="absolute inset-0 bg-linear-to-b from-black/45 via-black/20 to-black" />
      </div>

      <h2
        id="features-title"
        className={classes(TYPE.heading, "over-stage text-center")}
      >
        <Reveal delay={0.05}>Launch Agentic Environments</Reveal>
        <Reveal delay={0.13}>with Speed and Security</Reveal>
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:mt-20 lg:grid-cols-3 lg:gap-x-[clamp(16px,1.7vw,24px)] lg:gap-y-[clamp(18px,1.8vw,26px)]">
        {CARDS.map((card, index) => (
          <motion.article
            key={card.id}
            className={classes(
              CARD,
              "flex flex-col transition-colors duration-300 hover:border-white/[0.26]",
              card.wide
                ? "min-h-[280px] sm:col-span-2 lg:aspect-[802/408] lg:min-h-0"
                : "min-h-[290px] sm:min-h-[330px] lg:aspect-[384/408] lg:min-h-0",
            )}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            // Keyed off the column, not the absolute index. Seven cards at
            // index * 0.07 would still be settling half a second after the row
            // entered view; by column each row lights left to right in 140ms
            // and every row reads the same.
            transition={{ duration: 0.85, delay: (index % 3) * 0.07, ease: EASE }}
          >
            <div className="relative z-10 px-5 pt-5 sm:px-6 sm:pt-6">
              <h3 className={TYPE.cardTitle}>{card.title}</h3>
              <p className={classes(TYPE.cardBody, "mt-2 max-w-[46ch]")}>
                {card.body}
              </p>
            </div>

            <CardVisual id={card.id} />
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
