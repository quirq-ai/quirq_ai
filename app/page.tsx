import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";

const DESCRIPTION =
  "Run your company from Claude or Codex with XO Space, launch AI employees on XO Cloud, or build a custom solution with MachineSpeed.";
const TITLE = "quirq — Put AI to work across your business";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
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
