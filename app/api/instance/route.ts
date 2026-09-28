import { NextRequest } from "next/server";

/**
 * Same-origin proxy to a machine-local quirq instance (XO Space).
 *
 * Why a proxy at all: the Space server answers /api/quirq without an
 * `access-control-allow-origin` header, so a browser fetch straight from this
 * site is blocked by CORS. Verified, not assumed. Server to server has no such
 * restriction, so the browser calls this route and this route calls Space.
 *
 * This public compatibility endpoint is useful when the site and instance
 * share a machine. It returns a structured connection failure if no local
 * instance is available; deployed clients must handle that state.
 */
export const dynamic = "force-dynamic";

/**
 * A proxy that fetches whatever it is told to fetch is an SSRF hole: anyone
 * who can reach this route could use the server as a probe into networks the
 * browser cannot see. The instance is machine-local by definition, so the
 * allowlist is loopback, and anything else is refused before a socket opens.
 */
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]", "::1", "0.0.0.0"]);

const TIMEOUT_MS = 4000;

function parseEndpoint(raw: string | null): { url: URL } | { error: string } {
  if (!raw) return { error: "No endpoint given." };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: `"${raw}" is not a URL.` };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: `${url.protocol} is not supported. Use http or https.` };
  }
  if (!LOOPBACK.has(url.hostname)) {
    return {
      error: `Only a local instance can be reached from here. "${url.hostname}" is not loopback.`,
    };
  }
  return { url };
}

export async function GET(request: NextRequest) {
  const parsed = parseEndpoint(request.nextUrl.searchParams.get("endpoint"));

  if ("error" in parsed) {
    return Response.json({ ok: false, reason: parsed.error }, { status: 400 });
  }

  const target = new URL("/api/quirq", parsed.url);
  const started = Date.now();

  // Without a timeout a wrong port hangs the panel on "connecting" until the
  // platform's own limit, which reads as a broken page rather than a refusal.
  const abort = AbortSignal.timeout(TIMEOUT_MS);

  try {
    const response = await fetch(target, {
      signal: abort,
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          reason: `${target.origin} answered ${response.status}.`,
          status: response.status,
        },
        { status: 502 },
      );
    }

    const payload = await response.json();

    return Response.json(
      { ok: true, endpoint: target.origin, latencyMs: Date.now() - started, payload },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return Response.json(
      {
        ok: false,
        reason: timedOut
          ? `${target.origin} did not answer within ${TIMEOUT_MS / 1000}s.`
          : `Could not reach ${target.origin}. Is the instance running?`,
      },
      { status: 504 },
    );
  }
}
