/**
 * A simulated workspace, for minting your first quirq in a browser tab.
 *
 * THE LINE BETWEEN REAL AND STAGED, because the whole product claim rests on
 * it and a demo that blurs it is worse than no demo:
 *
 *   STAGED  the files, and the "agent" that edits them. There is no repo and
 *           no model. `runAgent` is a scripted editor with two behaviours.
 *   REAL    everything downstream. Files are hashed with SHA-256 via Web
 *           Crypto, the definition of done is evaluated against the captured
 *           after-state, and scoring, minting and the hash chain are the same
 *           engine.mjs and ledger.mjs the CLI runs.
 *
 * So the arithmetic and the verification are not simulated: only the world
 * they are pointed at is. Keep that split, and keep saying so on the page.
 *
 * Isomorphic and dependency-free. The node CLI has its own filesystem
 * equivalent in snapshot.mjs; this is the in-memory twin.
 */

/* ------------------------------------------------------------------ *
 * The starting workspace
 * ------------------------------------------------------------------ */

/**
 * Deliberately documents rather than code: a work item is not an engineering
 * concept, and the flow should read to whoever actually owns the outcome.
 *
 * `acceptance.md` is the owner's, and the worker is never asked to touch it.
 * That separation is load-bearing: guarding a file the unit also requires the
 * worker to change fails the unit for the wrong reason.
 */
export const INITIAL_FILES = {
  "proposal.md": "# Q3 pricing proposal\n\nDraft. Nothing agreed yet.\n",
  "notes/customer-calls.md":
    "- Northwind wants annual billing\n- Initech pushed back on the per-seat price\n",
  "acceptance.md":
    "# Acceptance checklist (owner)\n\n- [ ] A pricing table the sales team can quote from\n- [ ] The risks we are accepting, written down\n",
};

/** The file the owner authored and the worker must not rewrite. */
export const GUARDED_PATH = "acceptance.md";

/* ------------------------------------------------------------------ *
 * Snapshots: real SHA-256 over the file contents
 * ------------------------------------------------------------------ */

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Content-address every file. Hashing content rather than a timestamp means a
 * file rewritten with identical bytes correctly reads as unchanged, and any
 * real edit is caught.
 */
export async function snapshotFiles(files) {
  const paths = Object.keys(files).sort();
  const entries = await Promise.all(
    paths.map(async (path) => [path, await sha256Hex(files[path])]),
  );

  return {
    files: Object.fromEntries(entries),
    count: paths.length,
    bytes: paths.reduce((sum, path) => sum + files[path].length, 0),
    capturedAt: new Date().toISOString(),
  };
}

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

  return { added, modified, removed };
}

/* ------------------------------------------------------------------ *
 * The definition of done
 * ------------------------------------------------------------------ */

/**
 * Each criterion the owner writes becomes a decidable predicate over the
 * captured after-state. Nothing here can consult the worker.
 */
export const PREDICATES = {
  /** The named file mentions every one of these phrases. */
  mentions: (spec, files) => {
    const text = (files[spec.path] ?? "").toLowerCase();
    const missing = spec.phrases.filter((p) => !text.includes(p.toLowerCase()));
    return {
      passed: missing.length === 0 && spec.path in files,
      evidence: !(spec.path in files)
        ? `${spec.path} is missing`
        : missing.length === 0
          ? `${spec.path} covers ${spec.phrases.join(", ")}`
          : `${spec.path} never mentions ${missing.join(", ")}`,
    };
  },

  /**
   * The guarded file is byte-identical across the unit.
   *
   * This is the check that closes the one gaming attack that is fully
   * mechanical: moving the goalposts instead of doing the work. Rewriting the
   * acceptance checklist to delete a requirement fails the unit even when
   * every other criterion has gone green.
   */
  unchanged: (spec, files, before, after) => {
    const moved = before.files[spec.path] !== after.files[spec.path];
    return {
      passed: !moved,
      evidence: moved
        ? `${spec.path} was rewritten during the unit`
        : `${spec.path} is byte-identical to the snapshot`,
    };
  },
};

/** Evaluate the definition of done against the captured after-state. */
export function evaluateChecks(checks, files, before, after) {
  return checks.map((check) => {
    const predicate = PREDICATES[check.predicate];
    if (!predicate) {
      throw new Error(`unknown predicate "${check.predicate}" on "${check.id}"`);
    }
    const { passed, evidence } = predicate(check, files, before, after);
    return {
      id: check.id,
      description: check.description ?? null,
      weight: check.weight,
      passed,
      evidence,
    };
  });
}

/* ------------------------------------------------------------------ *
 * The scripted worker
 * ------------------------------------------------------------------ */

const PRICING_TABLE = `
## Pricing

| Plan  | Seats | Annual |
|-------|-------|--------|
| Team  | 25    | $12k   |
| Scale | 100   | $38k   |
`;

const RISKS = `
## Risks we are accepting

- Initech may churn if the per-seat price holds.
- Annual billing shifts revenue recognition into Q4.
`;

/**
 * Two behaviours, both of which a real agent exhibits:
 *
 *   diligent  does the work the checklist asks for and leaves the checklist
 *             alone.
 *   shortcut  writes the easy half, then edits the owner's checklist to
 *             delete the part it did not do, and reports success.
 *
 * The shortcut run is the one worth watching. Its remaining checks go green,
 * and it still mints nothing under atomic settlement, because the guarded
 * file moved.
 */
export function runAgent(files, mode) {
  const next = { ...files };

  if (mode === "shortcut") {
    next["proposal.md"] = `# Q3 pricing proposal\n${PRICING_TABLE}\nLooks good to me.\n`;
    // Moving the goalposts: the risks requirement is deleted from the
    // owner's checklist rather than satisfied.
    next[GUARDED_PATH] =
      "# Acceptance checklist (owner)\n\n- [x] A pricing table the sales team can quote from\n";
    return next;
  }

  next["proposal.md"] =
    `# Q3 pricing proposal\n${PRICING_TABLE}\n${RISKS}\nReady for review.\n`;
  return next;
}

/**
 * The worker takes one todo and either does it or only says it did.
 *
 * `honest` writes something into the document that satisfies the todo's own
 * "done when it mentions ..." phrase. `!honest` reports done and changes
 * nothing that matters, which is the whole demonstration: the claim and the
 * world disagree, and only one of them is hashed.
 */
export function applyTodo(files, todo, honest) {
  const next = { ...files };

  if (honest) {
    next["proposal.md"] =
      (files["proposal.md"] ?? "") + `\n## ${todo.phrase}\n\nDrafted.\n`;
    return next;
  }

  // The claim goes in the worker's own log and the document is left alone.
  //
  // It must not write the todo's title into the document: a title like "write
  // down the risks" contains the very phrase the check looks for, so a worker
  // that merely narrates itself would satisfy the check without doing the
  // work. That is check farming, and it is exactly what this page exists to
  // show being caught rather than an accident to leave lying around.
  next["worker.log"] = (files["worker.log"] ?? "") + `reported done: ${todo.id}\n`;
  return next;
}

/**
 * The single check a todo compiles to.
 *
 * It looks for a `## <phrase>` heading, not a bare mention, and that is not
 * cosmetic. The starting document is titled "Q3 pricing proposal", so a
 * case-insensitive search for "Pricing" is already satisfied before anyone has
 * done anything: the check would be green at S0 and a worker that did nothing
 * would still be paid. A heading only exists if something wrote it.
 *
 * The general lesson holds outside this demo: a definition of done that is
 * already true of the before-state is not a definition of done.
 */
export function todoCheck(todo) {
  return {
    id: todo.id,
    description: `Done when the proposal has a "${todo.phrase}" section`,
    predicate: "mentions",
    path: "proposal.md",
    phrases: [`## ${todo.phrase}`],
    weight: 1,
  };
}
