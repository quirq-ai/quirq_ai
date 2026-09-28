/** Real product captures. Dates and source details live in docs/product-evidence.md. */
export const PRODUCT_CAPTURES = {
  xoCurrentTemplates: {
    src: "/assets/xo-ui/review-2026-09-22/agent-catalog.png",
    width: 1392,
    height: 750,
    label: "XO · Choose an agent template",
    provenance: "Live platform review · 22 September 2026",
    alt: "XO's agent catalog showing OpenClaw, Codex, Antigravity and Hermes templates with Create Agent controls.",
  },
  xoCurrentConfiguration: {
    src: "/assets/xo-ui/review-2026-09-22/codex-setup.png",
    width: 1392,
    height: 610,
    label: "XO · Configure a Space",
    provenance: "Setup preview · 22 September 2026 · not provisioned",
    alt: "The real Codex Space setup form with the example name product-research and 4 GB storage selected. Create Space has not been submitted.",
  },
  spaceProjects: {
    src: "/assets/space-ui/projects.jpg",
    width: 1280,
    height: 720,
    label: "Space · Projects and their files",
    provenance: "Example workspace · September 2026",
    alt: "Space Projects showing project folders, indexed files and recent activity in an example workspace.",
  },
  spaceSessions: {
    src: "/assets/space-ui/session-overview.jpg",
    width: 1280,
    height: 720,
    label: "Space · Agent sessions and usage",
    provenance: "Sessions capture · 28 July 2026",
    alt: "Space Sessions overview with agent filters, a token usage timeline, an activity heatmap and models by usage.",
  },
  spaceSharing: {
    src: "/assets/space-ui/project-sharing.jpg",
    width: 1280,
    height: 720,
    label: "Space · Share and review changes",
    provenance: "Example workspace · September 2026",
    alt: "Space Inbox Sharing with shared projects and incoming Git commits ready to review and apply in an example workspace.",
  },
} as const;

export type ProductCaptureName = keyof typeof PRODUCT_CAPTURES;

/** Captured from the reviewed local platform; no generated or reconstructed UI. */
export const PRODUCT_TOURS = {
  setup: {
    title: "From agent template to Space setup",
    file: "setup-tour",
    poster: "agent-catalog.png",
    duration: "13 sec",
    note: "Setup preview · stops before provisioning",
    transcript:
      "Choose Codex from the agent catalog. Open its setup form, enter a Space name and select storage. This tour stops before Create Space; no computer is provisioned.",
  },
  usage: {
    title: "A view of your agents’ activity",
    file: "usage-tour",
    poster: "usage.png",
    duration: "13 sec",
    note: "Usage overview · no activity in the selected periods",
    transcript:
      "The Usage page reports model cost, tokens, messages and latency. Open the date filter and select the last 30 days. This account has no activity in either selected period. These metrics describe agent and model usage, not a compute invoice.",
  },
  pricing: {
    title: "Monthly and annual plans",
    file: "pricing-tour",
    poster: "pricing-monthly.png",
    duration: "8 sec",
    note: "Plan comparison · no subscription changed",
    transcript:
      "Monthly plans are Starter at 10 US dollars, Pro at 50 and Business at 500. Toggle annual billing to see full yearly totals of 100, 500 and 5,000 US dollars. The account's existing subscription is unchanged.",
  },
} as const;

export type ProductTourName = keyof typeof PRODUCT_TOURS;
