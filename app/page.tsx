import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";

const DESCRIPTION =
  "Your projects, AI agents and tools in one working environment. Explore Space, try it free for 30 days on XO, or build custom workflows with Quirq.";
const TITLE = "quirq — Space for agentic work";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://quirq.ai",
    type: "website",
    images: [{ url: "/assets/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/assets/og.jpg"],
  },
};

export default function Page() {
  return <HomePage />;
}
