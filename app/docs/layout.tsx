import type { ReactNode } from "react";
import { SiteFooter } from "@/components/ui/footer";

/**
 * Docs take the research treatment: the same void black, grain and vignette,
 * with the fixed CSS glow standing in for the light burst. A page people come
 * to in order to find something should cost nothing to load, so there is no
 * 3D stage here.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
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
