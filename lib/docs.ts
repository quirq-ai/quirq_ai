/**
 * The documentation index.
 *
 * This page indexes material that already exists rather than restating it: the
 * unit-of-work guides are research notes, the reference pages are the site's
 * own engine documentation, and the paper is the paper. Every entry points at
 * something real, and adding an entry here means it exists first.
 *
 * The one deliberate exception is `RELEASE_NOTES`, which leaves for
 * docs.xo.builders, because versioned release notes are published there and
 * not on this site. A docs page that silently dropped the changelog it was
 * being linked from would be worse than one that says where it lives.
 *
 * Server-safe: plain serializable data, no JSX, no browser modules.
 */

export type DocEntry = {
  title: string;
  blurb: string;
  href: string;
  /** Leaves the site. Rendered with a mark and announced. */
  external?: boolean;
  /** Shown as the recommended first read of its section. */
  start?: boolean;
};

export type DocSection = {
  id: string;
  title: string;
  /** One line of standing above the list. */
  blurb: string;
  entries: DocEntry[];
};

export const SECTIONS: DocSection[] = [
  {
    id: "start",
    title: "Start here",
    blurb:
      "What the unit is, why it exists, and the one command that puts the runtime on your machine.",
    entries: [
      {
        title: "What is a quirq",
        blurb:
          "The unit of verified work: a human budgets an outcome, the workspace verifies it against captured state, and the ledger records what it cost.",
        href: "/what-is-quirq",
        start: true,
      },
      {
        title: "Deploy an environment",
        blurb:
          "The two ways to run it: managed on our cloud, or licensed onto infrastructure you already own.",
        href: "/products",
      },
      {
        title: "A Unit of Work for Intelligence",
        blurb:
          "The paper in full: the mint rule, the calculus, the all-in cost model, the validation program, and every claim tiered against its evidence.",
        href: "/whitepaper",
      },
    ],
  },
  {
    id: "unit-of-work",
    title: "The unit of work",
    blurb:
      "The argument in reading order. Each of these is a research note; read end to end they are the whole construction.",
    entries: [
      {
        title: "Why quirq",
        blurb:
          "The unit of measurement for AI's business impact: budgeted by a human, minted by verification, dual to the token.",
        href: "/research/the-quirq",
        start: true,
      },
      {
        title: "Unit of work",
        blurb:
          "The contract that replaces the prompt: a job with a definition of done, a budget, and a single owner, living in a workspace.",
        href: "/research/unit-of-work",
      },
      {
        title: "The quirq calculus",
        blurb:
          "Every calculation in quirq accounting: scoring, the mint, the all-in cost model, unit and portfolio metrics, the time axis, and the energy bridge.",
        href: "/research/the-quirq-calculus",
      },
      {
        title: "The company dashboard",
        blurb:
          "The ledger a company reads monthly, and the reading discipline that goes with it.",
        href: "/research/the-company-dashboard",
      },
      {
        title: "Gaming the quirq",
        blurb:
          "The attack surface of a unit of account, in order of severity, and the structural answer to each.",
        href: "/whitepaper#gaming-the-quirq",
      },
      {
        title: "Validation",
        blurb:
          "Hypothesis-first: every empirical claim stated with its falsifier and bound to numbered experiments, completed or scheduled.",
        href: "/research/validation",
      },
    ],
  },
  {
    id: "research",
    title: "Research",
    blurb:
      "The measured work behind the unit: run studies, evidence maps, and the notes that argue about them.",
    entries: [
      {
        title: "The research program",
        blurb:
          "Every note, by shelf: speed trials, from the desk, and proving grounds.",
        href: "/research",
        start: true,
      },
      {
        title: "The evidence so far",
        blurb:
          "A guided map of the agent-context studies, including the replication that did not reproduce the pilot's headline.",
        href: "/research/research-series",
      },
      {
        title: "Writings",
        blurb:
          "The findings argued rather than reported, each piece a companion to the study it is written about.",
        href: "/writing",
      },
    ],
  },
  {
    id: "reference",
    title: "Engine reference",
    blurb:
      "How this site's stage is built and authored. Useful if you are extending it rather than reading it.",
    entries: [
      {
        title: "How it works",
        blurb:
          "Authoring a journey document: the shape of the file, the anatomy of a node, and the rules a walk obeys.",
        href: "/how-it-works",
        start: true,
      },
      {
        title: "Scenes",
        blurb:
          "Customising and creating scenes: the four parts of the shot and the fourteen channels you may move.",
        href: "/scenes",
      },
      {
        title: "The engine",
        blurb:
          "The scene behind every page, taken apart: the ring, the light it bends, and the loop that drives them.",
        href: "/engine",
      },
      {
        title: "The beat registry",
        blurb:
          "How sections announce themselves to the scroll runtime instead of being queried off the DOM.",
        href: "/registry",
      },
      {
        title: "Dynamic main, static shell",
        blurb:
          "How the middle of a stage page swaps while everything around it stays static.",
        href: "/dynamic",
      },
      {
        title: "The journey studio",
        blurb:
          "Walk a published journey, record a path, and replay it. The loader beside it opens a document without publishing anything.",
        href: "/journey",
      },
      {
        title: "The journey loader",
        blurb:
          "Paste or open a journey document and walk it, without publishing anything.",
        href: "/journey/load",
      },
      {
        title: "Beats",
        blurb:
          "The beat vocabulary itself: what a staged section is, and how the choreography reads it.",
        href: "/beats",
      },
    ],
  },
  {
    id: "agents",
    title: "For agents",
    blurb: "The machine-readable surface, for anything reading this site rather than looking at it.",
    entries: [
      {
        title: "llm.txt",
        blurb:
          "The site's machine-readable companion: what quirq is, in the form an agent can consume.",
        href: "/llm.txt",
        external: true,
      },
    ],
  },
];

/**
 * Versioned release notes are published on docs.xo.builders, not here. Called
 * out on its own rather than buried in a section, because this is the promise
 * the Writings page's "Changelog → Docs" signpost is making.
 */
export const RELEASE_NOTES: DocEntry = {
  title: "Changelog",
  blurb:
    "Versioned release notes live in the documentation on xo.builders, and are published there as they ship.",
  href: "https://xo.builders",
  external: true,
};
