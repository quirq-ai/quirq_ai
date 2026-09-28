import type { Check } from "./engine.mjs";

export type Files = Record<string, string>;

export type Snapshot = {
  files: Record<string, string>;
  count: number;
  bytes: number;
  capturedAt: string;
};

export type Diff = {
  added: string[];
  modified: string[];
  removed: string[];
};

export type CheckSpec = {
  id: string;
  description?: string | null;
  weight: number;
} & (
  | { predicate: "mentions"; path: string; phrases: string[] }
  | { predicate: "unchanged"; path: string }
);

export type AgentMode = "diligent" | "shortcut";

export const INITIAL_FILES: Files;
export const GUARDED_PATH: string;

export function snapshotFiles(files: Files): Promise<Snapshot>;
export function diffSnapshots(before: Snapshot, after: Snapshot): Diff;
export function evaluateChecks(
  checks: CheckSpec[],
  files: Files,
  before: Snapshot,
  after: Snapshot,
): Check[];
export function runAgent(files: Files, mode: AgentMode): Files;

export type Todo = { id: string; title: string; phrase: string; worth: number };

export function applyTodo(files: Files, todo: Todo, honest: boolean): Files;
export function todoCheck(todo: Todo): CheckSpec;
