import type { Metadata } from "next";
import { ProductsPage } from "@/components/products/products-page";

const DESCRIPTION =
  "Deploy an agentic workforce environment two ways: managed on our cloud and self-serve, or licensed onto infrastructure you already own and stood up by our engineers. Any harness, any model, any cloud.";

export const metadata: Metadata = {
  title: "Products",
  description: DESCRIPTION,
  openGraph: {
    title: "Products",
    description: DESCRIPTION,
    url: "/products",
  },
  twitter: { description: DESCRIPTION },
};

/**
 * The products surface. Content lives in lib/products.ts and the presentation
 * in components/products, so adding a harness or a plan never touches this
 * file.
 */
export default function Page() {
  return <ProductsPage />;
}
