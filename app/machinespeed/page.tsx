import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/ui/footer";
import { Calculator } from "./calculator";
import styles from "./machinespeed.module.css";

/**
 * MACHINE SPEED, ported from quirq-package/site/machinespeed.html.
 *
 * A sub-brand ("built on quirq technology") reached from the Enterprise link in
 * the site nav, opened in a new tab. It keeps the palette and layout it was
 * authored with, but wears quirq's chrome: the site nav above, SiteFooter
 * below, and the authored footer reduced to the attribution line it carried.
 *
 * Server-rendered apart from the calculator, which is the page's only
 * interactive element and its only client boundary.
 */

export const metadata: Metadata = {
  // Absolute: this page is not a quirq page, so it does not take the root
  // layout's "· quirq" title template.
  title: {
    absolute: "MACHINE SPEED — We help businesses run at machine speed.",
  },
  description:
    "Agentic workflows that hand you back ten hours a week. Built and run on the stack you already own, with every workflow reporting the money it made or saved.",
};

export const viewport: Viewport = {
  themeColor: "#10120F",
};

/** The three skewed bars the sub-brand uses as its mark. */
function Bars() {
  return (
    <span className={styles.bars} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

/** One card on the blueprint canvas. Positions are data, so they stay inline. */
function Node({
  left,
  top,
  width = 190,
  kind,
  dot,
  title,
  sub,
  foot,
  highlight = false,
}: {
  left: number;
  top: number;
  width?: number;
  kind: string;
  dot: string;
  title: string;
  sub: string;
  foot: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`${styles.node}${highlight ? ` ${styles.hl}` : ""}`}
      style={{ left, top, width }}
    >
      <div className={styles.nHd}>
        <span className={styles.nDot} style={{ background: dot }} />
        {kind}
      </div>
      <div className={styles.nBd}>
        <div className={styles.nT}>{title}</div>
        <div className={styles.nS}>{sub}</div>
      </div>
      <div className={styles.nFt}>{foot}</div>
    </div>
  );
}

export default function MachineSpeed() {
  return (
    <div className={styles.page}>
      <div className={styles.heroSplit}>
        <div className={styles.heroLeft}>
          {/* The mark, not a link: in the source it pointed at a placeholder. */}
          <span role="img" aria-label="MACHINE SPEED">
            <Bars />
          </span>

          <div className={styles.heroMid}>
            <div className={`${styles.stack} ${styles.stackUp}`} aria-hidden>
              <div className={`${styles.o1} ${styles.it}`}>order recovery.</div>
              <div className={styles.o2}>cfo intelligence.</div>
              <div className={styles.o3}>sales machines.</div>
            </div>

            <h1>
              We help businesses run at <em>machine speed.</em>
            </h1>

            <div className={`${styles.stack} ${styles.stackDown}`} aria-hidden>
              <div className={`${styles.o3} ${styles.it}`}>
                subscription audits.
              </div>
              <div className={styles.o2}>agent loops.</div>
              <div className={styles.o1}>background workflows.</div>
            </div>
          </div>

          <div className={styles.heroBottom}>
            <div className={styles.lead}>
              Agentic workflows that hand you back ten hours a week.
            </div>
            <p>
              Your software already moves at machine speed, your operations
              don&rsquo;t. We build and run agentic workflows on the stack you
              already own, and every workflow reports the money it made or
              saved. Not promised. Measured.
            </p>
          </div>
        </div>

        <div
          className={styles.heroImg}
          role="img"
          aria-label="Light refraction on black"
        />
      </div>

      <div className={styles.col}>
        <div className={styles.prose}>
          <h2>What we do</h2>
          <p>
            We connect to the infrastructure, models and harnesses your team
            already uses. No rip-and-replace. Then the hours come back, five
            ways, every one of them measured:
          </p>
          <ol className={styles.plan}>
            <li>
              <b>Automate, or remove, your SaaS tools.</b> Agents take over the
              work your subscriptions were bought for. What they replace, you
              cancel. Cancelled spend is cash.
            </li>
            <li>
              <b>Deploy bespoke blueprints that move your business.</b> Proven
              workflows (sales machine, CFO intelligence, order recovery)
              adapted to your operation and pointed at the metric that matters
              this quarter.
            </li>
            <li>
              <b>Drive efficiency into your AI spend.</b> Powered by quirq: cost
              per useful unit of work, instrumented across every model and agent
              you run.
            </li>
            <li>
              <b>Enable product development with agentic tools.</b> Your team
              ships faster with agentic harnesses wired into the development
              loop.
            </li>
            <li>
              <b>Open new customer acquisition channels with AI.</b> Custom
              models, MCP integrations, skills, agents and loops that reach
              customers your current funnel can&rsquo;t.
            </li>
          </ol>

          <h2>The product</h2>
          <p>
            The work happens underneath. On the surface, all you see are{" "}
            <strong>the decisions you need to make</strong>, each one sized in
            dollars, approved or held from your phone.
          </p>

          <div className={styles.canvasWrap}>
            <div className={styles.canvas}>
              <div className={styles.cvBar}>
                <span className={styles.cvTitle}>
                  Blueprint: <b>order-recovery</b> · running
                </span>
                <span className={styles.cvRight}>
                  <span className={styles.cvBrand}>quirq</span>
                  <span className={styles.cvDeploy}>● DEPLOYED</span>
                </span>
              </div>

              <div className={styles.cvScroll} tabIndex={0} role="region" aria-label="Order recovery blueprint">
                <div className={styles.cvStage}>
                  <svg width="880" height="400" viewBox="0 0 880 400" aria-hidden>
                    <path
                      d="M194 208 C 218 208, 216 196, 240 196"
                      stroke="rgba(87,182,255,.55)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M430 196 C 454 196, 454 200, 478 200"
                      stroke="rgba(87,182,255,.55)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M648 188 C 672 188, 664 104, 690 104"
                      stroke="rgba(87,182,255,.55)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M648 214 C 672 214, 664 322, 690 322"
                      stroke="rgba(233,234,230,.22)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <text
                      x="664"
                      y="140"
                      fontFamily="Menlo,monospace"
                      fontSize="9"
                      fill="rgba(87,182,255,.85)"
                    >
                      true
                    </text>
                    <text
                      x="662"
                      y="290"
                      fontFamily="Menlo,monospace"
                      fontSize="9"
                      fill="rgba(233,234,230,.35)"
                    >
                      false
                    </text>
                    <circle cx="194" cy="208" r="3" fill="rgba(87,182,255,.85)" />
                    <circle cx="430" cy="196" r="3" fill="rgba(87,182,255,.85)" />
                    <circle cx="648" cy="200" r="3" fill="rgba(87,182,255,.85)" />
                  </svg>

                  <Node
                    left={24}
                    top={160}
                    width={170}
                    kind="trigger"
                    dot="var(--ms-blue)"
                    title="New orders — Shopify"
                    sub="webhook · every event"
                    foot="streaming · live"
                  />
                  <Node
                    left={240}
                    top={140}
                    kind="agent node"
                    dot="#E9EAE6"
                    title="Reconcile payments & inventory"
                    sub="tools: stripe · netsuite · 3PL"
                    foot={
                      <>
                        model: <b>routed by quirq</b>
                      </>
                    }
                  />
                  <Node
                    left={478}
                    top={150}
                    width={170}
                    kind="conditional"
                    dot="#A8ABA3"
                    title="Exception found?"
                    sub="margin, stock or payment mismatch"
                    foot="2 caught overnight"
                  />
                  <Node
                    left={690}
                    top={48}
                    width={170}
                    kind="agent node"
                    dot="var(--ms-blue)"
                    title="Recover the order"
                    sub="requote shipping · retry payment"
                    highlight
                    foot={<b>→ decision to your phone · $12,400</b>}
                  />
                  <Node
                    left={690}
                    top={272}
                    width={170}
                    kind="function"
                    dot="#6B6E67"
                    title="Update ledger & report"
                    sub="posts to the monthly number"
                    foot="✓ done · logged"
                  />
                </div>
              </div>
            </div>

            <div className={styles.flowNote}>
              one blueprint of many, model-agnostic, routed by <b>quirq</b> to
              whatever does the job best today
            </div>
          </div>

          <div className={styles.term} tabIndex={0} role="region" aria-label="Overnight status">
            <span className={styles.c}>$</span>{" "}
            <span className={styles.w}>machinespeed status</span>
            {"\n"}
            <span className={styles.g}>✓</span> 14 workflows completed overnight
            {"\n"}
            <span className={styles.g}>✓</span> orders reconciled · reports
            assembled · 2 exceptions recovered
            {"\n"}
            <span className={styles.c}>→</span> 2 decisions waiting:{" "}
            <span className={styles.w}>reorder SKU-1148 ($12,400)</span> ·{" "}
            <span className={styles.w}>cancel 3 subscriptions ($8,760/yr)</span>
          </div>

          <p>
            You shouldn&rsquo;t care what model you&rsquo;re using: that&rsquo;s
            an implementation detail, ours not yours. The dials that stay in
            your hands are the ones that matter:{" "}
            <strong>output quality, time, and cost.</strong>
          </p>

          <h2>How we work</h2>
          <ol className={styles.plan}>
            <li>
              <b>Agentic Audit.</b> Thirty minutes on how your business actually
              runs. We name the workflow eating your week, size it in dollars,
              and send a one-page written finding within 24 hours. No
              obligation.
            </li>
            <li>
              <b>Blueprint Sprint.</b> One workflow built on your existing stack
              in two weeks, deployed with monitoring and fallbacks, handed over
              working. You see the return before you commit to more.
            </li>
            <li>
              <b>Run at machine speed.</b> We operate what we built. Monthly
              report, monthly number, workflows compounding on one data layer.
              Land small, expand on evidence, never on faith.
            </li>
          </ol>
          <p>
            The rule we scope by: you should see two to three times the
            engagement value coming back, and you should be able to see it{" "}
            <strong>before you sign, not after.</strong> Fixed scope, fixed
            price, fixed end date, always.
          </p>

          <Calculator />
        </div>

        <div className={styles.attribution}>
          <Bars />
          <span className={styles.footCopy}>
            © 2026 MACHINE SPEED · built on <b>quirq</b> technology
          </span>
        </div>
      </div>

      {/* The site's own footer, so this page closes the way every other route
          does. The sub-brand line above it keeps the attribution the authored
          footer carried. */}
      <SiteFooter />
    </div>
  );
}
