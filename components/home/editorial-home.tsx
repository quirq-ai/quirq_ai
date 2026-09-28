import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClaudeCodeIcon,
  CodexIcon,
  GithubIcon,
  OpenclawIcon,
} from "@/components/ui/brand-icons";
import { SiteFooter } from "@/components/ui/footer";
import { InstallCommand } from "@/components/ui/install-command";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { PRODUCT_CAPTURES, type ProductCaptureName } from "@/lib/product-media";
import { SPACE_DOCS_URL, SPACE_GITHUB_URL } from "@/lib/products";
import { TrustedBy } from "./trusted-by";
import styles from "./editorial-home.module.css";

const BENEFITS = [
  {
    number: "01",
    label: "Projects",
    title: "Give the work a home.",
    description: "Files, code and Git history, organized around your projects.",
    href: "/products#projects",
    action: "Inside a Space",
    capture: "spaceProjects",
  },
  {
    number: "02",
    label: "Agents",
    title: "Bring your agents.",
    description: "Work with the agents you use. Follow their sessions and usage.",
    href: "/products#agents",
    action: "Explore agents",
    capture: "spaceSessions",
  },
  {
    number: "03",
    label: "Sharing",
    title: "Make the handoff.",
    description:
      "Share a project with another Space. Review changes before applying them.",
    href: "/products#sharing",
    action: "See project sharing",
    capture: "spaceSharing",
  },
] as const;

/** An editorial crop links to the untouched, source-attributed product capture. */
function EditorialCapture({
  capture,
  hero = false,
}: {
  capture: ProductCaptureName;
  hero?: boolean;
}) {
  const media = PRODUCT_CAPTURES[capture];
  return (
    <figure className={hero ? styles.heroCapture : styles.featureCapture}>
      <a
        href={media.src}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.screenLink}
        aria-label={`View ${media.label} at full size (opens in a new tab)`}
      >
        <Image
          src={media.src}
          width={media.width}
          height={media.height}
          alt={media.alt}
          loading={hero ? "eager" : "lazy"}
          unoptimized
          className={styles.screenImage}
        />
        <span className={styles.expand} aria-hidden="true">
          <ArrowUpRight />
        </span>
      </a>
      <figcaption>
        <span>{hero ? "Projects, in Space" : "View full screen"}</span>
        <span>{media.provenance}</span>
      </figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="draft-title">
      <div className="site-container">
        <div className={styles.heroTopline}>
          <Link href="/products" className={styles.productLink}>
            Meet Space <span aria-hidden="true">/</span> by Quirq
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <nav className={styles.resources} aria-label="Space resources">
            <a href={SPACE_GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <GithubIcon /> GitHub <ArrowUpRight aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a href={SPACE_DOCS_URL} target="_blank" rel="noopener noreferrer">
              Docs <ArrowUpRight aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </nav>
        </div>
        <div className={styles.heroHeading}>
          <h1 id="draft-title">
            Give your agents
            <br />
            <span>a place to work.</span>
          </h1>
          <div className={styles.heroAside}>
            <p>Your projects, AI agents and tools in one working environment.</p>
            <div className={styles.actions}>
              <TryOnXo size="lg" />
              <Link href="/products" className={styles.textLink}>
                Explore Space <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
            <p className={styles.trial}>Free for 30 days on XO. Also open source.</p>
          </div>
        </div>
        <div className={styles.heroStage}>
          <div className={styles.stageLight} aria-hidden="true" />
          <EditorialCapture capture="spaceProjects" hero />
        </div>
        <a className={styles.scrollLink} href="#draft-benefits">
          Built around the project <ArrowDown aria-hidden="true" />
        </a>
        <TrustedBy />
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section
      id="draft-benefits"
      className={styles.benefits}
      aria-labelledby="draft-benefits-title"
    >
      <div className="site-container">
        <p className={styles.eyebrow}>Built around the project</p>
        <header className={styles.benefitsHeader}>
          <h2 id="draft-benefits-title">
            Keep the whole project
            <br />
            <span>within reach.</span>
          </h2>
          <p>From the first file to the next handoff, Space keeps the work together.</p>
        </header>
        <div className={styles.benefitGrid}>
          {BENEFITS.map((benefit) => (
            <article key={benefit.number} className={styles.benefit}>
              <div className={styles.benefitLabel}>
                <span>{benefit.number}</span>
                <span>{benefit.label}</span>
              </div>
              <EditorialCapture capture={benefit.capture} />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              {benefit.capture === "spaceSessions" && (
                <div className={styles.agents}>
                  <ClaudeCodeIcon title="Claude Code" />
                  <CodexIcon title="Codex" />
                  <OpenclawIcon title="OpenClaw" />
                </div>
              )}
              <Link href={benefit.href} className={styles.textLink}>
                {benefit.action} <ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Enterprise() {
  return (
    <section className={styles.enterprise} aria-labelledby="draft-enterprise-title">
      <div className={`site-container ${styles.enterpriseGrid}`}>
        <div className={styles.enterpriseCopy}>
          <p className={styles.eyebrow}>Machine Speed / For your business</p>
          <h2 id="draft-enterprise-title">
            AI that fits
            <br />
            the way
            <br />
            <span>you work.</span>
          </h2>
          <p className={styles.enterpriseBody}>
            Custom workflows, connected systems and infrastructure. Built with your team,
            around your business.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/machinespeed">
              Build with Quirq <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className={styles.enterpriseArt} aria-hidden="true">
          <Image
            src="/assets/mobius.jpg"
            width={1400}
            height={1400}
            sizes="(min-width: 800px) 55vw, 100vw"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section className={styles.start} aria-labelledby="draft-start-title">
      <div className="site-container">
        <div className={styles.startRule} aria-hidden="true" />
        <p className={styles.eyebrow}>Your next project</p>
        <h2 id="draft-start-title">
          Open a Space.
          <br />
          <span>See what you can do.</span>
        </h2>
        <p className={styles.startIntro}>Try Space on XO, free for 30 days.</p>
        <TryOnXo size="lg" />
        <div className={styles.developerLinks}>
          <details className={styles.localInstall}>
            <summary>
              Run open source <ChevronDown aria-hidden="true" />
            </summary>
            <div className={styles.install}>
              <InstallCommand />
            </div>
          </details>
          <a
            className={styles.githubLink}
            href={SPACE_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon /> GitHub <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <Link href="/" className={styles.compareLink}>
          Compare with the original draft <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/** A separate visual study. The accepted homepage and its route stay intact. */
export function EditorialHome() {
  return (
    <>
      <main id="main-content" className={styles.draft}>
        <Hero />
        <Benefits />
        <Enterprise />
        <GetStarted />
      </main>
      <SiteFooter />
    </>
  );
}
