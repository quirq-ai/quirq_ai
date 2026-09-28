import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { StoryBeat } from "@/components/story/story-beat";
import { STORY } from "./story";

export const metadata: Metadata = {
  title: "The choreography tree",
  description:
    "The keyframe track is resolved from a tree with cascading partial keyframes and branch predicates: the feature that lets one scene serve many walks.",
};

/** Feature page: tree. Story data in ./story.ts, rendered by StoryBeat. */
export default function Page() {
  return (
    <StagePage>
      {STORY.map((beat) => (
        <StoryBeat key={beat.id} data={beat} />
      ))}

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
