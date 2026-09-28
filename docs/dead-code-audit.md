# Dead-code audit

Date: 21 September 2026. Scope: the current Quirq Next.js site after the homepage moved to real product captures. This records a bounded cleanup; it is not a claim that every exported symbol is unused unless referenced by the homepage.

## Method

- Built an import graph using the installed TypeScript parser, including static imports, re-exports and literal dynamic imports.
- Treated every App Router page, layout and route handler as an independent entrypoint, whether it appears in navigation or not.
- Included Next/PostCSS configuration, package scripts, the CLI, and both Node test files as entrypoints.
- Inspected filesystem-loaded journeys, generated research journeys, runtime data, declarations, documentation examples, CSS URLs and dynamically constructed writing-image paths separately.
- Verified named exports with TypeScript symbol references, then checked callsites before removing them.
- Before deleting any asset, searched all retained source, CSS, JSON, Markdown, Python and text files for its filename. The only remaining `home-v9` image reference was the products page's `feature-burst.png`.

## Result

| Category                          | Removed | Original bytes |
| --------------------------------- | ------: | -------------: |
| Unreachable source and CSS files  |      29 |        306,006 |
| Unreferenced legacy visual assets |      45 |      4,213,330 |
| Obsolete source archive           |       1 |      5,627,670 |
| Total whole files                 |      75 |     10,147,006 |

These figures exclude focused edits inside retained files and newly created replacement files. They include the subsequent README-banner and obsolete-archive deletions. No dependency was removed: every pre-existing runtime dependency had a reachable consumer.

## Deleted source and CSS

The old `components/beats` files had no imports. The old home sections were either unimported or imported only by another unreachable old home section. `frame-one-home-interactions.tsx` had no importer; it alone referenced its 2,374-line stylesheet. Both legacy `beats.tsx` files had been superseded by `StoryBeat` plus `story.ts` in their existing routes. `instance-panel.tsx` had no importer; the current dashboard uses `dashboard.tsx` and `charts.tsx`. `home-stage-profile.tsx` was unimported. `loop-cta.tsx` was used only by deleted beats.

```text
app/dashboard/instance-panel.tsx
app/dynamic/beats.tsx
app/how-it-works/beats.tsx
components/beats/business-impact.tsx
components/beats/consumption.tsx
components/beats/delivery.tsx
components/beats/ecosystem.tsx
components/beats/hero.tsx
components/beats/invite.tsx
components/beats/ledger.tsx
components/beats/onboarding.tsx
components/beats/quirq-collection.tsx
components/beats/space-showcase.tsx
components/home/definition.tsx
components/home/feature-visuals.tsx
components/home/features.tsx
components/home/frame-one-home-interactions.tsx
components/home/frame-one-home-responsive.module.css
components/home/hero.tsx
components/home/home-footer.tsx
components/home/install.tsx
components/home/layers.tsx
components/home/partner-logos.tsx
components/home/roi.tsx
components/home/shell.tsx
components/home/workflow.tsx
components/home/works-with.tsx
components/stage/home-stage-profile.tsx
components/ui/loop-cta.tsx
```

## Deleted assets

The 44 entries below lived under `public/assets/home-v9/`. They were export variants, decorative art, old screenshots or logo files with no retained runtime, data or static-document reference after removing the unreachable consumers. Active brand components carry their own source-attributed SVG paths.

```text
cost-card-art.png
definition-glow.png
dynamic-card-art.png
dynamic-card-art.svg
efficiency-bars.png
efficiency-visual-figma.png
hero-art.png
hero-wordmark.png
hero-wordmark.svg
install-agents.png
launcher-claude.svg
launcher-cursor.svg
launcher-deepseek.svg
launcher-openai.svg
layers-agent-stack.webp
layers-background.png
layers-hardware.png
layers-rail.png
logo-aws.png
logo-aws.svg
logo-google.png
logo-google.svg
logo-magicpath.png
logo-nevermined.png
logo-nevermined.svg
logo-okx.png
logo-okx.svg
logo-openai.png
logo-openai.svg
logo-shodai.png
logo-shopify.png
logo-shopify.svg
mark-install.svg
production-timeline.png
roi-visual.png
runtime-visual-figma.png
runtime-visual.png
security-visual-figma.png
security-visual-figma.svg
security-visual.svg
social-instagram.svg
social-x.svg
wordmark-footer.svg
workflow-visual.png
```

The later README rewrite removed the last reference to `public/assets/readme-banner.png`. That obsolete decorative banner was also deleted (1,305,696 bytes), bringing the asset total to 45 files.

Public-path consideration: these asset URLs will no longer be served after deployment. Repository references were checked; unknown external hotlinks cannot be established from source. Document endpoints, the canonical brand asset and active image URLs remain. Git retains the removed assets if a documented external consumer is later identified.

## Deleted archive

`_to_delete/websrc.tgz` was a tracked 5,627,670-byte snapshot of the older source,
including legacy homepage sections and beats removed by this cleanup. Its archive
listing was inspected, and no code, script or documentation consumer remained
outside this audit. It was removed along with its empty containing directory.
Git retains the snapshot if that historical source is needed.

## Focused changes in retained files

- `lib/prose.ts`: removed uncalled `headingId`.
- `lib/research-journey.ts`: removed uncalled `splitTitle` and `researchJourneys`, plus the resulting unused `POSTS` import. Kept the shared builder, slug resolution, validation and all actual research-to-journey behavior.
- `components/ui/brand-icons.tsx`: removed the old unused `AGENTS` array and its unused-only icons: `AppleIcon`, `IotDevicesIcon`, `DevinIcon`, `ManusIcon`, `HermesIcon`, `NeightnIcon`, `DeepseekIcon`, `McpIcon`. Kept all icons used by navigation, current homepage, agent launcher and social links.
- `components/ui/glass.tsx`: removed unused `GlassHole` and its circle-only mask branch. Registration now tracks the same active text elements in a set. Text measurement, mask rendering, resize behavior and entrance handling remain.
- `app/editor/editor.tsx`: removed unused `ResolvedLeaf` type import.
- `lib/quirq/instance.ts`: a follow-up audit removed the unconsumed instance payload types, probe client, connection/storage constants and health derivation. Only the three formatting helpers imported by the current dashboard and charts remain. Their implementations are unchanged; `/api/instance` remains a public route.
- `lib/spectrum.ts`: removed the unused `BEATS` metadata and `Beat` type; `SPECTRUM` remains in use.
- `lib/quirq/session.mjs` and its declaration: removed the unused `SESSION_KEY` public alias; internal storage behavior remains.
- `lib/quirq/workspace.mjs` and its declaration: removed the unused `WORK_STEPS` export; the active demo behavior remains.

The main implementation owner also removed the unused `Mark` primitive and global selectors `spectrum-text`, `dot-aperture`, `plate-hero`, `plate-band`, `plate-top`, `plate-veil`, `hero-drift`, `focus-on-ink`, `research-glow` and `.cta-bloom`, including their unused keyframes/reduced-motion overrides.

## Intentionally retained

- Every App Router entrypoint, including developer tools and API handlers. Missing navigation links do not make a route dead.
- `components/stage`, `StagePage`, scroll runtime, choreography, golden captures, scene shaders and `public/assets/mobius.jpg`: live consumers remain on explanatory, demo and editor routes.
- `.quirq/journeys/*.json`: the journey API lists this directory at runtime; definitions do not need static imports. Saved recordings remain untouched.
- `scripts/build-git-journey.mjs`, `scripts/build-sample-ledger.mjs`, `lib/quirq/cli.mjs`, engine modules, tests and declarations: maintained commands and test entrypoints.
- `lib/quirq/sample-ledger.json`: reference evidence generated by the explicit `sample-ledger` command. The current dashboard reads workspace telemetry; the kit guide now states that distinction.
- `public/llm.txt`, `app/install/route.ts`, the whitepaper route and PDF, plus compatibility redirects: published static/document endpoints.
- Canonical `public/assets/quirq-logo.svg`, favicon, Apple icon, OG art, the active Space captures, Machine Speed hero, and research images: retained consumers exist.
- All writing images: `app/writing/data.ts` stores stems; writing pages construct `/assets/writing/${stem}.jpg`. A full-path literal search alone would incorrectly report them.
- `public/assets/home-v9/feature-burst.png` was referenced at the initial audit; the later Space-first rewrite removed its last consumer. See the follow-up below.
- `.quirq/banners.py`: source generator for maintained research illustrations.
- Semantic engine exports and type contracts, including compile-time channel exhaustiveness checks. A type used locally can still be the documented public vocabulary.

## Documentation references found before deletion

The main implementation owner was notified before deletion. The documentation pass has replaced these removed-file references and corrected the old ownership descriptions:

| Original location           | Stale reference                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `README.md:66`              | Homepage described as the old five-beat story                                                               |
| `README.md:162`             | Content owned by `components/beats/*`                                                                       |
| `README.md:218` and `:219`  | Example imports of deleted `Hero` and `Delivery`                                                            |
| `README.md:798`             | Old homepage component directory                                                                            |
| `AGENTS.md:313` and `:1131` | Deleted beats directory called canonical                                                                    |
| `docs/animation.md:26`      | Old beat ownership path                                                                                     |
| `docs/quirq-kit.md:153`     | Legacy instance payload/client/health helper description; the module now provides dashboard formatting only |

These are original line numbers, not permanent anchors. The active `app/what-is-quirq/beats.tsx` and `app/beats/beats.tsx` remain valid composed-beat examples; `components/home/home-page.tsx` is the current marketing-home composition. The guide now distinguishes that static page from staged stories, and `docs/animation.md` explains the limits of historical homepage goldens.

## Verification

After this scoped cleanup:

- `tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` passed.
- All 34 existing Node tests passed.
- No route, script, journey or dependency was removed.
- The final combined production build and browser checks belong to the integration pass after concurrent theme/component work settles.

The agent handoff and install controls were subsequently migrated to shared shadcn components. `OpenIn` now uses the four consumed DropdownMenu exports, adapted from xo-swarm's Radix implementation (`@radix-ui/react-dropdown-menu` 2.1.16). Its manual portal, anchor measurement, global event listeners and focus-management code were removed. All target URL expressions and the handoff prompt are unchanged. A native no-JavaScript disclosure retains every handoff link. `InstallCommand` uses the shared Button with Lucide copy/check icons; the copied text and live status announcement are unchanged. Scoped ESLint and TypeScript checks passed, and AST comparisons verified the preserved constants and formatter bodies against the original source.

## Ongoing check

`pnpm check:unused` runs Knip with its automatic Next.js plugin so route conventions remain entrypoints. `knip.json` adds explicit Node test/CLI and global CSS entries while retaining package script discovery. Do not mark all components as entries merely to silence reports. The maintained configuration includes:

```json
{
  "entry": ["lib/quirq/cli.mjs", "lib/quirq/*.test.mjs", "app/globals.css"],
  "project": [
    "app/**/*.{ts,tsx,css}",
    "components/**/*.{ts,tsx,css}",
    "lib/**/*.{ts,tsx,mjs}",
    "styles/**/*.css",
    "scripts/**/*.mjs",
    "*.{ts,mjs}"
  ],
  "ignoreExportsUsedInFile": true
}
```

Retained public contracts receive narrowly documented exceptions: the channel-exhaustiveness type in `choreo-tree.ts` is marked `@public` because it verifies the complete engine channel vocabulary at compile time. Do not automatically delete raw public files based on the module graph: audit CSS URLs, metadata, Markdown and the writing catalog's constructed paths too. `pnpm check` includes lint, type checking, tests, Knip and formatting; CI also builds the production site.

Knip documents automatic route discovery in its [Next.js plugin](https://knip.dev/reference/plugins/next), script and dynamic-import roots in [Entry Files](https://knip.dev/explanations/entry-files), and the local-export setting in [Configuration](https://knip.dev/reference/configuration#ignoreexportsusedinfile). The installed version's schema remains authoritative.

## Space-first follow-up

The Space-first product rewrite removed the final consumers of these four assets.
A whole-repository filename search found only audit-document mentions; no retained
route, stylesheet, data module or document used them. Removed obsolete Cloud CSS
and the old product-tier data alongside the consumers.

| Removed asset                                |     Bytes |
| -------------------------------------------- | --------: |
| `public/assets/home-v9/feature-burst.png`    |   612,960 |
| `public/accelerate-deploy.png`               | 1,333,904 |
| `public/assets/space-ui/model-breakdown.jpg` |    48,823 |
| `public/assets/space-ui/workspace-graph.jpg` |    51,028 |

This adds 2,046,715 removed bytes and brings the whole-file cleanup to 79 files. New Projects and Sharing captures replace the older tour views; the original Sessions capture remains in use.

## Page-flow follow-up

The homepage now introduces Space, shows the existing customer logos, and leads to a free cloud start. The product page owns the detailed screenshot walkthrough and deployment comparison. With no remaining consumers, the intermediate `ProductTour`, its stylesheet, the Tabs primitive, and `@radix-ui/react-tabs` dependency were removed.

Eight original logo assets were restored byte-for-byte from the published homepage under `public/assets/trusted-by/`. The old `home-v9` paths remain removed, but these logos are intentionally retained in the new `TrustedBy` component. The earlier byte and file totals describe the initial cleanup, not the current net asset reduction. Keep the Trusted by section when revising the homepage.

## Homepage restoration follow-up

Restoring the preferred split homepage removed the only consumer of
`components/home/product-story.tsx`. Removed that component, its adjacent
`product-story.module.css` and the corresponding no-JavaScript selectors in
`app/layout.tsx`. A repository search and Knip confirmed no remaining consumers.
The shared `ProductCapture` and authentic cloud captures remain in use on the
product pages; XO's setup and commercial content remain on `/xo`.
