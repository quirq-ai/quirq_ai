#!/usr/bin/env node
/**
 * Builds a journey document out of real git history.
 *
 * This is the general case of interactive reading. A research note becomes a
 * journey because a deriver reads its chapters; a repository becomes a journey
 * because this script reads its commits. Neither the engine nor the renderer
 * knows the difference: both produce the same JourneyDefinition, with the same
 * beats and the same figure specs, and both are validated the same way.
 *
 * The mapping is the one from the gitstory plan: one mark per commit, time
 * across, subsystem up the lanes, churn as the mark's weight, the subject's
 * scope prefix as its group. Nothing is aggregated away; every commit in range
 * is a mark you can point at, and its short hash rides in the mark's label.
 *
 *   node scripts/build-git-journey.mjs [--limit=300] [--path=.] [--slug=git-history]
 *
 * Writes .quirq/journeys/<slug>.json, which the journeys API then serves and
 * the loader walks like any other document.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..");

const arg = (name, fallback) => {
  const hit = process.argv.find((it) => it.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const LIMIT = Number(arg("limit", "300"));
const SCOPE = arg("path", ".");
const SLUG = arg("slug", "git-history");
/** Any repository, not just this one: the mapping is not app-specific. */
const REPO = arg("repo", WEB);

/* ------------------------------- reading git ------------------------------- */

/* Control characters as separators, so a subject containing punctuation can
   never split a record. git expands the %x escapes itself, which keeps them
   out of the argv strings Node refuses to pass along. */
const RECORD = String.fromCharCode(30);
const UNIT = String.fromCharCode(31);
const FORMAT = "%x1e%H%x1f%h%x1f%aI%x1f%an%x1f%s";

const git = (args) =>
  execFileSync("git", args, { cwd: REPO, encoding: "utf8", maxBuffer: 64 << 20 });

/**
 * One pass over the log with numstat attached, so churn and touched paths come
 * from the same read as the metadata.
 */
function readCommits() {
  const raw = git([
    "log",
    `-n${LIMIT}`,
    "--no-merges",
    "--numstat",
    `--pretty=format:${FORMAT}`,
    "--",
    SCOPE,
  ]);

  return raw
    .split(RECORD)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [head, ...stats] = chunk.split("\n");
      const [hash, short, date, author, subject] = head.split(UNIT);
      let insertions = 0;
      let deletions = 0;
      const paths = [];
      for (const line of stats) {
        const [added, removed, path] = line.split("\t");
        if (!path) continue;
        insertions += Number(added) || 0;
        deletions += Number(removed) || 0;
        paths.push(path);
      }
      return {
        hash,
        short,
        at: new Date(date).getTime(),
        date: date.slice(0, 10),
        author,
        subject,
        insertions,
        deletions,
        churn: insertions + deletions,
        files: paths.length,
        paths,
      };
    })
    .filter((commit) => Number.isFinite(commit.at))
    .sort((a, b) => a.at - b.at);
}

/** The subject's scope prefix ("quirq:", "feat:") is the commit's group. */
const groupOf = (subject) => {
  const prefix = subject.match(/^([a-z][a-z0-9-]{1,14})(\(|:)/i);
  return prefix ? prefix[1].toLowerCase() : "other";
};

/** The lane a commit belongs to: the subsystem most of its churn landed in.
 *  A file at the top of the tree has no subsystem, so it lands in "root". */
const laneOf = (commit) => {
  const counts = new Map();
  for (const path of commit.paths) {
    const parts = path.split("/");
    const top = parts.length > 1 ? parts[0] : "root";
    counts.set(top, (counts.get(top) ?? 0) + 1);
  }
  let lane = "root";
  let best = 0;
  for (const [name, count] of [...counts].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (count > best) {
      best = count;
      lane = name;
    }
  }
  return lane;
};

/* ------------------------------ shaping figures ---------------------------- */

const DAY = 86_400_000;

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

const isoWeek = (ms) => {
  const date = new Date(ms);
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  return date.toISOString().slice(0, 10);
};

/**
 * Weeks for a history with months in it, days for one that is younger than
 * three weeks. A histogram of one bar is not a rhythm.
 */
const bucketing = (commits) => {
  const span = commits[commits.length - 1].at - commits[0].at;
  return span > 21 * DAY
    ? { unit: "commits per week", of: isoWeek }
    : { unit: "commits per day", of: isoDay };
};

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * What colour should encode. A repo that writes "feat:"/"quirq:" prefixes has
 * a scope worth colouring by; one that does not is better read by author, and
 * a solo repo falls back to the subsystem. Colour follows whichever dimension
 * actually varies, and the caption says which one it landed on rather than
 * claiming the same thing every time.
 */
function colourDimension(commits) {
  const distinct = (read) => new Set(commits.map(read)).size;
  if (distinct((c) => groupOf(c.subject)) > 1) {
    return { name: "the subject's scope", read: (c) => groupOf(c.subject) };
  }
  if (distinct((c) => c.author) > 1) {
    return { name: "the author", read: (c) => c.author };
  }
  return { name: "the subsystem", read: laneOf };
}

function build(commits) {
  const lanes = [...new Set(commits.map(laneOf))].sort();
  const colour = colourDimension(commits);
  const groups = [...new Set(commits.map(colour.read))].sort();
  const first = commits[0];
  const last = commits[commits.length - 1];

  // One mark per commit: time across, lane up, churn as weight, scope as
  // colour, and the short hash in the label so a mark is identifiable.
  const field = {
    kind: "marks",
    xLabel: "authored time",
    yLabel: "subsystem",
    groups: groups.map((label) => ({ label, tone: "value" })),
    marks: commits.map((commit) => ({
      x: commit.at,
      y: lanes.indexOf(laneOf(commit)),
      size: Math.max(1, commit.churn),
      group: colour.read(commit),
      label: `${commit.short} ${commit.subject} (${plural(commit.churn, "line")}, ${plural(commit.files, "file")})`,
    })),
    caption: `Every commit is one mark: ${plural(commits.length, "commit")} across ${plural(lanes.length, "subsystem")}, from ${first.date} to ${last.date}. Weight is churn, colour is ${colour.name}, and the label carries the short hash.`,
  };

  const bucket = bucketing(commits);
  const buckets = [...new Set(commits.map((c) => bucket.of(c.at)))].sort();
  const perWeek = {
    kind: "bars",
    unit: bucket.unit,
    categories: buckets,
    series: [
      {
        label: "commits",
        tone: "cost",
        values: buckets.map((at) => commits.filter((c) => bucket.of(c.at) === at).length),
      },
    ],
    caption:
      "The same history read as rhythm rather than position. Volume is a consumption measure, so it stays monochrome.",
  };

  const churnByLane = {
    kind: "bars",
    unit: "lines changed",
    categories: lanes,
    series: [
      {
        label: "churn",
        tone: "cost",
        values: lanes.map((lane) =>
          commits
            .filter((commit) => laneOf(commit) === lane)
            .reduce((total, commit) => total + commit.churn, 0),
        ),
      },
    ],
    caption: "Where the work landed, by top-level path.",
  };

  const recent = commits.slice(-5).reverse();

  return {
    slug: SLUG,
    name: "This repository, walked",
    rules: { start: "open" },
    nodes: {
      open: {
        short: "the repo",
        pose: { base: "centre" },
        beat: {
          layout: "center",
          marker: "generated · from git log",
          title: ["A repository", "is a dataset."],
          glass: 1,
          lede: `${plural(commits.length, "commit")} read straight out of git log, shaped into one journey document. The same beats, the same figure specs, and the same validator a research note goes through: only the reader changed.`,
          caption: `${first.date} to ${last.date} · ${plural(lanes.length, "subsystem")} · ${plural(groups.length, "colour group")}`,
        },
      },
      field: {
        short: "the field",
        pose: { base: "recede" },
        beat: {
          layout: "left",
          marker: "01 · one mark per commit",
          title: ["Every commit,", "one mark."],
          lede: `Position is time and subsystem, weight is how much changed, colour is ${colour.name}. No aggregation hides an individual commit.`,
          figure: field,
        },
      },
      rhythm: {
        short: "the rhythm",
        pose: { base: "drained" },
        beat: {
          layout: "right",
          marker: "02 · density",
          title: ["Density is", "the story."],
          lede: "Commits per week: the bursts, the quiet stretches, and the crunch before a landing, in the shape the histogram already knows how to show.",
          figure: perWeek,
        },
      },
      lanes: {
        short: "the lanes",
        pose: { base: "recede" },
        beat: {
          layout: "left",
          marker: "03 · where it landed",
          title: ["Churn has", "an address."],
          lede: "The same commits summed by top-level path, so a monorepo says which subsystem actually absorbed the work.",
          figure: churnByLane,
        },
      },
      hashes: {
        short: "the hashes",
        pose: { base: "flooded" },
        beat: {
          layout: "right",
          marker: "04 · the record",
          title: ["The hash is", "the receipt."],
          lede: "Under every mark is an identifier that resolves to an exact tree. The visual is a way in, not a replacement for the record.",
          panelRows: recent.map((commit) => ({
            title: `${commit.short} · ${commit.subject}`,
            note: `${commit.date} · ${commit.author} · ${plural(commit.files, "file")} · +${commit.insertions} -${commit.deletions}`,
          })),
          caption: "The five most recent commits in range.",
        },
      },
      close: {
        short: "the end",
        pose: { base: "finale" },
        beat: {
          layout: "center",
          title: ["Any data,", "the same walk."],
          glass: 1,
          lede: "Research notes and repositories both arrive as one JourneyDefinition. Point the builder at another source and the engine will walk that too, with no change to the renderer.",
          links: [
            { href: "/journey/load", label: "Load another document" },
            { href: "/research", label: "The research notes", tone: "ghost" },
          ],
        },
      },
    },
  };
}

/* --------------------------------- writing -------------------------------- */

const commits = readCommits();
if (commits.length === 0) {
  console.error(`No commits found for path ${SCOPE}. Run this inside a git repository.`);
  process.exit(1);
}

const document = build(commits);
const dir = join(WEB, ".quirq", "journeys");
const file = join(dir, `${SLUG}.json`);
mkdirSync(dir, { recursive: true });
const temp = `${file}.tmp`;
writeFileSync(temp, `${JSON.stringify(document, null, 2)}\n`);
renameSync(temp, file);

console.log(
  `${SLUG}.json: ${commits.length} commits, ${Object.keys(document.nodes).length} beats, ${document.nodes.field.beat.figure.marks.length} marks`,
);
