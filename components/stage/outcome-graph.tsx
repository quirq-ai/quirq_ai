"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { damp } from "./choreography";
import { RIBBON_DEFAULTS, createRibbonFrame, sampleRibbonFrame } from "./ribbon-geometry";
import { stage } from "@/lib/stage-store";

type OutcomeKind = "positive" | "partial" | "negative";

type OutcomeNode = {
  t: number;
  lane: number;
  kind: OutcomeKind;
};

const NODES = [
  { t: 0.04, lane: -0.35, kind: "positive" },
  { t: 0.14, lane: 0.54, kind: "partial" },
  { t: 0.25, lane: -0.18, kind: "positive" },
  { t: 0.36, lane: 0.42, kind: "negative" },
  { t: 0.47, lane: -0.58, kind: "positive" },
  { t: 0.59, lane: 0.16, kind: "partial" },
  { t: 0.7, lane: 0.62, kind: "positive" },
  { t: 0.81, lane: -0.28, kind: "negative" },
  { t: 0.92, lane: 0.34, kind: "positive" },
] satisfies readonly OutcomeNode[];

const KIND_COUNTS: Record<OutcomeKind, number> = {
  positive: NODES.filter((node) => node.kind === "positive").length,
  partial: NODES.filter((node) => node.kind === "partial").length,
  negative: NODES.filter((node) => node.kind === "negative").length,
};

const EDGE_SAMPLES = 10;
const SURFACE_LIFT = 0.035;

function writeSurfacePoint(
  t: number,
  lane: number,
  out: THREE.Vector3,
  frame: ReturnType<typeof createRibbonFrame>,
) {
  sampleRibbonFrame(t, frame);
  return out
    .copy(frame.centre)
    .addScaledVector(frame.rolledN, lane * RIBBON_DEFAULTS.width * 0.5)
    .addScaledVector(frame.rolledB, RIBBON_DEFAULTS.thickness * 0.5 + SURFACE_LIFT);
}

function createEdgeGeometry() {
  const positions: number[] = [];
  const frame = createRibbonFrame();
  const previous = new THREE.Vector3();
  const current = new THREE.Vector3();

  for (let edge = 0; edge < NODES.length - 1; edge++) {
    const from = NODES[edge];
    const to = NODES[edge + 1];

    for (let sample = 0; sample <= EDGE_SAMPLES; sample++) {
      const progress = sample / EDGE_SAMPLES;
      const t = THREE.MathUtils.lerp(from.t, to.t, progress);
      const lane = THREE.MathUtils.lerp(from.lane, to.lane, progress);
      writeSurfacePoint(t, lane, current, frame);

      if (sample > 0) {
        positions.push(
          previous.x,
          previous.y,
          previous.z,
          current.x,
          current.y,
          current.z,
        );
      }
      previous.copy(current);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function createNodeSamples() {
  const frame = createRibbonFrame();
  const basis = new THREE.Matrix4();

  return NODES.map((node) => {
    const position = writeSurfacePoint(node.t, node.lane, new THREE.Vector3(), frame);
    basis.makeBasis(frame.tangent, frame.rolledN, frame.rolledB);

    return {
      ...node,
      position,
      quaternion: new THREE.Quaternion().setFromRotationMatrix(basis),
    };
  });
}

/**
 * A scene-native graph: every marker is attached to the same swept frame as
 * the live ribbon. It stays mounted with the persistent stage and only fades
 * in around the homepage collection beat.
 */
export function OutcomeGraph() {
  const group = useRef<THREE.Group>(null);
  const positive = useRef<THREE.InstancedMesh>(null);
  const partial = useRef<THREE.InstancedMesh>(null);
  const negative = useRef<THREE.InstancedMesh>(null);
  const positiveMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const partialMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const negativeMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMaterial = useRef<THREE.LineBasicMaterial>(null);
  const alpha = useRef(0);

  const samples = useMemo(() => createNodeSamples(), []);
  const edgeGeometry = useMemo(() => createEdgeGeometry(), []);

  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  useLayoutEffect(() => {
    const meshes: Record<OutcomeKind, THREE.InstancedMesh | null> = {
      positive: positive.current,
      partial: partial.current,
      negative: negative.current,
    };
    const cursors: Record<OutcomeKind, number> = {
      positive: 0,
      partial: 0,
      negative: 0,
    };
    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3(1, 1, 1);

    for (const sample of samples) {
      const mesh = meshes[sample.kind];
      if (!mesh) continue;
      matrix.compose(sample.position, sample.quaternion, scale);
      mesh.setMatrixAt(cursors[sample.kind], matrix);
      cursors[sample.kind] += 1;
    }

    for (const mesh of Object.values(meshes)) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [samples]);

  useFrame((_, delta) => {
    const distance = Math.abs(stage.beat - 3);
    const target = stage.showQuirqGraph
      ? 1 - THREE.MathUtils.smoothstep(distance, 0.28, 0.78)
      : 0;
    alpha.current = damp(
      alpha.current,
      target,
      stage.reduced ? 400 : 7,
      Math.min(delta, 0.05),
    );

    const value = alpha.current;
    if (group.current) group.current.visible = value > 0.01;
    if (positiveMaterial.current) {
      positiveMaterial.current.opacity = value * 0.94;
    }
    if (partialMaterial.current) {
      partialMaterial.current.opacity = value * 0.76;
    }
    if (negativeMaterial.current) {
      negativeMaterial.current.opacity = value * 0.9;
    }
    if (edgeMaterial.current) {
      edgeMaterial.current.opacity = value * 0.48;
    }
  }, -1);

  return (
    <group ref={group} visible={false}>
      <lineSegments geometry={edgeGeometry} renderOrder={3}>
        <lineBasicMaterial
          ref={edgeMaterial}
          color="#ffffff"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <instancedMesh
        ref={positive}
        args={[undefined, undefined, KIND_COUNTS.positive]}
        frustumCulled={false}
        renderOrder={4}
      >
        <octahedronGeometry args={[0.115, 0]} />
        <meshBasicMaterial
          ref={positiveMaterial}
          color="#ffffff"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>

      <instancedMesh
        ref={partial}
        args={[undefined, undefined, KIND_COUNTS.partial]}
        frustumCulled={false}
        renderOrder={4}
      >
        <torusGeometry args={[0.09, 0.024, 8, 24]} />
        <meshBasicMaterial
          ref={partialMaterial}
          color="#ffffff"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </instancedMesh>

      <instancedMesh
        ref={negative}
        args={[undefined, undefined, KIND_COUNTS.negative]}
        frustumCulled={false}
        renderOrder={4}
      >
        <octahedronGeometry args={[0.135, 0]} />
        <meshBasicMaterial
          ref={negativeMaterial}
          color="#ffffff"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
          wireframe
        />
      </instancedMesh>
    </group>
  );
}
