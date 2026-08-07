"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Section, ScreenFrame, TYPE, classes } from "@/components/home/shell";
import { Reveal, Rise } from "@/components/ui/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The workflow deck: screenshot left, numbered progression right.
 *
 * The deck built this list out of three hand-measured row heights (78.688px,
 * and 147.637px for the last one) so the rail beside it would line up. Those
 * numbers only held while the copy did. Here the rows are hairline-separated
 * and size themselves, which is why the third row is allowed to be twice the
 * height of the others without anything else being re-measured.
 *
 * Paired with `roi.tsx`: same two-column shape, mirrored emphasis. Keep changes
 * to the grid in step across both files or the pair stops reading as a pair.
 */

/**
 * Accents live here as class names, not as the deck's inline `style={{ color }}`
 * hex. Tailwind only emits a utility it can see in source, and a hex in a style
 * attribute is outside the token system entirely: these three now resolve to the
 * same spectrum variables the rest of the page draws from.
 *
 * `body` is what marks the active row. Only step 03 carries copy, and the same
 * flag drives its brighter heading, so the progression cannot drift out of sync
 * with the row it is progressing toward.
 */
const WORKFLOW_STEPS: ReadonlyArray<{
  number: string;
  label: string;
  accent: string;
  body?: string;
}> = [
  { number: "01", label: "DEPLOY ENVIRONMENT", accent: "text-spec-blue" },
  { number: "02", label: "MANAGE WORKSPACE", accent: "text-spec-green" },
  {
    number: "03",
    label: "OBSERVE PRODUCTIVITY",
    accent: "text-spec-orange",
    body: "Calculate beyond token cost and see the efficiency metrics you truly need.",
  },
];

export function Workflow() {
  return (
    <Section id="home-workflow" labelledBy="workflow-title" rhythm="normal">
      <div className="grid items-start gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-x-[clamp(34px,3.8vw,56px)]">
        {/* A 1x export, so the cap is load-bearing rather than tidy: from lg
            the grid column resolves to roughly 460px and the image never
            reaches its intrinsic width, and stacked below lg the 460px cap on
            this wrapper holds it under the file's width at any viewport. */}
        <Rise
          delay={0.28}
          className="mx-auto w-full max-w-[460px] lg:max-w-none lg:pt-6"
        >
          <ScreenFrame className="w-full">
            <Image
              src="/assets/home-v9/workflow-visual.png"
              alt="A Quirq workspace graph showing projects grouped by team."
              width={557}
              height={516}
              sizes="(max-width: 1024px) min(100vw - 40px, 460px), 40vw"
              className="h-auto w-full"
            />
          </ScreenFrame>
        </Rise>

        <div>
          {/* Two Reveals rather than the deck's <br>: the mask has to clip one
              line at a time, so the break has to be a real element boundary. */}
          <h2 id="workflow-title" className={TYPE.heading}>
            <Reveal delay={0.05}>Accelerate Your</Reveal>
            <Reveal delay={0.13}>AI Workflows</Reveal>
          </h2>

          <ol className="mt-7 border-b border-hair">
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.li
                key={step.number}
                className="grid grid-cols-[clamp(48px,4.6vw,66px)_1fr] gap-x-2 border-t border-hair py-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.22 + i * 0.08, ease: EASE }}
              >
                <span className={classes(TYPE.monoHead, step.accent)}>
                  {step.number}
                </span>
                <div>
                  <h3
                    className={classes(
                      TYPE.monoHead,
                      step.body ? "text-ink" : "text-dim",
                    )}
                  >
                    {step.label}
                  </h3>
                  {/* `.lede` is declared unlayered in globals.css and Tailwind's
                      utilities sit in @layer utilities, so an unlayered rule
                      wins outright no matter the specificity. The three values
                      this row genuinely overrides therefore need `!`; the class
                      stays because it is still what carries the type token. */}
                  {step.body ? (
                    <p className="lede mt-2.5 !max-w-[46ch] !text-[clamp(13px,1.05vw,15.5px)] !leading-[1.45]">
                      {step.body}
                    </p>
                  ) : null}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
