# Staged story animation

This guide covers pages that mount `StagePage`, including the narrative
explainers, journey reader and editor. The homepage in
`components/home/home-page.tsx` is a static composition with a product-capture
tour; it does not mount the stage or scroll runtime. Shared UI styling is
documented in [design-system.md](./design-system.md).

## Runtime map

| Layer          | File                                                              | Responsibility                                                   |
| -------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Page shell     | `components/stage-page.tsx`                                       | Scroll runtime, optional scene and film overlays, semantic main  |
| Sections       | `components/ui/primitives.tsx`, `components/story/story-beat.tsx` | DOM content and beat registration                                |
| Registry       | `lib/beat-registry.ts`                                            | Mounted section IDs, order and elements                          |
| Scroll runtime | `components/scroll-runtime.tsx`                                   | DOM measurement, Lenis or native scroll, fractional beat mapping |
| Frame state    | `lib/stage-store.ts`                                              | Mutable values shared with the canvas without React renders      |
| Authored track | `components/stage/choreo-tree.ts`                                 | Full channel type, presets, cascading tree and resolver          |
| Live track     | `components/stage/choreography.ts`                                | Resolved leaves, temporary overrides, sampler and damping        |
| Rendering      | `components/stage/*`                                              | Lazy canvas, persistent glass, light burst and environment       |
| Text masks     | `components/ui/glass.tsx`                                         | Text-shaped scrim masks recomputed outside the frame loop        |

The global navigation belongs to `app/layout.tsx`. `StagePage` supplies one
page's rendering shell. Its `lit` prop controls the scene; `film` controls the
vignette and grain. An unlit page still mounts the scroll runtime.

## From scroll to pose

1. `Beat` registers a stable ID, index and DOM element. `ScrollRuntime` measures
   real section centers, so content can grow at narrow widths without assuming
   every section is exactly one viewport tall.
2. The runtime matches registered sections to resolved leaf IDs when all IDs and
   counts agree. Otherwise it uses registered order. A `[data-beat]` query remains
   as a fallback for sections outside the registry. New conditional tracks should
   use matching IDs; positional fallback cannot express a pruned middle leaf.
3. The viewport's center maps between adjacent section centers. A value of `2.37`
   means 37% of the interval from beat 2 to beat 3. The runtime writes
   `stage.beat`, `stage.progress` and the CSS variable `--scroll`.
4. Canvas consumers call `sampleKeyframes(getTrack(), stage.beat, out)`. The sampler
   clamps the position, applies smoothstep and writes each interpolated channel
   into a reused output object.
5. `GlassForm` and `LightBurst` damp their live values toward those targets and
   apply the transforms, material values and lighting. The glass stays mounted
   across beats within that staged page.

The hot path stays outside React state and avoids per-frame allocation. Content
entrances use Motion separately. Text-mask measurements, tree resolution and DOM
measurements happen on lifecycle or layout events, not inside the canvas loop.

## Tree authoring and overrides

`ChoreoNode` is the authoring structure. An ancestor supplies partial keyframe
values, descendants override them, and `resolveTrack` produces ordered leaves with
complete keyframes. `when` predicates receive an explicit `TrackContext` containing
`width`; a false predicate prunes its subtree. Resolution happens on mount and
resize, before measuring the sections.

The default track has five leaves. A shorter linear story can stop earlier; a
longer or conditional story needs a matching track. The sampler clamps beyond
the last leaf, so adding sections alone does not create new poses.

Journeys and the editor call `overrideLeaves` to supply their own resolved path.
`getTrack()` and `getResolvedLeaves()` follow that override. Its owner must call
`overrideLeaves(null)` on unmount. `KEYFRAMES` is the initial resolved reference
used to seed values; per-frame code must read the current track through
`getTrack()`.

The fourteen channels are:

```text
position: x, y, z, scale
attitude: spin, tiltX, tiltZ
optics:   chroma, thickness, distortion, aniso, rough, ior
light:    burst
```

`spin` is a rate; tilts are absolute targets. Use the named pose presets before
adding overrides. Keep the camera fixed and adjust subject placement. Change
coupled scene brightness through `lib/lighting.ts`; inspect text contrast with
the actual pose present. Canonical authoring examples and validation rules live
in [AGENTS.md](../AGENTS.md).

## Accessibility and lifecycle

- Keep all copy in the DOM with semantic headings. Use the shared text scrims
  over bright stage imagery.
- Reduced motion uses native scrolling instead of Lenis and reduces scene motion.
  Verify this separately from normal-motion captures.
- `Stage` lazy-loads the Three.js scene and selects a cheaper rendering quality on
  small or lower-core devices. A failed WebGL capability check uses
  `public/assets/mobius.jpg` as the visual fallback.
- The root layout's no-JavaScript CSS keeps content visible. Links and readable
  content must remain useful without animation or interactive controls.
- Unmount cleanup resets frame state and scroll styles, disconnects observers and
  removes listeners. Late font and measurement callbacks must not revive an
  unmounted runtime.

## Golden verification

`lib/golden.ts` samples the live scroll mapping and keyframes; it is not a second
animation implementation. During normal-motion development, the scroll runtime
exposes `window.__golden()` after loading that module. It records the route,
viewport, section centers and 21 scroll samples by default.

For a scroll, registration, resolver or sampler change:

1. Open the affected staged route in development and let fonts and layout settle.
2. Record the route, viewport and any journey path or editor state. Capture with
   `await window.__golden()` before the change and save the returned JSON.
3. Repeat at the same route, state and viewport after the change.
4. Compare centers, fractional beats and all sampled values. A behavioral refactor
   should preserve them; explain intentional differences and update baselines
   only when the changed behavior is intended.
5. Check the visible scene at narrow and wide widths, plus reduced motion and
   no-WebGL behavior. Numeric samples do not test image quality, contrast or
   keyboard access.

`docs/goldens/*.json` contains historical route captures. `home.json` describes an
earlier staged homepage and must not be applied to today's screenshot homepage.
Capture a fresh baseline for the current route before changing its animation.
The standard `pnpm check` and `pnpm build` commands supplement this comparison;
they do not run browser golden captures automatically.
