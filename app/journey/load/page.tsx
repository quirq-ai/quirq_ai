import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { JourneyEngine } from "@/components/journey/engine";

export const metadata: Metadata = {
  title: "Journey loader",
  description:
    "Load any journey document and walk it: paste the JSON, open a file, or fetch one by slug. The document is validated before it renders.",
  // A tool, not a page worth indexing; the same rule the editor follows.
  robots: { index: false },
};

/**
 * The loading engine's own surface: JSON in, walk out, with no note or file
 * behind it. `?src=<slug>` opens a document straight from the journeys API.
 */
export default function JourneyLoader() {
  return (
    <StagePage>
      <JourneyEngine accept />

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-background via-background/85 to-transparent"
        />
        <SiteFooter />
      </div>
    </StagePage>
  );
}
