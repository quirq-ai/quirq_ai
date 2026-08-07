import type { ReactNode } from "react";
import { SiteFooter } from "@/components/ui/footer";

/**
 * Research pages share the home page's atmosphere (void black, grain,
 * vignette) but not its 3D stage: text pages should cost nothing to read.
 * A fixed CSS glow stands in for the light burst so the family resemblance
 * holds without shipping three.js here.
 */
export default function ResearchLayout({ children }: { children: ReactNode }) {
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
