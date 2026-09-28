import * as THREE from "three";

export type RibbonOptions = {
  /** Radius of the loop the ribbon is swept around. */
  radius?: number;
  /** Width of the ribbon face: the broad surface light disperses through. */
  width?: number;
  /** Ribbon thickness. Thin reads as glass; the refraction depth is set on the material. */
  thickness?: number;
  /** Steps around the loop. */
  segments?: number;
  /** Whole rotations of the cross-section across the loop. Integers close the seam. */
  twists?: number;
  /** Vertical amplitude, lifting the loop off-plane into a saddle. */
  wave?: number;
  /** How many vertical oscillations per revolution. */
  waveFreq?: number;
};

export type ResolvedRibbonOptions = Required<RibbonOptions>;

export const RIBBON_DEFAULTS: ResolvedRibbonOptions = {
  radius: 2.2,
  width: 0.6,
  thickness: 0.22,
  segments: 512,
  twists: 2,
  wave: 0.5,
  waveFreq: 2,
};

export type RibbonFrame = {
  centre: THREE.Vector3;
  tangent: THREE.Vector3;
  radial: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
  rolledN: THREE.Vector3;
  rolledB: THREE.Vector3;
};

/** Allocate one frame, then reuse it across every sample. */
export function createRibbonFrame(): RibbonFrame {
  return {
    centre: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    radial: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    binormal: new THREE.Vector3(),
    rolledN: new THREE.Vector3(),
    rolledB: new THREE.Vector3(),
  };
}

/**
 * Sample the same swept frame used to build the ribbon.
 *
 * Outcome vertices use this too, so they stay attached when the authored
 * radius, wave, or twist changes. `out` is mutated to keep repeated sampling
 * allocation-free.
 */
export function sampleRibbonFrame(
  t: number,
  out: RibbonFrame,
  options: ResolvedRibbonOptions = RIBBON_DEFAULTS,
): RibbonFrame {
  const u = t * Math.PI * 2;
  const { radius, twists, wave, waveFreq } = options;

  out.centre.set(
    radius * Math.cos(u),
    wave * Math.sin(waveFreq * u),
    radius * Math.sin(u),
  );

  out.tangent
    .set(
      -radius * Math.sin(u),
      wave * waveFreq * Math.cos(waveFreq * u),
      radius * Math.cos(u),
    )
    .normalize();

  out.radial.set(Math.cos(u), 0, Math.sin(u));
  out.normal
    .copy(out.radial)
    .addScaledVector(out.tangent, -out.radial.dot(out.tangent))
    .normalize();
  out.binormal.crossVectors(out.tangent, out.normal).normalize();

  const phi = twists * u;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  out.rolledN.copy(out.normal).multiplyScalar(cos).addScaledVector(out.binormal, sin);
  out.rolledB.copy(out.normal).multiplyScalar(-sin).addScaledVector(out.binormal, cos);

  return out;
}

/**
 * A closed, twisted glass ribbon: the quirq mark's mobius, built procedurally.
 *
 * Swept as four separate quad strips (one per face of the rectangular
 * cross-section) rather than one welded tube. Each face owns its vertices, so
 * `computeVertexNormals` leaves the long edges crisp instead of rounding them
 * into a soft tube: those hard edges are what throw the sharp caustics and
 * split light into the spectrum.
 */
export function createRibbonGeometry(options: RibbonOptions = {}): THREE.BufferGeometry {
  const config: ResolvedRibbonOptions = {
    ...RIBBON_DEFAULTS,
    ...options,
  };
  const { width, thickness, segments } = config;
  const hw = width / 2;
  const ht = thickness / 2;

  // Cross-section corners, counter-clockwise in the (normal, binormal) plane.
  const section: Array<[number, number]> = [
    [hw, ht],
    [-hw, ht],
    [-hw, -ht],
    [hw, -ht],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Scratch vectors, reused across the sweep.
  const frame = createRibbonFrame();
  const point = new THREE.Vector3();

  for (let side = 0; side < 4; side++) {
    const [ax, ay] = section[side];
    const [bx, by] = section[(side + 1) % 4];
    const base = positions.length / 3;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      sampleRibbonFrame(t, frame, config);

      point
        .copy(frame.centre)
        .addScaledVector(frame.rolledN, ax)
        .addScaledVector(frame.rolledB, ay);
      positions.push(point.x, point.y, point.z);
      uvs.push(t, side / 4);

      point
        .copy(frame.centre)
        .addScaledVector(frame.rolledN, bx)
        .addScaledVector(frame.rolledB, by);
      positions.push(point.x, point.y, point.z);
      uvs.push(t, (side + 1) / 4);
    }

    // Wind each quad so its normal faces outward: with the corners ordered
    // counter-clockwise and B = T × N, (a,b,c) and (b,d,c) both point away.
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
