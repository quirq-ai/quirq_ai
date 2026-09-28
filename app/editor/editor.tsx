"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StoryBeat } from "@/components/story/story-beat";
import type { BeatData } from "@/components/story/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  KEYFRAMES,
  getResolvedLeaves,
  overrideLeaves,
  type Keyframe,
} from "@/components/stage/choreography";
import { CHOREOGRAPHY, type ChoreoNode } from "@/components/stage/choreo-tree";
import { beatEntries, onBeatsChange } from "@/lib/beat-registry";
import { captureGolden, type Golden } from "@/lib/golden";
import { validateDefinition, type JourneyDefinition } from "@/app/journey/defs";

/**
 * The page editor: compose story beats, drag the pose and optics of the live
 * glass, and copy the result out as data.
 *
 * The stage is the real one. The editor pushes its beats' keyframes through
 * overrideLeaves(), so getTrack() serves them per frame and the damped glass
 * glides to every slider move. Section ids match override leaf ids, which
 * keeps the runtime's id binding exact even while beats are added, removed,
 * or reordered.
 */

type EditorBeat = {
  id: string;
  layout: "center" | "left" | "right";
  marker: string;
  title: [string, string];
  glass: 0 | 1 | null;
  lede: string;
  keyframe: Keyframe;
};

const STORAGE_KEY = "quirq-editor-draft-v1";
const MAX_BEATS = 7;
const MIN_BEATS = 2;

/** The five authored poses, as the preset vocabulary. */
const POSES: { name: string; keyframe: Keyframe }[] = [
  { name: "Centre", keyframe: { ...KEYFRAMES[0] } },
  { name: "Drained", keyframe: { ...KEYFRAMES[1] } },
  { name: "Flooded", keyframe: { ...KEYFRAMES[2] } },
  { name: "Recede", keyframe: { ...KEYFRAMES[3] } },
  { name: "Finale", keyframe: { ...KEYFRAMES[4] } },
];

/** Slider ranges per channel, grouped the way the scenes guide teaches them. */
const CHANNEL_GROUPS: {
  group: string;
  channels: { key: keyof Keyframe; min: number; max: number; step: number }[];
}[] = [
  {
    group: "Camera, by relativity",
    channels: [
      { key: "x", min: -4, max: 4, step: 0.05 },
      { key: "y", min: -2, max: 2, step: 0.05 },
      { key: "z", min: -4, max: 3, step: 0.05 },
      { key: "scale", min: 0.5, max: 1.8, step: 0.01 },
    ],
  },
  {
    group: "Attitude",
    channels: [
      { key: "spin", min: 0, max: 0.3, step: 0.005 },
      { key: "tiltX", min: -0.5, max: 1.5, step: 0.01 },
      { key: "tiltZ", min: -0.8, max: 0.8, step: 0.01 },
    ],
  },
  {
    group: "Optics",
    channels: [
      { key: "chroma", min: 0, max: 1.4, step: 0.005 },
      { key: "thickness", min: 0.3, max: 3, step: 0.05 },
      { key: "distortion", min: 0, max: 1, step: 0.01 },
      { key: "aniso", min: 0, max: 0.8, step: 0.01 },
      { key: "rough", min: 0, max: 0.4, step: 0.005 },
      { key: "ior", min: 1.1, max: 1.9, step: 0.01 },
    ],
  },
  {
    group: "Light",
    channels: [{ key: "burst", min: 0.1, max: 1, step: 0.01 }],
  },
];

function defaultBeats(): EditorBeat[] {
  return [
    {
      id: "draft-hero",
      layout: "center",
      marker: "",
      title: ["Your headline,", "made of light."],
      glass: 1,
      lede: "Write the opening here. The glass stands centre stage behind it, breathing.",
      keyframe: { ...KEYFRAMES[0] },
    },
    {
      id: "draft-middle",
      layout: "left",
      marker: "01 · your first point",
      title: ["Say the hard", "thing plainly."],
      glass: null,
      lede: "The drained pose reads as cost and consequence. Swap it for any preset on the right.",
      keyframe: { ...KEYFRAMES[1] },
    },
    {
      id: "draft-close",
      layout: "center",
      marker: "",
      title: ["End on the", "bright side."],
      glass: 1,
      lede: "The finale pose returns the form to centre, biggest and fully lit.",
      keyframe: { ...KEYFRAMES[4] },
    },
  ];
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

const roundKeyframe = (k: Keyframe): Record<string, number> =>
  Object.fromEntries(Object.entries(k).map(([key, v]) => [key, round3(v)]));

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** kebab-case a slug the journeys API will accept. */
function cleanSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

/** The draft as a journey definition: a linear walk, one node per beat,
 *  each pose collapsed to centre + full tweaks. Paste it into
 *  .quirq/journeys/<slug>.json and /journey renders it as a page. */
function toJourney(beats: EditorBeat[], slugRaw: string): JourneyDefinition {
  const slug = cleanSlug(slugRaw) || "my-journey";
  const ids = beats.map((_, i) => `b${i + 1}`);
  const short = (b: EditorBeat, i: number) => {
    const fromMarker = b.marker.replace(/^\s*\d+\s*·\s*/, "").trim();
    return fromMarker || b.title[0].trim().toLowerCase() || `beat ${i + 1}`;
  };
  return {
    slug,
    name: (slug.charAt(0).toUpperCase() + slug.slice(1)).replace(/-/g, " "),
    rules: {
      start: ids[0],
      maxDepth: beats.length,
      allowRewind: true,
      allowReplay: true,
    },
    nodes: Object.fromEntries(
      beats.map((b, i) => [
        ids[i],
        {
          short: short(b, i),
          pose: {
            base: "centre" as const,
            tweaks: Object.fromEntries(
              Object.entries(b.keyframe).map(([k, v]) => [k, round3(v)]),
            ) as Partial<Keyframe>,
          },
          beat: {
            layout: b.layout,
            ...(b.marker ? { marker: b.marker } : {}),
            title: b.title,
            ...(b.glass !== null ? { glass: b.glass } : {}),
            ...(b.lede ? { lede: b.lede } : {}),
          },
          ...(i < beats.length - 1
            ? {
                prompt: "Keep walking?",
                choices: [
                  {
                    label: beats[i + 1].title.join(" ").trim() || `Beat ${i + 2}`,
                    to: ids[i + 1],
                  },
                ],
              }
            : {}),
        },
      ]),
    ),
  };
}

type Tab = "beats" | "tree" | "registry" | "golden";
const TABS: Tab[] = ["beats", "tree", "registry", "golden"];

export function Editor() {
  const [beats, setBeats] = useState<EditorBeat[]>(defaultBeats);
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [tab, setTab] = useState<Tab>("beats");
  const [slug, setSlug] = useState("my-journey");
  const [storeNote, setStoreNote] = useState<string | null>(null);
  const [storedSlug, setStoredSlug] = useState<string | null>(null);
  const counter = useRef(0);

  // Draft restore happens in an effect, never in the initial state: the
  // server rendered the default draft, and hydration must match it.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EditorBeat[];
        if (Array.isArray(parsed) && parsed.length >= MIN_BEATS) {
          // Restore browser-owned draft storage after the server's default render hydrates.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setBeats(parsed);
        }
      }
    } catch {
      /* a corrupt draft falls back to the default */
    }
  }, []);

  // Push the beats' keyframes into the live track; restore the tree's own
  // resolve when the editor unmounts.
  useEffect(() => {
    overrideLeaves(beats.map((b) => ({ id: b.id, keyframe: b.keyframe })));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(beats));
    } catch {
      /* storage full or blocked: the live preview still works */
    }
  }, [beats]);
  useEffect(() => () => overrideLeaves(null), []);

  const sel = beats[Math.min(selected, beats.length - 1)];

  const patch = (changes: Partial<EditorBeat>) =>
    setBeats((prev) => prev.map((b, i) => (i === selected ? { ...b, ...changes } : b)));

  const patchKeyframe = (key: keyof Keyframe, value: number) =>
    setBeats((prev) =>
      prev.map((b, i) =>
        i === selected ? { ...b, keyframe: { ...b.keyframe, [key]: value } } : b,
      ),
    );

  const move = (dir: -1 | 1) =>
    setBeats((prev) => {
      const j = selected + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[selected], next[j]] = [next[j], next[selected]];
      setSelected(j);
      return next;
    });

  const addBeat = () =>
    setBeats((prev) => {
      if (prev.length >= MAX_BEATS) return prev;
      counter.current += 1;
      const id = `draft-${counter.current}-${prev.length}`;
      setSelected(prev.length);
      return [
        ...prev,
        {
          id,
          layout: "left" as const,
          marker: `0${prev.length} · new beat`,
          title: ["A new", "movement."] as [string, string],
          glass: null,
          lede: "",
          keyframe: { ...KEYFRAMES[Math.min(prev.length, 4)] },
        },
      ];
    });

  const removeBeat = () =>
    setBeats((prev) => {
      if (prev.length <= MIN_BEATS) return prev;
      const next = prev.filter((_, i) => i !== selected);
      setSelected((s) => Math.max(0, Math.min(s, next.length - 1)));
      return next;
    });

  // The export IS a journey file: paste it into .quirq/journeys/<slug>.json
  // (or Create page writes it there in development) and /journey serves it.
  const exportJson = useMemo(
    () => JSON.stringify(toJourney(beats, slug), null, 2),
    [beats, slug],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setShowJson(true);
    }
  };

  /** Development only: write the journey into .quirq and the page exists. */
  const createPage = async () => {
    const def = toJourney(beats, slug);
    const problem = validateDefinition(def);
    if (problem) {
      setStoredSlug(null);
      setStoreNote(`Not a valid journey: ${problem}`);
      return;
    }
    try {
      const res = await fetch("/api/journeys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(def),
      });
      if (!res.ok) throw new Error(await res.text());
      setStoredSlug(def.slug);
      setStoreNote(null);
    } catch (err) {
      setStoredSlug(null);
      setStoreNote(err instanceof Error ? err.message : "Could not create the page.");
    }
  };

  const story: BeatData[] = beats.map((b, i) => ({
    index: i,
    id: b.id,
    layout: b.layout,
    ...(b.marker ? { marker: b.marker } : {}),
    title: b.title,
    ...(b.glass !== null ? { glass: b.glass } : {}),
    ...(b.lede ? { lede: b.lede } : {}),
  }));

  return (
    <>
      {/* The page under edit, rendered by the same StoryBeat as /dynamic. */}
      {story.map((beat) => (
        <StoryBeat key={beat.id} data={beat} />
      ))}

      {/* The inspector. A fixed glass panel; everything inside is plain
          controlled inputs writing plain state. data-lenis-prevent is
          load-bearing: without it Lenis swallows the wheel over the panel
          and scrolls the page instead, stranding the lower controls. */}
      <aside
        aria-label="Page editor"
        data-lenis-prevent
        className="fixed top-20 right-4 bottom-5 z-40 hidden w-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card backdrop-blur-xl lg:flex"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            <span className="pulse-dot" />
            Page editor · live
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setBeats(defaultBeats());
              setSelected(0);
            }}
          >
            Reset
          </Button>
        </div>

        {/* Tabs: the draft, and the live machinery underneath it. */}
        <div
          className="flex flex-wrap gap-1.5 border-b border-border/60 px-4 py-2.5"
          role="group"
          aria-label="Editor views"
        >
          {TABS.map((t) => (
            <EditorChip key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </EditorChip>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {tab === "tree" && <TreeTab beats={beats} />}
          {tab === "registry" && <RegistryTab />}
          {tab === "golden" && <GoldenTab />}
          {tab === "beats" && (
            <>
              {/* Beat list */}
              <p className="label text-[9px]">Beats</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-border/60">
                {beats.map((b, i) => (
                  <Button
                    key={b.id}
                    type="button"
                    variant="ghost"
                    aria-pressed={i === selected}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex w-full items-center justify-start gap-3 rounded-none px-3 py-2 text-left focus-visible:ring-inset focus-visible:ring-offset-0",
                      i > 0 && "border-t border-border/60",
                      i === selected ? "bg-accent" : "hover:bg-muted",
                    )}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {i}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground/85">
                      {b.title[0]} {b.title[1]}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <EditorChip onClick={addBeat} disabled={beats.length >= MAX_BEATS}>
                  + Add
                </EditorChip>
                <EditorChip onClick={removeBeat} disabled={beats.length <= MIN_BEATS}>
                  Remove
                </EditorChip>
                <EditorChip onClick={() => move(-1)} disabled={selected === 0}>
                  Up
                </EditorChip>
                <EditorChip
                  onClick={() => move(1)}
                  disabled={selected === beats.length - 1}
                >
                  Down
                </EditorChip>
              </div>

              {/* Copy */}
              <p className="label mt-6 text-[9px]">Copy</p>
              <div className="mt-2 space-y-2">
                <EditorInput
                  label="Section marker"
                  placeholder="marker, e.g. 01 · the point"
                  value={sel.marker}
                  onChange={(v) => patch({ marker: v })}
                />
                <EditorInput
                  label="Title line one"
                  placeholder="title line one"
                  value={sel.title[0]}
                  onChange={(v) => patch({ title: [v, sel.title[1]] })}
                />
                <EditorInput
                  label="Title line two"
                  placeholder="title line two"
                  value={sel.title[1]}
                  onChange={(v) => patch({ title: [sel.title[0], v] })}
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-foreground">Description</span>
                  <textarea
                    placeholder="lede"
                    value={sel.lede}
                    onChange={(e) => patch({ lede: e.target.value })}
                    rows={2}
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-sm"
                  />
                </label>
                <div className="flex gap-2">
                  {(["center", "left", "right"] as const).map((l) => (
                    <EditorChip
                      key={l}
                      active={sel.layout === l}
                      onClick={() => patch({ layout: l })}
                    >
                      {l}
                    </EditorChip>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9.5px] text-muted-foreground uppercase">
                    glass line
                  </span>
                  {([null, 0, 1] as const).map((g) => (
                    <EditorChip
                      key={String(g)}
                      active={sel.glass === g}
                      onClick={() => patch({ glass: g })}
                    >
                      {g === null ? "none" : g === 0 ? "first" : "second"}
                    </EditorChip>
                  ))}
                </div>
              </div>

              {/* Pose presets */}
              <p className="label mt-6 text-[9px]">Pose presets</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {POSES.map((pose) => (
                  <EditorChip
                    key={pose.name}
                    onClick={() => patch({ keyframe: { ...pose.keyframe } })}
                  >
                    {pose.name}
                  </EditorChip>
                ))}
              </div>

              {/* Channels */}
              {CHANNEL_GROUPS.map((group) => (
                <div key={group.group}>
                  <p className="label mt-6 text-[9px]">{group.group}</p>
                  <div className="mt-2 space-y-2.5">
                    {group.channels.map((ch) => (
                      <label key={ch.key} className="block">
                        <span className="flex justify-between font-mono text-[10px] text-muted-foreground">
                          <span>{ch.key}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {sel.keyframe[ch.key].toFixed(3)}
                          </span>
                        </span>
                        <input
                          type="range"
                          min={ch.min}
                          max={ch.max}
                          step={ch.step}
                          value={sel.keyframe[ch.key]}
                          onChange={(e) => patchKeyframe(ch.key, Number(e.target.value))}
                          className="mt-1 min-h-11 w-full cursor-pointer rounded-md accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Export: the draft as a journey file */}
              <label
                htmlFor="editor-journey-slug"
                className="label mt-6 block text-[9px]"
              >
                Export · journey filename
              </label>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="shrink-0 font-mono text-[9.5px] text-muted-foreground">
                  .quirq/journeys/
                </span>
                <Input
                  id="editor-journey-slug"
                  type="text"
                  value={slug}
                  placeholder="my-journey"
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setStoredSlug(null);
                  }}
                  className="min-w-0 flex-1 font-mono"
                />
                <span className="shrink-0 font-mono text-[9.5px] text-muted-foreground">
                  .json
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <EditorChip onClick={copy}>
                  {copied ? "Copied" : "Copy journey JSON"}
                </EditorChip>
                <EditorChip onClick={() => setShowJson((v) => !v)} active={showJson}>
                  {showJson ? "Hide" : "Show"}
                </EditorChip>
                {process.env.NODE_ENV === "development" && (
                  <EditorChip onClick={createPage}>Create page</EditorChip>
                )}
              </div>
              {storeNote && (
                <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-spec-orange">
                  {storeNote}
                </p>
              )}
              {storedSlug && (
                <Button
                  asChild
                  variant="outline"
                  className="mt-2 max-w-full whitespace-normal text-left"
                >
                  <a
                    href={`/journey?j=${storedSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Page created · open /journey?j={storedSlug}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Button>
              )}
              {showJson && (
                <pre
                  tabIndex={0}
                  aria-label="Journey JSON"
                  className="mt-2 max-h-56 overflow-auto rounded-md border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {exportJson}
                </pre>
              )}
              <p className="mt-3 pb-2 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
                The JSON is a complete journey: beats chained in order, poses included.
                Paste it as .quirq/journeys/{cleanSlug(slug) || "my-journey"}.json and
                Reload .quirq on /journey, or in development hit Create page and it is
                written for you. Open forks later by editing choices in the file.
              </p>
            </>
          )}
        </div>
      </aside>

      {/* Small screens get the page, not the panel. */}
      <div className="fixed right-4 bottom-4 z-40 rounded-full border border-border bg-card px-4 py-2 font-mono text-[9.5px] tracking-[0.12em] text-muted-foreground uppercase backdrop-blur-xl lg:hidden">
        Editor needs a wider screen
      </div>
    </>
  );
}

function EditorChip({
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

function EditorInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* ------------------------------- tree tab -------------------------------- */

type FlatNode = { depth: number; node: ChoreoNode; isLeaf: boolean };

function flattenTree(node: ChoreoNode, depth = 0, out: FlatNode[] = []) {
  const isLeaf = !node.children || node.children.length === 0;
  out.push({ depth, node, isLeaf });
  node.children?.forEach((child) => flattenTree(child, depth + 1, out));
  return out;
}

/**
 * The authored CHOREOGRAPHY, the leaves currently live (the editor's own
 * override while this panel is open), and a save path: the draft converted
 * into tree form, root plus partial diffs, ready for choreo-tree.ts.
 */
function TreeTab({ beats }: { beats: EditorBeat[] }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  const authored = useMemo(() => flattenTree(CHOREOGRAPHY), []);
  const live = getResolvedLeaves();

  const draftTree = useMemo(() => {
    const base = beats[0]?.keyframe ?? KEYFRAMES[0];
    return {
      id: "draft-shot",
      keyframe: roundKeyframe(base),
      children: beats.map((b) => {
        const diff: Record<string, number> = {};
        for (const [key, value] of Object.entries(b.keyframe)) {
          if (value !== base[key as keyof Keyframe]) diff[key] = round3(value);
        }
        return { id: b.id, ...(Object.keys(diff).length ? { keyframe: diff } : {}) };
      }),
    };
  }, [beats]);
  const draftJson = useMemo(() => JSON.stringify(draftTree, null, 2), [draftTree]);

  return (
    <div>
      <p className="label text-[9px]">Authored tree · choreo-tree.ts</p>
      <div className="mt-2 overflow-hidden rounded-xl border border-border/60">
        {authored.map(({ depth, node, isLeaf }, i) => (
          <div
            key={node.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2",
              i > 0 && "border-t border-border/60",
            )}
            style={{ paddingLeft: `${12 + depth * 14}px` }}
          >
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/85">
              {node.id}
            </span>
            {node.when && (
              <span className="rounded-full bg-spec-cyan/10 px-2 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-spec-cyan uppercase">
                when
              </span>
            )}
            <span className="font-mono text-[9px] text-muted-foreground">
              {isLeaf
                ? `leaf · ${Object.keys(node.keyframe ?? {}).length}ch`
                : `root · ${Object.keys(node.keyframe ?? {}).length}ch`}
            </span>
          </div>
        ))}
      </div>

      <p className="label mt-6 text-[9px]">
        Live resolved leaves · serving the glass now
      </p>
      <div className="mt-2 overflow-hidden rounded-xl border border-border/60">
        {live.map((leaf, i) => (
          <div
            key={leaf.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2",
              i > 0 && "border-t border-border/60",
            )}
          >
            <span className="font-mono text-[10px] text-muted-foreground">{i}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/85">
              {leaf.id}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
              z {leaf.keyframe.z.toFixed(1)} · χ {leaf.keyframe.chroma.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
        While the editor is open, its draft stands in front of the authored tree via
        overrideLeaves; leave the editor and the tree takes back over.
      </p>

      <p className="label mt-6 text-[9px]">Save the draft as a tree</p>
      <div className="mt-2 flex gap-2">
        <EditorChip
          onClick={async () => {
            const ok = await copyText(draftJson);
            setCopied(ok);
            if (!ok) setShow(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Copied" : "Copy tree"}
        </EditorChip>
        <EditorChip onClick={() => downloadText("choreo-draft-tree.json", draftJson)}>
          Download
        </EditorChip>
        <EditorChip onClick={() => setShow((v) => !v)} active={show}>
          {show ? "Hide" : "Show"}
        </EditorChip>
      </div>
      {show && (
        <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-border/60 bg-muted p-3 font-mono text-[10px] leading-relaxed text-foreground/75">
          {draftJson}
        </pre>
      )}
      <p className="mt-2 pb-2 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
        Root carries the first beat&apos;s full pose; children carry only what differs,
        which is exactly how choreo-tree.ts wants them.
      </p>
    </div>
  );
}

/* ----------------------------- registry tab ------------------------------ */

/** Live view of lib/beat-registry: what announced itself, and how it binds. */
function RegistryTab() {
  const [, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => onBeatsChange(() => setVersion((v) => v + 1)), []);

  const entries = beatEntries();
  const leaves = getResolvedLeaves();
  const byId = new Set(leaves.map((leaf) => leaf.id));
  const idBound =
    entries.length === leaves.length && entries.every((e) => byId.has(e.id));

  const rows = entries.map((entry) => {
    const rect = entry.el.getBoundingClientRect();
    const ratio = rect.height / Math.max(window.innerHeight, 1);
    return {
      id: entry.id,
      index: entry.index,
      height: Math.round(rect.height),
      centre: Math.round(rect.top + window.scrollY + rect.height / 2),
      ratio,
    };
  });

  const snapshot = JSON.stringify(
    { binding: idBound ? "by id" : "positional", sections: rows },
    null,
    2,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="label text-[9px]">Registered sections</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-[8.5px] tracking-[0.08em] uppercase",
            idBound
              ? "bg-spec-green/10 text-spec-green"
              : "bg-muted text-muted-foreground",
          )}
        >
          {idBound ? "bound by id" : "positional"}
        </span>
      </div>

      <div className="mt-2 overflow-hidden rounded-xl border border-border/60">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={cn("px-3 py-2", i > 0 && "border-t border-border/60")}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                {row.index}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/85">
                {row.id}
              </span>
              <span
                className={cn(
                  "font-mono text-[9px] tabular-nums",
                  row.ratio < 0.85 ? "text-spec-orange" : "text-muted-foreground",
                )}
              >
                {Math.round(row.ratio * 100)}% vh
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[9px] text-muted-foreground tabular-nums">
              centre {row.centre}px · height {row.height}px
            </p>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-3 py-3 font-mono text-[10px] text-muted-foreground">
            Nothing registered; the runtime would fall back to the data-beat query.
          </p>
        )}
      </div>
      <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
        Sections under about 85% of a viewport flash their pose past; that is the
        one-viewport rule, measured live.
      </p>

      <div className="mt-4 flex gap-2 pb-2">
        <EditorChip
          onClick={async () => {
            const ok = await copyText(snapshot);
            setCopied(ok);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Copied" : "Copy snapshot"}
        </EditorChip>
        <EditorChip onClick={() => setVersion((v) => v + 1)}>Refresh</EditorChip>
      </div>
    </div>
  );
}

/* ------------------------------ golden tab ------------------------------- */

/**
 * Run the golden harness against the page as it stands (the draft, if the
 * beats tab has one), hold a baseline, and diff later captures against it:
 * the capture-diff-gate loop from /golden, in the panel.
 */
function GoldenTab() {
  const [baseline, setBaseline] = useState<Golden | null>(null);
  const [latest, setLatest] = useState<Golden | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const capture = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const g = await captureGolden(21);
      setLatest(g);
      setBaseline((b) => b ?? g);
    } finally {
      setBusy(false);
    }
  };

  const delta = useMemo(() => {
    if (!baseline || !latest) return null;
    if (baseline.samples.length !== latest.samples.length) return null;
    let worst = 0;
    for (let i = 0; i < baseline.samples.length; i++) {
      worst = Math.max(
        worst,
        Math.abs(baseline.samples[i].beat - latest.samples[i].beat),
      );
    }
    return worst;
  }, [baseline, latest]);

  const json = latest ? JSON.stringify(latest, null, 2) : "";

  return (
    <div>
      <p className="label text-[9px]">Capture</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <EditorChip onClick={capture} disabled={busy}>
          {busy ? "Walking the page" : "Capture 21 stops"}
        </EditorChip>
        <EditorChip onClick={() => latest && setBaseline(latest)} disabled={!latest}>
          Set as baseline
        </EditorChip>
      </div>
      <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-muted-foreground">
        The capture scrolls the page top to bottom and returns; the numbers are read from
        the live runtime, exactly like docs/goldens.
      </p>

      {latest && (
        <>
          <div className="mt-5 flex items-center justify-between">
            <p className="label text-[9px]">Latest · {latest.centres.length} centres</p>
            {delta !== null && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[8.5px] tracking-[0.08em] uppercase",
                  delta < 1e-4
                    ? "bg-spec-green/10 text-spec-green"
                    : "bg-spec-orange/10 text-spec-orange",
                )}
              >
                Δ vs baseline {delta.toFixed(5)}
              </span>
            )}
          </div>
          <div className="mt-2 rounded-xl border border-border/60 px-3 py-2.5">
            <p className="font-mono text-[9.5px] leading-relaxed break-words text-foreground/70 tabular-nums">
              {latest.samples.map((s) => s.beat.toFixed(3)).join(" · ")}
            </p>
          </div>

          <div className="mt-4 flex gap-2 pb-2">
            <EditorChip
              onClick={async () => {
                const ok = await copyText(json);
                setCopied(ok);
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? "Copied" : "Copy JSON"}
            </EditorChip>
            <EditorChip
              onClick={() =>
                downloadText(
                  `golden${latest.path.replace(/\//g, "-") || "-home"}-${Date.now()}.json`,
                  json,
                )
              }
            >
              Download
            </EditorChip>
          </div>
        </>
      )}
    </div>
  );
}
