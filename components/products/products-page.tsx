import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { DeploymentOptions } from "@/components/products/deployment-options";
import { ProductCapture } from "@/components/products/product-capture";
import { ProductMotion } from "@/components/products/product-motion";
import { ClaudeCodeIcon, CodexIcon, OpenclawIcon } from "@/components/ui/brand-icons";
import { SiteFooter } from "@/components/ui/footer";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { SPACE_DOCS_URL, SPACE_GITHUB_URL } from "@/lib/products";
import { cn } from "@/lib/utils";
import styles from "./products.module.css";

const CHAPTERS = [
  { href: "#projects", label: "Projects" },
  { href: "#agents", label: "Agents" },
  { href: "#sharing", label: "Sharing" },
  { href: "#pricing", label: "Run Space" },
] as const;

const AGENTS = [
  { name: "Claude Code", Icon: ClaudeCodeIcon },
  { name: "Codex", Icon: CodexIcon },
  { name: "OpenClaw", Icon: OpenclawIcon },
] as const;

const SHARING_STEPS = [
  { title: "Share", description: "Send a project to a Space ID." },
  { title: "Review", description: "Check Git commits in Inbox → Sharing." },
  { title: "Apply", description: "Bring the changes into your copy." },
] as const;

export function ProductsPage() {
  return (
    <>
      <main id="main-content" className={styles.page}>
        <ProductMotion className="site-container">
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Space, by Quirq · Open source</p>
            <div className={styles.heroContent}>
              <h1>
                The whole project.
                <br />
                In one Space.
              </h1>
              <div>
                <p className={styles.intro}>Your files, tools and agents. Together.</p>
                <div className={styles.actions}>
                  <TryOnXo size="lg" />
                  <a href="#opensource" className={styles.textLink}>
                    Run locally <ArrowDown aria-hidden="true" />
                  </a>
                </div>
                <p className={styles.trial}>
                  30 days free on eligible Starter and Pro plans.
                </p>
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
            </div>
            <nav className={styles.chapterNav} aria-label="On this page">
              {CHAPTERS.map((chapter) => (
                <a key={chapter.href} href={chapter.href}>
                  {chapter.label}
                  <ArrowDown aria-hidden="true" />
                </a>
              ))}
            </nav>
          </header>

          <div id="platform" className={styles.walkthrough}>
            <section
              id="projects"
              className={cn(styles.chapter, styles.projects)}
              aria-labelledby="projects-heading"
              data-product-reveal
            >
              <div className={styles.chapterHeader}>
                <div>
                  <p className={styles.eyebrow}>01 / Projects</p>
                  <h2 id="projects-heading">Your projects, organized.</h2>
                </div>
                <p className={styles.body}>
                  Files, Git history and recent agent activity.
                </p>
              </div>
              <ProductCapture capture="spaceProjects" eager />
            </section>

            <section
              id="agents"
              className={cn(styles.chapter, styles.agents)}
              aria-labelledby="agents-heading"
              data-product-reveal
            >
              <div className={styles.agentCopy}>
                <p className={styles.eyebrow}>02 / Agents</p>
                <h2 id="agents-heading">Follow every session.</h2>
                <p className={styles.body}>
                  Connect your own agent accounts. Track activity and token usage.
                </p>
                <ul className={styles.agentList} aria-label="Supported agent examples">
                  {AGENTS.map(({ name, Icon }) => (
                    <li key={name}>
                      <Icon />
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ProductCapture capture="spaceSessions" />
            </section>

            <section
              id="sharing"
              className={cn(styles.chapter, styles.sharing)}
              aria-labelledby="sharing-heading"
              data-product-reveal
            >
              <div className={styles.sharingHeader}>
                <p className={styles.eyebrow}>03 / Sharing</p>
                <h2 id="sharing-heading">Share the project.</h2>
              </div>
              <ProductCapture capture="spaceSharing" />
              <ol className={styles.sharingFlow} aria-label="Project sharing flow">
                {SHARING_STEPS.map((step, index) => (
                  <li key={step.title}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                    {index < SHARING_STEPS.length - 1 && (
                      <ArrowRight className={styles.stepArrow} aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ol>
              <details className={styles.sharingDetails}>
                <summary>
                  What gets shared? <Plus aria-hidden="true" />
                </summary>
                <p>
                  Pushed Git commits. Uncommitted edits stay local. Sharing requires an XO
                  connection and access to the Git repository.
                </p>
              </details>
            </section>
          </div>

          <div id="compare" className={styles.options} data-product-reveal>
            <DeploymentOptions />
          </div>

          <aside id="contact" className={styles.docs} aria-label="Space documentation">
            <a
              href={SPACE_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              Read the Space docs <ArrowRight aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </aside>
        </ProductMotion>
      </main>
      <SiteFooter />
    </>
  );
}
