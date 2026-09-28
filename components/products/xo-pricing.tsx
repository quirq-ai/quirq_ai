import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TryOnXo } from "@/components/ui/try-on-xo";
import { APP_URL } from "@/lib/products";
import styles from "./xo-pricing.module.css";

// Verified in the running XO pricing UI on 2026-09-22. Annual prices are totals.
// See docs/product-evidence.md for the source and deployment qualification.
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthly: "$10",
    annual: "$100",
    trial: true,
    features: ["Concurrent cloud apps", "Monthly platform credits", "Integrations"],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: "$50",
    annual: "$500",
    trial: true,
    features: ["Starter features included", "AI agent templates", "Marketplace listing"],
  },
  {
    id: "business",
    name: "Business",
    monthly: "$500",
    annual: "$5,000",
    trial: false,
    features: ["Pro features included", "24/7 priority support"],
  },
] as const;

const ENTERPRISE_FEATURES = [
  "Self-host XO",
  "Connect your own cloud",
  "Custom policies",
  "White-label across multiple clouds",
] as const;

/** XO subscriptions, with the owner's custom enterprise offering kept separate. */
export function XoPricing() {
  return (
    <section
      id="pricing"
      className={styles.section}
      aria-labelledby="xo-pricing-heading"
      data-product-reveal
    >
      <header className={styles.heading}>
        <p>Pricing</p>
        <h2 id="xo-pricing-heading">Choose your XO plan.</h2>
        <p className={styles.intro}>30 days free on eligible Starter and Pro plans.</p>
      </header>
      <div className={styles.options}>
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={styles.card}
            aria-labelledby={`xo-plan-${plan.id}`}
          >
            <h3 id={`xo-plan-${plan.id}`}>{plan.name}</h3>
            <p className={styles.price}>
              {plan.monthly} <span>/ month</span>
            </p>
            <p className={styles.basis}>or {plan.annual} billed annually</p>
            <p className={styles.trial}>
              {plan.trial ? "30-day free trial" : "No free trial"}
            </p>
            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className={styles.action}>
              {plan.trial ? (
                <TryOnXo size="lg" className="w-full" />
              ) : (
                <Button asChild size="lg" className="w-full">
                  <a
                    href={new URL("pricing", APP_URL).href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Choose Business <ArrowRight aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className={styles.priceNote}>USD · Annual prices show the full yearly total.</p>
      <article className={styles.enterprise} aria-labelledby="xo-plan-enterprise">
        <div>
          <h3 id="xo-plan-enterprise">Enterprise</h3>
          <p className={styles.enterprisePrice}>Custom</p>
        </div>
        <ul className={styles.enterpriseFeatures}>
          {ENTERPRISE_FEATURES.map((feature) => (
            <li key={feature}>
              <Check aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" size="lg" className={styles.enterpriseAction}>
          <a href="mailto:hello@quirq.ai?subject=XO%20Enterprise%20deployment">
            Talk to us <ArrowRight aria-hidden="true" />
          </a>
        </Button>
      </article>
      <div className={styles.questions}>
        <details>
          <summary>
            What am I paying for? <span aria-hidden="true">+</span>
          </summary>
          <p>
            A monthly or annual subscription to XO. Each plan includes cloud apps, credits
            and integrations. Custom Enterprise deployments are quoted separately.
            <a href="mailto:hello@quirq.ai?subject=XO%20pricing">
              Talk through your setup <ArrowRight aria-hidden="true" />
            </a>
          </p>
        </details>
        <details>
          <summary>
            How do I connect a model? <span aria-hidden="true">+</span>
          </summary>
          <p>
            Bring credentials for your chosen provider. The Claude Code template accepts
            an Anthropic API key, or you can connect your Claude account after launch.
            <a
              href="https://docs.quirq.ai/docs/agents/claude-code/setup"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the setup guide <ArrowRight aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </p>
        </details>
      </div>
      <Link href="/products#opensource" className={styles.local}>
        On your own machine? Try open-source Space. <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}
