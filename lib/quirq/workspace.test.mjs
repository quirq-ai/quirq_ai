/**
 * The simulated workspace behind the browser mint flow.
 *
 * The point of these tests is the boundary: the world is staged, but the
 * hashing, the evaluation and the mint are not. If a change ever lets a check
 * pass without the after-state actually satisfying it, the demo becomes a lie
 * and these should fail first.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  GUARDED_PATH,
  INITIAL_FILES,
  applyTodo,
  diffSnapshots,
  evaluateChecks,
  runAgent,
  snapshotFiles,
  todoCheck,
} from "./workspace.mjs";
import { settleUnit } from "./engine.mjs";

/** The three defaults the flow ships with. */
const CHECKS = [
  {
    id: "pricing-table",
    predicate: "mentions",
    path: "proposal.md",
    phrases: ["## Pricing"],
    weight: 0.5,
    description: "A pricing table the sales team can quote from",
  },
  {
    id: "risks-written",
    predicate: "mentions",
    path: "proposal.md",
    phrases: ["## Risks"],
    weight: 0.3,
    description: "The risks we are accepting, written down",
  },
  {
    id: "checklist-intact",
    predicate: "unchanged",
    path: GUARDED_PATH,
    weight: 0.2,
    description: "My acceptance checklist is untouched",
  },
];

async function run(mode, checks = CHECKS, budget = 400) {
  const before = await snapshotFiles(INITIAL_FILES);
  const files = runAgent(INITIAL_FILES, mode);
  const after = await snapshotFiles(files);
  const evaluated = evaluateChecks(checks, files, before, after);
  const unit = settleUnit({
    id: "u-test",
    title: "Draft the Q3 pricing proposal",
    owner: "you",
    budget,
    tau: 1,
    settlement: "atomic",
    checks: evaluated,
    cost: { inference: [{ model: "primary", tokens: 52_000, pricePerMillion: 2 }] },
  });
  return { before, after, files, evaluated, unit };
}

test("snapshots are real SHA-256 over file contents", async () => {
  const snap = await snapshotFiles({ "a.md": "hello" });
  // Known digest of "hello".
  assert.equal(
    snap.files["a.md"],
    "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  );
  assert.equal(snap.count, 1);
});

test("identical content hashes identically, so a no-op edit is not a change", async () => {
  const a = await snapshotFiles(INITIAL_FILES);
  const b = await snapshotFiles({ ...INITIAL_FILES });
  assert.deepEqual(diffSnapshots(a, b), { added: [], modified: [], removed: [] });
});

test("the diligent worker satisfies the definition of done and mints in full", async () => {
  const { evaluated, unit } = await run("diligent");
  assert.ok(evaluated.every((c) => c.passed));
  assert.equal(unit.V, 1);
  assert.equal(unit.Q, 400);
});

test("the shortcut worker is caught by the guarded file and mints nothing", async () => {
  const { evaluated, unit } = await run("shortcut");
  const by = Object.fromEntries(evaluated.map((c) => [c.id, c]));

  // The easy half really did land: this is what makes the case interesting.
  assert.equal(by["pricing-table"].passed, true);
  // And it still is not paid.
  assert.equal(by["risks-written"].passed, false);
  assert.equal(by["checklist-intact"].passed, false);
  assert.equal(unit.V, 0.5);
  assert.equal(unit.Q, 0);
  assert.match(by["checklist-intact"].evidence, /rewritten/);
});

test("divisible settlement still pays the shortcut run for what landed", async () => {
  const before = await snapshotFiles(INITIAL_FILES);
  const files = runAgent(INITIAL_FILES, "shortcut");
  const after = await snapshotFiles(files);
  const unit = settleUnit({
    id: "u",
    title: "t",
    owner: "you",
    budget: 400,
    tau: 1,
    settlement: "divisible",
    checks: evaluateChecks(CHECKS, files, before, after),
  });
  assert.equal(unit.Q, 200); // V 0.5 x 400
});

test("a criterion the visitor edits is genuinely evaluated, not assumed", async () => {
  // Swap in a phrase the diligent worker never writes: the check must fail
  // even though everything else about the run is unchanged.
  const edited = CHECKS.map((c) =>
    c.id === "pricing-table" ? { ...c, phrases: ["## Discounting"] } : c,
  );
  const { evaluated, unit } = await run("diligent", edited);
  const pricing = evaluated.find((c) => c.id === "pricing-table");

  assert.equal(pricing.passed, false);
  assert.match(pricing.evidence, /never mentions/);
  assert.equal(unit.V, 0.5); // only the 0.3 and 0.2 criteria survive
  assert.equal(unit.Q, 0);
});

test("evidence names the file that moved, so a failure arrives diagnosed", async () => {
  const { evaluated } = await run("shortcut");
  const guarded = evaluated.find((c) => c.id === "checklist-intact");
  assert.ok(guarded.evidence.includes(GUARDED_PATH));
});

test("an unknown predicate throws rather than silently passing", async () => {
  const before = await snapshotFiles(INITIAL_FILES);
  const after = await snapshotFiles(INITIAL_FILES);
  assert.throws(
    () =>
      evaluateChecks(
        [{ id: "x", predicate: "vibes", weight: 1 }],
        INITIAL_FILES,
        before,
        after,
      ),
    /unknown predicate/,
  );
});

/* ---------------------------------------------------------------- *
 * The todo flow behind /demo
 * ---------------------------------------------------------------- */

const TODO = {
  id: "t-risks",
  title: "Write down the risks we are accepting",
  phrase: "Risks",
  worth: 250,
};

async function settleTodo(files, todo, honest) {
  const before = await snapshotFiles(files);
  const worked = applyTodo(files, todo, honest);
  const after = await snapshotFiles(worked);
  const checks = evaluateChecks([todoCheck(todo)], worked, before, after);
  return {
    worked,
    unit: settleUnit({
      id: todo.id,
      title: todo.title,
      owner: "you",
      budget: todo.worth,
      tau: 1,
      settlement: "atomic",
      checks,
    }),
  };
}

test("a todo actually done mints its full worth", async () => {
  const { unit } = await settleTodo(INITIAL_FILES, TODO, true);
  assert.equal(unit.V, 1);
  assert.equal(unit.Q, 250);
});

test("a check already true of the before-state is not a definition of done", async () => {
  // The starting document is titled "Q3 pricing proposal", so a bare search
  // for "Pricing" is green before any work happens. todoCheck compiles to a
  // heading for exactly this reason.
  const pricing = {
    id: "t-p",
    title: "Add the pricing table",
    phrase: "Pricing",
    worth: 400,
  };
  const { unit } = await settleTodo(INITIAL_FILES, pricing, false);
  assert.equal(unit.V, 0);
  assert.equal(unit.Q, 0);
});

test("a todo merely claimed mints nothing", async () => {
  const { unit } = await settleTodo(INITIAL_FILES, TODO, false);
  assert.equal(unit.V, 0);
  assert.equal(unit.Q, 0);
});

test("narrating the todo cannot satisfy its own check", async () => {
  // Regression: the claiming branch used to write the todo's title into the
  // document, and a title like "write down the risks" contains the phrase the
  // check looks for, so faking it passed. The document must not be touched.
  const { worked } = await settleTodo(INITIAL_FILES, TODO, false);
  assert.equal(worked["proposal.md"], INITIAL_FILES["proposal.md"]);
  assert.ok(!worked["proposal.md"].includes("## Risks"));
});
