import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type {
  ActivitySnapshot,
  FolderNode,
  FolderPayload,
  FolderStats,
  OffsetsSummary,
  SessionAugment,
  StatsWindow,
  TimelineEvent,
  XoSummary,
  XoToggle,
} from "@/lib/quirq/folder";

/**
 * GET /api/quirq-state: the workspace's `.quirq` folder, read off the disk it
 * lives on and served as one typed snapshot.
 *
 * Read-only by construction. The watcher service owns everything under
 * `.quirq/`; this route opens files, it never creates, touches, or rewrites
 * one. Two files are special-cased harder than that: `secrets.env` (and any
 * env file not on the allowlist) is listed with its size but never opened,
 * because a dashboard that renders credentials once is a dashboard that has
 * leaked them.
 *
 * The folder sits beside the app, not inside it: this repository keeps the
 * web app in `web/` and the watcher state in `../.quirq`. `QUIRQ_DIR`
 * overrides the guess for anyone running the dashboard against another
 * workspace. A missing folder is a state worth showing, not an error, so it
 * comes back 200 with `root.present: false`.
 *
 * Like the journeys writes, the filesystem side is development-only: a
 * deployed build serves the same 200 with `present: false` and an empty
 * path, because session ids, edited-file lists and server paths are workspace
 * telemetry, not site content. Setting QUIRQ_DIR is the explicit opt-in that
 * re-enables reading under a production server, for running the built site
 * beside a workspace on purpose.
 */
export const dynamic = "force-dynamic";

const SERVES =
  process.env.NODE_ENV === "development" || Boolean(process.env.QUIRQ_DIR);

const ROOT = process.env.QUIRQ_DIR
  ? resolve(process.env.QUIRQ_DIR)
  : resolve(process.cwd(), "..", ".quirq");

/** Env files whose values are configuration rather than credentials. */
const READABLE_ENV = new Set(["runtime.env", "roots.env"]);

/** What the contract says each known path is for. Unknown paths stay blank
 *  rather than guessed. */
const NOTES: Record<string, string> = {
  "state.json": "Onboarding state for this scope.",
  "xo.json": "Capability toggles: runtime, models, connectors, channels.",
  "runtime.env": "Watcher configuration.",
  "roots.env": "Where the projects root and state root live.",
  "secrets.env": "Credentials. Listed, never read.",
  watcher: "Everything the watcher service derives.",
  "watcher/offsets.json": "Tail cursors over the runtimes' native session logs.",
  "watcher/locks": "Write locks for coordinated writers.",
  "watcher/activity": "Live presence snapshots.",
  "watcher/activity/workspace.json": "Open sessions across every project.",
  "watcher/activity/projects": "Presence per project, one file per slug.",
  "watcher/workspace": "Derived workspace state: identity, stats, history.",
  "watcher/workspace/workspace.json": "Workspace identity: projects root and slugs.",
  "watcher/workspace/stats.json": "Usage telemetry: tokens, tools, files, latency.",
  "watcher/workspace/timeline.jsonl": "Append-only event log.",
  "watcher/workspace/sessions": "Session index and derived counters.",
  "watcher/workspace/sessions/sessionslist.json": "Adapter-owned session index.",
  "watcher/workspace/sessions/sessions-augment.json":
    "Watcher counters per session.",
};

const noteFor = (path: string, name: string): string => {
  const known = NOTES[path];
  if (known) return known;
  if (path.startsWith("watcher/activity/projects/") && name.endsWith(".json")) {
    return `Presence for "${name.slice(0, -5)}".`;
  }
  return "";
};

const isSensitive = (name: string): boolean =>
  name.endsWith(".env") && !READABLE_ENV.has(name);

/* ------------------------------------------------------------------ *
 * Small defensive readers: the watcher's files are trusted neighbours,
 * but a half-written JSON mid-update must degrade to null, not to a 500.
 * ------------------------------------------------------------------ */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function readEnv(path: string): Record<string, string> | null {
  try {
    const out: Record<string, string> = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
    return out;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * The tree walk
 * ------------------------------------------------------------------ */

function walk(
  dir: string,
  relative: string,
  depth: number,
  out: FolderNode[],
  totals: { files: number; directories: number; bytes: number },
): number {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return 0;
  }

  type Entry = { name: string; full: string; isDirectory: boolean; size: number; mtime: string };
  const entries: Entry[] = [];
  for (const name of names) {
    const full = join(dir, name);
    try {
      const stat = statSync(full);
      entries.push({
        name,
        full,
        isDirectory: stat.isDirectory(),
        size: stat.size,
        mtime: stat.mtime.toISOString(),
      });
    } catch {
      // A file deleted mid-walk is not worth failing the whole read for.
    }
  }
  entries.sort((a, b) =>
    a.isDirectory === b.isDirectory
      ? a.name.localeCompare(b.name)
      : a.isDirectory
        ? -1
        : 1,
  );

  let aggregate = 0;
  for (const entry of entries) {
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory) {
      const node: FolderNode = {
        path,
        name: entry.name,
        depth,
        kind: "directory",
        bytes: 0,
        entries: 0,
        modified_at: entry.mtime,
        sensitive: false,
        note: noteFor(path, entry.name),
      };
      out.push(node);
      const index = out.length - 1;
      const before = out.length;
      const bytes = walk(entry.full, path, depth + 1, out, totals);
      out[index] = { ...node, bytes, entries: countDirect(out, before, depth + 1) };
      totals.directories += 1;
      aggregate += bytes;
    } else {
      out.push({
        path,
        name: entry.name,
        depth,
        kind: "file",
        bytes: entry.size,
        entries: 0,
        modified_at: entry.mtime,
        sensitive: isSensitive(entry.name),
        note: noteFor(path, entry.name),
      });
      totals.files += 1;
      totals.bytes += entry.size;
      aggregate += entry.size;
    }
  }
  return aggregate;
}

/** Direct children of the directory whose subtree begins at `from`. */
function countDirect(out: FolderNode[], from: number, depth: number): number {
  let count = 0;
  for (let i = from; i < out.length; i += 1) {
    if (out[i].depth < depth) break;
    if (out[i].depth === depth) count += 1;
  }
  return count;
}

/* ------------------------------------------------------------------ *
 * Per-file parsers
 * ------------------------------------------------------------------ */

function parseState(root: string): FolderPayload["state"] {
  const raw = readJson(join(root, "state.json"));
  if (!isRecord(raw)) return null;
  return {
    onboarding_completed: raw.onboarding_completed === true,
    onboarding_completed_at:
      typeof raw.onboarding_completed_at === "string"
        ? raw.onboarding_completed_at
        : null,
  };
}

/** Flatten the nested `{ enabled: boolean }` groups of xo.json into rows the
 *  page can list, and lift out the status block the project scope carries. */
function parseXo(root: string): XoSummary | null {
  const raw = readJson(join(root, "xo.json"));
  if (!isRecord(raw)) return null;

  const toggles: XoToggle[] = [];
  const collect = (value: Record<string, unknown>, path: string) => {
    for (const [key, child] of Object.entries(value)) {
      if (key === "status" || !isRecord(child)) continue;
      const here = path ? `${path}.${key}` : key;
      if (typeof child.enabled === "boolean") {
        toggles.push({ path: here, enabled: child.enabled });
      }
      collect(child, here);
    }
  };
  for (const [key, child] of Object.entries(raw)) {
    if (!isRecord(child)) continue;
    if (typeof child.enabled === "boolean") {
      toggles.push({ path: key, enabled: child.enabled });
    }
    collect(child, key);
  }

  const models = isRecord(raw.models) ? raw.models : {};
  const status = isRecord(models.status) ? models.status : {};
  const list = Array.isArray(status.models) ? status.models : [];

  return {
    agent: typeof raw.agent === "string" ? raw.agent : null,
    default_model: typeof status.default === "string" ? status.default : null,
    models: list.flatMap((entry) =>
      isRecord(entry) &&
      typeof entry.id === "string" &&
      typeof entry.status === "string"
        ? [{ id: entry.id, status: entry.status }]
        : [],
    ),
    toggles,
  };
}

function parseOffsets(root: string): OffsetsSummary | null {
  const raw = readJson(join(root, "watcher", "offsets.json"));
  if (!isRecord(raw) || !isRecord(raw.offsets)) return null;

  const folders = new Map<string, number>();
  let consumed = 0;
  let tracked = 0;
  for (const [path, cursor] of Object.entries(raw.offsets)) {
    tracked += 1;
    if (isRecord(cursor) && typeof cursor.offset === "number") {
      consumed += cursor.offset;
    }
    // ".../projects/-Users-me-some-workspace/<uuid>.jsonl": the folder name
    // is the flattened cwd, which is exactly the label worth grouping by.
    const parts = path.split("/");
    const folder = parts.length >= 2 ? parts[parts.length - 2] : "unknown";
    folders.set(folder, (folders.get(folder) ?? 0) + 1);
  }

  return {
    version: typeof raw.version === "number" ? raw.version : 0,
    tracked,
    consumed_bytes: consumed,
    folders: [...folders]
      .map(([folder, files]) => ({ folder, files }))
      .sort((a, b) => b.files - a.files || a.folder.localeCompare(b.folder)),
  };
}

function parseActivity(path: string): ActivitySnapshot | null {
  const raw = readJson(path);
  if (!isRecord(raw) || !Array.isArray(raw.open_sessions)) return null;
  return {
    schema: typeof raw.schema === "number" ? raw.schema : 0,
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : "",
    open_sessions: raw.open_sessions.filter(isRecord).map((session) => ({
      session_id: String(session.session_id ?? ""),
      runtime: String(session.runtime ?? ""),
      agent: String(session.agent ?? ""),
      user_id: String(session.user_id ?? ""),
      opened_at: String(session.opened_at ?? ""),
      last_activity_at: String(session.last_activity_at ?? ""),
      ...(typeof session.project_id === "string"
        ? { project_id: session.project_id }
        : {}),
    })),
  };
}

function parseProjects(
  root: string,
): Array<{ project_id: string; snapshot: ActivitySnapshot }> {
  const dir = join(root, "watcher", "activity", "projects");
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => name.endsWith(".json"))
    .sort()
    .flatMap((name) => {
      const snapshot = parseActivity(join(dir, name));
      return snapshot
        ? [{ project_id: name.slice(0, -5), snapshot }]
        : [];
    });
}

function parseWorkspace(root: string): FolderPayload["workspace"] {
  const raw = readJson(join(root, "watcher", "workspace", "workspace.json"));
  if (!isRecord(raw)) return null;
  return {
    schema: typeof raw.schema === "number" ? raw.schema : 0,
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : "",
    projects_root:
      typeof raw.projects_root === "string" ? raw.projects_root : "",
    projects: Array.isArray(raw.projects)
      ? raw.projects.filter((p): p is string => typeof p === "string")
      : [],
  };
}

/** stats.json is the deepest file here, and it is coerced field by field:
 *  the client types every window and session row as required, so a partial
 *  row must become zeros at this boundary, which is also the honest reading
 *  of a half-written counter. */
const num = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const numMap = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) out[key] = num(entry);
  return out;
};

const tokenPair = (value: unknown) => {
  const record = isRecord(value) ? value : {};
  return { input: num(record.input), output: num(record.output) };
};

const tokenPairMap = (value: unknown) => {
  if (!isRecord(value)) return {};
  const out: Record<string, { input: number; output: number }> = {};
  for (const [key, entry] of Object.entries(value)) out[key] = tokenPair(entry);
  return out;
};

function coerceWindow(value: unknown): StatsWindow | null {
  if (!isRecord(value)) return null;
  return {
    tokens: tokenPair(value.tokens),
    by_model: tokenPairMap(value.by_model),
    by_tool: numMap(value.by_tool),
    files_edited: num(value.files_edited),
    sessions: num(value.sessions),
    active_minutes: num(value.active_minutes),
  };
}

function coerceSessionStats(value: unknown): FolderStats["by_session"][string] {
  const record = isRecord(value) ? value : {};
  return {
    tokens: tokenPair(record.tokens),
    files: Array.isArray(record.files)
      ? record.files.filter((f): f is string => typeof f === "string")
      : [],
    duration_ms: num(record.duration_ms),
    tools: numMap(record.tools),
    by_model: tokenPairMap(record.by_model),
  };
}

function coerceDay(value: unknown): FolderStats["by_day"][string] {
  const record = isRecord(value) ? value : {};
  const tokens = isRecord(record.tokens) ? record.tokens : {};
  const messages = isRecord(record.messages) ? record.messages : {};
  const byModel = isRecord(record.by_model) ? record.by_model : {};
  const models: FolderStats["by_day"][string]["by_model"] = {};
  for (const [key, entry] of Object.entries(byModel)) {
    const row = isRecord(entry) ? entry : {};
    models[key] = { ...tokenPair(row), count: num(row.count) };
  }
  const latency = isRecord(record.latency) ? record.latency : null;
  return {
    tokens: {
      ...tokenPair(tokens),
      cache_read: num(tokens.cache_read),
      cache_write: num(tokens.cache_write),
    },
    messages: {
      total: num(messages.total),
      user: num(messages.user),
      assistant: num(messages.assistant),
      toolCalls: num(messages.toolCalls),
      toolResults: num(messages.toolResults),
      errors: num(messages.errors),
    },
    by_model: models,
    ...(latency
      ? {
          latency: {
            count: num(latency.count),
            sum_ms: num(latency.sum_ms),
            min_ms: num(latency.min_ms),
            max_ms: num(latency.max_ms),
          },
        }
      : {}),
  };
}

const coerceMap = <T>(
  value: unknown,
  coerce: (entry: unknown) => T,
): Record<string, T> => {
  if (!isRecord(value)) return {};
  const out: Record<string, T> = {};
  for (const [key, entry] of Object.entries(value)) out[key] = coerce(entry);
  return out;
};

function parseStats(root: string): FolderStats | null {
  const raw = readJson(join(root, "watcher", "workspace", "stats.json"));
  if (!isRecord(raw)) return null;
  const rolling = isRecord(raw.rolling) ? raw.rolling : {};
  return {
    schema: num(raw.schema),
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : "",
    rolling: {
      "7d": coerceWindow(rolling["7d"]),
      "30d": coerceWindow(rolling["30d"]),
    },
    by_session: coerceMap(raw.by_session, coerceSessionStats),
    by_runtime: coerceMap(raw.by_runtime, (entry) => {
      const window = coerceWindow(entry);
      return window ?? coerceWindow({})!;
    }),
    by_day: coerceMap(raw.by_day, coerceDay),
  };
}

/** The timeline can only grow, so the payload carries the newest slice plus
 *  counts over the whole file rather than the whole file. */
const TIMELINE_SLICE = 200;

function parseTimeline(root: string): FolderPayload["timeline"] {
  let text: string;
  try {
    text = readFileSync(
      join(root, "watcher", "workspace", "timeline.jsonl"),
      "utf8",
    );
  } catch {
    return null;
  }
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const by_type: Record<string, number> = {};
  const parsed: TimelineEvent[] = [];
  for (const line of lines) {
    try {
      const event = JSON.parse(line) as unknown;
      if (!isRecord(event) || typeof event.type !== "string") continue;
      by_type[event.type] = (by_type[event.type] ?? 0) + 1;
      parsed.push({
        ts: String(event.ts ?? ""),
        type: event.type,
        session_id: String(event.session_id ?? ""),
        runtime: String(event.runtime ?? ""),
        ...(typeof event.project_id === "string"
          ? { project_id: event.project_id }
          : {}),
        ...(typeof event.path === "string" ? { path: event.path } : {}),
      });
    } catch {
      // One corrupt line does not unwrite the log.
    }
  }
  return {
    total: parsed.length,
    by_type,
    events: parsed.slice(-TIMELINE_SLICE),
  };
}

function coerceAugment(value: unknown): SessionAugment {
  const record = isRecord(value) ? value : {};
  const roles = isRecord(record.messageCountByRole)
    ? record.messageCountByRole
    : {};
  const tasks = isRecord(record.taskCount) ? record.taskCount : {};
  return {
    messageCount: num(record.messageCount),
    messageCountByRole: {
      user: num(roles.user),
      assistant: num(roles.assistant),
      toolResults: num(roles.toolResults),
      errors: num(roles.errors),
    },
    toolCallCount: num(record.toolCallCount),
    taskCount: {
      total: num(tasks.total),
      completed: num(tasks.completed),
      in_progress: num(tasks.in_progress),
      pending: num(tasks.pending),
      cancelled: num(tasks.cancelled),
      blocked: num(tasks.blocked),
    },
    firstActivity: num(record.firstActivity),
    lastActivity: num(record.lastActivity),
    ended_at:
      typeof record.ended_at === "number" && Number.isFinite(record.ended_at)
        ? record.ended_at
        : null,
    episode_refs: Array.isArray(record.episode_refs)
      ? record.episode_refs.filter((r): r is string => typeof r === "string")
      : [],
  };
}

function parseAugment(root: string): FolderPayload["sessions_augment"] {
  const raw = readJson(
    join(root, "watcher", "workspace", "sessions", "sessions-augment.json"),
  );
  if (!isRecord(raw) || !isRecord(raw.sessions)) return null;
  return {
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : "",
    sessions: coerceMap(raw.sessions, coerceAugment),
  };
}

function listLocks(root: string): string[] {
  try {
    return readdirSync(join(root, "watcher", "locks")).sort();
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */

export function GET(): Response {
  // One try around the pair: the folder disappearing between the two calls
  // must land in the designed missing-folder state, not a 500.
  let present = false;
  if (SERVES) {
    try {
      present = existsSync(ROOT) && statSync(ROOT).isDirectory();
    } catch {
      present = false;
    }
  }

  const totals = { files: 0, directories: 0, bytes: 0 };
  const tree: FolderNode[] = [];
  if (present) walk(ROOT, "", 0, tree, totals);

  const payload: FolderPayload = {
    generated_at: new Date().toISOString(),
    // A deployed build never reveals where the server keeps things.
    root: { path: SERVES ? ROOT : "", present },
    totals,
    tree,
    state: present ? parseState(ROOT) : null,
    xo: present ? parseXo(ROOT) : null,
    runtime_env: present ? readEnv(join(ROOT, "runtime.env")) : null,
    offsets: present ? parseOffsets(ROOT) : null,
    locks: present ? listLocks(ROOT) : [],
    activity: {
      workspace: present
        ? parseActivity(join(ROOT, "watcher", "activity", "workspace.json"))
        : null,
      projects: present ? parseProjects(ROOT) : [],
    },
    workspace: present ? parseWorkspace(ROOT) : null,
    stats: present ? parseStats(ROOT) : null,
    timeline: present ? parseTimeline(ROOT) : null,
    sessions_augment: present ? parseAugment(ROOT) : null,
  };

  return Response.json(payload, {
    headers: { "cache-control": "no-store" },
  });
}
