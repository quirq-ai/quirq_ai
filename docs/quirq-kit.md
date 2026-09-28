# The quirq kit

The repository contains a reference measurement engine, a CLI, a browser demo
and local workspace telemetry. It also serves the xo-space product installer.
These have distinct data sources and responsibilities; the reference engine is
not the xo-space product runtime.

## Layout

| File                              | Environment | What it is                                                                                |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `lib/quirq/engine.mjs`            | isomorphic  | The calculus: scoring, the mint rule, the cost model, unit and portfolio metrics          |
| `lib/quirq/ledger.mjs`            | isomorphic  | The hash chain: canonical JSON, linking, verification                                     |
| `lib/quirq/snapshot.mjs`          | node only   | Filesystem snapshots, the diff, and the check predicates                                  |
| `lib/quirq/cli.mjs`               | node only   | The `quirq` command                                                                       |
| `lib/quirq/*.d.mts`               | types       | Declarations for the ESM engine modules                                                   |
| `lib/quirq/workspace.mjs`         | isomorphic  | In-memory demo workspace with real hashing and check evaluation                           |
| `lib/quirq/session.mjs`           | browser     | Visitor demo ledger persistence in localStorage                                           |
| `app/demo/mint.tsx`               | browser     | Scripted work demo using the shared measurement engine                                    |
| `lib/quirq/sample-ledger.json`    | data        | Generated reference ledger from scripted scratch-workspace runs                           |
| `scripts/build-sample-ledger.mjs` | node only   | Regenerates that ledger                                                                   |
| `app/install/route.ts`            | server      | Serves a POSIX bootstrap that downloads xo-space's native installer and runs it with Bash |
| `app/api/quirq-state/route.ts`    | server      | Read-only workspace telemetry for `/dashboard`                                            |
| `app/api/instance/route.ts`       | server      | Retained HTTP proxy to a locally hosted instance                                          |

### Why `.mjs` and not TypeScript

The shared calculation modules run under bare Node for the CLI and in the browser
demo. They use ESM JavaScript with adjacent `.d.mts` declarations, consumed by
TypeScript through the `@/` alias. This keeps one implementation across both
runtimes without requiring a separate compile step for the CLI.

The split between `engine.mjs` and `snapshot.mjs` is load-bearing: the web app
must never pull in `node:fs`. Anything touching the filesystem lives in
`snapshot.mjs`, used by the CLI and the sample-ledger generator.

## Commands

```text
pnpm quirq demo [dir]        run a sample workspace end to end
pnpm quirq begin <spec.json> capture S0 and open a unit
pnpm quirq settle            capture S1, score, mint, record
pnpm quirq report [dir]      portfolio metrics over the ledger
pnpm quirq verify [dir]      recompute the hash chain from genesis
```

`begin` and `settle` are the real two-phase flow: `begin` content-addresses
every file under the working directory and stores that as S0, you (or your
agent) do the work, and `settle` re-snapshots, evaluates the definition of
done against the after-state, meters the cost, mints, and appends to
`.quirq/ledger.jsonl`.

## What is actually verified

The score is a property of the world, not of a report. `snapshot.mjs` hashes
file contents (not mtimes, so a rewrite with identical bytes correctly reads
as unchanged), and the check predicates only ever look at captured state:

- `fileExists` — the path is present in the after-snapshot
- `fileMatches` — the file's contents match a regular expression
- `surfaceIntact` — the guarded paths are byte-identical between S0 and S1

`surfaceIntact` is the interesting one. Editing the test instead of fixing the
code is the single gaming attack the whitepaper calls fully mechanical, and
this is the mechanical counter: the verification surface is itself under state
comparison, so an agent that rewrites its own checks fails the unit even
though every other check goes green. The demo's third unit does exactly this
and mints zero.

## Cost provenance

Records carry `snapshots.provenance`. The CLI measures compute seconds itself
and marks them `measured`; inference token counts are supplied by whatever ran
the work and are marked `declared`, because the CLI calls no model. Preserve
those labels in ledger output and any future UI consuming it. The current
dashboard reads workspace usage telemetry, not this reference ledger.

## The ledger

JSONL, one entry per line:

```text
{ "seq": 0, "prevHash": "000...", "record": { ...SettledUnit }, "hash": "a5ad..." }
```

`hash = SHA256(prevHash + canonicalize({seq, prevHash, record}))`.

Two things matter in `verifyChain`:

1. It walks forward from genesis carrying the **recomputed** hash, not the
   stored one. That is what makes tampering cascade: editing record _n_ breaks
   its own hash and orphans every entry after it. Chaining on the stored hash
   would quietly contain the damage to one row, which defeats the point.
2. `canonicalize` sorts object keys at every depth and drops `undefined`.
   `JSON.stringify` preserves insertion order, so without this two records
   with identical content but different key order would hash differently and
   the chain would read as broken for a reason unrelated to tamper.

## Known gaps carried from the paper

Recorded here so nobody rediscovers them as bugs:

- **`QER*` sign.** As written, the audit correction `QER* = QER(1 - A)` with
  `A = E[V_gold - V]` makes farmed checks _raise_ the corrected figure, which
  contradicts the paper's own reading rule. Not implemented; it needs gold
  checks held outside the environment, which a demo does not have.
- **`cost per quirq` when `Q = 0`.** Undefined in the paper. The engine
  returns `null`, not `Infinity`, so it cannot be silently averaged into a
  portfolio figure.
- **Table 1's `+81%`** is a rounded-display artifact; the exact QER growth is
  `+77.1%`. The site quotes the paper's figure when quoting the paper.
- **Units matter.** QER is dimensionless; cost per quirq is currency per unit,
  and the energy bridge is quirqs/kWh. Per-token energy varies widely between
  deployments, so the energy bridge is an order-of-magnitude estimate.

## Tests

```bash
pnpm test
```

`node --test` runs `lib/quirq/*.test.mjs`. The measurement fixtures include the
whitepaper's worked examples:
the support ticket's `V = 0.8` and `$0.128` all-in cost, `cq = 0.032` and the
`31x` multiple at `V = 1`, June's `QER 5.6x`, and `169 quirqs/kWh`. If those
stop reproducing, either the engine broke or the paper was revised. Workspace
tests also cover the browser demo's snapshot, predicate and settlement flow.
Run `pnpm check` and `pnpm build` for the complete repository checks.

## Bundlers can break a hash chain

A previous dashboard imported `lib/quirq/sample-ledger.json` as a JSON module.
Turbopack re-serialized a stored `0.20426093667038198` as `0.204260936670382`,
changing the canonical form and its digest. The current dashboard does not import
that sample, but the generator preserves the fix for future consumers.

`scripts/build-sample-ledger.mjs` therefore rounds every number to 6 decimals
**before** hashing, via `roundDeep`. This avoids the observed precision rewrite.
Do not remove that rounding, and if you ever hash
data that reaches the browser as a JSON module, assume the bundler may rewrite
its floats.

(Ledgers written by the CLI keep full precision. They are read from disk as
bytes and never pass through a bundler, so the problem does not arise.)

## Workspace dashboard and retained instance API

`/dashboard` loads `/api/quirq-state`. The handler reads workspace state from
`QUIRQ_DIR`, or defaults to `../.quirq` relative to the running app. It returns
typed folder, activity, session and usage data defined in `lib/quirq/folder.ts`.
It never writes watcher-owned files. Missing or partially written data produces
an absent or partial snapshot rather than invented statistics.

Reading is enabled in development. A production server returns an absent root
unless `QUIRQ_DIR` explicitly opts it into a chosen directory. `secrets.env` and
other environment files outside the `runtime.env` / `roots.env` allowlist are
listed but never opened. Preserve those guards and the UI's masked state.

The watcher directory is separate from the site's committed `.quirq/journeys`
content library. Journey API writes are development-only; published definitions
travel with the app. Do not point cleanup scripts at either directory based on
ordinary import analysis.

`/api/instance?endpoint=<url>` remains an independent published route. It checks
HTTP(S) and its local-host allowlist, requests the instance's `/api/quirq`, and
uses a four-second timeout. It resolves the host from the web server's machine.
The previous client probe and connection panel were unused and removed; the
current dashboard does not call this endpoint. `lib/quirq/instance.ts` now contains
only the byte and age formatting helpers used by the dashboard.

Keep environment telemetry and settled work separate: activity counts, tokens
and a running watcher do not establish a verified outcome or minted value.

## Product installer

`app/install/route.ts` serves the POSIX bootstrap behind
`curl -fsSL https://quirq.ai/install | sh`. It downloads `install.sh` from
`quirq-ai/xo-space` into a temporary file, checks the download succeeded and is
nonempty, then runs that file with Bash. The default ref is `main`;
`QUIRQ_SOURCE_REF` can select another branch, tag or commit after validation.
Arguments, the current workspace and the installer's exit status are preserved.
The temporary file is removed when the bootstrap exits.

The upstream installer owns setup: it prepares uv and a Python 3.12 virtual
environment, installs the Python requirements, configures workspace/state roots
and runs the native server in the foreground. The default UI is
`http://localhost:5002/space/`; Ctrl-C stops it. The website bootstrap does not
manage containers or install this repository's reference measurement CLI. See
the upstream [installation guide](https://github.com/quirq-ai/xo-space/blob/main/INSTALLATION.md).

`tests/install-bootstrap.test.mjs` checks the exact response script under POSIX
sh with a mocked download and harmless fixture installer. It covers partial and
empty downloads, source-ref validation, argument/workspace preservation, exit
status and temporary-file cleanup without running the real installer.

## Regenerating the sample ledger

```bash
pnpm sample-ledger
```

Writes `lib/quirq/sample-ledger.json` from filesystem operations against a scratch
workspace. The actor is scripted: this is the whitepaper's **mock mode**, which
tests the measurement machinery and cannot validate claims about real agents.
The browser demo likewise uses staged files and scripted edits with real hashing,
checks and ledger arithmetic. Preserve this distinction whenever either result
is shown. The current dashboard consumes neither demo ledger.
