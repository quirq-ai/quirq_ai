import type { ReactNode } from "react";
import { SiteFooter } from "@/components/ui/footer";

/**
 * The paper is a reading surface, so it takes the research treatment rather
 * than the 3D stage: the same void black, grain, and vignette, with the fixed
 * CSS glow standing in for the light burst. Eight pages of argument should
 * cost nothing to read, and the text has to stay legible with no JavaScript
 * and no WebGL.
 *
 * The PDF at /whitepaper/pdf is a route handler and is untouched by this
 * layout; it stays the version of record.
 */
export default function WhitepaperLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="research-glow" aria-hidden />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      <main className="relative z-10 flex min-h-svh flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </main>
    </>
  );
}
