import Image from "next/image";
import type { Banner } from "@/lib/research";

/**
 * The framed banner for one research note.
 *
 * A single 16:9 master serves every surface: the caller owns the aspect box
 * and the `sizes` hint, so the optimiser only ever ships the width that
 * surface actually paints. The art is lit from inside against pure black, so
 * the frame adds no scrim of its own; it only sinks the bottom edge into the
 * page so a banner reads as a window rather than a pasted tile.
 *
 * Rendered inside links, so every element is a `span` in block flow.
 */
export function PostBanner({
  banner,
  sizes,
  priority = false,
  zoom = false,
  className = "",
}: {
  banner: Banner;
  /** Required: without it the optimiser guesses one width for all viewports. */
  sizes: string;
  /** Only for a banner that is above the fold on first paint. */
  priority?: boolean;
  /** Slow push-in while the containing link is hovered. */
  zoom?: boolean;
  /** Aspect box and any width constraint. */
  className?: string;
}) {
  return (
    <span
      className={`relative block overflow-hidden rounded-xl border border-border bg-background ${className}`}
    >
      <Image
        src={banner.src}
        alt={banner.alt}
        width={banner.width}
        height={banner.height}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover${
          zoom
            ? " transition-transform duration-[900ms] ease-out motion-safe:group-hover:scale-[1.04]"
            : ""
        }`}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/55 via-transparent to-transparent"
      />
      {/* A quiet accent along the image edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-55"
        style={{ background: "var(--primary)" }}
      />
    </span>
  );
}
