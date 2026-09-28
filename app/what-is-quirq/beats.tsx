"use client";

import Link from "next/link";
import {
  ActionLink,
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
} from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { OpenIn } from "@/components/ui/open-in";

/**
 * The "What is quirq" page's beats. Same stage, same five-keyframe track as
 * the home page; only the copy in front of the glass changes. Beat index n
 * here rides KEYFRAMES[n] exactly as the home beats do:
 *   0 centred hero · 1 drained monochrome · 2 spectrum floods back ·
 *   3 recedes upstage · 4 returns centre, fully lit.
 */

/* 0 · the definition, centred under the breathing form. */
export function WhatHero() {
  return (
    <Beat index={0} id="what-hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool>
          <Rise>
            <p className="label">What is quirq</p>
          </Rise>

          <h1 className="display mt-7 max-w-[16ch]">
            <Reveal delay={0.1}>The unit of</Reveal>
            <Reveal delay={0.18}>
              <GlassText>verified work</GlassText>.
            </Reveal>
          </h1>

          <Rise delay={0.3}>
            <p className="lede mx-auto mt-7 text-center">
              Tokens meter what your AI consumes. A quirq meters what it delivered:
              checked against the state of the world, priced by the person who wanted it.
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const FAILURES = [
  {
    title: "It rises when work goes badly.",
    note: "A verbose failure costs more than a terse success; a retry loop costs most of all.",
  },
  {
    title: "It changes size when models swap.",
    note: "The same outcome costs 10x different token counts across models and prompts.",
  },
  {
    title: "It is value-blind.",
    note: "A $4 ticket and a $25,000 contract are indistinguishable in the bill.",
  },
];

/* 1 · the problem, over the drained monochrome glass. */
export function WhatProblem() {
  return (
    <Beat index={1} id="what-problem">
      <div className="relative max-w-2xl md:max-w-[60%]">
        <TextScrim />
        <Marker>01 · the problem</Marker>

        <h2 className="display over-stage mt-8">
          <Reveal delay={0.05}>One meter</Reveal>
          <Reveal delay={0.13}>is missing.</Reveal>
        </h2>

        <Rise delay={0.3}>
          <p className="lede over-stage mt-7">
            The token is a fine input meter. It cannot price outcomes:
          </p>
        </Rise>

        <div className="mt-9">
          {FAILURES.map((failure, i) => (
            <Rise key={failure.title} delay={0.34 + i * 0.08}>
              <div className="flex gap-5 border-t border-hair py-5 sm:gap-7">
                <span className="font-mono text-[11px] text-faint">0{i + 1}</span>
                <div>
                  <p className="over-stage text-[15.5px] font-medium text-ink">
                    {failure.title}
                  </p>
                  <p className="over-stage mt-1 text-[13.5px] leading-relaxed text-dim">
                    {failure.note}
                  </p>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Beat>
  );
}

/* 2 · the unit, as the spectrum floods back. */
export function WhatUnit() {
  return (
    <Beat index={2} id="what-unit">
      <div className="relative max-w-2xl md:ml-auto md:max-w-[60%]">
        <GlassPool>
          <Marker>02 · the unit</Marker>

          <h2 className="display over-stage mt-8">
            <Reveal delay={0.05}>Minted, never</Reveal>
            <Reveal delay={0.13}>
              <GlassText>self-reported.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.28}>
            <p className="lede over-stage mt-7 max-w-[44ch]">
              A human budgets the outcome at value B. The workspace snapshots the world
              before and after, scores completion V against a definition of done, and
              mints the product.
            </p>
          </Rise>

          <Rise delay={0.36}>
            <p className="over-stage mt-10 font-mark text-[clamp(30px,4vw,52px)] font-semibold tracking-[-0.02em]">
              <GlassText>Q</GlassText>
              <span className="mx-3 text-faint">=</span>V
              <span className="mx-3 text-faint">×</span>B
            </p>
            <p className="over-stage mt-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
              minted value · verified completion · human budget
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const NUMBERS = [
  {
    label: "Cost per quirq",
    note: "the price of a dollar of verified work",
  },
  {
    label: "QER",
    note: "quirqs delivered per all-in dollar",
  },
  {
    label: "Quirq velocity",
    note: "throughput in value, not task counts",
  },
  {
    label: "Intervention rate",
    note: "how often a human still had to step in",
  },
];

/* 3 · the numbers, while the form recedes upstage. */
export function WhatNumbers() {
  return (
    <Beat index={3} id="what-numbers">
      <div className="relative max-w-2xl">
        <TextScrim />
        <Marker>03 · what falls out</Marker>

        <h2 className="display-sm over-stage mt-7">
          <Reveal delay={0.05}>Every number an</Reveal>
          <Reveal delay={0.13}>operator needs.</Reveal>
        </h2>
      </div>

      <Rise delay={0.24} className="mt-9">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-hair bg-white/6 backdrop-blur-xl sm:grid-cols-2">
          {NUMBERS.map((item) => (
            <div key={item.label} className="bg-black/55 px-6 py-6">
              <p className="label">{item.label}</p>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-dim">{item.note}</p>
            </div>
          ))}
        </div>
      </Rise>

      <Rise delay={0.32} className="relative mt-5 max-w-[62ch]">
        <TextScrim />
        <p className="relative font-mono text-[10.5px] leading-relaxed text-dim">
          All of them fall out of one ledger. The full calculus is in the{" "}
          <Link href="/whitepaper" className="text-dim underline underline-offset-4">
            whitepaper
          </Link>{" "}
          and the{" "}
          <Link href="/research" className="text-dim underline underline-offset-4">
            research notes
          </Link>
          .
        </p>
      </Rise>
    </Beat>
  );
}

/* 4 · the close, returned to centre and fully lit. */
export function WhatRun() {
  return (
    <Beat index={4} id="what-run">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool scrimClassName="mx-auto max-w-3xl">
          <h2 className="display mx-auto max-w-[15ch]">
            <Reveal delay={0.05}>One click.</Reveal>
            <Reveal delay={0.13}>
              <GlassText>Any runtime.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.24}>
            <p className="lede mx-auto mt-7 text-center">
              quirq wraps your agents in an environment that snapshots, verifies, and
              meters: on your laptop, in your cloud, in one click.
            </p>
          </Rise>

          <Rise
            delay={0.34}
            className="mt-11 flex flex-wrap items-center justify-center gap-3"
          >
            <OpenIn />
            <ActionLink href="/whitepaper" tone="ghost">
              Read the whitepaper
            </ActionLink>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}
