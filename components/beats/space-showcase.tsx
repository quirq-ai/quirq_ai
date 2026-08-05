"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
  cn,
} from "@/components/ui/primitives";
import { GlassText } from "@/components/ui/glass";

const CAPTURED_AT = "28 July 2026";

type Metric = {
  value: string;
  label: string;
  note?: string;
};

const GRAPH_METRICS: Metric[] = [
  { value: "400", label: "artifacts" },
  { value: "52", label: "clusters" },
  { value: "495", label: "links" },
  { value: "42", label: "cross-ties" },
];

const SESSION_METRICS: Metric[] = [
  { value: "4.6B", label: "tokens", note: "7-day view" },
  { value: "53", label: "sessions", note: "7-day view" },
  { value: "87.0M", label: "tok / session" },
  { value: "~$1,719", label: "reported cost*", note: "partial estimate" },
];

const MODEL_METRICS: Metric[] = [
  { value: "9.2B", label: "gpt-5.6-sol tokens", note: "all time" },
  { value: "62.9%", label: "model share" },
  { value: "2.1B", label: "fable-5 tokens", note: "all time" },
  { value: "919.2M", label: "opus-4-7 tokens", note: "all time" },
];

const SPACE_VIEWS = [
  {
    number: "01",
    title: "Find missing context",
    copy: "Graph · trace repositories, documents, experiments, and the links between them.",
  },
  {
    number: "02",
    title: "Review what changed",
    copy: "Timeline · see the workspace by purpose and follow its movement over time.",
  },
  {
    number: "03",
    title: "Spot heavy sessions",
    copy: "Sessions · compare runtime, model, token, tool, trend, and reported-cost telemetry.",
  },
  {
    number: "04",
    title: "Resume active work",
    copy: "Projects · return to activity, todos, and history without copying conversations.",
  },
] as const;

function ScreenFrame({
  src,
  alt,
  route,
  title,
  caption,
}: {
  src: string;
  alt: string;
  route: string;
  title: string;
  caption: string;
}) {
  return (
    <figure>
      <div className="relative overflow-hidden rounded-[22px] border border-white/[0.2] bg-[#090b0d] shadow-[0_34px_100px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.1)] sm:rounded-[28px]">
        <div className="flex min-h-11 items-center justify-between gap-4 border-b border-white/[0.1] bg-[#0c0f12] px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full bg-[#a8d957] shadow-[0_0_12px_rgba(168,217,87,0.5)]"
            />
            <span className="truncate font-mono text-[9px] tracking-[0.14em] text-white/72 uppercase sm:text-[10px]">
              XO Space · {title}
            </span>
          </div>
          <code className="hidden shrink-0 font-mono text-[8.5px] text-white/38 sm:block">
            {route}
          </code>
        </div>

        <div className="relative aspect-video w-full overflow-hidden bg-[#090b0d]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1180px) 1080px, (min-width: 768px) 90vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]"
          />
        </div>
      </div>

      <figcaption className="mt-3 flex flex-col gap-1.5 rounded-xl border border-white/[0.08] bg-black/65 px-3 py-2.5 font-mono text-[9px] leading-relaxed text-white/58 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-4 sm:text-[9.5px]">
        <span>{caption}</span>
        <span className="shrink-0 text-white/65">
          Live capture · {CAPTURED_AT}
        </span>
      </figcaption>
    </figure>
  );
}

function MetricStrip({
  metrics,
  footnote,
}: {
  metrics: Metric[];
  footnote?: string;
}) {
  return (
    <div className="mt-5">
      <dl className="grid grid-cols-2 overflow-hidden rounded-[18px] border border-white/[0.12] bg-black/70 backdrop-blur-xl lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={`${metric.value}-${metric.label}`}
            className={cn(
              "flex min-w-0 flex-col px-4 py-4 sm:px-5 sm:py-5",
              index % 2 !== 0 && "border-l border-white/[0.1]",
              index > 1 && "border-t border-white/[0.1] lg:border-t-0",
              index > 0 && "lg:border-l lg:border-white/[0.1]",
            )}
          >
            <dt className="order-2 mt-2 font-mono text-[8.5px] tracking-[0.13em] text-white/64 uppercase sm:text-[9.5px]">
              {metric.label}
            </dt>
            <dd className="numeric order-1 text-[clamp(22px,3vw,36px)] leading-none font-medium tracking-[-0.045em] text-ink">
              {metric.value}
            </dd>
            {metric.note && (
              <p className="order-3 mt-1 text-[9.5px] text-white/38">
                {metric.note}
              </p>
            )}
          </div>
        ))}
      </dl>
      {footnote && (
        <p className="mt-2.5 font-mono text-[8.5px] leading-relaxed text-white/38">
          {footnote}
        </p>
      )}
    </div>
  );
}

function RightMarker({ children }: { children: ReactNode }) {
  return (
    <Rise className="flex items-center justify-end gap-3">
      <span className="spectrum-rule h-px w-12 opacity-70" />
      <span className="label">{children}</span>
      <span
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ background: "var(--spectrum)" }}
      />
    </Rise>
  );
}

export function WorkspaceGraph() {
  return (
    <Beat
      index={1}
      id="consumption"
      className="min-h-[118svh] py-28 sm:py-32"
    >
      <div className="relative max-w-2xl">
        <TextScrim />
        <div className="relative">
          <Marker>01 · find the work</Marker>
          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>Find the work you need.</Reveal>
            <Reveal delay={0.13}>
              <GlassText>See what led to it.</GlassText>
            </Reveal>
          </h2>
          <Rise delay={0.22}>
            <p className="lede over-stage mt-5 max-w-[52ch] sm:mt-6">
              Start with the graph when you do not know where context lives.
              Locate repositories, documents, experiments, and agent-made
              artifacts, then follow their links before you open the next task.
            </p>
          </Rise>
        </div>
      </div>

      <Rise delay={0.28} className="relative mt-9 sm:mt-11">
        <ScreenFrame
          src="/assets/space-ui/workspace-graph.jpg"
          alt="The live XO Space graph view showing the Quirq workspace as a network of artifact clusters."
          route="/space/#/graph"
          title="Workspace graph"
          caption="Open Graph to locate context and follow the relationships behind it."
        />
        <MetricStrip metrics={GRAPH_METRICS} />
      </Rise>
    </Beat>
  );
}

export function SessionIntelligence() {
  return (
    <Beat
      index={2}
      id="delivery"
      className="min-h-[118svh] py-28 sm:py-32"
    >
      <div className="relative ml-auto max-w-2xl text-right">
        <TextScrim />
        <div className="relative">
          <RightMarker>02 · review usage</RightMarker>
          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>See where the tokens go.</Reveal>
            <Reveal delay={0.13}>
              <GlassText>Inspect the outliers.</GlassText>
            </Reveal>
          </h2>
          <Rise delay={0.22}>
            <p className="lede over-stage ml-auto mt-5 max-w-[55ch] sm:mt-6">
              Filter Claude Code, Codex, and Cursor by time range. Compare
              session volume, model mix, token usage, tools, trends, and
              reported cost so you know which run to inspect first.
            </p>
          </Rise>
        </div>
      </div>

      <Rise delay={0.28} className="relative mt-9 sm:mt-11">
        <ScreenFrame
          src="/assets/space-ui/session-overview.jpg"
          alt="The real XO Space session overview showing a seven-day token trend, heatmap, model mix, and aggregate session metrics."
          route="/space/#/sessions"
          title="Session overview"
          caption="Open Sessions to compare the seven-day signal across all three runtimes."
        />
        <MetricStrip
          metrics={SESSION_METRICS}
          footnote="* Cost is a partial estimate and includes only telemetry sources that report cost."
        />
      </Rise>
    </Beat>
  );
}

export function SpaceDashboard() {
  return (
    <Beat
      index={3}
      id="ledger"
      className="min-h-[120svh] py-28 sm:py-32"
    >
      <div className="relative max-w-2xl">
        <TextScrim />
        <div className="relative">
          <Marker>03 · choose your next move</Marker>
          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>Open one dashboard.</Reveal>
            <Reveal delay={0.13}>
              <GlassText>Know where to look next.</GlassText>
            </Reveal>
          </h2>
          <Rise delay={0.22}>
            <p className="lede over-stage mt-5 max-w-[54ch] sm:mt-6">
              Use Graph when context is missing, Sessions when usage spikes,
              Timeline to review what changed, and Projects when you need to
              resume. These are the same local Space views you get after
              connecting.
            </p>
          </Rise>
        </div>
      </div>

      <Rise delay={0.28} className="relative mt-9 sm:mt-11">
        <ScreenFrame
          src="/assets/space-ui/model-breakdown.jpg"
          alt="The real XO Space model breakdown showing all-time token volume and share across the models used in this workspace."
          route="/space/#/sessions · models"
          title="Model breakdown"
          caption="Open Models to see which models account for the workspace's token volume."
        />
        <MetricStrip metrics={MODEL_METRICS} />
      </Rise>

      <Rise delay={0.34} className="relative mt-6">
        <div className="grid overflow-hidden rounded-[18px] border border-white/[0.12] bg-black/70 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {SPACE_VIEWS.map((view, index) => (
            <article
              key={view.title}
              className={cn(
                "p-4 sm:p-5",
                index > 0 && "border-t border-white/[0.1] sm:border-t-0",
                index % 2 !== 0 && "sm:border-l sm:border-white/[0.1]",
                index > 1 && "sm:border-t lg:border-t-0",
                index > 0 && "lg:border-l lg:border-white/[0.1]",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[8px] text-white/35">
                  {view.number}
                </span>
                <h3 className="text-[14px] font-medium text-ink">
                  {view.title}
                </h3>
              </div>
              <p className="mt-2 text-[10.5px] leading-relaxed text-white/52">
                {view.copy}
              </p>
            </article>
          ))}
        </div>
      </Rise>
    </Beat>
  );
}
