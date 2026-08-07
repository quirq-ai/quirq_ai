import type { Metadata } from "next";
import { FrameOneHome } from "@/components/home/frame-one-home";

/** Assembled from two strings the page itself says out loud. */
const DESCRIPTION =
  "Secure environments for agentic workforces. Any model. Any harness. Any cloud. Deploy, manage and meter the agents your team already runs.";

export const metadata: Metadata = {
  // No `title`. The root default ("quirq · work at light speed") is already
  // written for this route, and anything set here would run through the
  // "%s · quirq" template and print the brand twice.
  description: DESCRIPTION,
  openGraph: { description: DESCRIPTION },
  twitter: { description: DESCRIPTION },
};

export default function Page() {
  return <FrameOneHome />;
}
