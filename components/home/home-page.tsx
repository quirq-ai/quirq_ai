import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClaudeCodeIcon,
  CodexIcon,
  GithubIcon,
  OpenclawIcon,
} from "@/components/ui/brand-icons";
import { InstallCommand } from "@/components/ui/install-command";
import { SiteFooter } from "@/components/ui/footer";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { SPACE_DOCS_URL, SPACE_GITHUB_URL } from "@/lib/products";
import { TrustedBy } from "./trusted-by";
import styles from "./product-home.module.css";

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <Link className={styles.productLink} href="/products">
          Meet Space <span aria-hidden="true">/</span> by Quirq{" "}
          <ArrowRight aria-hidden="true" />
        </Link>
        <h1 id="home-title">
          Give your agents
          <br />a place to work.
        </h1>
        <p className={styles.intro}>
          Your projects, AI agents and tools in one working environment.
        </p>
        <div className={styles.actions}>
          <TryOnXo size="lg" />
          <Button asChild variant="ghost" size="lg">
            <Link href="/products">
              Explore Space <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <p className={styles.heroNote}>Free for 30 days on XO. Also open source.</p>
        <nav className={styles.heroResources} aria-label="Space resources">
          <a href={SPACE_GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a href={SPACE_DOCS_URL} target="_blank" rel="noopener noreferrer">
            Docs <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </nav>
      </div>
      <figure className={styles.heroVisual}>
        <a
          href="/assets/space-ui/projects.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.heroCapture}
          aria-label="View the Space Projects screenshot at full size, opens in a new tab"
        >
          <Image
            src="/assets/space-ui/projects.jpg"
            width={1280}
            height={720}
            alt="Space showing active projects, project files and recent activity."
            loading="eager"
            unoptimized
            className={styles.heroImage}
          />
          <span className={styles.expand}>
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">View full size</span>
          </span>
        </a>
        <figcaption>
          <span>Projects, in Space</span>
          <span>Example workspace</span>
        </figcaption>
      </figure>
    </section>
  );
}

function ProductBenefits() {
  return (
    <section className={styles.benefits} aria-labelledby="benefits-heading">
      <header className={styles.sectionHeading}>
        <p className={styles.eyebrow}>Built around the project</p>
        <h2 id="benefits-heading">
          Keep the whole project
          <br />
          within reach.
        </h2>
        <p>From the first file to the next handoff, Space keeps the work together.</p>
      </header>
      <div className={styles.benefitGrid}>
        <article>
          <h3>Give the work a home.</h3>
          <p>Files, code and Git history, organized around your projects.</p>
          <Link className={styles.textLink} href="/products#projects">
            Inside a Space <ArrowRight aria-hidden="true" />
          </Link>
        </article>
        <article>
          <h3>Bring your agents.</h3>
          <p>Work with the agents you use. Follow their sessions and usage.</p>
          <div
            className={styles.agents}
            aria-label="Supports Claude Code, Codex and OpenClaw"
          >
            <ClaudeCodeIcon title="Claude Code" />
            <CodexIcon title="Codex" />
            <OpenclawIcon title="OpenClaw" />
            <Link className={styles.textLink} href="/products#agents">
              Explore agents <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </article>
        <article>
          <h3>Make the handoff.</h3>
          <p>Share a project with another Space. Review changes before applying them.</p>
          <Link className={styles.textLink} href="/products#sharing">
            See project sharing <ArrowRight aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}

function Enterprise() {
  return (
    <section className={styles.enterprise} aria-labelledby="enterprise-heading">
      <div className={styles.enterpriseCopy}>
        <p className={styles.eyebrow}>Machine Speed / For your business</p>
        <h2 id="enterprise-heading">
          AI that fits
          <br />
          the way you work.
        </h2>
        <p>
          Custom workflows, connected systems and infrastructure. Built with your team,
          around your business.
        </p>
        <Button asChild variant="outline" size="lg">
          <Link href="/machinespeed">
            Build with Quirq <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <div className={styles.enterpriseArt} aria-hidden="true">
        <Image
          src="/assets/mobius.jpg"
          width={1400}
          height={1400}
          sizes="(min-width: 800px) 600px, 100vw"
          alt=""
        />
      </div>
    </section>
  );
}

function GetStarted() {
  return (
    <section className={styles.start} aria-labelledby="start-heading">
      <p className={styles.eyebrow}>Your next project</p>
      <h2 id="start-heading">
        Open a Space.
        <br />
        See what you can do.
      </h2>
      <p>Try Space on XO, free for 30 days.</p>
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
    </section>
  );
}

/** Homepage introduces the company and product; /products owns the walkthrough. */
export function HomePage() {
  return (
    <>
      <main id="main-content" className={styles.home}>
        <div className="site-container">
          <Hero />
          <TrustedBy />
          <ProductBenefits />
          <Enterprise />
          <GetStarted />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
