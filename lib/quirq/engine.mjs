/**
 * The quirq calculus. Dependency-free, isomorphic ESM.
 *
 * This is the whitepaper's Section 4 as executable code: scoring, the mint
 * rule, the all-in cost model, and the unit and portfolio metrics. Every
 * equation number in the comments refers to "quirq: A Unit of Work for
 * Intelligence" (draft v3), served at /whitepaper/pdf.
 *
 * Written as .mjs rather than .ts on purpose: the same file has to run under
 * bare `node` for the CLI without a TypeScript runner and be imported by the
 * Next app. Types live in engine.d.mts.
 *
 * Nothing here reads the filesystem, the network, or a clock, so it behaves
 * identically in the browser and in the CLI. Node-only concerns (snapshotting
 * real directories) live in snapshot.mjs, which the web app never imports.
 */

/* ------------------------------------------------------------------ *
 * 1 · Scoring — Equation (2)
 * ------------------------------------------------------------------ */

/**
 * V(u) = sum(w_i * g_i(S1)) / sum(w_i), in [0, 1].
 *
 * Each check's `passed` is evaluated against the captured after-state, never
 * against the worker's account of what it did. Weights need not be
 * normalised; the denominator is the weight sum.
 */
export function scoreUnit(checks) {
  if (!Array.isArray(checks) || checks.length === 0) {
    throw new Error("scoreUnit: a definition of done needs at least one check");
  }

  let weightSum = 0;
  let passedWeight = 0;

  for (const check of checks) {
    const weight = Number(check.weight);
    if (!(weight > 0)) {
      throw new Error(
        `scoreUnit: check "${check.id}" has weight ${check.weight}; weights must be > 0`,
      );
    }
    weightSum += weight;
    if (check.passed) passedWeight += weight;
  }

  return { V: passedWeight / weightSum, weightSum, passedWeight };
}

/* ------------------------------------------------------------------ *
 * 2 · The mint rule
 * ------------------------------------------------------------------ */

/**
 * Divisible:  Q = V * B
 * Atomic:     Q = B * [V >= tau]
 *
 * The settlement mode is declared by the owner at unit creation, not chosen
 * after the score is known. Atomic is the right default wherever partial
 * completion is genuinely worthless, and it is also what blocks salami
 * slicing (splitting one outcome into many units to harvest partial credit).
 */
export function mint({ V, budget, tau = 1, settlement = "divisible" }) {
  if (!(budget > 0)) throw new Error("mint: budget B must be > 0");
  if (V < 0 || V > 1) throw new Error(`mint: V must be in [0,1], got ${V}`);

  const done = V >= tau;
  const Q = settlement === "atomic" ? (done ? budget : 0) : V * budget;

  return { Q, done, potential: budget, settlement, tau };
}

/* ------------------------------------------------------------------ *
 * 3 · All-in cost — Equation (3)
 * ------------------------------------------------------------------ */

const SECONDS_PER_HOUR = 3600;
const MINUTES_PER_HOUR = 60;
const TOKENS_PER_MILLION = 1e6;

/**
 * C_total = inference + compute + API + storage + environment amortization
 *           + intervention.
 *
 * Rate units are explicit in the field names because the whitepaper quotes
 * compute per hour while metering seconds, which is exactly the kind of
 * mismatch that silently produces a 3600x error.
 *
 * The intervention term is the one most often omitted and it is the one that
 * matters most: an AI program whose every output needs twenty minutes of
 * senior review is paying its largest cost in a currency the token bill never
 * sees. Interventions are definitionally the V < tau events scoring already
 * counts, so this term cannot hide.
 */
export function costTotal(cost = {}) {
  const inference = (cost.inference ?? []).reduce(
    (sum, line) => sum + (line.tokens / TOKENS_PER_MILLION) * line.pricePerMillion,
    0,
  );

  const compute = (cost.compute ?? []).reduce(
    (sum, line) => sum + (line.seconds / SECONDS_PER_HOUR) * line.ratePerHour,
    0,
  );

  const api = (cost.api ?? []).reduce(
    (sum, line) => sum + line.calls * line.pricePerCall,
    0,
  );

  const storage = cost.storage ? cost.storage.gbMonths * cost.storage.ratePerGbMonth : 0;

  // F / N_units: the environment's own fixed cost, amortized over the units
  // it hosts. Guarded because a first run legitimately has unitsHosted = 0.
  const environment =
    cost.environment && cost.environment.unitsHosted > 0
      ? cost.environment.fixedCost / cost.environment.unitsHosted
      : 0;

  const intervention = cost.intervention
    ? (cost.intervention.minutes / MINUTES_PER_HOUR) * cost.intervention.loadedRatePerHour
    : 0;

  const total = inference + compute + api + storage + environment + intervention;

  return {
    total,
    breakdown: { inference, compute, api, storage, environment, intervention },
  };
}

/* ------------------------------------------------------------------ *
 * 4 · Unit metrics — Equation (4)
 * ------------------------------------------------------------------ */

/**
 * cost per quirq, quirq margin, and the multiple.
 *
 * cq and the multiple are undefined when Q = 0 (an atomic unit that came in
 * under tau). The whitepaper does not define this case; we return null rather
 * than Infinity so it cannot be averaged into a portfolio figure by accident.
 */
export function unitMetrics({ Q, cost }) {
  return {
    costPerQuirq: Q > 0 ? cost / Q : null,
    margin: Q - cost,
    multiple: cost > 0 ? Q / cost : null,
  };
}

/* ------------------------------------------------------------------ *
 * 5 · Portfolio metrics — Equations (5) (6) (7)
 * ------------------------------------------------------------------ */

/**
 * QER = sum(Q) / sum(C_total)   quirqs of verified work per all-in dollar
 * QV  = sum(Q) / |T|            value throughput, not task counts
 * IR  = |{u : V < tau}| / |U|   the trust signal
 *
 * QER is the headline and it is dimensionless, so it compares across teams,
 * vendors, models and currencies. IR arrives with its diagnosis attached
 * because failures localize to named checks; `failingChecks` is that
 * decomposition, ranked, which is what tells you the single check worth
 * hardening next.
 */
export function portfolioMetrics(units, { windowDays = null } = {}) {
  const count = units.length;

  if (count === 0) {
    return {
      count: 0,
      minted: 0,
      potential: 0,
      cost: 0,
      qer: null,
      costPerQuirq: null,
      velocityPerDay: null,
      interventionRate: null,
      interventions: 0,
      realisation: null,
      failingChecks: [],
    };
  }

  let minted = 0;
  let potential = 0;
  let cost = 0;
  let interventions = 0;
  const failures = new Map();

  for (const unit of units) {
    minted += unit.Q;
    potential += unit.potential;
    cost += unit.cost;

    // An intervention is definitionally a V < tau event, which is what makes
    // the rate free to measure rather than self-reported.
    if (unit.V < unit.tau) {
      interventions += 1;
      for (const check of unit.checks) {
        if (!check.passed) {
          const prior = failures.get(check.id) ?? { id: check.id, count: 0, weight: 0 };
          prior.count += 1;
          prior.weight += check.weight;
          failures.set(check.id, prior);
        }
      }
    }
  }

  const failingChecks = [...failures.values()].sort(
    (a, b) => b.count - a.count || b.weight - a.weight,
  );

  return {
    count,
    minted,
    potential,
    cost,
    qer: cost > 0 ? minted / cost : null,
    costPerQuirq: minted > 0 ? cost / minted : null,
    velocityPerDay: windowDays && windowDays > 0 ? minted / windowDays : null,
    interventionRate: interventions / count,
    interventions,
    // Minted over potential: the share of budgeted value that actually landed.
    realisation: potential > 0 ? minted / potential : null,
    failingChecks,
  };
}

/* ------------------------------------------------------------------ *
 * 6 · Settling a whole unit
 * ------------------------------------------------------------------ */

/**
 * The lifecycle in one call: score the captured state, mint against the
 * budget, meter the cost, and derive the unit metrics. Returns the record
 * that goes into the ledger.
 *
 * Note what is NOT an input: nothing the worker reports about itself. The
 * score comes from `checks` evaluated against the after-snapshot, and the
 * cost comes from metering. This is meter separation (Proposition 1) as an
 * API shape — token volume can only reach Q through the cost side.
 */
export function settleUnit(unit) {
  const { V, weightSum, passedWeight } = scoreUnit(unit.checks);
  const minted = mint({
    V,
    budget: unit.budget,
    tau: unit.tau ?? 1,
    settlement: unit.settlement ?? "divisible",
  });
  const cost = costTotal(unit.cost);
  const metrics = unitMetrics({ Q: minted.Q, cost: cost.total });

  return {
    id: unit.id,
    title: unit.title,
    owner: unit.owner,
    kind: unit.kind ?? null,
    createdAt: unit.createdAt ?? null,
    settledAt: unit.settledAt ?? null,
    V,
    weightSum,
    passedWeight,
    tau: minted.tau,
    settlement: minted.settlement,
    done: minted.done,
    potential: minted.potential,
    Q: minted.Q,
    cost: cost.total,
    costBreakdown: cost.breakdown,
    costPerQuirq: metrics.costPerQuirq,
    margin: metrics.margin,
    multiple: metrics.multiple,
    checks: unit.checks.map((c) => ({
      id: c.id,
      description: c.description ?? null,
      weight: c.weight,
      passed: Boolean(c.passed),
      evidence: c.evidence ?? null,
    })),
    snapshots: unit.snapshots ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * 7 · Bridge metrics — Equations (1) and (11)
 * ------------------------------------------------------------------ */

const JOULES_PER_KWH = 3.6e6;

/**
 * Quirqs per kWh, joining the value meter to the physical one.
 *
 * Deliberately NOT dimensionless (it is quirq-dollars per kWh), unlike QER
 * and cost per quirq. Per-token energy also varies widely between measured
 * deployments, so treat the output as an order-of-magnitude figure.
 */
export function bridgeMetrics({
  minted,
  tokens,
  joulesPerToken,
  gridIntensityKgPerKwh = null,
}) {
  const kwh = (tokens * joulesPerToken) / JOULES_PER_KWH;
  const co2Tonnes =
    gridIntensityKgPerKwh === null ? null : (kwh * gridIntensityKgPerKwh) / 1000;

  return {
    kwh,
    quirqsPerKwh: kwh > 0 ? minted / kwh : null,
    co2Tonnes,
    quirqsPerTonne: co2Tonnes && co2Tonnes > 0 ? minted / co2Tonnes : null,
  };
}

/* ------------------------------------------------------------------ *
 * 8 · Formatting helpers shared by the CLI and the dashboard
 * ------------------------------------------------------------------ */

export function formatMoney(value, digits = 2) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatQuirqs(value, digits = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
