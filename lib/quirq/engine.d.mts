/**
 * Types for engine.mjs. Hand-written because the engine ships as ESM
 * JavaScript so that one file can serve both `node` (the CLI) and the app.
 */

export type Settlement = "divisible" | "atomic";

export type Check = {
  id: string;
  description?: string | null;
  /** Must be > 0. Weights need not sum to 1. */
  weight: number;
  passed: boolean;
  /** Why the check landed the way it did; recorded in the ledger. */
  evidence?: string | null;
};

export type CostInput = {
  inference?: Array<{ model: string; tokens: number; pricePerMillion: number }>;
  compute?: Array<{ kind: "cpu" | "gpu"; seconds: number; ratePerHour: number }>;
  api?: Array<{ service: string; calls: number; pricePerCall: number }>;
  storage?: { gbMonths: number; ratePerGbMonth: number };
  /** F / N_units: the environment's fixed cost over the units it hosts. */
  environment?: { fixedCost: number; unitsHosted: number };
  intervention?: { minutes: number; loadedRatePerHour: number };
};

export type CostBreakdown = {
  inference: number;
  compute: number;
  api: number;
  storage: number;
  environment: number;
  intervention: number;
};

export type UnitInput = {
  id: string;
  title: string;
  owner: string;
  kind?: string | null;
  createdAt?: string | null;
  settledAt?: string | null;
  budget: number;
  tau?: number;
  settlement?: Settlement;
  checks: Check[];
  cost?: CostInput;
  snapshots?: unknown;
};

export type SettledUnit = {
  id: string;
  title: string;
  owner: string;
  kind: string | null;
  createdAt: string | null;
  settledAt: string | null;
  V: number;
  weightSum: number;
  passedWeight: number;
  tau: number;
  settlement: Settlement;
  done: boolean;
  potential: number;
  Q: number;
  cost: number;
  costBreakdown: CostBreakdown;
  /** null when Q = 0, which the whitepaper leaves undefined. */
  costPerQuirq: number | null;
  margin: number;
  multiple: number | null;
  checks: Required<Check>[];
  snapshots: unknown;
};

export type PortfolioMetrics = {
  count: number;
  minted: number;
  potential: number;
  cost: number;
  qer: number | null;
  costPerQuirq: number | null;
  velocityPerDay: number | null;
  interventionRate: number | null;
  interventions: number;
  realisation: number | null;
  failingChecks: Array<{ id: string; count: number; weight: number }>;
};

export function scoreUnit(
  checks: Array<{ id: string; weight: number; passed: boolean }>,
): {
  V: number;
  weightSum: number;
  passedWeight: number;
};

export function mint(args: {
  V: number;
  budget: number;
  tau?: number;
  settlement?: Settlement;
}): { Q: number; done: boolean; potential: number; settlement: Settlement; tau: number };

export function costTotal(cost?: CostInput): { total: number; breakdown: CostBreakdown };

export function unitMetrics(args: { Q: number; cost: number }): {
  costPerQuirq: number | null;
  margin: number;
  multiple: number | null;
};

export function portfolioMetrics(
  units: Array<Pick<SettledUnit, "Q" | "potential" | "cost" | "V" | "tau" | "checks">>,
  options?: { windowDays?: number | null },
): PortfolioMetrics;

export function settleUnit(unit: UnitInput): SettledUnit;

export function bridgeMetrics(args: {
  minted: number;
  tokens: number;
  joulesPerToken: number;
  gridIntensityKgPerKwh?: number | null;
}): {
  kwh: number;
  quirqsPerKwh: number | null;
  co2Tonnes: number | null;
  quirqsPerTonne: number | null;
};

export function formatMoney(value: number, digits?: number): string;
export function formatQuirqs(value: number, digits?: number): string;
