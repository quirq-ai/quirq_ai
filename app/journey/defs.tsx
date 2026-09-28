import type { BeatData } from "@/components/story/types";
import { KEYFRAMES, type Keyframe } from "@/components/stage/choreography";

/**
 * Journey definitions: the whole tree journey and its rules as one plain
 * document, storable in the local .quirq folder and loadable at runtime.
 *
 * A definition is JSON: nodes carry their story beat, a pose (a named preset
 * plus optional channel tweaks), a prompt and choices; rules carry the start
 * node and what the walk permits. The built-in journey below is expressed in
 * exactly this format, so "save to .quirq" materialises it byte-faithfully
 * as a file you can edit by hand and reload.
 */

export type PoseName = "centre" | "drained" | "flooded" | "recede" | "finale";

export type PoseSpec = {
  base: PoseName;
  tweaks?: Partial<Keyframe>;
};

export type JourneyNodeSpec = {
  /** Short name shown in the trail. */
  short: string;
  pose: PoseSpec;
  beat: Omit<BeatData, "index" | "id">;
  prompt?: string;
  choices?: { label: string; to: string }[];
};

export type JourneyRules = {
  start: string;
  /** Hard ceiling on path length; the walk ends there even mid-branch. */
  maxDepth?: number;
  allowRewind?: boolean;
  allowReplay?: boolean;
};

export type JourneyDefinition = {
  slug: string;
  name: string;
  rules: JourneyRules;
  nodes: Record<string, JourneyNodeSpec>;
  /** The last recorded walk, appended by the recorder as the visitor moves. */
  recording?: JourneyRecording;
};

/** One transition of a walk: what happened and the full path after it. */
export type JourneyRecordingEvent = {
  at: number;
  kind: "start" | "choose" | "rewind" | "loop" | "replay";
  /** The choice label taken, when kind is "choose". */
  label?: string;
  /** The node the transition landed on. */
  node: string;
  /** The whole path after the transition, so replay can re-perform it. */
  path: string[];
};

/** A walk, recorded transition by transition from its opening beat. */
export type JourneyRecording = {
  journey: string;
  startedAt: number;
  events: JourneyRecordingEvent[];
};

/** A node with its pose resolved to a full keyframe. */
export type ResolvedJourneyNode = Omit<JourneyNodeSpec, "pose"> & {
  keyframe: Keyframe;
};

export type ResolvedJourney = {
  slug: string;
  name: string;
  rules: Required<JourneyRules>;
  nodes: Record<string, ResolvedJourneyNode>;
};

const POSE_INDEX: Record<PoseName, number> = {
  centre: 0,
  drained: 1,
  flooded: 2,
  recede: 3,
  finale: 4,
};

export function resolvePose(pose: PoseSpec): Keyframe {
  return { ...KEYFRAMES[POSE_INDEX[pose.base] ?? 0], ...pose.tweaks };
}

/**
 * Figures arrive inside beat data, which means they arrive from JSON files and
 * from pasted documents. A figure the renderer cannot read is refused here,
 * before anything draws half of it.
 */
export function validateFigure(figure: unknown): string | null {
  if (figure === undefined || figure === null) return null;
  if (typeof figure !== "object") return "figure must be an object";
  const kind = (figure as { kind?: unknown }).kind;

  if (kind === "bars") {
    const spec = figure as { categories?: unknown; series?: unknown };
    if (!Array.isArray(spec.categories) || spec.categories.length === 0) {
      return "bars figure needs categories";
    }
    if (!Array.isArray(spec.series) || spec.series.length === 0) {
      return "bars figure needs at least one series";
    }
    for (const entry of spec.series) {
      if (!entry || typeof entry !== "object") return "bars series must be objects";
      const series = entry as { label?: unknown; values?: unknown };
      if (typeof series.label !== "string" || !series.label) {
        return "every bars series needs a label";
      }
      if (
        !Array.isArray(series.values) ||
        series.values.length !== spec.categories.length
      ) {
        return `series ${series.label} must carry one value per category`;
      }
      if (
        series.values.some(
          (value) => typeof value !== "number" || !Number.isFinite(value),
        )
      ) {
        return `series ${series.label} has a value that is not a finite number`;
      }
    }
    return null;
  }

  if (kind === "marks") {
    const spec = figure as { marks?: unknown; xLabel?: unknown; yLabel?: unknown };
    if (typeof spec.xLabel !== "string" || typeof spec.yLabel !== "string") {
      return "marks figure needs xLabel and yLabel";
    }
    if (!Array.isArray(spec.marks) || spec.marks.length === 0) {
      return "marks figure needs marks";
    }
    for (const mark of spec.marks) {
      const point = mark as { x?: unknown; y?: unknown };
      if (
        !mark ||
        typeof mark !== "object" ||
        typeof point.x !== "number" ||
        typeof point.y !== "number" ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
      ) {
        return "every mark needs finite numeric x and y";
      }
    }
    return null;
  }

  return `unknown figure kind ${JSON.stringify(kind)}`;
}

/** Structural validation: the rules a definition must obey to be loadable. */
export function validateDefinition(def: JourneyDefinition): string | null {
  if (!def || typeof def !== "object") return "not an object";
  if (!def.slug || !/^[a-z0-9-]+$/.test(def.slug)) return "bad slug";
  if (!def.name) return "missing name";
  if (!def.nodes || typeof def.nodes !== "object") return "missing nodes";
  if (!def.rules?.start || !def.nodes[def.rules.start]) {
    return "rules.start must name a node";
  }
  for (const [id, node] of Object.entries(def.nodes)) {
    if (!node.short || !node.beat?.title) return `node ${id}: missing content`;
    if (!node.pose?.base || !(node.pose.base in POSE_INDEX)) {
      return `node ${id}: unknown pose`;
    }
    const badFigure = validateFigure(node.beat.figure);
    if (badFigure) return `node ${id}: ${badFigure}`;
    for (const choice of node.choices ?? []) {
      if (!def.nodes[choice.to]) return `node ${id}: choice to unknown ${choice.to}`;
    }
  }
  return null;
}

export function resolveDefinition(def: JourneyDefinition): ResolvedJourney {
  const nodes: Record<string, ResolvedJourneyNode> = {};
  for (const [id, spec] of Object.entries(def.nodes)) {
    const { pose, ...rest } = spec;
    nodes[id] = { ...rest, keyframe: resolvePose(pose) };
  }
  return {
    slug: def.slug,
    name: def.name,
    rules: {
      start: def.rules.start,
      maxDepth: def.rules.maxDepth ?? 12,
      allowRewind: def.rules.allowRewind ?? true,
      allowReplay: def.rules.allowReplay ?? true,
    },
    nodes,
  };
}

/** A path is only a journey if every step is a legal choice from the last. */
export function isValidPathIn(journey: ResolvedJourney, ids: string[]): boolean {
  if (ids[0] !== journey.rules.start) return false;
  if (!ids.every((id) => journey.nodes[id])) return false;
  if (ids.length > journey.rules.maxDepth) return false;
  for (let i = 1; i < ids.length; i++) {
    const prev = journey.nodes[ids[i - 1]];
    if (!prev.choices?.some((c) => c.to === ids[i])) return false;
  }
  return true;
}

/** The built-in journey, in the same format the .quirq files use. */
export const DEFAULT_DEFINITION: JourneyDefinition = {
  slug: "default",
  name: "What keeps you up",
  rules: { start: "root", maxDepth: 8, allowRewind: true, allowReplay: true },
  nodes: {
    root: {
      short: "start",
      pose: { base: "centre" },
      beat: {
        layout: "center",
        title: ["Every journey", "starts running."],
        glass: 1,
        lede: "Your agents already work. The question is what you cannot yet see about them. Answer honestly; this page builds itself from your choices, and the glass follows the path you take.",
      },
      prompt: "What keeps you up at night?",
      choices: [
        { label: "The bill", to: "bill" },
        { label: "The trust", to: "trust" },
        { label: "The scale", to: "scale" },
      ],
    },
    bill: {
      short: "the bill",
      pose: { base: "drained" },
      beat: {
        layout: "left",
        marker: "the bill",
        title: ["The meter only", "counts one way."],
        lede: "Token spend climbs whether or not the job got done. A verbose failure costs more than a terse success, and the invoice cannot tell you which one you bought.",
      },
      prompt: "And when the invoice lands?",
      choices: [
        { label: "Cap the spend", to: "bill-cap" },
        { label: "Count the value", to: "bill-count" },
      ],
    },
    "bill-cap": {
      short: "cap it",
      pose: { base: "drained", tweaks: { z: -2.4, scale: 0.85, burst: 0.14 } },
      beat: {
        layout: "left",
        marker: "the cap",
        title: ["Caps starve good", "work and bad alike."],
        lede: "A budget ceiling cannot tell a retry loop from a breakthrough; it just stops both. The missing piece was never a limit on consumption. It was a meter on the other side.",
        links: [
          { href: "/", label: "See the other meter" },
          { href: "/quirq-whitepaper.pdf", label: "The whitepaper", tone: "ghost" },
        ],
      },
    },
    "bill-count": {
      short: "count it",
      pose: { base: "finale" },
      beat: {
        layout: "center",
        title: ["Count what it", "delivered."],
        glass: 1,
        lede: "That is the quirq: verified against the state of the world, priced by the person who wanted it, costed all-in. The bill becomes an investment case or an honest loss, never a mystery.",
        links: [
          { href: "/what-is-quirq", label: "What is quirq" },
          { href: "/quirq-whitepaper.pdf", label: "The whitepaper", tone: "ghost" },
        ],
      },
    },
    trust: {
      short: "the trust",
      pose: { base: "flooded" },
      beat: {
        layout: "right",
        marker: "the trust",
        title: ["Trust is a", "state comparison."],
        glass: 1,
        lede: "An agent's own summary is testimony. The world before and after the work is evidence. Everything depends on which of the two your system believes.",
      },
      prompt: "Who checks the work?",
      choices: [
        { label: "The agent reports", to: "trust-report" },
        { label: "The world is checked", to: "trust-verify" },
      ],
    },
    "trust-report": {
      short: "self-report",
      pose: {
        base: "drained",
        tweaks: { chroma: 0.005, burst: 0.15, tiltX: 1.05 },
      },
      beat: {
        layout: "left",
        marker: "self-report",
        title: ["Fiction settles", "at face value."],
        lede: "In the harness, every false claim of done settled and minted when the scorer read the agent's account. The same claims minted exactly zero when the environment read captured state instead. That is the whole argument, measured.",
        links: [
          { href: "/research/validation", label: "The experiment" },
          { href: "/research", label: "All research", tone: "ghost" },
        ],
      },
    },
    "trust-verify": {
      short: "verify",
      pose: { base: "finale", tweaks: { spin: 0.24 } },
      beat: {
        layout: "center",
        title: ["Minted, never", "self-reported."],
        glass: 1,
        lede: "Snapshot before, snapshot after, score against a definition of done, mint V x B. The worker's testimony never enters the ledger; the world's change is the receipt.",
        links: [
          { href: "/what-is-quirq", label: "The mint rule" },
          { href: "/research/the-quirq-calculus", label: "The calculus", tone: "ghost" },
        ],
      },
    },
    scale: {
      short: "the scale",
      pose: { base: "recede" },
      beat: {
        layout: "left",
        marker: "the scale",
        title: ["More agents,", "more questions."],
        lede: "Ten agents make ten times the output and a hundred times the doubt. Scaling the fleet without scaling the proof just industrialises the uncertainty.",
      },
      prompt: "Scale what first?",
      choices: [
        { label: "The fleet", to: "scale-fleet" },
        { label: "The proof", to: "scale-proof" },
      ],
    },
    "scale-fleet": {
      short: "the fleet",
      pose: { base: "finale", tweaks: { x: -0.4, tiltZ: 0.35 } },
      beat: {
        layout: "center",
        title: ["One click,", "any runtime."],
        glass: 1,
        lede: "quirq wraps each agent in an environment that snapshots, verifies and meters as a side effect of hosting the work. Scale the fleet and the proof scales with it, because the environment is the proof.",
        links: [
          { href: "/what-is-quirq", label: "The environment" },
          { href: "/", label: "The full story", tone: "ghost" },
        ],
      },
    },
    "scale-proof": {
      short: "the proof",
      pose: { base: "recede", tweaks: { z: -2.4, burst: 0.5, chroma: 0.75 } },
      beat: {
        layout: "left",
        marker: "the proof",
        title: ["An auditable P&L", "for the whole fleet."],
        lede: "One ledger: quirqs delivered per all-in dollar, cost per quirq, intervention rate, and their trajectories. 'Is AI working here' becomes a trend line you read weekly, not an argument you have quarterly.",
        links: [
          { href: "/research/the-company-dashboard", label: "The dashboard" },
          { href: "/research", label: "All research", tone: "ghost" },
        ],
      },
    },
  },
};
