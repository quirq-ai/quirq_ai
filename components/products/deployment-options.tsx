import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/brand-icons";
import { InstallCommand } from "@/components/ui/install-command";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { XoLogo } from "@/components/ui/xo-logo";
import { SPACE_DOCS_URL, SPACE_GITHUB_URL } from "@/lib/products";
import { cn } from "@/lib/utils";
import styles from "./deployment-options.module.css";

/** The Space environment runs on XO cloud computers or the user's machine. */
export function DeploymentOptions() {
  return (
    <section id="pricing" className={styles.section} aria-labelledby="deployment-heading">
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Get started</p>
        <h2 id="deployment-heading">Choose where Space runs.</h2>
      </header>
      <div className={styles.options}>
        <article id="managed" className={cn(styles.option, styles.cloud)}>
          <div className={styles.cloudHeader}>
            <p className={styles.eyebrow}>On a cloud computer</p>
            <span className={styles.trial}>Free for 30 days</span>
          </div>
          <h3>
            Run on
            <XoLogo className={styles.logo} />
            <span className="sr-only">XO</span>
          </h3>
          <p className={styles.description}>
            A ready-made Space on a managed cloud computer.
          </p>
          <div className={styles.action}>
            <TryOnXo size="lg" />
            <Button asChild variant="ghost">
              <Link href="/xo">
                Explore Cloud <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className={styles.billing}>
            30-day trial on eligible Starter and Pro plans. From $10/month.
          </p>
        </article>
        <article id="opensource" className={styles.option}>
          <span id="byoc" className={styles.anchor} aria-hidden="true" />
          <p className={styles.eyebrow}>On your own machine · MIT</p>
          <h3>Run open source.</h3>
          <p className={styles.description}>Your hardware. Your agent accounts.</p>
          <div className={styles.install}>
            <InstallCommand />
          </div>
          <div className={styles.action}>
            <Button asChild variant="outline">
              <a href={SPACE_GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GithubIcon />
                Space on GitHub <ArrowUpRight aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a href={SPACE_DOCS_URL} target="_blank" rel="noopener noreferrer">
                Setup guide <ArrowUpRight aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
