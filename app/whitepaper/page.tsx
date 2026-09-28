import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { BodyBlock } from "@/components/prose/body";
import { SECTIONS, WHITEPAPER, readingMinutes } from "@/lib/whitepaper";
import { PaperReader } from "./paper-reader";
import styles from "./whitepaper.module.css";

export const metadata: Metadata = {
  title: "Whitepaper",
  description: WHITEPAPER.dek,
  openGraph: {
    type: "article",
    title: WHITEPAPER.title,
    description: WHITEPAPER.dek,
    url: "/whitepaper",
  },
};

function Contents() {
  return (
    <nav aria-label="Paper contents" className={styles.contents}>
      <ol>
        <li>
          <a href="#abstract">Abstract</a>
        </li>
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>
              <span>
                {section.number === null ? "·" : String(section.number).padStart(2, "0")}
              </span>
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Server-rendered transcription remains readable without JavaScript. */
function PaperText() {
  return (
    <div className={styles.textLayout}>
      <aside className={styles.contentsRail}>
        <p className={styles.eyebrow}>Contents</p>
        <Contents />
      </aside>
      <article className={styles.article} aria-label="Whitepaper text">
        <details className={styles.mobileContents}>
          <summary>
            Contents <ChevronDown aria-hidden="true" />
          </summary>
          <Contents />
        </details>
        <section
          id="abstract"
          className={styles.abstract}
          aria-labelledby="abstract-heading"
        >
          <h2 id="abstract-heading">Abstract</h2>
          <p>{WHITEPAPER.abstract}</p>
        </section>
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className={styles.paperSection}
          >
            <h2 id={`${section.id}-heading`}>
              {section.number !== null && (
                <span>{String(section.number).padStart(2, "0")}</span>
              )}
              {section.title}
            </h2>
            {section.blocks.map((block, index) => (
              <BodyBlock key={index} block={block} />
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}

export default function Whitepaper() {
  return (
    <div className={`site-container ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          The Quirq whitepaper <span aria-hidden="true">/</span> {WHITEPAPER.date}
        </p>
        <h1>A unit of work for intelligence.</h1>
        <p className={styles.intro}>
          A framework for measuring what AI delivers, and what it costs.
        </p>
        <div className={styles.byline}>
          <span>{WHITEPAPER.authors}</span>
          <span>
            {WHITEPAPER.pages} pages · {readingMinutes} min read
          </span>
        </div>
      </header>

      <PaperReader sectionIds={["abstract", ...SECTIONS.map((section) => section.id)]}>
        <PaperText />
      </PaperReader>

      <footer className={styles.notes}>
        <p>
          The typeset PDF is the version of record. Every claim is tiered as sourced,
          derived, measured or open. Questions or corrections:{" "}
          <a href={`mailto:${WHITEPAPER.correspondence}`}>{WHITEPAPER.correspondence}</a>.
        </p>
        <div className={styles.related}>
          <Link href="/research">
            Research notes <ArrowRight aria-hidden="true" />
          </Link>
          <a href="/llm.txt" target="_blank" rel="noopener noreferrer">
            Read with AI <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
