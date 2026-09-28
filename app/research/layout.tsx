import type { ReactNode } from "react";
import { SiteFooter } from "@/components/ui/footer";

/** A quiet reading surface sharing the site theme and footer. */
export default function ResearchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <main id="main-content" className="relative flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
