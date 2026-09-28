/**
 * The tamper-evident ledger.
 *
 * History is a hash chain, so it is tamper-evident by recomputation: anyone
 * holding the records can recompute every link and compare, rather than
 * trusting whoever served them. That is the whole property, and it is why the
 * dashboard re-verifies in the browser instead of displaying a stored "valid"
 * flag.
 *
 * Isomorphic: uses globalThis.crypto.subtle, which is present in Node 18+ and
 * every browser. No node:crypto import, so the web app can call this directly.
 */

const GENESIS = "0".repeat(64);

/**
 * Deterministic JSON: object keys sorted at every depth.
 *
 * Load-bearing. JSON.stringify preserves insertion order, so two records with
 * identical content but different key order would hash differently and the
 * chain would appear broken for a reason that has nothing to do with tamper.
 */
export function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;

  const keys = Object.keys(value).sort();
  const parts = keys
    // undefined is not representable in JSON; drop those keys entirely so a
    // round-trip through JSON.parse produces an identical canonical form.
    .filter((key) => value[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`);

  return `{${parts.join(",")}}`;
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * hash_n = SHA256(hash_{n-1} + canonical(record_n))
 *
 * The previous hash is inside the preimage, which is what chains the entries:
 * editing any earlier record changes every hash after it.
 */
export function linkHash(prevHash, record) {
  return sha256Hex(prevHash + canonicalize(record));
}

/** Append a settled unit, returning the sealed entry. */
export async function appendEntry(entries, record) {
  const prevHash = entries.length ? entries[entries.length - 1].hash : GENESIS;
  const seq = entries.length;
  const body = { seq, prevHash, record };
  const hash = await linkHash(prevHash, body);
  return { ...body, hash };
}

/**
 * Recompute the whole chain from genesis and report the first break.
 *
 * The walk carries the RECOMPUTED hash forward, not the stored one. That is
 * what makes tampering cascade: editing record n makes its own hash mismatch,
 * and because every later entry's prevHash points at the stored value it no
 * longer matches what the chain actually computes, so the whole tail is
 * orphaned. Chaining on the stored hash instead would quietly contain the
 * damage to a single row, which is precisely the property we do not want.
 *
 * Returns every entry's verdict rather than a boolean, so a dashboard can
 * show which link failed and why.
 */
export async function verifyChain(entries) {
  const results = [];
  let expectedPrev = GENESIS;
  let firstBreak = null;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const linkOk = entry.prevHash === expectedPrev;
    const seqOk = entry.seq === i;
    const recomputed = await linkHash(entry.prevHash, {
      seq: entry.seq,
      prevHash: entry.prevHash,
      record: entry.record,
    });
    const hashOk = recomputed === entry.hash;
    const ok = linkOk && seqOk && hashOk;

    if (!ok && firstBreak === null) firstBreak = i;

    results.push({
      seq: entry.seq,
      ok,
      linkOk,
      seqOk,
      hashOk,
      hash: entry.hash,
      recomputed,
    });

    expectedPrev = recomputed;
  }

  return {
    valid: firstBreak === null,
    firstBreak,
    length: entries.length,
    head: entries.length ? entries[entries.length - 1].hash : GENESIS,
    results,
  };
}

/** Parse a JSONL ledger file body into entries. */
export function parseLedger(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`ledger line ${i + 1} is not valid JSON: ${error.message}`);
      }
    });
}

/** Serialise entries back to JSONL. */
export function serialiseLedger(entries) {
  return entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n";
}

export { GENESIS };
