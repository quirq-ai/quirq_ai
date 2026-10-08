import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import test from "node:test";
import ts from "typescript";

// Exercise the exact response script. Only the harmless local fixture below
// can be downloaded; the real installer and network are never invoked.
const source = readFileSync(new URL("../app/install/route.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { GET, INSTALL_SCRIPT } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const MOCK_CURL = `#!/bin/sh
set -eu
output=''
url=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) output="$2"; shift 2 ;;
    --proto) shift 2 ;;
    -*) shift ;;
    *) url="$1"; shift ;;
  esac
done
printf '%s' "$url" > "$FIXTURE_URL_FILE"
if [ "\${FIXTURE_EMPTY:-0}" = 1 ]; then
  : > "$output"
else
  cat "$FIXTURE_PAYLOAD" > "$output"
fi
exit "\${FIXTURE_DOWNLOAD_STATUS:-0}"
`;

const FIXTURE_INSTALLER = `#!/usr/bin/env bash
set -eu
printf '%s\\0' "$@" > "$FIXTURE_RECEIPT"
printf '%s' "$PWD" > "$FIXTURE_CWD_FILE"
printf '%s' "\${QUIRQ_SOURCE_REF:-main}" > "$FIXTURE_REF_FILE"
exit "\${FIXTURE_INSTALL_STATUS:-0}"
`;

function bootstrap(t, { args = [], env = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), "quirq-bootstrap-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  const temporaryFiles = join(root, "temporary files");
  mkdirSync(bin);
  mkdirSync(temporaryFiles);
  const payload = join(root, "fixture.sh");
  const receipt = join(root, "receipt");
  const url = join(root, "url");
  const cwd = join(root, "cwd");
  const ref = join(root, "ref");
  writeFileSync(join(bin, "curl"), MOCK_CURL, { mode: 0o755 });
  writeFileSync(payload, FIXTURE_INSTALLER);

  const result = spawnSync("/bin/sh", ["-s", "--", ...args], {
    input: INSTALL_SCRIPT,
    encoding: "utf8",
    cwd: root,
    timeout: 5000,
    env: {
      PATH: [bin, "/usr/bin", "/bin"].join(delimiter),
      TMPDIR: temporaryFiles,
      FIXTURE_PAYLOAD: payload,
      FIXTURE_RECEIPT: receipt,
      FIXTURE_URL_FILE: url,
      FIXTURE_CWD_FILE: cwd,
      FIXTURE_REF_FILE: ref,
      ...env,
    },
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  assert.deepEqual(readdirSync(temporaryFiles), [], "temporary installer is removed");
  return { result, root, receipt, url, cwd, ref };
}

test("install route preserves its shell response contract", async () => {
  const response = GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/x-shellscript; charset=utf-8");
  assert.equal(
    response.headers.get("content-disposition"),
    'inline; filename="quirq-install.sh"',
  );
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(await response.text(), INSTALL_SCRIPT);
});

test("POSIX bootstrap downloads main, forwards literal arguments and keeps the workspace", (t) => {
  const args = ["--example", "space stays together", "$(not-a-command)", ""];
  const { result, root, receipt, url, cwd } = bootstrap(t, { args });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(url, "utf8"),
    "https://raw.githubusercontent.com/quirq-ai/xo-space/main/install.sh",
  );
  assert.deepEqual(readFileSync(receipt, "utf8").split("\0").slice(0, -1), args);
  assert.equal(realpathSync(readFileSync(cwd, "utf8")), realpathSync(root));
});

test("a failed partial download never runs its contents", (t) => {
  const { result, receipt } = bootstrap(t, { env: { FIXTURE_DOWNLOAD_STATUS: "22" } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Could not download/);
  assert.equal(existsSync(receipt), false);
});

test("an empty successful download is refused", (t) => {
  const { result, receipt } = bootstrap(t, { env: { FIXTURE_EMPTY: "1" } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /installer is empty/);
  assert.equal(existsSync(receipt), false);
});

test("the installer exit status reaches the caller after cleanup", (t) => {
  const { result, receipt } = bootstrap(t, { env: { FIXTURE_INSTALL_STATUS: "37" } });
  assert.equal(result.status, 37);
  assert.equal(existsSync(receipt), true);
});

test("a requested source branch reaches both the download URL and installer", (t) => {
  const branch = "feature/native-install";
  const { result, url, ref } = bootstrap(t, { env: { QUIRQ_SOURCE_REF: branch } });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(url, "utf8"),
    `https://raw.githubusercontent.com/quirq-ai/xo-space/${branch}/install.sh`,
  );
  assert.equal(readFileSync(ref, "utf8"), branch);
});

test("invalid source refs are rejected before download or execution", (t) => {
  for (const ref of [
    "../other",
    "main?download=1",
    "main#fragment",
    "branch with spaces",
    "/main",
    "-main",
  ]) {
    const { result, url, receipt } = bootstrap(t, { env: { QUIRQ_SOURCE_REF: ref } });
    assert.notEqual(result.status, 0, ref);
    assert.match(result.stderr, /QUIRQ_SOURCE_REF/);
    assert.equal(existsSync(url), false);
    assert.equal(existsSync(receipt), false);
  }
});
