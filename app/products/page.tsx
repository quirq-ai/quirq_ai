import type { Metadata } from "next";
import { ProductsPage } from "@/components/products/products-page";

const DESCRIPTION =
  "Space is the open-source environment for projects, files, tools and agent activity. Share Git-backed projects, review changes, and run locally or on XO cloud computers.";

export const metadata: Metadata = {
  title: "Space",
  description: DESCRIPTION,
  openGraph: {
    title: "Space — the whole project in one environment",
    description: DESCRIPTION,
    url: "/products",
  },
  twitter: { description: DESCRIPTION },
};

export default function Page() {
  return <ProductsPage />;
}
