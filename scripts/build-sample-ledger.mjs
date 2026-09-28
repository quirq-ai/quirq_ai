#!/usr/bin/env node
/**
 * Builds the sample ledger the dashboard reads.
 *
 * Every record is produced the same way the CLI produces one: files are
 * really written to a scratch workspace, really hashed before and after, and
 * the definition of done is really evaluated against the after-state. No
 * number in the output is typed by hand.
 *
 * What IS staged: the agent is a script rather than a model, and the
 * timestamps are laid out across a month so the dashboard has a trend to
 * draw. That is exactly the whitepaper's "mock mode" — it validates the
 * machinery, and it cannot validate claims about real agents. The dashboard
 * says so on the page; do not quietly drop that label.
 *
 *   node scripts/build-sample-ledger.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { settleUnit } from "../lib/quirq/engine.mjs";
import { appendEntry } from "../lib/quirq/ledger.mjs";
import { snapshotDir, diffSnapshots, evaluateChecks } from "../lib/quirq/snapshot.mjs";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "lib",
  "quirq",
  "sample-ledger.json",
);

/** Deterministic PRNG so re-running produces an identical ledger. */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x9117);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const between = (lo, hi) => lo + rand() * (hi - lo);

const ENV = { fixedCost: 90, unitsHosted: 3000 };
const START = Date.parse("2026-06-01T09:00:00.000Z");
const DAY = 86_400_000;

const write = (root, rel, body) => {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
};

/* ------------------------------------------------------------------ *
 * Three unit families, the ones a support-and-engineering team runs
 * ------------------------------------------------------------------ */

const FAMILIES = [
  {
    kind: "support",
    title: (n) => `Resolve support ticket #${4100 + n}`,
    owner: "support@acme.test",
    budget: () => between(11, 34),
    settlement: "divisible",
    tokens: () => between(26_000, 52_000),
    checks: (n) => [
      {
        id: "ticket-closed",
        predicate: "fileMatches",
        path: `tickets/t${n}.md`,
        pattern: "status: closed",
        weight: 0.5,
        description: "the ticket is closed in the system of record",
      },
      {
        id: "reply-sent",
        predicate: "fileMatches",
        path: `tickets/t${n}.md`,
        pattern: "reply:",
        weight: 0.3,
        description: "the customer got an answer",
      },
      {
        id: "kb-linked",
        predicate: "fileMatches",
        path: `tickets/t${n}.md`,
        pattern: "kb:",
        weight: 0.2,
        description: "a knowledge-base article is linked",
      },
    ],
    // The knowledge-base link is the check this team keeps missing. It is the
    // single check the portfolio view will tell them to harden.
    work: (root, n) => {
      const linksKb = rand() > 0.34;
      write(
        root,
        `tickets/t${n}.md`,
        [
          "status: closed",
          "reply: thanks for flagging, shipped a fix",
          linksKb ? "kb: /kb/rate-limits" : "",
        ]
          .filter(Boolean)
          .join("\n") + "\n",
      );
    },
  },
  {
    kind: "engineering",
    title: (n) => `Ship change request CR-${220 + n}`,
    owner: "platform@acme.test",
    budget: () => between(70, 210),
    settlement: "atomic",
    tokens: () => between(38_000, 96_000),
    checks: (n) => [
      {
        id: "implemented",
        predicate: "fileMatches",
        path: `src/cr${n}.js`,
        pattern: "export",
        weight: 0.4,
        description: "the change exists and exports something",
      },
      {
        id: "covered-by-test",
        predicate: "fileExists",
        path: `test/cr${n}.test.js`,
        weight: 0.3,
        description: "a test covers it",
      },
      {
        id: "surface-intact",
        predicate: "surfaceIntact",
        paths: [`test/cr${n}.test.js`],
        weight: 0.3,
        description: "the worker did not edit its own test",
      },
    ],
    seed: (root, n) => {
      write(
        root,
        `test/cr${n}.test.js`,
        `import assert from 'node:assert';\nassert.ok(require('../src/cr${n}.js'));\n`,
      );
    },
    work: (root, n) => {
      // Most of the time the agent does the work. Occasionally it takes the
      // shortcut of rewriting the test instead, and the surface check catches
      // it: the unit mints nothing even though "covered-by-test" is green.
      const games = rand() > 0.88;
      write(root, `src/cr${n}.js`, `export const cr${n} = { shipped: true };\n`);
      if (games) write(root, `test/cr${n}.test.js`, "// skipped\n");
    },
  },
  {
    kind: "legal",
    title: (n) => `Review vendor contract V-${70 + n}`,
    owner: "legal@acme.test",
    budget: () => between(280, 720),
    settlement: "divisible",
    tokens: () => between(120_000, 240_000),
    checks: (n) => [
      {
        id: "clauses-extracted",
        predicate: "fileExists",
        path: `contracts/v${n}.json`,
        weight: 0.4,
        description: "the clause set was extracted",
      },
      {
        id: "risk-flagged",
        predicate: "fileMatches",
        path: `contracts/v${n}.json`,
        pattern: '"risk"',
        weight: 0.4,
        description: "risk is assessed",
      },
      {
        id: "countersigned",
        predicate: "fileMatches",
        path: `contracts/v${n}.json`,
        pattern: '"countersigned": true',
        weight: 0.2,
        description: "a human accepted it",
      },
    ],
    work: (root, n) => {
      const countersigned = rand() > 0.42;
      write(
        root,
        `contracts/v${n}.json`,
        JSON.stringify({ clauses: 24, risk: "medium", countersigned }, null, 2) + "\n",
      );
    },
  },
];

/**
 * Round every number before it is hashed.
 *
 * Load-bearing, and the reason is not cosmetic: bundlers re-serialize JSON
 * module imports and can drop significant digits. Turbopack turned a stored
 * 0.20426093667038198 into 0.204260936670382, which is a different double, so
 * the canonical form changed and the dashboard's chain verification failed on
 * data nobody had touched. Values that fit in 6 decimals round-trip through
 * any serializer unchanged, so hashing the rounded values makes the ledger
 * verify identically in node, in the browser, and after bundling.
 */
function roundDeep(value, dp = 6) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return value;
    const factor = 10 ** dp;
    return Math.round(value * factor) / factor;
  }
  if (Array.isArray(value)) return value.map((v) => roundDeep(v, dp));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, roundDeep(v, dp)]),
    );
  }
  return value;
}

/* ------------------------------------------------------------------ */

async function main() {
  const root = mkdtempSync(join(tmpdir(), "quirq-sample-"));
  const entries = [];
  const units = [];

  const COUNT = 34;

  for (let n = 0; n < COUNT; n += 1) {
    const family = pick(FAMILIES);
    if (family.seed) family.seed(root, n);

    const before = snapshotDir(root);
    family.work(root, n);
    const after = snapshotDir(root);

    const checks = evaluateChecks(root, family.checks(n), before, after);
    const diff = diffSnapshots(before, after);

    // Timestamps spread across the month so the dashboard has a time axis.
    const createdAt = new Date(START + n * (DAY * 0.85) + between(0, DAY * 0.3));
    const durationMs = between(40_000, 400_000);
    const settledAt = new Date(createdAt.getTime() + durationMs);

    const V = checks.reduce((s, c) => s + (c.passed ? c.weight : 0), 0);
    const underTau = V < 1;

    const unit = settleUnit({
      id: `u-${String(n).padStart(3, "0")}`,
      title: family.title(n),
      owner: family.owner,
      kind: family.kind,
      budget: Math.round(family.budget() * 100) / 100,
      tau: 1,
      settlement: family.settlement,
      createdAt: createdAt.toISOString(),
      settledAt: settledAt.toISOString(),
      checks,
      cost: {
        inference: [
          { model: "primary", tokens: Math.round(family.tokens()), pricePerMillion: 2 },
          {
            model: "classifier",
            tokens: Math.round(between(2_000, 9_000)),
            pricePerMillion: 0.25,
          },
        ],
        compute: [{ kind: "cpu", seconds: durationMs / 1000, ratePerHour: 0.04 }],
        api: [
          {
            service: "systems-of-record",
            calls: Math.round(between(1, 7)),
            pricePerCall: 0.01,
          },
        ],
        environment: ENV,
        // A unit that came back under tau is exactly a unit a human had to
        // pick up. That is the definitional link between scoring and the
        // intervention line of the cost model.
        ...(underTau
          ? {
              intervention: {
                minutes: Math.round(between(14, 52)),
                loadedRatePerHour: 90,
              },
            }
          : {}),
      },
      snapshots: {
        before: { count: before.count, bytes: before.bytes },
        after: { count: after.count, bytes: after.bytes },
        diff,
        provenance: { compute: "measured", inference: "declared" },
      },
    });

    const rounded = roundDeep(unit);
    units.push(rounded);
    entries.push(await appendEntry(entries, rounded));
  }

  writeFileSync(OUT, JSON.stringify(entries, null, 2) + "\n");
  rmSync(root, { recursive: true, force: true });

  const minted = units.reduce((s, u) => s + u.Q, 0);
  const cost = units.reduce((s, u) => s + u.cost, 0);
  const interventions = units.filter((u) => u.V < u.tau).length;

  process.stdout.write(
    `wrote ${entries.length} entries to lib/quirq/sample-ledger.json\n` +
      `  minted ${minted.toFixed(2)} quirqs · cost $${cost.toFixed(2)} · QER ${(minted / cost).toFixed(2)}x\n` +
      `  intervention rate ${((interventions / units.length) * 100).toFixed(1)}%\n` +
      `  head ${entries[entries.length - 1].hash.slice(0, 16)}\n`,
  );
}

main();
