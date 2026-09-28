# Quirq web

The marketing, research and interactive documentation site for [quirq.ai](https://quirq.ai).

- **Space** is the open-source workspace for projects, files, agents and tools.
  It brings project work, sessions, todos and usage into one view. Run it on your
  own machine or infrastructure, or on XO.
- **XO** is Quirq's managed cloud platform, with its product page at `/xo`,
  navigated as **Managed solutions**.
  It gives agents cloud computers and preconfigured environments. The owner also
  confirms delegation, parallel work and autonomous scaling; exact mechanics and
  limits are recorded separately from verified deployment evidence. Try it free
  for **30 days**. Paid usage is based on compute.
- **Machine Speed** delivers custom enterprise workflows, setup and infrastructure.

Space supports sharing Git-backed projects with another Space ID. Incoming
commits are fetched for review and applied explicitly. Account linking and the
recipient's Git repository access are prerequisites; sharing is not live document
coediting. The [product evidence](./docs/product-evidence.md) records the verified
implementation, terminology and copy constraints.

The canonical Space installer is:

```bash
curl -fsSL https://quirq.ai/install | sh
```

This installs Space; the development commands below run this marketing website.
Space's [repository](https://github.com/quirq-ai/xo-space) and
[documentation](https://docs.quirq.ai/docs/space) explain product setup.

The homepage restores the earlier Space-first split layout: **Give your agents
a place to work**, followed by Trusted by, projects/agents/sharing benefits,
Machine Speed, and trial/open-source entry. It is a static composition.
`/products` provides the detailed Projects, Sessions and Sharing flow.
**Managed solutions** (`/xo`) retains the XO brand and its cloud-computer story:
templates, provisioning, parallel work, compute pricing and enterprise cloud
deployments. Its official setup video remains prominent. `/products` and `/xo`
use the shared `ProductCapture` viewer and source manifest; mobile visitors can
pan readable screenshots without widening the page. Pricing stays directly
available in navigation.

A separate visual draft is available at `/draft`, with `noindex` metadata. It
preserves the homepage's content flow and original Trusted by section while
exploring a larger asymmetric hero, real screenshots, warm ivory benefit columns
and more expressive typography. The approved homepage remains at `/`.
The draft lives in [`app/draft/page.tsx`](./app/draft/page.tsx),
[`editorial-home.tsx`](./components/home/editorial-home.tsx) and
[`editorial-home.module.css`](./components/home/editorial-home.module.css), using
the shared theme and components.

The primary action uses the shared **Try on XO** control: visible “Try on” text
and the authentic XO mark link directly to `APP_URL` in `lib/products.ts`. The
30-day free trial is product-owner direction; payment-card requirements,
automatic charging, discounts and exact rates are not established. Conflicting
paid schedules are documented in `docs/product-evidence.md`; do not publish them
as verified pricing. Research, journey authoring, the optical story renderer and
the reference measurement kit remain independent parts of the site.

## Setup

Use Node.js **22.13.0 or newer** and **pnpm 9.12.3**, as declared in
[`package.json`](./package.json).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The public site needs no application
environment variables. A fresh build needs network access for the Geist fonts
loaded by `next/font/google`.

```bash
pnpm check
pnpm build
pnpm start
```

## Architecture

Next.js 16.2.11 App Router, React 19.2.4, TypeScript and Tailwind CSS 4. Pages use
Server Components by default, with client boundaries around interactive controls.

| Area                                               | Source                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Homepage value and trust                           | [`components/home/home-page.tsx`](./components/home/home-page.tsx), [`trusted-by.tsx`](./components/home/trusted-by.tsx)                                     |
| Space walkthrough and deployment options           | [`components/products/products-page.tsx`](./components/products/products-page.tsx), [`deployment-options.tsx`](./components/products/deployment-options.tsx) |
| Managed solutions / XO page                        | [`app/xo`](./app/xo)                                                                                                                                         |
| Shared product captures                            | [`components/products/product-capture.tsx`](./components/products/product-capture.tsx), [`lib/product-media.ts`](./lib/product-media.ts)                     |
| Shared XO action and canonical mark                | [`components/ui/try-on-xo.tsx`](./components/ui/try-on-xo.tsx), [`xo-logo.tsx`](./components/ui/xo-logo.tsx)                                                 |
| Shared colors, type, spacing and motion            | [`styles/theme.css`](./styles/theme.css)                                                                                                                     |
| Buttons, sheets, dropdowns, inputs and site chrome | [`components/ui`](./components/ui), [`lib/utils.ts`](./lib/utils.ts)                                                                                         |
| Space and enterprise routes                        | [`app/products`](./app/products), [`app/machinespeed`](./app/machinespeed)                                                                                   |
| Research catalog and generated articles            | [`lib/research.ts`](./lib/research.ts), [`app/research`](./app/research)                                                                                     |
| Staged narrative pages                             | [`components/stage-page.tsx`](./components/stage-page.tsx), [`components/story`](./components/story), [`components/stage`](./components/stage)               |
| Journey documents and authoring                    | [`.quirq/journeys`](./.quirq/journeys), [`app/journey`](./app/journey), [`app/editor`](./app/editor)                                                         |
| Measurement kit and workspace dashboard            | [`lib/quirq`](./lib/quirq), [`app/dashboard`](./app/dashboard)                                                                                               |

The interface follows shadcn New York composition, Radix interaction behavior and
Lucide icons, adapted from the existing
[`xo-swarm` component source](https://github.com/sharmasuraj0123/xo-swarm). Quirq's
theme and canonical brand assets remain its own. See the
[design system](./docs/design-system.md) for the component and token contracts.

Static marketing pages compose normal DOM sections and screenshots. Only routes
that mount `StagePage` run the scroll registry and optional WebGL scene. The
homepage does not mount it. Staged stories share one persistent glass form across
their beats, driven by a resolved choreography track; see the
[animation guide](./docs/animation.md).

## Commands

| Command                             | Purpose                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`                          | Local development server                                                    |
| `pnpm build` / `pnpm start`         | Production build / server                                                   |
| `pnpm check`                        | Lint, types, tests, unused-code analysis and formatting                     |
| `pnpm lint`                         | ESLint with zero warnings                                                   |
| `pnpm typecheck`                    | TypeScript without emitting files                                           |
| `pnpm test`                         | Node tests for measurement, workspace behavior and the install bootstrap    |
| `pnpm check:unused`                 | Knip analysis of files, exports and dependencies                            |
| `pnpm format:check` / `pnpm format` | Check / apply Prettier formatting                                           |
| `pnpm quirq`                        | Reference CLI usage; append `demo`, `begin`, `settle`, `report` or `verify` |
| `pnpm sample-ledger`                | Regenerate the scripted reference ledger                                    |
| `pnpm git-journey`                  | Generate a journey document from Git history                                |

CI uses Node 22 and the pinned pnpm version, installs the frozen lockfile, then runs
`pnpm check` and `pnpm build`. The workflow is
[`.github/workflows/quality.yml`](./.github/workflows/quality.yml).

ESLint stays at **9.39.5**: the Next.js 16.2.11 lint stack has plugin peer
dependencies incompatible with ESLint 10. This is a tooling compatibility pin;
keep the framework and lint configuration aligned when deliberately upgrading.

## Maintenance map

- Review [brand strategy and decisions](./docs/brand-strategy.md) before changing
  positioning, pricing presentation or page structure. It separates owner
  direction, verified facts, recommended strategy and unresolved commercial
  details. Its approved website direction is now implemented; unresolved commercial facts
  and longer-term product recommendations remain explicitly identified.
- Read [AGENTS.md](./AGENTS.md) before editing; it covers authoring modes, canonical
  types, journey validation, accessibility and the staged-engine contracts.
- Use the [design system](./docs/design-system.md) for shared UI. New components
  need a current consumer; route-local layouts should consume the shared tokens.
- Use actual product media and canonical logos. Check the
  [product evidence](./docs/product-evidence.md) before changing capability or
  deployment copy. Do not invent screenshots, measurements, integrations,
  customer claims or unverified cloud prices.
- Always preserve the homepage's **Trusted by** section and its original eight
  brands. Its source is the original `FrameOneHome`, not the supported-agent
  rail. See the [evidence record](./docs/product-evidence.md#trusted-by-provenance)
  before changing its membership.
- For scroll or choreography changes, capture and compare the relevant route and
  viewport using the [golden workflow](./docs/animation.md#golden-verification).
  Historical captures in `docs/goldens` are not baselines for the current homepage.
- Review the [dead-code audit](./docs/dead-code-audit.md) before deleting files.
  Next routes, filesystem-loaded journeys, scripts and published public URLs may
  have no ordinary import reference. Keep `knip.json` entrypoints accurate.
- The [measurement kit guide](./docs/quirq-kit.md) distinguishes the reference CLI,
  browser demo, local workspace telemetry and product installer. `/api/quirq-state`
  reads local state in development; `QUIRQ_DIR` explicitly enables a chosen state
  directory in production. Journey writes remain development-only.

The [whitepaper](https://quirq.ai/whitepaper) documents the measurement model;
the [machine-readable site map](./public/llm.txt) points to the product, enterprise
and research pages.
`/quirq-whitepaper.pdf` redirects to `/whitepaper/pdf`; preserve published URLs
when changing their implementation.
