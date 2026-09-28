import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Terminal,
  Users,
} from "lucide-react";
import { TrustedBy } from "./trusted-by";
import { ProductCapture } from "@/components/products/product-capture";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/ui/footer";
import { InstallCommand } from "@/components/ui/install-command";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { SPACE_DOCS_URL, SPACE_GITHUB_URL } from "@/lib/products";
import styles from "./home-page.module.css";

const OFFERINGS = [
  {
    id: "space",
    name: "XO Space",
    kind: "Open source",
    Icon: Terminal,
    title: "Build it yourself.",
    description:
      "Run your company from a Claude or Codex session. Open source, in your hands.",
    action: "Explore XO Space",
  },
  {
    id: "cloud",
    name: "XO Cloud",
    kind: "Managed platform",
    Icon: Cloud,
    title: "Keep it running.",
    description: "Create and manage autonomous AI employees that work around the clock.",
    action: "Explore XO Cloud",
  },
  {
    id: "machinespeed",
    name: "MachineSpeed",
    kind: "Enterprise solutions",
    Icon: Users,
    title: "Build with our team.",
    description:
      "Bring a business problem. Our people and agents build the solution with you.",
    action: "Explore MachineSpeed",
  },
] as const;

function Steps({ items }: { items: readonly { title: string; body: string }[] }) {
  return (
    <ol className={styles.steps}>
      {items.map((item, index) => (
        <li key={item.title}>
          <span className={styles.stepNumber} aria-hidden="true">
            0{index + 1}
          </span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HomePage() {
  return (
    <>
      <main id="main-content" className={styles.page}>
        <div className="site-container">
          <section className={styles.hero} aria-labelledby="home-title">
            <p className={styles.eyebrow}>Open source. Managed cloud. Human expertise.</p>
            <h1 id="home-title">
              Put AI to work
              <br />
              <span>across your business.</span>
            </h1>
            <p className={styles.intro}>
              Run your company from Claude or Codex, launch AI employees, or build a
              custom solution with our team.
            </p>
            <Button asChild size="lg">
              <a href="#offerings">
                Find your starting point <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </section>

          <section
            id="offerings"
            className={styles.offerings}
            aria-labelledby="offerings-title"
          >
            <div className={styles.sectionLabel}>
              <h2 id="offerings-title">Three ways to work with Quirq.</h2>
              <span>Choose what fits your team.</span>
            </div>
            <div className={styles.offeringGrid}>
              {OFFERINGS.map(({ id, name, kind, Icon, title, description, action }) => (
                <article key={id} className={styles.offering}>
                  <div className={styles.offeringTop}>
                    <Icon aria-hidden="true" />
                    <span>{kind}</span>
                  </div>
                  <h3>{name}</h3>
                  <p className={styles.offeringTitle}>{title}</p>
                  <p className={styles.offeringBody}>{description}</p>
                  <a href={`#${id}`} className={styles.textLink}>
                    {action}
                    <ArrowDown aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <TrustedBy />

          <section id="space" className={styles.product} aria-labelledby="space-title">
            <div className={styles.sectionLabel}>
              <p>01 / XO Space</p>
              <span>For developers</span>
            </div>
            <div className={styles.productGrid}>
              <div className={styles.productCopy}>
                <h2 id="space-title">
                  Your company.
                  <br />
                  One agent session.
                </h2>
                <p className={styles.body}>
                  An open-source workspace for managing your company from Claude Code or
                  Codex. Your projects, tools and workflows, in one place.
                </p>
                <Steps
                  items={[
                    {
                      title: "Make it yours",
                      body: "Install XO Space on your own machine.",
                    },
                    {
                      title: "Bring your agent",
                      body: "Connect Claude Code or Codex and the tools you use.",
                    },
                    {
                      title: "Get to work",
                      body: "Direct the work from your session. Inspect the results.",
                    },
                  ]}
                />
                <div className={styles.actions}>
                  <Button asChild>
                    <a href={SPACE_GITHUB_URL} target="_blank" rel="noopener noreferrer">
                      Get XO Space <ArrowUpRight aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Button>
                  <a
                    className={styles.textLink}
                    href={SPACE_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Setup guide <ArrowUpRight aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </div>
              <div className={styles.media}>
                <ProductCapture capture="spaceProjects" />
                <p className={styles.mediaNote}>
                  A place for the projects behind your company.
                </p>
                <details className={styles.install}>
                  <summary>
                    Install XO Space <span aria-hidden="true">+</span>
                  </summary>
                  <InstallCommand />
                </details>
              </div>
            </div>
          </section>

          <section id="cloud" className={styles.product} aria-labelledby="cloud-title">
            <div className={styles.sectionLabel}>
              <p>02 / XO Cloud</p>
              <span>For teams ready to delegate</span>
            </div>
            <div className={styles.productGrid}>
              <div className={styles.productCopy}>
                <h2 id="cloud-title">
                  AI employees.
                  <br />
                  Working 24/7.
                </h2>
                <p className={styles.body}>
                  Create, launch and manage autonomous AI employees on a managed platform.
                  You direct the work. XO Cloud runs the environment.
                </p>
                <Steps
                  items={[
                    {
                      title: "Choose your starting point",
                      body: "Pick a template for the agent you want to run.",
                    },
                    {
                      title: "Set it up for the job",
                      body: "Configure its environment. Connect your model account and tools.",
                    },
                    {
                      title: "Launch and manage",
                      body: "Give it work. Follow activity, usage and results.",
                    },
                  ]}
                />
                <div className={styles.actions}>
                  <TryOnXo />
                  <Link className={styles.textLink} href="/xo#pricing">
                    View plans <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
                <p className={styles.note}>
                  30 days free for eligible Starter and Pro accounts.
                </p>
              </div>
              <div className={styles.media}>
                <ProductCapture capture="xoCurrentTemplates" />
                <p className={styles.mediaNote}>
                  Start with an agent template. Make it your own.
                </p>
                <Link className={styles.textLink} href="/xo#setup">
                  See the setup walkthrough <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section
            id="machinespeed"
            className={styles.product}
            aria-labelledby="machinespeed-title"
          >
            <div className={styles.sectionLabel}>
              <p>03 / MachineSpeed</p>
              <span>For businesses with a problem to solve</span>
            </div>
            <div className={styles.productGrid}>
              <div className={styles.productCopy}>
                <h2 id="machinespeed-title">
                  Your business problem.
                  <br />
                  Our people and agents.
                </h2>
                <p className={styles.body}>
                  We design, build and run agent pipelines around your business. Work
                  directly with our team, see progress and shape the result.
                </p>
                <div className={styles.actions}>
                  <Button asChild>
                    <a href="mailto:hello@quirq.ai">
                      Tell us what you want to solve <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                </div>
                <p className={styles.note}>
                  Start with the problem. We’ll work through the solution together.
                </p>
              </div>
              <div className={styles.service}>
                <p className={styles.eyebrow}>
                  From a business problem to a working pipeline
                </p>
                <Steps
                  items={[
                    {
                      title: "Define the outcome",
                      body: "Show us what needs to change. We agree on what success looks like.",
                    },
                    {
                      title: "Build together",
                      body: "Our people and agents build around your tools. You see progress and shape the work.",
                    },
                    {
                      title: "Put it to work",
                      body: "Review the solution together and plan how it runs in your business.",
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          <section className={styles.closing} aria-labelledby="start-title">
            <p className={styles.eyebrow}>Your next move</p>
            <h2 id="start-title">Choose where to start.</h2>
            <div className={styles.closingLinks}>
              <a href="#space">
                <span>Build with XO Space</span>
                <ArrowRight aria-hidden="true" />
              </a>
              <a href="#cloud">
                <span>Run on XO Cloud</span>
                <ArrowRight aria-hidden="true" />
              </a>
              <a href="mailto:hello@quirq.ai">
                <span>Work with MachineSpeed</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
