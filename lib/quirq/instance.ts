/** Display helpers shared by the workspace dashboard and its charts. */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Seconds since a timestamp, for a "last seen" that does not lie by rounding. */
export function secondsSince(iso: string, now = Date.now()): number | null {
  const then = Date.parse(iso);
  return Number.isNaN(then) ? null : Math.max(0, Math.round((now - then) / 1000));
}

export function formatAgo(iso: string | null | undefined, now = Date.now()): string {
  // Several instance timestamps are genuinely null (a contract file that
  // exists but has never been written), so this has to absorb that rather
  // than render "NaN ago".
  if (!iso) return "unknown";
  const seconds = secondsSince(iso, now);
  if (seconds === null) return "unknown";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}
