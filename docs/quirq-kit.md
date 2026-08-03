# The quirq kit

The engine, the CLI, and the installer behind `curl -fsSL quirq.ai/install | sh`.

This is a reference implementation of the whitepaper's calculus, built so the
site can demonstrate a real mint rather than an animation. It is not the
product runtime.

## Layout

| File | Environment | What it is |
|---|---|---|
| `lib/quirq/engine.mjs` | isomorphic | The calculus: scoring, the mint rule, the cost model, unit and portfolio metrics |
| `lib/quirq/ledger.mjs` | isomorphic | The hash chain: canonical JSON, linking, verification |
| `lib/quirq/snapshot.mjs` | node only | Filesystem snapshots, the diff, and the check predicates |
| `lib/quirq/cli.mjs` | node only | The `quirq` command |
| `lib/quirq/*.d.ts` | types | Hand-written declarations for the site |
| `lib/quirq/sample-ledger.json` | data | 34 entries from a real run, read by `/dashboard` |
| `scripts/build-sample-ledger.mjs` | node only | Regenerates that ledger |
| `app/install/route.ts` | build time | Serves a shim that fetches and runs xo-space's `install.sh` |

### Why `.mjs` and not TypeScript

One file has to run under bare `node` for the CLI and be imported by the Next
app. This repo has no `tsx` or `ts-node` and deliberately carries almost no
tooling dependencies, and Node 23.3 cannot execute `.ts` directly. So the
engine ships as ESM JavaScript with hand-written `.d.ts` beside it, which the
app consumes through the `@/` alias with full types. Verified: `@/lib/quirq/engine.mjs`
typechecks under `moduleResolution: "bundler"`.

The split between `engine.mjs` and `snapshot.mjs` is load-bearing: the web app
must never pull in `node:fs`. Anything touching the filesystem lives in
`snapshot.mjs`, which only the CLI imports.

## Commands

```
quirq demo [dir]        run a sample workspace end to end
quirq begin <spec.json> capture S0 and open a unit
quirq settle            capture S1, score, mint, record
quirq report [dir]      portfolio metrics over the ledger
quirq verify [dir]      recompute the hash chain from genesis
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
the work and are marked `declared`, because the CLI calls no model. The
dashboard surfaces that distinction rather than presenting both as if they
were measured. Keep it that way: this is a measurement product and the
provenance of its own numbers is not a detail.

## The ledger

JSONL, one entry per line:

```json
{ "seq": 0, "prevHash": "000...", "record": { ...SettledUnit }, "hash": "a5ad..." }
```

`hash = SHA256(prevHash + canonicalize({seq, prevHash, record}))`.

Two things matter in `verifyChain`:

1. It walks forward from genesis carrying the **recomputed** hash, not the
   stored one. That is what makes tampering cascade: editing record *n* breaks
   its own hash and orphans every entry after it. Chaining on the stored hash
   would quietly contain the damage to one row, which defeats the point.
2. `canonicalize` sorts object keys at every depth and drops `undefined`.
   `JSON.stringify` preserves insertion order, so without this two records
   with identical content but different key order would hash differently and
   the chain would read as broken for a reason unrelated to tamper.

## Known gaps carried from the paper

Recorded here so nobody rediscovers them as bugs:

- **`QER*` sign.** As written, the audit correction `QER* = QER(1 - A)` with
  `A = E[V_gold - V]` makes farmed checks *raise* the corrected figure, which
  contradicts the paper's own reading rule. Not implemented; it needs gold
  checks held outside the environment, which a demo does not have.
- **`cost per quirq` when `Q = 0`.** Undefined in the paper. The engine
  returns `null`, not `Infinity`, so it cannot be silently averaged into a
  portfolio figure.
- **Table 1's `+81%`** is a rounded-display artifact; the exact QER growth is
  `+77.1%`. The site quotes the paper's figure when quoting the paper.
- **Bridge metrics are not dimensionless**, unlike QER and cost per quirq, and
  per-token energy varies widely between deployments. Treat quirqs/kWh as an
  order of magnitude.

## Tests

```bash
pnpm test
```

`node --test` over `lib/quirq/*.test.mjs`, using Node's built-in runner so the
repo gains no dependency. The fixtures are the whitepaper's worked examples:
the support ticket's `V = 0.8` and `$0.128` all-in cost, `cq = 0.032` and the
`31x` multiple at `V = 1`, June's `QER 5.6x`, and `169 quirqs/kWh`. If those
stop reproducing, either the engine broke or the paper was revised.

## Bundlers can break a hash chain

Found the hard way. `lib/quirq/sample-ledger.json` is imported as a JSON
module, and Turbopack re-serializes it: a stored `0.20426093667038198` came
back as `0.204260936670382`. That is a different double, so the canonical form
differed, so the digest differed, and the dashboard correctly reported a broken
chain over data nobody had touched.

`scripts/build-sample-ledger.mjs` therefore rounds every number to 6 decimals
**before** hashing, via `roundDeep`. Values that short round-trip through any
serializer unchanged, so the chain verifies identically in node, in the
browser, and after bundling. Do not remove that rounding, and if you ever hash
data that reaches the browser as a JSON module, assume the bundler may rewrite
its floats.

(Ledgers written by the CLI keep full precision. They are read from disk as
bytes and never pass through a bundler, so the problem does not arise.)

## Connecting to a live instance

`/dashboard` can reach a machine-local quirq instance (XO Space) and report
its status. Three pieces:

| File | What it is |
|---|---|
| `app/api/instance/route.ts` | Same-origin proxy to the instance's `/api/quirq` |
| `lib/quirq/instance.ts` | Types transcribed from a live payload, the client, and `healthOf` |
| `app/dashboard/*` | The connect panel and the instance view |

**Why a proxy.** Space answers `/api/quirq` with
`access-control-allow-credentials` but no `access-control-allow-origin`, so a
browser fetch straight from this site is blocked. Verified in the browser, not
assumed: the direct fetch throws `TypeError: Failed to fetch`. Server to server
has no such restriction.

**The proxy only reaches loopback.** A proxy that fetches whatever it is handed
is an SSRF hole, letting anyone who can reach the route use the server to probe
networks the browser cannot see. The instance is machine-local by definition,
so the allowlist is loopback and everything else is refused with a reason
before a socket opens. There is also a 4s timeout, because a wrong port
otherwise hangs the panel until the platform's own limit and reads as a broken
page.

**This is the one dynamic route on an otherwise fully static site.** It only
works when the site and the instance run on the same machine, which is the
local case it exists for. Deployed anywhere else it fails to connect and the
dashboard says so.

**An instance is not a ledger.** The payload describes the environment that
would do the metering (where its root is, whether it can write, whether the
watcher is running, which projects report) and contains no settled work. Keep
the two apart in the UI: instance figures must never be folded into the ledger
metrics.

**Sensitive rows.** `tree` marks `secrets.env` with `sensitive: true` and the
API masks the values. Render the row as masked and never imply a value is
available.

## Regenerating the sample ledger

```bash
pnpm sample-ledger
```

Writes `lib/quirq/sample-ledger.json` from real runs against a scratch
workspace, seeded so the output is reproducible. The agent is a script, which
is the whitepaper's **mock mode**: it validates the machinery and cannot
validate claims about real agents. The dashboard says so on the page. Do not
drop that label.
