# Quirq product evidence

Updated on **2026-09-22** after the owner requested a review of the running XO
app at `http://localhost:3000`. Its local source was
`xo-swarm` commit `3be532fe9b5cd173425e6ae299ed77faa19e5dfd`. The authenticated
interface supplied the current pricing and media evidence below; production
billing and provisioning were not tested.

The Space capabilities were reviewed on **2026-09-21** against the public
`quirq-ai/xo-space` main branch at
[`2a3397456051d96b59082dd7aa384b853ecd71b7`](https://github.com/quirq-ai/xo-space/commit/2a3397456051d96b59082dd7aa384b853ecd71b7),
committed on **2026-09-18**. GitHub's commits API confirmed main at that review;
source inspection used that commit rather than the modified local checkout.
The repository identifies main as the branch its installer ships. This is source
verification, not a claim that every cloud account has been tested.

## Product and deployment language

- **Space** is the open-source workspace: an environment for projects, files, agents and
  tools. Its local server and browser UI bring project work and agent activity
  together. It uses installed agent runtimes rather than replacing their models
  or accounts.
- A **project** is a folder within the workspace root. Project metadata includes
  todos, usage and session references. A project shared through the relay must
  have a Git origin.
- A **Space ID** identifies the destination for sharing. The implementation also
  calls this a workspace ID; `workspace_id` is an API field, not a product name.
- **XO** is a separate Quirq product: the managed cloud platform, described at
  `/xo`. It can host Space. The reviewed app offers **Starter, Pro and Business
  subscriptions**, with a **30-day trial for eligible Starter and Pro accounts**.
  Business has no free trial. Running Space on one's own machine or infrastructure
  remains the open-source option.
- On **21 September 2026**, the owner clarified XO's broader scope: cloud
  computers for agents, preconfigured templates, task delegation, parallel
  execution and autonomous scaling. These are owner-provided capabilities.
  Do not reduce XO's positioning to hosting Space. The exact delegation layer,
  worker-to-machine mapping, scaling triggers, quotas and resulting charges
  require more specific evidence before describing their mechanics.
- The owner also confirms XO's offering for **one-click environment provisioning
  and setup**, **any agent harness**, configurable **policies, runtime and cloud**,
  enterprise **self-hosting or connecting one's own cloud**, and **white-label
  deployments across multiple clouds**. These are owner-provided product and
  service capabilities; the Claude Code example below is not a test of every
  harness or enterprise deployment configuration.
- **Machine Speed** is Quirq's custom enterprise implementation offering:
  workflows, integrations, setup and infrastructure.

The owner's **22 September** instruction to inspect the running app and use its
actual tiers supersedes the earlier generic “pay for compute” pricing cards.
The local website preview now uses the reviewed subscription amounts below.
They do not establish a production tariff, hourly compute rate, resource
allowance or model/API charge. Do not restore a required Space self-hosting
license or imply that Enterprise implementation is necessary to run open source.

The product owner explicitly requested **Try on XO**, the authentic XO logo,
and a **30-day free trial** on 2026-09-21. Use the shared `TryOnXo` control linked
to `APP_URL` from `lib/products.ts`. Its visible “Try on” text and logo have the
accessible name “Try on XO” with a new-tab announcement. The owner also
confirmed that XO is a separate Quirq product. These directions supersede the
earlier xo-cloud naming and unspecified free-entry copy. Payment-card
requirements, automatic charging and discounts remain unverified.

### Current XO offer and pricing presentation

The owner requested these actual app tiers in the original Quirq styling. Both
billing cadences remain visible without a JavaScript toggle:

| Offer      | Monthly USD      | Annual USD total | Trial / scope                                                                          |
| ---------- | ---------------- | ---------------- | -------------------------------------------------------------------------------------- |
| Starter    | **$10**          | **$100**         | 30-day trial for eligible accounts                                                     |
| Pro        | **$50**          | **$500**         | 30-day trial for eligible accounts                                                     |
| Business   | **$500**         | **$5,000**       | Paid subscription; no free trial                                                       |
| Enterprise | **Custom quote** | **Custom quote** | Separate self-hosting, own-cloud, custom-policy and white-label multi-cloud deployment |

Monthly and annual amounts were read from the running authenticated `/pricing`
interface on **2026-09-22**, including the annual switch. Annual amounts are
full-year totals, not monthly equivalents. This verifies the **local runtime**;
it does not verify the deployed production billing configuration. No checkout,
trial activation, payment or subscription change was performed.

Starter and Pro use the shared `TryOnXo` control. Business links to the app's
pricing page with “Choose Business”; Enterprise uses the existing contact path.
The current trial qualification comes from owner direction and source rules,
not a newly activated trial. Enterprise service options do not create a license
or implementation prerequisite for open-source Space.

One-click provisioning refers to creating and setting up the environment.
The documented Claude example still requires the chosen model's credentials
or account connection; do not imply that provisioning supplies all provider
accounts or bypasses their setup requirements.

Sources: [Space README](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/README.md),
[project layout](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/cowork_agent/project_layout.py).
Canonical product source: [quirq-ai/xo-space](https://github.com/quirq-ai/xo-space).
Canonical install command: `curl -fsSL https://quirq.ai/install | sh`.

## Implemented on main

The README and interface describe browsing project files, viewing agent sessions,
tracking todos and usage, and exploring Git history. Capabilities depend on the
configured runtime: the supported-agent table distinguishes chat from session
telemetry. Avoid claims that every model, harness or integration supports every
feature.

Project sharing is implemented through the Space UI, API routes and a Git commit
relay. It is not a future roadmap item:

1. Open **Projects → Manage**, select **Share**, and enter the recipient's
   **Space ID**. The **Inbox → Sharing** composer provides the same operation.
2. The recipient sees the repository in **Inbox → Sharing**. By default, Space
   clones a newly shared repository into its workspace root.
3. When a participant pushes commits, the relay announces them and the other
   Space fetches the Git objects. Incoming commits remain visibly unapplied.
4. The recipient chooses **Apply** to fast-forward the local checkout. The
   interface shows the commit count and a manual Git command as well.
5. The owner can inspect membership and revoke a recipient's relay access.
   **Copy invite** helps exchange Space IDs; **Check now** requests an earlier
   poll. The September 18 change routes an Inbox sharing item directly to the
   selected project and its Apply control.

Sources: [inline sharing form](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/space_ui/js/core/project-share.js),
[Sharing interface](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/space_ui/js/views/sharing.js),
[sharing routes](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/routers/cowork_agent/bff/project_sharing.py),
[service](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/cowork_agent/project_sharing/service.py).

## Sharing constraints

- The relay requires an authenticated XO connection and a configured Space ID.
  It is inactive when either is missing, or when explicitly disabled.
- Git repository access is separate. A recipient of a private repository needs
  suitable GitHub authentication and access; sharing a Space ID does not itself
  grant GitHub collaborator permissions.
- The relay follows a configured branch, `main` by default. It detects pushed
  commits, not uncommitted files. The normal polling interval is approximately
  one minute; local changes and Check now can trigger earlier checks.
- Fetching does not apply changes. Apply runs `git merge --ff-only`; it does not
  create merge commits or resolve divergence. Git can also refuse an apply that
  would overwrite local changes.
- Automatic cloning can be disabled. It handles one repository per poll,
  refuses to overwrite an existing project folder and does not execute the
  cloned repository's code.
- Revoking relay membership does not erase existing local copies or revoke
  independently granted GitHub permissions.
- The relay sends repository identity, workspace ID and commit hashes to the
  coordination service. Git clone/fetch transfers repository contents through
  the Git remote. Do not turn the relay's limited metadata payload into a
  blanket claim that sharing sends no files.

Sources: [configuration](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/cowork_agent/project_sharing/config.py),
[poller](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/cowork_agent/project_sharing/poller.py),
[clone implementation](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/cowork_agent/project_sharing/clone.py),
[Git operations](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/cowork_agent/project_sharing/git_ops.py),
[coordination client](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/services/swarm_api/project_sharing.py).

## Keep these distinctions

- The README's older cloud comparison calls self-hosted team sharing "via
  GitHub backup." Its current Manage/Sharing instructions and implementation
  also support the relay in an account-linked self-hosted Space. Do not claim
  project sharing is exclusive to managed cloud.
- `/api/xo-projects-sync` is a separate encrypted GitHub backup and restore
  feature. It is not the commit-sharing relay. The terms `sharingSpaceIDs` and
  `projectsync` do not appear in the inspected xo-space main source and should
  not become user-facing labels.
- The local checkout contains work not present on main, including an expanded
  Work/Work-item system. Treat that work as unverified for public release copy.
- Simultaneous document editing, automatic conflict resolution, automatic
  transfer of all agent memory or credentials, and universal agent compatibility
  are not established by the inspected sharing implementation. Do not present
  them as shipped or planned without an explicit product source.

Sources: [backup/restore router](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/routers/cowork_agent/xo_projects_sync.py),
[sharing test story](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/tests/test_project_sharing_e2e.py).
The test story uses real Git with mocked coordination and GitHub; it is useful
implementation evidence, not proof of a live external service test.

## Recommended concise copy

> Space brings your projects, files, agents and tools into one environment.
> Share Git-backed projects between Spaces, review incoming changes and apply
> them when you're ready. Run Space open source, or try it on XO, Quirq's
> managed cloud platform. Eligible Starter and Pro accounts can try XO free for
> 30 days, with monthly or annual subscriptions afterward.

## Page roles

The homepage restores the earlier Space-first split layout: “Give your agents
a place to work” beside the Projects capture, then Trusted by, project/agent/sharing
benefits, Machine Speed and trial/open-source entry. `/products` is the detailed
Projects, Sessions and Sharing walkthrough. `/xo`, labeled **Managed solutions**
in navigation, follows the reviewed app: **catalog → configure a Space → connect
tools → monitor usage → subscription pricing → custom Enterprise**. The original
homepage and gray/white Quirq style remain; this review does not replace them
with the separate visual draft. Source screenshots stay unchanged.

The product pages use authentic captures from different example contexts. They
must not be described as an end-to-end recording of one project. The official
Claude Code setup video remains historical documentation evidence. Current
edited tours use actual captured app screens; they do not demonstrate new
provisioning, task execution or automatic scaling.

## XO logo provenance

The canonical cloud assets are `public/xo.svg` and `public/xo-light.svg` in
`xo-swarm`. They are referenced by its `ThemeImage` component at usage sites
including `components/dynamic-breadcrumb.tsx` and `app/projects/create/page.tsx`.
The local files inspected were:

- `xo-swarm/public/xo.svg`: white X and
  `#83d63a` O, intended for dark surfaces.
- `xo-swarm/public/xo-light.svg`: black X and
  the same green O, intended for light surfaces.

Both variants preserve the same four polyline shapes. Public Space main at
`2a3397456051d96b59082dd7aa384b853ecd71b7` also includes that geometry in
[`brand/xo-logo.svg`](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/brand/xo-logo.svg).
The older cloud `public/logo.svg` uses different geometry and pure lime; it is
not the source for the website's XO mark.

The website's `components/ui/xo-logo.tsx` keeps all four polyline points, the
15.38 stroke width and the original green. It maps the monochrome X to
`currentColor` so it works on both Quirq surfaces, and crops only empty artboard
space to `viewBox="0 150 500 200"`. No replacement lettering or icon is drawn.
The shared `components/ui/try-on-xo.tsx` pairs this mark with “Try on”.
Its CTA rendering is **30 × 12px**. `XoLogo` defaults to **40 × 16px**; standalone
product lockups use **48px width** at the same 2.5:1 aspect ratio. These sizes
change presentation only, not the canonical shape.

## Trusted by provenance

The product owner instructed that the **Trusted by** section must always remain.
Its eight brands and canonical logo assets come from the original `FrameOneHome`
in repository `HEAD` (`components/home/frame-one-home.tsx`), where they were
already displayed under **TRUSTED BY**: OpenAI, Google, AWS, OKX, Shopify,
Nevermined, Shodai and MagicPath. The restored section is
`components/home/trusted-by.tsx`.

This restores the owner's existing site content; it is not new customer
verification. Do not add logos, testimonials, relationship details or customer
claims. Do not substitute the agent-support rail for this section or describe
supported agents as customers.

## Media provenance

The Projects and Sharing images were captured on **2026-09-21** from the current
main frontend at `2a3397456051d96b59082dd7aa384b853ecd71b7`. The unmodified frontend
was served read-only with upstream `tests/space_ui_preview/server.py` from
`/tmp/quirq-xo-space-media-main-2a339745`. Both captures are **1280 × 720**.

| Website asset                                                                                 | Space UI route         | Capture date |
| --------------------------------------------------------------------------------------------- | ---------------------- | ------------ |
| [`public/assets/space-ui/projects.jpg`](../public/assets/space-ui/projects.jpg)               | `#/projects/data/list` | 2026-09-21   |
| [`public/assets/space-ui/project-sharing.jpg`](../public/assets/space-ui/project-sharing.jpg) | `#/inbox/sharing`      | 2026-09-21   |

These captures use the upstream preview's fictional demo fixtures, including
Aurora Console. They demonstrate real interface behavior with example data;
they are not customer workspaces or customer evidence. The website labels them
**Example workspace**.

The existing
[`session-overview.jpg`](../public/assets/space-ui/session-overview.jpg) capture is
dated **2026-07-28** and is labeled separately. It remains useful as a sessions
example but must not be described as a capture of the latest interface.

The agent overview fixture was unavailable during this capture pass. No agent
overview graph was invented or substituted. Add a new capture only when the real
interface can be rendered with supported data.

Source: [upstream preview server](https://github.com/quirq-ai/xo-space/blob/2a3397456051d96b59082dd7aa384b853ecd71b7/tests/space_ui_preview/server.py).

### XO runtime media — 22 September 2026

Current captures come from the running app at `http://localhost:3000`, backed by
the inspected `xo-swarm` checkout at `3be532fe9b5cd173425e6ae299ed77faa19e5dfd`.
CUA captured the real interface; no app UI, account state or output was invented.
The source images are under `public/assets/xo-ui/review-2026-09-22/`:

- `agent-catalog.png`: the available agent catalog.
- `codex-setup.png`: the Codex configuration form before provisioning.
- `pricing-monthly.png`: the authenticated monthly subscription comparison.
- `usage.png`: the app's usage overview, showing no activity in the selected period.

The same directory contains three shareable **4 fps edited step-through tours**
encoded from actual CUA screenshots: `setup-tour.mp4`, `usage-tour.mp4` and
`pricing-tour.mp4`. Capture gaps are removed; these are not continuous native
screen recordings. Cropping removes the app sidebar/header and a separate
caption bar sits below the captured product viewport. No interface content is
generated. Exact export dimensions, frame counts and verification are maintained
in the [export record](./reviews/xo-tour-export.md); scope and observed states are
in the [review report](./reviews/xo-platform-2026-09-22.md).

Do not describe the tours as a successful launch-to-output demonstration: setup
stops before Create Space, usage shows an empty activity state rather than a
compute invoice, and pricing compares subscriptions without changing one.
No new Space, compute instance or subscription was created, and no payment was
made.

### Historical XO beta setup media

The earlier `/xo` page used authentic beta-platform captures from the official
[Claude Code setup guide](https://docs.quirq.ai/docs/agents/claude-code/setup).
The source assets were added to `xo-docs` in commit
`6ceb35fef933235a630e6b7dccf05adc7e31826a` on **2026-05-18** and remain referenced
by the live guide. The date is the source commit date, not a newly verified
screenshot capture date. They show the documented beta interface, not a new
session captured during this website revision.

Files were copied byte-for-byte from
`xo-docs/public/images`:

| Website asset                             | Original documentation asset               | Dimensions  |
| ----------------------------------------- | ------------------------------------------ | ----------- |
| `public/assets/xo-ui/templates.jpeg`      | `claude-code-setup-03-create-agent.jpeg`   | 2477 × 1385 |
| `public/assets/xo-ui/create-project.jpeg` | `claude-code-setup-04-create-project.jpeg` | 2476 × 1385 |
| `public/assets/xo-ui/launch.jpeg`         | `claude-code-setup-09-codeserver.jpeg`     | 2477 × 1385 |

The original highlight annotations and demo account remain intact. The images
demonstrate selecting Claude Code, configuring the project and opening
code-server from the Launch tab; they are not customer evidence. Do not replace
their labels or account information with invented interface content.
They are one historical setup example, not a compatibility catalog or proof
that every harness, policy, self-hosted deployment or multi-cloud configuration
has the same interface. The broader XO and enterprise offering comes from the
owner's product direction, separately from these screenshots.

The same guide embeds the official
[Claude Code Setup on XO Builders video](https://www.loom.com/share/749ccdf580b543209237b5cdd12f42a3),
Loom ID `749ccdf580b543209237b5cdd12f42a3`. Link that walkthrough rather than
fabricating a product recording.

The documented setup sequence is: choose an agent template, configure and create
the project, wait for its services to become ready, connect the model account or
credentials, and open the agent or browser editor. The guide uses
`https://beta.xo.builders`; current general cloud documentation links
`https://app.xo.builders`. No project, compute instance, subscription or payment
was created during the website review.

## Cloud verification

The initial cloud review used `xo-swarm` main at
`2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d`. Its interface supports runtime
configuration, storage size and usage, with plans supplied dynamically by the
backend. The initial source review did not establish numeric rates. The follow-up
pricing review below found live but conflicting sources.

The earlier **pay for compute** framing was owner direction, not a measured
tariff. On **22 September**, the owner requested that the local website use the
actual running app's subscription tiers. The local authenticated pricing view
now verifies the amounts and billing intervals in the current-offer table.
Production billing, numerical allowances, discounts and compute rates remain
unverified.

### Subscription source contract — 22 September 2026

The inspected checkout is `xo-swarm`, commit
`3be532fe9b5cd173425e6ae299ed77faa19e5dfd`. Relevant source paths:

- `components/pricing/hooks.ts:42–72` reads authenticated
  `/api/billing/subscription-plans`, renders each supplied `displayName` and
  feature string, and converts monthly/yearly minor-unit amounts by dividing by 100. The internal Starter plan key is `basic`.
- `lib/billing/server.ts:15–37` fetches the catalog without caching from
  `${BILLING_BASE_URL}/subscriptions/plans`. The frontend source does not contain
  the price schedule. This review did not read secret configuration or query
  the authenticated backend outside the app UI.
- `components/pricing/plan-card.tsx:83,120–138` renders annual totals as `/ year`
  and offers the 30-day trial badge only to eligible non-Business accounts.
  The API applies the same non-Business eligibility condition in
  `app/api/billing/create-subscription/route.ts:73–91`.
- `app/api/webhook/route.ts:126–159,235–239` attempts a Basic monthly-plan trial
  for new signups. This source behavior was not exercised during the review.
- `components/pricing/plan-card.tsx:154–172` can show an account-specific
  prorated upgrade amount. That amount is not a catalog price.

The observed feature labels contain no numerical allowances: Starter includes
concurrent cloud apps, monthly platform credits and integrations; Pro adds AI
agent templates and marketplace listing; Business also adds 24/7 priority
support. Do not infer a credit count, machine size, concurrency quota or hourly
rate from those labels. Enterprise remains the owner's separately confirmed
custom deployment offer, not a renamed Business plan.

### Platform scope review — 21 September 2026

The live [cloud guide](https://docs.quirq.ai/docs/cloud) describes isolated cloud
infrastructure, automated provisioning, preconfigured agent templates, browser
VS Code, persistent endpoints, resource monitoring and machine/service controls.
This supports the owner's concrete framing: **XO gives agents cloud computers**.
The [architecture guide](https://docs.quirq.ai/docs) distinguishes machine,
environment, agent harness and observability. Space is the working environment;
it must not be used as a synonym for every layer of XO.

The owner additionally confirms task delegation, parallel execution and
autonomous scaling. Local implementation review found delegation-related team
code and infrastructure scaling documentation, but did not verify the current
deployed experience end to end. Space's dispatcher routes to configured harnesses;
that alone is not a scheduler for provisioning additional cloud computers.
Concurrent work, task delegation and capacity scaling need distinct explanations.
Do not invent the worker allocation model, automatic spending rules, recovery
guarantees or concurrency limits.

At that review, website media demonstrated template selection, configuration, launch
and project/session/sharing views. No current recording of the complete
delegation-to-scaling flow was found in those assets. Capture the real supported
flow before illustrating it as product UI.

See [brand strategy and decisions](./brand-strategy.md) for the proposed company
story, product roles, commercial explanation and website priorities. The owner
direction is established; the recommended page structure and wider business
priorities are proposals.

### Pricing review — unresolved

The public homepage and development endpoint below were checked during the
brand strategy review on 21 September; they disagreed at that review.
Then-current XO main was confirmed at `2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d`
(17 September). Its [pricing hooks](https://github.com/sharmasuraj0123/xo-swarm/blob/2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d/components/pricing/hooks.ts)
read authenticated plans, and its [plan card](https://github.com/sharmasuraj0123/xo-swarm/blob/2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d/components/pricing/plan-card.tsx)
uses 30-day trial wording. No production compute tariff or trial resource
allowance was established by that source check.

This is a **historical internal review record**, checked on **2026-09-21**.
The **22 September local runtime review and owner instruction supersede its
earlier restriction on using subscription amounts in the local website preview**.
The production billing qualification and absence of verified compute tariffs
still apply. Do not mix the older public homepage's allowances or plan names
with the newly reviewed app tiers.

| Source observed                                                                                 | Monthly USD schedule                                   | Annual USD schedule                     | Qualification                                                                              |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| Public `https://dev-billing-api.xo.builders/subscriptions/plans` response                       | Starter $10; Pro $50; Business $500                    | Starter $100; Pro $500; Business $5,000 | Live unauthenticated API response; production/beta frontend use not independently verified |
| Published `https://xo.builders/#pricing`                                                        | Free $0; Starter $10; Pro $20; Max $100                | Not established by this inspection      | Live public homepage, conflicts with the API and some owner-confirmed positioning          |
| `xo-main` `components/pricing-grid.tsx`, main commit `0c4293aadd32712f8dd65f7cf7e8109f2791d6f9` | Starter $10; Pro $50; Business $500; Enterprise custom | Starter $100; Pro $500; Business $5,000 | Historical March 2026 source, links to beta; not proof of its deployed pricing             |

The billing API was retrieved without credentials or customer data. It returns
amounts in cents and separate monthly/yearly prices in USD, which the current
`xo-swarm` pricing UI divides by 100. These are subscription amounts; the
response does not establish per-hour or per-second compute rates.

The local `xo-swarm` configurations point to that development billing service.
Current frontend source at `2fa25ff4d2d0d316c77cdb8304ac550f0b5fe37d` reads plans
through `/api/billing/subscription-plans` and the server's `BILLING_BASE_URL`.
That authenticated frontend route does not prove which backend a deployed beta
or production build uses. Do not label the development API's rates as verified
production pricing without resolving this distinction.

The API's named inclusions are:

- **Starter:** Active Cloud Apps (concurrently), Platform Credits (monthly),
  Integrations.
- **Pro:** the same categories plus AI Agent templates and Marketplace Listing
  (Earn Rewards).
- **Business:** the same categories plus 24/7 Priority Support.

The response supplies no credit quantities, concurrency counts, CPU/RAM/storage
allowances or hourly compute rate. Do not fill those gaps with figures from the
older marketing grid. The published homepage instead claims 1 free workspace,
10 Starter workspaces, 30 Pro workspaces and 500 Max workspaces, and mentions a
14-day Starter trial. Those claims conflict with other reviewed sources; the
owner's **30-day trial** direction remains the approved copy for this site.

During the earlier review, the unauthenticated `/pricing` page on
`app.xo.builders` displayed a failed-plan load. Authenticated pricing was not
verified then. The later local authenticated review supplies the current preview
prices above; it does not establish production checkout behavior. No subscription
was created in either review.
