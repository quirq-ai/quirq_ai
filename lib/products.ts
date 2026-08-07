/**
 * The products page as data.
 *
 * Three ways to run a quirq environment (managed, self-hosted, licensed) and
 * what each one costs. Adding a harness or a plan here is the whole job; the
 * page in components/products renders every section from this module.
 *
 * The copy is adapted from the product deck. Punctuation is house style: the
 * deck's em dashes are colons, commas, or parentheses here, matching the rest
 * of the site's writing.
 *
 * Server-safe: plain serializable data, no JSX, no browser modules.
 */

/** Where a managed customer actually signs up. Its own property, so off-site. */
export const APP_URL = "https://app.xo.builders/";

/**
 * The two solutions. The hero ladder and the comparison share these.
 *
 * Two, not three: the open-source install is how bring-your-own-cloud lands on
 * your hardware, not a third thing to choose between. Keeping it as a peer of
 * these made the page ask the reader to pick from three when the real decision
 * is only ever "do we host it, or do you".
 */
export type Mode = {
  /** Anchor on the page, and the ladder's link target. */
  id: string;
  number: string;
  name: string;
  /** One line under the name in the ladder. */
  note: string;
  /** The column head's second line in the comparison. */
  standing: string;
  /** Spectrum accent, matching the site's rotation. */
  accent: "blue" | "green" | "orange";
};

export const MODES: Mode[] = [
  {
    id: "managed",
    number: "01",
    name: "Managed cloud",
    note: "We host and run it. Sign up and start. No licence, no call.",
    standing: "Hosted by us · self-serve",
    accent: "green",
  },
  {
    id: "byoc",
    number: "02",
    name: "Bring your own cloud",
    note: "Your infrastructure, stood up and customised by our engineers.",
    standing: "Your estate · licensed",
    accent: "orange",
  },
];

/**
 * A harness you can deploy into an environment.
 *
 * `setup` is the deck's three-dot difficulty read, kept as a number so the
 * dots and the label cannot disagree: 1 is no coding required, 2 is some
 * technical setup. The scale has three positions and nothing sits at 3 yet.
 */
export type Harness = {
  name: string;
  /** Who runs underneath. */
  poweredBy: string;
  /** "Featured" for the default, "New" for the rest. */
  badge: string;
  setup: 1 | 2 | 3;
};

export const SETUP_LABEL: Record<1 | 2 | 3, string> = {
  1: "No coding required",
  2: "Some technical setup",
  3: "Engineering required",
};

export const HARNESSES: Harness[] = [
  { name: "OpenClaw", poweredBy: "OpenClaw", badge: "Featured", setup: 1 },
  { name: "Hermes Agent", poweredBy: "Hermes", badge: "New", setup: 1 },
  { name: "AI Research Team", poweredBy: "Claude Code", badge: "New", setup: 2 },
  { name: "Codex", poweredBy: "OpenAI", badge: "New", setup: 2 },
  { name: "Antigravity", poweredBy: "Google", badge: "New", setup: 1 },
  { name: "Venice", poweredBy: "Venice", badge: "New", setup: 1 },
  { name: "OpenRouter", poweredBy: "OpenRouter", badge: "New", setup: 1 },
];

/** True of every harness, so it is stated once rather than on seven cards. */
export const HARNESS_CAPABILITIES = [
  "Command via Slack · WhatsApp · Telegram · Discord",
  "Switch seamlessly across 100+ AI providers",
  "Connect to VS Code · Cursor · GitHub · Vercel",
];

/** What the install command puts on the machine. */
export const LAYERS = [
  {
    name: "Spaces",
    body: "The ground floor. One space holds many environments, across any cloud, any hardware, or an air-gapped network.",
  },
  {
    name: "Environments",
    body: "Where the work happens. Any harness, any model, with the record of everything that ran inside.",
  },
  {
    name: "Observatory",
    body: "The view over both. Graph, timeline and sessions: what ran, what it cost, what data it touched.",
  },
];

/** The three readings the observatory offers. */
export const VIEWS = [
  {
    name: "Graph",
    body: "Every environment, artifact and cross-tie in the space: clustered, searchable, live.",
  },
  {
    name: "Timeline",
    body: "Scrub the whole history: how each environment grew, month by month, run by run.",
  },
  {
    name: "Sessions",
    body: "Every input, tool call, model and token: what was spent, and what data it touched.",
  },
];

/** Where a licensed deployment can run. Not customer logos. */
export const CLOUDS = [
  "Google Cloud",
  "Azure",
  "Nebius",
  "Nvidia",
  "AMD",
  "Groq",
];

/**
 * What a licence actually hands over.
 *
 * Each of these is the Licensed column of COMPARISON stated as a sentence:
 * the table proves it in one glance, this explains it. Keep the two in step,
 * and do not add a pillar the table cannot back.
 */
export const BYOC_PILLARS = [
  {
    name: "Your estate",
    body: "It runs in your cloud, on your own hardware, or fully air-gapped. Nothing has to cross your boundary for the product to work.",
  },
  {
    name: "Your brand",
    body: "White-labelled throughout. The console your team opens is yours, not ours, and the people using it need never learn our name.",
  },
  {
    name: "Your numbers",
    body: "Unit-of-work metering runs on your side and exports. The ledger of what the agents delivered and what it cost is yours to keep and to audit.",
  },
  {
    name: "Your release train",
    body: "Pinned, supported releases rather than automatic updates, so a version change is a decision your team makes on its own schedule.",
  },
];

/**
 * How bring-your-own-cloud lands: the forward-deployed engineering stream,
 * from first conversation to steady state. Step three is the machine speed
 * engagement, which is why it links there rather than restating it.
 */
export const BYOC_STEPS = [
  {
    name: "Scope",
    body: "Tell us where it needs to run: which cloud or hardware, which accelerators, and which compliance regime it has to sit inside.",
  },
  {
    name: "Stand it up",
    body: "Our forward-deployed engineers install it on your infrastructure alongside your team, connecting the models and harnesses you already run. No rip-and-replace.",
  },
  {
    name: "Customise",
    body: "The machine speed engagement: blueprints adapted to your operation and pointed at the metric that matters this quarter, built on the stack you already own.",
  },
  {
    name: "Run it",
    body: "A named contact and a response SLA, with SSO and SAML, audit trails and data residency configured and managed.",
  },
];

/** Commercials. Licensed work is quoted, not listed. */
export const BYOC_TERMS = "Pricing on application · deployment and customisation included";

/** One row of the solution comparison. Cells are in MODES order. */
export const COMPARISON: { label: string; cells: [string, string] }[] = [
  {
    label: "How you start",
    cells: ["Sign up and go", "Talk to us"],
  },
  {
    label: "Where it runs",
    cells: ["Our cloud", "Your cloud, on-prem or air-gapped"],
  },
  {
    label: "Who stands it up",
    cells: ["You, in a click", "Our engineers, with your team"],
  },
  {
    label: "Environments",
    cells: ["30 · 500 by plan", "Unlimited"],
  },
  { label: "All harnesses and models", cells: ["✓", "✓"] },
  {
    label: "Observability: graph, timeline, sessions",
    cells: ["✓", "✓"],
  },
  {
    label: "Unit-of-work metering",
    cells: ["On our infra", "Your numbers, exportable"],
  },
  { label: "One-click deploy UI", cells: ["✓", "✓"] },
  { label: "Custom workflows and blueprints", cells: ["—", "✓"] },
  { label: "White-label", cells: ["—", "✓"] },
  {
    label: "SSO / SAML · audit · residency",
    cells: ["On Max", "✓ managed"],
  },
  {
    label: "Updates",
    cells: ["Automatic", "Pinned, supported releases"],
  },
  {
    label: "Support",
    cells: ["Email · Slack on Max", "Named contact + SLA"],
  },
];

export type Plan = {
  name: string;
  /** The qualifier under the name. */
  standing: string;
  price: string;
  /** "/mo", or empty where the price is not a rate. */
  cadence?: string;
  features: string[];
  cta: { label: string; href: string };
  /** Small line under the CTA. */
  footnote?: string;
  /** The plan the page recommends. Exactly one. */
  featured?: boolean;
};

/**
 * Managed cloud is priced; bring-your-own-cloud is quoted. The two managed
 * tiers are self-serve, so their CTA leaves for the app rather than opening a
 * conversation. Nothing here is free: the open-source install is an on-ramp
 * inside bring-your-own-cloud, not a plan you pick in this row.
 */
export const PLANS: Plan[] = [
  {
    name: "Pro",
    standing: "Managed cloud",
    price: "$20",
    cadence: "/mo",
    features: [
      "30 managed environments",
      "One-click deploy, hosted by us",
      "Custom templates and MCP integrations",
      "Spend tracking and agent comparison",
    ],
    cta: { label: "Start free", href: APP_URL },
    footnote: "30 days free · no licence needed",
    featured: true,
  },
  {
    name: "Max",
    standing: "Managed cloud",
    price: "$100",
    cadence: "/mo",
    features: [
      "500 managed environments",
      "SSO / SAML and full audit trails",
      "Email and Slack support",
      "Priority capacity",
    ],
    cta: { label: "Start free", href: APP_URL },
    footnote: "30 days free · no licence needed",
  },
  {
    name: "Licensed",
    standing: "Bring your own cloud",
    price: "Custom",
    features: [
      "The managed product on your own infrastructure",
      "Stood up and customised by our engineers",
      "White-label: your brand throughout",
      "Named contact, response SLA, pinned releases",
    ],
    cta: { label: "Talk to us", href: "#contact" },
  },
];

/** Where to reach us. Real destinations only. */
export const CONTACT = [
  { label: "hello@quirq.ai", href: "mailto:hello@quirq.ai" },
  { label: "github.com/quirq-ai", href: "https://github.com/quirq-ai" },
  { label: "Documentation", href: "/docs" },
];
