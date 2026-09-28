"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { stage } from "@/lib/stage-store";
import { beatEntries, onBeatsChange } from "@/lib/beat-registry";
import { getResolvedLeaves, refreshTrack } from "@/components/stage/choreography";

/**
 * Owns smooth scrolling and turns raw scroll into a fractional beat index.
 *
 * Beat position is measured from each section's real centre rather than assuming
 * every beat is exactly 100vh: sections grow on small screens, and hard-coding
 * viewport multiples would drift the 3D choreography out of sync with the copy.
 */
export default function ScrollRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.reduced = reduced;

    /** Document-space centre of each beat section. */
    let centres: number[] = [];

    const measure = () => {
      // Phase 2: registered sections first; the data-beat query remains as
      // the fallback for pages composed without the Beat primitive.
      const registered = beatEntries();
      let sections: HTMLElement[];
      if (registered.length) {
        // Bind sections to resolved leaves BY ID when the page's ids match
        // the tree: the only ordering that stays correct once a `when`
        // predicate prunes a middle leaf. Pages whose ids are not in the
        // tree bind positionally, exactly as before.
        const leaves = getResolvedLeaves();
        const byId = new Map(registered.map((entry) => [entry.id, entry.el]));
        const idBound =
          leaves.length === registered.length &&
          leaves.every((leaf) => byId.has(leaf.id));
        sections = idBound
          ? leaves.map((leaf) => byId.get(leaf.id) as HTMLElement)
          : registered.map((entry) => entry.el);
        if (
          process.env.NODE_ENV !== "production" &&
          !idBound &&
          registered.length !== leaves.length
        ) {
          console.warn(
            `[stage] ${registered.length} sections vs ${leaves.length} track leaves: positional binding may sample the wrong pose. Match section ids to tree leaf ids.`,
          );
        }
      } else {
        sections = Array.from(document.querySelectorAll<HTMLElement>("[data-beat]")).sort(
          (a, b) => Number(a.dataset.beat ?? 0) - Number(b.dataset.beat ?? 0),
        );
      }
      centres = sections.map((el) => {
        const box = el.getBoundingClientRect();
        return box.top + window.scrollY + box.height / 2;
      });
    };

    // fonts.ready outlives unmount (the document persists across client
    // navigations), so late callbacks must be gated: a dead runtime must
    // never write --scroll or the stage store after clear() has run.
    let alive = true;

    // Phase 4: the track resolves against the live context before anything
    // is measured, and again on resize; with no active branch predicates
    // this reproduces the same values it always had.
    refreshTrack({ width: window.innerWidth });

    /** Map a scroll offset onto the fractional beat index. */
    const toBeat = (scroll: number) => {
      if (centres.length === 0) return 0;
      const eye = scroll + window.innerHeight / 2;
      if (eye <= centres[0]) return 0;
      const last = centres.length - 1;
      if (eye >= centres[last]) return last;
      for (let i = 0; i < last; i++) {
        const a = centres[i];
        const b = centres[i + 1];
        if (eye >= a && eye <= b) {
          const span = b - a;
          return span > 0 ? i + (eye - a) / span : i;
        }
      }
      return last;
    };

    const write = (scroll: number, limit: number) => {
      stage.beat = toBeat(scroll);
      stage.progress = limit > 0 ? Math.min(Math.max(scroll / limit, 0), 1) : 0;
      // CSS-only consumers (the nav progress rule) read this without re-rendering.
      root.style.setProperty("--scroll", stage.progress.toFixed(4));
    };

    // The inline --scroll survives client navigations (the <html> element
    // persists), which would freeze the nav's progress rule at its last value
    // on pages without this runtime. Clearing it lets the :root default (0)
    // take over; the stage store is a module singleton, so it is reset too.
    const clear = () => {
      root.style.removeProperty("--scroll");
      stage.beat = 0;
      stage.progress = 0;
    };

    measure();

    // Reduced motion: skip Lenis entirely and track native scroll instead, so
    // the page keeps the visitor's own scrolling behaviour.
    if (reduced) {
      const onScroll = () =>
        write(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
      const onResize = () => {
        refreshTrack({ width: window.innerWidth });
        measure();
        onScroll();
      };
      onScroll();
      // Programmatic drive (replay, tools): scroll requests arrive as events
      // so callers never need a handle on the scrolling machinery.
      const onDrive = (e: Event) => {
        const y = (e as CustomEvent<{ y?: number }>).detail?.y;
        if (typeof y === "number") window.scrollTo({ top: y, behavior: "smooth" });
      };
      window.addEventListener("stage:scrollto", onDrive);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      // Sections registering or leaving (a dynamic middle) re-measure too.
      const offBeats = onBeatsChange(() => {
        measure();
        onScroll();
      });

      /**
       * Sections that change height after mount.
       *
       * Without this, centres only refresh on mount, resize, font swap and
       * registry change, so anything that grows in place (a panel opening, a
       * table filling in, a journey step advancing) silently desyncs the pose
       * from the copy. Throttled to one rAF because ResizeObserver fires per
       * element and one interaction can move several at once.
       */
      let pending = 0;
      const observer = new ResizeObserver(() => {
        if (pending) return;
        pending = requestAnimationFrame(() => {
          pending = 0;
          measure();
          onScroll();
        });
      });
      const observeBeats = () => {
        observer.disconnect();
        const registered = beatEntries();
        const sections = registered.length
          ? registered.map((entry) => entry.el)
          : Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"));
        for (const section of sections) observer.observe(section);
      };
      observeBeats();
      const offObserve = onBeatsChange(observeBeats);

      // Section heights shift once the webfonts swap in.
      document.fonts?.ready
        .then(() => {
          if (alive) onResize();
        })
        .catch(() => {});
      return () => {
        alive = false;
        if (pending) cancelAnimationFrame(pending);
        observer.disconnect();
        offObserve();
        window.removeEventListener("stage:scrollto", onDrive);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        offBeats();
        clear();
      };
    }

    const lenis = new Lenis({
      duration: 1.15,
      // Long, soft tail: the glass form keeps moving after the wheel stops.
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      autoRaf: false,
    });

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) =>
      write(scroll, limit),
    );

    // Eager first write: Lenis only emits on movement, so a page restored
    // mid-scroll would otherwise show a zeroed rule until the first wheel.
    write(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);

    // Dev-only handles. Lenis owns the scroll position, so calling
    // window.scrollTo from a console or a test fights it; this exposes the
    // instance so tooling can drive the page the same way the wheel does.
    // __golden captures the scroll-to-beat mapping for refactor gating.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      (window as unknown as { __stage?: typeof stage }).__stage = stage;
      import("@/lib/golden").then(({ captureGolden }) => {
        (window as unknown as { __golden?: typeof captureGolden }).__golden =
          captureGolden;
      });
    }

    let frame = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });

    const onResize = () => {
      refreshTrack({ width: window.innerWidth });
      measure();
      lenis.resize();
    };
    window.addEventListener("resize", onResize);

    const remeasure = () => {
      measure();
      write(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
    };

    // Sections registering or leaving (a dynamic middle) re-measure and
    // re-write, so the rule and the 3D pick the change up immediately.
    // beatsResized() from lib/beat-registry drives this same path when a
    // section only changes height.
    const offBeats = onBeatsChange(remeasure);

    /**
     * Sections that change height after mount.
     *
     * centres otherwise only refresh on mount, resize, font swap and registry
     * change, so anything that grows in place (a panel opening, a table
     * filling in, a journey step advancing) silently desyncs the pose from
     * the copy: the glass keeps playing against the geometry the page had
     * when it loaded.
     *
     * Throttled to one rAF because ResizeObserver fires per element and a
     * single interaction can move several at once.
     */
    let pendingMeasure = 0;
    const observer = new ResizeObserver(() => {
      if (pendingMeasure) return;
      pendingMeasure = requestAnimationFrame(() => {
        pendingMeasure = 0;
        remeasure();
      });
    });

    /** Re-attach whenever the set of beats changes, not just on mount. */
    const observeBeats = () => {
      observer.disconnect();
      const registered = beatEntries();
      const sections = registered.length
        ? registered.map((entry) => entry.el)
        : Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"));
      for (const section of sections) observer.observe(section);
    };
    observeBeats();
    const offObserve = onBeatsChange(observeBeats);

    // Fonts change section heights after they swap in; re-measure once
    // settled and re-write, so the pose and the nav rule pick up the new
    // centres without waiting for the first wheel.
    document.fonts?.ready
      .then(() => {
        if (!alive) return;
        measure();
        write(window.scrollY, document.documentElement.scrollHeight - window.innerHeight);
      })
      .catch(() => {});

    const onPointer = (e: PointerEvent) => {
      stage.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Programmatic drive (replay, tools): requests ride Lenis like a wheel
    // gesture would, so the damped glass gets a real camera move.
    const onDrive = (e: Event) => {
      const y = (e as CustomEvent<{ y?: number }>).detail?.y;
      if (typeof y === "number") lenis.scrollTo(y, { duration: 1.35 });
    };
    window.addEventListener("stage:scrollto", onDrive);

    // Anchor links inside the page should ride Lenis, not jump.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    };
    document.addEventListener("click", onClick);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      if (pendingMeasure) cancelAnimationFrame(pendingMeasure);
      observer.disconnect();
      offObserve();
      window.removeEventListener("stage:scrollto", onDrive);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onClick);
      offBeats();
      lenis.destroy();
      clear();
    };
  }, []);

  return null;
}
