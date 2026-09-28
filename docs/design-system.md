# Quirq interface system

## Direction

Graphite surfaces, Quirq's original warm white actions, prismatic brand art, and real product media.
Shared graphite media frames keep real screenshots consistent; warm light
stages are reserved for clear conceptual diagrams within the dark interface. The interface uses the same shadcn New York / Radix / Lucide component contracts
as xo-swarm, with Quirq's own colors. XO's green belongs to the product identity;
do not use it for Quirq's shared buttons, navigation, selection or focus states.
Research figures and the optical renderer
retain color when it communicates data or the brand. Product captures stay intact.

## Foundations

`styles/theme.css` is the single source for colors, typography, radius, spacing,
content width, header height, and motion timing. Tailwind utilities and CSS modules
consume those variables. Do not add route-local color palettes or font stacks.

| Foundation                     | Standard                                                                |
| ------------------------------ | ----------------------------------------------------------------------- |
| Page / panel / raised surface  | `background` / `card` / `secondary`                                     |
| Light product stage / its text | `surface-contrast` / `surface-contrast-foreground`                      |
| Quiet dividers / media depth   | `border-subtle` / `shadow-media`                                        |
| Text / supporting text         | `foreground` / `muted-foreground`                                       |
| Actions / keyboard focus       | `primary` / `ring`                                                      |
| Status and data                | `success`, `info`, `warning`, `destructive`, `chart-1…5`                |
| Type                           | Geist Sans; Geist Mono for code, metadata and numeric labels            |
| Radius                         | 6px small; 8px controls; 10px cards; 14px media                         |
| Spacing                        | Tailwind's 4px scale; 16–24px inside panels                             |
| Controls                       | 44px default targets; 14px labels; visible focus and disabled states    |
| Width                          | 76rem general content, 44rem reading measure, responsive shared gutters |
| Motion                         | 150/200ms UI transitions; respect reduced motion                        |

## Components

`components/ui` owns reusable components. Button uses CVA and Radix Slot; Sheet
and DropdownMenu delegate keyboard and focus behavior to Radix. Inputs keep
native form semantics. `lib/utils.ts` owns the only class-merging helper.

Primary buttons use warm white (`#f4f3f0`) with black text. Secondary and outline
buttons use neutral dark surfaces; hover surfaces and focus rings follow the
same Quirq palette. Semantic success indicators may still use green.

`TryOnXo` in `components/ui/try-on-xo.tsx` is the shared primary conversion control.
It uses `Button asChild`, visible “Try on” text and `XoLogo`, linking directly to
`APP_URL`. Its accessible name says “Try on XO” and announces the new tab. Keep
the warm-white button treatment; the green in the XO mark is product branding.
The CTA mark is **30 × 12px** so it sits at the text's optical height. Do not
stretch the logo into a square or enlarge it to the button's full height.

`XoLogo` in `components/ui/xo-logo.tsx` renders the canonical XO cloud polylines.
The X follows `currentColor`, and the O retains its original `#83d63a` stroke.
Its cropped viewBox removes empty artboard margin without changing the shape.
It is decorative by default, so standalone uses need an accessible surrounding
label. See [logo provenance](./product-evidence.md#xo-logo-provenance).
The default mark is **40 × 16px**. Product lockups use **48px width**, preserving
the 2.5:1 aspect ratio. Keep these deliberate sizes consistent across routes.

`--surface-contrast`, `--surface-contrast-foreground`, `--border-subtle` and
`--shadow-media` define the product stage and media treatment. Consume these
shared tokens rather than introducing a second page palette. Quirq's warm white
actions remain unchanged.

## Navigation

The shared header groups **Products** and **Resources**, followed by
**Enterprise** and the direct **Try on XO** action. Products contains **Space**
(`/products`) and **Cloud** (`/xo`); Cloud is the navigation label and XO remains
the product brand. Resources contains **Docs** (`/docs`), **Research**
(`/research`) and **Writing** (`/writing`). Enterprise preserves the
`/machinespeed` destination and its announced new-tab behavior. Whitepaper stays
inside Research, and direct pricing access remains `/xo#pricing`.

`components/ui/nav.tsx` owns the grouped route data. Desktop groups use the
shared Radix `DropdownMenu`; the mobile `Sheet` presents the same groups as
labeled link lists. Keep link semantics, current-route state, keyboard access,
Escape dismissal and focus return. Close disclosures after navigation and when
crossing the desktop/mobile breakpoint; focus must not return to a hidden
trigger. Do not make navigation depend on hover or change established URLs to
match a shorter label. Without JavaScript, the existing `noscript` fallback
hides inert popup triggers; native footer links, the trial action and page
content remain available.

## Page roles and conversion

- **Homepage:** preserve the earlier Space-first split layout and “Give your
  agents a place to work” promise → Trusted by → projects/agents/sharing
  benefits → Machine Speed → trial and open source. Keep the real product
  capture beside the hero copy and the composition static. Preserve the original
  eight-brand trust section; it is separate from agent compatibility.
- **Space (`/products`):** Projects, Agents and Sharing walkthrough → XO or
  open-source deployment. Keep GitHub, Docs and the installer easy to find.
  Sharing is a Git-backed Share → Review → Apply flow. Its disclosure must
  retain the pushed-commit boundary, local uncommitted edits, XO connection and
  repository-access requirements. This is distinct from granting access to a
  whole cloud Space.
- **Cloud (`/xo`, XO brand):** template and setup tour → workspace tools and
  usage → subscription pricing → custom Enterprise. Keep setup choices,
  required model credentials and template-dependent apps/connections clear.
  Enterprise preserves self-hosting, connecting an existing cloud, custom
  policies and white-label deployment across multiple clouds. Owner-confirmed
  broader capabilities remain in the product evidence; recorded setup or usage
  media must not imply a verified live delegation or scaling demonstration.
- **Primary action:** the shared **Try on XO** control, linking directly to
  `APP_URL`. Keep the **30-day trial for eligible Starter and Pro accounts**
  visible near trial entry. Business has no free trial. Do not invent card
  requirements, automatic charging, discounts or numerical resource allowances.
- **Secondary actions:** Home and Space keep GitHub and Docs near their heroes;
  Home and Space retain the open-source entry. Cloud links to setup documentation
  and real product tours. Use canonical destinations from `lib/products.ts` and
  media records from `lib/product-media.ts`.

Show Starter, Pro and Business as three parallel subscription cards, with
Enterprise in a separate full-width row:

| Offer      | Monthly USD | Annual USD total | Trial or deployment scope                                                     |
| ---------- | ----------: | ---------------: | ----------------------------------------------------------------------------- |
| Starter    |         $10 |             $100 | 30-day trial for eligible accounts                                            |
| Pro        |         $50 |             $500 | 30-day trial for eligible accounts                                            |
| Business   |        $500 |           $5,000 | No free trial                                                                 |
| Enterprise |      Custom |           Custom | Self-hosting, customer cloud, policies and multi-cloud white-label deployment |

Both cadences remain visible, with annual amounts labeled as full yearly totals.
Compact inherited-feature copy may say “Starter features included” or “Pro
features included,” followed by the actual additions. Keep each tier's price,
trial condition and action visible outside disclosures. Enterprise uses the
existing contact path. These subscription amounts were verified in the local XO
runtime on 22 September 2026 and owner-approved for the website preview;
production billing remains unverified. They are not hourly compute rates. The
older conflicting schedules remain historical evidence in the
[pricing review](./product-evidence.md#pricing-review--unresolved).

Use short section copy and native `details`/`summary` for setup mechanics,
sharing rules, plan explanations and tour transcripts. Preserve essential
qualifications beside their claims and actions; reducing visible copy must not
change the product promise. Keep disclosure labels specific and keyboard usable.

Use `Button asChild` for navigation links, `Button` for actions, and native links
for inline prose. Do not nest interactive elements or copy button CSS into a route.
Use `aria-pressed` buttons for content filters. Add further shadcn primitives
only when a current interaction needs them. Lucide supplies interface icons; brand marks come
from the existing canonical brand assets.

CSS modules handle composition and media framing. Shared component styling belongs
in the component; foundation values belong in the theme. Rendering math, figure
geometry, and graph category colors are separate from the interface theme.

## Product media

`lib/product-media.ts` owns authentic capture and tour records, dimensions, alt
text, provenance, transcripts and file references. `ProductCapture` owns the
shared frame, source caption and native full-size link on `/products` and `/xo`.
These pages consume capture keys rather than duplicating source details. Images
remain unchanged. Current XO captures come from the local platform review on
22 September 2026; older beta-guide material keeps its historical attribution
in the product evidence.

`ProductTour` uses native video controls, a poster, WebVTT captions, a transcript
and an MP4 download. Its three current tours are actual 4fps edited step-through
captures: setup, usage and pricing. Keep their boundaries visible: setup stops
before provisioning, usage shows an empty account state and pricing does not
change a subscription. Do not autoplay or replace the footage with a simulated
interface. Export and browser playback checks are recorded in
[the platform review](./reviews/xo-platform-2026-09-22.md).

Below 768px, screenshots retain a 960px minimum width inside a keyboard-focusable
horizontal viewport. Only the image scrolls; the page and captions remain within
the screen. A visible scroll hint and original-image link expose the detail.

The homepage uses its restored static split layout and benefit sections. It
does not use a product carousel or require JavaScript to read its product story.

## Product-page motion

`components/products/product-motion.tsx` is the narrow client boundary for
optional entry motion on `/products` and `/xo`. Pass server-rendered content as
children; do not convert the page or its media into a client component. The
wrapper marks the page with `data-product-page`; selected sections use
`data-product-reveal`.

Content is visible in the server HTML and remains visible without JavaScript,
IntersectionObserver or animation. A lightweight observer starts a short
Web Animations entry when an eligible section enters the viewport, then stops
observing it. Targets already near the top of the viewport, including typical
hash destinations, are left undisturbed. Reduced-motion preference prevents animations and cancels
active ones if the preference changes. Clean up observers and animations on
unmount. Never hide content in initial CSS while waiting for an observer.

Chapter links remain native hash anchors. `app/globals.css` enables native
smooth scrolling only for product pages when reduced motion is not requested;
section scroll margins leave room for the shared header. Preserve URL hashes,
browser history, keyboard navigation and the no-JavaScript path. Do not add
scroll interception or the staged-story runtime to these product pages. The
original homepage composition remains unchanged by this motion pattern.

## Separate visual draft

`/draft` is a `noindex` design alternative that keeps the approved flow: Space
hero, eight-brand Trusted by, projects/agents/sharing benefits, Machine Speed,
then trial and open source. It explores an asymmetric hero and full desktop
capture, staggered numbered benefits on warm ivory, and an unboxed enterprise
section with prismatic art. Shared tokens and controls still apply. Optional
scroll-linked decoration must keep content visible and respect reduced motion.
Its sources are [`app/draft/page.tsx`](../app/draft/page.tsx),
[`editorial-home.tsx`](../components/home/editorial-home.tsx) and
[`editorial-home.module.css`](../components/home/editorial-home.module.css).
The canonical homepage at `/` retains its approved layout.

## Whitepaper reader

Keep `/whitepaper` inside Research, with the prominent whitepaper action on the
Research landing page. It is not a standalone shared navigation item. Its reader
offers **PDF** and **Text** modes, with native **Open PDF** and **Download** links
to the canonical `/whitepaper/pdf` endpoint. The typeset source paper stays
unchanged; the reader only changes its presentation.

On desktop, load the PDF reader lazily in the browser. At widths of 767px and
below, default to the higher-contrast Text view, with PDF still selectable. The
complete transcription is server-rendered and remains readable without
JavaScript. Preserve existing section IDs and reveal Text view for section
hash links before scrolling.

`react-pdf` 11.0.0 and `pdfjs-dist` 6.3.289 provide selectable text, annotations,
page controls and zoom. Keep the PDF.js library and its locally bundled worker
on matching versions when upgrading. Load the worker from the application;
do not introduce a CDN dependency. Reader controls use shared Quirq components
and tokens. Both formats share one fixed responsive panel height; PDF and text
scroll internally while format and file controls stay outside the scroll area.
Text contents links scroll the text pane without moving the outer page. Zoomed
PDF pages stay inside the reader without widening the page.

## Maintenance

Keep server components as the default and client boundaries around interaction.
New components must have a current consumer. Preserve published routes and runtime
data when removing dead code; import reachability alone does not identify public
URLs. Run the repository checks before delivery. The dead-code audit records the
cleanup and the runtime exceptions that automated analysis cannot infer.

References: [shadcn theming](https://ui.shadcn.com/docs/theming),
xo-swarm component contracts (local source
was used; no application-specific services or credentials were copied).
