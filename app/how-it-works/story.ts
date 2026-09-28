import type { BeatData } from "@/components/story/types";

/**
 * The journey-authoring manual: how to write the JSON files in
 * .quirq/journeys, what each component is, and what it affects. Facts mirror
 * app/journey/defs.tsx (the definition model) and the /journey page's rules.
 */
export const STORY: BeatData[] = [
  {
    index: 0,
    id: "how-hero",
    layout: "center",
    title: ["A journey is", "one file."],
    glass: 1,
    lede: "Every branching walk on /journey is a single JSON document in .quirq/journeys: the whole tree of beats and choices, plus the rules of the walk. This page is the manual for writing one.",
  },
  {
    index: 1,
    id: "how-shape",
    layout: "left",
    marker: "01 · the shape",
    title: ["Four keys,", "one document."],
    rows: [
      {
        title: "slug and name.",
        note: "slug is kebab-case identity: the filename, the ?j= share link, the trace scope. name is the label on the journey chip row.",
      },
      {
        title: "rules.",
        note: "start names the opening node; maxDepth force-ends any branch at that length; allowRewind and allowReplay show or hide those controls.",
      },
      {
        title: "nodes.",
        note: "The tree itself: a map of id to node. Ids are what choices point at and what share links encode, so renaming one breaks old links on purpose.",
      },
      {
        title: "Where it lives.",
        note: "Save as .quirq/journeys/<slug>.json. Store to .quirq seeds the file, Reload .quirq picks up edits, and in development it also records your walk.",
      },
    ],
  },
  {
    index: 2,
    id: "how-node",
    layout: "right",
    marker: "02 · a node",
    title: ["A beat, a pose,", "and a fork."],
    glass: 1,
    code: '"trust": {\n  "short": "the trust",\n  "pose": { "base": "flooded", "tweaks": { "spin": 0.2 } },\n  "beat": {\n    "layout": "right",\n    "title": ["Trust is a", "state comparison."],\n    "glass": 1,\n    "lede": "..."\n  },\n  "prompt": "Who checks the work?",\n  "choices": [{ "label": "The world is checked", "to": "trust-verify" }]\n}',
    caption:
      "A node without choices is an ending; endings usually carry beat.links instead, the calls to action.",
  },
  {
    index: 3,
    id: "how-affects",
    layout: "left",
    marker: "03 · what affects what",
    title: ["Every key", "moves something."],
    panelRows: [
      {
        title: "pose moves the glass.",
        note: "base picks the shot: centre, drained, flooded, recede, finale. tweaks override any channel: z dollies, chroma colours, burst lights.",
      },
      {
        title: "beat writes the page.",
        note: "layout, title lines, glass line, marker, lede, links: the StoryBeat vocabulary from /dynamic, one viewport per node.",
      },
      {
        title: "short names the trail.",
        note: "The chip in Your path, the words in saved traces. Two or three words reads best.",
      },
      {
        title: "choices define the legal edges.",
        note: "Share links and traces are validated against them, and whole files are validated on load; anything stale or dangling fails closed, never crashes.",
      },
      {
        title: "rules govern the walk.",
        note: "start opens the walk, maxDepth ends it, allowRewind and allowReplay grant the controls.",
      },
    ],
  },
  {
    index: 4,
    id: "how-ship",
    layout: "center",
    title: ["Ship your", "own walk."],
    glass: 1,
    lede: "The loop: Store to .quirq, open the JSON, change the copy, the poses, the forks and the rules, then Reload .quirq and walk it. The glass performs whatever tree you wrote.",
    links: [
      { href: "/journey", label: "Open the journey" },
      { href: "/dynamic", label: "The beat vocabulary", tone: "ghost" },
    ],
  },
];
