import type { BeatData } from "@/components/story/types";

/** The choreography tree: the feature explained, as story data. */
export const STORY: BeatData[] = [
  {
    index: 0,
    id: "tree-hero",
    layout: "center",
    title: ["The script", "grew branches."],
    glass: 1,
    lede: "Five keyframes used to be a flat array. Now they are leaves of a tree that filters, flattens and cascades into the same track: identical today, and ready to branch the moment a page needs its own walk.",
  },
  {
    index: 1,
    id: "tree-how",
    layout: "left",
    marker: "01 · how it resolves",
    title: ["Filter, flatten,", "inherit."],
    rows: [
      {
        title: "An authoring structure, not a runtime one.",
        note: "The resolver runs on mount and resize, never per frame. The glass only ever sees the resolved flat track; the hot path stays allocation-free.",
      },
      {
        title: "Leaves override a full root.",
        note: "The root pose is complete; each leaf states only what differs. The finale already inherits its x from the root: the first cascaded channel.",
      },
      {
        title: "Predicates prune whole subtrees.",
        note: "A node with a failing when() disappears with its children, and the track re-resolves against the live viewport on resize.",
      },
      {
        title: "Ids travel with the leaves.",
        note: "The resolved track keeps its leaf ids, so sections bind by name and a pruned middle leaf cannot shift its neighbours onto the wrong pose.",
      },
    ],
  },
  {
    index: 2,
    id: "tree-seam",
    layout: "right",
    marker: "02 · the override seam",
    title: ["Tools stand in", "front of the tree."],
    glass: 1,
    code: "overrideLeaves([{ id, keyframe }, ...])  // a tool's own walk\noverrideLeaves(null)                     // back to the tree",
    tiles: [
      {
        label: "The editor",
        body: "Pushes its draft's poses through the seam, so sliders restage the damped glass live. Unmounting hands the tree back untouched.",
      },
      {
        label: "The journey",
        body: "Pushes the chosen path, one leaf per choice, so the traversal is literally the branch you picked.",
      },
      {
        label: "Pages never touch it",
        body: "Only tools override; every published page walks the resolved tree. The golden baselines never see the seam.",
      },
    ],
  },
  {
    index: 3,
    id: "tree-means",
    layout: "left",
    marker: "03 · what it means",
    title: ["One scene,", "many walks."],
    panelRows: [
      {
        title: "Branches per audience.",
        note: "A when() on viewport width, a route, or a flag swaps subtrees: the shorter mobile walk and the A/B narrative are now configuration, not forks.",
      },
      {
        title: "Sub-beats within a beat.",
        note: "Nested leaves subdivide a section's span for micro-choreography, without renumbering anything above.",
      },
      {
        title: "Generated walks.",
        note: "Anything that can produce leaves can stage the glass: an editor, a choice tree, eventually a content system.",
      },
      {
        title: "The proof already runs.",
        note: "The journey page is the first live branching walk: content from your choices, choreography from your path.",
      },
    ],
    caption:
      "Resolved output is golden-gated: with no predicates firing, the tree reproduces the original array at zero delta.",
  },
  {
    index: 4,
    id: "tree-close",
    layout: "center",
    title: ["One tree,", "many walks."],
    glass: 1,
    lede: "Walk one yourself: the journey builds its path from your choices, and the trail lets you rewind and take the other branch.",
    links: [
      {
        href: "/journey",
        label: "Walk the journey",
      },
      {
        href: "/scenes",
        label: "Stage your own",
        tone: "ghost",
      },
    ],
  },
];
