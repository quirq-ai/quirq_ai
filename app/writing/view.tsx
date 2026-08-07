"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  COUNTS,
  FEATURED,
  FUTURE_OF_WORK,
  GUIDES,
  NEWS,
  NEWS_COLLAPSED,
  PARTNERS,
  THOUGHTS,
  type Card,
  type TabKey,
} from "./data";
import styles from "./writing.module.css";

/** The documentation index, which carries the changelog pointer. */
const DOCS_URL = "/docs";

/**
 * The Writings page, ported from the renderWritings() function in
 * quirq-package/site/quirq-research-writings-mock.html.
 *
 * The tab filter and the collapsed news list are the page's only stateful
 * behaviour, so this is its whole client boundary. Everything it renders is
 * static content passed through from data.ts.
 *
 * The mock's cards carry cursor:pointer but have nowhere to go, so they render
 * here as articles rather than links: a dead control is worse than an honest
 * card. Give a card an href and it can become a link.
 */

const src = (img: string) => `/assets/writing/${img}.jpg`;

/** Sized by context: the stylesheet shrinks it inside a card footer. */
function Go() {
  return (
    <span className={styles.go} aria-hidden>
      ↗
    </span>
  );
}

/**
 * What a tile actually is.
 *
 * With a destination it is a link; without one it stays an article, because a
 * card that looks clickable and goes nowhere is worse than a card. Off-site
 * destinations open beside us and say so.
 */
function CardShell({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href) return <article className={styles.card}>{children}</article>;

  if (href.startsWith("http")) {
    return (
      <a
        className={styles.card}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link className={styles.card} href={href}>
      {children}
    </Link>
  );
}

/** A guide points at material that lives elsewhere; the row links when it does. */
function GuideRow({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return href ? (
    <Link className={styles.rrow} href={href}>
      {children}
    </Link>
  ) : (
    <div className={styles.rrow}>{children}</div>
  );
}

function PostCard({ card, tag }: { card: Card; tag: string }) {
  // Three states, and the third is deliberate: an essay of its own, a page
  // elsewhere on the site that this card summarises, or nothing to click.
  const to = card.slug ? `/writing/${card.slug}` : card.href;

  return (
    <CardShell href={to}>
      <div className={styles.thumb}>
        <img src={src(card.img)} alt="" loading="lazy" />
      </div>
      <div className={styles.cbody}>
        <div className={styles.crow}>
          <span className={styles.tag}>{tag}</span>
          <span>
            {card.sample ? (
              <span className={styles.sample}>sample</span>
            ) : (
              card.num
            )}
          </span>
        </div>
        <h3>{card.title}</h3>
        <div className={styles.desc}>{card.desc}</div>
        <div className={styles.cfoot}>
          <span>{card.date}</span>
          <span>
            {card.read} read <Go />
          </span>
        </div>
      </div>
    </CardShell>
  );
}

/** Partner news carries no ordinal, date or reading time, as authored. */
function PartnerCard({
  title,
  desc,
  art,
  lockup,
  href,
}: {
  title: string;
  desc: string;
  art?: string;
  lockup?: string;
  href?: string;
}) {
  return (
    <CardShell href={href}>
      <div className={styles.thumb}>
        {art ? (
          <img src={src(art)} alt="" loading="lazy" />
        ) : (
          // No plate for this one yet, so the mark is set in type rather than
          // pointing at a file that does not exist.
          <span className={styles.lockup} aria-hidden>
            {lockup ?? title}
          </span>
        )}
      </div>
      <div className={styles.cbody}>
        <div className={styles.crow}>
          <span className={styles.tag}>News</span>
        </div>
        <h3 className={styles.cardTitleSm}>{title}</h3>
        <div className={styles.desc}>{desc}</div>
        <div className={styles.cfoot}>
          <span>{href ? "Read the chapter →" : "Read →"}</span>
        </div>
      </div>
    </CardShell>
  );
}

function SeriesHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className={styles.seriesHead}>
      <h2>{title}</h2>
      <div className={styles.sub}>{sub}</div>
    </div>
  );
}

export function WritingView() {
  const [tab, setTab] = useState<TabKey>("all");
  const [newsExpanded, setNewsExpanded] = useState(false);

  const showNews = tab === "all" || tab === "announcements";
  const showThoughts = tab === "all" || tab === "thoughts";

  // News is one editorial card followed by the partner run, as in the mock.
  const newsCards = [
    ...NEWS.map((card) => (
      <PostCard key={card.title} card={card} tag="News" />
    )),
    ...PARTNERS.map((partner) => (
      <PartnerCard key={partner.title} {...partner} />
    )),
  ];

  // Only the everything view collapses: picking News means you want them all.
  const collapsed = tab === "all" && !newsExpanded;
  const visibleNews = collapsed
    ? newsCards.slice(0, NEWS_COLLAPSED)
    : newsCards;

  return (
    <>
      <header className={styles.header}>
        <h1>Writings</h1>

        {/* The row holds the tablist and the docs signpost side by side. They
            are separated because only the first three filter this page: a
            tablist may contain tabs and nothing else, and this is a link to
            another route rather than a fourth tab that never selects. */}
        <div className={styles.tabRow}>
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Post categories"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              onClick={() => setTab("all")}
              className={
                tab === "all" ? `${styles.tab} ${styles.tabOn}` : styles.tab
              }
            >
              All Posts<span className={styles.tabCount}>{COUNTS.all}</span>
            </button>

            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                role="tab"
                aria-selected={tab === category.key}
                onClick={() => setTab(category.key)}
                className={
                  tab === category.key
                    ? `${styles.tab} ${styles.tabOn}`
                    : styles.tab
                }
              >
                {category.label}
                <span className={styles.tabCount}>{COUNTS[category.key]}</span>
              </button>
            ))}
          </div>

          <Link
            href={DOCS_URL}
            className={`${styles.tab} ${styles.tabMuted}`}
            title="Release notes and the rest of the documentation"
          >
            Changelog → Docs
          </Link>
        </div>
      </header>

      {showNews && (
        <section className={styles.featured} aria-labelledby="featured-heading">
          <div className={styles.art}>
            <img src={src(FEATURED.img)} alt="" />
          </div>
          <div>
            <div className={styles.kicker}>
              <span className={styles.dot} aria-hidden />
              News
              <span className={styles.ln} aria-hidden />
              {FEATURED.kicker}
            </div>
            <h2 id="featured-heading">{FEATURED.title}</h2>
            <p>{FEATURED.desc}</p>
            <div className={styles.meta}>
              {FEATURED.date}
              <span aria-hidden>·</span>
              {FEATURED.read}
              <Go />
            </div>
          </div>
        </section>
      )}

      {showNews && (
        <section aria-labelledby="news-heading">
          <SeriesHead title="News" sub="Launches · partnerships · integrations" />
          <div className={styles.grid}>{visibleNews}</div>
          {collapsed && newsCards.length > NEWS_COLLAPSED && (
            <div className={styles.moreRow}>
              <button
                type="button"
                className={styles.tab}
                onClick={() => setNewsExpanded(true)}
              >
                Read more news ↓
              </button>
            </div>
          )}
        </section>
      )}

      {showThoughts && (
        <section aria-labelledby="thoughts-heading">
          <SeriesHead
            title="Thoughts"
            sub="The findings, argued · every note links to its study"
          />
          <div className={styles.grid}>
            {THOUGHTS.map((card) => (
              <PostCard key={card.title} card={card} tag="Thoughts" />
            ))}
          </div>

          <SeriesHead
            title="The Future of Work"
            sub="Thoughts · The thesis, with its evidence"
          />
          <div className={styles.grid}>
            {FUTURE_OF_WORK.map((card) => (
              <PostCard key={card.title} card={card} tag="Thoughts" />
            ))}
          </div>

          <SeriesHead
            title="Guides"
            sub="Education · the unit of work, explained · read in order"
          />
          <div className={styles.rlist}>
            {GUIDES.map((guide) => (
              <GuideRow key={guide.num} href={guide.href}>
                <div className={styles.num}>{guide.num}</div>
                <div>
                  <h3>{guide.title}</h3>
                  {guide.start && (
                    <span className={styles.start}>Start here</span>
                  )}
                  <div className={styles.desc}>{guide.desc}</div>
                </div>
                <div className={styles.rmeta}>{guide.read}</div>
                <div className={styles.rmeta}>{guide.date}</div>
                <Go />
              </GuideRow>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
