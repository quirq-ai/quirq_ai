/**
 * Bootstrapper behind `curl -fsSL quirq.ai/install | sh`.
 *
 * Clone the source once, then let the repository's Docker Compose launcher
 * build and start Quirq directly from that checkout.
 */
export const dynamic = "force-dynamic";

export const INSTALL_SCRIPT =
  [
    "#!/bin/sh",
    "# Clone xo-space and start its Docker Compose stack.",
    "set -eu",
    "",
    "REPO_URL='https://github.com/quirq-ai/xo-space.git'",
    "",
    "fail() {",
    "  printf '\\nquirq: %s\\n' \"$*\" >&2",
    "  exit 1",
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
    'command -v git >/dev/null 2>&1 || fail "Git is required to download Quirq."',
    'command -v bash >/dev/null 2>&1 || fail "Bash is required to start Quirq."',
    "",
    'if [ -d "$INSTALL_DIR/.git" ]; then',
    "  printf '\\nUsing the existing Quirq checkout at %s.\\n' \"$INSTALL_DIR\"",
    'elif [ -e "$INSTALL_DIR" ]; then',
    '  fail "Install path exists but is not an xo-space checkout: $INSTALL_DIR"',
    "else",
    '  mkdir -p "$(dirname "$INSTALL_DIR")"',
    "  printf '\\nCloning Quirq into %s...\\n' \"$INSTALL_DIR\"",
    '  git clone "$REPO_URL" "$INSTALL_DIR"',
    "fi",
    "",
    '[ -f "$INSTALL_DIR/quirq" ] || fail "The xo-space checkout has no quirq launcher."',
    "",
    "# The previous installer used a standalone container on the same port.",
    'if [ "$(docker inspect --format \'{{ index .Config.Labels "io.quirq.managed" }}\' quirq 2>/dev/null || true)" = "true" ]; then',
    "  printf '\\nStopping the previous Quirq container...\\n'",
    "  docker stop quirq >/dev/null",
    "fi",
    "",
    "printf '\\nStarting Quirq from the cloned repository...\\n\\n'",
    'cd "$INSTALL_DIR"',
    "exec bash ./quirq",
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
