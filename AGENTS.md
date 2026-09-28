<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# quirq web · agent operating guide

This file is the source of truth for agents creating, generating, or changing pages in this repository. It applies to the entire repository.

The site contains static product marketing, research, interactive tools and a shared staged-story engine. Choose the page's actual purpose before choosing its renderer. The homepage uses real product screenshots and normal DOM sections; it does not mount the WebGL stage. Staged narratives reuse the existing story, registry and choreography system.

## Mission

For product positioning and page planning, also read
[`docs/brand-strategy.md`](./docs/brand-strategy.md). It records the owner's
three-offering homepage and separate product journeys alongside
recommended strategy and key decisions. Respect those status distinctions: a recommendation is not an
implemented feature, approved page redesign or verified price. Keep the strategy
and [`docs/product-evidence.md`](./docs/product-evidence.md) current as decisions
are made, instead of treating each page change as an independent brief.

Build the smallest page that communicates its purpose. For marketing, favor short, specific copy and real product media. For a staged narrative, express content through the existing story or journey contracts. Share the interface system across both.

Optimize for:

1. one shared visual and runtime architecture;
2. plain, transferable content data where possible;
3. deterministic rules that can be validated before rendering;
4. static server-rendered content with narrow client boundaries;
5. accessibility and graceful degradation;
6. exact choreography behavior on staged pages, protected by golden captures; and
7. page creation that is easy for the next agent or human to understand.

Do not optimize for one-off cleverness.

## Mandatory first steps

Before editing:

1. Run `git status --short`.
2. Treat existing modifications and untracked files as user-owned. Never overwrite or stage unrelated work.
3. Read this entire file.
4. Read the relevant current documentation under `node_modules/next/dist/docs/`.
5. Inspect the nearest existing page of the same authoring mode.
6. Read `docs/design-system.md` for interface work. For staged-story or journey work, inspect the relevant canonical types instead of inferring a schema from one example:
   - `components/story/types.ts`
   - `app/journey/defs.tsx`
   - `components/stage/choreo-tree.ts`
7. Decide the page authoring mode before creating files.
8. State any assumption that changes route behavior, generation behavior, or production data ownership.

For page and route work, the minimum Next.js reading is normally:

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Also read:

- `15-route-handlers.md` before changing `app/api/**`;
- `14-metadata-and-og-images.md` before metadata or social-image work;
- the dynamic-route API guide before adding `[segment]`;
- the installed guide for any API you are about to use.

## The first decision: what kind of page is this?

Use this decision tree:

```text
Does this page need a scroll-driven narrative scene?
├─ No → compose a server-rendered page with shared UI and focused client islands.
│  └─ A catalog item with its own URL → use a [slug] route and generateStaticParams.
└─ Yes
   ├─ Visitor choices change the next section → use a .quirq JourneyDefinition.
   ├─ Plain linear narrative → use BeatData[] and StoryBeat.
   └─ Bespoke staged interaction → compose custom React beats inside StagePage.
```

### Preferred order

For staged narratives, prefer, in order:

1. **Plain `BeatData[]`** for a normal linear narrative.
2. **A `.quirq` journey JSON** for a branching or transferable narrative.
3. **Custom React beats** only for content the generic renderer cannot express.
4. **A new rendering abstraction** only when at least two real pages need the same missing capability.

Do not create a custom component merely to change copy, alignment, rows, tiles, code, captions, links, or a glass pose. Those are already data.

## Page authoring mode 0: static marketing and product media

The current homepage is the canonical example: `app/page.tsx` exports metadata
and renders `components/home/home-page.tsx`, styled by `home-page.module.css`.
The owner approved the three-offering content on 28 September 2026. Its promise
is **Put AI to work across your business**. Flow: hero, XO Space / XO Cloud /
MachineSpeed choices, original Trusted by, separate offering journeys, then
three entry paths. Use normal server-rendered sections and real product captures.
The prior Space-first homepage and editorial draft were removed. Their preview
URLs `/draft` and `/draft/content` redirect to `/`; do not restore duplicate pages.

`/products` retains the Projects, Sessions and Git-backed Sharing walkthrough.
`/xo` retains catalog, configuration, tools, usage, subscriptions and custom
platform deployment. Use shared `ProductCapture` and `lib/product-media.ts`.
Screenshots retain truthful source/date labels and narrow-screen scrolling.

The shared header has **Spaces** (`/products`) and **Cloud** (`/xo`), each with
the canonical XO mark instead of a written XO prefix; **MachineSpeed**
(`/machinespeed`); **Resources** (Docs, Research, Writing); and **Find your path**
(`/#offerings`). Mobile uses the same destinations. Keep direct cloud pricing
access in the footer. Static sections do not need a stage or choreography IDs.

- **XO Space** is the open-source offering for developers managing company work
  from Claude Code or Codex. **XO Cloud** creates and manages autonomous AI
  employees operating 24/7. **MachineSpeed** is the human-and-AI enterprise
  delivery team. These are owner-confirmed descriptions, not measured uptime
  or universal instant-delivery guarantees. The Cloud entry keeps `TryOnXo`;
  Space links to installation/GitHub; MachineSpeed links to contact.
- The owner confirms that XO supports any agent harness and configurable
  runtime/policies. XO Enterprise offers self-hosting, connection to the
  customer's cloud and white-label deployment across multiple clouds. Present
  these as XO deployment options; do not imply that the open-source Space
  installer deploys the enterprise XO platform. One-click provisioning still
  involves choosing configuration and connecting model credentials.
- The owner also confirms XO as cloud computers for agents with preconfigured
  templates, task delegation, parallel execution and autonomous scaling. Do not
  limit its product story to hosting Space. Distinguish these capabilities from
  their unverified implementation details: the delegation layer, worker-to-machine
  mapping, scaling triggers, concurrency limits and charges. Show actual product
  behavior; do not fabricate a fleet dashboard or universal orchestration layer.
- Use the shared `TryOnXo` control from `components/ui/try-on-xo.tsx` for the
  primary action, linked directly to `APP_URL` from `lib/products.ts`. It combines
  visible “Try on” text with the authentic XO logo and has the accessible name
  “Try on XO” with a new-tab announcement. The reviewed app offers a **30-day
  trial for eligible Starter and Pro accounts**, not Business. The owner's
  22 September instruction supersedes the generic Free trial / XO Cloud pricing
  cards: show Starter **$10/month or $100/year**, Pro **$50/month or $500/year**,
  and Business **$500/month or $5,000/year**, with annual totals clearly labeled.
  Enterprise is a separate custom deployment offer. These amounts were verified
  in the local authenticated runtime at `3be532f` and are used in the local
  website preview; production billing is unverified. They are subscriptions,
  not hourly compute rates. Do not invent numerical allowances, card
  requirements, automatic charging or discounts.
- Always retain the homepage's **Trusted by** section with its original eight
  brands: OpenAI, Google, AWS, OKX, Shopify, Nevermined, Shodai and MagicPath.
  Their source is the original `FrameOneHome` in repository `HEAD`, separate from
  the supported-agent rail. Use the canonical assets and do not add brands or
  relationship claims. See `docs/product-evidence.md` for provenance.
- Use actual captures from `public/assets/space-ui` and `public/assets/xo-ui`.
  Current XO media comes from the running app captured on 22 September 2026 in
  `public/assets/xo-ui/review-2026-09-22/`; older beta-guide captures retain their
  historical attribution. Tours encoded at 4 fps from real CUA frames are edited
  step-through tours, not continuous recordings. Preserve provenance and encoding
  status in `docs/product-evidence.md` and the review report. No live provisioning
  or billing transaction was performed. Keep the accepted three-offering homepage and Quirq's gray/white style.
  Keep captions truthful about the visible screen; do not fabricate app
  interfaces, data, video, logos, testimonials or customer relationships.
- `public/assets/quirq-logo.svg` and `components/ui/quirq-logo.tsx` own the Quirq
  mark. `components/ui/xo-logo.tsx` preserves the canonical XO logo geometry,
  with a monochrome X and the original green O. Use this shared mark for both
  Spaces and Cloud navigation. Existing source-attributed agent
  icons represent supported tools, not customers.
- Keep copy brief and specific. Use native `details`/`summary` for supporting
  setup, sharing, plan and transcript detail. Keep trial eligibility, prices and
  material product boundaries visible beside their claims. Screenshots and real
  tours carry the product flow, with readable framing and narrow-screen access.
- `/products` and `/xo` use `ProductMotion` from
  `components/products/product-motion.tsx` for optional entry motion and native
  smooth hash scrolling. Pass server content as children; all content remains
  visible before hydration and without JavaScript. Respect reduced motion,
  preserve native anchors and header scroll margins, and clean up observers and
  animations. Keep this separate from the staged-story runtime and leave the
  original homepage composition unchanged.
- Reuse `Button`, `Sheet`, `DropdownMenu` and `Input` from `components/ui`.
  Radix owns interaction, focus and keyboard behavior; Lucide supplies interface
  icons. Avoid hand-built portal or focus-management substitutes.
- `styles/theme.css` owns semantic colors, fonts, radius, spacing and motion.
  CSS modules compose layouts and consume these tokens. Use `lib/utils.ts` for
  class merging. See [docs/design-system.md](./docs/design-system.md).
- The warm light product stage uses `--surface-contrast`,
  `--surface-contrast-foreground`, `--border-subtle` and `--shadow-media` within
  the shared dark system. Quirq's warm white actions remain unchanged.
- Keep native links for navigation, buttons for actions and visible keyboard
  focus. Preserve a readable no-JavaScript path for the content.

## What “dynamic” means in this repository

Do not use the word “dynamic” without identifying which mechanism is intended.

| Mechanism                    | What changes                                        | When it changes               | Canonical example         |
| ---------------------------- | --------------------------------------------------- | ----------------------------- | ------------------------- |
| Data-driven static page      | The `BeatData[]` content                            | At edit/build time            | `app/dynamic`             |
| Branching journey            | The visited node path and active choreography track | In the browser after a choice | `app/journey`             |
| Dynamic route segment        | The route param chooses one content record          | At build time or request time | `app/research/[slug]`     |
| Journey route handler        | A slug loads a JSON document from `.quirq`          | At request time               | `app/api/journeys/[slug]` |
| Live editor override         | Draft beats and keyframes replace the active track  | In the browser while editing  | `app/editor`              |
| Responsive choreography rule | A tree branch is included or pruned                 | On mount and resize           | `ChoreoNode.when`         |

These mechanisms may cooperate, but they are not interchangeable.

In particular:

- “Dynamic page” does not automatically mean request-time server rendering.
- “Generated page” does not require generating TSX.
- A `.quirq` journey is served at `/journey?j=<slug>`; it does not need a new `app/<slug>/page.tsx`.
- A catalog with SEO-distinct item URLs should use a `[slug]` route rather than query-only client loading.

## Architecture at a glance

### Staged pages: one persistent shot

The stage shell is:

```text
StagePage
├── ScrollRuntime
├── Stage
│   └── lazy Scene
│       ├── SpectrumEnv
│       ├── LightBurst
│       └── GlassForm
├── vignette
├── grain
└── main
    └── page beats
```

`StagePage` is shared by staged pages. Its `lit` and `film` props control the scene
and overlays; the scroll runtime still runs when unlit. The single global `Nav`
lives in `app/layout.tsx`, outside the stage shell. Pages supply the content and
reuse this shell. The glass stays mounted across beats within a staged page,
not across unrelated route lifetimes.

### Content-to-frame pipeline

```text
content object or custom component
  → StoryBeat or Beat
  → registerBeat({ id, index, element })
  → ScrollRuntime measures real section centres
  → viewport centre maps to fractional stage.beat
  → sampleKeyframes blends adjacent full keyframes
  → GlassForm damps pose and optics
  → LightBurst damps per-beat light
  → one mounted ribbon performs the page
```

### JSON-to-page pipeline

```text
.quirq/journeys/<slug>.json
  → GET /api/journeys/<slug>
  → validateDefinition
  → resolveDefinition
  ├── beat data → StoryBeat
  └── pose base + tweaks → full Keyframe
        → visited path → overrideLeaves
        → path becomes the live choreography track
```

### Ownership boundaries

| Layer                | Owns                                              | Must not own                                |
| -------------------- | ------------------------------------------------- | ------------------------------------------- |
| Page or story file   | Narrative content, metadata, beat order           | Frame-loop state or Three.js implementation |
| `StoryBeat`          | Generic content presentation                      | Page-specific business rules                |
| Beat registry        | Mounted section identity and order                | Copy or choreography values                 |
| Scroll runtime       | DOM measurement and scroll-to-beat mapping        | React rendering                             |
| Choreography tree    | Authored pose inheritance and conditional leaves  | Per-frame DOM work                          |
| Choreography sampler | Smooth numeric interpolation                      | Content decisions                           |
| Journey definition   | Branching content, legal edges, walk rules, poses | Executable code from JSON                   |
| Journey runtime      | Active path, trace, replay, restore               | Ad hoc schema changes                       |
| Stage                | WebGL capability and quality selection            | Narrative branching                         |
| Glass and burst      | Per-frame visual application                      | React state or page loading                 |

## Staged-engine invariants

These apply when working on the story, journey or scene engine. Static marketing
sections do not need beat registration or a glass track:

1. **One glass object remains mounted across beats.**
2. **Every staged section registers.** Use `Beat` or deliberately call `registerBeat`.
3. **IDs are stable identity.** They are not decorative labels.
4. **The hot frame path remains allocation-free and outside React state.**
5. **The camera stays fixed unless the project explicitly changes its visual grammar.**
6. **Brightness is changed through `LIGHTING`, not by independently retuning coupled call sites.**
7. **Text over the live stage carries a `GlassPool` or `TextScrim`.**
8. **The no-JavaScript, no-WebGL, and reduced-motion paths remain usable.**
9. **A generated document is validated before it affects the page.**
10. **A rules engine fails closed.** Unknown rules, nodes, poses, and targets do not render partial surprises.
11. **Refactors of scroll or choreography are golden-gated.**
12. **Do not make all of `app` a client boundary.**

## Page authoring mode 1: plain data-driven story

This is the default for a new linear stage page.

### File shape

```text
app/<slug>/
├── page.tsx
└── story.ts
```

Keep `story.ts` server-safe:

- import `BeatData` with `import type`;
- export plain serializable data;
- do not add `"use client"`;
- do not import browser-only modules;
- do not put functions, JSX, dates, maps, sets, or class instances in beat data.

### Canonical `story.ts`

```ts
import type { BeatData } from "@/components/story/types";

export const STORY: BeatData[] = [
  {
    index: 0,
    id: "example-hero",
    layout: "center",
    title: ["One clear idea,", "staged in light."],
    glass: 1,
    lede: "State the page promise in one compact paragraph.",
  },
  {
    index: 1,
    id: "example-proof",
    layout: "left",
    marker: "01 · the proof",
    title: ["Show the change,", "not the claim."],
    rows: [
      {
        title: "A concrete point.",
        note: "A precise explanation with no duplicated headline language.",
      },
    ],
  },
];
```

### Canonical `page.tsx`

```tsx
import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { StoryBeat } from "@/components/story/story-beat";
import { SiteFooter } from "@/components/ui/footer";
import { STORY } from "./story";

export const metadata: Metadata = {
  title: "Example",
  description: "A specific summary of the page.",
};

export default function Page() {
  return (
    <StagePage>
      {STORY.map((beat) => (
        <StoryBeat key={beat.id} data={beat} />
      ))}

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-black via-black/85 to-transparent"
        />
        <SiteFooter />
      </div>
    </StagePage>
  );
}
```

### Rules

- Use a unique route-prefixed ID such as `pricing-proof`, not `beat-1`.
- Indices must start at `0`, remain contiguous, and match rendered order.
- The default published choreography has five leaves. A normal data-driven page may use fewer; do not use more without supplying and testing a matching track.
- Export route metadata from the server `page.tsx`.
- Keep the page component a Server Component.
- Let the existing client `StoryBeat` boundary own animation and registration.
- Reuse the global navigation; staged pages do not need separate route detection.
- Add the footer base fade when the final pose would reduce footer contrast.

## Page authoring mode 2: custom composed React beats

Use this when a section needs structure or behavior outside `BeatData`.

Good reasons:

- interactive controls;
- a custom visualization;
- a bespoke numeric ledger;
- a hero aperture or similarly coupled stage effect;
- a layout that cannot be represented by the generic renderer.

Bad reasons:

- a different headline;
- a new row style that only one page wants;
- changing alignment;
- adding a CTA;
- applying a pose;
- avoiding the JSON or data schema.

### Rules for a custom beat

1. Use the shared `Beat` primitive.
2. Give it a stable, unique ID and correct index.
3. Use `Reveal`, `Rise`, `Marker`, `TextScrim`, `GlassPool`, `GlassText`, and `ActionLink` before inventing replacements.
4. Keep content in the DOM and the stage in the canvas; do not render copy inside WebGL.
5. Preserve semantic headings and keyboard behavior.
6. If the section is deliberately an interlude, do not give it a beat index and document why the glass should glide through it.
7. If a custom section cannot use `Beat`, register and unregister its element directly with `registerBeat`.

`app/what-is-quirq/beats.tsx` and `app/beats/beats.tsx` are active examples.

## Page authoring mode 3: `.quirq` journey JSON

Use this when:

- visitor choices change the next section;
- the entire page should travel as one JSON object;
- non-code authoring or generation is important;
- the same renderer and scene vocabulary are sufficient; or
- a generated linear page may later gain forks.

### Location and URL

```text
.quirq/journeys/<slug>.json
/journey?j=<slug>
```

The filename and `slug` must match. Use lowercase kebab-case with at most 64 characters.

### Current schema

```ts
type JourneyDefinition = {
  slug: string;
  name: string;
  rules: {
    start: string;
    maxDepth?: number;
    allowRewind?: boolean;
    allowReplay?: boolean;
  };
  nodes: Record<
    string,
    {
      short: string;
      pose: {
        base: "centre" | "drained" | "flooded" | "recede" | "finale";
        tweaks?: Partial<Keyframe>;
      };
      beat: Omit<BeatData, "index" | "id">;
      prompt?: string;
      choices?: { label: string; to: string }[];
    }
  >;
  recording?: JourneyRecording;
};
```

This is descriptive. The imported types in `app/journey/defs.tsx` remain canonical.

### Minimal valid journey

```json
{
  "slug": "generated-story",
  "name": "Generated story",
  "rules": {
    "start": "intro",
    "maxDepth": 2,
    "allowRewind": true,
    "allowReplay": true
  },
  "nodes": {
    "intro": {
      "short": "start",
      "pose": {
        "base": "centre"
      },
      "beat": {
        "layout": "center",
        "title": ["A generated page,", "one valid object."],
        "glass": 1,
        "lede": "The renderer owns the layout; the document owns the story."
      },
      "prompt": "Continue?",
      "choices": [
        {
          "label": "Show the ending",
          "to": "ending"
        }
      ]
    },
    "ending": {
      "short": "ending",
      "pose": {
        "base": "finale"
      },
      "beat": {
        "layout": "center",
        "title": ["End with", "a clear action."],
        "glass": 1,
        "links": [
          {
            "href": "/",
            "label": "Return home"
          }
        ]
      }
    }
  }
}
```

### Journey validation rules

A generator must ensure:

1. the document is an object;
2. `slug` matches `^[a-z0-9-]{1,64}$`;
3. `name` is non-empty;
4. `nodes` is a non-empty object;
5. `rules.start` names an existing node;
6. every node has `short`;
7. every node has a two-line `beat.title`;
8. every node uses a known pose;
9. every choice target exists;
10. every intended ending has no choices;
11. `maxDepth` is at least the longest intended legal path, unless truncation is deliberate;
12. IDs remain stable after publication because URLs, traces, and recordings contain them; and
13. authored files omit `recording` unless the task explicitly concerns recorded state.

The current validator enforces the structural subset in `validateDefinition`. A generator should enforce the stricter authoring rules above before calling it.

### Journey runtime behavior

- `resolveDefinition` applies defaults and converts poses to complete keyframes.
- The active path begins at `rules.start`.
- The visited path is the active track: one resolved leaf per visited node.
- A choice appends one legal target.
- Rewind removes path state only when allowed.
- Replay performs recorded full-path snapshots only when allowed.
- A node without choices, or a path at `maxDepth`, is an ending.
- Non-journey CTA links open in a new tab during a walk.
- Shared URL paths are validated against actual graph edges.
- Invalid definitions and paths are refused with a note rather than crashing.

### Derived journeys

A journey document does not have to be authored by hand. `lib/research-journey.ts`
derives one from a research note: the note's `h2` headings become chapters, and
each chapter becomes a beat with a two-line title, a compact lede, and at most
one detail structure taken from what the chapter contains.

**Shape follows length.** Six sections or fewer derive a _scroll_ document:
beats in order, no prompts, no choices, `rules: { start }` and nothing else.
That is the same shape `app/how-it-works/story.ts` ships by hand, expressed as
JSON. Only a note longer than six sections earns a graph, with entry points at
the opening and an exit at every chapter. Branching a four-section note would
only ask the reader to choose what to miss, and a document nobody forks should
not carry the vocabulary of forking.

Rules for any derivation of this kind:

- **Derive, never write.** Every line of copy in the output already exists in
  the source. A generated document has no standing to make a claim of its own.
- **Say what was cut.** A beat that condenses a longer list or table says so in
  its caption. Silent truncation reads as the whole thing.
- **Validate in the builder, not at the render.** `buildResearchJourney` throws
  on an invalid document, so a derivation bug fails the build instead of
  shipping a route the engine would refuse.
- **Deterministic ids.** Node ids come from headings, not positions, because
  shared trail URLs contain them.
- **One builder, every consumer.** The page and the API call the same function,
  so `/journey/read/<slug>` and `GET /api/journeys/research-<slug>` cannot
  disagree.
- **Derived slugs are not files.** `research-*` is served from the note on
  every read; the write routes refuse those slugs so `.quirq` never holds a
  stale copy.
- **Rotate poses, do not invent narrative.** A derived document cannot read
  intent, so the pose rotation carries the rhythm and the copy carries the
  meaning. Document the rotation rather than pretending it is authored.

### Figures

`Figure` in `components/story/types.ts` is a closed union of measured visuals,
carried in beat data and therefore in journey JSON like any other field.
`components/story/figure.tsx` renders it; `validateFigure` in
`app/journey/defs.tsx` refuses a shape the renderer cannot read, so a bad
figure in a pasted document is a printed reason and never a half-drawn chart.

Two kinds, two jobs:

- `bars` compares a few series over named categories. Built from the DOM, not
  SVG, so labels stay real text at the site's scale, reflow on a phone, and
  survive with no JavaScript.
- `marks` plots one record per mark with optional weight and group. This is the
  shape a commit field, a run field, or any per-record dataset takes.

Rules:

- **Colour is value.** A series or group measuring delivered outcome takes the
  spectrum; anything counting consumption (tokens, calls, files, minutes) stays
  monochrome. Monochrome is the default when the unit does not say.
- **Percentages scale to 100**, not to the tallest bar present.
- **Zero draws nothing.** A minimum-width sliver where the source measured zero
  is a false reading.
- **Keep the numbers in the DOM.** Every figure carries a `sr-only` summary
  with the same values the visual shows.
- **Never import from a `"use client"` module here.** `figure.tsx` renders
  inside server components; calling a client export such as `cn` from the
  server throws at render time.

### Generating figures from content

`lib/chart-figure.ts` reads a research note's chart paragraph and returns a
figure spec: the notes carry their numbers in the same sentence that describes
the chart, so the visual is generated from the note rather than drawn beside
it. Both readings use it, the article and the derived journey.

It fails closed, and that is the whole discipline: a paragraph describing a
stack diagram or a scatter whose points were never listed returns null and the
prose stands unchanged. Never invent a datum to complete a picture. Of the
notes' chart paragraphs today, the ones whose grammar is a labelled series
parse; the rest stay prose.

### Data as a journey

`scripts/build-git-journey.mjs` is the general case: it reads `git log` and
writes a journey document into `.quirq/journeys`, which the API then serves and
the engine walks with no special casing. One mark per commit, time across,
subsystem up the lanes, churn as weight, and the short hash in the mark's
label.

```bash
pnpm git-journey                                    # this app's own history
node scripts/build-git-journey.mjs --repo=../.. --slug=git-workspace
```

When adding another data source, follow the same shape: read the source, emit a
`JourneyDefinition` with figure specs, validate it, and stop. The renderer, the
engine, and the validator are already there, and a source-specific page is a
sign the mapping belongs in a builder instead.

Encode what the data actually varies by rather than what would look best: the
git builder colours by scope prefix, then by author, then by subsystem,
whichever is the first that has more than one value, and its caption names the
dimension it landed on.

### The loading engine

`components/journey/engine.tsx` takes one document, however it arrives (a prop,
a slug fetched from the API, pasted text, an opened file), validates it through
`loadDefinition`, and shows it. It renders beats, the trail, and the choices,
and deliberately nothing else: traces, recordings, replay and the `.quirq`
library belong to the studio at `/journey`. Both sit on the `defs.tsx` contract,
so a document that walks in one walks in the other.

The document decides which of two readings it gets, and no flag is involved:

- **no node offers a choice** → a scroll page. Every node renders as a beat in
  document order, and the whole document is the choreography track, so the
  glass performs it top to bottom. No trail, no prompts.
- **any node offers a choice** → a walk. One beat per visited node, the trail
  rewinds, and the chosen path is the track.

Node order in the JSON is therefore load-bearing for a scroll document. Keep
the opening node first.

Use the engine for any new surface that shows a journey. Do not add a third
walk implementation, and do not grow this one into a second studio.

### Journey persistence

- Reads are provided by `app/api/journeys`.
- Definition and recording writes are development-only.
- Cross-origin browser writes are refused.
- Writes are atomic: temporary file, then rename.
- Production filesystems are not an authoring database.
- To publish a journey, commit the JSON and deploy it with the application.
- Do not remove the development-only guard to make production editing “work.”

## Page authoring mode 4: generated `[slug]` routes

Use this for a content collection where every record needs:

- its own path;
- its own metadata;
- indexing and sharing;
- direct server rendering; and
- build-time generation when the record set is known.

The research route is the canonical example.

### Next.js 16 pattern

```tsx
export function generateStaticParams() {
  return ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getItem((await params).slug);
  return item ? { title: item.title, description: item.description } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const item = getItem((await params).slug);
  if (!item) notFound();
  return <Article item={item} />;
}
```

Rules:

- `params` and `searchParams` are promises in this Next.js version.
- Await them.
- Use `notFound()` for unknown records.
- Keep metadata in a Server Component.
- Prefer direct server reads over calling this app’s own route handler from a Server Component.
- Use route handlers when a real HTTP boundary is needed.
- Do not place `page.tsx` and `route.ts` in the same route segment.

### Listing surfaces for a catalog

A catalog usually needs more than one listing: a front page, numbered pages,
and one archive per category. Build those as static sibling segments, not as
query strings, so every listing prerenders and keeps its own indexable URL.

The research route is the canonical example:

```text
app/research/page.tsx                → front page of the stream
app/research/page/[page]/page.tsx    → numbered pages, from two upward
app/research/topic/[topic]/page.tsx  → one archive per topic
app/research/[slug]/page.tsx         → one record
```

Rules:

- Resolve first, render second. One resolver in the data module (`resolveIndex`)
  turns a request into a resolved view or `null`; the routes are thin and
  `notFound()` on `null`. Unknown categories, page one under a second URL, and
  pages past the end all fail closed.
- One view component renders every listing, so the surfaces cannot drift apart.
- Do not paginate with `searchParams`: it opts the listing into request-time
  rendering and gives one listing several URLs.
- A static sibling segment shadows the `[slug]` route, so every listing segment
  is a reserved record slug. Record them next to the data (`page`, `topic`).
- Keep ordinals stable. A record's number is its position in the source
  collection, not its position on the page being rendered.
- Label controls by position, not by date, unless the collection is genuinely
  ordered by date.

## The story renderer contract

`StoryBeat` understands this vocabulary:

| Field       | Requirement       | Generation rule                                        |
| ----------- | ----------------- | ------------------------------------------------------ |
| `index`     | Runtime page only | Contiguous render order. Omitted inside journey JSON.  |
| `id`        | Runtime page only | Unique, stable, semantic. Omitted inside journey JSON. |
| `layout`    | Required          | `center`, `left`, or `right`.                          |
| `title`     | Required          | Exactly two intentional lines.                         |
| `glass`     | Optional          | `0` for first title line or `1` for second.            |
| `marker`    | Optional          | Short mono chapter label, usually `01 · phrase`.       |
| `lede`      | Optional          | One compact supporting paragraph.                      |
| `rows`      | Optional          | Open numbered title/note rows.                         |
| `panelRows` | Optional          | Numbered title/note rows in one panel.                 |
| `tiles`     | Optional          | Label/body tiles.                                      |
| `code`      | Optional          | One preformatted string.                               |
| `caption`   | Optional          | Small mono qualifier or source note.                   |
| `links`     | Optional          | Calls to action with `solid` or `ghost` tone.          |

### Content-generation rules

When generating copy:

1. Give every beat one job.
2. Use the first beat for the promise, middle beats for evidence or mechanism, and the final beat for synthesis or action.
3. Write exactly two headline lines; do not rely on automatic wrapping to create the intended rhythm.
4. Keep each headline line compact enough for the display scale.
5. Avoid repeating the title in the lede.
6. Prefer concrete nouns and verbs over generic technology claims.
7. Use one dominant detail structure per beat: `rows`, `panelRows`, or `tiles`.
8. A caption qualifies evidence; it must not carry the main claim.
9. Use `ghost` for the secondary CTA.
10. Preserve factual qualifiers such as “illustrative.”
11. Do not imply supported ecosystems are customers.
12. Keep external claims traceable to repository content or user-provided sources.
13. Do not generate fake metrics, customer names, integrations, or testimonials.

### Layout-generation rules

- `center`: openings, major reveals, conclusions.
- `left`: denser explanation while the form can occupy the right.
- `right`: contrast beat while the form can occupy the left.
- Alternate left and right when it helps the continuous shot, but do not alternate mechanically.
- Keep a beat near one viewport of narrative weight.
- Interludes may be shorter or longer but must deliberately remain unregistered.
- Fixed complete grids are preferred. Do not slice visual items at viewport edges.

## Scene generation and pose rules

### Pose presets

| Preset    | Narrative use                            |
| --------- | ---------------------------------------- |
| `centre`  | Neutral opening or reset                 |
| `drained` | Cost, failure, doubt, constraint         |
| `flooded` | Value, proof, color, breakthrough        |
| `recede`  | Data-heavy beat where copy must dominate |
| `finale`  | Closing synthesis and action             |

Use a preset first. Add `tweaks` only for a narrative reason.

### Fourteen channels

```text
position: x, y, z, scale
attitude: spin, tiltX, tiltZ
optics:   chroma, thickness, distortion, aniso, rough, ior
light:    burst
```

Meanings:

- `x`, `y`: subject placement;
- `z`: apparent dolly;
- `scale`: subject size;
- `spin`: Y rotation rate, not an absolute angle;
- `tiltX`, `tiltZ`: absolute attitude targets;
- `chroma`: spectral channel separation;
- `thickness`: refraction depth;
- `distortion`: surface distortion;
- `aniso`: directional blur;
- `rough`: surface roughness;
- `ior`: index of refraction;
- `burst`: local light-source level before global gain.

Rules:

1. Do not write a full `tweaks` object when a named preset already matches.
2. Keep generated values inside the editor ranges unless a task explicitly explores outside them.
3. Use `chroma` and `burst` together with restraint; clipping the core destroys the glass read.
4. Use positive `z` and larger scale for approach; negative `z` and smaller scale for recession.
5. Remember narrow screens automatically collapse `x` and reduce fit.
6. Test the pose while copy is present, not against an empty canvas.
7. Do not adjust the fixed camera to compensate for one bad pose.

## Existing rule engines

There are three different existing rule systems.

### 1. Walk rules

Location: `JourneyDefinition.rules`.

They govern:

- opening node;
- maximum path depth;
- rewind permission; and
- replay permission.

These rules affect navigation state, not content validity or responsive layout.

### 2. Graph edge rules

Location: each node’s `choices`.

They define legal next nodes. A share link or replay path cannot invent an edge.

### 3. Choreography inclusion rules

Location: `ChoreoNode.when`.

They receive an explicit `TrackContext`, currently `{ width }`, and decide whether a node and its subtree participates in the resolved track.

These run on mount and resize, not per frame.

Do not encode one kind of rule inside another. For example:

- do not use `maxDepth` as a responsive layout rule;
- do not use a pose tweak to hide content;
- do not make a graph choice depend on an implicit DOM query;
- do not put executable predicates inside journey JSON.

## Rules-engine architecture for future generation

When adding more generation rules, extend the system as a pipeline:

```text
raw blueprint
  → parse
  → normalize defaults
  → validate structure
  → evaluate deterministic rules against explicit context
  → resolve to current canonical types
  → render with existing components
  → emit diagnostics
```

Never let rendering be the first place malformed generation data is discovered.

### Rule-design principles

1. **Typed:** define the rule shape once.
2. **Declarative:** JSON describes conditions and effects; it does not carry JavaScript.
3. **Deterministic:** the same blueprint and context produce the same resolved page.
4. **Pure:** rule evaluation does not write files, touch the DOM, or mutate global runtime state.
5. **Explicit context:** audience, viewport class, flags, and locale are passed in.
6. **Ordered:** precedence is documented and stable.
7. **Fail closed:** unknown condition or effect types are rejected.
8. **Diagnosable:** return rule IDs and reasons, not only the final object.
9. **Versioned:** add `schemaVersion` before persistent generation blueprints gain incompatible changes.
10. **Resolved once:** evaluate structural rules before render or on explicit context change, never inside the per-frame sampler.

### Recommended precedence

Apply rules in this order:

1. repository invariants;
2. schema defaults;
3. global generation policy;
4. page-level policy;
5. matching contextual rules;
6. explicit beat or node values;
7. visual pose tweaks;
8. final validation.

An explicit value may override a default. It may not override a repository invariant.

### Safe declarative condition model

If persistent generation rules are requested, prefer a constrained union:

```ts
type GenerationContext = {
  viewport: "compact" | "wide";
  audience?: string;
  locale?: string;
  flags: Record<string, boolean>;
};

type Condition =
  | { kind: "viewport"; is: GenerationContext["viewport"] }
  | { kind: "audience"; is: string }
  | { kind: "locale"; is: string }
  | { kind: "flag"; name: string; equals: boolean }
  | { kind: "all"; conditions: Condition[] }
  | { kind: "any"; conditions: Condition[] }
  | { kind: "not"; condition: Condition };
```

Effects should also be a closed union, for example:

```ts
type GenerationEffect =
  | { kind: "include-node"; id: string }
  | { kind: "exclude-node"; id: string }
  | { kind: "set-start"; id: string }
  | { kind: "set-pose"; id: string; pose: PoseSpec }
  | { kind: "set-layout"; id: string; layout: BeatData["layout"] };
```

Do not use:

- `eval`;
- `new Function`;
- arbitrary property paths from JSON;
- executable JavaScript strings;
- hidden reads from `window`, cookies, or the DOM;
- user-authored regular expressions without limits; or
- effects that directly mutate the renderer.

This model is a recommended extension, not an active journey schema. Do not add these keys to `.quirq` files until parsing, types, validation, resolution, tests, and migration behavior are implemented together.

### Recommended generation blueprint

If the task is to build a general page-generation engine, normalize every input into a versioned blueprint before producing `BeatData` or `JourneyDefinition`:

```ts
type PageBlueprint = {
  schemaVersion: 1;
  kind: "linear" | "journey";
  slug: string;
  metadata: {
    title: string;
    description: string;
  };
  policy?: {
    minBeats?: number;
    maxBeats?: number;
    requireCta?: boolean;
    allowedLayouts?: BeatData["layout"][];
  };
  // Use exactly one based on kind.
  beats?: Array<Omit<BeatData, "index" | "id"> & { id: string; pose: PoseSpec }>;
  journey?: JourneyDefinition;
};
```

Implementation requirements:

1. Keep the blueprint module server-safe.
2. Separate `parseBlueprint`, `normalizeBlueprint`, `validateBlueprint`, and `resolveBlueprint`.
3. Resolve linear blueprints to `BeatData[]` plus `ResolvedLeaf[]`.
4. Resolve journey blueprints through the existing journey resolver.
5. Reuse `StoryBeat`; do not generate JSX strings.
6. Return structured diagnostics:

```ts
type Diagnostic = {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
};
```

7. Reject output when any error diagnostic exists.
8. Add fixture blueprints and tests before connecting external or AI-generated input.
9. Preserve stable IDs across regeneration.
10. Never silently delete user-authored nodes or recordings.

Do not create this engine preemptively during an ordinary page request. Use it only when the user asks for a reusable generator or when multiple real consumers justify it.

## Generated-page planning contract

Before creating files, write down or infer this plan:

```text
route:
page goal:
audience:
authoring mode:
data source:
static, client-grown, or request-time:
beat/node IDs:
narrative sequence:
choice graph, if any:
pose sequence:
metadata:
primary and secondary CTA:
navigation change:
validation:
```

If a missing answer would materially change architecture or create unsafe production behavior, ask. Otherwise choose the simplest reasonable default and proceed.

## Next.js 16 rules for this repository

1. Use App Router only.
2. Pages and layouts are Server Components by default.
3. Add `"use client"` only at the narrow interactive boundary.
4. A client component cannot be `async`.
5. Server-to-client props must be serializable.
6. `params`, `searchParams`, `cookies()`, and `headers()` are async.
7. Use `next/navigation`, not `next/router`.
8. Use metadata exports, not `next/head`.
9. Use `generateStaticParams` for known dynamic records.
10. Use route handlers for real HTTP boundaries.
11. Do not put `route.ts` and `page.tsx` in the same segment.
12. Route handlers use Web `Request` and `Response`; they do not render React.
13. Use the default Node.js runtime for the filesystem-backed journey APIs.
14. Do not introduce `middleware.ts`; Next.js 16 uses `proxy.ts`.
15. Do not use `getStaticProps`, `getServerSideProps`, or `next export`.
16. Do not turn the root layout into a client component to solve a local interaction.
17. Keep Three.js imports behind the existing lazy `scene.tsx` boundary.
18. Do not read the app’s own HTTP API from a Server Component when direct module or filesystem access is appropriate.

The current `/journey` route intentionally restores `?j=` and `?t=` after hydration inside the client journey runtime. Moving those query params to the server page would opt the route into request-time rendering and change its initial/default behavior. Do not make that change casually.

## Navigation and metadata rules

The shared header uses direct Spaces, Cloud and MachineSpeed links, a Resources
dropdown and Find your path. Spaces and Cloud pair the canonical XO logo with
those short labels. Use the same destinations in the mobile sheet. Preserve
current-route state, keyboard access, Escape dismissal and sensible focus on
navigation or breakpoint changes. Existing product URLs remain unchanged.
Whitepaper stays within Research.

For every new route:

1. Add specific `Metadata` in its server page.
2. Use the root title template; do not repeat `· quirq` manually.
3. Write a real description, not a copy of the title.
4. Add the route to navigation only when it belongs in the global information architecture.
5. Reuse the global navigation from the root layout; do not mount a second navbar.
6. Use `Link` for internal navigation unless journey behavior intentionally opens away from the walk.
7. Preserve PDF new-tab behavior.
8. Do not claim a page is indexable if it is an internal tool; the editor sets `robots.index` to false.

## Performance rules

- Keep `three`, `@react-three/fiber`, and `@react-three/drei` out of server content modules.
- Do not import the scene directly from a page.
- Do not route frame values through React state.
- Do not allocate arrays or objects in `useFrame` without a measured reason.
- Reuse the static `CHANNELS` list.
- Dispose created Three.js resources.
- Preserve automatic quality selection unless profiling justifies a change.
- Preserve the no-WebGL still fallback.
- Parallelize independent server reads.
- Avoid client fetch waterfalls when a Server Component can pass initial data.

## Accessibility rules

- Keep correct heading order.
- Keep body copy in the DOM.
- Respect reduced motion.
- Maintain no-JavaScript readability.
- Keep focus-visible states.
- Make horizontally scrollable code and tables keyboard reachable.
- Give controls real labels.
- Do not make a clickable `div`.
- Announce external new-tab behavior.
- Preserve contrast over the brightest pose, not only over black.
- Never remove a text scrim because it appears unnecessary at one viewport.

## Verification matrix

Match verification to the change.

### Any page or content change

- Check the route loads.
- Check metadata.
- On staged pages, check every beat registers.
- Check title wrapping at narrow and wide widths.
- Check copy and media contrast; on staged pages, inspect the live pose.
- Check CTA destinations.
- Run `pnpm check` and `pnpm build` before delivery.

### Shared UI and static product pages

- Check the real screenshot sequence and every product/action destination.
- Exercise dropdowns, sheets and copy controls with keyboard and pointer.
- Check narrow and wide layouts, visible focus, reduced motion and the readable
  no-JavaScript path.
- Use the shared tokens and component variants; do not introduce a route-local
  design system.

### Maintenance checks

`pnpm check` runs `lint`, `typecheck`, `test`, `check:unused` and `format:check`.
Run the relevant focused check while editing, then the full check and production
build before delivery. `pnpm format` writes formatting; in a shared dirty checkout,
format only the files you own with `pnpm exec prettier --write <paths>`.

Knip reads `knip.json` and detects ordinary unreachable source and dependencies.
Before deleting reported files, inspect all App Router entries, package scripts,
CLI/test entries, dynamic imports, filesystem registries, docs and public paths.
An unlinked route or public download is still an entrypoint. Preserve runtime
journeys, published installer/PDF/text endpoints and engine contracts. Record
justified removals and retained exceptions in `docs/dead-code-audit.md`.

Use Node >=22.13.0 and pnpm 9.12.3. ESLint 9.39.5 is pinned because the Next.js
16.2.11 lint stack's plugin peer dependencies do not support ESLint 10. Keep this
specific compatibility exception documented; do not disable rules broadly or
upgrade the framework as a side effect of cleanup.

`.github/workflows/quality.yml` performs the frozen install, `pnpm check` and
`pnpm build` on pushes and pull requests. It does not publish the site.

### Data-driven story

- Verify unique IDs and contiguous indices.
- Verify beat count matches the active track.
- Verify story data is serializable.

### Journey JSON

- Parse it as JSON.
- Run or call `validateDefinition`.
- Verify filename equals slug.
- Verify every choice target exists.
- Walk every branch.
- Verify the longest intended path against `maxDepth`.
- Test rewind and replay flags.
- Test `/journey?j=<slug>`.
- Test one shared trace path.

### Choreography or scroll change

- Capture the relevant golden baseline before the change.
- Capture after the change.
- Explain every non-zero delta.
- Test reduced motion.
- Test narrow and wide viewports.
- Ensure the final frame loop remains allocation-free.

### API change

- Test success and rejected input.
- Test cross-origin rejection where relevant.
- Test production write rejection.
- Preserve atomic writes.
- Confirm no server-only module crosses into a client graph.

### Dynamic `[slug]` route

- Test `generateStaticParams`.
- Test one valid slug and one missing slug.
- Verify `notFound()`.
- Verify dynamic metadata.
- Verify params are awaited.

## Definition of done

A generated or new page is complete only when:

- the correct authoring mode was used;
- route and metadata are present;
- content uses the relevant shared components and canonical types;
- staged beat IDs and indices are stable and valid when present;
- the stage track matches the rendered beats when a stage is used;
- journey or generation rules are normalized, validated, and deterministic;
- navigation changes are intentional;
- accessibility fallbacks remain intact;
- local links and JSON parse;
- `pnpm check` and `pnpm build` pass; and
- the handoff states which files define content, rules, and visuals.

## Common failure modes

Avoid these:

- generating a TSX route for every journey JSON;
- inventing a second generic beat renderer;
- putting page-specific conditions in `StoryBeat`;
- using array position as identity after adding conditional branches;
- adding six beats to a five-leaf published track;
- putting functions inside persistent JSON;
- accepting dangling choices and hoping the UI handles them;
- changing the camera to fix one pose;
- separately tuning burst, environment, and scrims;
- importing Three.js into `story.ts`;
- making `page.tsx` a client component only to read a query string;
- writing to `.quirq` in production;
- editing an existing recording away while regenerating a definition;
- treating supported ecosystems as customer logos;
- inventing metrics or evidence;
- skipping a build because the change is “only data.”

## Canonical examples

Use these before inventing a pattern:

| Need                                  | Example                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Data-driven stage page                | `app/dynamic`                                                                                                           |
| Scene-control documentation           | `app/scenes`                                                                                                            |
| Journey-authoring documentation       | `app/how-it-works`                                                                                                      |
| Static product homepage               | `app/page.tsx`, `components/home/home-page.tsx`, `components/home/trusted-by.tsx`                                       |
| Space product walkthrough             | `app/products/page.tsx`, `components/products/products-page.tsx`, `components/products/deployment-options.tsx`          |
| XO managed cloud product              | `app/xo/page.tsx`, `components/ui/try-on-xo.tsx`, `components/ui/xo-logo.tsx`                                           |
| Shared interface system               | `styles/theme.css`, `components/ui`, `docs/design-system.md`                                                            |
| Custom composed beats                 | `app/what-is-quirq/beats.tsx`, `app/beats/beats.tsx`                                                                    |
| Branching generated page              | `app/journey`, `.quirq/journeys/default.json`                                                                           |
| Live track override                   | `app/editor/editor.tsx`                                                                                                 |
| Static generated route                | `app/research/[slug]/page.tsx`                                                                                          |
| Paginated, filtered listing           | `app/research/page.tsx`, `app/research/page/[page]`, `app/research/topic/[topic]`, `components/research/index-view.tsx` |
| Journey derived from content          | `lib/research-journey.ts`, `app/journey/read/[slug]/page.tsx`                                                           |
| Measured visual as data               | `components/story/figure.tsx`, `components/story/types.ts`                                                              |
| Figure generated from prose           | `lib/chart-figure.ts`                                                                                                   |
| Any dataset as a journey              | `scripts/build-git-journey.mjs`                                                                                         |
| Walking any journey document          | `components/journey/engine.tsx`, `app/journey/load/page.tsx`                                                            |
| Catalog resolver and pagination rules | `lib/research.ts` (`resolveIndex`)                                                                                      |
| Framed content image                  | `components/research/banner.tsx`                                                                                        |
| Generic renderer contract             | `components/story/types.ts`, `components/story/story-beat.tsx`                                                          |
| Beat registration                     | `components/ui/primitives.tsx`, `lib/beat-registry.ts`                                                                  |
| Scroll mapping                        | `components/scroll-runtime.tsx`                                                                                         |
| Rule-based track authoring            | `components/stage/choreo-tree.ts`                                                                                       |
| Runtime sampling                      | `components/stage/choreography.ts`                                                                                      |
| Pose and journey validation           | `app/journey/defs.tsx`                                                                                                  |
| Filesystem API guards                 | `app/api/journeys/guards.ts`                                                                                            |
| Visual regression data                | `lib/golden.ts`, `docs/goldens`                                                                                         |

When an existing example and this guide appear to disagree, inspect the current canonical type and runtime code. Update this guide in the same change if the architecture has intentionally evolved.
