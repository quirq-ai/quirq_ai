import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { StoryBeat } from "@/components/story/story-beat";
import { LensDemo, LightDeskDemo, PrismTilesDemo, RingSwapDemo } from "./demos";
import { STORY } from "./story";

export const metadata: Metadata = {
  title: "The engine",
  description:
    "The scene behind every quirq page, taken apart: the mobius ring, the light it bends, the dark that keeps words readable, and how the three compose into nodes.",
};

/**
 * Feature page: engine. Story data in ./story.ts, rendered by StoryBeat.
 * The three demos are interludes (unregistered sections), so the glass keeps
 * gliding between the registered beats while the visitor plays with them.
 */
export default function Page() {
  return (
    <StagePage>
      <StoryBeat data={STORY[0]} />
      <StoryBeat data={STORY[1]} />
      <RingSwapDemo />
      <StoryBeat data={STORY[2]} />
      <LightDeskDemo />
      <StoryBeat data={STORY[3]} />
      <PrismTilesDemo />
      <LensDemo />
      <StoryBeat data={STORY[4]} />

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-black via-black/85 to-transparent"
        />
        <SiteFooter />
      </div>
    </StagePage>
  );
}
