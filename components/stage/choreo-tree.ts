/**
 * Phases 3 and 4 of the list-to-tree migration: choreography as a tree.
 *
 * The tree is an AUTHORING structure, never a runtime one. A resolver runs
 * when the page mounts or the context changes (resize), filters branches by
 * their `when` predicates, flattens depth-first to leaves, and merges each
 * leaf's partial keyframe over its ancestors so every leaf comes out FULL.
 * The per-frame path only ever sees the resolved flat track; it never walks
 * the tree.
 *
 * Cascade rule: a node's keyframe is spread over the merge of everything
 * above it. The root MUST be full (it is the base the shot falls back to);
 * leaves override only what differs. Beat 4 demonstrates it: its `x` is
 * inherited from the root rather than restated.
 */

export type Keyframe = {
  /** Position, world units. `x` is scaled by available width at runtime. */
  x: number;
  y: number;
  z: number;
  scale: number;
  /** Rotation *rate* about Y, radians/second. */
  spin: number;
  /** Absolute tilt targets. */
  tiltX: number;
  tiltZ: number;
  /** Optics: how far the refracted RGB channels separate. Colour = value. */
  chroma: number;
  /** Refraction depth. Thicker glass bends light further. */
  thickness: number;
  distortion: number;
  aniso: number;
  rough: number;
  ior: number;
  /**
   * Brightness of the light source upstage: what the glass has to refract.
   * These are base levels; `LIGHT.burstGain` in lib/lighting.ts scales all
   * of them together.
   */
  burst: number;
};

/** The channel list, static so the per-frame sampler never calls Object.keys. */
export const CHANNELS = [
  "x",
  "y",
  "z",
  "scale",
  "spin",
  "tiltX",
  "tiltZ",
  "chroma",
  "thickness",
  "distortion",
  "aniso",
  "rough",
  "ior",
  "burst",
] as const satisfies readonly (keyof Keyframe)[];

/**
 * Exhaustiveness guard: the `satisfies` above only checks that each listed
 * name is a Keyframe key, not that every key is listed. This alias fails to
 * compile the moment a Keyframe key is missing from CHANNELS, so a new
 * channel can never silently freeze at its seed value in the sampler.
 */
type AssertNever<T extends never> = T;
/** @public Compile-time assertion; TypeScript checks it without a runtime consumer. */
export type _ChannelsAreExhaustive = AssertNever<
  Exclude<keyof Keyframe, (typeof CHANNELS)[number]>
>;

/** What predicates may branch on. Extend as branches need it. */
export type TrackContext = {
  width: number;
};

export type ChoreoNode = {
  id: string;
  /** Partial override, cascaded over the merge of the ancestors. */
  keyframe?: Partial<Keyframe>;
  /** Branch predicate; a node that fails is pruned with its whole subtree. */
  when?: (ctx: TrackContext) => boolean;
  children?: ChoreoNode[];
};

export type ResolvedLeaf = {
  id: string;
  keyframe: Keyframe;
};

/**
 * The root pose: beat 0 of the original flat array. Every other beat is a
 * partial override of this.
 */
const BASE: Keyframe = {
  x: 0,
  y: -0.32,
  z: -2.6,
  scale: 1.34,
  spin: 0.075,
  tiltX: 0.42,
  tiltZ: -0.12,
  chroma: 0.5,
  thickness: 1.5,
  distortion: 0.15,
  aniso: 0.22,
  rough: 0.05,
  ior: 1.62,
  burst: 0.56,
};

/**
 * The shot, as a tree. Today it is five leaves under one root, value-for-value
 * identical to the old flat KEYFRAMES array (docs/goldens/ proves it). What
 * the shape buys: partial keyframes that inherit, `when` branches, and, once
 * sections bind to leaves by id, nested sub-beats.
 */
export const CHOREOGRAPHY: ChoreoNode = {
  id: "shot",
  keyframe: BASE,
  children: [
    // 0 · hero: centred behind the wordmark, breathing slowly. Pure BASE.
    { id: "hero" },
    // 1 · business impact: the glass moves aside to reveal the shared work loop.
    {
      id: "consumption",
      keyframe: {
        x: 2.5,
        y: -0.15,
        z: -0.7,
        scale: 1.0,
        spin: 0.045,
        tiltX: 0.86,
        tiltZ: 0.3,
        chroma: 0.015,
        thickness: 0.5,
        distortion: 0.7,
        aniso: 0.6,
        rough: 0.26,
        ior: 1.32,
        burst: 0.19,
      },
    },
    // 2 · work to business outcome: full spectrum returns as momentum builds.
    {
      id: "delivery",
      keyframe: {
        x: -2.35,
        y: 0.15,
        z: 0.5,
        scale: 1.12,
        spin: 0.16,
        tiltX: 0.2,
        tiltZ: -0.42,
        chroma: 0.95,
        thickness: 2.3,
        distortion: 0.1,
        aniso: 0.14,
        rough: 0.02,
        ior: 1.72,
        burst: 0.66,
      },
    },
    // 3 · the collection: desktop leaves room for copy while mobile lowers and
    // enlarges the same ribbon so its outcome vertices own the open middle.
    {
      id: "ledger",
      when: ({ width }) => width > 820,
      keyframe: {
        x: 3.05,
        y: 1.5,
        z: -3.2,
        scale: 0.8,
        spin: 0.1,
        tiltX: 1.15,
        tiltZ: 0.2,
        chroma: 0.6,
        thickness: 1.6,
        distortion: 0.2,
        aniso: 0.2,
        rough: 0.06,
        ior: 1.6,
        burst: 0.42,
      },
    },
    {
      id: "ledger",
      when: ({ width }) => width <= 820,
      keyframe: {
        x: 0,
        y: 0.35,
        z: -2.4,
        scale: 1,
        spin: 0.1,
        tiltX: 1.05,
        tiltZ: 0.16,
        chroma: 0.58,
        thickness: 1.55,
        distortion: 0.18,
        aniso: 0.2,
        rough: 0.06,
        ior: 1.6,
        burst: 0.28,
      },
    },
    // 4 · the invitation: returns centre, biggest, fully lit. `x` inherits 0
    // from the root: the first cascaded channel in the tree.
    {
      id: "invite",
      keyframe: {
        y: 0,
        z: 1.2,
        scale: 1.42,
        spin: 0.2,
        tiltX: 0.55,
        tiltZ: 0.5,
        chroma: 1.15,
        thickness: 2.6,
        distortion: 0.12,
        aniso: 0.1,
        rough: 0.02,
        ior: 1.78,
        burst: 0.9,
      },
    },
  ],
};

/**
 * Filter by predicates, flatten depth-first, cascade partials into full
 * leaves. Runs on mount and context change, never per frame.
 */
export function resolveTrack(root: ChoreoNode, ctx: TrackContext): ResolvedLeaf[] {
  const leaves: ResolvedLeaf[] = [];

  const walk = (node: ChoreoNode, inherited: Keyframe) => {
    if (node.when && !node.when(ctx)) return;
    const merged: Keyframe = { ...inherited, ...node.keyframe };
    if (!node.children || node.children.length === 0) {
      leaves.push({ id: node.id, keyframe: merged });
      return;
    }
    for (const child of node.children) walk(child, merged);
  };

  // The root's own keyframe seeds the cascade; BASE backstops a root that
  // declares only part of the shape.
  walk(root, { ...BASE, ...root.keyframe });
  return leaves;
}
