"use client";

import { useEffect } from "react";
import { stage } from "@/lib/stage-store";
import {
  overrideLeaves,
  type ResolvedLeaf,
} from "@/components/stage/choreography";
import {
  CHOREOGRAPHY,
  resolveTrack,
  type Keyframe,
} from "@/components/stage/choreo-tree";

/**
 * The homepage keeps the stage alive, but treats it as atmosphere instead of
 * a second focal point. Material changes still distinguish the five beats;
 * spatial movement stays close to the opening pose.
 */
const DEFAULT_HOME_LEAVES = resolveTrack(CHOREOGRAPHY, { width: 1280 });
const HOME_BASE = DEFAULT_HOME_LEAVES[0].keyframe;

const toward = (base: number, value: number, gain: number) =>
  base + (value - base) * gain;

function calmKeyframe(keyframe: Keyframe): Keyframe {
  return {
    ...keyframe,
    x: toward(HOME_BASE.x, keyframe.x, 0.16),
    y: toward(HOME_BASE.y, keyframe.y, 0.12),
    z: toward(HOME_BASE.z, keyframe.z, 0.1),
    scale: toward(HOME_BASE.scale, keyframe.scale, 0.18),
    spin: keyframe.spin * 0.24,
    tiltX: toward(HOME_BASE.tiltX, keyframe.tiltX, 0.24),
    tiltZ: toward(HOME_BASE.tiltZ, keyframe.tiltZ, 0.24),
  };
}

export const HOME_CALM_LEAVES: readonly ResolvedLeaf[] =
  DEFAULT_HOME_LEAVES.map((leaf) => ({
    id: leaf.id,
    keyframe: calmKeyframe(leaf.keyframe),
  }));

export function HomeStageProfile() {
  useEffect(() => {
    const previousPointerGain = stage.pointerGain;
    overrideLeaves(HOME_CALM_LEAVES);
    stage.pointerGain = 0.14;

    return () => {
      overrideLeaves(null);
      stage.pointerGain = previousPointerGain;
      stage.pointerX = 0;
      stage.pointerY = 0;
    };
  }, []);

  return null;
}
