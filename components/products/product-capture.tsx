import Image from "next/image";
import { ArrowUpRight, MoveHorizontal } from "lucide-react";
import { PRODUCT_CAPTURES, type ProductCaptureName } from "@/lib/product-media";
import { cn } from "@/lib/utils";
import styles from "./product-capture.module.css";

/** One treatment for source-attributed media across the product family. */
export function ProductCapture({
  capture,
  eager = false,
  className,
}: {
  capture: ProductCaptureName;
  eager?: boolean;
  className?: string;
}) {
  const media = PRODUCT_CAPTURES[capture];

  return (
    <figure className={cn(styles.frame, className)}>
      <div className={styles.caption}>
        <span>{media.label}</span>
        <a
          href={media.src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${media.label} at full size (opens in a new tab)`}
        >
          Full size <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div
        className={styles.viewport}
        role="region"
        aria-label={`${media.label} screenshot`}
        tabIndex={0}
      >
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading={eager ? "eager" : "lazy"}
          unoptimized
          className={styles.image}
        />
      </div>
      <figcaption className={styles.provenance}>
        <span>{media.provenance}</span>
        <span className={styles.panHint}>
          <MoveHorizontal aria-hidden="true" /> Scroll to explore
        </span>
      </figcaption>
    </figure>
  );
}
