"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Section, ScreenFrame, TYPE, classes } from "@/components/home/shell";
import { Reveal, Rise } from "@/components/ui/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The ROI deck: the mirror of `workflow.tsx`.
 *
 * Same two-column shape and same entrance rhythm, with the ratio opened up so
 * the wider capture gets the wider column (0.98fr against workflow's 0.8fr). The
 * two sections are meant to read as a matched pair; a change to one grid that
 * is not made to the other breaks the rhyme.
 *
 * The list is a <ul> rather than workflow's <ol> because these three are facets
 * of one view, not steps in an order, and the dots say so. Hence also no active
 * row: all three carry copy and all three headings sit at full ink.
 */

/**
 * Accents as background utilities, not the deck's inline hex, for the same
 * reason as workflow's foreground accents: Tailwind cannot see a style
 * attribute, and the spectrum tokens are the point.
 */
const ROI_POINTS = [
  {
    label: "OBSERVE PRODUCTIVITY",
    accent: "bg-spec-blue",
    body: "See verified work, intervention rate, and all-in cost in one operating view.",
  },
  {
    label: "ASSESS MODEL LEAKS",
    accent: "bg-spec-green",
    body: "Compare agent claims with captured state to find where output loses fidelity.",
  },
  {
    label: "CALCULATE RETURNS",
    accent: "bg-spec-orange",
    body: "Read delivered value against spend so ROI becomes an auditable trend, not a token count.",
  },
] as const;

export function Roi() {
  return (
    <Section id="home-roi" labelledBy="roi-title" rhythm="normal">
      <div className="grid items-start gap-y-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1fr)] lg:gap-x-[clamp(36px,4vw,60px)]">
        <Rise delay={0.28}>
          {/* 1x export: from lg the column lands near 512px, under the file's
              598px, and below lg the 500px cap stops the stacked layout
              upscaling it on any viewport past ~540px. */}
          <ScreenFrame className="mx-auto w-full max-w-[500px] lg:max-w-none">
            <Image
              src="/assets/home-v9/roi-visual.png"
              alt="An Engineering environment connected to its default project."
              width={598}
              height={580}
              sizes="(max-width: 1024px) min(100vw - 40px, 500px), 40vw"
              className="h-auto w-full"
            />
          </ScreenFrame>
        </Rise>

        <div>
          {/* One line, one Reveal. The deck sets this headline as a single
              string and it is not broken here: manufacturing a second line to
              match workflow's two would change the copy. */}
          <h2 id="roi-title" className={TYPE.heading}>
            <Reveal delay={0.05}>AI Agents with a Measurable ROI</Reveal>
          </h2>

          <ul className="mt-9">
            {ROI_POINTS.map((point, i) => (
              <motion.li
                key={point.label}
                className="grid grid-cols-[30px_1fr] gap-x-1 py-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.22 + i * 0.09, ease: EASE }}
              >
                {/* mt-1 puts the 10px dot on the cap centre of the mono head,
                    which sits near 0.66em down an unleaded JetBrains Mono line. */}
                <span
                  aria-hidden
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${point.accent}`}
                />
                <div>
                  <h3 className={classes(TYPE.monoHead, "text-ink")}>
                    {point.label}
                  </h3>
                  {/* `.lede` is unlayered in globals.css, so it outranks every
                      Tailwind utility regardless of specificity. Both the width
                      and the size differ from the house value, so both need `!`. */}
                  <p className="lede mt-2 !max-w-[42ch] !text-[clamp(13px,1.05vw,15.5px)]">
                    {point.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
