# Quirq brand direction and product strategy

## Current owner direction — 28 September 2026

The owner clarified three offerings: **XO Space**, an open-source repository
for developers to manage their company from a Claude or Codex session;
**XO Cloud**, a managed platform for creating, launching and managing autonomous
AI employees working 24/7; and **MachineSpeed**, enterprise agent pipelines
delivered by a combined human and AI team.

The owner approved the [three-offering content](./content-direction.md) as the
final homepage. It now lives at `/`: company promise, three choices, Trusted by,
separate journeys and distinct entry actions. Navigation uses **Spaces** and
**Cloud** with the XO mark, **MachineSpeed**, **Resources**, and **Find your path**.
Both preview URLs redirect to `/`; old homepage components and CSS were removed.
Detailed product routes and their existing functionality remain available.

This approval supersedes the older naming, Space-first layout and positioning
below. It does not change the existing commercial
evidence, media provenance or established visual identity. The remainder of
this document records the 22 September implementation baseline and its review
history; its Space-first homepage is historical and has been replaced.

## Historical implementation baseline — 22 September 2026

Approved direction · updated 22 September 2026

This document connects positioning, product naming, commercial choices, visual
direction and the website. Maintain it alongside implementation so individual
page changes serve the same business story.

**Status:** preserve the original Space-first homepage and keep XO's
cloud-computer story on `/xo`, navigated as **Cloud**. On 22 September,
the owner requested a review of the running XO app and a website update in the
original style, using its actual subscription tiers and real captured tours.
This supersedes the generic “pay for compute” cards, not XO's broader product
scope. The separate visual draft is not the current implementation direction.
Production billing, product-roadmap suggestions and audience hypotheses retain
their explicit evidence boundaries. Source verification belongs in
[product evidence](./product-evidence.md); shared interface rules belong in the
[design system](./design-system.md).

## 1. The direction

Quirq builds the infrastructure that lets agents do useful work. The experience
should make it easy to understand how an agent gets a computer, an environment,
the tools it needs and work to do—and how a person stays involved.

The earlier website understated XO by presenting the platform mainly as
“Space, hosted.” The owner's intended scope includes computers for agents,
preconfigured templates, delegation, parallel execution and autonomous scaling.
Space and XO need distinct, complementary roles in that story.

**Approved company positioning:** Infrastructure for agentic work.

**Approved homepage promise:** Give your agents a place to work.

The homepage restores the earlier split layout with Space copy beside a real
product capture. It introduces projects, agents and sharing, keeps the original
Trusted by section, then offers Machine Speed and trial/open-source entry.

**XO's opening promise:** Give your agents their own computers.

XO's cloud-computer story belongs on `/xo`: launch a ready-made environment,
bring agents and tools, keep the project in Space, and run work across cloud
computers. **Cloud** is the navigation label; **XO** remains the
product brand. The homepage's Space focus does not narrow XO to hosting Space.

## 2. Product and brand architecture

| Name              | Role                               | What a visitor should understand                                                                        | Commercial role                                               |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Quirq**         | Parent company and shared brand    | Infrastructure and implementation for agentic work                                                      | Owns the product family and enterprise relationship           |
| **XO**            | Cloud execution platform           | Give agents cloud computers; choose templates, provision environments and operate work at greater scale | Managed-cloud subscriptions and custom Enterprise deployments |
| **Space**         | Open-source working environment    | Keep projects, files, tools and agent activity together; share Git-backed projects between Spaces       | Open-source adoption and a useful environment on XO           |
| **Machine Speed** | Enterprise implementation offering | Put agents to work in the business through custom workflows, integrations and infrastructure            | Scoped implementation and ongoing services, when contracted   |
| **Research**      | Thesis and evidence                | Explore how agentic work can be observed and measured                                                   | Builds technical credibility; hosts the whitepaper            |

Use “XO, by Quirq” and “Space, by Quirq” in first introductions. Use **XO** as the
product name; **XO Cloud** can describe its managed offer. Do not revive xo-cloud
as a separate product. Keep the repository name `xo-space` in developer links.

A computer supplies execution resources. A Space is the environment in which
project work and agent activity live. An agent harness performs the work. A
template prepares a starting environment. These are related concepts, not
interchangeable names. Do not promise a dedicated physical server or a strict
one-agent-to-one-VM allocation without verifying that deployment model.

The proposed unit of work, **quirq**, remains part of Research. Platform billing,
observed model costs and verified-work measurement must stay distinguishable.
The research thesis does not establish that customers currently pay per outcome.

## 3. Audience and differentiation

**Recommended initial self-serve audience:** developers and technical teams that
already use agent harnesses and want them running beyond one person's laptop.
They have a concrete reason to care about templates, persistent environments,
parallel jobs, visibility and compute cost. This is a positioning hypothesis to
test against activation and customer conversations.

**Enterprise audience:** engineering and operations leaders moving from an agent
experiment into a repeatable business workflow. Lead with the work to be done;
offer Machine Speed for the integrations, infrastructure and rollout it needs.

The XO opening promise is easy to understand but insufficient differentiation on
its own. Build the case around the combination of:

- **Choice:** use the appropriate harness and configured tools for the job.
- **Continuity:** keep project state and work visible in Space.
- **Execution:** use XO to provision and operate the computers behind the work.
- **Coordination:** show exactly how work is delegated, runs in parallel and
  returns for review, using the capabilities available in the chosen setup.
- **Business adoption:** offer implementation through Machine Speed when the
  workflow needs more than self-serve setup.

Demonstrate these differences. Avoid unsupported “cheaper,” “fastest,” unlimited
scale, universal compatibility or production reliability comparisons.

## 4. The product story and its evidence

The Cloud page follows the actual app reviewed on 22 September:

1. Browse the agent catalog.
2. Configure a Space from a supported template.
3. Connect the tools and model account that setup needs.
4. Monitor usage in the existing environment.
5. Compare Starter, Pro and Business subscriptions.
6. Consider a custom Enterprise deployment.

Current media consists of actual app captures and edited step-through tours.
The review did not provision a new computer or run a task through to completion.
A single-project launch → task → parallel work → output → sharing demonstration
remains a future evidence goal, not a description of the current recordings.

The owner confirms delegation, parallel work and autonomous scaling as XO
capabilities. These are owner-provided facts; this review has not verified every
deployed mechanism. The demonstration still needs to establish the exact
mechanics: who starts additional workers, whether they are processes or separate
computers, how context moves, and what limits apply. Infrastructure provisioning
alone does not prove task decomposition or automatic fleet expansion.

Describe each type of scale explicitly:

| Type                 | Meaning                                              | What must be shown                                          |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| Parallel execution   | Several tasks or agents run concurrently             | Actual simultaneous runs and where each runs                |
| Task delegation      | An agent or controller assigns work to another agent | Assignment, receiving worker, output and review             |
| Capacity scaling     | More compute is provisioned as needed                | Trigger, allocation, supported limits and billing behavior  |
| Autonomous operation | Work proceeds without a person approving every step  | Permissions, stopping conditions, intervention and recovery |

Recommended future experience: explicit budgets, concurrency limits and clear
stop/pause controls accompany any automatic scale-up. Treat controls not verified
in the product as implementation recommendations, not existing features.

## 5. Pricing and commercial presentation

The owner's latest instruction is to show the **actual subscription tiers**
reviewed in the authenticated app at `http://localhost:3000`, source commit
`3be532fe9b5cd173425e6ae299ed77faa19e5dfd`. The local website preview now uses:

| Plan       | Monthly USD | Annual USD total | Entry action                                  |
| ---------- | ----------- | ---------------- | --------------------------------------------- |
| Starter    | **$10**     | **$100**         | Try on XO; 30-day trial for eligible accounts |
| Pro        | **$50**     | **$500**         | Try on XO; 30-day trial for eligible accounts |
| Business   | **$500**    | **$5,000**       | Choose Business; no free trial                |
| Enterprise | **Custom**  | **Custom**       | Talk to Quirq about a separate deployment     |

Monthly and annual totals were observed in the local app UI on **22 September
2026**. Annual amounts are full yearly totals. Trial eligibility is confirmed by
source and owner direction, not a trial activated in this review. The production
billing configuration and checkout were not verified. Do not label these amounts
as hourly compute prices or imply that a production deployment was updated.

Starter includes concurrent cloud apps, monthly platform credits and
integrations. Pro adds AI agent templates and marketplace listing; Business also
adds 24/7 priority support. The reviewed UI supplies no numeric credit quantities,
concurrency limits or machine allowances. Keep those numbers out of the copy.

### Historical pricing source comparison, checked 21 September 2026

This earlier comparison remains a record of conflicting destinations. The
22 September owner instruction and local runtime review supersede its earlier
restriction on showing subscription prices in the local preview. The production
qualification remains unresolved.

| Source                                                                                                                                                                                                                                                                                 | What was observed then                                                                                               | How to use it                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Earlier owner direction                                                                                                                                                                                                                                                                | 30-day free trial, then compute-based usage; Enterprise quoted separately                                            | Generic pricing presentation superseded by the 22 September subscription review          |
| [Public XO pricing](https://xo.builders/#pricing)                                                                                                                                                                                                                                      | Free $0, Starter $10, Pro $20, Max $100 per month; 1/10/30/500 workspaces; permanent free and a 14-day Starter trial | Conflicts with the confirmed direction; reconcile this public destination                |
| [Development billing plans](https://dev-billing-api.xo.builders/subscriptions/plans)                                                                                                                                                                                                   | Starter $10/month or $100/year; Pro $50/month or $500/year; Business $500/month or $5,000/year                       | Development subscription configuration, not a production compute tariff                  |
| [XO pricing source](https://github.com/sharmasuraj0123/xo-swarm/blob/2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d/components/pricing/hooks.ts) and [plan card](https://github.com/sharmasuraj0123/xo-swarm/blob/2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d/components/pricing/plan-card.tsx) | Loads authenticated billing plans and converts amounts from cents; eligible trial copy says 30 days                  | Current main at 17 September; does not establish the backend used by production checkout |

No verified dollar-per-hour/second rate, credit-to-compute conversion, machine
allowance or storage tariff was found. None of the subscription amounts above
can be presented as the price of running a computer. Public claims about active
workspace billing and model markup need reconciliation with actual billing too.

Show Starter, Pro and Business in three parallel subscription cards, with both
cadences visible. Present **Enterprise** separately: customer-cloud or self-hosted
XO, configurable policies and white-label deployments across multiple clouds,
quoted for the agreed scope. These Enterprise capabilities are owner-confirmed;
the local review did not provision or test them.

Present **Space open source** separately: run the environment on your own machine
or infrastructure, with direct install and GitHub links.

Keep implementation work separately identifiable from platform charges in an
enterprise quote. Do not imply every Enterprise customer must buy Machine Speed.

The price explanation needs answers to these specific questions:

- What do platform credits represent, how many are included, and what happens
  when an allowance is exhausted?
- Does billable time include idle machines? What happens when stopped or paused?
- Are persistent storage, network usage or other resources charged separately?
- Which machine size and amount of compute does the trial include?
- How are additional computers, concurrency and automatic scale-up charged?
- Which model credentials are required, and which provider charges remain outside
  the XO bill? The documented Claude setup connects the user's key or account;
  that does not establish an included model allowance.
- Is a card required, what happens after day 30, and what happens to saved work?

Keep application and marketing pricing synchronized with a dated source record.
Do not build a compute calculator until machine sizes, billing units and
additional charges are verified. Subscription totals alone cannot supply those
inputs.

## 6. Website roles and flow

| Surface           | Visitor's question                                                 | Recommended sequence                                                                                                         |
| ----------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Home**          | What is Space, and why should I try it?                            | Space-first split hero → original Trusted by rail → projects/agents/sharing benefits → Machine Speed → trial and open source |
| **Cloud / XO**    | How do I configure an agent environment, use it and choose a plan? | Catalog → configure a Space → connect tools → monitor usage → subscription pricing → custom Enterprise                       |
| **Space**         | What is the environment, and how do I work in it?                  | Projects → files/tools/agents → project sharing and review → run locally or on XO                                            |
| **Machine Speed** | How does this become useful inside my business?                    | Suitable workflow → scope and integrations → delivery and acceptance → deployment/operations → conversation                  |
| **Research**      | What is the thinking behind the system?                            | Research themes and evidence → articles and embedded whitepaper reader                                                       |

The header groups **Products** (Space `/products`, Cloud `/xo`) and **Resources**
(Docs `/docs`, Research `/research`, Writing `/writing`), followed by
**Enterprise** (`/machinespeed`) and **Try on XO**. Use the same grouping in the
mobile menu. Cloud replaces the longer Managed solutions navigation label; XO
retains its product brand and existing route. Keep direct pricing access to
`/xo#pricing` and the whitepaper inside Research. This is a navigation and copy
refinement, not another homepage redesign or a change to the product model.

Preserve the shared **Try on XO** action and authentic logo. State the **30-day
trial for eligible Starter and Pro accounts** near trial entry; Business must
not imply a free trial. Keep the direct app destination. The open-source command
and GitHub remain visible in the Space path.

Campaign pages can lead with a specific supported template or task, while the
homepage introduces Space and its practical benefits. Campaign promise, template availability and the
post-signup destination must match. Template-specific launch links are a proposed
improvement until the application supports them.

## 7. Visual and verbal direction

**Character:** precise, capable, calm and visibly alive with work.

Preserve Quirq's graphite background, warm white actions, restrained prismatic
brand material and canonical marks. XO's green stays with its product identity.
Use the existing semantic tokens and shadcn/Radix components; finish layouts and
media compositions within that system rather than introducing another kit.

The homepage uses the restored Space-first split composition and project media.
On `/xo`, use the reviewed catalog, configuration, tools and usage views as the
visual sequence. Only show parallel work when actual runs can be captured with
readable labels. Abstract connectors may explain the
architecture, but must be clearly diagrams rather than invented product screens.

Each section gets one short statement, one piece of visible evidence and one
optional next action. Move supporting setup, sharing, plan and transcript detail
into native disclosures. Keep material qualifications, trial eligibility and
prices visible with the claims and actions they qualify. Avoid repeating “your agents,” “your work” and “your infrastructure”
in generic feature grids. Prefer concrete verbs: launch, connect, assign, run,
inspect, share, stop.

Capture a legible part of the actual interface, with a way to see the full view.
Do not shrink a desktop dashboard until its contents become decoration. Mobile
uses focused crops and a short vertical sequence. Motion explains a change of
state and respects reduced motion; ordinary scrolling remains usable. Product
pages use native hash scrolling and optional `ProductMotion` entry animations.
Their server-rendered content remains visible before hydration and without
JavaScript. Keep the original homepage composition static and unchanged.

Skydive is useful for continuity, selective interface detail and contextual
examples. Liveblocks is useful for organizing a platform story. Quirq should
retain its own identity and use genuine product media. No borrowed character
system, fabricated output, simulated customer data presented as real, or
unsupported testimonials.

## 8. Build the business and the website together

Run four connected workstreams:

| Workstream            | Concrete output                                                 | Completion condition                                              |
| --------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| Product truth         | Capability map and one recorded launch-to-output example        | Every public claim has a source and demonstrable scope            |
| Commercial clarity    | Canonical subscriptions, trial eligibility and Enterprise offer | The public explanation matches what the customer is billed        |
| Brand and acquisition | Shared copy, template stories and page roles                    | A visitor can explain XO vs Space and knows what the trial starts |
| Experience            | Reusable media framing and onboarding continuity                | The advertised task survives signup and reaches a useful output   |

Recommended product priorities that improve conversion as well as messaging:

1. Make a template lead to an actual useful first task, with required credentials
   visible before launch.
2. Let the user see the computer's state, the agent's progress and the resulting
   work in one coherent journey.
3. Explain expected resource cost before starting more work; show actual usage
   afterward. Verify metering before proposing a calculator.
4. Make delegation and parallel execution inspectable, including failures and
   intervention, rather than demonstrating only the happy path.
5. Preserve project continuity from trial to paid operation; define what happens
   to saved work when a trial or running machine stops.

Use enterprise implementation to identify repeatable needs. With appropriate
permission and customer information removed, turn reusable work into maintained
templates, setup guides and demonstrable examples. Space can make those workflows
accessible locally; XO provides the managed execution path. This is a proposed
product and distribution loop, not a claim about existing customer results.

### Align the destinations as well as the website

The public docs currently use XO Space, Cloud Space and XO Cloud; the approved
website uses Space and XO. The Space repository describes itself as part of XO,
while this brand model makes Quirq the parent. Research also uses _quirq_ for the
measurement concept. Apply the same naming contract to docs, repository
introductions, app onboarding, trial messages and commercial pages. Preserve
technical identifiers and compatibility while correcting user-facing language.

Prioritize contradictions a visitor encounters on the conversion path: product
name, trial duration, price, what launches and what is included. A polished
marketing page cannot repair a contradictory signup or billing destination.

Suggested measures: successful first launch, first useful output, time to that
output, return to the project, trial-to-paid conversion and cost per useful run.
These are proposed measures, not existing analytics or performance claims.

## 9. Decision register

| ID  | Decision                                                                                                               | Status and reason                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01 | Quirq owns two products, Space and XO; Machine Speed is the implementation offering.                                   | **Owner direction.** Keep the commercial and product roles legible.                                                                                |
| B02 | XO has a broader computer/execution/platform story than hosting Space.                                                 | **Owner direction, 21 Sep.** Templates, delegation, parallel work and autonomous scaling belong in its scope; exact mechanics need evidence.       |
| B03 | Restore the Space-first homepage; place the cloud-computer story on `/xo`, labeled Cloud under Products in navigation. | **Latest owner correction.** Supersedes the earlier approval to lead the homepage with agent computers; XO's product scope is unchanged.           |
| B04 | Begin with technical teams using existing agent harnesses; route custom business adoption through Machine Speed.       | **Recommended audience hypothesis.** Validate with activation and sales evidence.                                                                  |
| B05 | Preserve Quirq controls, XO identity, authentic media, Trusted by and direct trial access.                             | **Owner direction.** The strategy changes the story without losing established brand constraints.                                                  |
| B06 | Offer the 30-day trial only for eligible Starter/Pro accounts; keep Business and custom Enterprise distinct.           | **Source-confirmed and owner-directed, 22 Sep.** Supersedes the generic Free trial / XO Cloud cards.                                               |
| B07 | Use the reviewed Starter $10/$100, Pro $50/$500 and Business $500/$5,000 monthly/yearly totals in the local preview.   | **Local runtime verified; owner requested, 22 Sep.** Production billing and numerical allowances remain unverified; these are not compute tariffs. |
| B08 | Keep platform pricing separate from research about verified work.                                                      | **Evidence boundary.** Do not imply outcome-based billing has shipped.                                                                             |
| B09 | Home, XO, Space and Enterprise each answer a different buying question.                                                | **Approved for implementation, 21 Sep.** Prevent repeated pages and feature-by-feature patching.                                                   |
| B10 | Templates, onboarding, pricing and marketing should describe the same journey.                                         | **Recommended.** Measure successful work after signup, not only button clicks.                                                                     |
| B11 | Align product names and commercial promises across docs, app and public sites.                                         | **Recommended; observed inconsistency.** Preserve technical identifiers while making the visitor's journey coherent.                               |

Update a decision when new owner direction or evidence changes it. Record the
date and what was superseded. Review this register before revising a page; keep
unresolved commercial facts visible rather than silently choosing a convenient
answer.

## Sources and review trail

- Owner instructions through 22 September 2026: preserve the original homepage
  and style, review the running XO app, use its actual billing tiers, and create
  shareable real product tours. The broader owner-confirmed scope remains
  computers for agents, templates, delegation, parallel work, autonomous scaling
  and custom Enterprise deployments.
- [XO platform review](./reviews/xo-platform-2026-09-22.md): local UI observations,
  source contracts, captures, tour status and unverified operations.
- [Official cloud documentation](https://docs.quirq.ai/docs/cloud): automated
  provisioning, isolated infrastructure, templates, browser IDE and operations.
- [Official product documentation](https://docs.quirq.ai/docs): runtime,
  environment, harness and observability distinctions.
- [Product evidence](./product-evidence.md): pinned Space source, current claim
  boundaries, screenshot provenance and pricing-source conflicts.
- [Design system](./design-system.md) and [theme tokens](../styles/theme.css):
  existing visual and interaction contracts.
- [Skydive](https://www.skydive.com/) and [Liveblocks](https://liveblocks.io/):
  design references supplied by the owner, not evidence of Quirq capabilities.

## Website implementation — 22 September 2026

- Home restores “Give your agents a place to work” in the earlier Space-first
  split layout, followed by Trusted by, projects/agents/sharing benefits,
  Machine Speed and trial/open-source entry.
- Cloud (`/xo`) follows catalog → configure a Space → connect tools
  → monitor usage → subscription pricing → custom Enterprise, using current
  app captures and edited tours in the original Quirq gray/white style.
- Space has its own Projects, Sessions and Sharing sequence with clearer Git
  handoff steps and deployment choices. Supporting sharing mechanics use native
  disclosure; GitHub, Docs, the installer and trial eligibility remain available.
- The shared header now groups Products and Resources, with Cloud as XO's short
  navigation label. Enterprise and the direct Try on XO action remain visible.
  The product pages use concise copy, progressive disclosure and optional entry
  motion without hiding server-rendered content or changing the original theme.
- `ProductCapture` continues to provide shared media framing and provenance on
  `/products` and `/xo`. Narrow screens can pan these screenshots and open the
  original image. The homepage is a static composition, with no product carousel.
  Warm-white actions, original trust and direct trial/pricing access remain.
- The local preview now shows the actual reviewed subscription totals and trial
  qualification. Backend billing configuration, cloud infrastructure, external
  docs, app onboarding and production deployment were not changed.

The product pages use authentic captures from different contexts. The new
shareable tours are edited step-throughs encoded at 4 fps from actual CUA
screenshots, with capture gaps removed; export and playback verification are
recorded in the review and export reports. They are not continuous native recordings or a
demonstration of a newly provisioned agent completing work. Production tariffs,
numerical allowances and a launch-to-output recording remain unverified.
