import type { BeatData } from "@/components/story/types";

/** The engine: the scene behind every page, taken apart. Story data rendered by StoryBeat. */
export const STORY: BeatData[] = [
  {
    index: 0,
    id: "engine-hero",
    layout: "center",
    title: ["One scene,", "three parts."],
    glass: 1,
    lede: "Every staged page here is played by the same engine: a glass ring, the light it bends, and the dark that keeps the words readable. This page takes the scene apart, one part per beat.",
  },
  {
    index: 1,
    id: "engine-ring",
    layout: "left",
    marker: "01 · the ring",
    title: ["A ring drawn", "by a function."],
    rows: [
      {
        title: "No model file.",
        note: "createRibbonGeometry() in stage/ribbon-geometry.ts sweeps a thin rectangle around a circle, twisting twice on the way round. The whole mobius is a few numbers: radius, width, twists, wave.",
      },
      {
        title: "It loads late.",
        note: "stage.tsx loads the 3D stack behind next/dynamic, keeping a megabyte of three.js off the first paint. The copy renders at once; the ring fades in after.",
      },
      {
        title: "Swap it in one line.",
        note: "glass-form.tsx builds the shape once: createRibbonGeometry(). Hand that call any other ring; the material, light and scroll keep working. Only the outcome marks on its surface need re-pinning.",
      },
      {
        title: "Or retune this one.",
        note: "Every measure is an option: twists: 0 is a plain band, wave: 0 a flat ring. Whole numbers of twist keep the seam closed.",
      },
    ],
  },
  {
    index: 2,
    id: "engine-light",
    layout: "right",
    marker: "02 · the light",
    title: ["Glass is black", "until you light it."],
    glass: 1,
    code: 'export const LIGHTING = "max"   // max · draft · mid · soft',
    tiles: [
      {
        label: "The burst",
        body: "A shader plane far upstage draws the core, the rays and the halo. Transmission bends whatever sits behind the glass; against a bare void the ring would render black.",
      },
      {
        label: "One switch",
        body: "The LIGHTING preset in lib/lighting.ts is the page's luminosity. It moves the rays, the glass sparkle and the scrims together; never tune the call sites separately.",
      },
      {
        label: "A level per beat",
        body: "Each pose carries a burst channel: the hero holds 0.56, the drained beat 0.19, the finale 0.9. Scroll blends between them, so the light breathes with the story.",
      },
    ],
  },
  {
    index: 3,
    id: "engine-dark",
    layout: "left",
    marker: "03 · the dark",
    title: ["The shadow", "follows the text."],
    panelRows: [
      {
        title: "A vignette frames the scene.",
        note: "A fixed radial darkening at the edges, plus a slow film grain over everything: the only full-frame shadow the stage carries.",
      },
      {
        title: "Adding text adds dark.",
        note: "Every text block over the stage brings its own TextScrim: an elliptical pool of black sized to the block, so copy stays readable wherever the glass wanders.",
      },
      {
        title: "The distortion is the glass.",
        note: "Thickness, distortion and chromatic aberration are material channels the scroll animates. The pools of shadow are what keep words legible through them.",
      },
      {
        title: "Some letters become holes.",
        note: "A GlassPool cuts real letterform holes in its scrim, so the burst shines through the glyphs it stands behind.",
      },
    ],
    caption: "Scrim strength travels with the lighting preset: light and shadow retune together, one switch.",
  },
  {
    index: 4,
    id: "engine-node",
    layout: "center",
    title: ["Three parts,", "one node."],
    glass: 1,
    lede: "The ring's pose and the light's level fold into one keyframe; the words bring their own shadow. Together they are a node. A page is just nodes in order, and a journey is nodes with choices.",
    links: [
      { href: "/journey", label: "Walk a page of nodes" },
      { href: "/how-it-works", label: "Write your own", tone: "ghost" },
    ],
  },
];
