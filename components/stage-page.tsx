import type { ReactNode } from "react";
import Stage from "@/components/stage/stage";
import ScrollRuntime from "@/components/scroll-runtime";

/**
 * The shared shell for any page that runs the 3D shot: the scroll runtime,
 * the persistent stage, and the film overlays. The one global navbar lives in
 * the root layout, outside this page-specific rendering shell.
 *
 * The contract with the choreography is unchanged from the single-page days:
 * children carry `data-beat={0..4}` sections (via the Beat primitive), the
 * runtime measures their centres, and the same KEYFRAMES track drives the
 * glass. A page may use fewer beats (the track simply stops earlier); using
 * more than the track has would flatten past the last keyframe, so don't.
 *
 * `lit` is the house lights switch. Unlit, the rendered layers stay off: no
 * scene (light burst, glass ribbon), no vignette, no grain. Everything else
 * still runs: the scroll runtime measures, beats register, the track resolves,
 * so a page that works unlit re-lights by flipping the prop and nothing else.
 * The dashboard runs unlit on purpose: it is an instrument, not a scene.
 *
 * `film` splits the two halves of "lit" apart. The scene is the expensive one
 * (three.js, a render target per frame); the vignette and grain are two static
 * divs that cost nothing and are most of what makes the black read as film
 * stock rather than #000. The home page runs `lit={false} film`: its subject
 * is a rendered still in the hero rather than a scroll-driven WebGL form, but
 * it still wants the stock. Defaulting to `lit` leaves every existing caller
 * exactly as it was.
 */
export function StagePage({
  children,
  lit = true,
  film = lit,
}: {
  children: ReactNode;
  lit?: boolean;
  film?: boolean;
}) {
  return (
    <>
      <ScrollRuntime />

      {/* One continuous shot: the glass form lives behind every beat and is
          re-staged by scroll rather than swapped out between sections. */}
      {lit && <Stage />}

      {film && (
        <>
          <div className="vignette" aria-hidden />
          <div className="grain" aria-hidden />
        </>
      )}

      <main className="relative z-10">{children}</main>
    </>
  );
}
