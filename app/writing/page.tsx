import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/ui/footer";
import { WritingView } from "./view";
import styles from "./writing.module.css";

/**
 * Writings, ported from the page-writings section of
 * quirq-package/site/quirq-research-writings-mock.html.
 *
 * Everything the route needs lives in this folder: its content (data.ts), its
 * styles (writing.module.css) and its one client boundary (view.tsx). Nothing
 * shared is touched, and /research keeps its own separate catalogue.
 *
 * The mock's own nav and footer are dropped in favour of the site's, which is
 * the only reason SiteFooter is imported here.
 */

export const metadata: Metadata = {
  title: "Writings",
  description:
    "News, thoughts and guides from quirq: launches and integrations, the findings argued, and the unit of work explained in order.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

export default function Writing() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <WritingView />
      </div>

      {/* The site footer, so this page closes the way every other route does. */}
      <div className={styles.footBase}>
        <SiteFooter />
      </div>
    </div>
  );
}
