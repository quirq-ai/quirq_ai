/**
 * The resolved keyframe track and its sampler.
 *
 * Since the list-to-tree migration, the track is no longer authored here: it
 * is resolved from the CHOREOGRAPHY tree in choreo-tree.ts (filter branches,
 * flatten to leaves, cascade partial keyframes). This module owns the
 * resolved state and the two per-frame functions, which stay allocation-free.
 *
 * The glass form is a single object that never unmounts; it is transformed
 * and re-tuned as the page scrolls, so the whole site reads as one continuous
 * shot rather than separate scenes. The optical values carry the argument:
 * colour is *value*.
 */

import {
  CHANNELS,
  CHOREOGRAPHY,
  resolveTrack,
  type Keyframe,
  type ResolvedLeaf,
  type TrackContext,
} from "./choreo-tree";

export type { Keyframe, ResolvedLeaf, TrackContext } from "./choreo-tree";

const DEFAULT_CTX: TrackContext = { width: 1280 };

let LEAVES: readonly ResolvedLeaf[] = resolveTrack(CHOREOGRAPHY, DEFAULT_CTX);
let TRACK: readonly Keyframe[] = LEAVES.map((leaf) => leaf.keyframe);

/**
 * The initial resolve, kept as a stable reference: seeds for the damped live
 * values and the material's first-paint props read from here. Per-frame code
 * must use getTrack() instead, which follows re-resolution.
 */
export const KEYFRAMES: readonly Keyframe[] = TRACK;

/**
 * Transient override: an editor, journey, or page-level motion profile can
 * stand its own leaves in front of the resolved tree. While set,
 * getTrack()/getResolvedLeaves() serve the override, so the live glass
 * restages instantly and the runtime's id binding follows the override's ids.
 * Owners must clear their override on unmount.
 */
let OVERRIDE: {
  leaves: readonly ResolvedLeaf[];
  track: readonly Keyframe[];
} | null = null;

export function overrideLeaves(leaves: readonly ResolvedLeaf[] | null) {
  OVERRIDE = leaves
    ? { leaves, track: leaves.map((leaf) => leaf.keyframe) }
    : null;
}

/** The live track. Read per frame; the reference swaps on re-resolution. */
export function getTrack(): readonly Keyframe[] {
  return OVERRIDE?.track ?? TRACK;
}

/**
 * The resolved leaves behind the live track, ids included. The runtime uses
 * these to bind registered sections to leaves BY ID when the page's ids match
 * the tree, which is what makes pruning a middle leaf safe: positional
 * binding would shift every later section onto the wrong pose.
 */
export function getResolvedLeaves(): readonly ResolvedLeaf[] {
  return OVERRIDE?.leaves ?? LEAVES;
}

/**
 * Re-resolve the tree against a fresh context (mount, resize). With no active
 * `when` predicates this reproduces the same values; with branches it is how
 * a page changes its walk. The scroll runtime calls this before measuring.
 */
export function refreshTrack(ctx: TrackContext): readonly Keyframe[] {
  LEAVES = resolveTrack(CHOREOGRAPHY, ctx);
  TRACK = LEAVES.map((leaf) => leaf.keyframe);
  return TRACK;
}

/** Ease the crossfade so beats settle instead of arriving linearly. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Sample a track at a fractional beat index, writing into `out` to avoid
 * allocating on every frame. Track-agnostic (phase 1): the caller passes the
 * track, so a future per-page or branched track needs no sampler change.
 */
export function sampleKeyframes(
  track: readonly Keyframe[],
  beat: number,
  out: Keyframe,
): Keyframe {
  const last = track.length - 1;
  // A one-leaf (or empty-filtered) track has nothing to blend toward.
  if (last <= 0) {
    const only = track[0];
    if (only) for (const key of CHANNELS) out[key] = only[key];
    return out;
  }
  const clamped = Math.min(Math.max(beat, 0), last);
  const i = Math.min(Math.floor(clamped), last - 1);
  const t = smooth(clamped - i);
  const a = track[i];
  const b = track[i + 1];
  for (const key of CHANNELS) out[key] = a[key] + (b[key] - a[key]) * t;
  return out;
}

/** Frame-rate independent exponential approach. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
