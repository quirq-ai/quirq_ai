"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { KEYFRAMES, damp, getTrack, sampleKeyframes } from "./choreography";
import { LIGHT, glsl } from "@/lib/lighting";
import { stage } from "@/lib/stage-store";

/**
 * The source the glass refracts.
 *
 * Transmission needs something behind the object to bend: against a pure black
 * void it renders black glass. So the void gets a light: a centred prismatic
 * burst, far upstage, which is both the thing the ribbon disperses *and* the
 * brand's own cover image.
 */
const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uAspect;
  uniform float uHue;

  /* Cosine palette across the spectrum: same seven hues, continuous. uHue
     turns the whole wheel; at 0.0 the palette is untouched. */
  vec3 spectrum(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (t + uHue + vec3(0.0, -0.333, -0.667)));
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;
    float r = length(p);
    float a = atan(p.y, p.x);

    /* the hot core */
    vec3 col = vec3(1.0) * exp(-r * r * ${glsl(LIGHT.core[0], 1)}) * ${glsl(LIGHT.core[1])};

    /* spectral rays fanning out of it */
    float rays =
      pow(abs(sin(a * 3.0 + uTime * 0.05)), 24.0) +
      pow(abs(sin(a * 5.0 - 1.3)), 44.0) +
      pow(abs(sin(a * 2.0 + 0.7)), 60.0);
    col += spectrum(fract(a / 6.28318 + 0.5)) * rays * exp(-r * ${glsl(LIGHT.rays[0], 1)}) * ${glsl(LIGHT.rays[1])};

    /* diffraction halo */
    col += spectrum(fract(r * 2.2 - uTime * 0.02)) * exp(-r * r * ${glsl(LIGHT.halo[0], 1)}) * ${glsl(LIGHT.halo[1])};
    col += vec3(1.0) * exp(-r * r * ${glsl(LIGHT.bloom[0], 1)}) * ${glsl(LIGHT.bloom[1])};

    col *= uIntensity;

    float alpha = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * The burst plane sits far upstage, so to stay visually behind the form it has
 * to move further than the form does: in proportion to their distances from
 * the camera (~20 units vs ~8.5).
 */
const PARALLAX = 2.2;

export function LightBurst() {
  const plane = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const live = useRef(KEYFRAMES[0].burst * LIGHT.burstGain);
  const liveX = useRef(0);
  const liveY = useRef(0);
  const liveSize = useRef(1);
  const liveHue = useRef(0);
  const frame = useRef({ ...KEYFRAMES[0] });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: KEYFRAMES[0].burst * LIGHT.burstGain },
      uAspect: { value: 1.6 },
      uHue: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    const k = sampleKeyframes(getTrack(), stage.beat, frame.current);
    const lambda = stage.reduced ? 400 : 3.2;

    // The /engine light desk multiplies and offsets the choreographed values;
    // at the store defaults (1, 1, 0, 0, 0) every line below is a no-op.
    live.current = damp(
      live.current,
      k.burst * LIGHT.burstGain * stage.lightGain,
      lambda,
      dt,
    );
    m.uniforms.uIntensity.value = live.current;
    m.uniforms.uTime.value = stage.reduced ? 8 : state.clock.elapsedTime;
    m.uniforms.uAspect.value = state.size.width / Math.max(state.size.height, 1);

    liveHue.current = damp(liveHue.current, stage.lightHue, lambda, dt);
    m.uniforms.uHue.value = liveHue.current;

    // Track the form, so the bloom stays behind the glass instead of sitting
    // under whichever column the copy is in.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const spread = THREE.MathUtils.clamp((aspect - 0.72) / 0.78, 0, 1);
    liveX.current = damp(
      liveX.current,
      k.x * spread * PARALLAX + stage.lightX,
      lambda,
      dt,
    );
    liveY.current = damp(liveY.current, stage.lightY, lambda, dt);
    liveSize.current = damp(liveSize.current, stage.lightSize, lambda, dt);
    if (plane.current) {
      plane.current.position.x = liveX.current;
      plane.current.position.y = liveY.current;
      plane.current.scale.set(liveSize.current, liveSize.current, 1);
    }
  });

  return (
    <mesh ref={plane} position={[0, 0, -11]} renderOrder={-1}>
      <planeGeometry args={[52, 34]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
