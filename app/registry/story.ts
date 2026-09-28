import type { BeatData } from "@/components/story/types";

/** The beat registry: the feature explained, as story data. */
export const STORY: BeatData[] = [
  {
    index: 0,
    id: "registry-hero",
    layout: "center",
    title: ["Sections that", "announce themselves."],
    glass: 1,
    lede: "The runtime used to query the DOM for numbered sections and hope the numbering was right. Now every beat registers itself on mount and leaves on unmount, and the page can change shape while you watch.",
  },
  {
    index: 1,
    id: "registry-how",
    layout: "left",
    marker: "01 · how it works",
    title: ["Mount, announce,", "measure."],
    rows: [
      {
        title: "The Beat primitive registers.",
        note: "On mount it hands the runtime its element, id and order; on unmount it withdraws. No queries, no timing games.",
      },
      {
        title: "The runtime re-measures on change.",
        note: "Any registration change re-measures the centres and re-writes the current beat, so the glass picks the new shape up immediately.",
      },
      {
        title: "The old query still backstops.",
        note: "A page composed without the primitive falls back to the data-beat attribute, exactly as before the migration.",
      },
      {
        title: "Custom sections register directly.",
        note: "The home invite keeps its own layout, so it calls registerBeat itself. The lesson is absolute: a raw numbered section beside registered ones is silently invisible.",
      },
    ],
  },
  {
    index: 2,
    id: "registry-means",
    layout: "right",
    marker: "02 · what it means",
    title: ["The middle is", "alive now."],
    glass: 1,
    tiles: [
      {
        label: "Editors",
        body: "The /editor adds, removes and reorders beats while the stage runs. Every change re-registers, re-measures, and the walk stretches or shrinks to fit.",
      },
      {
        label: "Journeys",
        body: "The /journey grows a beat per choice. Each new section announces itself and the traversal extends mid-scroll: content generated from choices, staged live.",
      },
      {
        label: "No load-bearing numbering",
        body: "Order comes from the registry, identity from ids. The data-beat integers are a courtesy to the fallback, not the contract.",
      },
      {
        label: "Id binding",
        body: "When section ids match the track's leaf ids, binding survives a pruned branch. Positional binding alone would slide every later section onto the wrong pose.",
      },
    ],
  },
  {
    index: 3,
    id: "registry-rules",
    layout: "left",
    marker: "03 · the rules",
    title: ["Four rules keep", "it honest."],
    panelRows: [
      {
        title: "Ids are identity.",
        note: "Unique per page, and matching the track's leaf ids whenever branches can prune. The editor and journey follow this to the letter.",
      },
      {
        title: "Order follows scroll.",
        note: "Registered order must ascend with document order; the mapping assumes centres ascend.",
      },
      {
        title: "Register or be invisible.",
        note: "Use the Beat primitive, or call registerBeat directly. Never a bare numbered section beside registered ones.",
      },
      {
        title: "A viewport per beat, still.",
        note: "Registration changes nothing about pacing: the pose peaks at a section's centre, and squeezed sections flash past.",
      },
    ],
    caption:
      "The golden harness watched the whole handover: query to registry landed at zero delta on every page.",
  },
  {
    index: 4,
    id: "registry-close",
    layout: "center",
    title: ["The page is", "a conversation."],
    glass: 1,
    lede: "Once sections can arrive and leave, a page stops being a document and starts being a dialogue: with an editor, with a visitor's choices, someday with a content system.",
    links: [
      {
        href: "/tree",
        label: "Next: the tree",
      },
      {
        href: "/editor",
        label: "Open the editor",
        tone: "ghost",
      },
    ],
  },
];
