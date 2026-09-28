"use client";

import { useEffect, useRef } from "react";
import {
  ActionLink,
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
} from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { KEYFRAMES } from "@/components/stage/choreography";
import { stage } from "@/lib/stage-store";

/**
 * The beats-array deep dive, told in beats. Five sections on the same
 * KEYFRAMES track as every stage page; beat 2 carries a live readout of
 * stage.beat, so the page demonstrates the traversal it explains.
 */

const LAST = KEYFRAMES.length - 1;

/* 0 · the subject. */
export function BeatsHero() {
  return (
    <Beat index={0} id="beats-hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool>
          <Rise>
            <p className="label">Engineering · deep dive</p>
          </Rise>

          <h1 className="display mt-7 max-w-[14ch]">
            <Reveal delay={0.1}>The beats</Reveal>
            <Reveal delay={0.18}>
              <GlassText>array</GlassText>.
            </Reveal>
          </h1>

          <Rise delay={0.3}>
            <p className="lede mx-auto mt-7 text-center">
              {KEYFRAMES.length} keyframes, {KEYFRAMES.length} sections, one continuous
              traversal. You are scrolling the array right now; this page is section by
              section how it works.
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const MECHANICS = [
  {
    title: "There is no current beat.",
    note: "The runtime computes a fraction, not a step. At beat 1.62 you are 62% of the way from keyframe 1 to keyframe 2, and the glass shows exactly that blend.",
  },
  {
    title: "Nothing snaps.",
    note: "The viewport's centre line slides through the measured section centres; every pixel of scroll moves the blend. Lenis only smooths the input, it never quantises it.",
  },
  {
    title: "Nothing loads or unloads.",
    note: "All sections and all keyframes exist from the first paint. Traversal changes numbers in a store; components never mount or unmount because you scrolled.",
  },
  {
    title: "Interludes slow the walk, they never pause it.",
    note: "A section without data-beat (the ecosystem shelf on the home page) occupies scroll but no keyframe: the glass keeps gliding from the previous beat toward the next while you read it.",
  },
];

/* 1 · does it just scroll to the next element? No. */
export function BeatsMechanics() {
  return (
    <Beat index={1} id="beats-mechanics">
      <div className="relative max-w-2xl md:max-w-[62%]">
        <TextScrim />
        <Marker>01 · the traversal</Marker>

        <h2 className="display over-stage mt-8">
          <Reveal delay={0.05}>Not steps.</Reveal>
          <Reveal delay={0.13}>A slide.</Reveal>
        </h2>

        <div className="mt-9">
          {MECHANICS.map((item, i) => (
            <Rise key={item.title} delay={0.28 + i * 0.07}>
              <div className="flex gap-5 border-t border-hair py-4.5 sm:gap-7">
                <span className="font-mono text-[11px] text-faint">0{i + 1}</span>
                <div>
                  <p className="over-stage text-[15.5px] font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="over-stage mt-1 text-[13.5px] leading-relaxed text-dim">
                    {item.note}
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

/**
 * Live readout of stage.beat. Writes textContent and style directly on rAF,
 * the same pattern the ledger's counters use: no React state at 60fps.
 */
function BeatMeter() {
  const num = useRef<HTMLSpanElement>(null);
  const blend = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const b = stage.beat;
      if (num.current) num.current.textContent = b.toFixed(2);
      if (marker.current) marker.current.style.left = `${(b / LAST) * 100}%`;
      if (blend.current) {
        const i = Math.min(Math.floor(b), LAST - 1);
        blend.current.textContent = `between keyframes ${i} and ${i + 1} · ${Math.round(
          (Math.min(b, LAST) - i) * 100,
        )}% across`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-hair bg-black/55 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5 sm:px-6">
        <span className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
          <span className="pulse-dot" />
          stage.beat · live
        </span>
        <span ref={blend} className="font-mono text-[10px] tracking-[0.1em] text-faint" />
      </div>

      <div className="px-5 py-6 sm:px-6">
        <p className="numeric font-mono text-[clamp(40px,5vw,64px)] font-medium text-ink tabular-nums">
          <span ref={num}>0.00</span>
        </p>

        {/* The track: one tick per keyframe, and a marker that rides the
            fraction. The geometry is fixed; only the marker moves, and it
            moves because you do. */}
        <div className="relative mt-7 mb-5 h-px bg-white/10">
          {KEYFRAMES.map((_, i) => (
            <span key={i}>
              <span
                className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
                style={{ left: `${(i / LAST) * 100}%` }}
              />
              <span
                className="absolute top-3 -translate-x-1/2 font-mono text-[9.5px] text-faint"
                style={{ left: `${(i / LAST) * 100}%` }}
              >
                {i}
              </span>
            </span>
          ))}
          <div
            ref={marker}
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_12px_rgba(244,243,240,0.6)]"
            style={{ left: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}

/* 2 · the live proof, over the spectrum-flooded glass. */
export function BeatsLive() {
  return (
    <Beat index={2} id="beats-live">
      <div className="relative max-w-2xl md:ml-auto md:max-w-[62%]">
        <GlassPool>
          <Marker>02 · watch it happen</Marker>

          <h2 className="display over-stage mt-8">
            <Reveal delay={0.05}>Watch it</Reveal>
            <Reveal delay={0.13}>
              <GlassText>traverse.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.26} className="mt-9">
            <BeatMeter />
          </Rise>

          <Rise delay={0.34} className="relative mt-5">
            <p className="over-stage font-mono text-[10.5px] leading-relaxed text-dim">
              Park this panel mid-screen and the number reads close to 2.00: this section
              is the third element, and you are standing on it. Scroll a hair and the
              blend moves; there is no notch to land in.
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const LIMITS = [
  {
    title: "Five is authored, not architectural.",
    note: "The sampler and the runtime read the array's length; a sixth keyframe plus a sixth section works today. Five is simply how many shots the story needed.",
  },
  {
    title: "One global track, shared by every page.",
    note: "Until the sampler takes the track as an argument (phase 1), every stage page blends the same KEYFRAMES. Pages differ in copy, not in choreography.",
  },
  {
    title: "More sections than keyframes pins the glass.",
    note: "The sampler clamps: a data-beat={5} section against a five-frame track holds the last pose for its whole span. Fewer sections is always fine; the tail simply never plays.",
  },
  {
    title: "Indices must follow scroll order.",
    note: "The runtime sorts sections by their beat number and assumes the centres ascend. A data-beat out of document order desyncs the walk.",
  },
  {
    title: "Sections stay about a viewport tall.",
    note: "A beat's visual peak lands at its section's centre. Squeeze a section and its keyframe flashes past; stretch one and the pose lingers.",
  },
];

/* 3 · the limitations, honestly, while the form recedes. */
export function BeatsLimits() {
  return (
    <Beat index={3} id="beats-limits">
      <div className="relative max-w-2xl">
        <TextScrim />
        <Marker>03 · the limits</Marker>

        <h2 className="display-sm over-stage mt-7">
          <Reveal delay={0.05}>What the array</Reveal>
          <Reveal delay={0.13}>cannot do yet.</Reveal>
        </h2>
      </div>

      <Rise delay={0.24} className="mt-9">
        <div className="overflow-hidden rounded-2xl border border-hair bg-black/50 backdrop-blur-xl">
          {LIMITS.map((limit, i) => (
            <div
              key={limit.title}
              className={
                "flex items-start gap-4 px-5 py-4 sm:gap-6 sm:px-6" +
                (i > 0 ? " border-t border-hair-soft" : "")
              }
            >
              <span className="w-4 shrink-0 pt-0.5 text-center font-mono text-[11px] text-faint">
                0{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium text-ink">{limit.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-dim">{limit.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Rise>
    </Beat>
  );
}

/* 4 · how the traversal gets dynamic, fully lit. */
export function BeatsDynamic() {
  return (
    <Beat index={4} id="beats-dynamic">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool scrimClassName="mx-auto max-w-3xl">
          <h2 className="display mx-auto max-w-[15ch]">
            <Reveal delay={0.05}>Traversal,</Reveal>
            <Reveal delay={0.13}>
              <GlassText>unclamped.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.24}>
            <p className="lede mx-auto mt-7 text-center">
              Today you can already reorder sections, use fewer beats, and drop interludes
              anywhere. Per-page tracks, sub-beats, and branching walks are what the
              migration phases unlock.
            </p>
          </Rise>

          <Rise
            delay={0.34}
            className="mt-11 flex flex-wrap items-center justify-center gap-3"
          >
            <ActionLink href="/how-it-works">The migration plan</ActionLink>
            <ActionLink href="/what-is-quirq" tone="ghost">
              The first swap
            </ActionLink>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}
