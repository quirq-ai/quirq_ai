import type { BeatData } from "@/components/story/types";

/**
 * The scene-customization guide, as story data. Facts here mirror the code:
 * camera at [0,0,9] fov 38 in stage/scene.tsx, poses and optics from
 * choreo-tree.ts, brightness presets from lib/lighting.ts.
 */
export const STORY: BeatData[] = [
  {
    index: 0,
    id: "scenes-hero",
    layout: "center",
    title: ["The scene is", "yours to stage."],
    glass: 1,
    lede: "Every page here runs the same glass, the same light, the same camera. What changes is the staging: where the form stands, what its optics do, how bright the burst burns. This page is the manual.",
  },
  {
    index: 1,
    id: "scenes-anatomy",
    layout: "left",
    marker: "01 · what a scene is",
    title: ["Four parts,", "one shot."],
    rows: [
      {
        title: "The burst is the light source.",
        note: "A shader plane far upstage. Transmission glass renders black against a void; the burst is what the ribbon has to refract. It parallaxes at 2.2x the form's x so the bloom stays behind the glass.",
      },
      {
        title: "The ribbon is the only actor.",
        note: "One procedural twisted mesh, mounted once, never remounted. Every scene you have seen is this same object re-staged; its continuity is the design.",
      },
      {
        title: "The camera never moves.",
        note: "Fixed at [0, 0, 9], field of view 38. All apparent camera work is the form moving instead; the next beat explains why that is a feature.",
      },
      {
        title: "The track is the script.",
        note: "Resolved leaves from the choreography tree: one full pose-and-optics keyframe per beat. Scroll blends between adjacent leaves; damping makes the blend glide.",
      },
    ],
  },
  {
    index: 2,
    id: "scenes-knobs",
    layout: "right",
    marker: "02 · what may change",
    title: ["Fourteen knobs,", "three dials."],
    glass: 1,
    tiles: [
      {
        label: "Pose · per beat",
        body: "x, y, z, scale, spin, tiltX, tiltZ. Where the form stands and how it carries itself. Edit the leaf in choreo-tree.ts, or drag it live in the editor.",
      },
      {
        label: "Optics · per beat",
        body: "chroma, thickness, distortion, aniso, rough, ior. Colour is value here: drained near-monochrome reads as cost, wide-open spectrum reads as delivery.",
      },
      {
        label: "Light · per beat + one switch",
        body: "burst sets the source's level per beat; the LIGHTING preset in lib/lighting.ts (max, draft, mid, soft) scales the whole page's brightness as one coupled switch. Never tune its five call sites separately.",
      },
      {
        label: "Never",
        body: "The mesh (one object, always), the per-frame path (no allocations, no React), and text without its scrim or pool. These three are the contract.",
      },
    ],
    caption:
      "Quality auto-detects: small or thin machines get fewer samples, lower resolution, no backside refraction. You do not tune this per scene.",
  },
  {
    index: 3,
    id: "scenes-camera",
    layout: "left",
    marker: "03 · moving the camera",
    title: ["Move the world,", "not the lens."],
    panelRows: [
      {
        title: "Dolly = z.",
        note: "Push the form toward positive z to fill the frame (the invite pose sits at z 1.2), pull it negative to recede (the ledger pose parks at z -3.2).",
      },
      {
        title: "Truck and pedestal = x and y.",
        note: "Slide the form horizontally or vertically. x is scaled by viewport width at runtime, so narrow screens pull every pose toward centre on their own.",
      },
      {
        title: "Zoom feel = scale.",
        note: "Scale changes the subject without changing perspective, which keeps the burst's rays honest. Pair a scale rise with a z push for a true approach.",
      },
      {
        title: "Attitude = tiltX, tiltZ, spin.",
        note: "Tilts are absolute targets; spin is a rate, radians per second, so the form keeps turning through a beat rather than snapping to an angle.",
      },
    ],
    caption:
      "Why fixed? One subject over a parallaxing light reads identically to a moving camera, and a still camera keeps the DOM, the scrims and the glass holes aligned. The pose presets are the vocabulary: centre stage, drained, flooded, recede, finale.",
  },
  {
    index: 4,
    id: "scenes-make",
    layout: "center",
    title: ["Stage one", "yourself."],
    glass: 1,
    lede: "The editor composes beats, drags the pose and optics live on this very glass, and copies the result out as data you can drop into a new page.",
    links: [
      { href: "/editor", label: "Open the editor" },
      { href: "/dynamic", label: "The data pattern", tone: "ghost" },
    ],
  },
];
