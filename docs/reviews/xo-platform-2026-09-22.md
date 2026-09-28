# XO platform review and captured tours

Review date: **22 September 2026**.

This report covers the authenticated local XO platform at
`http://localhost:3000`, with source inspection of `xo-swarm` at **`3be532f`**.
It is a read-only review of the available interface. It is not a production
deployment certification, a load test or proof that every represented action
works end to end. Account and project identifiers are intentionally omitted.

## Current result

The reviewed interface exposes personal and shared Spaces, their status, an
agent-template catalog, usage reporting and subscription pricing. The signed-in
account has an active Business subscription. The monthly and annual prices were
read from the interface; annual figures are full-year totals.

Five usability defects were observed: an upsell heading remains visible for the
active Business account, the account menu can remain open after billing
navigation, billing-cycle switches have no accessible labels, Pricing extends
256px beyond a 1024px-wide viewport, and an empty dashboard search displays
“Page 1 of 0.” Pricing does fit a 390px-wide mobile viewport. The usage views,
organization roadmap label, and a stopped Space's overview and sharing empty
state were also checked. Deep running-Space workflows remain unexecuted.

Three **edited step-through captured tours** have been assembled from actual
browser frames at **4 frames per second**: setup (52 frames, 13 seconds), pricing
(32 frames, 8 seconds) and usage (52 frames, 13 seconds). Encoding is complete,
including the usage cut's loaded final screen. The exporter validated all frame
counts, dimensions, durations and playability. All three native videos were
then played to completion on the website's `/xo` page without media errors.
These are silent browser captures with pauses
between segments removed, not native continuous screen recordings. Each source
frame is 1440 × 960px, cropped at `x=48, y=64` to 1392 × 840px, with a 100px
caption band added below.

QuickTime access through Computer Use failed with “Computer Use permissions are
not granted.” Browser-only CUA screenshot capture works without that desktop
permission, so it provides an alternative recording path. A stopped Space was
inspected only through its overview and an empty sharing dialog. No deep review
of files or projects, and no running-Space tools or model-connection workflow,
was performed.

## Scope and evidence standard

| Evidence type             | Meaning in this review                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Observed in the interface | The reviewer opened the view and read its displayed state or exercised the stated navigation  |
| Confirmed in source       | A route, component or behavior exists in `3be532f`; execution has not necessarily been tested |
| Pending                   | A check or capture remains incomplete                                                         |
| Not exercised             | A mutation or operational scenario was deliberately outside this read-only pass               |

No environment was provisioned, subscription or payment changed, agent command
executed, integration authorized, model credential submitted, or project deleted
during this review. Reading configuration screens does not demonstrate that
their save, connect, restart, deploy or execution actions succeed.
One setup form was filled with a temporary example name and volume value `4`,
then canceled without selecting **Create Space**. The preceding **Create Agent**
control opened that setup page; it did not complete provisioning.

## Interface coverage

| Area                        | Observed result                                                                                                                    | Boundary                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spaces dashboard            | Personal and shared Spaces were initially listed with statuses, including a running test Space                                     | Two previously visible Spaces subsequently disappeared during external updates; reviewers did not operate on or delete them. A running badge is not a health test |
| Template catalog            | OpenClaw, Codex, Antigravity, Hermes, Claude Code and XO Cowork are visible; XO Cowork is labeled experimental                     | Catalog presence is not a compatibility test or a successful deployment                                                                                           |
| Usage                       | Total Cost, Tokens, Messages and Average Latency are all zero for 7- and 30-day ranges; 7/15/30-day and custom filters are present | This establishes the displayed empty state, not the correctness of metering, attribution or aggregation                                                           |
| Billing                     | Business is active; Starter, Pro and Business pricing is displayed                                                                 | Subscription creation, checkout, upgrades and payment behavior were not exercised                                                                                 |
| Billing-cycle controls      | Monthly and annual figures were inspected; toggling any one switch updates all three plans                                         | Accessibility labeling is incomplete; see findings                                                                                                                |
| Account-menu navigation     | The menu can persist after Billing opens Pricing and is dismissed with Escape                                                      | Pointer/navigation behavior needs correction                                                                                                                      |
| Running Space configuration | Tools, models and integration views are part of a proposed walkthrough                                                             | No running-Space tools, model connections or deep files/projects review was performed                                                                             |
| Responsive pricing          | At 1024 × 900px, document width is 1280px; at 390 × 844px, it is 390px                                                             | 256px horizontal overflow is confirmed at the intermediate viewport; mobile width has no horizontal overflow                                                      |
| Recorded tours              | Setup, pricing and usage sequences captured at 4fps: 13, 8 and 13 seconds respectively                                             | Exports passed full-frame decode checks and native browser playback to completion without media errors                                                            |

The custom usage filter opens an accessible calendar displaying September and
October, with future dates disabled. It was dismissed without saving a custom
range. The 15-day option was visible; its analytics were not separately
validated. At `/spaces/create?tab=org`, the broader organization flow explicitly
displays **Coming Soon**.

The dashboard search with a deliberately unmatched term correctly shows
**No spaces found**, but its pagination reads **Page 1 of 0**. Reset restores the
rows and **Page 1 of 1**.

A read-only inspection of an existing stopped Claude Code Space showed
**Stopped**, a **Start** control, **Agent Offline**, unavailable resource usage,
and **Agent Logs** / **Build Logs** tabs. Agent Logs are unavailable until the
Space starts. **Start was not selected.** The **Share Space** dialog showed
**No users given access** and was closed without input or invitation. Files,
projects, running tools and model-connection flows were not opened. These
observations verify the offline and sharing empty states, not service startup,
log delivery or access-grant behavior.

### Pricing observed in the reviewed UI

| Plan     | Monthly, USD | Annual total, USD |
| -------- | -----------: | ----------------: |
| Starter  |    $10/month |         $100/year |
| Pro      |    $50/month |         $500/year |
| Business |   $500/month |       $5,000/year |

No numeric resource limits are rendered with these plans in the reviewed UI.
The figures do not establish included compute, credit quantities, concurrency,
storage allowances or dollar-per-hour rates. Do not reinterpret the annual
totals as monthly prices or treat these subscription amounts as a compute
tariff. The account's active Business state does not demonstrate trial
eligibility for a new account.

Source confirms a 30-day trial path for eligible new Starter or Pro
subscriptions, not Business. In `components/pricing/plan-card.tsx:137`, the trial
badge requires `canStartTrial`, a non-Business plan and no current subscription.
`app/api/billing/create-subscription/route.ts:73` similarly excludes Business and
checks unused-trial metadata. `app/api/webhook/route.ts:126` selects the internal
`basic` monthly plan for an automatic new-user trial. These are source findings;
no new-user trial or subscription was activated in this review.

The 30-day trial direction is consistent with the eligible-trial source path.
Earlier compute-based positioning does not establish a compute tariff for these
subscription amounts. The current website uses the observed subscription tiers;
the earlier public-site and development-API discrepancies are retained in
[product evidence](../product-evidence.md#pricing-review--unresolved). This pass
confirms what the local platform displays; it does not establish that every
production destination shows the same offer.

## Findings

### 1. Active subscribers still see an acquisition heading

**Priority: P2. Observed.** The Pricing view displays “Subscribe now to get full
access” while the same account has an active Business subscription. This makes
an existing subscriber appear to lack access and weakens confidence in account
status.

Use a status-aware heading such as “Your plan” or “Plans and billing” for active
subscribers. Verify the heading together with the current-plan state for trial,
active, past-due and unsubscribed accounts; this review did not exercise those
additional account states.

### 2. The account menu can stay open after billing navigation

**Priority: P2. Observed.** Opening Billing from the account menu navigates to
Pricing, but the menu remains visible until Escape is pressed. The destination
is obscured by a control whose navigation task has finished.

Close the menu when its navigation item is selected, using the menu component's
selection behavior. Verify pointer and keyboard activation, focus after
navigation, outside-click dismissal and Escape. Only the reported navigation
and Escape dismissal were observed in this pass.

### 3. Billing-cycle switches have no accessible names

**Priority: P2. Observed.** All three Pricing switches lack `aria-label` and
`aria-labelledby`; the visible “Billed annually” text is not associated with its
switch. A screen reader user cannot reliably identify the billing-cycle control
from the switch alone. Toggling any one switch updates all three plan cards, so
the multiple controls represent one shared cadence rather than independent plan
settings.

Associate each switch with its visible billing-cycle label and sufficient plan
context, or provide one clearly labeled billing-cycle control for the complete
comparison. Verify accessible names and keyboard operation after the change.

### 4. Price comparison lacks numeric resource allowances

**Priority: P3. Observed content gap.** Prices appear without numeric compute,
credit, storage or concurrency allowances. Visitors cannot determine the
resources purchased from this view alone.

Reconcile the commercial source, then show the quantities and billing units
that actually apply. Do not fill the gap with the older marketing site's
workspace counts or infer allowances from the tier names.

### 5. Codex details use broad persona examples

**Priority: P3. Observed content alignment concern.** The Codex template details
show Co-CEO, Executive Assistant and Support Agent as use cases. These examples
do not clearly explain the selected coding environment's distinctive setup or
workflow. Their presence is not evidence that those use cases were exercised.

Review this template's copy against its actual harness and intended tasks, and
use concrete examples that help a visitor decide which environment to choose.
This is a content concern, not a demonstrated compatibility failure.

### 6. Pricing overflows at an intermediate viewport

**Priority: P2. Observed and measured.** At `/pricing` in a 1024 × 900px viewport,
`document.scrollWidth` is 1280px: the page overflows horizontally by **256px**.
The Business call-to-action extends to approximately x=1255px, beyond the
visible viewport. This makes part of the comparison and its action require
horizontal scrolling.

At 390 × 844px, the document width is 390px and no horizontal overflow is
present. The issue therefore affects at least the tested intermediate layout;
it should not be described as a blanket failure at all mobile widths.

Allow the pricing grid and card contents to shrink or reflow before the
three-column layout exceeds its available width. Recheck 1024px and nearby
breakpoints, as well as the passing 390px layout.

### 7. Empty dashboard results display an impossible page count

**Priority: P3. Observed.** Searching for a deliberately unmatched Space name
correctly displays “No spaces found,” but the pagination reads **Page 1 of 0**.
Using Reset restores the rows and **Page 1 of 1**.

Hide pagination when there are no results, or use a consistent empty-result
label. Check that changing a filter also resets any previously selected page
and that reset restores the original list.

## Source capability map

The following map comes from read-only inspection of `xo-swarm` at `3be532f`.
It describes the source implementation, not a completed runtime test matrix.
Where an interface observation is separately recorded above, only that specific
navigation or displayed state has been exercised. Source paths below are
relative to the `xo-swarm` repository root.

| Surface            | Source route                                            | Source-described capability and constraints                                                                                                                       |
| ------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard          | `/`; `/spaces` redirects here                           | Personal/shared Spaces, status and agent-usage summary. Unpaid accounts see pricing                                                                               |
| Agent selection    | `/spaces/create`                                        | OpenClaw “AI Executive Team,” Codex, Antigravity, Hermes, Claude Code “AI Research Team,” and experimental XO Cowork. Nebius OpenClaw is feature-flagged          |
| Environment setup  | `/spaces/create/{agent}`                                | Space name and volume size; model credentials and channels vary by agent. **Create Space provisions infrastructure**                                              |
| Running workspace  | `/spaces/{id}`                                          | Health, CPU/RAM/disk telemetry, logs, Start/Stop/Update, apps and integrations. This review did not operate infrastructure controls                               |
| Workspace apps     | Workspace application view                              | Terminal, Web VS Code, desktop VS Code/Cursor links, agent gateways/dashboards, and Space/Cowork where supplied. Availability depends on the provisioned template |
| Models             | `/spaces/{id}/setup/models`                             | Provider connection status, supported account authentication and API-key connections. Support varies by workspace                                                 |
| Data connections   | `/spaces/{id}/setup/data`                               | Google Drive, OneDrive, GitHub and Vercel connection surfaces                                                                                                     |
| Messaging channels | `/spaces/{id}/setup/channels`                           | Channel configuration; disabled for Claude Code, Codex and Antigravity types                                                                                      |
| Projects and files | `/spaces/{id}/work/projects`; `/spaces/{id}/work/files` | Project inspection and file browsing/upload. Upload was not exercised; project Open routing needs verification                                                    |
| Usage              | `/usage`; `/spaces/{id}/usage`                          | Agent/model tokens, model cost, messages and latency, at global or per-Space scope. These are distinct from infrastructure telemetry and compute billing          |
| Organization       | `/org`; `/org/{id}`                                     | Organization gate, chat, dockable Projects Management, read-only GitHub Issue Board, Configure Connections and members                                            |
| Billing            | `/pricing`; account menu → Billing                      | Backend-supplied Basic/Pro/Business plans, monthly/yearly pricing and subscription/payment management. The public display name for Basic is Starter               |

### Source findings requiring care or further runtime verification

- **Trial duration and running time are different.**
  `components/pricing/plan-card.tsx:138` says “Free 30-day trial.”
  `components/chat/tabs/CoderWorkspace/index.tsx:168` identifies a trial
  workspace using `ttl_ms` of at most 24 hours; line 259 describes auto-shutdown
  after 24 hours. This is not a test of the live shutdown lifecycle. Avoid an
  unconditional “always running” claim; verify restart, saved work and billable
  behavior separately.
- **Additional source anchors for the map.**
  `app/page.tsx:50` handles the auth redirect, with entitlement, summary and
  SpacesTable at lines 54–71. The workspace dock links Overview, Work, Secrets
  and Usage in
  `components/chat/tabs/CoderWorkspace/application/Dock.tsx:52` onward.
  `lib/space-features.ts:9` disables channels for Claude Code, Antigravity and
  Codex. `components/spaces/setup/data/connector-meta.ts:35` lists the data
  connectors. `app/org/[orgId]/_lib/panes.tsx:7` describes live projects,
  a read-only GitHub Issue Board and Composio connections; labels appear at
  lines 38, 43 and 48. `app/org/_lib/connections.ts:16` lists Gmail, Google
  Calendar, Notion, Sheets, Docs, Slides, Meet and Figma toolkits. These source
  entries were not live-tested as connected integrations.
- **Organization roadmap is broader than the implemented surface.**
  `app/spaces/create/page.tsx:675` labels the organization tab **Coming Soon**;
  that label was also observed live at `/spaces/create?tab=org`.
  Its automatic context-sharing (line 749), Open Agent Network (788), Offices &
  Channels (818) and Command Center (846) are not established as working by
  their presence there. The existing `/org` surface is narrower.
- **Possible project Open route defect, source only.**
  `app/spaces/[spaceId]/@application/_components/SpaceProjectsListCard.tsx:176`
  links to `/work/spaces/{name}`. The implemented detail route is
  `app/spaces/[spaceId]/@application/work/projects/[xoProjectName]/page.tsx:7`.
  Verify the click in the approved test Space before recording it; no runtime
  failure is asserted here yet.
- **Connection dialogs can initiate authentication.**
  `components/oauth-subs-connectors/setup-codex-dialog.tsx:103` starts an
  EventSource in a mount effect; line 270 invokes that hook in the newly mounted
  dialog content. The source review found that the GitHub Token/Device-code
  dialog waits for an explicit start despite a stale comment. Reading the
  Models view is appropriate for this pass; opening authentication dialogs is
  outside the recording plan.
- **Usage is agent/model analytics.**
  `components/usage/analytics-content.tsx:60` onward defines Total Cost, Tokens,
  Messages and Average Latency; line 105 plots `costAndTokens`. These views do
  not establish compute metering or infrastructure billing accuracy.
- **Built-in tour coverage includes sensitive configuration.**
  `components/chat/tabs/CoderWorkspace/application/WorkspaceTour.tsx` describes
  Apps & Integrations → Overview → Files → Secrets → Usage and appears once for
  a running workspace. Do not use its Secrets step in public media.
- **Existing automated tests are not a read-only tour.**
  `playwright.config.ts` records failed tests only; lifecycle tests create and
  delete real Spaces. No anonymous demo account or dedicated recording script
  was found. `public/device-activation.gif` is authentication-help media, not a
  product walkthrough.

## Tour shotlists and capture status

Catalog, setup, usage and pricing tours can use their reviewed views. Tours
inside an existing Space must wait for confirmation of the target. Use a clean
product viewport.
Keep account menus and identifying account/project details out of the frame.
Inspect each proposed frame before capture; if it contains identifiers or
credentials, choose a safe view before recording. Do not open payment-method or
profile dialogs for a product tour.

The target timings below describe fuller editorial sequences; they are not
recorded durations. Actual captured duration is stated separately where known.
Use actual interface transitions and readable pauses. Do not fabricate populated usage,
successful agent responses, integrations or deployment events.

### Tour 1: Explore templates and prepare an environment

**Expanded-tour target:** 45–60 seconds. **Captured cut:** the final `setup-v2`
sequence contains 52 frames at 4fps, or 13 seconds. Encoding, frame validation
and native browser playback to completion passed.

The captured sequence is catalog → Codex details → **Create Agent** (opens the
setup page) → temporary example name → volume value `4`. The form was canceled
without selecting **Create Space**. Current still captures are stored under
`public/assets/xo-ui/review-2026-09-22/` as `agent-catalog.png`, `codex-setup.png`,
`pricing-monthly.png` and `usage.png`. An earlier Claude Code setup capture was
removed because its crop was unsuitable. The finalized MP4s and caption tracks are listed below. The fuller shotlist below is a plan;
it must not be treated as proof that every listed shot is in the captured cut.

| Shot | Action and frame                                                                          | Message                                                         |
| ---- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1    | Open the template catalog from the dashboard                                              | Choose a starting environment for the agent harness             |
| 2    | Show the available template cards with their names legible                                | OpenClaw, Codex, Antigravity, Hermes and Claude Code are listed |
| 3    | Briefly show XO Cowork's experimental label                                               | Experimental options are visibly identified                     |
| 4    | Open a template's setup form without submitting it                                        | Review the configuration needed before provisioning             |
| 5    | Show the visible required fields and optional configuration, without entering credentials | Configuration depends on the selected template                  |
| 6    | Leave the form through normal navigation                                                  | This tour ends before Create; no environment is provisioned     |

Do not narrate an environment as deployed. If a deployment tour is requested
later, capture a separately authorized real provisioning flow and its result.

### Tour 2: Understand an existing running Space

**Target:** 45–60 seconds. **Status:** pending target confirmation and live path
verification; no capture.

| Shot | Action and frame                                                               | Message                                              |
| ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 1    | Open the approved running test Space using a frame without identifying details | A Space gathers the environment's working context    |
| 2    | Show the overview and displayed status                                         | Read the state reported by the platform              |
| 3    | Visit the available tools or launch view                                       | Find the interfaces exposed by this environment      |
| 4    | Show relevant read-only runtime information                                    | Inspect the environment before choosing what to open |
| 5    | Return to the Space overview                                                   | Keep navigation and the selected Space context clear |

Do not run terminal commands, restart services, change resources or invoke
agent work. Confirm the actual view labels before recording this sequence.

### Tour 3: Review models, tools and integrations

**Target:** 60–90 seconds. **Status:** pending target confirmation and live path
verification; no capture.

| Shot | Action and frame                                                                 | Message                                                           |
| ---- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Open the approved test Space's setup view                                        | Review what is connected and what remains to configure            |
| 2    | Open its model configuration view with secrets masked and no identifiers exposed | See the available provider/account setup path                     |
| 3    | Show configured tools or available tool configuration                            | Tools belong to the selected environment's setup                  |
| 4    | Open integrations without selecting Connect or authorizing a service             | Inspect integration choices before granting access                |
| 5    | Return to setup                                                                  | Show the configuration overview without claiming a new connection |

Existing connection state should be described exactly as displayed. Do not
claim that a listed provider, integration or tool was tested in this pass.

### Tour 4: Read usage

**Expanded-tour target:** 30–45 seconds. **Captured cut:** `usage-v2` contains
52 frames at 4fps, or 13 seconds, including the loaded final screen. Encoding
and full-frame decode checks passed, as did native browser playback to
completion. The 7- and 30-day zero states, filter options and custom calendar
were observed live.

| Shot | Action and frame                                          | Message                                                      |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | Open Usage                                                | Find the platform's usage reporting                          |
| 2    | Show the selected last-seven-days range                   | Establish the reporting period before interpreting numbers   |
| 3    | Hold on the zero-value/empty state long enough to read it | This account shows no recorded usage for the selected period |
| 4    | Show the 7/15/30-day options and custom date filter       | Narrow the view using the controls the interface exposes     |

Do not substitute illustrative values for the observed zero state. A populated
usage tour requires real, authorized activity and a separate verification of
its attribution and totals.

### Tour 5: Compare plans and billing cycles

**Expanded-tour target:** 45–60 seconds. **Captured cut:** `pricing-v2` contains
32 frames at 4fps, or 8 seconds. Encoding, frame validation and native browser
playback to completion passed. Monthly and annual figures and the shared switch
state were observed live.

| Shot | Action and frame                                                       | Message                                                           |
| ---- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Navigate directly to Pricing, with the account menu closed             | Compare the displayed plans                                       |
| 2    | Show Starter, Pro and Business monthly amounts                         | $10, $50 and $500 per month in the reviewed interface             |
| 3    | Change the billing-cycle display without selecting a plan              | Compare full annual totals of $100, $500 and $5,000               |
| 4    | Show the current-plan indicator if it fits a frame without identifiers | The review account is already on Business                         |
| 5    | End on the plan comparison                                             | No checkout, upgrade, cancellation or payment action is performed |

Do not present this as a billing transaction demonstration. The active-account
heading and inaccessible-switch findings should be fixed before using the tour
as polished marketing media, or documented candidly in an internal review cut.

## Export inventory

All files below are under `public/assets/xo-ui/review-2026-09-22/`. Each video is
silent H.264 MP4 at 1392 × 940px and 4fps, with a matching WebVTT caption track.
The export checks established playability, dimensions and duration, decoded
every frame and checked the frame counts. Decoded opening frames were visually
reviewed for orientation, crop and readable captions. The crop excludes the
profile sidebar and header. OCR across all 136 raw frames, represented by 24
unique cropped images after hash deduplication, found no email-address patterns.
That specific check is not proof that every possible identifying detail is
absent. In the website's native video players, all three videos started with the
Space key and reached the end: `currentTime` equaled `duration`, `ended` was
`true`, and no HTML media error was present. The observed durations were setup
13 seconds, usage 13 seconds and pricing 8 seconds.

| Tour              | MP4                | WebVTT             | Duration | Frames | MP4 bytes |
| ----------------- | ------------------ | ------------------ | -------: | -----: | --------: |
| Catalog and setup | `setup-tour.mp4`   | `setup-tour.vtt`   |      13s |     52 |   388,090 |
| Plan comparison   | `pricing-tour.mp4` | `pricing-tour.vtt` |       8s |     32 |   414,320 |
| Usage             | `usage-tour.mp4`   | `usage-tour.vtt`   |      13s |     52 |   433,841 |

See [export method and verification](./xo-tour-export.md) for the reproduction
commands and source-frame/caption configuration.

## Website integration checks

The companion Quirq website preview runs at `http://localhost:3001`; the
reviewed XO platform remains at `http://localhost:3000`. The platform source
was not changed by this work. Passing website layouts below do not resolve the
platform Pricing overflow reported in finding 6.

On the website's `/xo` page, the document width matched the viewport at every
tested size. The paid plans remain three columns on desktop and stack on small
screens; Enterprise occupies its own full-width row.

| Website viewport width | Document width | Individual paid-plan card width | Layout                      |
| ---------------------- | -------------: | ------------------------------: | --------------------------- |
| 1280px                 |         1280px |                           368px | Three paid plans in one row |
| 1024px                 |         1024px |                           304px | Three paid plans in one row |
| 390px                  |          390px |                           350px | Paid plans stacked          |
| 320px                  |          320px |                           280px | Paid plans stacked          |

All three captured tours played in the `/xo` page's native video controls with
the results recorded above. The original homepage was also checked: its H1
remains **Give your agents a place to work**, all eight Trusted By brands are
present, and the hero retains GitHub, Docs and the direct free-XO call to action.

The [archived page capture](./xo-page-preview.png) records this review's website
draft, before the subsequent navigation and copy consolidation.

Final repository checks passed: `pnpm check` completed lint, types, all **41
tests**, Knip and formatting; `pnpm build` produced **72 pages** successfully
with a 4.4-second compilation. These checks apply to the Quirq website, not the
XO platform's infrastructure, subscription lifecycle or integration behavior.

## Remaining review boundaries

The media export and website integration checks are complete. A detailed tour
of an existing running Space still requires an appropriate confirmed target and
live path verification. Running tools, model connections, provisioning,
subscription/payment operations, sharing invitations and agent execution were
not exercised. A successful video playback or website build does not establish
those operational outcomes.

**Source map:** complete for the inspected commit; runtime boundaries are stated
above. **Runtime checks:** catalog/setup, organization roadmap, usage filters,
monthly/annual pricing, two responsive widths, dashboard search/reset, and a
stopped Space's offline/sharing empty states reviewed. **Capture inventory:**
setup, pricing and usage cuts exported, decode-verified and played to completion
in the website without media errors. **Desktop recording:** unavailable through QuickTime; browser capture
works. **Deep running-Space review:** not executed; tools/model connections
remain source-only. **Operational mutations performed:** none; provisioning,
payments, sharing invitations, agent execution and deep files/project workflows
were not exercised.
