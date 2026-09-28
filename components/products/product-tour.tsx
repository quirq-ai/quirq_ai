import { Download } from "lucide-react";
import { PRODUCT_TOURS, type ProductTourName } from "@/lib/product-media";
import styles from "./product-tour.module.css";

const MEDIA_ROOT = "/assets/xo-ui/review-2026-09-22";

/** Native playback keeps the actual product footage usable without JavaScript. */
export function ProductTour({ tour }: { tour: ProductTourName }) {
  const media = PRODUCT_TOURS[tour];
  const video = `${MEDIA_ROOT}/${media.file}.mp4`;

  return (
    <figure className={styles.frame}>
      <div className={styles.heading}>
        <span>{media.title}</span>
        <span>{media.duration}</span>
      </div>
      <video
        className={styles.video}
        controls
        playsInline
        preload="none"
        width={1392}
        height={940}
        poster={`${MEDIA_ROOT}/${media.poster}`}
        aria-label={media.title}
        aria-describedby={`${tour}-tour-caption`}
      >
        <source src={video} type="video/mp4" />
        <track
          kind="captions"
          src={`${MEDIA_ROOT}/${media.file}.vtt`}
          srcLang="en"
          label="English"
        />
        <a href={video}>Watch {media.title}</a>
      </video>
      <figcaption id={`${tour}-tour-caption`} className={styles.caption}>
        <span>{media.note}</span>
        <a href={video} download>
          <Download aria-hidden="true" /> Save MP4
        </a>
      </figcaption>
      <details className={styles.transcript}>
        <summary>Tour transcript</summary>
        <p>{media.transcript}</p>
      </details>
    </figure>
  );
}
