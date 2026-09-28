"use client";

import { useEffect, useState } from "react";
import { Rise, TextScrim } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { GlassText } from "@/components/ui/glass";
import { STAGE_DEMO_DEFAULTS, stage, type StageForm } from "@/lib/stage-store";

/**
 * The /engine live demos. Each is an interlude, not a beat: no data-beat, no
 * registration, so the scroll runtime ignores them and the glass keeps
 * gliding from one story beat to the next while the visitor plays. Each demo
 * writes the stage store on interaction and restores the defaults on unmount,
 * so no other page ever sees an override. Content is fixed-height across
 * every input state.
 */

const FORMS: { value: StageForm; label: string; note: string }[] = [
  { value: "mobius", label: "the mobius", note: "four crisp-edged strips" },
  { value: "knot", label: "a torus knot", note: "one welded tube" },
];

export function RingSwapDemo() {
  const [form, setForm] = useState<StageForm>("mobius");

  useEffect(
    () => () => {
      stage.form = STAGE_DEMO_DEFAULTS.form;
    },
    [],
  );

  const pick = (value: StageForm) => {
    setForm(value);
    // The Three.js frame loop reads this imperative store outside React; this is a click handler.
    // eslint-disable-next-line react-hooks/immutability
    stage.form = value;
  };

  return (
    <section
      aria-label="Swap the ring live"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <Rise className="relative mx-auto flex max-w-[640px] flex-col items-center text-center">
          <TextScrim />
          <p className="label over-stage">swap it live · the same one line</p>
          <p className="over-stage mt-4 max-w-[520px] text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
            Two geometries, one mesh. The material, the damping and the scroll do not
            change; only what the light has to pass through does.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {FORMS.map((f) => (
              <Button
                key={f.value}
                type="button"
                variant={form === f.value ? "secondary" : "outline"}
                aria-pressed={form === f.value}
                onClick={() => pick(f.value)}
                className="flex-col gap-1 px-6 py-3"
              >
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase">
                  {f.label}
                </span>
                <span className="font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
                  {f.note}
                </span>
              </Button>
            ))}
          </div>

          <p className="over-stage mt-6 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground uppercase">
            The knot reads softer on purpose: a welded tube has no crisp edges to split
            the light.
          </p>
        </Rise>
      </div>
    </section>
  );
}

type DeskKey = "lightGain" | "lightSize" | "lightHue" | "lightX" | "lightY";

const DESK: { key: DeskKey; label: string; min: number; max: number; step: number }[] = [
  { key: "lightGain", label: "luminosity", min: 0, max: 2.5, step: 0.01 },
  { key: "lightSize", label: "size", min: 0.4, max: 2.2, step: 0.01 },
  { key: "lightHue", label: "colour · wheel turns", min: -0.5, max: 0.5, step: 0.01 },
  { key: "lightX", label: "position · x", min: -7, max: 7, step: 0.05 },
  { key: "lightY", label: "position · y", min: -4, max: 4, step: 0.05 },
];

const DESK_DEFAULTS: Record<DeskKey, number> = {
  lightGain: STAGE_DEMO_DEFAULTS.lightGain,
  lightSize: STAGE_DEMO_DEFAULTS.lightSize,
  lightHue: STAGE_DEMO_DEFAULTS.lightHue,
  lightX: STAGE_DEMO_DEFAULTS.lightX,
  lightY: STAGE_DEMO_DEFAULTS.lightY,
};

export function LightDeskDemo() {
  const [values, setValues] = useState<Record<DeskKey, number>>(DESK_DEFAULTS);

  useEffect(
    () => () => {
      Object.assign(stage, DESK_DEFAULTS);
    },
    [],
  );

  const set = (key: DeskKey, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Slider events update the external frame-loop store; React does not own its values.
    // eslint-disable-next-line react-hooks/immutability
    stage[key] = value;
  };

  const reset = () => {
    setValues(DESK_DEFAULTS);
    Object.assign(stage, DESK_DEFAULTS);
  };

  return (
    <section
      aria-label="The light desk"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <Rise className="relative mx-auto flex max-w-[640px] flex-col items-center text-center">
          <TextScrim />
          <p className="label over-stage">the light desk · held by hand</p>
          <p className="over-stage mt-4 max-w-[560px] text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
            The desk writes over the score. Luminosity multiplies the beat&apos;s burst
            level, size scales the source, colour turns the palette wheel, and x and y
            carry the burst around the frame. Scroll keeps playing underneath.
          </p>
        </Rise>

        <div className="mx-auto mt-9 max-w-[720px] rounded-xl border border-white/10 bg-card p-6 backdrop-blur-sm sm:p-7">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {DESK.map((ch) => (
              <label key={ch.key} className="block">
                <span className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span className="tracking-[0.1em] uppercase">{ch.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {values[ch.key].toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={ch.min}
                  max={ch.max}
                  step={ch.step}
                  value={values[ch.key]}
                  onChange={(e) => set(ch.key, Number(e.target.value))}
                  className="mt-1 min-h-11 w-full cursor-pointer rounded-md accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </label>
            ))}
            <div className="flex items-end justify-start sm:justify-end">
              <Button type="button" variant="outline" onClick={reset}>
                back to the score
              </Button>
            </div>
          </div>
        </div>

        <Rise className="relative mx-auto mt-6 max-w-[560px] text-center">
          <TextScrim />
          <p className="over-stage font-mono text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground uppercase">
            Leave the page and the score takes over again.
          </p>
        </Rise>
      </div>
    </section>
  );
}

/**
 * The lens glasses. Each entry composes a CSS backdrop filter at a given
 * strength; stacking entries concatenates their filters in order. Inline
 * styles on purpose: the Tailwind pipeline strips hand-written
 * backdrop-filter from stylesheets, but a runtime style attribute reaches
 * the browser untouched, and it is the only way to drive the amounts from
 * a slider.
 */
const LENSES: {
  key: string;
  label: string;
  filter: (s: number) => string;
}[] = [
  {
    key: "warm",
    label: "warm",
    filter: (s) =>
      `hue-rotate(${Math.round(-40 * s)}deg) saturate(${(1 + 0.7 * s).toFixed(2)}) brightness(${(1 + 0.12 * s).toFixed(2)})`,
  },
  {
    key: "cool",
    label: "cool",
    filter: (s) =>
      `hue-rotate(${Math.round(130 * s)}deg) brightness(${(1 - 0.06 * s).toFixed(2)})`,
  },
  {
    key: "negative",
    label: "negative",
    filter: (s) => `invert(${s.toFixed(2)})`,
  },
  {
    key: "smoked",
    label: "smoked",
    filter: (s) =>
      `brightness(${(1 - 0.62 * s).toFixed(2)}) contrast(${(1 + 0.25 * s).toFixed(2)})`,
  },
  {
    key: "frosted",
    label: "frosted",
    filter: (s) =>
      `blur(${(14 * s).toFixed(1)}px) brightness(${(1 + 0.08 * s).toFixed(2)})`,
  },
];

type LensChannel = "strength" | "size" | "x" | "y";

const LENS_SLIDERS: {
  key: LensChannel;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}[] = [
  {
    key: "strength",
    label: "strength",
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => v.toFixed(2),
  },
  { key: "size", label: "size", min: 120, max: 340, step: 2, format: (v) => `${v}px` },
  { key: "x", label: "position · x", min: 10, max: 90, step: 1, format: (v) => `${v}%` },
  { key: "y", label: "position · y", min: 15, max: 85, step: 1, format: (v) => `${v}%` },
];

const LENS_DEFAULTS: Record<LensChannel, number> = {
  strength: 0.7,
  size: 220,
  x: 50,
  y: 45,
};

export function LensDemo() {
  const [active, setActive] = useState<string[]>([]);
  const [lens, setLens] = useState<Record<LensChannel, number>>(LENS_DEFAULTS);

  const toggle = (key: string) =>
    setActive((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const set = (key: LensChannel, value: number) =>
    setLens((prev) => ({ ...prev, [key]: value }));

  const filter = active
    .map((key) => LENSES.find((l) => l.key === key))
    .filter(Boolean)
    .map((l) => l!.filter(lens.strength))
    .join(" ");

  return (
    <section aria-label="The lens" className="relative overflow-hidden py-20 sm:py-24">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <Rise className="relative mx-auto flex max-w-[640px] flex-col items-center text-center">
          <TextScrim />
          <p className="label over-stage">the lens · under different lights</p>
          <p className="over-stage mt-4 max-w-[560px] text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
            Each button lays a lens over the light source. Stack them, then hold the
            sliders: the same source reads warm, cold, negative, smoked or frosted, and
            everything seen through the glass changes with it. The desk above still moves
            the light itself.
          </p>
        </Rise>

        <div className="mx-auto mt-9 max-w-[860px]">
          <div className="flex flex-wrap justify-center gap-2.5">
            {LENSES.map((l) => (
              <Button
                key={l.key}
                type="button"
                variant={active.includes(l.key) ? "secondary" : "outline"}
                aria-pressed={active.includes(l.key)}
                onClick={() => toggle(l.key)}
              >
                {l.label}
              </Button>
            ))}
          </div>

          {/* The seat: a fixed-height window onto the live stage. The lens is
              a circle whose backdrop filter is the composition of the active
              glasses; with none active it waits as a dashed outline. */}
          <div className="relative mt-5 h-[380px] overflow-hidden rounded-xl border border-white/10">
            <div
              aria-hidden
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                active.length
                  ? "border border-white/25"
                  : "border border-dashed border-white/15"
              }`}
              style={{
                left: `${lens.x}%`,
                top: `${lens.y}%`,
                width: lens.size,
                height: lens.size,
                backdropFilter: filter || undefined,
                WebkitBackdropFilter: filter || undefined,
                boxShadow: active.length
                  ? "inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 0 28px rgba(255,255,255,0.05)"
                  : undefined,
              }}
            />
            <span className="over-stage absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
              {active.length ? active.join(" + ") : "add a lens over the light"}
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-card p-6 backdrop-blur-sm">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {LENS_SLIDERS.map((ch) => (
                <label key={ch.key} className="block">
                  <span className="flex justify-between font-mono text-[10px] text-muted-foreground">
                    <span className="tracking-[0.1em] uppercase">{ch.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {ch.format(lens[ch.key])}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={ch.min}
                    max={ch.max}
                    step={ch.step}
                    value={lens[ch.key]}
                    onChange={(e) => set(ch.key, Number(e.target.value))}
                    className="mt-1 min-h-11 w-full cursor-pointer rounded-md accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <Rise className="relative mx-auto mt-6 max-w-[560px] text-center">
          <TextScrim />
          <p className="over-stage font-mono text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground uppercase">
            A lens adds nothing of its own: every reading is the one light source, re-bent
            through whatever glass you stacked.
          </p>
        </Rise>
      </div>
    </section>
  );
}

const PRISMS = [
  { label: "as lit", filter: "" },
  { label: "quarter turn", filter: "backdrop-hue-rotate-90" },
  { label: "half turn", filter: "backdrop-hue-rotate-180" },
  { label: "into shade", filter: "backdrop-brightness-50" },
];

export function PrismTilesDemo() {
  return (
    <section
      aria-label="Text boxes as prisms"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <Rise className="relative mx-auto flex max-w-[640px] flex-col items-center text-center">
          <TextScrim />
          <p className="label over-stage">the prism row · one light, four readings</p>
          <p className="over-stage mt-4 max-w-[540px] text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
            A text box over the stage brings almost no light of its own: what you read is
            mostly the rays already behind it, re-bent. These four boxes sit over one
            backdrop and read it four different ways.
          </p>
        </Rise>

        <div className="mx-auto mt-10 grid max-w-[900px] grid-cols-2 gap-3 sm:grid-cols-4">
          {PRISMS.map((p) => (
            <div
              key={p.label}
              className={`flex h-36 flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-muted ${p.filter}`}
            >
              <GlassText className="text-[26px] font-medium tracking-[-0.03em] sm:text-[30px]">
                quirq
              </GlassText>
              <span className="over-stage rounded-full bg-card px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                {p.label}
              </span>
            </div>
          ))}
        </div>

        <Rise className="relative mx-auto mt-8 max-w-[560px] text-center">
          <TextScrim />
          <p className="over-stage font-mono text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground uppercase">
            One backdrop, four readings: the hue turned a quarter and a half around the
            wheel, and one box pulled into shade.
          </p>
        </Rise>
      </div>
    </section>
  );
}
