"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  compactCount,
  formatDuration,
  isoClock,
  readFolderState,
  type FolderNode,
  type FolderPayload,
  type OpenSession,
  type SessionAugment,
  type SessionStats,
  type StatsWindow,
  type TimelineEvent,
} from "@/lib/quirq/folder";
import { formatAgo, formatBytes, secondsSince } from "@/lib/quirq/instance";
import { Beat, cn } from "@/components/ui/primitives";
import { beatsResized } from "@/lib/beat-registry";
import { CalendarFilter, Columns, FolderMap } from "./charts";

/* ------------------------------------------------------------------ *
 * State
 *
 * One snapshot drives every tab. Nothing polls: the folder is read once on
 * mount and again when the reader asks. The only recurring timer is a slow
 * clock that keeps the "ago" labels honest between refreshes.
 * ------------------------------------------------------------------ */

type FolderState =
  | { status: "loading" }
  | { status: "ready"; payload: FolderPayload; ms: number }
  | { status: "failed"; reason: string };

const TAB_IDS = [
  "overview",
  "folder",
  "presence",
  "telemetry",
  "timeline",
] as const;

type TabId = (typeof TAB_IDS)[number];

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0");

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const shortId = (id: string) => (id.length > 8 ? id.slice(0, 8) : id);

/** The augment file stamps epoch milliseconds; everything else is ISO. A
 *  zero or unfinite stamp must degrade the way formatAgo degrades, because
 *  toISOString throws on an invalid date rather than shrugging at it. */
const agoFromMs = (ms: number, now: number) =>
  Number.isFinite(ms) && ms > 0
    ? formatAgo(new Date(ms).toISOString(), now)
    : "unrecorded";

/* ------------------------------------------------------------------ *
 * Chrome
 * ------------------------------------------------------------------ */

/** `scrolls` drops the clip: the global focus ring sits 4px outside a
 *  focusable scroll region, and an overflow-hidden ancestor would shave it. */
function Panel({
  title,
  aside,
  scrolls,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  scrolls?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl border border-hair bg-black/70",
        scrolls ? "overflow-visible" : "overflow-hidden",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5 sm:px-6">
        <h2 className="label">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-hair-soft px-5 py-4 font-mono text-[10.5px] leading-relaxed text-dim sm:px-6">
      {children}
    </p>
  );
}

const PILL =
  "rounded-full px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors";

const GHOST_PILL =
  "border border-hair text-dim hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-dim";

function Tile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="bg-black/80 px-5 py-6 text-left">
      <p className="label text-[9.5px]">{label}</p>
      <p className="numeric mt-3.5 font-mark text-[clamp(21px,2.4vw,30px)] font-semibold text-ink tabular-nums">
        {value}
      </p>
      {note && (
        <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-faint">
          {note}
        </p>
      )}
    </div>
  );
}

function Field({
  term,
  value,
  tone,
}: {
  term: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
        {term}
      </dt>
      <dd
        className={cn(
          "numeric mt-1 font-mono text-[11px] break-words tabular-nums",
          tone === "warn" ? "text-spec-orange" : "text-ink/80",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Th({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

const CELL = "px-4 font-mono text-[12px] tabular-nums whitespace-nowrap";

/** A thin monochrome share bar. Counts here are consumption, and consumption
 *  stays monochrome by the site's own figure rule: colour is value. */
function ShareBar({ share }: { share: number }) {
  return (
    <span
      aria-hidden
      className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-white/6"
    >
      <span
        className="block h-full rounded-full bg-white/30"
        style={{ width: `${(Math.min(Math.max(share, 0), 1) * 100).toFixed(2)}%` }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Tabs
 *
 * The APG tabs pattern with automatic activation: the tablist is one tab
 * stop, arrows move and select, and every panel stays mounted under a
 * `hidden` attribute so aria-controls always points at a real element.
 * ------------------------------------------------------------------ */

type TabSpec = { id: TabId; label: string; count?: number };

function TabBar({
  tabs,
  active,
  onSelect,
}: {
  tabs: TabSpec[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const current = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === -1) return;
    event.preventDefault();
    onSelect(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      onKeyDown={onKeyDown}
      className="flex overflow-x-auto border-b border-hair-soft"
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-2.5 font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors",
              selected
                ? "border-ink text-ink"
                : "border-transparent text-dim hover:text-ink",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "numeric ml-2 tabular-nums",
                  selected ? "text-dim" : "text-faint",
                )}
              >
                {compactCount(tab.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TabPanel({
  id,
  active,
  children,
}: {
  id: TabId;
  active: TabId;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={active !== id}
      className="mt-6"
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The dashboard
 *
 * One compact beat holding a header, a horizontal tablist, and five panels:
 * overview (tiles and charts), folder, presence, telemetry, timeline. The
 * beat still registers (that is the logic the unlit stage keeps), and the
 * active tab is mirrored into the URL hash so a view can be shared.
 * ------------------------------------------------------------------ */

export function Dashboard() {
  const [folder, setFolder] = useState<FolderState>({ status: "loading" });
  const [tab, setTab] = useState<TabId>("overview");
  const [now, setNow] = useState(() => Date.now());
  const probeToken = useRef(0);

  const load = useCallback(async () => {
    const token = ++probeToken.current;
    setFolder({ status: "loading" });
    const read = await readFolderState();
    if (token !== probeToken.current) return;
    setNow(Date.now());
    setFolder(
      read.ok
        ? { status: "ready", payload: read.payload, ms: read.ms }
        : { status: "failed", reason: read.reason },
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Restore the tab from the hash after mount (the page prerenders
  // statically, so the server cannot know the fragment), and follow later
  // hash-only navigations: those never remount the component. selectTab uses
  // replaceState, which fires no hashchange, so selection cannot loop here.
  useEffect(() => {
    const apply = () => {
      const fromHash = window.location.hash.slice(1);
      if ((TAB_IDS as readonly string[]).includes(fromHash)) {
        setTab(fromHash as TabId);
      } else if (fromHash === "") {
        setTab("overview");
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const selectTab = useCallback((id: TabId) => {
    setTab(id);
    window.history.replaceState(
      null,
      "",
      id === "overview"
        ? window.location.pathname + window.location.search
        : `#${id}`,
    );
  }, []);

  // Ten seconds is enough to keep "12s ago" from lying while never becoming
  // a poll: the labels age, the data does not.
  useEffect(() => {
    if (folder.status !== "ready") return;
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, [folder.status]);

  // Data or tab changes move the section's height; the scroll runtime maps
  // section centres, so it is told directly rather than left to a
  // ResizeObserver a throttled tab may defer.
  useEffect(() => {
    beatsResized();
  }, [folder, tab]);

  const payload = folder.status === "ready" ? folder.payload : null;
  const present = payload?.root.present ?? false;

  const rolling7 = payload?.stats?.rolling["7d"] ?? null;
  // The wider window when the file has one, and an honest label when it does
  // not: a 7 day figure under a "30d" heading would be a quiet lie.
  const rolling30 = payload?.stats?.rolling["30d"] ?? null;
  const windowStats = rolling30 ?? rolling7;
  const windowLabel = rolling30 ? "30d" : "7d";

  const openSessions = payload?.activity.workspace?.open_sessions ?? [];

  const maxFileBytes = useMemo(
    () =>
      payload
        ? Math.max(
            1,
            ...payload.tree
              .filter((node) => node.kind === "file")
              .map((node) => node.bytes),
          )
        : 1,
    [payload],
  );

  const days = useMemo(
    () =>
      Object.entries(payload?.stats?.by_day ?? {}).sort(([a], [b]) =>
        a.localeCompare(b),
      ),
    [payload],
  );

  const sessionRows = useMemo(() => {
    if (!payload) return [];
    const ids = new Set([
      ...Object.keys(payload.stats?.by_session ?? {}),
      ...Object.keys(payload.sessions_augment?.sessions ?? {}),
    ]);
    const rows = [...ids].map((id) => ({
      id,
      stats: payload.stats?.by_session[id] ?? null,
      augment: payload.sessions_augment?.sessions[id] ?? null,
    }));
    const lastOf = (row: (typeof rows)[number]) =>
      row.augment?.lastActivity ?? 0;
    return rows.sort((a, b) => lastOf(b) - lastOf(a));
  }, [payload]);

  // The timeline filters: one calendar day, any set of event types. Both
  // live here rather than in the tab so the overview's day chart can drill
  // straight into a filtered timeline.
  const [timelineDay, setTimelineDay] = useState<string | null>(null);
  const [timelineTypes, setTimelineTypes] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleTimelineType = useCallback((type: string) => {
    setTimelineTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const clearTimelineFilters = useCallback(() => {
    setTimelineDay(null);
    setTimelineTypes(new Set());
  }, []);

  const timelineFiltered = timelineDay !== null || timelineTypes.size > 0;

  /** Events per UTC day, over the served slice, for the calendar shading. */
  const eventDayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const event of payload?.timeline?.events ?? []) {
      const day = event.ts.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    }
    return counts;
  }, [payload]);

  const timelineMatches = useMemo(() => {
    let events = [...(payload?.timeline?.events ?? [])].reverse();
    if (timelineDay) {
      events = events.filter((e) => e.ts.slice(0, 10) === timelineDay);
    }
    if (timelineTypes.size > 0) {
      events = events.filter((e) => timelineTypes.has(e.type));
    }
    return events;
  }, [payload, timelineDay, timelineTypes]);

  const timelineRows = useMemo(
    () => timelineMatches.slice(0, 60),
    [timelineMatches],
  );

  const outputByDay = useMemo(
    () =>
      days.map(([day, stat]) => ({
        label: day.slice(5),
        value: stat.tokens?.output ?? 0,
      })),
    [days],
  );

  // The served slice of the timeline, folded onto a 24 hour clock. Labels
  // every third hour: 24 labelled columns collide at this width.
  const eventsByHour = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      label: pad(hour),
      value: 0,
      showLabel: hour % 3 === 0,
    }));
    for (const event of payload?.timeline?.events ?? []) {
      const hour = Number(event.ts.slice(11, 13));
      if (Number.isInteger(hour) && hour >= 0 && hour < 24) {
        buckets[hour].value += 1;
      }
    }
    return buckets;
  }, [payload]);

  const servedEvents = payload?.timeline?.events.length ?? 0;

  const tabs: TabSpec[] = [
    { id: "overview", label: "Overview" },
    { id: "folder", label: "Folder", count: payload?.totals.files },
    { id: "presence", label: "Presence", count: openSessions.length },
    { id: "telemetry", label: "Telemetry", count: sessionRows.length },
    { id: "timeline", label: "Timeline", count: payload?.timeline?.total },
  ];

  return (
    <Beat index={0} id="dashboard" compact>
      {/* ---------------- header ---------------- */}

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="label">Dashboard</h1>
          <p className="mt-2 font-mark text-[24px] font-semibold text-ink">
            .quirq
          </p>
          {payload && present && (
            <p className="mt-1 font-mono text-[10.5px] break-all text-faint">
              {payload.root.path}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span
            role="status"
            className="font-mono text-[10.5px] leading-relaxed text-faint"
          >
            {folder.status === "loading" && "Reading…"}
            {folder.status === "failed" && `Could not read: ${folder.reason}`}
            {folder.status === "ready" &&
              (present
                ? `read in ${Math.max(folder.ms, 0).toFixed(0)} ms · ${isoClock(payload!.generated_at)} UTC`
                : "no folder")}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={folder.status === "loading"}
            className={cn(PILL, GHOST_PILL)}
          >
            Refresh
          </button>
        </div>
      </div>

      {payload && !present && <MissingFolder path={payload.root.path} />}

      {/* ---------------- tabs ---------------- */}

      {payload && present && (
        <>
          <div className="mt-8">
            <TabBar tabs={tabs} active={tab} onSelect={selectTab} />
          </div>

          {/* ---------------- overview ---------------- */}

          <TabPanel id="overview" active={tab}>
            <div className="overflow-hidden rounded-2xl border border-hair bg-black/40">
              <div className="grid grid-cols-2 gap-px bg-white/6 md:grid-cols-3 xl:grid-cols-6">
                <Tile
                  label="On disk"
                  value={formatBytes(payload.totals.bytes)}
                  note={`${payload.totals.files} files · ${payload.totals.directories} folders`}
                />
                <Tile
                  label="Open sessions"
                  value={String(openSessions.length)}
                  note={
                    openSessions.length > 0
                      ? [...new Set(openSessions.map((s) => s.agent))].join(
                          " · ",
                        )
                      : undefined
                  }
                />
                <Tile
                  label="Tokens · 7d"
                  value={
                    rolling7
                      ? compactCount(
                          rolling7.tokens.input + rolling7.tokens.output,
                        )
                      : "n/a"
                  }
                  note={
                    rolling7
                      ? `${compactCount(rolling7.tokens.input)} in · ${compactCount(rolling7.tokens.output)} out`
                      : undefined
                  }
                />
                <Tile
                  label="Active · 7d"
                  value={rolling7 ? `${rolling7.active_minutes}m` : "n/a"}
                  note={
                    rolling7
                      ? `${rolling7.sessions} ${plural(rolling7.sessions, "session", "sessions")}`
                      : undefined
                  }
                />
                <Tile
                  label="Files edited · 7d"
                  value={rolling7 ? String(rolling7.files_edited) : "n/a"}
                />
                <Tile
                  label="Timeline"
                  value={String(payload.timeline?.total ?? 0)}
                  note={
                    payload.timeline &&
                    Object.keys(payload.timeline.by_type).length > 0
                      ? Object.entries(payload.timeline.by_type)
                          .map(([type, count]) => `${count} ${type}`)
                          .join(" · ")
                      : undefined
                  }
                />
              </div>
            </div>

            {(outputByDay.length > 0 || servedEvents > 0) && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {outputByDay.length > 0 && (
                  <Panel
                    title="Output tokens · by day"
                    aside={
                      <span className="font-mono text-[10px] text-faint">
                        click a day to open it in the timeline
                      </span>
                    }
                  >
                    <div className="px-5 py-5 sm:px-6">
                      <Columns
                        points={outputByDay}
                        ariaLabel="Output tokens by day"
                        unit="output tokens"
                        showValues
                        selectedIndex={days.findIndex(
                          ([day]) => day === timelineDay,
                        )}
                        onSelect={(i) => {
                          const day = days[i]?.[0];
                          if (!day) return;
                          if (day === timelineDay) {
                            setTimelineDay(null);
                          } else {
                            setTimelineDay(day);
                            selectTab("timeline");
                          }
                        }}
                      />
                    </div>
                  </Panel>
                )}
                {servedEvents > 0 && (
                  <Panel
                    title="Timeline events · by hour · UTC"
                    aside={
                      <span className="numeric font-mono text-[11px] text-dim tabular-nums">
                        last {servedEvents}{" "}
                        {plural(servedEvents, "event", "events")}
                      </span>
                    }
                  >
                    <div className="px-5 py-5 sm:px-6">
                      <Columns
                        points={eventsByHour}
                        ariaLabel="Timeline events by hour, UTC"
                        unit="events"
                      />
                    </div>
                  </Panel>
                )}
              </div>
            )}
          </TabPanel>

          {/* ---------------- folder ---------------- */}

          <TabPanel id="folder" active={tab}>
            <TreePanel
              tree={payload.tree}
              totals={payload.totals}
              maxFileBytes={maxFileBytes}
              locks={payload.locks}
              offsets={payload.offsets}
              now={now}
            />
          </TabPanel>

          {/* ---------------- presence ---------------- */}

          <TabPanel id="presence" active={tab}>
            <div className="grid gap-6 lg:grid-cols-2">
              <PresencePanel
                workspace={payload.activity.workspace}
                projects={payload.activity.projects}
                now={now}
              />
              <ConfigPanel payload={payload} now={now} />
              {payload.xo && (
                <div className="lg:col-span-2">
                  <CapabilitiesPanel xo={payload.xo} />
                </div>
              )}
            </div>
          </TabPanel>

          {/* ---------------- telemetry ---------------- */}

          <TabPanel id="telemetry" active={tab}>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
              {days.length > 0 && <DaysPanel days={days} />}

              {windowStats && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <ByModelPanel window={windowStats} label={windowLabel} />
                  <ByToolPanel window={windowStats} label={windowLabel} />
                </div>
              )}

              {sessionRows.length > 0 && (
                <SessionsTable rows={sessionRows} now={now} />
              )}

              {days.length === 0 && sessionRows.length === 0 && (
                <p className="font-mono text-[10.5px] leading-relaxed text-faint">
                  stats.json is present and empty.
                </p>
              )}
            </div>
          </TabPanel>

          {/* ---------------- timeline ---------------- */}

          <TabPanel id="timeline" active={tab}>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
              {payload.timeline && payload.timeline.total > 0 && (
                <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                  <Panel
                    title="Calendar"
                    aside={
                      timelineDay && (
                        <button
                          type="button"
                          onClick={() => setTimelineDay(null)}
                          className="font-mono text-[10px] tracking-[0.1em] text-dim uppercase transition-colors hover:text-ink"
                        >
                          {timelineDay} ✕
                        </button>
                      )
                    }
                  >
                    <div className="px-5 py-5 sm:px-6">
                      <CalendarFilter
                        counts={eventDayCounts}
                        selected={timelineDay}
                        onSelect={setTimelineDay}
                      />
                    </div>
                    <Caption>
                      shading is events per day · over the last{" "}
                      {payload.timeline.events.length} events
                    </Caption>
                  </Panel>
                  <ByTypePanel
                    by_type={payload.timeline.by_type}
                    selected={timelineTypes}
                    onToggle={toggleTimelineType}
                  />
                </div>
              )}
              {payload.timeline && payload.timeline.total > 0 ? (
                <TimelinePanel
                  timeline={payload.timeline}
                  rows={timelineRows}
                  matched={timelineMatches.length}
                  filtered={timelineFiltered}
                  onClear={clearTimelineFilters}
                  now={now}
                />
              ) : (
                <p className="font-mono text-[10.5px] leading-relaxed text-faint">
                  timeline.jsonl has no events.
                </p>
              )}
            </div>
          </TabPanel>
        </>
      )}
    </Beat>
  );
}

/* ------------------------------------------------------------------ *
 * The missing-folder state
 * ------------------------------------------------------------------ */

function MissingFolder({ path }: { path: string }) {
  return (
    <div className="mt-8 max-w-2xl overflow-hidden rounded-2xl border border-hair bg-black/70 px-5 py-9 sm:px-6">
      <p className="label text-[9.5px]">No folder to read</p>
      {path && (
        <p className="mt-4 font-mono text-[11px] leading-relaxed break-all text-dim">
          {path}
        </p>
      )}
      <p className="mt-3 max-w-[62ch] font-mono text-[10.5px] leading-relaxed text-faint">
        QUIRQ_DIR selects another workspace&rsquo;s .quirq.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Folder · the tree
 * ------------------------------------------------------------------ */

function TreePanel({
  tree,
  totals,
  maxFileBytes,
  locks,
  offsets,
  now,
}: {
  tree: FolderNode[];
  totals: { files: number; directories: number; bytes: number };
  maxFileBytes: number;
  locks: string[];
  offsets: FolderPayload["offsets"];
  now: number;
}) {
  // Selecting a segment in the map answers with the exact row in the list.
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPath) return;
    document
      .getElementById(`fnode-${selectedPath}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedPath]);

  return (
    <Panel
      title=".quirq"
      aside={
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {formatBytes(totals.bytes)} · {totals.files}{" "}
          {plural(totals.files, "file", "files")}
        </span>
      }
    >
      <div className="border-b border-hair-soft px-5 py-5 sm:px-6">
        <FolderMap
          tree={tree}
          totalBytes={totals.bytes}
          selected={selectedPath}
          onSelect={setSelectedPath}
          footer={
            selectedPath && (
              <button
                type="button"
                onClick={() => setSelectedPath(null)}
                className="truncate font-mono text-[9.5px] tracking-[0.08em] text-dim uppercase transition-colors hover:text-ink"
              >
                {selectedPath} ✕
              </button>
            )
          }
        />
      </div>

      <ul className="px-5 py-2 sm:px-6">
        {tree.map((node) => (
          <li
            key={node.path}
            id={`fnode-${node.path}`}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b border-hair-soft py-2.5 last:border-b-0 sm:gap-x-6",
              selectedPath === node.path && "bg-white/[0.05]",
            )}
          >
            <span
              className="min-w-0"
              style={{ paddingLeft: `${node.depth * 18}px` }}
            >
              <span className="flex min-w-0 items-baseline gap-3">
                <span
                  className={cn(
                    "truncate font-mono text-[12.5px]",
                    node.kind === "directory" ? "text-ink" : "text-ink/85",
                  )}
                >
                  {node.name}
                  {node.kind === "directory" && "/"}
                </span>
                {node.sensitive && (
                  <span className="shrink-0 rounded-full border border-spec-yellow/40 px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-spec-yellow uppercase">
                    masked
                  </span>
                )}
              </span>
              {node.kind === "file" && node.bytes > 0 && (
                <ShareBar share={node.bytes / maxFileBytes} />
              )}
            </span>
            <span className="numeric text-right font-mono text-[11px] text-dim tabular-nums">
              {node.kind === "directory"
                ? `${node.entries} ${plural(node.entries, "entry", "entries")} · ${formatBytes(node.bytes)}`
                : formatBytes(node.bytes)}
              <span className="mt-1 block text-faint">
                {formatAgo(node.modified_at, now)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {(locks.length > 0 || offsets) && (
        <Caption>
          {locks.length > 0 &&
            `${locks.length} ${plural(locks.length, "lock", "locks")} · ${locks.join(", ")}`}
          {locks.length > 0 && offsets && " · "}
          {offsets &&
            `${offsets.tracked} ${plural(offsets.tracked, "log", "logs")} tailed · ${offsets.folders.length} ${plural(offsets.folders.length, "folder", "folders")} · ${formatBytes(offsets.consumed_bytes)} consumed`}
        </Caption>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Presence and configuration
 * ------------------------------------------------------------------ */

function SessionLine({
  session,
  now,
}: {
  session: OpenSession;
  now: number;
}) {
  const beat = secondsSince(session.last_activity_at, now);
  const fresh = beat !== null && beat < 120;

  return (
    <li className="flex items-start gap-3 border-b border-hair-soft py-4 last:border-b-0">
      {fresh ? (
        <span className="pulse-dot mt-1.5 shrink-0" />
      ) : (
        <span
          aria-hidden
          className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-dim"
        />
      )}
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[12.5px] text-ink">
            {shortId(session.session_id)}
          </span>
          <span className="font-mono text-[10.5px] text-dim">
            {session.agent} · {session.runtime}
          </span>
          {session.project_id && (
            <span className="rounded-full border border-hair px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-dim uppercase">
              {session.project_id}
            </span>
          )}
        </span>
        <span className="mt-1 block font-mono text-[10.5px] leading-relaxed text-faint">
          opened {formatAgo(session.opened_at, now)} · last beat{" "}
          {formatAgo(session.last_activity_at, now)}
          {!fresh && " · gone quiet"}
        </span>
      </span>
    </li>
  );
}

function PresencePanel({
  workspace,
  projects,
  now,
}: {
  workspace: FolderPayload["activity"]["workspace"];
  projects: FolderPayload["activity"]["projects"];
  now: number;
}) {
  const open = workspace?.open_sessions ?? [];

  return (
    <Panel
      title="Open sessions"
      aside={
        workspace && (
          <span className="numeric font-mono text-[11px] text-dim tabular-nums">
            snapshot {formatAgo(workspace.updated_at, now)}
          </span>
        )
      }
    >
      {open.length > 0 ? (
        <ul className="px-5 py-1 sm:px-6">
          {open.map((session) => (
            <SessionLine
              key={session.session_id}
              session={session}
              now={now}
            />
          ))}
        </ul>
      ) : (
        <p className="px-5 py-6 font-mono text-[11px] text-dim sm:px-6">
          0 open
          {workspace &&
            ` · last heartbeat ${formatAgo(workspace.updated_at, now)}`}
        </p>
      )}

      {projects.length > 0 && (
        <div className="border-t border-hair-soft px-5 py-4 sm:px-6">
          <p className="label text-[9.5px]">Per project</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
            {projects.map(({ project_id, snapshot }) => (
              <Field
                key={project_id}
                term={project_id}
                value={`${snapshot.open_sessions.length} open · ${formatAgo(snapshot.updated_at, now)}`}
              />
            ))}
          </dl>
        </div>
      )}
    </Panel>
  );
}

function ConfigPanel({
  payload,
  now,
}: {
  payload: FolderPayload;
  now: number;
}) {
  const env = payload.runtime_env ?? {};

  return (
    <Panel title="Watcher configuration">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 sm:px-6">
        {Object.entries(env).map(([key, value]) => (
          <Field key={key} term={key} value={value} />
        ))}
        {Object.keys(env).length === 0 && (
          <Field term="runtime.env" value="not present" />
        )}
        {payload.state && (
          <Field
            term="Onboarding"
            value={
              payload.state.onboarding_completed
                ? `completed ${payload.state.onboarding_completed_at ? formatAgo(payload.state.onboarding_completed_at, now) : ""}`
                : "not completed"
            }
          />
        )}
        {payload.workspace && (
          <>
            <Field
              term="Projects root"
              value={payload.workspace.projects_root}
            />
            <Field
              term="Projects"
              value={
                payload.workspace.projects.length > 0
                  ? payload.workspace.projects.join(", ")
                  : "none discovered"
              }
            />
          </>
        )}
      </dl>
    </Panel>
  );
}

function CapabilitiesPanel({ xo }: { xo: NonNullable<FolderPayload["xo"]> }) {
  return (
    <Panel
      title="Capabilities · xo.json"
      aside={
        xo.agent && (
          <span className="font-mono text-[11px] text-dim">
            agent {xo.agent}
          </span>
        )
      }
    >
      <div className="px-5 py-5 sm:px-6">
        {xo.default_model && (
          <p className="font-mono text-[10.5px] leading-relaxed text-faint">
            default model{" "}
            <span className="text-dim">{xo.default_model}</span>
            {xo.models.length > 0 &&
              ` · ${xo.models.map((m) => `${m.id} ${m.status}`).join(" · ")}`}
          </p>
        )}
        <ul
          className={cn(
            "flex flex-wrap gap-2",
            xo.default_model ? "mt-4" : undefined,
          )}
        >
          {xo.toggles.map((toggle) => (
            <li
              key={toggle.path}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.06em]",
                toggle.enabled
                  ? "border-ink/25 text-ink/85"
                  : "border-hair text-faint line-through decoration-ink/40",
              )}
            >
              {toggle.path}
              {/* The strike is a visual channel; state still has to be text. */}
              <span className="sr-only">
                {toggle.enabled ? " on" : " off"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Telemetry
 * ------------------------------------------------------------------ */

function DaysPanel({
  days,
}: {
  days: Array<[string, NonNullable<FolderPayload["stats"]>["by_day"][string]]>;
}) {
  const maxOut = Math.max(1, ...days.map(([, d]) => d.tokens?.output ?? 0));

  return (
    <Panel title="Day by day" scrolls>
      <div
        tabIndex={0}
        role="region"
        aria-label="Daily telemetry"
        className="overflow-x-auto"
      >
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="sr-only">
            Per-day telemetry from stats.json: messages, tool calls, tokens in
            and out, cache traffic and response latency.
          </caption>
          <thead>
            <tr className="border-b border-hair bg-white/[0.03]">
              <Th className="w-[26%]">Day</Th>
              <Th align="right">Messages</Th>
              <Th align="right">Tool calls</Th>
              <Th align="right">In</Th>
              <Th align="right">Out</Th>
              <Th align="right">Cache r/w</Th>
              <Th align="right">Latency avg · max</Th>
            </tr>
          </thead>
          <tbody>
            {days.map(([day, stat]) => {
              const latency = stat.latency;
              const avg =
                latency && latency.count > 0
                  ? latency.sum_ms / latency.count
                  : null;
              return (
                <tr key={day} className="border-b border-hair-soft last:border-b-0">
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <span className="font-mono text-[12px] text-ink/90">
                      {day}
                    </span>
                    <ShareBar share={(stat.tokens?.output ?? 0) / maxOut} />
                  </th>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {stat.messages?.total ?? 0}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {stat.messages?.toolCalls ?? 0}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {compactCount(stat.tokens?.input ?? 0)}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink")}>
                    {compactCount(stat.tokens?.output ?? 0)}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-dim")}>
                    {compactCount(stat.tokens?.cache_read ?? 0)} ·{" "}
                    {compactCount(stat.tokens?.cache_write ?? 0)}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-dim")}>
                    {avg === null
                      ? "n/a"
                      : `${(avg / 1000).toFixed(1)}s · ${((stat.latency?.max_ms ?? 0) / 1000).toFixed(1)}s`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ByModelPanel({
  window,
  label,
}: {
  window: StatsWindow;
  label: string;
}) {
  const rows = Object.entries(window.by_model).sort(
    (a, b) => b[1].output - a[1].output,
  );
  const max = Math.max(1, ...rows.map(([, t]) => t.output));

  return (
    <Panel title={`By model · ${label}`}>
      {rows.length === 0 ? (
        <p className="px-5 py-6 font-mono text-[11px] text-dim sm:px-6">
          no tokens in this window
        </p>
      ) : (
        <ol className="px-5 py-2 sm:px-6">
          {rows.map(([model, tokens], i) => (
            <li
              key={model}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-hair-soft py-4 last:border-b-0 sm:gap-x-6"
            >
              <span className="font-mono text-[11px] text-faint">
                {pad(i + 1)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[12.5px] text-ink">
                  {model}
                </span>
                <ShareBar share={tokens.output / max} />
              </span>
              <span className="numeric text-right font-mono text-[11px] text-dim tabular-nums">
                {compactCount(tokens.output)} out
                <span className="mt-1 block text-faint">
                  {compactCount(tokens.input)} in
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function ByToolPanel({
  window,
  label,
}: {
  window: StatsWindow;
  label: string;
}) {
  const rows = Object.entries(window.by_tool).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, count]) => count));

  return (
    <Panel title={`By tool · ${label}`}>
      {rows.length === 0 ? (
        <p className="px-5 py-6 font-mono text-[11px] text-dim sm:px-6">
          no tool calls in this window
        </p>
      ) : (
        <ol className="px-5 py-2 sm:px-6">
          {rows.map(([tool, count], i) => (
            <li
              key={tool}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-hair-soft py-4 last:border-b-0 sm:gap-x-6"
            >
              <span className="font-mono text-[11px] text-faint">
                {pad(i + 1)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[12.5px] text-ink">
                  {tool}
                </span>
                <ShareBar share={count / max} />
              </span>
              <span className="numeric text-right font-mono text-[11px] text-dim tabular-nums">
                {count} {plural(count, "call", "calls")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function SessionsTable({
  rows,
  now,
}: {
  rows: Array<{
    id: string;
    stats: SessionStats | null;
    augment: SessionAugment | null;
  }>;
  now: number;
}) {
  return (
    <section className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="label">Sessions</h2>
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {rows.length} {plural(rows.length, "row", "rows")}
        </span>
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-label="Sessions"
        className="mt-4 overflow-x-auto rounded-2xl border border-hair bg-black/70"
      >
        <table className="w-full min-w-[880px] border-collapse text-left">
          <caption className="sr-only">
            Every session the watcher has recorded, with message counts, tool
            calls, token totals, duration and last activity.
          </caption>
          <thead>
            <tr className="border-b border-hair bg-white/[0.03]">
              <Th className="w-[30%]">Session</Th>
              <Th>Model</Th>
              <Th align="right">Msgs</Th>
              <Th align="right">Tools</Th>
              <Th align="right">In</Th>
              <Th align="right">Out</Th>
              <Th align="right">Duration</Th>
              <Th align="right">Last activity</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const models = Object.keys(row.stats?.by_model ?? {});
              const files = row.stats?.files ?? [];
              return (
                <tr
                  key={row.id}
                  className="border-b border-hair-soft last:border-b-0 hover:bg-white/[0.02]"
                >
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <span className="block font-mono text-[12px] text-ink">
                      {shortId(row.id)}
                    </span>
                    {files.length > 0 && (
                      <span className="mt-1 block max-w-[34ch] truncate font-mono text-[10px] text-faint">
                        {files.join(", ")}
                      </span>
                    )}
                  </th>
                  <td className={cn(CELL, "text-dim")}>
                    {models.length > 0 ? models.join(", ") : "n/a"}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {row.augment?.messageCount ?? "n/a"}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {row.augment?.toolCallCount ?? "n/a"}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {row.stats ? compactCount(row.stats.tokens.input) : "n/a"}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink")}>
                    {row.stats ? compactCount(row.stats.tokens.output) : "n/a"}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-dim")}>
                    {row.stats ? formatDuration(row.stats.duration_ms) : "n/a"}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-dim")}>
                    {row.augment
                      ? agoFromMs(row.augment.lastActivity, now)
                      : "n/a"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Timeline
 * ------------------------------------------------------------------ */

function ByTypePanel({
  by_type,
  selected,
  onToggle,
}: {
  by_type: Record<string, number>;
  selected: ReadonlySet<string>;
  onToggle: (type: string) => void;
}) {
  const rows = Object.entries(by_type).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, count]) => count));

  return (
    <Panel
      title="By type"
      aside={
        <span className="font-mono text-[10px] text-faint">
          click to filter the feed
        </span>
      }
    >
      <ol className="px-5 py-2 sm:px-6">
        {rows.map(([type, count], i) => {
          const pressed = selected.has(type);
          return (
            <li
              key={type}
              className="border-b border-hair-soft last:border-b-0"
            >
              <button
                type="button"
                aria-pressed={pressed}
                onClick={() => onToggle(type)}
                className={cn(
                  "grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-4 py-4 text-left transition-colors sm:gap-x-6",
                  pressed ? "" : "hover:bg-white/[0.02]",
                )}
              >
                <span className="font-mono text-[11px] text-faint">
                  {pad(i + 1)}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate font-mono text-[12.5px]",
                      pressed ? "text-ink" : "text-ink/80",
                    )}
                  >
                    {type}
                    {pressed && (
                      <span aria-hidden className="ml-2 text-dim">
                        ✕
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden
                    className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-white/6"
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full transition-colors",
                        pressed ? "bg-white/60" : "bg-white/30",
                      )}
                      style={{ width: `${((count / max) * 100).toFixed(2)}%` }}
                    />
                  </span>
                </span>
                <span className="numeric text-right font-mono text-[11px] text-dim tabular-nums">
                  {count} {plural(count, "event", "events")}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function TimelinePanel({
  timeline,
  rows,
  matched,
  filtered,
  onClear,
  now,
}: {
  timeline: NonNullable<FolderPayload["timeline"]>;
  rows: TimelineEvent[];
  matched: number;
  filtered: boolean;
  onClear: () => void;
  now: number;
}) {
  return (
    <Panel
      title="Events"
      aside={
        <span className="flex items-center gap-3">
          <span className="numeric font-mono text-[11px] text-dim tabular-nums">
            {filtered
              ? `${matched} of ${timeline.total} match`
              : `${timeline.total} ${plural(timeline.total, "event", "events")}`}
          </span>
          {filtered && (
            <button
              type="button"
              onClick={onClear}
              className="font-mono text-[10px] tracking-[0.1em] text-dim uppercase transition-colors hover:text-ink"
            >
              clear filters
            </button>
          )}
        </span>
      }
    >
      {rows.length === 0 ? (
        <p className="px-5 py-6 font-mono text-[11px] text-dim sm:px-6">
          no events match the filters
        </p>
      ) : (
        <ol className="px-5 py-1 sm:px-6">
          {rows.map((event, i) => (
            <li
              key={`${event.ts}-${i}`}
              className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-hair-soft py-2.5 last:border-b-0 sm:gap-x-6"
            >
              <span className="numeric font-mono text-[11px] text-faint tabular-nums">
                {isoClock(event.ts)}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.08em] uppercase",
                  event.type === "file.edited" ? "text-ink/80" : "text-dim",
                )}
              >
                {event.type}
              </span>
              <span className="min-w-0 truncate font-mono text-[11px] text-dim">
                {event.path ?? shortId(event.session_id)}
                {event.project_id && (
                  <span className="text-faint"> · {event.project_id}</span>
                )}
              </span>
              <span className="numeric text-right font-mono text-[10px] text-faint tabular-nums">
                {formatAgo(event.ts, now)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <Caption>
        newest first · showing {rows.length} of {matched}{" "}
        {filtered ? "matched" : "served"}
      </Caption>
    </Panel>
  );
}
