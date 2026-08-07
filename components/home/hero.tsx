"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ActionLink } from "@/components/ui/primitives";
import { QuirqLogo } from "@/components/ui/quirq-logo";
import { PartnerRow } from "@/components/home/works-with";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The fold: promise, subject, and proof, in one screen.
 *
 * This page used to run the WebGL stage: a glass ribbon fixed across the whole
 * viewport and re-posed by scroll through five keyframes. It now runs one
 * rendered still instead, and the motion stops at the bottom of this section.
 * That is the trade: the subject stays the same object, but it stops competing
 * with every paragraph below it, and the home route stops paying ~1MB of
 * three.js to say so.
 *
 * The partner row lives inside this section rather than after it. It is the
 * evidence for the claim directly above it, and a claim whose evidence sits
 * below the scroll line is just a claim. That is also why the whole block is
 * laid out as three rows in a column rather than centred: the copy and art take
 * the space they need, and the shelf is pinned to the bottom of the fold.
 *
 * Three transforms drive the art, on three separate elements, because one
 * element holds one `transform` and the last writer would win:
 *
 *   outer  motion.div  entrance, once     (opacity + scale + blur)
 *   middle div         pointer parallax   (inline style, written from rAF)
 *   inner  .hero-drift the 11s idle loop  (CSS keyframes, see globals.css)
 */
export function Hero() {
  const reduced = useReducedMotion();
  const parallax = useRef<HTMLDivElement>(null);

  // The parallax is deliberately outside React: it writes to element.style from
  // one rAF loop rather than re-rendering a tree 60 times a second, and it
  // allocates nothing per frame. Same rule the stage's frame loop followed.
  useEffect(() => {
    const el = parallax.current;
    if (!el) return;
    // A finger has no hover position to track, and a visitor who asked for less
    // motion did not ask for this either.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      // Lerp rather than snap: the glass should feel like it has mass, and a
      // 0.08 factor settles in roughly a third of a second.
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el.style.transform = `translate3d(${(currentX * 9).toFixed(2)}px, ${(currentY * 7).toFixed(2)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, []);

  // Only the transition may branch on `reduced`. initial/animate are serialized
  // into the server HTML, and useReducedMotion() is null during SSR, so
  // branching those would bake full-motion inline styles into markup that a
  // reduced-motion client never clears. MotionConfig reducedMotion="user"
  // (wrapping the whole app) snaps the transforms instead.
  const enter = (delay: number, duration = 1) =>
    reduced ? { duration: 0 } : { delay, duration, ease: EASE };

  return (
    <section
      id="home-hero"
      aria-labelledby="home-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 flex items-center justify-end"
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.06, filter: "blur(18px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={enter(0.15, 1.6)}
        >
          <div ref={parallax}>
            <div className="hero-drift">
              <Image
                src="/assets/home-v9/hero-art.png"
                alt=""
                width={806}
                height={850}
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 66vw, (max-width: 1440px) 46vw, 660px"
                // The export is an opaque rgb(9,9,9) plate, so `mix-blend-screen`
                // is what removes the card and `.plate-hero` is what removes the
                // straight edge screen leaves behind (see globals.css).
                // max-w-none lets it overhang the container to the right, which
                // the section's overflow-hidden then crops.
                className="plate-hero h-auto w-[min(88vw,470px)] max-w-none translate-x-[20%] opacity-50 mix-blend-screen sm:w-[min(66vw,560px)] sm:translate-x-[12%] lg:w-[min(46vw,660px)] lg:translate-x-[5%] lg:opacity-100 xl:translate-x-0"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Half the legibility contract. Below lg the art sits directly behind
          the copy rather than beside it, so the gradient stays opaque much
          further across; from lg it only has to take the edge off. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-black via-black/78 to-black/10 lg:via-black/62 lg:to-transparent"
      />

      {/* flex-1 takes the space the shelf does not, so the copy sits optically
          centred in the fold at any viewport height without a magic offset. */}
      <div className="mx-auto flex w-full max-w-[1180px] flex-1 items-center px-5 sm:px-8 lg:px-11">
        <div className="over-stage relative max-w-[30rem] py-8 lg:max-w-[35rem]">
          {/* The h1 below names the page and the nav carries the brand link, so
              this repeated wordmark is decorative to assistive technology. */}
          <motion.span
            aria-hidden
            className="block w-[clamp(148px,19vw,296px)]"
            initial={{ opacity: 0, y: 14, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={enter(0.1, 1.2)}
          >
            <QuirqLogo alt="" className="h-auto w-full" />
          </motion.span>

          <h1
            id="home-title"
            className="mt-[clamp(18px,2.2vw,34px)] max-w-[15ch] text-[clamp(25px,2.7vw,38px)] leading-[1.08] font-semibold tracking-[-0.032em] text-ink"
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.24, 1.05)}
            >
              Secure Environments
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={enter(0.32, 1.05)}
            >
              for Agentic Workforces
            </motion.span>
          </h1>

          <motion.p
            className="mt-4 text-[clamp(14px,1.15vw,17px)] leading-[1.45] font-medium tracking-[-0.015em] text-dim"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.46)}
          >
            Any model. Any harness. Any cloud.
          </motion.p>

          <motion.div
            className="mt-7 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.58)}
          >
            <ActionLink href="/products">Get Started</ActionLink>
            <ActionLink href="/whitepaper" tone="ghost">
              Whitepaper
            </ActionLink>
          </motion.div>
        </div>
      </div>

      <PartnerRow className="mx-auto w-full max-w-[1180px] shrink-0 px-5 sm:px-8 lg:px-11" />
    </section>
  );
}
