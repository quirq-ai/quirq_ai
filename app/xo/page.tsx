import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Cloud,
  Plug,
  Server,
  SquareTerminal,
} from "lucide-react";
import { ProductMotion } from "@/components/products/product-motion";
import { ProductTour } from "@/components/products/product-tour";
import { ProductCapture } from "@/components/products/product-capture";
import { XoPricing } from "@/components/products/xo-pricing";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/ui/footer";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { XoLogo } from "@/components/ui/xo-logo";
import styles from "./xo.module.css";

const CLOUD_DOCS_URL = "https://docs.quirq.ai/docs/cloud";
const DESCRIPTION =
  "Cloud computers for your agents. Choose a template, configure a Space, connect your tools and monitor usage. Starter, Pro, Business and custom Enterprise deployments.";

export const metadata: Metadata = {
  title: "Cloud — XO",
  description: DESCRIPTION,
  alternates: { canonical: "/xo" },
  openGraph: {
    title: "Cloud — XO",
    description: DESCRIPTION,
    url: "/xo",
  },
  twitter: { description: DESCRIPTION },
};

const CHAPTERS = [
  { href: "#setup", label: "Templates" },
  { href: "#workspace", label: "Your workspace" },
  { href: "#pricing", label: "Pricing" },
  { href: "#enterprise", label: "Enterprise" },
] as const;

export default function XoPage() {
  return (
    <>
      <main id="main-content" className={styles.page}>
        <ProductMotion className="site-container">
          <header className={styles.hero}>
            <div className={styles.brand}>
              <XoLogo className={styles.logo} />
              <span className="sr-only">XO</span>
              <span className={styles.byline}>Managed cloud, by Quirq</span>
            </div>
            <h1>
              A cloud computer.
              <br />
              Ready for your agent.
            </h1>
            <p className={styles.intro}>Choose your agent. XO handles the environment.</p>
            <div className={styles.actions}>
              <TryOnXo size="lg" />
              <a href="#setup" className={styles.textLink}>
                See how it works <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <p className={styles.trial}>Eligible plans: 30 days free. From $10/month.</p>
          </header>

          <div className={styles.heroPreview} data-product-reveal>
            <ProductTour tour="setup" />
          </div>

          <nav className={styles.chapters} aria-label="On this page">
            {CHAPTERS.map((chapter) => (
              <a key={chapter.href} href={chapter.href}>
                {chapter.label} <ArrowDown aria-hidden="true" />
              </a>
            ))}
          </nav>

          <section
            id="setup"
            className={styles.setup}
            aria-labelledby="setup-heading"
            data-product-reveal
          >
            <div className={styles.featureHeading}>
              <div>
                <p className={styles.eyebrow}>01 / Choose</p>
                <h2 id="setup-heading">Start from a template.</h2>
              </div>
              <p className={styles.body}>
                Codex, Claude Code, OpenClaw, Hermes and more.
              </p>
            </div>
            <ProductCapture capture="xoCurrentTemplates" />
            <div className={styles.setupNotes}>
              <p>Ready-made templates. Your choice of harness.</p>
              <a href={CLOUD_DOCS_URL} target="_blank" rel="noopener noreferrer">
                Cloud docs <ArrowUpRight aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>

            <details className={styles.example}>
              <summary>
                02 / Configure your Space <span aria-hidden="true">+</span>
              </summary>
              <div className={styles.exampleContent}>
                <div>
                  <h3>A setup that fits the job.</h3>
                  <p className={styles.body}>
                    Name it. Choose storage. Create your Space, then connect your model
                    account or API key.
                  </p>
                  <a
                    className={styles.textLink}
                    href={CLOUD_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore setup guides <ArrowUpRight aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
                <ProductCapture capture="xoCurrentConfiguration" />
              </div>
            </details>
          </section>

          <section
            id="workspace"
            className={styles.workspace}
            aria-labelledby="workspace-heading"
            data-product-reveal
          >
            <div className={styles.workspaceIntro}>
              <p className={styles.eyebrow}>03 / Work</p>
              <h2 id="workspace-heading">Your tools. One workspace.</h2>
              <dl className={styles.workspaceBenefits}>
                <div>
                  <dt>
                    <SquareTerminal aria-hidden="true" /> Your editor
                  </dt>
                  <dd>Browser terminal, VS Code or Cursor.</dd>
                </div>
                <div>
                  <dt>
                    <Plug aria-hidden="true" /> Your connections
                  </dt>
                  <dd>Models, GitHub and Google Drive.</dd>
                </div>
                <div>
                  <dt>
                    <ChartNoAxesCombined aria-hidden="true" /> Your usage
                  </dt>
                  <dd>Tokens, messages and model costs.</dd>
                </div>
              </dl>
              <p className={styles.secondaryBody}>
                Apps and connections vary by template.
              </p>
            </div>
            <ProductTour tour="usage" />
          </section>

          <XoPricing />
          <details className={styles.example}>
            <summary>
              See the plans inside XO <span aria-hidden="true">+</span>
            </summary>
            <div className={styles.pricingTour}>
              <ProductTour tour="pricing" />
            </div>
          </details>

          <section
            id="enterprise"
            className={styles.enterprise}
            aria-labelledby="enterprise-heading"
            data-product-reveal
          >
            <div className={styles.enterpriseIntro}>
              <p className={styles.eyebrow}>XO Enterprise</p>
              <h2 id="enterprise-heading">Your cloud. Your policies. Your brand.</h2>
              <p className={styles.body}>
                Self-host, connect your cloud, or offer XO under your own brand.
              </p>
              <Button asChild variant="outline" size="lg">
                <a href="mailto:hello@quirq.ai?subject=XO%20Enterprise%20deployment">
                  Talk to us <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Link href="/machinespeed" className={styles.textLink}>
                Custom workflows? Machine Speed <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div>
              <figure className={styles.cloudMap}>
                <div className={styles.platformNode}>
                  <span>Your brand</span>
                  <span>
                    Powered by <XoLogo />
                    <span className="sr-only">XO</span>
                  </span>
                </div>
                <div className={styles.branches} aria-hidden="true" />
                <ul className={styles.cloudNodes}>
                  <li>
                    <Cloud aria-hidden="true" /> Cloud A
                  </li>
                  <li>
                    <Cloud aria-hidden="true" /> Cloud B
                  </li>
                  <li>
                    <Server aria-hidden="true" /> Self-hosted
                  </li>
                </ul>
                <figcaption>
                  Your policies. White-label across multiple clouds.
                </figcaption>
              </figure>
            </div>
          </section>

          <div className={styles.closing} data-product-reveal>
            <div>
              <h2>Give your next task a computer.</h2>
              <p>30 days free on eligible Starter and Pro plans.</p>
            </div>
            <TryOnXo size="lg" />
          </div>
        </ProductMotion>
      </main>
      <SiteFooter />
    </>
  );
}
