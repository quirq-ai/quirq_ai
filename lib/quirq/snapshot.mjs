/**
 * The environment: real filesystem snapshots and real check evaluation.
 *
 * This is the half that makes a quirq mintable at all. The score has to be a
 * property of the world, computed from state the environment captured itself,
 * never from the worker's account of what it did. So: hash every file before
 * execution, hash every file after, and evaluate the definition of done
 * against the after-snapshot.
 *
 * Node-only (imports node:fs). The web app must never import this module;
 * it imports engine.mjs and ledger.mjs, which are isomorphic.
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".xo",
  "dist",
  "build",
  ".quirq",
  ".venv",
  "__pycache__",
]);

/**
 * Content-address every file under `root`.
 *
 * Returns { files: { relPath: sha256 }, count, bytes }. Hashing content rather
 * than mtime means a file rewritten with identical bytes is correctly seen as
 * unchanged, and any real edit is caught.
 */
export function snapshotDir(root, { maxBytes = 2 * 1024 * 1024 } = {}) {
  const files = {};
  let count = 0;
  let bytes = 0;

  const walk = (dir) => {
    let dirents;
    try {
      dirents = readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // unreadable directory: absent from the snapshot, not fatal
    }

    for (const dirent of dirents) {
      if (dirent.name.startsWith(".") && dirent.name !== ".env.example") {
        if (dirent.isDirectory()) continue;
      }
      const full = join(dir, dirent.name);

      if (dirent.isDirectory()) {
        if (SKIP_DIRS.has(dirent.name)) continue;
        walk(full);
        continue;
      }
      if (!dirent.isFile()) continue;

      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.size > maxBytes) continue;

      const rel = relative(root, full).split(sep).join("/");
      files[rel] = createHash("sha256").update(readFileSync(full)).digest("hex");
      count += 1;
      bytes += stat.size;
    }
  };

  walk(root);
  return { files, count, bytes };
}

/** What actually changed between two snapshots. */
export function diffSnapshots(before, after) {
  const added = [];
  const modified = [];
  const removed = [];

  for (const [path, hash] of Object.entries(after.files)) {
    if (!(path in before.files)) added.push(path);
    else if (before.files[path] !== hash) modified.push(path);
  }
  for (const path of Object.keys(before.files)) {
    if (!(path in after.files)) removed.push(path);
  }

  return { added: added.sort(), modified: modified.sort(), removed: removed.sort() };
}

/* ------------------------------------------------------------------ *
 * Check predicates: decidable functions of a snapshot
 * ------------------------------------------------------------------ */

/**
 * Every predicate takes the captured after-state and returns
 * { passed, evidence }. Evidence is recorded in the ledger so a failure
 * arrives with its diagnosis rather than just a red mark.
 */
export const predicates = {
  /** The file exists in the after-snapshot. */
  fileExists: (root, spec, after) => {
    const passed = spec.path in after.files;
    return {
      passed,
      evidence: passed
        ? `${spec.path} present (sha256 ${after.files[spec.path].slice(0, 12)})`
        : `${spec.path} absent`,
    };
  },

  /** The file's contents match a regular expression. */
  fileMatches: (root, spec, after) => {
    if (!(spec.path in after.files)) {
      return { passed: false, evidence: `${spec.path} absent` };
    }
    let text;
    try {
      text = readFileSync(join(root, spec.path), "utf8");
    } catch (error) {
      return { passed: false, evidence: `${spec.path} unreadable: ${error.message}` };
    }
    const passed = new RegExp(spec.pattern, spec.flags ?? "").test(text);
    return {
      passed,
      evidence: passed
        ? `${spec.path} matches /${spec.pattern}/`
        : `${spec.path} does not match /${spec.pattern}/`,
    };
  },

  /**
   * The verification surface itself is unchanged across the unit.
   *
   * This is the check that closes the one gaming attack that is fully
   * mechanical: editing the test instead of fixing the code. The guarded
   * paths must be byte-identical between the before- and after-snapshot, so
   * an agent that rewrites its own checks fails the unit by construction
   * rather than passing it silently.
   */
  surfaceIntact: (root, spec, after, before) => {
    const changed = spec.paths.filter((path) => before.files[path] !== after.files[path]);
    return {
      passed: changed.length === 0,
      evidence:
        changed.length === 0
          ? `verification surface byte-identical (${spec.paths.length} guarded)`
          : `verification surface MUTATED: ${changed.join(", ")}`,
    };
  },
};

/** Evaluate a definition of done against the captured snapshots. */
export function evaluateChecks(root, checks, before, after) {
  return checks.map((check) => {
    const predicate = predicates[check.predicate];
    if (!predicate) {
      throw new Error(`unknown predicate "${check.predicate}" on check "${check.id}"`);
    }
    const { passed, evidence } = predicate(root, check, after, before);
    return {
      id: check.id,
      description: check.description ?? null,
      weight: check.weight,
      passed,
      evidence,
    };
  });
}
