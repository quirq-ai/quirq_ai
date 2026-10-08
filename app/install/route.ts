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
    "# Everything runs from one call on the last line, so a download cut short",
    "# runs nothing at all.",
    "quirq_bootstrap() {",
    '  command -v curl >/dev/null 2>&1 || fail "curl is required to download Quirq."',
    '  command -v bash >/dev/null 2>&1 || fail "Bash is required to run the Quirq installer."',
    "",
    '  QUIRQ_BOOTSTRAP_REF="${QUIRQ_SOURCE_REF:-main}"',
    '  case "$QUIRQ_BOOTSTRAP_REF" in',
    "    *[!a-zA-Z0-9._/-]*|/*|*/|*//*|*..*|.*|-*)",
    '      fail "QUIRQ_SOURCE_REF must be a branch or tag name without URL or path traversal characters." ;;',
    "  esac",
    '  export QUIRQ_SOURCE_REF="$QUIRQ_BOOTSTRAP_REF"',
    "",
    "  # A private directory, never a file in the shared temp dir: the installer",
    "  # looks beside itself for a checkout.",
    '  QUIRQ_BOOTSTRAP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/quirq-install.XXXXXX")" || fail "Could not create a private temporary directory for the installer."',
    '  QUIRQ_BOOTSTRAP_FILE="$QUIRQ_BOOTSTRAP_DIR/install.sh"',
    '  trap \'rm -f "$QUIRQ_BOOTSTRAP_FILE"; rmdir "$QUIRQ_BOOTSTRAP_DIR" 2>/dev/null || :\' 0',
    "  trap 'exit 129' HUP",
    "  trap 'exit 130' INT",
    "  trap 'exit 143' TERM",
    "",
    "  printf 'Downloading the Quirq installer (%s)...\\n' \"$QUIRQ_BOOTSTRAP_REF\"",
    '  curl -fsSL --proto "=https" --tlsv1.2 -o "$QUIRQ_BOOTSTRAP_FILE" \\',
    '    "https://raw.githubusercontent.com/quirq-ai/xo-space/${QUIRQ_BOOTSTRAP_REF}/install.sh" \\',
    '    || fail "Could not download the Quirq installer. Nothing was run."',
    '  [ -s "$QUIRQ_BOOTSTRAP_FILE" ] || fail "The downloaded Quirq installer is empty. Nothing was run."',
    "",
    "  QUIRQ_BOOTSTRAP_STATUS=0",
    '  bash "$QUIRQ_BOOTSTRAP_FILE" "$@" || QUIRQ_BOOTSTRAP_STATUS=$?',
    '  exit "$QUIRQ_BOOTSTRAP_STATUS"',
    "}",
    "",
    'quirq_bootstrap "$@"',
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
