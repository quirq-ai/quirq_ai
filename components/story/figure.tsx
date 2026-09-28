import { SPECTRUM } from "@/lib/spectrum";
import type { Figure, FigureMark, FigureSeries } from "./types";

/**
 * Figures: measured data as a visual, rendered from a plain JSON spec.
 *
 * Two shapes, two jobs. `bars` compares a handful of series over named
 * categories and is built out of the DOM, not SVG: the labels stay real
 * selectable text at the site's own type scale, they reflow on a phone without
 * a viewBox fighting them, and they survive with no JavaScript. `marks` plots
 * one dot per record, which genuinely needs two dimensions, so that one is
 * SVG.
 *
 * The brand rule holds here: colour is value. A series or group tagged `value`
 * spends the spectrum; anything measuring consumption stays monochrome, so a
 * chart of token spend never looks like a chart of delivered work.
 *
 * Server-safe and hook-free, so the same component renders inside a research
 * article, inside a staged beat, and inside a journey document's beat. That
 * rules out importing anything from a "use client" module, `cn` included: a
 * function exported from a client module cannot be called during a server
 * render, so class names are joined locally here.
 */

const classes = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Spectrum for value, ink for cost, walked deterministically by index. */
const toneOf = (tone: FigureSeries["tone"], index: number) =>
  tone === "value"
    ? SPECTRUM[(index * 2) % SPECTRUM.length]
    : index === 0
      ? "rgba(244,243,240,0.85)"
      : "rgba(244,243,240,0.4)";

const numeral = (value: number) =>
  Math.abs(value) >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : Math.abs(value) >= 1_000
      ? `${Math.round(value / 1_000)}k`
      : Number.isInteger(value)
        ? String(value)
        : value.toFixed(1);

const shownValue = (series: FigureSeries, i: number) =>
  series.display?.[i] ?? numeral(series.values[i] ?? 0);

/** The frame every figure sits in: hairline, glass, mono caption. */
function Frame({
  legend,
  caption,
  summary,
  children,
}: {
  legend?: React.ReactNode;
  caption?: string;
  /** Read instead of the visual by anything that cannot see it. */
  summary: string;
  children: React.ReactNode;
}) {
  return (
    /* Opaque enough to read over the brightest pose: a figure on the stage
       competes with the bloom, and a bar at 6% white loses that fight. */
    <figure className="mt-7 overflow-hidden rounded-2xl border border-hair bg-black/70 backdrop-blur-xl">
      {legend && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-hair-soft px-5 py-3">
          {legend}
        </div>
      )}

      <div className="px-5 py-5">
        {/* The visual is decoration over data that is also in the DOM: the
            summary below carries the same reading for a screen reader. */}
        <div aria-hidden>{children}</div>
        <p className="sr-only">{summary}</p>
      </div>

      {caption && (
        <figcaption className="border-t border-hair-soft px-5 py-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Swatch({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className="h-1.5 w-4 rounded-full"
        style={{ background: colour }}
      />
      <span className="font-mono text-[10px] tracking-[0.14em] text-dim uppercase">
        {label}
      </span>
    </span>
  );
}

function Bars({ figure }: { figure: Extract<Figure, { kind: "bars" }> }) {
  const { categories, series } = figure;
  const ceiling =
    figure.max ??
    Math.max(1, ...series.flatMap((it) => it.values.filter((v) => Number.isFinite(v))));

  const summary = [
    figure.unit ? `${figure.unit}.` : null,
    ...categories.map(
      (category, i) =>
        `${category}: ${series
          .map((it) => `${it.label} ${shownValue(it, i)}`)
          .join(", ")}.`,
    ),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Frame
      summary={summary}
      caption={figure.caption}
      legend={
        <>
          {/* One series carries no legend: the unit below already names it,
              and a swatch for a set of one explains nothing. */}
          {series.length > 1 &&
            series.map((it, i) => (
              <Swatch key={it.label} colour={toneOf(it.tone, i)} label={it.label} />
            ))}
          {figure.unit && (
            <span
              className={classes(
                "font-mono text-[10px] tracking-[0.06em] text-faint",
                series.length > 1 && "sm:ml-auto",
              )}
            >
              {figure.unit}
            </span>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {categories.map((category, i) => (
          <div key={category} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[10.5px] tracking-[0.1em] text-dim uppercase">
                {category}
              </span>
              <span className="flex items-baseline gap-3">
                {series.map((it, s) => (
                  <span
                    key={it.label}
                    className="numeric font-mono text-[11px] tabular-nums"
                    style={{ color: toneOf(it.tone, s) }}
                  >
                    {shownValue(it, i)}
                  </span>
                ))}
              </span>
            </div>

            {series.map((it, s) => {
              const value = it.values[i];
              // A floor keeps a small value visible, but zero gets no bar at
              // all: a sliver where the note measured nothing is a lie.
              const share = Number.isFinite(value)
                ? (Math.max(0, value) / ceiling) * 100
                : 0;
              const width = share > 0 ? Math.max(1.5, share) : 0;
              return (
                <div
                  key={it.label}
                  className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${width}%`, background: toneOf(it.tone, s) }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Frame>
  );
}

const VIEW = { w: 640, h: 300, pad: 18 } as const;

function Marks({ figure }: { figure: Extract<Figure, { kind: "marks" }> }) {
  const { marks } = figure;
  const xs = marks.map((m) => m.x);
  const ys = marks.map((m) => m.y);
  const span = (values: number[]) => {
    const low = Math.min(...values);
    const high = Math.max(...values);
    return { low, range: high - low || 1 };
  };
  const x = span(xs.length ? xs : [0, 1]);
  const y = span(ys.length ? ys : [0, 1]);
  const heaviest = Math.max(1, ...marks.map((m) => m.size ?? 1));

  const groups = figure.groups ?? [];
  const colourOf = (mark: FigureMark) => {
    const at = groups.findIndex((g) => g.label === mark.group);
    return at === -1 ? "rgba(244,243,240,0.6)" : toneOf(groups[at].tone, at);
  };

  const place = (mark: FigureMark) => ({
    cx: VIEW.pad + ((mark.x - x.low) / x.range) * (VIEW.w - VIEW.pad * 2),
    // SVG y grows downward; the reading is that up means more.
    cy: VIEW.h - VIEW.pad - ((mark.y - y.low) / y.range) * (VIEW.h - VIEW.pad * 2),
    r: 2 + Math.sqrt((mark.size ?? 1) / heaviest) * 4,
  });

  const summary = `${marks.length} marks plotted, ${figure.xLabel} across, ${figure.yLabel} up.${
    groups.length
      ? ` Groups: ${groups
          .map((g) => `${g.label}, ${marks.filter((m) => m.group === g.label).length}`)
          .join("; ")}.`
      : ""
  }`;

  return (
    <Frame
      summary={summary}
      caption={figure.caption}
      legend={
        groups.length ? (
          <>
            {groups.map((g, i) => (
              <Swatch key={g.label} colour={toneOf(g.tone, i)} label={g.label} />
            ))}
            <span className="font-mono text-[10px] tracking-[0.06em] text-faint sm:ml-auto">
              {marks.length} marks
            </span>
          </>
        ) : undefined
      }
    >
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="h-auto w-full"
        role="presentation"
      >
        <rect
          x={0.5}
          y={0.5}
          width={VIEW.w - 1}
          height={VIEW.h - 1}
          rx={12}
          fill="none"
          stroke="rgba(244,243,240,0.055)"
        />
        {[0.25, 0.5, 0.75].map((at) => (
          <line
            key={at}
            x1={VIEW.pad}
            x2={VIEW.w - VIEW.pad}
            y1={VIEW.h * at}
            y2={VIEW.h * at}
            stroke="rgba(244,243,240,0.045)"
          />
        ))}

        {marks.map((mark, i) => {
          const { cx, cy, r } = place(mark);
          return (
            <circle
              key={`${mark.label ?? "mark"}-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={colourOf(mark)}
              fillOpacity={0.72}
            >
              {mark.label && <title>{mark.label}</title>}
            </circle>
          );
        })}
      </svg>

      <div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
        <span>{figure.yLabel} &uarr;</span>
        <span>{figure.xLabel} &rarr;</span>
      </div>
    </Frame>
  );
}

/** Renders a figure, or nothing at all if the spec is a kind we do not know. */
export function FigureView({ figure }: { figure: Figure }) {
  if (figure.kind === "bars") return <Bars figure={figure} />;
  if (figure.kind === "marks") return <Marks figure={figure} />;
  return null;
}
