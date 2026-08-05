"use client";

import { motion, useReducedMotion } from "motion/react";
import { Beat } from "@/components/ui/primitives";
import { GlassHole, GlassPool, GlassText } from "@/components/ui/glass";
import { LoopCta } from "@/components/ui/loop-cta";

const LETTERS = ["q", "u", "i", "r", "q"];
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

            {/* The wordmark resolves out of the light rather than sliding in:
                each letter arrives from blur, like the beam coming into focus. */}
            <span
              aria-hidden
              className="flex font-mark text-[clamp(72px,15.5vw,204px)] leading-[0.86] font-semibold tracking-[-0.03em]"
            >
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  // initial/animate must be identical on server and client:
                  // useReducedMotion() is null during SSR, so branching them
                  // bakes full-motion inline styles into HTML that a
                  // reduced-motion client would never clear. Only the
                  // transition (never serialized) may branch.
                  initial={{ opacity: 0, y: "30%", filter: "blur(20px)" }}
                  animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { delay: 0.2 + i * 0.075, duration: 1.25, ease: EASE }
                  }
                >
                  {letter === "i" ? (
                    /* The i's dot is an aperture: the glyph's own tittle is
                       clipped away and a fully transparent hole takes its
                       place. Offsets calibrated against rasterized Poppins
                       600 ink: the tittle is a 0.165em circle whose centre
                       sits 0.07em below this box's top (baseline at 0.779em,
                       dot ink 0.79 to 0.625em above it), and the stem starts
                       at 0.219em; the clip line falls mid-gap at 0.19em. */
                    <span className="relative inline-block">
                      <span
                        className="inline-block"
                        style={{ clipPath: "inset(0.19em 0 0 0)" }}
                      >
                        i
                      </span>
                      <GlassHole
                        className="backdrop-brightness-110 backdrop-saturate-110"
                        style={{
                          width: "0.165em",
                          height: "0.165em",
                          left: "50%",
                          top: "-0.01em",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </span>
                  ) : (
                    letter
                  )}
                </motion.span>
              ))}
            </span>

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
