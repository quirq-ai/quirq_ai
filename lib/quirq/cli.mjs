#!/usr/bin/env node
/**
 * The quirq CLI: snapshot, verify, mint, record.
 *
 * Dependency-free and runnable by bare `node`. Every number it writes is
 * computed from state it captured itself — file content hashes before and
 * after, real elapsed compute — never from an agent's account of what it did.
 *
 *   quirq demo [dir]     run a full sample workspace end to end
 *   quirq begin <dir>    capture S0 and open a unit
 *   quirq settle <dir>   capture S1, score, mint, append to the ledger
 *   quirq report [dir]   portfolio metrics over the ledger
 *   quirq verify [dir]   recompute the hash chain from genesis
 *
 * Cost provenance is recorded per unit and never fudged: compute seconds are
 * measured here, while inference tokens are declared by whatever ran the work
 * (this CLI calls no model). The dashboard surfaces that distinction rather
 * than presenting both as if they were measured.
 */

import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  appendFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

import { portfolioMetrics, settleUnit, formatMoney, formatQuirqs } from "./engine.mjs";
import { appendEntry, parseLedger, verifyChain } from "./ledger.mjs";
import { snapshotDir, diffSnapshots, evaluateChecks } from "./snapshot.mjs";

const QUIRQ_DIR = ".quirq";
const LEDGER = "ledger.jsonl";
const PENDING = "pending.json";

/* ------------------------------------------------------------------ *
 * Terminal niceties (no dependency, degrade to plain text)
 * ------------------------------------------------------------------ */

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  dim: (s) => (tty ? `[2m${s}[0m` : s),
  bold: (s) => (tty ? `[1m${s}[0m` : s),
  green: (s) => (tty ? `[32m${s}[0m` : s),
  red: (s) => (tty ? `[31m${s}[0m` : s),
  yellow: (s) => (tty ? `[33m${s}[0m` : s),
};

const say = (line = "") => process.stdout.write(`${line}\n`);

/* ------------------------------------------------------------------ *
 * Ledger IO
 * ------------------------------------------------------------------ */

const paths = (root) => ({
  dir: join(root, QUIRQ_DIR),
  ledger: join(root, QUIRQ_DIR, LEDGER),
  pending: join(root, QUIRQ_DIR, PENDING),
});

function readLedger(root) {
  const { ledger } = paths(root);
  if (!existsSync(ledger)) return [];
  return parseLedger(readFileSync(ledger, "utf8"));
}

async function recordUnit(root, unit) {
  const { dir, ledger } = paths(root);
  mkdirSync(dir, { recursive: true });
  const entries = readLedger(root);
  const entry = await appendEntry(entries, unit);
  appendFileSync(ledger, `${JSON.stringify(entry)}\n`);
  return entry;
}

/* ------------------------------------------------------------------ *
 * begin / settle: the real two-phase flow
 * ------------------------------------------------------------------ */

function cmdBegin(root, specPath) {
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const { dir, pending } = paths(root);
  mkdirSync(dir, { recursive: true });

  const before = snapshotDir(root);
  writeFileSync(
    pending,
    JSON.stringify(
      { spec, before, startedAt: new Date().toISOString(), startedHr: Date.now() },
      null,
      2,
    ),
  );

  say(`${c.bold("unit opened")}  ${spec.title}`);
  say(
    `${c.dim(`  budget ${formatMoney(spec.budget)} · ${spec.checks.length} checks · ${before.count} files snapshotted`)}`,
  );
  say(c.dim("  do the work, then: quirq settle"));
}

async function cmdSettle(root) {
  const { pending } = paths(root);
  if (!existsSync(pending)) {
    say(c.red("no open unit here. run `quirq begin <spec.json>` first."));
    process.exitCode = 1;
    return;
  }

  const { spec, before, startedAt, startedHr } = JSON.parse(
    readFileSync(pending, "utf8"),
  );
  const after = snapshotDir(root);
  const diff = diffSnapshots(before, after);
  const elapsedSeconds = (Date.now() - startedHr) / 1000;

  const checks = evaluateChecks(root, spec.checks, before, after);

  const unit = settleUnit({
    ...spec,
    createdAt: startedAt,
    settledAt: new Date().toISOString(),
    checks,
    cost: withMeasuredCompute(spec.cost, elapsedSeconds),
    snapshots: {
      before: { count: before.count, bytes: before.bytes },
      after: { count: after.count, bytes: after.bytes },
      diff,
      provenance: {
        compute: "measured",
        inference: spec.cost?.inference?.length ? "declared" : "none",
      },
    },
  });

  const entry = await recordUnit(root, unit);
  writeFileSync(pending, "");
  printUnit(unit, entry);
}

/**
 * Real elapsed seconds replace whatever the spec guessed for compute.
 * Anything the environment can measure itself, it should.
 */
function withMeasuredCompute(cost = {}, seconds) {
  const rate = cost.compute?.[0]?.ratePerHour ?? 0.04;
  return { ...cost, compute: [{ kind: "cpu", seconds, ratePerHour: rate }] };
}

/* ------------------------------------------------------------------ *
 * Output
 * ------------------------------------------------------------------ */

function printUnit(unit, entry) {
  say();
  say(`${c.bold(unit.title)}  ${c.dim(unit.id)}`);

  for (const check of unit.checks) {
    const mark = check.passed ? c.green("pass") : c.red("FAIL");
    say(`  ${mark}  ${c.dim(`w=${check.weight}`)}  ${check.id}`);
    if (!check.passed && check.evidence) say(`        ${c.dim(check.evidence)}`);
  }

  const pct = (unit.V * 100).toFixed(1);
  say();
  say(`  V           ${pct}%  ${c.dim(`(${unit.settlement}, tau ${unit.tau})`)}`);
  say(`  budget      ${formatMoney(unit.potential)}`);
  say(
    `  minted      ${c.bold(formatQuirqs(unit.Q))} quirqs` +
      (unit.Q === 0 ? c.red("  nothing minted: under tau") : ""),
  );
  say(`  all-in cost ${formatMoney(unit.cost, 4)}`);
  if (unit.costPerQuirq !== null) {
    say(`  cost/quirq  ${unit.costPerQuirq.toFixed(4)}`);
  }
  say(`  ${c.dim(`ledger #${entry.seq} · ${entry.hash.slice(0, 16)}`)}`);
  say();
}

function printReport(units, verification) {
  const metrics = portfolioMetrics(units);

  say();
  say(c.bold("  quirq ledger"));
  say(c.dim("  ────────────────────────────────────────────"));
  say(`  units            ${metrics.count}`);
  say(`  potential        ${formatQuirqs(metrics.potential)} quirqs`);
  say(`  minted           ${c.bold(formatQuirqs(metrics.minted))} quirqs`);
  say(`  all-in cost      ${formatMoney(metrics.cost, 4)}`);
  if (metrics.qer !== null) {
    say(
      `  QER              ${c.bold(`${metrics.qer.toFixed(2)}x`)}  ${c.dim("quirqs per all-in dollar")}`,
    );
  }
  if (metrics.costPerQuirq !== null) {
    say(`  cost per quirq   ${metrics.costPerQuirq.toFixed(4)}`);
  }
  say(
    `  intervention     ${(metrics.interventionRate * 100).toFixed(1)}%  ${c.dim(`${metrics.interventions}/${metrics.count} needed a human`)}`,
  );

  if (metrics.failingChecks.length) {
    say();
    say(c.dim("  failures localize to named checks:"));
    for (const check of metrics.failingChecks) {
      say(`    ${c.yellow(String(check.count))}x  ${check.id}`);
    }
    say(c.dim(`  harden "${metrics.failingChecks[0].id}" first.`));
  }

  if (verification) {
    say();
    const verdict = verification.valid
      ? c.green("chain verified")
      : c.red(`CHAIN BROKEN at #${verification.firstBreak}`);
    say(
      `  ${verdict}  ${c.dim(`${verification.length} entries · head ${verification.head.slice(0, 16)}`)}`,
    );
  }
  say();
}

/* ------------------------------------------------------------------ *
 * demo: a real sample workspace, run end to end
 * ------------------------------------------------------------------ */

/**
 * Three units that exercise the machinery honestly:
 *   1. clean completion, atomic settlement
 *   2. partial completion, divisible settlement, so it mints less and counts
 *      as an intervention
 *   3. an agent that edits its own test instead of fixing the code, caught by
 *      a verification-surface check
 *
 * Unit 3 is the point of the demo. It is the one gaming attack that is fully
 * mechanical, and it is fully mechanically countered: the checks go green,
 * and the unit still mints nothing because the surface moved.
 */
const DEMO_UNITS = [
  {
    id: "u-health-endpoint",
    title: "Add a health check endpoint",
    owner: "platform@acme.test",
    kind: "engineering",
    budget: 240,
    tau: 1,
    settlement: "atomic",
    checks: [
      {
        id: "endpoint-exists",
        predicate: "fileExists",
        path: "src/health.js",
        weight: 0.5,
        description: "the handler file exists",
      },
      {
        id: "exports-handler",
        predicate: "fileMatches",
        path: "src/health.js",
        pattern: "export function health",
        weight: 0.3,
        description: "it exports a handler",
      },
      {
        id: "covered-by-test",
        predicate: "fileMatches",
        path: "test/health.test.js",
        pattern: "health\\(",
        weight: 0.2,
        description: "a test exercises it",
      },
    ],
    cost: {
      inference: [{ model: "primary", tokens: 42_000, pricePerMillion: 2 }],
      api: [{ service: "github", calls: 3, pricePerCall: 0.01 }],
      environment: { fixedCost: 90, unitsHosted: 3_000 },
    },
    work(root) {
      write(
        root,
        "src/health.js",
        "export function health() {\n  return { ok: true };\n}\n",
      );
      write(
        root,
        "test/health.test.js",
        "import { health } from '../src/health.js';\n\nif (!health().ok) throw new Error('unhealthy');\n",
      );
    },
  },
  {
    id: "u-triage-rule",
    title: "Fix the ticket triage rule",
    owner: "support@acme.test",
    kind: "support",
    budget: 40,
    tau: 1,
    settlement: "divisible",
    checks: [
      {
        id: "rule-updated",
        predicate: "fileMatches",
        path: "src/triage.js",
        pattern: "priority",
        weight: 0.5,
        description: "the rule considers priority",
      },
      {
        id: "regression-test",
        predicate: "fileExists",
        path: "test/triage.test.js",
        weight: 0.3,
        description: "a regression test exists",
      },
      {
        id: "kb-linked",
        predicate: "fileMatches",
        path: "docs/runbook.md",
        pattern: "triage",
        weight: 0.2,
        description: "the runbook documents it",
      },
    ],
    cost: {
      inference: [
        { model: "primary", tokens: 38_000, pricePerMillion: 2 },
        { model: "classifier", tokens: 4_000, pricePerMillion: 0.25 },
      ],
      api: [{ service: "crm", calls: 2, pricePerCall: 0.01 }],
      environment: { fixedCost: 90, unitsHosted: 3_000 },
      // The unit came back under tau, so a human picked it up. That time is a
      // real cost and the ledger is where it stops being invisible.
      intervention: { minutes: 18, loadedRatePerHour: 90 },
    },
    work(root) {
      write(
        root,
        "src/triage.js",
        "export function triage(ticket) {\n  return ticket.priority > 2 ? 'urgent' : 'normal';\n}\n",
      );
      write(
        root,
        "test/triage.test.js",
        "import { triage } from '../src/triage.js';\n\nif (triage({ priority: 3 }) !== 'urgent') throw new Error('bad triage');\n",
      );
      // The runbook is never updated: this is the check that fails, and the
      // portfolio view will point at it as the one worth hardening.
    },
  },
  {
    id: "u-retry-backoff",
    title: "Make the retry logic exponential",
    owner: "platform@acme.test",
    kind: "engineering",
    budget: 180,
    tau: 1,
    settlement: "atomic",
    checks: [
      {
        id: "backoff-implemented",
        predicate: "fileMatches",
        path: "src/retry.js",
        pattern: "backoff",
        weight: 0.4,
        description: "the retry uses a backoff",
      },
      {
        id: "test-passes",
        predicate: "fileMatches",
        path: "test/retry.test.js",
        pattern: "assert",
        weight: 0.3,
        description: "the test asserts something",
      },
      {
        id: "surface-intact",
        predicate: "surfaceIntact",
        paths: ["test/retry.test.js"],
        weight: 0.3,
        description: "the verification surface was not edited by the worker",
      },
    ],
    cost: {
      inference: [{ model: "primary", tokens: 61_000, pricePerMillion: 2 }],
      environment: { fixedCost: 90, unitsHosted: 3_000 },
    },
    seed(root) {
      // The test exists BEFORE the unit opens, so it is part of S0 and the
      // surface check has something to compare against.
      write(
        root,
        "test/retry.test.js",
        "import assert from 'node:assert';\nimport { retry } from '../src/retry.js';\n\nassert.ok(retry.backoff, 'retry must back off');\n",
      );
    },
    work(root) {
      // The agent does not implement the backoff. It rewrites the test so the
      // requirement disappears, then reports done.
      write(root, "src/retry.js", "export const retry = { attempts: 3 };\n");
      write(
        root,
        "test/retry.test.js",
        "import assert from 'node:assert';\n\nassert.ok(true, 'looks fine to me');\n",
      );
    },
  },
];

function write(root, rel, contents) {
  const full = join(root, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, contents);
}

async function cmdDemo(root) {
  mkdirSync(root, { recursive: true });
  say();
  say(c.bold("  quirq demo") + c.dim(`  ${root}`));
  say(c.dim("  a real workspace: files are written, hashed, and checked."));

  const settled = [];

  for (const spec of DEMO_UNITS) {
    if (spec.seed) spec.seed(root);

    // S0: the world before the agent touches it.
    const before = snapshotDir(root);
    const startedAt = new Date().toISOString();
    const startedHr = Date.now();

    // The agent works. Only its effect on the world is ever consulted.
    spec.work(root);

    // S1: the world after it reports done.
    const after = snapshotDir(root);
    const diff = diffSnapshots(before, after);
    const checks = evaluateChecks(root, spec.checks, before, after);

    const unit = settleUnit({
      ...spec,
      createdAt: startedAt,
      settledAt: new Date().toISOString(),
      checks,
      cost: withMeasuredCompute(
        spec.cost,
        Math.max((Date.now() - startedHr) / 1000, 0.001),
      ),
      snapshots: {
        before: { count: before.count, bytes: before.bytes },
        after: { count: after.count, bytes: after.bytes },
        diff,
        provenance: { compute: "measured", inference: "declared" },
      },
    });

    const entry = await recordUnit(root, unit);
    settled.push(unit);
    printUnit(unit, entry);
  }

  const entries = readLedger(root);
  printReport(settled, await verifyChain(entries));
  say(c.dim(`  ledger written to ${join(root, QUIRQ_DIR, LEDGER)}`));
  say();
}

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

const USAGE = `quirq — the output meter for agentic work

  quirq demo [dir]        run a sample workspace end to end
  quirq begin <spec.json> capture S0 and open a unit
  quirq settle            capture S1, score, mint, record
  quirq report [dir]      portfolio metrics over the ledger
  quirq verify [dir]      recompute the hash chain from genesis
`;

async function main(argv) {
  const [command, ...rest] = argv;
  const root = resolve(rest[0] ?? process.cwd());

  switch (command) {
    case "demo":
      return cmdDemo(resolve(rest[0] ?? join(process.cwd(), "quirq-demo")));
    case "begin":
      if (!rest[0]) throw new Error("usage: quirq begin <spec.json>");
      return cmdBegin(process.cwd(), resolve(rest[0]));
    case "settle":
      return cmdSettle(process.cwd());
    case "report": {
      const entries = readLedger(root);
      return printReport(
        entries.map((e) => e.record),
        await verifyChain(entries),
      );
    }
    case "verify": {
      const entries = readLedger(root);
      const verdict = await verifyChain(entries);
      say(
        verdict.valid
          ? c.green(
              `chain verified: ${verdict.length} entries, head ${verdict.head.slice(0, 16)}`,
            )
          : c.red(`chain BROKEN at entry #${verdict.firstBreak}`),
      );
      if (!verdict.valid) process.exitCode = 1;
      return undefined;
    }
    default:
      say(USAGE);
      if (command && command !== "help" && command !== "--help") process.exitCode = 1;
      return undefined;
  }
}

main(process.argv.slice(2)).catch((error) => {
  say(c.red(`quirq: ${error.message}`));
  process.exitCode = 1;
});
