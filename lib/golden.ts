import { stage } from "./stage-store";
import {
  KEYFRAMES,
  getTrack,
  sampleKeyframes,
  type Keyframe,
} from "@/components/stage/choreography";

/**
 * Phase 0 of the list-to-tree migration: the golden harness.
 *
 * Captures the scroll-to-beat mapping and the sampled keyframe values at
 * fixed scroll fractions, from the live runtime (not a reimplementation), so
 * every later refactor can be proven a no-op by diffing two captures.
 *
 * Dev-only: exposed as window.__golden() by the scroll runtime. Baselines
 * live in docs/goldens/*.json.
 */

export type GoldenSample = {
  f: number;
  scroll: number;
  beat: number;
  values: Record<string, number>;
};

export type Golden = {
  path: string;
  viewport: { w: number; h: number };
  centres: number[];
  samples: GoldenSample[];
};

const round = (n: number) => Math.round(n * 1e5) / 1e5;

export async function captureGolden(steps = 21): Promise<Golden> {
  const lenis = (
    window as unknown as {
      __lenis?: { scrollTo: (y: number, o: { immediate: boolean }) => void };
    }
  ).__lenis;
  const limit = document.documentElement.scrollHeight - window.innerHeight;

  const centres = Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"))
    .sort((a, b) => Number(a.dataset.beat ?? 0) - Number(b.dataset.beat ?? 0))
    .map((el) => {
      const box = el.getBoundingClientRect();
      return Math.round(box.top + window.scrollY + box.height / 2);
    });

  const out: Keyframe = { ...KEYFRAMES[0] };
  const samples: GoldenSample[] = [];

  for (let s = 0; s < steps; s++) {
    const f = s / (steps - 1);
    const scroll = f * limit;
    if (lenis) lenis.scrollTo(scroll, { immediate: true });
    else window.scrollTo(0, scroll);
    // The write happens synchronously on the lenis scroll event; the wait
    // only lets a visible frame settle. Hidden documents throttle both
    // timers and rAF, and nothing paints there anyway, so skip the wait
    // entirely rather than letting the walk crawl in a background tab.
    await new Promise<void>((resolve) => {
      if (document.hidden) return resolve();
      const timer = setTimeout(resolve, 80);
      requestAnimationFrame(() => {
        clearTimeout(timer);
        resolve();
      });
    });

    const k = sampleKeyframes(getTrack(), stage.beat, out);
    const values: Record<string, number> = {};
    for (const key of Object.keys(k) as Array<keyof Keyframe>) {
      values[key] = round(k[key]);
    }
    samples.push({
      f: round(f),
      scroll: Math.round(scroll),
      beat: round(stage.beat),
      values,
    });
  }

  if (lenis) lenis.scrollTo(0, { immediate: true });
  return {
    path: location.pathname,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    centres,
    samples,
  };
}
