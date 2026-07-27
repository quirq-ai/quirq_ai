import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "The workspace's .quirq folder, read straight off the disk: live presence, usage telemetry, the append-only timeline, and every file in place.",
};

/**
 * The stage page that runs unlit: the beat registers and the scroll runtime
 * measures as everywhere else, but the scene layers stay off because this
 * page is an instrument, not a story. The header, tablist and five tab
 * panels live inside <Dashboard/> because one snapshot of the .quirq folder
 * feeds all of them; splitting them into siblings would mean lifting that
 * state into this server component, which cannot hold it.
 */
export default function DashboardPage() {
  return (
    <StagePage lit={false}>
      <Dashboard />
      <SiteFooter />
    </StagePage>
  );
}
