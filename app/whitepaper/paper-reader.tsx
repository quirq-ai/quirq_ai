"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ArrowUpRight, Download, FileText, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./whitepaper.module.css";

const PdfDocument = dynamic(() => import("./pdf-document"), {
  ssr: false,
  loading: () => (
    <p className={styles.loading} role="status">
      Loading paper…
    </p>
  ),
});

const COMPACT_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(COMPACT_QUERY);
  media.addEventListener("change", callback);
  window.addEventListener("hashchange", callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("hashchange", callback);
  };
}

function getReaderContext() {
  return `${window.matchMedia(COMPACT_QUERY).matches ? "compact" : "wide"}${window.location.hash}`;
}

// Text is the server default: the complete paper works with JavaScript disabled.
const getServerContext = () => "server";

type View = "pdf" | "text";

export function PaperReader({
  children,
  sectionIds,
}: {
  children: ReactNode;
  sectionIds: string[];
}) {
  const context = useSyncExternalStore(subscribe, getReaderContext, getServerContext);
  const [chosenView, setChosenView] = useState<View | null>(null);
  const textViewport = useRef<HTMLDivElement>(null);
  const internalAnchor = useRef<string | null>(null);
  const anchor = context.includes("#") ? context.slice(context.indexOf("#") + 1) : "";
  const isSectionLink = sectionIds.includes(anchor);
  const view = isSectionLink
    ? "text"
    : (chosenView ?? (context.startsWith("wide") ? "pdf" : "text"));

  useEffect(() => {
    // Published links reveal Text and bring the reader into view. Contents links
    // scroll only the reading pane, leaving the page and its controls in place.
    if (!isSectionLink) return;
    scrollToSection(textViewport.current, anchor);
    if (internalAnchor.current !== anchor) {
      document.getElementById("paper-reader")?.scrollIntoView({ block: "start" });
    }
    internalAnchor.current = null;
  }, [anchor, isSectionLink]);

  function navigateContents(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const section = link?.getAttribute("href")?.slice(1);
    if (!section || !sectionIds.includes(section)) return;

    event.preventDefault();
    scrollToSection(textViewport.current, section);
    if (window.location.hash === `#${section}`) return;
    internalAnchor.current = section;
    // pushState preserves the published URL without the browser scrolling every
    // ancestor. Notify the hash subscriber explicitly, including Back/Forward.
    window.history.pushState(window.history.state, "", `#${section}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  function selectView(next: View) {
    setChosenView(next);
    if (isSectionLink) window.location.hash = "paper-reader";
  }

  return (
    <section id="paper-reader" className={styles.reader} aria-label="Whitepaper reader">
      <div className={styles.toolbar}>
        <div
          role="group"
          aria-label="Reading format"
          className={styles.formats}
          hidden={context === "server"}
        >
          <Button
            variant={view === "pdf" ? "default" : "ghost"}
            aria-pressed={view === "pdf"}
            aria-controls="paper-pdf"
            onClick={() => selectView("pdf")}
          >
            <FileText aria-hidden="true" />
            PDF
          </Button>
          <Button
            variant={view === "text" ? "default" : "ghost"}
            aria-pressed={view === "text"}
            aria-controls="paper-text"
            onClick={() => selectView("text")}
          >
            <AlignLeft aria-hidden="true" />
            Text
          </Button>
        </div>
        <div className={styles.fileActions}>
          <Button asChild variant="ghost">
            <a href="/whitepaper/pdf" target="_blank" rel="noopener noreferrer">
              Open PDF <ArrowUpRight aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/whitepaper/pdf" download="quirq-whitepaper.pdf">
              <Download aria-hidden="true" />
              Download
            </a>
          </Button>
        </div>
      </div>
      <div id="paper-pdf" className={styles.readerPanel} hidden={view !== "pdf"}>
        {view === "pdf" && <PdfDocument onReadText={() => selectView("text")} />}
      </div>
      <div id="paper-text" className={styles.readerPanel} hidden={view !== "text"}>
        <div
          ref={textViewport}
          className={styles.textViewport}
          tabIndex={0}
          role="region"
          aria-label="Whitepaper text. Scroll to read the paper."
          onClickCapture={navigateContents}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function scrollToSection(viewport: HTMLDivElement | null, id: string) {
  const target = document.getElementById(id);
  if (!viewport || !target) return;
  viewport.scrollTo({
    top:
      viewport.scrollTop +
      target.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top -
      24,
    behavior: "instant",
  });
}
