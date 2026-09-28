/**
 * Engine tests, run with `node --test lib/quirq/` (node:test is built in, so
 * this adds no dependency to a repo that deliberately has none).
 *
 * The whitepaper's worked examples are the fixtures. If the engine stops
 * reproducing them, either the engine broke or the paper was revised, and
 * both are worth failing over.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  bridgeMetrics,
  costTotal,
  mint,
  portfolioMetrics,
  scoreUnit,
  settleUnit,
  unitMetrics,
} from "./engine.mjs";
import {
  appendEntry,
  canonicalize,
  parseLedger,
  serialiseLedger,
  verifyChain,
} from "./ledger.mjs";

const near = (actual, expected, epsilon = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < epsilon, `expected ${expected}, got ${actual}`);

/* The support ticket: three weighted checks, the third fails. */
const TICKET_CHECKS = [
  { id: "status-closed", weight: 0.5, passed: true },
  { id: "reply-sent", weight: 0.3, passed: true },
  { id: "kb-linked", weight: 0.2, passed: false },
];

/* The same ticket's metered cost. */
const TICKET_COST = {
  inference: [
    { model: "primary", tokens: 38_000, pricePerMillion: 2 },
    { model: "classifier", tokens: 4_000, pricePerMillion: 0.25 },
  ],
  compute: [{ kind: "cpu", seconds: 90, ratePerHour: 0.04 }],
  api: [{ service: "crm", calls: 2, pricePerCall: 0.01 }],
  environment: { fixedCost: 0.03, unitsHosted: 1 },
};

test("scoring reproduces the worked ticket: V = 0.8", () => {
  const { V, weightSum, passedWeight } = scoreUnit(TICKET_CHECKS);
  near(V, 0.8);
  near(weightSum, 1.0);
  near(passedWeight, 0.8);
});

test("scoring is invariant to unnormalised weights", () => {
  // Same ratios, scaled by 10: the denominator is the weight sum.
  const scaled = TICKET_CHECKS.map((c) => ({ ...c, weight: c.weight * 10 }));
  near(scoreUnit(scaled).V, 0.8);
});

test("scoring rejects non-positive weights", () => {
  assert.throws(
    () => scoreUnit([{ id: "x", weight: 0, passed: true }]),
    /weights must be > 0/,
  );
});

test("divisible settlement mints V * B", () => {
  near(mint({ V: 0.8, budget: 4, settlement: "divisible" }).Q, 3.2);
});

test("atomic settlement mints nothing below tau", () => {
  const under = mint({ V: 0.8, budget: 4, tau: 1, settlement: "atomic" });
  near(under.Q, 0);
  assert.equal(under.done, false);

  const complete = mint({ V: 1, budget: 4, tau: 1, settlement: "atomic" });
  near(complete.Q, 4);
  assert.equal(complete.done, true);
});

test("all-in cost reproduces the worked ticket: $0.128", () => {
  const { total, breakdown } = costTotal(TICKET_COST);
  near(breakdown.inference, 0.077);
  near(breakdown.compute, 0.001);
  near(breakdown.api, 0.02);
  near(breakdown.environment, 0.03);
  near(total, 0.128);
});

test("compute rates convert hours to seconds (the 3600x trap)", () => {
  // 90 seconds at $0.04/hr is a tenth of a cent, not $3.60.
  near(
    costTotal({ compute: [{ kind: "cpu", seconds: 90, ratePerHour: 0.04 }] }).total,
    0.001,
  );
});

test("intervention converts minutes to hours", () => {
  // The whitepaper's quarter prices 312 h at $10 = $3,120.
  const cost = costTotal({ intervention: { minutes: 312 * 60, loadedRatePerHour: 10 } });
  near(cost.total, 3120);
});

test("unit metrics reproduce the worked ticket at V = 1", () => {
  const { costPerQuirq, margin, multiple } = unitMetrics({ Q: 4, cost: 0.128 });
  near(costPerQuirq, 0.032);
  near(margin, 3.872); // the paper displays $3.87
  near(multiple, 31.25); // the paper displays 31x
});

test("incomplete work is more expensive per quirq", () => {
  // The incentive has to point the right way: V = 0.8 costs more per quirq.
  const complete = unitMetrics({ Q: 4, cost: 0.128 }).costPerQuirq;
  const partial = unitMetrics({ Q: 3.2, cost: 0.128 }).costPerQuirq;
  near(complete, 0.032);
  near(partial, 0.04);
  assert.ok(partial > complete);
});

test("cost per quirq is null, not Infinity, when nothing minted", () => {
  const { costPerQuirq, margin } = unitMetrics({ Q: 0, cost: 0.128 });
  assert.equal(costPerQuirq, null);
  near(margin, -0.128);
});

test("settleUnit runs the whole lifecycle", () => {
  const unit = settleUnit({
    id: "u-1",
    title: "Resolve support ticket",
    owner: "ops@example.com",
    budget: 4,
    tau: 1,
    settlement: "divisible",
    checks: TICKET_CHECKS,
    cost: TICKET_COST,
  });

  near(unit.V, 0.8);
  near(unit.Q, 3.2);
  near(unit.cost, 0.128);
  near(unit.costPerQuirq, 0.04);
  assert.equal(unit.done, false); // V < tau, so it counts as an intervention
  assert.equal(unit.checks.length, 3);
});

test("meter separation: token volume cannot change Q", () => {
  const base = {
    id: "u",
    title: "t",
    owner: "o",
    budget: 100,
    checks: [{ id: "c", weight: 1, passed: true }],
  };
  const cheap = settleUnit({
    ...base,
    cost: { inference: [{ model: "m", tokens: 1e3, pricePerMillion: 2 }] },
  });
  const profligate = settleUnit({
    ...base,
    cost: { inference: [{ model: "m", tokens: 1e9, pricePerMillion: 2 }] },
  });

  near(cheap.Q, 100);
  near(profligate.Q, 100); // identical: inference only reaches the cost side
  assert.ok(profligate.cost > cheap.cost);
});

test("portfolio metrics reproduce the worked quarter's June column", () => {
  // June: 38,000 minted against $6,830 all-in gives QER 5.6x and cq 0.18.
  const june = portfolioMetrics(
    [
      {
        Q: 38_000,
        potential: 41_300,
        cost: 6_830,
        V: 1,
        tau: 1,
        checks: [],
      },
    ],
    { windowDays: 30 },
  );

  near(june.minted, 38_000);
  near(june.cost, 6_830);
  assert.equal(june.qer.toFixed(1), "5.6");
  assert.equal(june.costPerQuirq.toFixed(2), "0.18");
  near(june.velocityPerDay, 38_000 / 30);
});

test("intervention rate counts V < tau units and ranks the failing checks", () => {
  const failing = {
    Q: 3.2,
    potential: 4,
    cost: 0.128,
    V: 0.8,
    tau: 1,
    checks: TICKET_CHECKS,
  };
  const passing = {
    Q: 4,
    potential: 4,
    cost: 0.128,
    V: 1,
    tau: 1,
    checks: TICKET_CHECKS.map((c) => ({ ...c, passed: true })),
  };

  const metrics = portfolioMetrics([failing, failing, passing, passing]);
  near(metrics.interventionRate, 0.5);
  assert.equal(metrics.interventions, 2);
  // The diagnosis arrives attached: kb-linked is the check worth hardening.
  assert.equal(metrics.failingChecks[0].id, "kb-linked");
  assert.equal(metrics.failingChecks[0].count, 2);
});

test("empty portfolio returns nulls rather than NaN", () => {
  const empty = portfolioMetrics([]);
  assert.equal(empty.qer, null);
  assert.equal(empty.interventionRate, null);
  assert.equal(empty.count, 0);
});

test("bridge metrics reproduce ~169 quirqs per kWh", () => {
  const bridge = bridgeMetrics({
    minted: 148_000,
    tokens: 2.1e9,
    joulesPerToken: 1.5,
  });
  near(bridge.kwh, 875);
  assert.equal(Math.round(bridge.quirqsPerKwh), 169);
});

/* ---------------------------------------------------------------- *
 * Ledger
 * ---------------------------------------------------------------- */

test("canonicalize is key-order independent", () => {
  assert.equal(canonicalize({ b: 1, a: 2 }), canonicalize({ a: 2, b: 1 }));
  assert.equal(canonicalize({ a: { d: 1, c: 2 } }), '{"a":{"c":2,"d":1}}');
});

test("canonicalize drops undefined so JSON round-trips are stable", () => {
  const value = { a: 1, b: undefined };
  assert.equal(canonicalize(value), canonicalize(JSON.parse(JSON.stringify(value))));
});

test("a freshly built chain verifies", async () => {
  const entries = [];
  for (let i = 0; i < 4; i += 1) {
    entries.push(await appendEntry(entries, { id: `u-${i}`, Q: i }));
  }

  const verdict = await verifyChain(entries);
  assert.equal(verdict.valid, true);
  assert.equal(verdict.firstBreak, null);
  assert.equal(verdict.length, 4);
});

test("editing a record breaks its link and every link after it", async () => {
  const entries = [];
  for (let i = 0; i < 4; i += 1) {
    entries.push(await appendEntry(entries, { id: `u-${i}`, Q: i }));
  }

  // Inflate a minted amount in place, exactly the tamper the chain exists to catch.
  entries[1] = { ...entries[1], record: { ...entries[1].record, Q: 9_999 } };

  const verdict = await verifyChain(entries);
  assert.equal(verdict.valid, false);
  assert.equal(verdict.firstBreak, 1);
  assert.equal(verdict.results[1].hashOk, false);
  assert.equal(verdict.results[0].ok, true); // history before the edit still stands
  assert.equal(verdict.results[2].linkOk, false); // and everything after is orphaned
});

test("ledger survives a JSONL round trip", async () => {
  const entries = [await appendEntry([], { id: "u-0", Q: 1 })];
  const reparsed = parseLedger(serialiseLedger(entries));
  assert.deepEqual(reparsed, entries);
  assert.equal((await verifyChain(reparsed)).valid, true);
});
