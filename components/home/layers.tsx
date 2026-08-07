"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Section, TYPE, classes } from "@/components/home/shell";
import { ActionLink, Reveal, Rise } from "@/components/ui/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The layer stack: the page's last chapter break.
 *
 * The deck drew the colour rail as its own 23px grid column, which meant its
 * four row heights (304px, then 3 x 48px) had to be hard-coded to match the
 * accordion sitting next to it. Two columns agreeing on pixel heights by hand
 * is the single biggest source of the CSS this rebuild is replacing, and it
 * breaks the moment the copy reflows. Here each row carries its own 4px bar as
 * the first cell of its own grid, so the rail is aligned by structure: a row
 * that grows takes its colour with it and nothing has to be re-measured.
 */

/**
 * The four tones, top to bottom. 01 is the only two-stop rail because OUTPUT is
 * where the stack resolves into delivered work; the rest are single spectrum
 * stops so the column reads as a descent rather than four competing gradients.
 */
const RAIL_TONES = [
  "linear-gradient(180deg,var(--color-spec-blue),var(--color-spec-cyan))",
  "var(--color-spec-green)",
  "var(--color-spec-orange)",
  "var(--color-spec-purple)",
] as const;

const COLLAPSED = [
  { number: "02", label: "AGENT" },
  { number: "03", label: "ENVIRONMENT" },
  { number: "04", label: "RUNTIME" },
] as const;

/**
 * The signature: the four bars draw down in sequence as the stack enters, which
 * is the one place on this page the full spectrum appears as structure instead
 * of as a hairline. `transformOrigin: top` is what makes it read as pouring
 * rather than growing from the middle.
 *
 * The bars carry no observer of their own, and that is the whole point. A bar
 * animating from `scaleY: 0` is a zero-area box, and a zero-area target is
 * exactly the case IntersectionObserver thresholds handle least predictably:
 * the three short rows fired and the tall one never did, so the stack shipped
 * with three of its four colours. The state comes from the stack instead, which
 * is a real box with a real height, and each bar just declares what it looks
 * like in each of the stack's two states.
 *
 * `self-stretch` rather than `h-full` for a second reason found the same way:
 * the collapsed rows have a definite height so `height: 100%` resolves there,
 * but the open card's row is sized by its copy, and against an indefinite grid
 * area 100% resolves to auto: an empty span, zero tall.
 */
const RAIL_BAR = {
  hidden: { scaleY: 0 },
  shown: (index: number) => ({
    scaleY: 1,
    transition: { duration: 0.7, delay: 0.15 + index * 0.09, ease: EASE },
  }),
};

/** The stack: the rise this section would have got from `Rise`, plus the cue. */
const RAIL_STACK = {
  hidden: { y: 26, opacity: 0 },
  shown: { y: 0, opacity: 1, transition: { duration: 1.05, ease: EASE } },
};

function RailBar({ tone, index }: { tone: string; index: number }) {
  return (
    <motion.span
      aria-hidden
      className="block w-full self-stretch"
      style={{ background: tone, transformOrigin: "top" }}
      variants={RAIL_BAR}
      custom={index}
    />
  );
}

export function Layers() {
  return (
    <Section
      id="home-layers"
      labelledBy="layers-title"
      rhythm="chapter"
      className="isolate overflow-hidden"
    >
      {/* The plate blows out to near-white on its right edge and the centred
          headline sits directly over it, so the radial is a contrast
          requirement, not a mood choice. `isolate` on the section keeps the
          -z-10 layer above the page rather than behind it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <Image
          src="/assets/home-v9/layers-background.png"
          alt=""
          fill
          sizes="100vw"
          className="plate-veil object-cover mix-blend-screen opacity-70"
        />
        <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,rgba(0,0,0,0.42),rgba(0,0,0,0.88))]" />
      </div>

      <h2
        id="layers-title"
        className={classes(TYPE.chapterHeading, "over-stage text-center")}
      >
        <Reveal delay={0.05}>Four Layers. One Shape.</Reveal>
      </h2>

      <div className="mt-10 grid items-start gap-y-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.98fr)] lg:gap-x-7">
        <motion.div
          className="flex flex-col gap-px"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.2 }}
          variants={RAIL_STACK}
        >
          <div className="grid grid-cols-[4px_1fr] overflow-hidden rounded-[13px] border border-white/[0.25] bg-[rgba(20,23,24,0.86)]">
            <RailBar tone={RAIL_TONES[0]} index={0} />
            <div className="px-5 py-4">
              <p className="grid grid-cols-[52px_1fr] font-mono text-[clamp(13px,1.25vw,18px)] font-medium text-spec-blue">
                <span>01</span>
                <strong className="font-medium">OUTPUT</strong>
              </p>
              <h3 className={classes(TYPE.cardTitle, "mt-5 max-w-[24ch]")}>
                The Work Your Agents Deliver
              </h3>
              {/* The size carries `!` because `.lede` is unlayered in
                  globals.css and an unlayered rule beats anything Tailwind
                  puts in @layer utilities. Without it this reads at the
                  story-page 15-18px while every other card came down. */}
              <p className="lede mt-3 max-w-[42ch] text-[clamp(13px,1.05vw,15.5px)]!">
                Measure the files, decisions, and verified outcomes your agents
                produce across models, harnesses, environments, and runtimes.
              </p>
            </div>
          </div>

          {/* A tighter radius than the open card: at 40px tall, a 13px corner
              would pinch the 4px bar into a lozenge. */}
          {COLLAPSED.map((layer, i) => (
            <div
              key={layer.number}
              className="grid h-10 grid-cols-[4px_1fr] overflow-hidden rounded-[9px]"
            >
              <RailBar tone={RAIL_TONES[i + 1]} index={i + 1} />
              <p className="grid grid-cols-[52px_1fr] items-center px-5 font-mono text-[clamp(13px,1.25vw,18px)] font-medium text-dim">
                <span>{layer.number}</span>
                <strong className="font-medium">{layer.label}</strong>
              </p>
            </div>
          ))}
        </motion.div>

        {/* The plate stays in a dark container rather than getting
            `mix-blend-screen` like the rest of the rendered art: its near-black
            studio backdrop is part of the illustration's depth. */}
        <Rise
          delay={0.2}
          className="mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl border border-hair bg-[#14110c] lg:mx-0 lg:max-w-[480px]"
        >
          <Image
            src="/assets/home-v9/layers-agent-stack.webp"
            alt="An exploded architecture showing output, agent, environment, and runtime layers."
            width={572}
            height={450}
            sizes="(max-width: 1024px) min(100vw - 40px, 440px), 34vw"
            className="h-auto w-full"
          />
        </Rise>
      </div>

      <Rise delay={0.34} className="mt-10 flex justify-center">
        <ActionLink href="/products">Get Started</ActionLink>
      </Rise>
    </Section>
  );
}
