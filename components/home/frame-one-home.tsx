import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/ui/footer";
import { QuirqLogo } from "@/components/ui/quirq-logo";
import {
  LayersSelector,
  WorkflowSelector,
} from "./frame-one-home-interactions";
import styles from "./frame-one-home-responsive.module.css";

const ASSET_ROOT = "/assets/home-v9";

const ECOSYSTEM_LOGOS = [
  {
    name: "OpenAI",
    src: "logo-openai.svg",
    x: 47.148773,
    y: 45.06189,
    width: 118.261589,
    height: 31.450027,
  },
  {
    name: "Google",
    src: "logo-google.svg",
    x: 223.033401,
    y: 44.575074,
    width: 98.093689,
    height: 32.423672,
  },
  {
    name: "AWS",
    src: "logo-aws.svg",
    x: 378.750122,
    y: 39.763367,
    width: 66.149963,
    height: 42.047028,
    opacity: 0.5,
  },
  {
    name: "OKX",
    src: "logo-okx.svg",
    x: 502.523132,
    y: 48.163697,
    width: 84.163483,
    height: 25.246399,
  },
  {
    name: "Shopify",
    src: "logo-shopify.svg",
    x: 644.309631,
    y: 39.286866,
    width: 137,
    height: 43,
  },
  {
    name: "Nevermined",
    src: "logo-nevermined.svg",
    x: 838.932678,
    y: 49.544251,
    width: 207.676743,
    height: 22.485186,
  },
  {
    name: "Shodai",
    src: "logo-shodai.png",
    x: 1104.232422,
    y: 44.90448,
    width: 113.300987,
    height: 31.76474,
    opacity: 0.5,
  },
  {
    name: "MagicPath",
    src: "logo-magicpath.png",
    x: 1275.156494,
    y: 46.331726,
    width: 125.175598,
    height: 28.910336,
    opacity: 0.5,
  },
] as const;

const LAUNCHER_ICONS = [
  { name: "Claude", src: "launcher-claude.svg", width: 37, height: 37 },
  { name: "OpenAI", src: "launcher-openai.svg", width: 39, height: 40 },
  { name: "Cursor", src: "launcher-cursor.svg", width: 33, height: 38 },
  { name: "DeepSeek", src: "launcher-deepseek.svg", width: 62, height: 62 },
] as const;

/**
 * The home page's own footer, which is a different list from the shared one.
 *
 * Four of these pointed at stand-ins from before the pages they name existed:
 * Products went to the dashboard, Writing to research, Documentation to the
 * explainer, and Machine Speed to the engine walkthrough. They now go where
 * their labels say.
 *
 * Privacy Policy and Terms still have no page behind them and currently 404.
 * Left as authored rather than quietly deleted, because the answer is to write
 * those two pages, not to drop the links.
 */
const FOOTER_COLUMNS = [
  [
    { label: "PRODUCTS", href: "/products" },
    { label: "WRITING", href: "/writing" },
    { label: "RESEARCH", href: "/research" },
  ],
  [
    { label: "GET STARTED", href: "/products" },
    { label: "DOCUMENTATION", href: "/docs" },
    { label: "WHITE PAPER", href: "/whitepaper" },
  ],
  [
    { label: "MACHINE SPEED", href: "/machinespeed" },
    { label: "PRIVACY POLICY", href: "/privacy" },
    { label: "TERMS & CONDITIONS", href: "/terms" },
  ],
] as const;

const FOOTER_LINKS = FOOTER_COLUMNS.flat();

function ExactImage({
  src,
  alt,
  width,
  height,
  className,
  eager = false,
  sizes,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
  sizes?: string;
  unoptimized?: boolean;
}) {
  return (
    <Image
      src={`${ASSET_ROOT}/${src}`}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes ?? `${width}px`}
      unoptimized={unoptimized || src.endsWith(".svg") || src.endsWith(".png")}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <ExactImage
        src="hero-art.png"
        alt=""
        width={806}
        height={850}
        className={styles.heroArt}
        eager
        sizes="(max-width: 699px) 500px, (max-width: 899px) 60vw, (max-width: 1439px) 56vw, 806px"
      />

      <div className={styles.heroCopy}>
        <QuirqLogo
          className={styles.heroWordmark}
          loading="eager"
          fetchPriority="high"
        />
        <h1 id="home-title" className={styles.heroTitle}>
          Secure Environments
          <br />
          for Agentic Workforces
        </h1>
        <p className={styles.heroTagline}>Any model. Any harness. Any cloud.</p>
        <div className={styles.heroActions}>
          <Link href="/products" className={styles.primaryButton}>
            Get Started
          </Link>
          <Link href="/whitepaper" className={styles.secondaryButton}>
            Whitepaper
          </Link>
        </div>
      </div>

      <div className={styles.trustedBlock}>
        <p className={styles.trustedLabel}>TRUSTED BY</p>
        <div className={styles.trustedLogos}>
          {ECOSYSTEM_LOGOS.map((logo) => (
            <span
              key={logo.name}
              className={styles.trustedLogo}
              style={{
                left: logo.x,
                top: logo.y,
                width: logo.width,
                height: logo.height,
                opacity: 0.5,
              }}
            >
              <Image
                src={`${ASSET_ROOT}/${logo.src}`}
                alt={logo.name}
                fill
                sizes={`${logo.width}px`}
                unoptimized={logo.src.endsWith(".svg")}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Definition() {
  return (
    <section className={styles.definition} aria-labelledby="definition-title">
      <Image
        src={`${ASSET_ROOT}/definition-glow.png`}
        alt=""
        fill
        sizes="100vw"
        className={styles.definitionGlow}
        unoptimized
      />
      <div className={styles.definitionCopy}>
        <h2 id="definition-title">What is a quirq?</h2>
        <p>
          More tokens does not equal more work.
          <br />
          We use machine-level observability and high-level math
          <br />
          to calculate the true unit of work: <strong>the quirq.</strong>
        </p>
        <Link href="/research/the-quirq">Read the Research →</Link>
      </div>

      <WorkflowSelector />
    </section>
  );
}

function Features() {
  return (
    <section className={styles.features} aria-labelledby="features-title">
      <ExactImage
        src="feature-burst.png"
        alt=""
        width={1440}
        height={1071}
        className={styles.featureBurst}
        sizes="100vw"
      />
      <h2 id="features-title" className={styles.featuresTitle}>
        Launch Agentic Environments
        <br />
        with Speed and Security
      </h2>

      <div className={styles.featureGrid}>
        <article className={`${styles.featureCard} ${styles.dynamicCard} ${styles.exportedCard}`}>
          <Image
            src={`${ASSET_ROOT}/dynamic-card-art.png`}
            alt=""
            fill
            sizes="(max-width: 699px) calc(100vw - 32px), 58vw"
            className={styles.cardArt}
            unoptimized
          />
          <div className={styles.cardCopy}>
            <h3>Dynamic Scaling</h3>
            <p>
              Spin up an environment with the press of a button. Our proprietary scaling
              solution auto provisions the capacity, specs and location you need.
            </p>
          </div>
        </article>

        <article className={`${styles.featureCard} ${styles.productionCard}`}>
          <div className={styles.cardCopy}>
            <h3>Production-ready</h3>
            <p>Deploy direct to AWS, GCP, Azure or any Terraform compatible stack.</p>
          </div>
          <ExactImage
            src="production-timeline.png"
            alt="Deployment timeline from merge through heartbeat."
            width={276}
            height={252}
            className={styles.productionTimeline}
          />
        </article>

        <article className={styles.featureCard}>
          <div className={styles.cardCopy}>
            <h3>Context Optimization</h3>
            <p>Our engine interprets your goals and draws from your data.</p>
          </div>
          <div className={styles.contextVisual} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>

        <article className={`${styles.featureCard} ${styles.costCard} ${styles.exportedCard}`}>
          <Image
            src={`${ASSET_ROOT}/cost-card-art.png`}
            alt=""
            fill
            sizes="(max-width: 699px) calc(100vw - 32px), 56vw"
            className={styles.cardArt}
            unoptimized
          />
          <div className={styles.cardCopy}>
            <h3>Unified Cost Observability</h3>
            <p>
              Each environment comes with our Quirq analytics software that detail the costs,
              time spent, and tasks of your agents in real-time.
            </p>
          </div>
        </article>

        <article className={styles.featureCard}>
          <div className={styles.cardCopy}>
            <h3>Universal Runtime</h3>
            <p>Use any model, harness or framework within your environment.</p>
          </div>
          <ExactImage
            src="runtime-visual-figma.png"
            alt="Runtime capabilities spanning memory, context, skills, artifacts, documents, Git, integrations, and MCP."
            width={282}
            height={311}
            className={styles.runtimeVisual}
            unoptimized
          />
        </article>

        <article className={styles.featureCard}>
          <div className={styles.cardCopy}>
            <h3>Security Compliances</h3>
            <p>Our software can be deployed under your existing compliance standards.</p>
          </div>
          <ExactImage
            src="security-visual-figma.svg"
            alt=""
            width={285}
            height={285}
            className={styles.securityVisual}
            unoptimized
          />
        </article>

        <article className={`${styles.featureCard} ${styles.efficiencyCard}`}>
          <div className={styles.cardCopy}>
            <h3>Efficiency Charts</h3>
            <p>Understand the human input to agent output efficiency ratio.</p>
          </div>
          <ExactImage
            src="efficiency-visual-figma.png"
            alt="Cost efficiency increased 87 percent over the past 30 days."
            width={290}
            height={300}
            className={styles.efficiencyPanel}
            unoptimized
          />
        </article>
      </div>
    </section>
  );
}

function Layers() {
  return (
    <section className={styles.layers} aria-labelledby="layers-title">
      <Image
        src={`${ASSET_ROOT}/layers-background.png`}
        alt=""
        fill
        sizes="100vw"
        className={styles.layersBackground}
        unoptimized
      />
      <h2 id="layers-title" className={styles.layersTitle}>Four Layers. One Shape.</h2>
      <LayersSelector />
      <Link href="/products" className={styles.layersCta}>Get Started</Link>
    </section>
  );
}

function Install() {
  return (
    <section className={styles.install} aria-labelledby="install-title">
      <div className={styles.installCopy}>
        <ExactImage src="mark-install.svg" alt="" width={84} height={84} />
        <h2 id="install-title">
          Install on your
          <br />
          <span>local hardware</span>
        </h2>
        <p>
          Download the free open-source version of our observability tools so you can monitor
          your local usage right away.
        </p>
      </div>
      <div className={styles.installCard}>
        <h2>Get Started</h2>
        <p className={styles.shellLabel}>RUN IN YOUR SHELL</p>
        <code>curl -fsSL quirq.ai/install | sh</code>
        <div className={styles.installLaunchers}>
          <p>OR LAUNCH FROM</p>
          <div role="list" aria-label="Supported runtimes">
            {LAUNCHER_ICONS.map((icon) => (
              <span key={icon.name} title={icon.name} role="listitem">
                <ExactImage
                  src={icon.src}
                  alt={icon.name}
                  width={icon.width}
                  height={icon.height}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <SiteFooter
      links={FOOTER_LINKS}
      brandSuffix={null}
      note="COPYRIGHT 2026 • QUIRQ LLC"
    />
  );
}

export function FrameOneHome() {
  return (
    <main className={styles.home}>
      <div className={styles.frame}>
        <Hero />
        <Definition />
        <Features />
        <Layers />
        <Install />
      </div>
      <div className="flow-root bg-black">
        <Footer />
      </div>
    </main>
  );
}
