import { StagePage } from "@/components/stage-page";
import { Hero } from "@/components/beats/hero";
import { Ecosystem } from "@/components/beats/ecosystem";
import { Onboarding } from "@/components/beats/onboarding";
import { Invite } from "@/components/beats/invite";
import {
  SessionIntelligence,
  SpaceDashboard,
  WorkspaceGraph,
} from "@/components/beats/space-showcase";
import { HomeStageProfile } from "@/components/stage/home-stage-profile";

export default function Page() {
  return (
    <StagePage>
      <HomeStageProfile />
      <Hero />
      {/* Credibility shelf, straight after the fold. Deliberately not a beat. */}
      <Ecosystem />
      <WorkspaceGraph />
      <SessionIntelligence />
      {/* Also not a beat: the track has exactly five keyframes and the five
          beats above and below already spend them. Onboarding occupies the
          glide between beat 2 and beat 3 without adding a sixth pose. */}
      <Onboarding />
      <SpaceDashboard />
      <Invite />
    </StagePage>
  );
}
