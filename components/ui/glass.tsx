"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { cn, TextScrim } from "./primitives";

/**
 * Glass over open sky.
 *
 * A GlassPool owns one TextScrim (the eclipse pool of darkness behind a block
 * of copy) and cuts real holes in it wherever its GlassText
 * children sit, so the burst's live light passes through the letterforms
 * undimmed and the translucent glyphs read as glass with light behind them.
 *
 * The mask is rasterized: a canvas the size of the scrim is filled opaque,
 * then each registered text hole is erased out of it with
 * fillText drawn with the element's own computed font (the loaded webfont
 * renders in canvas, so glyph shapes and advances match the DOM to the
 * sub-pixel). The result becomes the scrim's mask-image. CSS alone cannot do
 * this: mask-by-text does not exist, and Lightning CSS strips hand-written
 * backdrop-filter besides.
 *
 * Recuts happen after the entrance choreography settles, after webfonts swap,
 * on resize, and when the pool scrolls into view; while any hole's ancestor
 * still carries an entrance transform the hole is skipped for that pass, so a
 * mid-flight measurement never cuts a hole in the wrong place.
 */

type Register = (el: HTMLElement) => () => void;

const PoolCtx = createContext<Register | null>(null);

export function GlassPool({
  scrimClassName,
  children,
}: {
  scrimClassName?: string;
  children: ReactNode;
}) {
  const scrim = useRef<HTMLDivElement>(null);
  const holes = useRef(new Set<HTMLElement>());
  const queued = useRef(0);

  const compose = useCallback(() => {
    const el = scrim.current;
    if (!el) return;
    const s = el.getBoundingClientRect();
    if (s.width < 1 || s.height < 1) return;
    // Transforms on ancestors *shared* with the scrim move hole and scrim
    // together, so only transforms below this boundary can desync them.
    const boundary = el.parentElement;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(s.width * dpr));
    cv.height = Math.max(1, Math.round(s.height * dpr));
    const c = cv.getContext("2d");
    if (!c) return;
    c.scale(dpr, dpr);
    c.fillStyle = "#fff";
    c.fillRect(0, 0, s.width, s.height);
    c.globalCompositeOperation = "destination-out";

    let cut = false;
    holes.current.forEach((hole) => {
      // The element's own transform is reflected in its measured rect.
      for (let n = hole.parentElement; n && n !== boundary; n = n.parentElement) {
        const t = getComputedStyle(n).transform;
        if (t && t !== "none") return; // still travelling in; a later pass cuts it
      }
      const r = hole.getBoundingClientRect();
      if (r.width < 1) return;

      // Text holes are single-line only; a phrase that wrapped would need
      // per-fragment baselines, so it keeps its glass styling and no hole.
      if (hole.getClientRects().length > 1) return;
      const cs = getComputedStyle(hole);
      // A 0x0 inline-block's bottom sits exactly on the text baseline.
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;padding:0;margin:0";
      hole.appendChild(probe);
      const baseline = probe.getBoundingClientRect().bottom;
      hole.removeChild(probe);

      c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      try {
        (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      } catch {
        /* older engines: holes land slightly tight, still inside the glyphs */
      }
      c.filter = "blur(0.5px)";
      c.fillText(hole.textContent ?? "", r.left - s.left, baseline - s.top);
      c.filter = "none";
      cut = true;
    });

    // Never replace an earlier good mask with a hole-less one mid-entrance.
    if (!cut && holes.current.size > 0) return;

    const url = cv.toDataURL();
    const style = el.style as CSSStyleDeclaration & {
      webkitMaskImage?: string;
      webkitMaskSize?: string;
    };
    style.maskImage = `url(${url})`;
    style.webkitMaskImage = `url(${url})`;
    style.maskSize = "100% 100%";
    style.webkitMaskSize = "100% 100%";
    style.maskRepeat = "no-repeat";
  }, []);

  const schedule = useCallback(() => {
    clearTimeout(queued.current);
    queued.current = window.setTimeout(compose, 80);
  }, [compose]);

  const register = useCallback<Register>(
    (el) => {
      holes.current.add(el);
      schedule();
      return () => {
        holes.current.delete(el);
        schedule();
      };
    },
    [schedule],
  );

  useEffect(() => {
    // The hero settles within ~2s of load; below-the-fold pools settle ~1.2s
    // after their beat scrolls into view (the observer pass).
    const timers = [setTimeout(compose, 900), setTimeout(compose, 2200)];
    document.fonts?.ready.then(compose).catch(() => {});
    window.addEventListener("resize", schedule);
    let io: IntersectionObserver | undefined;
    if (scrim.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            compose();
            setTimeout(compose, 1400);
          }
        },
        { threshold: 0.2 },
      );
      io.observe(scrim.current);
    }
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(queued.current);
      window.removeEventListener("resize", schedule);
      io?.disconnect();
    };
  }, [compose, schedule]);

  return (
    <PoolCtx.Provider value={register}>
      <TextScrim ref={scrim} className={scrimClassName} />
      {children}
    </PoolCtx.Provider>
  );
}

/**
 * Translucent glass type. Inside a GlassPool it also cuts a matching hole in
 * the pool's scrim so real light stands behind the glyphs; outside a pool it
 * is just the styling.
 */
export function GlassText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const register = useContext(PoolCtx);

  useEffect(() => {
    if (!register || !ref.current) return;
    return register(ref.current);
  }, [register]);

  return (
    <span ref={ref} className={cn("glass-text", className)}>
      {children}
    </span>
  );
}
