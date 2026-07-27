/**
 * A module-level store instead of React context.
 *
 * The <Canvas> from react-three-fiber renders through its own reconciler root,
 * so provider context from the DOM tree is not reliably visible inside it.
 * More importantly, scroll and pointer values change every frame: routing them
 * through React state would re-render the whole page ~60×/second. The scroll
 * runtime writes here; useFrame reads here. No renders, no context bridge.
 */
/**
 * The /engine live demos write these; at the defaults every consumer is an
 * arithmetic no-op, so only /engine ever renders differently. Demos restore
 * from this object on unmount; keep it the single source of the defaults.
 */
export const STAGE_DEMO_DEFAULTS = {
  form: "mobius" as StageForm,
  /** Multiplies the beat's burst level (luminosity). */
  lightGain: 1,
  /** Scales the burst plane (apparent size of the source). */
  lightSize: 1,
  /** Turns the spectrum palette, in whole turns of the colour wheel. */
  lightHue: 0,
  /** Carries the burst around the frame, on top of its choreographed parallax. */
  lightX: 0,
  lightY: 0,
};

export const stage = {
  /** Fractional beat index. 0 = beat 0 centred, 1.5 = midway between 1 and 2. */
  beat: 0,
  /** Whole-document scroll progress, 0 → 1. */
  progress: 0,
  /** Pointer position in clip space, −1 → 1. */
  pointerX: 0,
  pointerY: 0,
  /** True when the visitor asked for less motion. */
  reduced: false,
  /** Homepage collection beat opts the persistent ribbon into outcome vertices. */
  showQuirqGraph: false,
  /** Set once the first frame has rendered, so we can fade the stage in. */
  ready: false,

  ...STAGE_DEMO_DEFAULTS,
};

export type StageForm = "mobius" | "knot";
export type StageStore = typeof stage;

/** Dev-only handle for tooling and verification, mirroring window.__lenis. */
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as Window & { __stage?: StageStore }).__stage = stage;
}
