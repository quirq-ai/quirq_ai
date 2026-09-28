"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, Minus, Plus } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./pdf-document.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

function LoadingPaper({ children }: { children: string }) {
  return (
    <div className={styles.message} role="status">
      <LoaderCircle className={styles.spinner} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}

export default function PdfDocument({ onReadText }: { onReadText: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  function showPage(nextPage: number) {
    if (!pageCount) return;
    setPageNumber(Math.min(pageCount, Math.max(1, nextPage)));
    viewportRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function fitWidth() {
    setZoom(1);
    viewportRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }

  function labelAnnotations() {
    // PDF.js links overlay the canvas, so they need a name of their own.
    const links = viewportRef.current?.querySelectorAll<HTMLAnchorElement>(
      ".react-pdf__Page__annotations a[href]",
    );
    links?.forEach((link) => {
      const href = link.getAttribute("href") ?? "";
      const label =
        link.title || (href.startsWith("#") ? "Go to referenced section" : href);
      if (!link.title) link.title = label;
      link.setAttribute(
        "aria-label",
        link.target === "_blank" ? `${label} (opens in a new tab)` : label,
      );
    });
  }

  const errorMessage = (
    <div className={styles.message} role="alert">
      <p>The PDF could not be displayed.</p>
      <p className={styles.errorHint}>The full paper is still available in text view.</p>
      <Button type="button" variant="outline" onClick={onReadText}>
        Read text version
      </Button>
    </div>
  );

  return (
    <div className={styles.reader}>
      <div className={styles.toolbar} role="group" aria-label="PDF controls">
        <div className={styles.pageControls}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous page"
            disabled={!pageCount || pageNumber === 1}
            onClick={() => showPage(pageNumber - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <label className={styles.pageLabel}>
            <span className="sr-only">PDF page</span>
            <select
              className={styles.pageSelect}
              value={pageNumber}
              disabled={!pageCount}
              onChange={(event) => showPage(Number(event.target.value))}
            >
              {Array.from({ length: pageCount ?? 1 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  Page {index + 1}
                </option>
              ))}
            </select>
            <span className={styles.pageCount} aria-hidden="true">
              of {pageCount ?? "—"}
            </span>
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Next page"
            disabled={!pageCount || pageNumber === pageCount}
            onClick={() => showPage(pageNumber + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>

        <div className={styles.zoomControls}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Zoom out"
            disabled={!pageCount || zoom === 1}
            onClick={() => setZoom((value) => Math.max(1, value - ZOOM_STEP))}
          >
            <Minus aria-hidden="true" />
          </Button>
          <span className={styles.zoomLabel} aria-live="polite" aria-atomic="true">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Zoom in"
            disabled={!pageCount || zoom === MAX_ZOOM}
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
          >
            <Plus aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!pageCount || zoom === 1}
            onClick={fitWidth}
          >
            Fit width
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {pageCount ? `Page ${pageNumber} of ${pageCount}` : "Loading PDF"}
      </p>

      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        role="region"
        aria-label="Whitepaper PDF. Scroll to read the page."
      >
        <Document
          className={styles.document}
          file="/whitepaper/pdf"
          suspense={false}
          loading={<LoadingPaper>Loading the paper…</LoadingPaper>}
          error={errorMessage}
          onLoadSuccess={({ numPages }) => setPageCount(numPages)}
          onItemClick={({ pageNumber: nextPage }) => showPage(nextPage)}
        >
          {width > 0 && (
            <Page
              className={styles.page}
              pageNumber={pageNumber}
              width={Math.floor(width * zoom)}
              loading={<LoadingPaper>{`Loading page ${pageNumber}…`}</LoadingPaper>}
              error={errorMessage}
              renderTextLayer
              renderAnnotationLayer
              onRenderAnnotationLayerSuccess={labelAnnotations}
            />
          )}
        </Document>
      </div>
    </div>
  );
}
