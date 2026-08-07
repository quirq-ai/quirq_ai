/**
 * The Writings page content, transcribed from the ANN, PARTNERS, RNOTES, FOW
 * and QUIRQ arrays in quirq-package/site/quirq-research-writings-mock.html.
 *
 * Scoped to this route on purpose: nothing here is shared with /research,
 * which keeps its own catalogue in lib/research.ts. The two are deliberately
 * separate records, so a change here cannot move a research note.
 *
 * Server-safe: plain serializable data, no JSX, no browser modules.
 */

export type Card = {
  /** Mono ordinal shown on the card. Absent on partner news, as authored. */
  num?: string;
  title: string;
  desc: string;
  date?: string;
  /** Reading time, e.g. "4 min". Absent on partner news. */
  read?: string;
  /** File under public/assets/writing, without the extension. */
  img: string;
  /** Marks the mock's "sample" chip in place of the ordinal. */
  sample?: boolean;
  /**
   * The essay's own page under /writing. Present only where the piece exists;
   * a card without one stays an article, because a tile that looks clickable
   * and goes nowhere is worse than a tile.
   */
  slug?: string;
  /** A destination elsewhere on the site, for cards that summarise one. */
  href?: string;
};

/** Tab keys. `all` is the everything view. */
export type TabKey = "all" | "announcements" | "thoughts";

export const CATEGORIES: { key: Exclude<TabKey, "all">; label: string }[] = [
  { key: "announcements", label: "News" },
  { key: "thoughts", label: "Thoughts" },
];

/** The lead post, rendered as the featured slot rather than in a grid. */
export const FEATURED = {
  kicker: "Latest",
  title: "Defining Agentic Workforce Environments",
  desc: "Intro to quirq. The workspace platform grows up into an environment company: new name, same record. Every claim we have published carries over.",
  date: "Aug 1, 2026",
  read: "2 min read",
  img: "featured",
};

/** News, minus the featured item which the mock slices off the front. */
export const NEWS: Card[] = [
  {
    num: "03",
    title: "AI Token Spend Needs Its Horsepower Moment",
    href: "/whitepaper",
    desc: "The unit-of-work whitepaper, in short: the mint, the calculus, the ledger, and the environment that owns the ground truth.",
    date: "Jul 15, 2026",
    read: "1 min",
    img: "horsepower",
    sample: true,
  },
];

/**
 * Partnership news, and the journeys behind it.
 *
 * `art` is explicit rather than derived from the row's position, which is how
 * it used to work: inserting one entry in the middle silently reshuffled every
 * logo after it. An entry with no `art` renders a text lockup instead, so a
 * journey can be added without commissioning a plate for it first.
 *
 * `href` points at that journey's chapter on the XO blog, which is the record
 * these entries summarise. Entries without one are announcements that have no
 * page of their own yet.
 */
export type Partner = {
  title: string;
  desc: string;
  /** File under public/assets/writing, without the extension. */
  art?: string;
  /**
   * Text for the typeset plate when there is no `art`. The drawn plates are
   * lockups sitting beside a different headline, so this carries the partner
   * mark alone: the title below already says "quirq × …", and printing that
   * twice on one card reads as a mistake.
   */
  lockup?: string;
  /** The journey's chapter on the blog. */
  href?: string;
};

export const PARTNERS: Partner[] = [
  {
    title: "Quirq Receives $350k Grant from Google for Startups",
    desc: "Google backs the environment layer: $350k in Google Cloud credits and support to scale quirq environments on GCP.",
    art: "partner-0",
  },
  {
    title: "Quirq Integrates One-Click Google Antigravity",
    desc: "Google's agent-first IDE, deployable inside a quirq environment in one click.",
    art: "partner-1",
  },
  {
    title: "Quirq Receives $200k Grant from Gaia",
    desc: "Gaia backs local intelligence on quirq: your-own-LLM launchpad templates for the fleet.",
    art: "partner-2",
  },
  {
    title: "Quirq Enters the NVIDIA Inception Program",
    desc: "Serious compute behind agent workspaces.",
    art: "partner-3",
  },
  {
    title: "Quirq Integrates VS Code and Azure Compatibility",
    desc: "Edit environments in VS Code and deploy them on Azure: the Microsoft stack, supported.",
    art: "partner-4",
  },
  {
    title: "Quirq Partners on the One-Click OKX Agent",
    desc: "Runtime partner for the OKX Agent Marketplace One-Click Agent.",
    art: "partner-5",
  },
  {
    title: "Quirq Integrates One-Click OpenClaw",
    desc: "The open-source agent framework, deployable inside quirq workspaces in one click.",
    art: "partner-6",
  },
  {
    title: "Quirq Integrates One-Click Hermes Agents",
    desc: "The harness quirq runs agent fleets on, now a one-click deploy.",
    art: "partner-7",
  },
  {
    title: "Quirq Integrates One-Click Nebius",
    desc: "Agent fleets on Nebius infrastructure: deployed declaratively, organized around quirqs, not tokens.",
    art: "partner-8",
  },
  {
    title: "Quirq Integrates MagicPath",
    desc: "Two takes on one conviction: humans and agents share a workspace.",
    art: "partner-9",
  },
  {
    title: "Quirq Integrates Claude OAuth",
    desc: "Sign in with Claude: bring your Anthropic subscription to any quirq environment.",
    art: "partner-10",
  },
  {
    title: "Quirq Integrates OpenAI, ChatGPT and Codex OAuth",
    desc: "Bring ChatGPT and Codex to quirq environments with OpenAI sign-in.",
    art: "partner-11",
  },
  {
    title: "Quirq Integrates One-Click OpenRouter",
    desc: "Route any model into a quirq environment through OpenRouter, in one click.",
    art: "partner-12",
  },

  // The journeys published on the blog that had no entry here. Titles follow
  // the blog's own "× partner" form under this site's name, and each links to
  // the chapter it summarises. Descriptions are the blog's, with the platform
  // named as this site names it: same record, new name, as the lead post says.
  {
    title: "quirq × AWS",
    lockup: "AWS",
    desc: "The first cloud partnership. AWS for Startups made the workspace image cloud-native from day one.",
    href: "https://www.xo.builders/blog/xo-aws",
  },
  {
    title: "quirq × ElevenLabs",
    lockup: "ElevenLabs",
    desc: "Research into the ElevenLabs Agents Platform: what it takes to manage user credentials programmatically when building multi-tenant voice-agent platforms.",
    href: "https://www.xo.builders/blog/xo-elevenlabs",
  },
  {
    title: "quirq × Hysolwin Green Energy",
    lockup: "Hysolwin Green Energy",
    desc: "Hysolwin Green Energy runs on quirq. A green-energy team putting agent workspaces to work.",
    href: "https://www.xo.builders/blog/xo-hysolwin",
  },
  {
    title: "quirq × PPAI Innovations",
    lockup: "PPAI Innovations",
    desc: "PPAI Innovations runs on quirq. Building with agent workspaces, one project at a time.",
    href: "https://www.xo.builders/blog/xo-ppai",
  },
  {
    title: "quirq × EnviroEdge Partner",
    lockup: "EnviroEdge Partner",
    desc: "EnviroEdge Partner runs on quirq. Environmental work, measured the unit-of-work way.",
    href: "https://www.xo.builders/blog/xo-enviroedge",
  },
  {
    title: "quirq × EVM Capital",
    lockup: "EVM Capital",
    desc: "quirq and EVM Capital. A chapter in progress.",
    href: "https://www.xo.builders/blog/xo-evm-capital",
  },
  {
    title: "quirq × the World",
    lockup: "the World",
    desc: "The public record: launches, competitions, and moments from the team, collected as they happened.",
    href: "https://www.xo.builders/blog/xo-community",
  },
];

/** Editorial companions to the research studies. */
export const THOUGHTS: Card[] = [
  {
    num: "01",
    title: "The Orientation Tax",
    slug: "the-orientation-tax",
    desc: "What a coding agent's first day on the job actually costs, and why the environment is the only lever on it. On the environment-performance study.",
    date: "Jul 26, 2026",
    read: "5 min",
    img: "trailhead",
  },
  {
    num: "02",
    title: "Agent-Mimicked Synthetic Data Will Never Beat the Real Thing",
    slug: "synthetic-data-never-beats-the-real-thing",
    desc: "It never is. On why organic data wins: r = 0.91 vs a coin flip, and the discriminator that can't be fooled.",
    date: "Jul 25, 2026",
    read: "4 min",
    img: "morning",
  },
  {
    num: "03",
    title: "Your AI Knows When It's Being Tested",
    slug: "your-ai-knows-when-its-being-tested",
    desc: "Perfect metrics, going nowhere, screen playing a fake trail. On why alignment testing needs a real environment.",
    date: "Jul 25, 2026",
    read: "4 min",
    img: "treadmill",
  },
  {
    num: "04",
    title: "RTFM: Read the F*cking Manual",
    slug: "rtfm",
    desc: "We finally found an agent that does, and the reading paid its way. On the curiosity comparison.",
    date: "Jul 3, 2026",
    read: "4 min",
    img: "hammock",
  },
  {
    num: "05",
    title: "Agents Look a Lot Like Quiet Quitters",
    slug: "agents-look-a-lot-like-quiet-quitters",
    desc: "Salary paid in full. Discretionary effort: zero. On the incurious agent.",
    date: "Jun 21, 2026",
    read: "4 min",
    img: "riverside",
  },
  {
    num: "06",
    title: "The Agent She Told You Not to Worry About",
    slug: "the-agent-she-told-you-not-to-worry-about",
    desc: "No docs, no contract, no memory: nine for nine. On the self-sufficient agent.",
    date: "Jun 26, 2026",
    read: "4 min",
    img: "rainforestcard",
  },
  {
    num: "07",
    title:
      "Models Mathematically Find It More Difficult to Navigate Various Languages",
    slug: "the-language-is-not-the-problem",
    desc: "The deal closes in fingers, a representation both sides already share. On the tokenizer study.",
    date: "Jul 11, 2026",
    read: "4 min",
    img: "bazaar",
  },
  {
    num: "08",
    title: "Point and Call",
    slug: "point-and-call",
    desc: "One precise gesture beats a thousand words of context. On relevance versus volume.",
    date: "Jun 26, 2026",
    read: "4 min",
    img: "conductor",
  },
];

export const FUTURE_OF_WORK: Card[] = [
  {
    num: "01",
    title: "How Future Companies Will Measure Work in AI",
    href: "/research/research-series",
    desc: "The three-phase thesis (agentic workforce, collaboration, self-evolving systems) with the evidence map underneath: what held, what moved, and what we still can't claim.",
    date: "Jul 24, 2026",
    read: "12 min",
    img: "orchard",
  },
  {
    num: "02",
    title: "We Asked AI: What Claude and GPT Think About the Future of Work",
    desc: "Perspectives we keep returning to: the house view, a view from Claude, and a view from GPT, on the same future of work.",
    date: "Jun 11, 2026",
    read: "3 min",
    img: "cubes",
  },
];

/** The guides list: read in order, so it renders as rows rather than cards. */
export const GUIDES: {
  num: string;
  title: string;
  desc: string;
  read: string;
  date: string;
  start?: boolean;
  /** Where the guide's material actually lives, when it already does. */
  href?: string;
}[] = [
  {
    num: "01",
    title: "Why quirq",
    href: "/research/the-quirq",
    start: true,
    desc: "The unit of measurement for AI's business impact: budgeted by a human, minted by verification, dual to the token.",
    read: "2 min",
    date: "Jul 8, 2026",
  },
  {
    num: "02",
    title: "Unit of work",
    href: "/research/unit-of-work",
    desc: "The contract that replaces the prompt: a job with a definition of done, a budget, and a single owner, living in a workspace.",
    read: "3 min",
    date: "Jun 5, 2026",
  },
  {
    num: "03",
    title: "The quirq calculus",
    href: "/research/the-quirq-calculus",
    desc: "Every calculation in quirq accounting: scoring, the mint, the all-in cost model, unit and portfolio metrics, the time axis, and the energy bridge.",
    read: "5 min",
    date: "Jul 22, 2026",
  },
  {
    num: "04",
    title: "The Company Observatory",
    href: "/research/the-company-dashboard",
    desc: "The quirq ledger a company reads monthly, and the reading discipline that goes with it. A worked quarter where token spend rose 83% while verified work fell.",
    read: "2 min",
    date: "Jul 22, 2026",
  },
  {
    num: "05",
    title: "The environment is the key part",
    desc: "The environment owns the ground truth: it is the specification, the scorekeeper, and the only witness that matters.",
    read: "3 min",
    date: "Jul 22, 2026",
  },
  {
    num: "06",
    title: "Gaming the quirq",
    href: "/whitepaper#gaming-the-quirq",
    desc: "The attack surface of a unit of account, in order of severity, and the structural answers to each.",
    read: "3 min",
    date: "Jul 22, 2026",
  },
  {
    num: "07",
    title: "Practitioner playbook",
    desc: "How to write definitions of done, set budgets, and read the ledger schema: the operator's side of the unit.",
    read: "3 min",
    date: "Jul 22, 2026",
  },
  {
    num: "08",
    title: "Validation",
    href: "/research/validation",
    desc: "Hypothesis-first: every empirical claim with its falsifier, bound to numbered experiments on the research record.",
    read: "3 min",
    date: "Jul 22, 2026",
  },
  {
    num: "09",
    title: "Why the Environment Matters",
    href: "/research/unit-of-work",
    desc: "The research note behind the unit of work: what it argues, and where the full quirq treatment lives.",
    read: "2 min",
    date: "Jul 22, 2026",
  },
];

/** How many news cards show before "Read more news", as in the mock. */
export const NEWS_COLLAPSED = 6;

/**
 * Tab counts. The featured post is one of the news items, so it counts here
 * even though it renders in its own slot rather than in the grid: the mock
 * counts the full news array for the same reason.
 */
const NEWS_TOTAL = NEWS.length + PARTNERS.length + 1;

export const COUNTS = {
  all: NEWS_TOTAL + THOUGHTS.length + FUTURE_OF_WORK.length + GUIDES.length,
  announcements: NEWS_TOTAL,
  thoughts: THOUGHTS.length + FUTURE_OF_WORK.length + GUIDES.length,
};
