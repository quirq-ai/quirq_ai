import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/ui/footer";
import { InstallCommand } from "@/components/ui/install-command";
import {
  APP_URL,
  BYOC_PILLARS,
  BYOC_STEPS,
  BYOC_TERMS,
  CLOUDS,
  COMPARISON,
  CONTACT,
  HARNESSES,
  HARNESS_CAPABILITIES,
  LAYERS,
  MODES,
  PLANS,
  SETUP_LABEL,
  VIEWS,
} from "@/lib/products";
import styles from "./products.module.css";

/**
 * The products page: two solutions, and what each one costs.
 *
 * Managed cloud is self-serve and priced, so every one of its calls to action
 * leaves for app.xo.builders rather than opening a conversation. Bring your
 * own cloud is licensed and quoted, so all of its roads lead to contact. The
 * page's whole job is to get a reader into the right one of those two lanes.
 *
 * A server component throughout. The only client code on the route is
 * `InstallCommand`, which is already an island elsewhere on the site and is
 * reused here rather than restated, so the copy button, its live region and
 * its noscript hook come along for free.
 */

const ACCENT = {
  blue: styles.blue,
  green: styles.green,
  orange: styles.orange,
} as const;

/** The spectrum rotation the site uses wherever it counts a set of things. */
const ROTATION = [styles.blue, styles.green, styles.orange] as const;

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** app.xo.builders is its own property, so it says so and opens beside us. */
function AppLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Marker({ children }: { children: React.ReactNode }) {
  return (
    <p className={styles.marker}>
      <span className={styles.markerChip} aria-hidden />
      {children}
      <span className={styles.markerRule} aria-hidden />
    </p>
  );
}

function Section({
  id,
  labelledBy,
  glow,
  children,
}: {
  id: string;
  labelledBy: string;
  /** Which spectrum wash rises behind this section, if any. */
  glow?: "cool" | "warm";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[
        styles.section,
        glow && styles.glow,
        glow === "warm" && styles.glowWarm,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.wrap}>{children}</div>
    </section>
  );
}

function Hero() {
  return (
    <section aria-labelledby="products-title" className={styles.hero}>
      {/* Pure light, no subject: this page's atmosphere rather than the home
          page's hero quoted back. Decorative, so it carries no alt text. */}
      <Image
        src="/assets/home-v9/feature-burst.png"
        alt=""
        width={1440}
        height={1071}
        priority
        sizes="(max-width: 700px) 116vw, 1180px"
        className={styles.heroBurst}
      />

      <div className={`${styles.wrap} ${styles.heroInner}`}>
        <h1 id="products-title" className={styles.heroTitle}>
          <span className="block">Deploy an agentic</span>
          <span className="block">workforce environment.</span>
        </h1>

        <p className={styles.heroTagline}>
          Any harness. Any model. Any cloud. Run it on ours and start in a
          minute, or run it on yours with our engineers alongside you.
        </p>

        <div className={styles.actions}>
          <AppLink className={`${styles.button} ${styles.primary}`}>
            Start free
          </AppLink>
          <a href="#byoc" className={`${styles.button} ${styles.secondary}`}>
            Bring your own cloud
          </a>
        </div>

        {/* The page's real decision, and its table of contents: two lanes. */}
        <nav aria-label="Two ways to run it" className={styles.ladder}>
          {MODES.map((mode) => (
            <a key={mode.id} href={`#${mode.id}`} className={styles.rung}>
              <span className={`${styles.rungNumber} ${ACCENT[mode.accent]}`}>
                {mode.number}
              </span>
              <span className={styles.rungName}>{mode.name}</span>
              <span className={styles.rungNote}>{mode.note}</span>
              <span className={styles.rungGo} aria-hidden>
                →
              </span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

function Managed() {
  return (
    <Section id="managed" labelledBy="managed-title" glow="cool">
      <Marker>01 · Managed cloud</Marker>

      <div className={styles.split}>
        <div>
          <h2 id="managed-title" className={styles.heading}>
            Pick a harness, pick a model,{" "}
            <em>and be running in a minute.</em>
          </h2>

          <p className={styles.lede}>
            We host it and we run it. There is no licence to negotiate and no
            call to book: sign up, choose a harness, and the environment is live
            on our cloud. Every one reports to the same unit-of-work ledger, so
            spend is legible from the first run.
          </p>

          <div className={styles.actions}>
            <AppLink className={`${styles.button} ${styles.primary}`}>
              Start free
            </AppLink>
          </div>
          <p className={styles.installNote}>
            30 days free. Priced per environment, never per seat.
          </p>
        </div>

        <div>
          <p className={styles.label}>Included with every harness</p>
          <ul className={styles.pills} aria-label="Included with every harness">
            {HARNESS_CAPABILITIES.map((capability) => (
              <li key={capability} className={styles.pill}>
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.label} style={{ marginTop: "68px" }}>
        Choose your harness
      </p>

      <div className={styles.railWrap}>
        <ul className={styles.rail} aria-label="Available harnesses">
          {HARNESSES.map((harness) => (
            <li
              key={harness.name}
              className={`${styles.card} ${
                harness.badge === "Featured" ? styles.cardFeatured : ""
              }`}
            >
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>{harness.name}</h3>
                <span
                  className={`${styles.badge} ${
                    harness.badge === "Featured" ? styles.badgeFeatured : ""
                  }`}
                >
                  {harness.badge}
                </span>
              </div>

              <p className={styles.cardBody}>Powered by {harness.poweredBy}</p>

              <p className={styles.setup}>
                {/* The dots are decoration for a value the label already
                    states, so they are hidden and the label is the name. */}
                <span className={styles.dots} aria-hidden>
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={`${styles.dot} ${
                        step <= harness.setup ? styles.dotOn : ""
                      }`}
                    />
                  ))}
                </span>
                {SETUP_LABEL[harness.setup]}
              </p>

              <p className={styles.cardList}>
                Runs on any cloud you connect, with the full observability layer
                attached from the first run.
              </p>

              <AppLink className={styles.cardCta}>
                Create Agent
                <span className="sr-only"> with {harness.name}</span>
              </AppLink>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.railHint}>
        {HARNESSES.length} harnesses · scroll for more
      </p>
    </Section>
  );
}

function Byoc() {
  return (
    <Section id="byoc" labelledBy="byoc-title" glow="warm">
      <Marker>02 · Bring your own cloud</Marker>

      <div className={styles.split}>
        <div>
          <h2 id="byoc-title" className={styles.heading}>
            Your cloud, your hardware,{" "}
            <em>stood up by our engineers.</em>
          </h2>

          <p className={styles.lede}>
            The same product, licensed onto infrastructure you already own. You
            connect the clouds, accelerators, models and harnesses your team
            runs today, and our forward-deployed engineers install it with you
            and shape it around how your business actually works.
          </p>

          <p className={`${styles.lede} ${styles.ledeTight}`}>
            This is the lane for larger teams: work that is not allowed to leave
            a boundary, an air-gapped network, a regulator who needs the ledger
            on your side, or a team that has to put its own brand in front of
            the people using it.
          </p>
        </div>

        <div>
          <p className={styles.label}>Connect what you already run</p>
          <ul className={styles.pills} aria-label="Supported infrastructure">
            {CLOUDS.map((cloud) => (
              <li key={cloud} className={styles.pill}>
                {cloud}
              </li>
            ))}
          </ul>
          <p className={styles.installNote}>
            Anywhere else? Tell us where it needs to run.
          </p>
        </div>
      </div>

      {/* What the licence hands over. Each pillar is one column of the
          comparison below, stated as a sentence. */}
      <p className={styles.label} style={{ marginTop: "68px" }}>
        What the licence hands over
      </p>
      <div className={styles.quad}>
        {BYOC_PILLARS.map((pillar, i) => (
          <article key={pillar.name} className={styles.card}>
            <span className={`${styles.cardNumber} ${ROTATION[i % 3]}`}>
              {pad(i)}
            </span>
            <h3 className={styles.cardTitle}>{pillar.name}</h3>
            <p className={styles.cardBody}>{pillar.body}</p>
          </article>
        ))}
      </div>

      {/* The forward-deployed engineering stream, which is what a licence
          actually buys beyond the software. */}
      <p className={styles.label} style={{ marginTop: "68px" }}>
        How it lands
      </p>
      <ol className={styles.steps}>
        {BYOC_STEPS.map((step, i) => (
          <li key={step.name} className={styles.step}>
            <span className={`${styles.stepNumber} ${ROTATION[i % 3]}`}>
              {pad(i)}
            </span>
            <div>
              <h3 className={styles.cardTitle}>{step.name}</h3>
              <p className={styles.cardBody}>
                {step.body}
                {step.name === "Customise" ? (
                  <>
                    {" "}
                    <Link href="/machinespeed" className={styles.inlineLink}>
                      See machine speed
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* The open-source install: how this lane lands on your own box, and the
          way to try it before any of the above. Not a third solution. */}
      <div className={styles.onramp}>
        <div>
          <p className={styles.label}>Try it on your own machine first</p>
          <p className={`${styles.lede} ${styles.ledeTight}`}>
            The runtime is open source. One command puts the same thing that
            runs under every managed environment onto your hardware, with the
            full observability layer attached.
          </p>
        </div>
        <div className={styles.commandSlot}>
          <InstallCommand />
        </div>
      </div>

      <div className={styles.terms}>
        <p className={styles.termsNote}>{BYOC_TERMS}</p>
        <a href="#contact" className={`${styles.button} ${styles.primary}`}>
          Talk to us
        </a>
      </div>
    </Section>
  );
}

/**
 * What both lanes contain. Stated once, between them, because the difference
 * between the two solutions is never what the product does.
 */
function Platform() {
  return (
    <Section id="platform" labelledBy="platform-title">
      <Marker>Either way</Marker>

      <h2 id="platform-title" className={styles.heading}>
        The same product. <em>Wherever it runs.</em>
      </h2>

      <p className={styles.lede}>
        Managed or licensed, an environment is the same three layers with the
        same record underneath. Only the address changes.
      </p>

      <div className={styles.trio}>
        {LAYERS.map((layer, i) => (
          <article key={layer.name} className={styles.card}>
            <span className={`${styles.cardNumber} ${ROTATION[i]}`}>
              {pad(i)}
            </span>
            <h3 className={styles.cardTitle}>{layer.name}</h3>
            <p className={styles.cardBody}>{layer.body}</p>
          </article>
        ))}
      </div>

      <p className={styles.label} style={{ marginTop: "68px" }}>
        Three readings of the same record
      </p>
      <div className={styles.trio}>
        {VIEWS.map((view, i) => (
          <article key={view.name} className={styles.card}>
            <span className={`${styles.cardNumber} ${ROTATION[i]}`}>
              {pad(i)}
            </span>
            <h3 className={styles.cardTitle}>{view.name}</h3>
            <p className={styles.cardBody}>{view.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** A comparison cell. A bare tick or dash gets the scannable treatment. */
function Cell({ value }: { value: string }) {
  if (value === "✓") {
    return (
      <span className={styles.yes}>
        ✓<span className="sr-only"> yes</span>
      </span>
    );
  }
  if (value === "—") {
    return (
      <span className={styles.no}>
        —<span className="sr-only">not included</span>
      </span>
    );
  }
  return <>{value}</>;
}

function Compare() {
  return (
    <Section id="compare" labelledBy="compare-title" glow="cool">
      <Marker>Side by side</Marker>

      <h2 id="compare-title" className={styles.heading}>
        Two lanes. <em>One decision.</em>
      </h2>

      <p className={styles.lede}>
        The rows that describe what the product does read the same in both
        columns: every harness, every model, and the full observability layer.
        What changes is where it runs, who stands it up, and whose name is on
        it.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="sr-only">
            Managed cloud and bring your own cloud, compared.
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span className={styles.colName}>Capability</span>
              </th>
              {MODES.map((mode) => (
                <th key={mode.id} scope="col">
                  <span className={styles.colName}>{mode.name}</span>
                  <span className={styles.colStanding}>{mode.standing}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell, i) => (
                  <td key={i}>
                    <Cell value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Pricing() {
  return (
    <Section id="pricing" labelledBy="pricing-title" glow="warm">
      <Marker>Pricing</Marker>

      <h2 id="pricing-title" className={styles.heading}>
        Pay per environment. <em>Never per seat.</em>
      </h2>

      <p className={styles.lede}>
        Managed cloud is self-serve: pick a tier and start. Bringing your own
        cloud is quoted, because what it costs depends on where it has to run
        and how much of it we build with you.
      </p>

      <div className={styles.plans}>
        {PLANS.map((plan) => {
          const offsite = plan.cta.href.startsWith("http");
          return (
            <article
              key={plan.name}
              className={`${styles.card} ${plan.featured ? styles.planFeatured : ""}`}
            >
              {plan.featured ? (
                <span className={styles.planTag}>Most popular</span>
              ) : null}

              <div>
                <h3 className={styles.cardTitle}>{plan.name}</h3>
                <p className={styles.cardBody}>{plan.standing}</p>
              </div>

              <p className={styles.price}>
                <span className={styles.priceValue}>{plan.price}</span>
                {plan.cadence ? (
                  <span className={styles.priceCadence}>{plan.cadence}</span>
                ) : null}
              </p>

              <ul className={styles.planFeatures}>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span className={styles.tick} aria-hidden>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div>
                {offsite ? (
                  <AppLink
                    className={`${styles.cardCta} ${plan.featured ? styles.primary : ""}`}
                  >
                    {plan.cta.label}
                    <span className="sr-only"> on the {plan.name} plan</span>
                  </AppLink>
                ) : (
                  <a
                    href={plan.cta.href}
                    className={`${styles.cardCta} ${plan.featured ? styles.primary : ""}`}
                  >
                    {plan.cta.label}
                    <span className="sr-only"> about the {plan.name} plan</span>
                  </a>
                )}
                {plan.footnote ? (
                  <p className={styles.planFootnote}>{plan.footnote}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className={styles.contactPlate}>
        <h2 id="contact-title" className={styles.heading}>
          Bringing your own cloud? <em>Tell us where it has to run.</em>
        </h2>

        <p className={styles.lede}>
          Ask for the deployment guide and a walkthrough of the unit-of-work
          ledger with your own numbers. We reply within one business day. If you
          are a smaller team, you do not need us at all: start on the managed
          cloud and skip the conversation.
        </p>

        {/* Real destinations rather than a form: there is no endpoint behind
            this route, and a Send button that silently discards the message is
            worse than an address the reader can actually use. */}
        <ul className={styles.contactRoutes} aria-label="Ways to reach us">
          {CONTACT.map((route) => {
            const offsite = route.href.startsWith("http");
            return (
              <li key={route.href}>
                <a
                  href={route.href}
                  className={styles.route}
                  {...(offsite
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {route.label}
                  {offsite ? (
                    <span className="sr-only"> (opens in a new tab)</span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <AppLink className={`${styles.button} ${styles.primary}`}>
            Start on managed cloud
          </AppLink>
          <Link
            href="/machinespeed"
            className={`${styles.button} ${styles.secondary}`}
          >
            Machine speed
          </Link>
        </div>
      </div>
    </Section>
  );
}

export function ProductsPage() {
  return (
    <main className={styles.page}>
      <Hero />
      <Managed />
      <Byoc />
      <Platform />
      <Compare />
      <Pricing />
      <Contact />

      <div className="flow-root bg-black">
        <SiteFooter />
      </div>
    </main>
  );
}
