/**
 * The `.quirq` folder, typed.
 *
 * One workspace's `.quirq` directory is the watcher service's working memory:
 * live presence, usage telemetry, an append-only event log, and the
 * configuration that shaped them. These types are transcribed from the files
 * as the watcher writes them today, field names included, because the
 * dashboard's job is to show what is actually on disk rather than a cleaned-up
 * paraphrase of it. Where a file is snake_case the type is snake_case; where
 * the watcher wrote camelCase (sessions-augment.json) the type keeps that too.
 *
 * The reading happens in `app/api/quirq-state/route.ts`, the one place the
 * app touches the folder. Everything here is client-safe: types, the fetch
 * helper, and small pure formatters.
 */

/** One open session as the activity files record it. */
export type OpenSession = {
  session_id: string;
  runtime: string;
  /** A model id, e.g. "claude-fable-5". */
  agent: string;
  user_id: string;
  opened_at: string;
  last_activity_at: string;
  /** The workspace-scope file carries it; per-project files omit it. */
  project_id?: string;
};

/** `watcher/activity/workspace.json` and `watcher/activity/projects/<id>.json`. */
export type ActivitySnapshot = {
  schema: number;
  updated_at: string;
  open_sessions: OpenSession[];
};

export type TokenPair = { input: number; output: number };

/** One rolling window (7d/30d) or one runtime's totals in stats.json. */
export type StatsWindow = {
  tokens: TokenPair;
  by_model: Record<string, TokenPair>;
  by_tool: Record<string, number>;
  files_edited: number;
  sessions: number;
  active_minutes: number;
};

/** One session's row in stats.json `by_session`. */
export type SessionStats = {
  tokens: TokenPair;
  /** Project-relative paths of files this session edited. */
  files: string[];
  duration_ms: number;
  tools: Record<string, number>;
  by_model: Record<string, TokenPair>;
};

/** One day's row in stats.json `by_day`. Cache counts appear only here. */
export type DayStats = {
  tokens: TokenPair & { cache_read?: number; cache_write?: number };
  messages: {
    total: number;
    user: number;
    assistant: number;
    toolCalls: number;
    toolResults: number;
    errors: number;
  };
  by_model: Record<string, TokenPair & { count?: number }>;
  latency?: { count: number; sum_ms: number; min_ms: number; max_ms: number };
};

/** `watcher/workspace/stats.json`. */
export type FolderStats = {
  schema: number;
  updated_at: string;
  rolling: { "7d": StatsWindow | null; "30d": StatsWindow | null };
  by_session: Record<string, SessionStats>;
  by_runtime: Record<string, StatsWindow>;
  by_day: Record<string, DayStats>;
};

/** One line of `watcher/workspace/timeline.jsonl`. */
export type TimelineEvent = {
  ts: string;
  /** Observed today: "session.started", "file.edited". Open set. */
  type: string;
  session_id: string;
  runtime: string;
  project_id?: string;
  /** Present on file events; project-relative. */
  path?: string;
};

/** One session's row in `sessions/sessions-augment.json`. CamelCase is the
 *  file's own casing, and the two activity stamps are epoch milliseconds
 *  where everything else in the folder is ISO. Both quirks are preserved. */
export type SessionAugment = {
  messageCount: number;
  messageCountByRole: {
    user: number;
    assistant: number;
    toolResults: number;
    errors: number;
  };
  toolCallCount: number;
  taskCount: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
    cancelled: number;
    blocked: number;
  };
  firstActivity: number;
  lastActivity: number;
  ended_at: number | null;
  episode_refs: string[];
};

/** One entry of the recursive folder listing, depth-first. */
export type FolderNode = {
  /** Relative to the `.quirq` root, "/" separators. */
  path: string;
  name: string;
  depth: number;
  kind: "file" | "directory";
  /** Files: their size. Directories: the aggregate of everything inside. */
  bytes: number;
  /** Directories: direct children. Files: 0. */
  entries: number;
  modified_at: string;
  /** Credentials. The route lists the file but never reads it. */
  sensitive: boolean;
  /** What this path is for, where the contract knows. */
  note: string;
};

/** One boolean switch flattened out of xo.json's nested toggle groups. */
export type XoToggle = { path: string; enabled: boolean };

export type XoSummary = {
  /** Which agent runtime this scope runs, e.g. "claude_code". */
  agent: string | null;
  /** models.status.default, when the file carries a status block. */
  default_model: string | null;
  models: Array<{ id: string; status: string }>;
  toggles: XoToggle[];
};

/** `watcher/offsets.json`, summarised: the raw file is a map keyed by
 *  absolute session-log path, which is noise at folder scale. */
export type OffsetsSummary = {
  version: number;
  /** How many native session logs the watcher is tailing. */
  tracked: number;
  /** Total bytes consumed across every cursor. */
  consumed_bytes: number;
  /** Tracked logs grouped by their runtime project folder, largest first. */
  folders: Array<{ folder: string; files: number }>;
};

export type FolderPayload = {
  generated_at: string;
  root: { path: string; present: boolean };
  totals: { files: number; directories: number; bytes: number };
  tree: FolderNode[];
  state: {
    onboarding_completed: boolean;
    onboarding_completed_at: string | null;
  } | null;
  xo: XoSummary | null;
  runtime_env: Record<string, string> | null;
  offsets: OffsetsSummary | null;
  locks: string[];
  activity: {
    workspace: ActivitySnapshot | null;
    projects: Array<{ project_id: string; snapshot: ActivitySnapshot }>;
  };
  workspace: {
    schema: number;
    updated_at: string;
    projects_root: string;
    projects: string[];
  } | null;
  stats: FolderStats | null;
  timeline: {
    /** Lines in the whole file, not just the slice served. */
    total: number;
    by_type: Record<string, number>;
    /** The most recent events, in file order (oldest first). */
    events: TimelineEvent[];
  } | null;
  sessions_augment: {
    updated_at: string;
    sessions: Record<string, SessionAugment>;
  } | null;
};

export type FolderRead =
  | { ok: true; ms: number; payload: FolderPayload }
  | { ok: false; reason: string };

/**
 * Read the folder through the app's own route. Same-origin, snapshot
 * semantics: nothing polls, a refresh is the reader asking again.
 */
export async function readFolderState(): Promise<FolderRead> {
  const started = performance.now();
  try {
    const response = await fetch("/api/quirq-state", { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, reason: `The route answered ${response.status}.` };
    }
    const payload = (await response.json()) as FolderPayload;
    return { ok: true, ms: performance.now() - started, payload };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

/** 29187 reads as "29.2k". Deterministic, so it is safe anywhere. */
export function compactCount(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}b`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}m`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return String(Math.round(value));
}

/** 1060821 ms reads as "17m 40s". */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "n/a";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/** The hour:minute:second of an ISO stamp, as written (UTC). */
export function isoClock(iso: string): string {
  return iso.length >= 19 ? iso.slice(11, 19) : iso;
}
