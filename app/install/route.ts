/**
 * Bootstrapper behind `curl -fsSL quirq.ai/install | sh`.
 *
 * It fetches xo-space's install.sh and runs it, and does nothing else. The
 * installer owns the checkout, the Python environment, the configuration and
 * the server; duplicating any of that here would put the same logic on two
 * release cycles, where the copy served by this site can silently fall behind
 * the copy in the repository.
 *
 * The one-liner is advertised with `| sh`, so this script stays POSIX. The
 * installer needs Bash — it uses BASH_SOURCE and `set -o pipefail` — so it is
 * handed to `bash` explicitly rather than inherited into `sh`.
 */
export const dynamic = "force-static";

export const INSTALL_SCRIPT =
  [
    "#!/bin/sh",
    "# Download the xo-space installer, then run it. Everything the install",
    "# actually does lives in that script, not in this one.",
    "set -eu",
    "",
    "# Serves the installer from one branch and tells the installer to clone the",
    "# same one, so QUIRQ_SOURCE_REF=development moves the whole install together.",
    'REF="${QUIRQ_SOURCE_REF:-main}"',
    'INSTALL_URL="https://raw.githubusercontent.com/quirq-ai/xo-space/${REF}/install.sh"',
    "",
    "fail() {",
    "  printf '\\nquirq: %s\\n' \"$*\" >&2",
    "  exit 1",
    "}",
    "",
    "require_command() {",
    '  command -v "$1" >/dev/null 2>&1 || fail "$2"',
    "}",
    "",
    "cat <<'QUIRQ_BANNER'",
    "   ____   _   _   ___   ____    ____",
    "  / __ \\ | | | | |_ _| |  _ \\  / __ \\",
    " | |  | || | | |  | |  | |_) || |  | |",
    " | |__| || |_| |  | |  |  _ < | |__| |",
    "  \\___\\_\\ \\___/  |___| |_| \\_\\ \\___\\_\\",
    "QUIRQ_BANNER",
    "",
    'require_command curl "curl is required to download the Quirq installer."',
    'require_command bash "Bash is required to run the Quirq installer."',
    "",
    "# Written to a file rather than piped straight into bash. A transfer that",
    "# drops halfway would otherwise hand bash a truncated script and it would",
    "# run what arrived, and this leaves the terminal on the installer's stdin.",
    'TMP="$(mktemp "${TMPDIR:-/tmp}/quirq-install.XXXXXX")" ||',
    '  fail "Could not create a temporary file."',
    "trap 'rm -f \"$TMP\"' EXIT INT TERM",
    "",
    "printf '\\nFetching the Quirq installer (%s)...\\n' \"$REF\"",
    'curl -fsSL "$INSTALL_URL" -o "$TMP" ||',
    '  fail "Could not download $INSTALL_URL"',
    '[ -s "$TMP" ] || fail "The downloaded installer is empty."',
    "",
    "# The installer reads this too, so the branch that served it is the branch",
    "# it goes on to clone.",
    'export QUIRQ_SOURCE_REF="$REF"',
    "",
    '# Not exec: the trap above still has a temporary file to remove afterwards.',
    'bash "$TMP"',
  ].join("\n") + "\n";

export function GET() {
  return new Response(INSTALL_SCRIPT, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": 'inline; filename="quirq-install.sh"',
      "Cache-Control": "public, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
