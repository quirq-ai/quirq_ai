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
    '[ -n "${HOME:-}" ] || fail "HOME must be set."',
    'RUN_DIR="$(pwd -P)"',
    'case "${QUIRQ_INSTALL_DIR:-}" in',
    '  "") INSTALL_DIR="$RUN_DIR/xo-space" ;;',
    '  /*) INSTALL_DIR="$QUIRQ_INSTALL_DIR" ;;',
    '  *) INSTALL_DIR="$RUN_DIR/$QUIRQ_INSTALL_DIR" ;;',
    "esac",
    '[ "$INSTALL_DIR" != "/" ] || fail "QUIRQ_INSTALL_DIR cannot be the filesystem root."',
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
    '[ -f "$INSTALL_DIR/compose.local.yml" ] || fail "The xo-space checkout has no Compose file."',
    'command -v docker >/dev/null 2>&1 || fail "Docker is required to start Quirq."',
    'docker info >/dev/null 2>&1 || fail "Docker is not running."',
    "",
    'cd "$INSTALL_DIR"',
    "printf '\\nStopping existing Quirq containers...\\n'",
    "docker stop quirq >/dev/null 2>&1 || true",
    "docker compose -f compose.local.yml down --remove-orphans >/dev/null 2>&1 || true",
    "",
    "printf 'Starting Quirq from %s...\\n\\n' \"$INSTALL_DIR\"",
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
