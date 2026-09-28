"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { StageQuality } from "./glass-form";

// three.js, drei and the shaders are ~1MB of the bundle. Loading them lazily
// keeps them off the critical path: the hero renders from static HTML first.
const Scene = dynamic(() => import("./scene"), { ssr: false });

/** Does this browser have a GL context to give us at all? */
function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Real-time double-refraction is expensive: every frame renders the scene into
 * a buffer, twice over when `backside` is on. Phones and low-core machines get
 * a cheaper pass rather than a slideshow.
 */
function detectQuality(): StageQuality {
  const small = window.matchMedia("(max-width: 820px)").matches;
  const thin = (navigator.hardwareConcurrency ?? 4) <= 4;
  return small || thin
    ? { samples: 3, resolution: 256, backside: false }
    : { samples: 8, resolution: 512, backside: true };
}

/**
 * The persistent 3D layer. Mounts once, behind everything, and is never
 * remounted between beats: the continuity of that single object is the design.
 */
export default function Stage() {
  const [quality, setQuality] = useState<StageQuality | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    if (!detectWebGL()) {
      // Browser capabilities are unknown during SSR; initialize after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebgl(false);
      return;
    }
    setQuality(detectQuality());
  }, []);

  // No GL: fall back to the rendered still of the same form, so the page keeps
  // its subject instead of collapsing to a flat black screen.
  if (!webgl) {
    return (
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-[url('/assets/mobius.jpg')] bg-cover bg-center opacity-60"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1400ms] ease-out"
      style={{ opacity: lit ? 1 : 0 }}
    >
      {quality && <Scene quality={quality} onReady={() => setLit(true)} />}
    </div>
  );
}
