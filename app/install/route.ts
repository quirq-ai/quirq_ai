/**
 * POSIX bootstrap behind `curl -fsSL https://quirq.ai/install | sh`.
 *
 * xo-space owns native setup and process lifecycle. Download its installer
 * completely before handing it to Bash; keep this public shim small.
 */
export const dynamic = "force-dynamic";

export const INSTALL_SCRIPT =
  [
    "#!/bin/sh",
    "set -eu",
    "",
    "fail() {",
    "  printf '\\nquirq: %s\\n' \"$*\" >&2",
    "  exit 1",
    "}",
    "",
    'command -v curl >/dev/null 2>&1 || fail "curl is required to download Quirq."',
    'command -v bash >/dev/null 2>&1 || fail "Bash is required to run the Quirq installer."',
    "",
    'QUIRQ_BOOTSTRAP_REF="${QUIRQ_SOURCE_REF:-main}"',
    'case "$QUIRQ_BOOTSTRAP_REF" in',
    "  *[!a-zA-Z0-9._/-]*|/*|*/|*//*|*..*|.*|-*)",
    '    fail "QUIRQ_SOURCE_REF must be a branch, tag or commit without URL or path traversal characters." ;;',
    "esac",
    'export QUIRQ_SOURCE_REF="$QUIRQ_BOOTSTRAP_REF"',
    "",
    'QUIRQ_BOOTSTRAP_FILE="$(mktemp "${TMPDIR:-/tmp}/quirq-install.XXXXXX")" || fail "Could not create an installer temporary file."',
    "trap 'rm -f \"$QUIRQ_BOOTSTRAP_FILE\"' 0",
    "trap 'exit 129' HUP",
    "trap 'exit 130' INT",
    "trap 'exit 143' TERM",
    "",
    'curl -fsSL --proto "=https" --tlsv1.2 -o "$QUIRQ_BOOTSTRAP_FILE" \\',
    '  "https://raw.githubusercontent.com/quirq-ai/xo-space/${QUIRQ_BOOTSTRAP_REF}/install.sh" \\',
    '  || fail "Could not download the Quirq installer. Nothing was run."',
    '[ -s "$QUIRQ_BOOTSTRAP_FILE" ] || fail "The downloaded Quirq installer is empty. Nothing was run."',
    "",
    "QUIRQ_BOOTSTRAP_STATUS=0",
    'bash "$QUIRQ_BOOTSTRAP_FILE" "$@" || QUIRQ_BOOTSTRAP_STATUS=$?',
    'exit "$QUIRQ_BOOTSTRAP_STATUS"',
  ].join("\n") + "\n";

export function GET() {
  return new Response(INSTALL_SCRIPT, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": 'inline; filename="quirq-install.sh"',
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
