"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/primitives";
import { compactCount, type FolderNode } from "@/lib/quirq/folder";
import { formatBytes } from "@/lib/quirq/instance";

/**
 * The dashboard's chart kit: DOM-built, no library.
 *
 * Everything here is single-series consumption data (tokens, event counts,
 * bytes), and consumption stays monochrome by the site's figure rule: colour
 * is value, and none of these charts measures delivered value. One series
 * also means no legend; the panel title names it.
 *
 * Mark discipline: thin marks with 1-2px gaps, rounded data-ends anchored to
 * the baseline, a recessive hairline axis, and zero draws nothing (a
 * minimum-width sliver where the source measured zero is a false reading).
 * Every figure keeps its numbers in the DOM through an sr-only summary, and
 * every mark carries its own hover tooltip.
 */

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ *
 * Columns
 * ------------------------------------------------------------------ */

export type ColumnPoint = {
  label: string;
  value: number;
  /** Dense charts label every nth column; the rest pass false. */
  showLabel?: boolean;
};

/**
 * Vertical bars. Hovering a column raises it and shows a tooltip; passing
 * `onSelect` makes every column a real button (aria-pressed carries the
 * selected state) so a chart can drive a filter.
 */
export function Columns({
  points,
  ariaLabel,
  unit,
  showValues = false,
  format = compactCount,
  selectedIndex = null,
  onSelect,
  className,
}: {
  points: ColumnPoint[];
  /** Names the figure for the sr-only summary. */
  ariaLabel: string;
  /** Spoken and hovered after each value, e.g. "output tokens". */
  unit?: string;
  /** Direct value labels above the bars; only for charts with few columns. */
  showValues?: boolean;
  format?: (value: number) => string;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.value));
  // With direct labels on, bars scale into 86% of the area so the tallest
  // bar's label still lands inside the chart instead of clipping.
  const scale = showValues ? 86 : 100;
  const anySelected = selectedIndex !== null && selectedIndex >= 0;

  const columns = points.map((p, i) => {
    const selected = selectedIndex === i;
    const body = (
      <>
        {hover === i && (
          <span className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 rounded-md border border-hair bg-black/90 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-ink">
            {p.label} · {format(p.value)}
            {unit ? ` ${unit}` : ""}
          </span>
        )}
        {showValues && p.value > 0 && (
          <span
            aria-hidden
            className="mb-1.5 truncate text-center font-mono text-[9.5px] text-dim tabular-nums"
          >
            {format(p.value)}
          </span>
        )}
        {p.value > 0 && (
          <span
            aria-hidden
            className={cn(
              "block w-full rounded-t-[3px] transition-colors",
              selected
                ? "bg-white/60"
                : hover === i
                  ? "bg-white/45"
                  : anySelected
                    ? "bg-white/20"
                    : "bg-white/30",
            )}
            style={{
              height: `${((p.value / max) * scale).toFixed(2)}%`,
              minHeight: "2px",
            }}
          />
        )}
      </>
    );

    // Capped so a one-point chart reads as a bar, not a slab.
    const shape =
      "relative flex h-full min-w-0 max-w-[72px] flex-1 flex-col justify-end";

    return onSelect ? (
      <button
        key={`${p.label}-${i}`}
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(i)}
        onMouseEnter={() => setHover(i)}
        onFocus={() => setHover(i)}
        onBlur={() => setHover(null)}
        className={cn(shape, "cursor-pointer")}
      >
        <span className="sr-only">
          {p.label}: {format(p.value)}
          {unit ? ` ${unit}` : ""}
        </span>
        {body}
      </button>
    ) : (
      <div
        key={`${p.label}-${i}`}
        onMouseEnter={() => setHover(i)}
        className={shape}
      >
        {body}
      </div>
    );
  });

  return (
    <figure className={cn("min-w-0", className)}>
      <div
        aria-hidden={onSelect ? undefined : true}
        onMouseLeave={() => setHover(null)}
        className="flex h-40 items-end gap-[2px]"
      >
        {columns}
      </div>

      <div
        aria-hidden
        className="mt-2 flex gap-[2px] border-t border-hair-soft pt-2"
      >
        {points.map((p, i) => (
          <span
            key={`${p.label}-${i}`}
            className="min-w-0 max-w-[72px] flex-1 truncate text-center font-mono text-[9px] text-faint"
          >
            {p.showLabel === false ? "" : p.label}
          </span>
        ))}
      </div>

      <figcaption className="sr-only">
        {ariaLabel}:{" "}
        {points
          .filter((p) => p.value > 0)
          .map((p) => `${p.label} ${p.value}${unit ? ` ${unit}` : ""}`)
          .join(", ") || "no data"}
        .
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 * Calendar filter
 * ------------------------------------------------------------------ */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * A month grid over UTC day keys (YYYY-MM-DD). Days with events are shaded
 * by count and clickable; clicking the selected day again clears the filter.
 * Days without events stay disabled: a filter that can only ever match
 * nothing is a trap, not a control.
 */
export function CalendarFilter({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<string, number>;
  selected: string | null;
  onSelect: (day: string | null) => void;
}) {
  const latest = useMemo(() => {
    const keys = Object.keys(counts).sort();
    return keys[keys.length - 1] ?? null;
  }, [counts]);

  const [view, setView] = useState(() =>
    (selected ?? latest ?? "1970-01").slice(0, 7),
  );

  // An outside selection (the overview chart drilling in) pulls the view to
  // its month; paging past it stays local state.
  useEffect(() => {
    if (selected) setView(selected.slice(0, 7));
  }, [selected]);

  const [year, month] = view.split("-").map(Number);
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const maxCount = Math.max(1, ...Object.values(counts));

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    setView(`${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`);
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-full border border-hair px-2.5 py-1 font-mono text-[11px] text-dim transition-colors hover:border-ink/30 hover:text-ink"
        >
          ‹
        </button>
        <span className="font-mono text-[11px] tracking-[0.1em] text-ink/85 uppercase">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="rounded-full border border-hair px-2.5 py-1 font-mono text-[11px] text-dim transition-colors hover:border-ink/30 hover:text-ink"
        >
          ›
        </button>
      </div>

      <div aria-hidden className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="py-1 text-center font-mono text-[9px] tracking-[0.1em] text-faint uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = `${view}-${pad2(i + 1)}`;
          const count = counts[day] ?? 0;
          const isSelected = selected === day;
          return (
            <button
              key={day}
              type="button"
              disabled={count === 0 && !isSelected}
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : day)}
              title={count > 0 ? `${day} · ${count} events` : day}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border font-mono text-[11px] tabular-nums transition-colors",
                isSelected ? "border-ink text-ink" : "border-transparent",
                count > 0
                  ? "text-ink/85 hover:border-ink/40"
                  : "cursor-default text-faint/60",
              )}
              style={
                count > 0
                  ? {
                      backgroundColor: `rgba(255,255,255,${(
                        0.08 +
                        0.3 * (count / maxCount)
                      ).toFixed(3)})`,
                    }
                  : undefined
              }
            >
              {i + 1}
              <span className="sr-only">
                {count > 0 ? `, ${count} events` : ", no events"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Folder map
 * ------------------------------------------------------------------ */

type MapNode = { node: FolderNode; children: MapNode[] };

/** The payload's flat, depth-ordered walk folded back into a hierarchy. */
function buildHierarchy(tree: FolderNode[]): MapNode[] {
  const roots: MapNode[] = [];
  const stack: MapNode[] = [];
  for (const node of tree) {
    const entry: MapNode = { node, children: [] };
    stack.length = node.depth;
    if (node.depth === 0) roots.push(entry);
    else stack[node.depth - 1]?.children.push(entry);
    stack[node.depth] = entry;
  }
  return roots;
}

const DEPTH_BG = ["bg-white/10", "bg-white/15", "bg-white/20", "bg-white/25"];

function MapLevel({
  nodes,
  parentBytes,
  rootBytes,
  depth,
  selected,
  onSelect,
}: {
  nodes: MapNode[];
  parentBytes: number;
  rootBytes: number;
  depth: number;
  selected: string | null;
  onSelect: (path: string | null) => void;
}) {
  // Zero draws nothing: empty files and empty directories live in the list
  // below, not as invented area here.
  const drawable = nodes.filter((n) => n.node.bytes > 0);
  if (drawable.length === 0) return null;

  return (
    <div className="flex w-full gap-px">
      {drawable.map(({ node, children }) => {
        const isSelected = selected === node.path;
        const share = node.bytes / rootBytes;
        const name = node.kind === "directory" ? `${node.name}/` : node.name;
        return (
          <div
            key={node.path}
            style={{ width: `${((node.bytes / parentBytes) * 100).toFixed(3)}%` }}
            className="min-w-0"
          >
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : node.path)}
              title={`${node.path} · ${formatBytes(node.bytes)} · ${(share * 100).toFixed(1)}%`}
              className={cn(
                "block h-9 w-full truncate rounded-[3px] px-1.5 text-left font-mono text-[9.5px] leading-9 transition-colors hover:bg-white/40",
                DEPTH_BG[Math.min(depth, DEPTH_BG.length - 1)],
                isSelected ? "text-ink ring-1 ring-ink ring-inset" : "text-dim",
              )}
            >
              {/* A sliver has no room for text; its name still reaches
                  hover and assistive tech. */}
              {share >= 0.06 ? (
                name
              ) : (
                <span className="sr-only">{name}</span>
              )}
            </button>
            {children.length > 0 && (
              <div className="mt-px">
                <MapLevel
                  nodes={children}
                  parentBytes={node.bytes}
                  rootBytes={rootBytes}
                  depth={depth + 1}
                  selected={selected}
                  onSelect={onSelect}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * An icicle map of the folder: width is bytes, rows are depth. Clicking a
 * segment selects its path so the list below can answer with the exact
 * numbers; clicking again clears.
 */
export function FolderMap({
  tree,
  totalBytes,
  selected,
  onSelect,
  footer,
}: {
  tree: FolderNode[];
  totalBytes: number;
  selected: string | null;
  onSelect: (path: string | null) => void;
  footer?: ReactNode;
}) {
  const roots = useMemo(() => buildHierarchy(tree), [tree]);
  if (totalBytes <= 0) return null;

  return (
    <figure className="min-w-0">
      <MapLevel
        nodes={roots}
        parentBytes={totalBytes}
        rootBytes={totalBytes}
        depth={0}
        selected={selected}
        onSelect={onSelect}
      />
      <figcaption className="mt-2 flex items-baseline justify-between gap-3 font-mono text-[9.5px] text-faint">
        <span>width is bytes · rows are depth</span>
        {footer}
      </figcaption>
    </figure>
  );
}
