"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
export { cn } from "@/lib/utils";
import { LIGHT } from "@/lib/lighting";
import { registerBeat } from "@/lib/beat-registry";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A full-height movement of the page. `data-beat` is what the scroll runtime
 * measures to drive the 3D, so the index here and the keyframe index there are
 * the same thing.
 *
 * `compact` is the data-density variant for pages that run unlit: the section
 * still registers with the same id and index, so the scroll logic and any
 * future re-lit track are wired identically, but it flows at content height
 * instead of staging one viewport per beat.
 */
export function Beat({
  index,
  id,
  children,
  className,
  compact,
}: {
  index: number;
  id: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const el = useRef<HTMLElement>(null);
  // Phase 2: the section announces itself to the registry; the runtime
  // measures registered sections and re-measures when the set changes. The
  // data-beat attribute stays as the transition-era fallback.
  useEffect(() => {
    if (!el.current) return;
    return registerBeat({ id, index, el: el.current });
  }, [id, index]);

  return (
    <section
      ref={el}
      id={id}
      data-beat={index}
      className={cn(
        "relative w-full overflow-hidden",
        compact ? "py-10 first-of-type:pt-28" : "flex min-h-svh items-center pt-24 pb-20",
        className,
      )}
    >
      <div className="site-container">{children}</div>
    </section>
  );
}

/**
 * Type that rises out of a clipping mask. The mask is what makes it read as
 * printing rather than fading: nothing is visible above the line until it moves.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  // Watch the mask, not the thing being masked. The inner span starts pushed
  // 115% down, so it is fully clipped by this wrapper's `overflow-hidden`;
  // observing it directly would mean it never intersects, and so never reveals.
  const mask = useRef<HTMLSpanElement>(null);
  const inView = useInView(mask, { once: true, amount: 0.3 });

  // No useReducedMotion branch: it is null during SSR, so branching initial
  // desyncs server HTML from a reduced-motion client and the y offset never
  // clears. MotionConfig reducedMotion="user" snaps the transform instead.
  return (
    <span ref={mask} className={cn("block overflow-hidden", className)}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: "115%", opacity: 0 }}
        animate={inView ? { y: "0%", opacity: 1 } : undefined}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** A softer entrance for things that shouldn't slide: panels, figures. */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 26, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The eclipse: a soft elliptical pool of shadow behind a block of copy.
 *
 * The glass and its bloom move with the scroll, so at some widths they land
 * directly under the text. Rather than choreographing around every breakpoint,
 * each text block carries its own falloff: legible at any size, and invisible
 * against the black everywhere else.
 *
 * The box is oversized because the gradient's radii are percentages of the box
 * and must stay at or under 50% to reach transparent before the edge. Larger
 * radii get clipped while still opaque, which shows up as a hard rectangular
 * seam over a bright background.
 *
 * The overshoot scales with the block (so a headline's pool is grander than a
 * caption's) with pixel floors so one-line labels still get enough falloff
 * room for the gradient to fade before its edge.
 */
export function TextScrim({
  className,
  ref,
}: {
  className?: string;
  /** For callers that carve into the pool at runtime (the hero's i-dot
      aperture masks a hole out of its scrim). */
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-x-[max(72px,16%)] -inset-y-[max(56px,32%)] -z-10",
        className,
      )}
      style={{ background: LIGHT.scrimGradient }}
    />
  );
}

/** Chapter marker: spectrum chip, mono label, spectrum rule. */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <Rise className="flex items-center gap-3">
      <span
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ background: "var(--spectrum)" }}
      />
      <span className="label">{children}</span>
      <span className="spectrum-rule h-px w-12 opacity-70" />
    </Rise>
  );
}

/** Story actions use the same component as the rest of the interface. */
export function ActionLink({
  href,
  children,
  tone = "solid",
  newTab = false,
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "solid" | "ghost";
  newTab?: boolean;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant={tone === "solid" ? "default" : "outline"}
      className={className}
    >
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
      >
        {children}
        <ArrowUpRight aria-hidden="true" />
        {newTab && <span className="sr-only">(opens in a new tab)</span>}
      </a>
    </Button>
  );
}
