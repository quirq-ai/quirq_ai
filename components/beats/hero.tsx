"use client";

import { motion, useReducedMotion } from "motion/react";
import { Beat } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { LoopCta } from "@/components/ui/loop-cta";
import { QuirqLogo } from "@/components/ui/quirq-logo";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <Beat index={0} id="hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        {/* The eclipse: the text block occludes the burst's core while the
            rays fan out past its edge. The pool cuts real holes in it for the
            i's aperture and the "light speed" glyphs, so the raw light stands
            behind them. */}
        <GlassPool>
          <motion.p
            className="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 1 }}
          >
            One command · every agent workspace in view
          </motion.p>

          <h1 className="mt-6 flex flex-col items-center">
            <span className="sr-only">
              quirq: find context, fix waste, and keep work moving.
            </span>

            <motion.span
              aria-hidden
              className="block w-[clamp(290px,51vw,690px)]"
              initial={{ opacity: 0, y: "18%", filter: "blur(20px)" }}
              animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { delay: 0.2, duration: 1.25, ease: EASE }
              }
            >
              <QuirqLogo alt="" className="h-auto w-full" />
            </motion.span>

            <motion.span
              aria-hidden
              className="display-sm mt-3 max-w-[22ch] sm:mt-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 1.1, ease: EASE }}
            >
              Find context. Fix waste.{" "}
              <GlassText className="whitespace-nowrap">
                Keep work moving.
              </GlassText>
            </motion.span>
          </h1>

          {/* The install and agent handoff are one shared CTA cluster. The
              invite repeats this exact control so the story closes on the same
              action it opened with. */}
          <motion.div
            className="mt-8 sm:mt-9"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 1, ease: EASE }}
          >
            <LoopCta />
          </motion.div>
        </GlassPool>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-9 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="font-mono text-[9.5px] tracking-[0.3em] text-faint uppercase">
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 block h-1/2 bg-linear-to-b from-transparent to-ink/70"
            animate={reduced ? {} : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </Beat>
  );
}
