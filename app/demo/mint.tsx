"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ActionLink,
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { beatsResized } from "@/lib/beat-registry";
import { formatMoney, formatQuirqs, settleUnit } from "@/lib/quirq/engine.mjs";
import type { SettledUnit } from "@/lib/quirq/engine.mjs";
import { verifyChain } from "@/lib/quirq/ledger.mjs";
import { appendSession, clearSession, readSession } from "@/lib/quirq/session.mjs";
import {
  INITIAL_FILES,
  applyTodo,
  evaluateChecks,
  snapshotFiles,
  todoCheck,
} from "@/lib/quirq/workspace.mjs";
import type { Files, Todo } from "@/lib/quirq/workspace.mjs";

/**
 * Mint a quirq the way you tick off a todo.
 *
 * Write the item, say what would make it done, run it. The snapshot is taken
 * at the moment the worker reports done, and the check reads that snapshot
 * rather than the report. Everything the calculus needs is already in a todo:
 * the title is the unit, the "done when" phrase is the definition of done,
 * and the worth is the budget B.
 *
 * Staged: the document and the worker. Real: the hashing, the check against
 * captured state, the mint, and the chain. Keep that line on the page.
 *
 * On the stage, in four beats of the shared five-keyframe track:
 *   0 centred, the invitation · 1 glass stage-right so the composer sits left ·
 *   2 glass stage-left so the list sits right · 3 the glass recedes and the
 *   ledger owns the frame. The fifth keyframe simply never plays.
 *
 * The list is the reason this page stayed off the stage for so long: it grows
 * and shrinks under the reader, and beat centres are measured from section
 * heights. beatsResized() is the synchronous answer to that.
 */

type Status = "open" | "running" | "settled";

type Row = Todo & {
  status: Status;
  unit: SettledUnit | null;
  seq: number | null;
  hash: string | null;
  files: number | null;
};

const SEED: Todo[] = [
  { id: "t-pricing", title: "Add the Q3 pricing table", phrase: "Pricing", worth: 400 },
  {
    id: "t-risks",
    title: "Write down the risks we are accepting",
    phrase: "Risks",
    worth: 250,
  },
];

const fresh = (todos: Todo[]): Row[] =>
  todos.map((t) => ({
    ...t,
    status: "open",
    unit: null,
    seq: null,
    hash: null,
    files: null,
  }));

/** Costs the same shape the CLI meters; only the world is staged. */
const COST = {
  inference: [{ model: "primary", tokens: 52_000, pricePerMillion: 2 }],
  environment: { fixedCost: 90, unitsHosted: 3000 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ *
 * 0 · the invitation, centred in front of the glass
 * ------------------------------------------------------------------ */

/**
 * Static, so it renders once instead of on every keystroke in the composer.
 * The staged/real split is stated here and again beside the receipt: whoever
 * reads only one of the two must still leave knowing no model ran.
 */
export function MintHero() {
  return (
    <Beat index={0} id="demo-hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool scrimClassName="mx-auto max-w-3xl">
          <Marker>Demo · mint one yourself</Marker>

          <h1 className="display mt-7 max-w-[12ch]">
            <Reveal delay={0.05}>Mint your</Reveal>
            <Reveal delay={0.13}>
              {/* On the stage there is live light behind the type, so this
                  cuts a real hole in the pool rather than only looking like
                  glass. */}
              first <GlassText>quirq</GlassText>.
            </Reveal>
          </h1>

          {/* .lede is unlayered in globals.css, so its 36ch beats any Tailwind
              max-w utility. Written to read at that measure rather than fought. */}
          <Rise delay={0.24}>
            <p className="lede mx-auto mt-7 text-center">
              Write a todo, say what would make it done, and run it. The snapshot is taken
              the moment the worker reports done. Every hash and every chain link is
              computed in this tab.
            </p>
          </Rise>
        </GlassPool>

        <Rise delay={0.34} className="mt-12 w-full max-w-3xl text-left">
          <StagedReal />
        </Rise>
      </div>

      {/* The whole point is that the arithmetic runs in the reader's browser,
          so there is no server-rendered fallback to offer. Say so rather than
          leaving a form whose button does nothing. */}
      <noscript>
        <p className="mx-auto mt-11 max-w-3xl rounded-xl border border-border bg-card px-5 py-5 font-mono text-[11.5px] leading-relaxed text-muted-foreground sm:px-6">
          This mint runs entirely in your browser: the hashing, the scoring and the hash
          chain are all computed here, so it needs JavaScript. The same engine runs under{" "}
          <span className="text-foreground">quirq settle</span> at a terminal, with no
          browser involved.
        </p>
      </noscript>
    </Beat>
  );
}

/**
 * Stated up front rather than in a footnote. The product claim is that the
 * meter cannot be talked out of a verdict, and a demo that lets a reader
 * believe a model just ran would be arguing the opposite.
 */
function StagedReal() {
  return (
    <div className="overflow-hidden rounded-xl border border-border backdrop-blur-xl">
      <div className="grid gap-px bg-muted md:grid-cols-2">
        <div className="bg-card px-5 py-6 sm:px-6">
          <p className="label text-[9.5px]">Staged</p>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-foreground/80">
            The document and the worker. A few files that live in a JavaScript object, and
            a script. There is no repo behind this page, and no model will run.
          </p>
        </div>
        <div className="bg-card px-5 py-6 sm:px-6">
          <p className="label text-[9.5px]">Real</p>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-foreground/80">
            The SHA-256 hashing, your definition of done evaluated against the captured
            state, the score, the mint and the hash chain. That is{" "}
            {/* Styling only, deliberately: a hole here would open a bright
                window inside an opaque panel. */}
            <span className="glass-text whitespace-nowrap">the same engine</span> the CLI
            runs, imported here unmodified.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 1 · 3 · the live surface
 * ------------------------------------------------------------------ */

export function Mint() {
  const formId = useId();
  const [rows, setRows] = useState<Row[]>(() => fresh(SEED));
  const [files, setFiles] = useState<Files>(INITIAL_FILES);
  const [honest, setHonest] = useState(true);
  const [title, setTitle] = useState("");
  const [phrase, setPhrase] = useState("");
  const [worth, setWorth] = useState("300");
  const [chain, setChain] = useState<{ length: number; valid: boolean } | null>(null);
  const [note, setNote] = useState("");
  const busy = useRef(false);

  // localStorage does not exist during SSR, so the chain summary can only be
  // read after mount or the server and client renders disagree.
  useEffect(() => {
    const entries = readSession();
    if (entries.length === 0) return;
    void verifyChain(entries).then((v) => setChain({ length: v.length, valid: v.valid }));
  }, []);

  /**
   * Every one of these changes a beat's height: a row added, a row entering
   * "working", a row settling into a receipt, the ledger cell gaining a chain
   * summary, the worker note rewrapping. The runtime observes the sections
   * too, but that delivery rides the rendering lifecycle; this is the
   * synchronous path, and it is what keeps the pose on the copy.
   */
  useEffect(() => {
    beatsResized();
  }, [rows, chain, honest]);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanPhrase = phrase.trim();
    if (!cleanTitle || !cleanPhrase) return;

    setRows((prev) => [
      ...prev,
      ...fresh([
        {
          id: `t-${prev.length}-${cleanPhrase.toLowerCase().replace(/\W+/g, "-")}`,
          title: cleanTitle,
          phrase: cleanPhrase,
          worth: Math.max(1, Number(worth) || 1),
        },
      ]),
    ]);
    setTitle("");
    setPhrase("");
    setNote(`Added "${cleanTitle}".`);
  };

  /**
   * The snapshot bracket is the whole mechanism: S0 before the worker touches
   * anything, S1 the moment it reports done, and the check reads S1.
   */
  const run = async (row: Row) => {
    if (busy.current || row.status !== "open") return;
    busy.current = true;
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: "running" } : r)),
    );

    const before = await snapshotFiles(files);
    // This worker runs from Item's onRun event, never during React rendering.
    // eslint-disable-next-line react-hooks/purity
    const started = performance.now();

    // A beat of working, so the bracket is legible rather than instant.
    await new Promise((resolve) => setTimeout(resolve, 900));

    const worked = applyTodo(files, row, honest);
    const after = await snapshotFiles(worked);
    const checks = evaluateChecks([todoCheck(row)], worked, before, after);

    const unit = settleUnit({
      id: row.id,
      title: row.title,
      owner: "you",
      kind: "todo",
      createdAt: before.capturedAt,
      settledAt: after.capturedAt,
      budget: row.worth,
      tau: 1,
      settlement: "atomic",
      checks,
      cost: {
        ...COST,
        compute: [
          {
            kind: "cpu",
            // Event-driven elapsed time is the measured cost input for this run.
            // eslint-disable-next-line react-hooks/purity
            seconds: (performance.now() - started) / 1000,
            ratePerHour: 0.04,
          },
        ],
      },
      snapshots: {
        before: { count: before.count, bytes: before.bytes },
        after: { count: after.count, bytes: after.bytes },
        provenance: { compute: "metered", inference: "declared" },
      },
    });

    const { entry, entries } = await appendSession(unit);
    const verdict = await verifyChain(entries);

    setFiles(worked);
    setChain({ length: verdict.length, valid: verdict.valid });
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? {
              ...r,
              status: "settled",
              unit,
              seq: entry.seq,
              hash: entry.hash,
              files: after.count,
            }
          : r,
      ),
    );
    setNote(
      unit.Q > 0
        ? `${row.title} minted ${formatQuirqs(unit.Q)} quirqs.`
        : `${row.title} minted nothing: the check failed.`,
    );
    busy.current = false;
  };

  const reset = () => {
    clearSession();
    setFiles(INITIAL_FILES);
    setChain(null);
    setRows(fresh(SEED));
    setNote("Ledger cleared.");
  };

  const minted = rows.reduce((sum, r) => sum + (r.unit?.Q ?? 0), 0);
  const settled = rows.filter((r) => r.status === "settled").length;

  return (
    <>
      {/* 1 · the glass is stage-right, so the composer sits left. */}
      <Beat index={1} id="demo-compose">
        <div className="max-w-2xl md:max-w-[60%]">
          <div className="relative">
            <TextScrim />
            <Marker>01 · write the todo</Marker>

            <h2 className="display over-stage mt-8">
              <Reveal delay={0.05}>Say what</Reveal>
              <Reveal delay={0.13}>done means.</Reveal>
            </h2>

            <Rise delay={0.26}>
              <p className="lede over-stage mt-7">
                A todo already carries everything the calculus needs: the title is the
                unit, the phrase is the definition of done, the worth is the budget.
              </p>
            </Rise>
          </div>

          <Rise delay={0.34} className="mt-9">
            <form onSubmit={add}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <label htmlFor={`${formId}-title`} className="label">
                  What needs doing
                </label>
                <Input
                  id={`${formId}-title`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Draft the Q3 pricing proposal"
                  className="mt-3"
                />

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label htmlFor={`${formId}-phrase`} className="label">
                      Done when the proposal has a section called
                    </label>
                    <Input
                      id={`${formId}-phrase`}
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      placeholder="Pricing"
                      className="mt-3 font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-worth`} className="label">
                      Worth
                    </label>
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        aria-hidden
                        className="font-mono text-[13px] text-muted-foreground"
                      >
                        $
                      </span>
                      <Input
                        id={`${formId}-worth`}
                        type="number"
                        min={1}
                        value={worth}
                        onChange={(e) => setWorth(e.target.value)}
                        className="numeric w-24 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
                    That phrase is the whole definition of done, and it is decidable, so
                    nobody has to argue about whether the work landed.
                  </p>
                  <Button type="submit" disabled={!title.trim() || !phrase.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </form>
          </Rise>

          {/* One switch, because the interesting question is not how the worker
              works but whether it can simply claim it worked. */}
          <Rise delay={0.42} className="mt-5">
            {/* Darker than a panel usually needs: this row sits on the beat
                1 to 2 boundary, where the burst is at its brightest. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-card px-5 py-4 backdrop-blur-xl">
              <span className="label">The worker</span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Worker behavior"
              >
                {[
                  { on: true, label: "Does the work" },
                  { on: false, label: "Only says it did" },
                ].map((option) => (
                  <Button
                    key={option.label}
                    type="button"
                    variant={honest === option.on ? "secondary" : "outline"}
                    aria-pressed={honest === option.on}
                    onClick={() => setHonest(option.on)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="w-full text-[12.5px] leading-relaxed text-muted-foreground sm:w-auto sm:flex-1">
                {honest
                  ? "It will actually write the thing your todo asks for."
                  : "It will report done and change nothing. Watch what the snapshot does with that."}
              </p>
            </div>
          </Rise>
        </div>
      </Beat>

      {/* 2 · the glass swings stage-left and the spectrum floods back, so the
          list sits right, where the verdicts land. */}
      <Beat index={2} id="demo-run">
        <div className="max-w-2xl md:ml-auto md:max-w-[62%]">
          <div className="relative">
            <TextScrim />
            <Marker>02 · run it</Marker>

            <h2 className="display over-stage mt-8">
              <Reveal delay={0.05}>The snapshot</Reveal>
              <Reveal delay={0.13}>decides.</Reveal>
            </h2>

            <Rise delay={0.26}>
              <p className="lede over-stage mt-7">
                One snapshot before the worker starts, one the moment it reports done. The
                check reads that second snapshot, never the report.
              </p>
            </Rise>
          </div>

          {/* No Rise around the list: it outgrows the viewport once a few rows
              settle, and whileInView needs 25% of the element on screen. Each
              row animates itself in on mount instead. */}
          <ul className="mt-9 space-y-3">
            {rows.map((row) => (
              <Item key={row.id} row={row} onRun={() => run(row)} />
            ))}
          </ul>
        </div>
      </Beat>

      {/* 3 · the glass recedes small and high; the numbers own the frame. */}
      <Beat index={3} id="demo-ledger">
        <div className="relative max-w-2xl">
          <TextScrim />
          <Marker>03 · your ledger</Marker>

          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>Minted, and</Reveal>
            <Reveal delay={0.13}>hash-chained.</Reveal>
          </h2>
        </div>

        <Rise delay={0.24} className="mt-9">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-muted backdrop-blur-xl sm:grid-cols-3">
            <div className="bg-card px-5 py-6 sm:px-6">
              <p className="label text-[9.5px]">Minted so far</p>
              <p className="numeric mt-3 font-mark text-[30px] leading-none font-semibold text-foreground tabular-nums">
                {formatQuirqs(minted)}
              </p>
              <p className="mt-2.5 font-mono text-[10.5px] text-muted-foreground">
                quirqs
              </p>
            </div>

            <div className="bg-card px-5 py-6 sm:px-6">
              <p className="label text-[9.5px]">Settled</p>
              <p className="numeric mt-3 font-mark text-[30px] leading-none font-semibold text-foreground tabular-nums">
                {settled}
                <span className="text-muted-foreground">/{rows.length}</span>
              </p>
              <p className="mt-2.5 font-mono text-[10.5px] text-muted-foreground">
                todos on the list
              </p>
            </div>

            <div className="bg-card px-5 py-6 sm:px-6">
              <p className="label text-[9.5px]">Chain</p>
              <p className="numeric mt-3 font-mark text-[30px] leading-none font-semibold text-foreground tabular-nums">
                {chain ? chain.length : 0}
              </p>
              <p
                className={cn(
                  "mt-2.5 font-mono text-[10.5px]",
                  chain
                    ? chain.valid
                      ? "text-spec-green"
                      : "text-spec-red"
                    : "text-muted-foreground",
                )}
              >
                {chain
                  ? `${chain.valid ? "verified" : "broken"} · ${chain.length === 1 ? "entry" : "entries"}`
                  : "nothing in your ledger yet"}
              </p>
            </div>
          </div>
        </Rise>

        <Rise delay={0.32} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <ActionLink href="/dashboard">See it in the dashboard</ActionLink>
          <Button type="button" variant="ghost" onClick={reset}>
            Start over
          </Button>
        </Rise>

        <Rise delay={0.4} className="relative mt-7 max-w-[62ch]">
          <TextScrim />
          <p className="relative font-mono text-[10.5px] leading-relaxed text-muted-foreground">
            The chain lives in this tab&rsquo;s storage and nowhere else. Each entry
            hashes the one before it, so re-ordering or editing any of them breaks the
            verify. Start over clears it.
          </p>
        </Rise>

        <p aria-live="polite" className="sr-only">
          {note}
        </p>
      </Beat>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * One todo
 * ------------------------------------------------------------------ */

function Item({ row, onRun }: { row: Row; onRun: () => void }) {
  const done = row.status === "settled";
  const paid = (row.unit?.Q ?? 0) > 0;

  return (
    // Entrance on mount rather than whileInView: rows are added while the
    // list is already on screen, and a viewport trigger would never fire for
    // one appended below the fold either.
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      className={cn(
        "rounded-xl border bg-card px-5 py-4 backdrop-blur-xl transition-colors sm:px-6",
        done && paid && "border-spec-green/25",
        done && !paid && "border-spec-red/30",
        !done && "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Derived, never a checkbox the reader can tick: the point is that
            completion is not self-declared. */}
        <span
          aria-hidden
          className={cn(
            "grid h-5 w-5 shrink-0 place-items-center rounded-sm border font-mono text-[11px]",
            done && paid && "border-spec-green/50 text-spec-green",
            done && !paid && "border-spec-red/50 text-spec-red",
            !done && "border-border/60",
          )}
        >
          {done ? (paid ? "✓" : "✕") : ""}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[15px] text-foreground",
              done && !paid && "text-muted-foreground",
            )}
          >
            {row.title}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            done when the proposal has a &ldquo;{row.phrase}&rdquo; section ·{" "}
            {formatMoney(row.worth, 0)}
          </p>
        </div>

        {row.status === "open" && (
          <Button
            type="button"
            variant="outline"
            onClick={onRun}
            aria-label={`Run: ${row.title}`}
          >
            Run it
          </Button>
        )}

        {row.status === "running" && (
          <motion.span
            className="shrink-0 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            working
          </motion.span>
        )}

        {done && (
          <div className="shrink-0 text-right">
            <p
              className={cn(
                "numeric font-mark text-[19px] font-semibold tabular-nums",
                paid ? "text-foreground" : "text-spec-red",
              )}
            >
              {formatQuirqs(row.unit?.Q ?? 0)}
            </p>
            <p className="font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase">
              minted
            </p>
          </div>
        )}
      </div>

      {done && row.unit && (
        <div className="mt-4 border-t border-border/60 pt-3.5">
          <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
            {row.unit.checks[0]?.passed ? "pass" : "FAIL"} ·{" "}
            {row.unit.checks[0]?.evidence}
          </p>
          <p className="mt-1.5 font-mono text-[10.5px] text-muted-foreground">
            snapshot of {row.files} files · all-in {formatMoney(row.unit.cost, 4)} ·
            ledger #{row.seq} · {row.hash?.slice(0, 12)}
          </p>
          {!paid && (
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
              It reported done and nothing minted. The snapshot was taken when it said so,
              and the proposal still has no{" "}
              <span className="font-mono text-[12px]">{row.phrase}</span> section. The
              claim was not what got checked.
            </p>
          )}
        </div>
      )}
    </motion.li>
  );
}
