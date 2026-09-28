import Image from "next/image";
import styles from "./trusted-by.module.css";

// Preserve the names and claim from the published FrameOneHome at 13c26af.
// These are its original logo files, not the separate compatible-agent list.
const LOGOS = [
  { name: "OpenAI", file: "logo-openai.svg", width: 118.262, height: 31.45, size: 96 },
  { name: "Google", file: "logo-google.svg", width: 98.094, height: 32.424, size: 80 },
  { name: "AWS", file: "logo-aws.svg", width: 66.15, height: 42.047, size: 50 },
  { name: "OKX", file: "logo-okx.svg", width: 84.163, height: 25.246, size: 66 },
  { name: "Shopify", file: "logo-shopify.svg", width: 137, height: 43, size: 104 },
  {
    name: "Nevermined",
    file: "logo-nevermined.svg",
    width: 207.677,
    height: 22.485,
    size: 144,
  },
  { name: "Shodai", file: "logo-shodai.png", width: 560, height: 157, size: 100 },
  { name: "MagicPath", file: "logo-magicpath.png", width: 407, height: 94, size: 106 },
] as const;

export function TrustedBy() {
  return (
    <section className={styles.trusted} aria-label="Trusted by">
      <p className={styles.label} aria-hidden="true">
        Trusted by
      </p>
      <ul className={styles.logos}>
        {LOGOS.map((logo) => (
          <li key={logo.name} className={styles.logo}>
            <Image
              src={`/assets/trusted-by/${logo.file}`}
              alt={logo.name}
              width={logo.width}
              height={logo.height}
              sizes={`${logo.size}px`}
              style={{ width: logo.size }}
              className={
                logo.name === "AWS" || logo.file.endsWith(".png")
                  ? styles.fullOpacityAsset
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
