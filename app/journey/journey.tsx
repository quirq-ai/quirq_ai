"use client";

import { useEffect, useRef, useState } from "react";
import { StoryBeat } from "@/components/story/story-beat";
import type { BeatData } from "@/components/story/types";
import { Rise, TextScrim } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { overrideLeaves } from "@/components/stage/choreography";
import {
  DEFAULT_DEFINITION,
  isValidPathIn,
  resolveDefinition,
  validateDefinition,
  type JourneyDefinition,
  type JourneyRecording,
  type JourneyRecordingEvent,
  type ResolvedJourney,
} from "./defs";

/**
 * The branching walk, now with a library: journey definitions (the entire
 * node tree plus the rules) live as JSON files in the local .quirq folder.
 * The page lists the folder, loads any definition live, and in development
 * can store the active journey back into the folder as an editable file.
 */

type Trace = { key: string; journey: string; path: string[]; at: number };

const TRACES_KEY = "quirq-journey-traces-v2";
const RECORDINGS_KEY = "quirq-journey-recordings-v1";

const DEFAULT_JOURNEY = resolveDefinition(DEFAULT_DEFINITION);

const traceName = (journey: ResolvedJourney, ids: string[]) =>
  ids.map((id) => journey.nodes[id]?.short ?? id).join(" · ");

/** The active journey as a storable definition. The default round-trips
 *  byte-faithfully; loaded journeys collapse poses to centre + full tweaks. */
const toDefinition = (journey: ResolvedJourney): JourneyDefinition =>
  journey.slug === DEFAULT_JOURNEY.slug
    ? DEFAULT_DEFINITION
    : {
        slug: journey.slug,
        name: journey.name,
        rules: journey.rules,
        nodes: Object.fromEntries(
          Object.entries(journey.nodes).map(([id, node]) => [
            id,
            {
              short: node.short,
              beat: node.beat,
              ...(node.prompt ? { prompt: node.prompt } : {}),
              ...(node.choices ? { choices: node.choices } : {}),
              pose: { base: "centre" as const, tweaks: node.keyframe },
            },
          ]),
        ),
      };

/** One recorded transition, in words, for the recap. */
const describeEvent = (journey: ResolvedJourney, ev: JourneyRecordingEvent) => {
  const short = journey.nodes[ev.node]?.short ?? ev.node;
  if (ev.kind === "start") return `opened at ${short}`;
  if (ev.kind === "choose") return `${ev.label ?? "chose"} · ${short}`;
  if (ev.kind === "rewind") return `rewound to ${short}`;
  if (ev.kind === "replay") return `jumped to a saved trace · ${short}`;
  return `walked again from ${short}`;
};

const SHELF = [
  {
    label: "What it is",
    body: "A page that writes itself: every answer appends the next beat, so no two visitors read the same page.",
  },
  {
    label: "How it walks",
    body: "Your chosen path feeds the live choreography track, so the glass literally walks your branch of the tree.",
  },
  {
    label: "How to explore",
    body: "The trail at each stop rewinds to any earlier choice. Take the other branch, or start over at the end.",
  },
];

/** The journey's manual as an interlude; carries no beat registration. */
function JourneyShelf() {
  return (
    <section
      aria-label="How the journey works"
      className="relative overflow-hidden py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <div className="relative mx-auto max-w-3xl">
          <TextScrim />
          <Rise>
            <p className="label over-stage mb-6 text-center">How the journey works</p>
          </Rise>
          <Rise delay={0.08}>
            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-muted backdrop-blur-xl sm:grid-cols-3">
              {SHELF.map((tile) => (
                <div key={tile.label} className="bg-card px-5 py-5">
                  <p className="label text-[9.5px]">{tile.label}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {tile.body}
                  </p>
                </div>
              ))}
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}

export function Journey() {
  const [journey, setJourney] = useState<ResolvedJourney>(DEFAULT_JOURNEY);
  const [library, setLibrary] = useState<{ slug: string; name: string }[]>([]);
  const [loadNote, setLoadNote] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([DEFAULT_JOURNEY.rules.start]);
  const [saved, setSaved] = useState<Trace[]>([]);
  const [replaying, setReplaying] = useState(false);
  const [retracing, setRetracing] = useState(false);
  const [recording, setRecording] = useState<JourneyRecording | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stored, setStored] = useState(false);

  const tip = journey.nodes[path[path.length - 1]];
  const atDepthLimit = path.length >= journey.rules.maxDepth;

  // The retrace performance and the URL restore both need to know what the
  // visitor is doing right now, without re-running their effects.
  const interactedRef = useRef(false);
  const journeySlugRef = useRef(journey.slug);
  useEffect(() => {
    journeySlugRef.current = journey.slug;
  }, [journey]);
  const postAbortRef = useRef<AbortController | null>(null);

  // The chosen path IS the track: one leaf per visited node, in order.
  useEffect(() => {
    overrideLeaves(
      path.map((id) => ({
        id: `journey-${id}`,
        keyframe: journey.nodes[id].keyframe,
      })),
    );
  }, [path, journey]);
  useEffect(() => () => overrideLeaves(null), []);

  /** A fresh recording: every walk opens with its own first transition. */
  const startRecording = (j: ResolvedJourney, p: string[]) => {
    const at = Date.now();
    setRecording({
      journey: j.slug,
      startedAt: at,
      events: [{ at, kind: "start", node: p[p.length - 1], path: [...p] }],
    });
  };

  /** Append one transition; the snapshot is the whole path after it. If no
   *  recording is open yet (a transition raced the restore), open one with
   *  its start event so no recording ever begins mid-walk. */
  const record = (
    kind: JourneyRecordingEvent["kind"],
    nextPath: string[],
    label?: string,
  ) =>
    setRecording((prev) => {
      const at = Date.now();
      const base = prev ?? {
        journey: journey.slug,
        startedAt: at,
        events: [
          {
            at,
            kind: "start" as const,
            node: path[path.length - 1],
            path: [...path],
          },
        ],
      };
      return {
        ...base,
        events: [
          ...base.events,
          {
            at,
            kind,
            ...(label ? { label } : {}),
            node: nextPath[nextPath.length - 1],
            path: [...nextPath],
          },
        ],
      };
    });

  /** Fetch and validate a definition from the .quirq folder; no state. */
  const fetchJourney = async (slug: string): Promise<ResolvedJourney> => {
    const res = await fetch(`/api/journeys/${slug}`);
    if (!res.ok) throw new Error(await res.text());
    const def = (await res.json()) as JourneyDefinition;
    const problem = validateDefinition(def);
    if (problem) throw new Error(problem);
    return resolveDefinition(def);
  };

  /** Make a journey the active tree and open a fresh walk on it. Cancels
   *  any retrace first, so its timers never replay another tree's ids. */
  const applyJourney = (resolved: ResolvedJourney, opening?: string[]) => {
    const p = opening ?? [resolved.rules.start];
    setRetracing(false);
    setJourney(resolved);
    setPath(p);
    setLoadNote(null);
    startRecording(resolved, p);
  };

  /** Load a definition from the .quirq folder and make it the active tree. */
  const loadJourney = async (slug: string) => {
    if (slug === DEFAULT_JOURNEY.slug) {
      applyJourney(DEFAULT_JOURNEY);
      return DEFAULT_JOURNEY;
    }
    try {
      const resolved = await fetchJourney(slug);
      applyJourney(resolved);
      return resolved;
    } catch (err) {
      setLoadNote(
        `Could not load ${slug}: ${err instanceof Error ? err.message : "unknown"}`,
      );
      return null;
    }
  };

  const refreshLibrary = async () => {
    try {
      const res = await fetch("/api/journeys");
      const data = (await res.json()) as {
        journeys: { slug: string; name: string }[];
      };
      setLibrary(data.journeys.filter((j) => j.slug !== DEFAULT_JOURNEY.slug));
    } catch {
      setLibrary([]);
    }
  };

  // Restore: saved traces, the .quirq library, and a shared journey from the
  // URL (?j=slug&t=path). All post-hydration; the server renders the default.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRACES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Trace[];
        // Saved traces belong to localStorage and can only be restored after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setSaved(parsed);
      }
    } catch {
      /* corrupt store: start empty */
    }
    const search = new URLSearchParams(window.location.search);
    const j = search.get("j");
    const t = search.get("t");
    const restore = async () => {
      let active = DEFAULT_JOURNEY;
      if (j && j !== DEFAULT_JOURNEY.slug) {
        try {
          active = await fetchJourney(j);
        } catch (err) {
          setLoadNote(
            `Could not load ${j}: ${err instanceof Error ? err.message : "unknown"}`,
          );
        }
      }
      // A slow restore never steals a walk already underway.
      if (interactedRef.current) return;
      let ids = [active.rules.start];
      if (t) {
        const shared = t.split(".");
        if (isValidPathIn(active, shared) && shared.length > 1) ids = shared;
      }
      applyJourney(active, ids);
    };
    restore();
    refreshLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The recorder: every transition lands in localStorage at once and, in
  // development, is written into the journey's own .quirq file moments
  // later, so the JSON document grows as the walk progresses.
  useEffect(() => {
    if (!recording || recording.events.length === 0) return;
    try {
      const raw = localStorage.getItem(RECORDINGS_KEY);
      const all = raw ? (JSON.parse(raw) as Record<string, JourneyRecording>) : {};
      all[recording.journey] = recording;
      localStorage.setItem(RECORDINGS_KEY, JSON.stringify(all));
    } catch {
      /* storage blocked: the session copy still works */
    }
    if (process.env.NODE_ENV !== "development") return;
    const timer = window.setTimeout(() => {
      // Only the newest snapshot may be in flight: a slow older POST landing
      // last would leave the file missing the walk's tail.
      postAbortRef.current?.abort();
      const ctrl = new AbortController();
      postAbortRef.current = ctrl;
      fetch(`/api/journeys/${recording.journey}/recording`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ definition: toDefinition(journey), recording }),
        signal: ctrl.signal,
      }).catch(() => {
        /* best-effort file write; localStorage already has the walk */
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [recording, journey]);

  const persist = (traces: Trace[]) => {
    setSaved(traces);
    try {
      localStorage.setItem(TRACES_KEY, JSON.stringify(traces));
    } catch {
      /* storage blocked: the session copy still works */
    }
  };

  const traceKey = `${journey.slug}:${path.join(".")}`;

  const saveTrace = () => {
    if (saved.some((t) => t.key === traceKey)) return;
    persist([
      ...saved,
      { key: traceKey, journey: journey.slug, path: [...path], at: Date.now() },
    ]);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/journey?j=${journey.slug}&t=${path.join(".")}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1600);
    } catch {
      /* clipboard blocked: the URL is also the address bar after restore */
    }
  };

  /** Store the active journey (tree + rules) into the .quirq folder. */
  const storeToFolder = async () => {
    try {
      const res = await fetch("/api/journeys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toDefinition(journey)),
      });
      if (!res.ok) throw new Error(await res.text());
      setStored(true);
      setTimeout(() => setStored(false), 1600);
      refreshLibrary();
    } catch (err) {
      setLoadNote(err instanceof Error ? err.message : "Could not store the journey.");
    }
  };

  const replay = (target: string[]) => {
    if (!journey.rules.allowReplay) return;
    interactedRef.current = true;
    setRetracing(false);
    setPath(target);
    record("replay", target);
    setReplaying(true);
  };

  // The replay: glide through the walked beats one by one via the runtime's
  // drive event, so the damped glass performs the journey like a camera move.
  // Any wheel or touch hands control straight back.
  useEffect(() => {
    if (!replaying) return;
    let cancelled = false;
    let timer = 0;
    let step = 0;
    const drive = () => {
      if (cancelled) return;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-beat]"));
      if (step >= sections.length) {
        setReplaying(false);
        return;
      }
      const el = sections[step];
      const box = el.getBoundingClientRect();
      const y = box.top + window.scrollY + box.height / 2 - window.innerHeight / 2;
      window.dispatchEvent(
        new CustomEvent("stage:scrollto", { detail: { y: Math.max(0, y) } }),
      );
      step += 1;
      timer = window.setTimeout(drive, 2800);
    };
    const cancel = () => {
      cancelled = true;
      setReplaying(false);
    };
    // Give the restored sections a moment to mount and measure.
    timer = window.setTimeout(drive, 700);
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, [replaying]);

  // The recorded replay: re-perform the walk transition by transition. Each
  // step swaps the path back to that snapshot (beats mount and unmount, the
  // glass re-walks the branch live) and glides to the beat it landed on.
  // Any wheel or touch restores the finished walk and hands control back.
  useEffect(() => {
    if (!retracing || !recording || recording.events.length === 0) return;
    const events = recording.events;
    const finalPath = events[events.length - 1].path;
    let cancelled = false;
    let timer = 0;
    let step = 0;
    const drive = () => {
      if (cancelled) return;
      // A journey switch orphans these snapshots; never apply them to
      // another tree's node ids.
      if (journeySlugRef.current !== recording.journey) {
        setRetracing(false);
        return;
      }
      if (step >= events.length) {
        setRetracing(false);
        return;
      }
      const ev = events[step];
      setPath([...ev.path]);
      // Let the swapped beats mount and the runtime re-measure first.
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>("[data-beat]"),
        );
        const el = sections[Math.min(ev.path.length - 1, sections.length - 1)];
        if (el) {
          const box = el.getBoundingClientRect();
          const y = box.top + window.scrollY + box.height / 2 - window.innerHeight / 2;
          window.dispatchEvent(
            new CustomEvent("stage:scrollto", {
              detail: { y: Math.max(0, y) },
            }),
          );
        }
        step += 1;
        timer = window.setTimeout(drive, 2600);
      }, 450);
    };
    const cancel = () => {
      cancelled = true;
      if (journeySlugRef.current === recording.journey) {
        setPath([...finalPath]);
      }
      setRetracing(false);
    };
    timer = window.setTimeout(drive, 500);
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
    // The recording cannot change mid-retrace; nothing records during it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retracing]);

  // Every hand-made transition takes over from any running performance:
  // the retrace is cancelled first, so it can neither clobber the new path
  // nor let a mid-performance click record against a vanished snapshot.
  const choose = (to: string, label: string) => {
    interactedRef.current = true;
    setRetracing(false);
    const next = [...path, to];
    setPath(next);
    record("choose", next, label);
  };
  const rewind = (i: number) => {
    if (!journey.rules.allowRewind) return;
    interactedRef.current = true;
    setRetracing(false);
    const next = path.slice(0, i + 1);
    setPath(next);
    record("rewind", next);
  };
  /** The circular ending: every walk loops back to its opening beat. */
  const walkAgain = () => {
    interactedRef.current = true;
    setRetracing(false);
    const next = [journey.rules.start];
    setPath(next);
    record("loop", next);
  };

  const journeyTraces = saved.filter((t) => t.journey === journey.slug);

  /** A node's beat, staged. The walk is a closed loop: only journey pages
   *  open in this tab; every other destination opens in a new one. */
  const journeyBeat = (id: string, index: number): BeatData => {
    const beat = journey.nodes[id].beat;
    return {
      ...beat,
      index,
      id: `journey-${id}`,
      links: beat.links?.map((link) => ({
        ...link,
        newTab: !link.href.startsWith("/journey"),
      })),
    };
  };

  return (
    <>
      <StoryBeat data={journeyBeat(path[0], 0)} />

      {/* The manual, straight under the opening beat. Deliberately not a
          beat: the glass glides from the root pose toward your first choice
          while it explains itself, ecosystem-shelf style. */}
      <JourneyShelf />

      {path.slice(1).map((id, i) => (
        <StoryBeat key={id} data={journeyBeat(id, i + 1)} />
      ))}

      {/* The choice point: an interlude, deliberately not a beat, so the
          glass keeps gliding from the last chosen pose while you decide. */}
      <section className="relative flex min-h-[70svh] items-center overflow-hidden pb-24">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
          <div className="over-stage relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <TextScrim />

            {/* The library: what the local .quirq folder offers. */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground uppercase">
                Journey
              </span>
              <TraceChip
                active={journey.slug === DEFAULT_JOURNEY.slug}
                onClick={() => loadJourney(DEFAULT_JOURNEY.slug)}
              >
                {DEFAULT_JOURNEY.name}
              </TraceChip>
              {library.map((entry) => (
                <TraceChip
                  key={entry.slug}
                  active={journey.slug === entry.slug}
                  onClick={() => loadJourney(entry.slug)}
                >
                  {entry.name}
                </TraceChip>
              ))}
              <TraceChip onClick={refreshLibrary}>Reload .quirq</TraceChip>
              {process.env.NODE_ENV === "development" && (
                <TraceChip onClick={storeToFolder}>
                  {stored ? "Stored" : "Store to .quirq"}
                </TraceChip>
              )}
            </div>
            {loadNote && (
              <p className="mt-2 font-mono text-[9.5px] tracking-[0.1em] text-spec-orange">
                {loadNote}
              </p>
            )}

            {/* The trail: the dimension already travelled. Any earlier stop
                rewinds to it, so the other branches stay explorable. */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground uppercase">
                Your path
              </span>
              {path.map((id, i) => (
                <Button
                  key={id}
                  type="button"
                  variant={i === path.length - 1 ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => rewind(i)}
                  disabled={i === path.length - 1 || !journey.rules.allowRewind}
                >
                  {journey.nodes[id].short}
                </Button>
              ))}
            </div>

            {/* The trace: capture the walk, share it, watch it performed. */}
            {path.length > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground uppercase">
                  Trace
                </span>
                <TraceChip
                  onClick={saveTrace}
                  disabled={saved.some((t) => t.key === traceKey)}
                >
                  {saved.some((t) => t.key === traceKey) ? "Saved" : "Save"}
                </TraceChip>
                <TraceChip onClick={copyLink}>
                  {linkCopied ? "Link copied" : "Copy link"}
                </TraceChip>
                {journey.rules.allowReplay && (
                  <TraceChip
                    onClick={() => replay(path)}
                    disabled={replaying || retracing}
                  >
                    Replay
                  </TraceChip>
                )}
              </div>
            )}

            {journeyTraces.length > 0 && (
              <div className="mt-6 w-full max-w-md">
                <p className="font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground uppercase">
                  Saved journeys
                </p>
                <div className="mt-2 overflow-hidden rounded-xl border border-border/60 bg-card text-left backdrop-blur-md">
                  {journeyTraces.map((trace, i) => (
                    <div
                      key={trace.key}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2",
                        i > 0 && "border-t border-border/60",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-foreground/85">
                        {traceName(journey, trace.path)}
                      </span>
                      {journey.rules.allowReplay && (
                        <TraceChip
                          onClick={() => replay(trace.path)}
                          disabled={replaying || retracing}
                        >
                          Replay
                        </TraceChip>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete saved journey ${traceName(journey, trace.path)}`}
                        onClick={() => persist(saved.filter((t) => t.key !== trace.key))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tip.prompt && tip.choices && !atDepthLimit ? (
              <>
                <p className="display-sm mt-9 max-w-[18ch]">{tip.prompt}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {tip.choices.map((choice) => (
                    <Button
                      key={choice.to}
                      type="button"
                      variant="outline"
                      onClick={() => choose(choice.to, choice.label)}
                      className="group max-w-full whitespace-normal text-left"
                    >
                      {choice.label}
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      >
                        <path
                          d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                  ))}
                </div>
                <p className="mt-7 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground">
                  {path.length} {path.length === 1 ? "beat" : "beats"} walked · the glass
                  is on your branch of the tree
                </p>
              </>
            ) : (
              <>
                <p className="display-sm mt-9 max-w-[18ch]">
                  {atDepthLimit && tip.choices
                    ? "The rules end this branch here."
                    : "End of this branch."}
                </p>

                {/* The recap: the whole walk as recorded, transition by
                    transition, rewinds and loops included. */}
                {recording && recording.events.length > 0 && (
                  <div className="mt-8 w-full max-w-md">
                    <p className="font-mono text-[9.5px] tracking-[0.22em] text-muted-foreground uppercase">
                      Your walk, recorded
                    </p>
                    <div className="mt-2 overflow-hidden rounded-xl border border-border/60 bg-card text-left backdrop-blur-md">
                      {recording.events.map((ev, i) => (
                        <div
                          key={`${ev.at}-${i}`}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2",
                            i > 0 && "border-t border-border/60",
                          )}
                        >
                          <span className="w-4 shrink-0 text-center font-mono text-[10px] text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-foreground/85">
                            {describeEvent(journey, ev)}
                          </span>
                          <span className="shrink-0 font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase">
                            {ev.kind}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {journey.rules.allowReplay &&
                    recording &&
                    recording.events.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => setRetracing(true)}
                        disabled={replaying || retracing}
                      >
                        Replay every transition
                      </Button>
                    )}
                  <Button
                    type="button"
                    onClick={walkAgain}
                    variant={
                      journey.rules.allowReplay &&
                      recording &&
                      recording.events.length > 1
                        ? "outline"
                        : "default"
                    }
                  >
                    Walk again
                  </Button>
                  {path.length > 1 && journey.rules.allowRewind && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rewind(path.length - 2)}
                    >
                      One step back
                    </Button>
                  )}
                </div>
                <p className="mt-7 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-muted-foreground">
                  the walk is circular · every ending leads back into the journey
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Replay is a performance, not a lockout: any scroll takes over. */}
      {(replaying || retracing) && (
        <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 backdrop-blur-xl">
          <span className="pulse-dot" />
          <span className="font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase">
            {retracing
              ? "Replaying every transition · scroll to take over"
              : "Replaying your journey · scroll to take over"}
          </span>
        </div>
      )}
    </>
  );
}

function TraceChip({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      {children}
    </Button>
  );
}
