import type { Metadata } from "next";
import { EditorialHome } from "@/components/home/editorial-home";

export const metadata: Metadata = {
  title: "Space — visual draft",
  description:
    "A second visual direction for Quirq. Your projects, AI agents and tools in one working environment.",
  robots: { index: false, follow: false },
};

export default function DraftPage() {
  return <EditorialHome />;
}
