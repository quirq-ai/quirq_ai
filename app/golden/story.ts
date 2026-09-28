import type { BeatData } from "@/components/story/types";

/** The golden harness: the feature explained, as story data. */
export const STORY: BeatData[] = [
  {
    index: 0,
    id: "golden-hero",
    layout: "center",
    title: ["Refactor with", "witnesses."],
    glass: 1,
    lede: "The scroll stage was rebuilt from a flat array into a tree without moving a single pixel. Not carefully: provably. This is the tool that made the proof, and what it means for changing anything here.",
  },
  {
    index: 1,
    id: "golden-what",
    layout: "left",
    marker: "01 · what it captures",
    title: ["Runtime truth,", "not a rerun."],
    rows: [
      {
        title: "The measured centres.",
        note: "Every beat section's document-space centre, exactly as the live runtime measured them, viewport and webfonts included.",
      },
      {
        title: "The mapping, at 21 stops.",
        note: "Scroll fractions 0 to 1 through the real Lenis pipeline, reading stage.beat back from the store the glass reads.",
      },
      {
        title: "All fourteen channels.",
        note: "The sampled keyframe at every stop: position, tilts, optics, burst. If a refactor bends any of them, the numbers say so.",
      },
      {
        title: "Never a reimplementation.",
        note: "The harness asks the running system, not a copy of its math. A copy would faithfully reproduce the same bug twice.",
      },
    ],
  },
  {
    index: 2,
    id: "golden-how",
    layout: "right",
    marker: "02 · how it runs",
    title: ["One call,", "one diff."],
    glass: 1,
    code: "const g = await window.__golden(21)  // dev only\n// save, refactor, capture again, then:\n// max |before.beat - after.beat|  -> 0.000000\n// max |before.values - after.values| -> 0.000000",
    tiles: [
      {
        label: "Capture",
        body: "window.__golden(21) walks the page at 21 scroll stops and returns centres, beats, and channel values. Baselines live in docs/goldens.",
      },
      {
        label: "Diff",
        body: "A few lines of python compare captures channel by channel. The gate is zero delta, not close enough.",
      },
      {
        label: "Gate",
        body: "No migration phase landed until its capture matched the baseline exactly. Each phase shipped pixel-identical, by evidence.",
      },
    ],
  },
  {
    index: 3,
    id: "golden-caught",
    layout: "left",
    marker: "03 · what it caught",
    title: ["Silence here", "is the proof."],
    panelRows: [
      {
        title: "The unregistered invite.",
        note: "Minutes after the registry landed, the capture showed the walk clamping at beat 3: the invite section, custom-built without the Beat primitive, had never registered. Found before any eye could.",
      },
      {
        title: "The tree, value for value.",
        note: "Five leaves under a cascading root reproduce the old flat array at 0.000000 delta on every stop and channel.",
      },
      {
        title: "The id binding, re-proven.",
        note: "When section binding switched from position to id, the capture ran again. Same zeros. Same shot.",
      },
    ],
    caption:
      "The meaning: the shot is an invariant now, not a hope. Anyone can rebuild the machinery under it and know within a minute whether the page noticed.",
  },
  {
    index: 4,
    id: "golden-close",
    layout: "center",
    title: ["Change anything.", "Prove everything."],
    glass: 1,
    lede: "The harness is why the rest of this series exists: the registry, the tree, the editor and the journey all landed on top of a shot that could not silently drift.",
    links: [
      {
        href: "/registry",
        label: "Next: the registry",
      },
      {
        href: "/tree",
        label: "The tree it gated",
        tone: "ghost",
      },
    ],
  },
];
