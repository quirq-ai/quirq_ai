"use client";

import { motion } from "motion/react";
import { Rise, TextScrim } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { AGENTS } from "@/components/ui/brand-icons";

/**
 * The agent connection shelf directly under the hero.
 *
 * Only agent marks belong here. Providers, protocols and infrastructure may
 * still be supported elsewhere, but mixing them into this row dilutes the
 * promise: connect the workers already active across the team's machines and
 * observe their outcomes together.
 *
 * Not a beat: it carries no `data-beat`, so the scroll runtime ignores it and
 * the glass simply keeps travelling from the hero keyframe toward beat 1.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      aria-label="Agents quirq connects and observes"
      className="relative py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <Rise className="relative mx-auto flex max-w-[760px] flex-col items-center text-center">
          <TextScrim />
          <p className="label over-stage">Keep the tools you already use</p>
          <h2 className="over-stage mt-4 text-[clamp(28px,4vw,46px)] leading-[1.04] font-medium tracking-[-0.045em] text-ink">
            Connect every machine.{" "}
            <GlassText className="whitespace-nowrap">
              Stop rebuilding context.
            </GlassText>
          </h2>
          <p className="over-stage mt-5 max-w-[640px] text-[13px] leading-6 text-dim sm:text-[14px]">
            Install Quirq wherever your agents run. When you switch tools or
            machines, Space keeps the work, usage, and project trail together
            so the next run starts with the right context.
          </p>
        </Rise>

        <div className="relative mt-12 sm:mt-14">
          <span
            aria-hidden
            className="absolute top-8 right-[7%] left-[7%] hidden h-px bg-linear-to-r from-transparent via-white/20 to-transparent lg:block"
          />

          <ul className="relative flex flex-wrap justify-center gap-x-3 gap-y-7 sm:gap-x-4 lg:flex-nowrap lg:justify-between lg:gap-x-3">
            {AGENTS.map((agent, i) => (
              <motion.li
                key={agent.name}
                className="group flex w-[calc(50%-0.375rem)] flex-col items-center gap-3 sm:w-[calc(25%-0.75rem)] lg:w-full"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.055, ease: EASE }}
              >
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/16 bg-black/75 shadow-[0_12px_36px_rgba(0,0,0,0.62)] backdrop-blur-xl transition-all duration-300 group-hover:border-white/30 group-hover:bg-black/60">
                  <agent.Icon className="h-7 w-7 text-white/72 transition-colors duration-300 group-hover:text-ink" />
                  <span
                    aria-hidden
                    className="absolute -bottom-1 h-2 w-2 rounded-full border border-black bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.65)]"
                  />
                </span>
                <span className="font-mono text-[9px] tracking-[0.12em] text-white/72 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors duration-300 group-hover:text-white/90">
                  {agent.name}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <Rise
          delay={0.12}
          className="relative mx-auto mt-11 w-full max-w-[620px]"
        >
          <GlassPool>
            <p className="over-stage px-5 text-center font-mono text-[9px] leading-5 tracking-[0.12em] text-faint uppercase sm:text-[10.5px] sm:tracking-[0.14em]">
              One command per machine · every agent ·{" "}
              <GlassText className="whitespace-nowrap">
                one place to resume
              </GlassText>
            </p>
          </GlassPool>
        </Rise>
      </div>
    </section>
  );
}
