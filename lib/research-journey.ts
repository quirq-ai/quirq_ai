import {
  validateDefinition,
  type JourneyDefinition,
  type JourneyNodeSpec,
  type PoseName,
} from "@/app/journey/defs";
import type { Figure } from "@/components/story/types";
import { figureFromChart } from "./chart-figure";
import { getPost, type Block, type Post } from "./research";

/**
 * Interactive reading: one research note in, one journey document out.
 *
 * The output is an ordinary JourneyDefinition, the same JSON the `.quirq`
 * folder holds, so nothing downstream knows or cares that this one was
 * derived rather than authored: the same validator checks it, the same
 * engine walks it, and `GET /api/journeys/research-<slug>` serves it as
 * plain JSON you can read, copy, or hand to the loader.
 *
 * Derivation, not authoring. Every line of copy in the result already exists
 * in the note; this module only chapters it, compacts it, and picks poses and
 * layouts from what each chapter contains. It never writes a claim of its
 * own, because a generated document has no standing to make one.
 *
 * Deterministic by construction: same note in, same document out, so the ids
 * that end up inside shared trail URLs stay put between builds.
 */

/** Prefix for every derived slug; also what the API routes match on. */
export const DERIVED_PREFIX = "research-";

export const derivedSlug = (post: Post) => `${DERIVED_PREFIX}${post.slug}`;

/* ------------------------------ text shaping ------------------------------ */

/**
 * Breaks that already split a heading into two readable halves. Punctuation
 * stays at the end of line one; a connector opens line two.
 */
const PUNCTUATION_BREAKS = [": ", "; ", ", "];
const CONNECTOR_BREAKS = [
  " and ",
  " of ",
  " to ",
  " for ",
  " in ",
  " that ",
  " with ",
  " as ",
];

/** Leading chapter numbers belong in the marker, not in the display title. */
const stripNumber = (heading: string) => heading.replace(/^\d+\.\s*/, "").trim();

/** About as many characters as one display line can carry and still read. */
const LINE = 30;
/** A line may run a little over before it stops being a display line. */
const SLACK = 4;
/** What a real break point is worth against an arbitrary word boundary. */
const BREAK_BONUS = 4;
/** Words a truncated line must not end on: they promise a word that is gone. */
const DANGLING =
  /\s+(a|an|the|and|or|of|to|in|on|for|with|as|at|by|that|is|its|from|than|into)$/i;

/** What it costs to end line one on a word that leans on the next line. */
const DANGLE_COST = 6;
/** A clause opener and whatever trails it: a promise of a sentence that a cut
 *  title no longer keeps. */
/* Case-sensitive on purpose: a lowercase subordinator mid-title is a cut
   clause, while a capitalised one ("The Evidence So Far") is a real ending. */
const SUBORDINATE =
  /\s+(that|which|who|whom|whose|where|when|because|since|so|if|while|though|although|unless|until|after|before)(\s+\S+){0,3}$/;
/** What a whole title may hold before the split has to give something up. */
const BUDGET = LINE * 2 + SLACK;

type Split = {
  lines: [string, string];
  cost: number;
  /** The break lands where the note itself broke the phrase. */
  clean: boolean;
  /** The pair ends inside a clause it never closes. */
  open: boolean;
};

/**
 * Two display lines out of one string.
 *
 * Candidates come from break points and from every word boundary, and the
 * winner is the one whose longer line is shortest, handicapped so that a real
 * break beats an arbitrary one of the same width and that neither line is left
 * leaning on words that are not there. Display type is unforgiving: a balanced
 * pair beats a natural-sounding break that overruns. A single word has no
 * break to find, so it takes `tail` as its second line.
 */
function bestSplit(text: string, tail: string): Split {
  const candidates: Split[] = [];

  const consider = (first: string, second: string, clean: boolean) => {
    const a = first.trim();
    const b = second.trim();
    if (a.length < 4 || b.length < 2) return;
    const open = SUBORDINATE.test(b);
    candidates.push({
      lines: [a, b],
      clean,
      open,
      cost:
        Math.max(a.length, b.length) -
        (clean ? BREAK_BONUS : 0) +
        // "The two questions the" hands a function word to the line break;
        // paying for it sends the split one word earlier.
        (DANGLING.test(a) ? DANGLE_COST : 0) +
        (open ? DANGLE_COST : 0),
    });
  };

  for (const mark of PUNCTUATION_BREAKS) {
    for (let at = text.indexOf(mark); at !== -1; at = text.indexOf(mark, at + 1)) {
      consider(text.slice(0, at + mark.length - 1), text.slice(at + mark.length), true);
    }
  }
  for (const mark of CONNECTOR_BREAKS) {
    for (let at = text.indexOf(mark); at !== -1; at = text.indexOf(mark, at + 1)) {
      consider(text.slice(0, at), text.slice(at + 1), true);
    }
  }

  const words = text.split(/\s+/);
  if (words.length > 1) {
    for (let i = 1; i < words.length; i++) {
      consider(words.slice(0, i).join(" "), words.slice(i).join(" "), false);
    }
  }

  candidates.sort((a, b) => a.cost - b.cost);
  return (
    candidates[0] ?? {
      lines: [text, tail],
      cost: Math.max(text.length, tail.length),
      clean: false,
      open: false,
    }
  );
}

const tidy = (text: string) =>
  text
    .trim()
    .replace(/[.?!:;,]$/, "")
    .replace(DANGLING, "");

/**
 * The strings a title could be made from, in decreasing fidelity to the note:
 * the whole first sentence, its leading clauses, those clauses extended word
 * by word to the budget, and a hard word truncation. Headings come through
 * here too: a heading long enough to need cutting is prose in a heading slot.
 */
function titleSources(text: string): string[] {
  const sentence = (text.split(/(?<=[.?!])\s/)[0] ?? text).trim();
  const sources = [sentence];

  // As many leading clauses as fit: "Snapshot before" alone is a fragment,
  // "Snapshot before, snapshot after" is a headline.
  const clauses = sentence.split(/(?<=[:;,])\s/);
  let head = clauses[0] ?? sentence;
  for (const clause of clauses.slice(1)) {
    if (`${head} ${clause}`.length > BUDGET) break;
    head = `${head} ${clause}`;
  }
  sources.push(head);

  // A short clause head leaves budget unspent; spend it on the next words
  // rather than shipping a two-word title when the note said more.
  let extended = head;
  for (const word of sentence.slice(head.length).trim().split(/\s+/)) {
    if (!word || `${extended} ${word}`.length > BUDGET) break;
    extended = `${extended} ${word}`;
  }
  sources.push(extended);

  const words = sentence.split(/\s+/);
  while (words.length > 4 && words.join(" ").length > BUDGET) words.pop();
  const truncated = words.join(" ");
  sources.push(truncated);

  // A truncation can stop inside a subordinate clause ("...measurement that
  // goes"), which promises a sentence that is no longer there. Drop the
  // opening of that clause and offer the standalone statement as well.
  sources.push(truncated.replace(SUBORDINATE, ""));

  return [...new Set(sources.map(tidy))].filter(Boolean);
}

/**
 * A heading or a sentence as two display lines: of every source that fits the
 * type, the one that keeps the most of the note's own words.
 */
function titleFor(text: string, tail: string): [string, string] {
  const scored = titleSources(text).map((source) => {
    const split = bestSplit(source, tail);
    return {
      ...split,
      longest: Math.max(split.lines[0].length, split.lines[1].length),
      kept: source.length,
    };
  });

  const fitting = scored.filter((it) => it.longest <= LINE + SLACK);
  if (fitting.length) {
    // A break the note itself wrote beats a longer source broken mid-phrase:
    // "The calculus exists / to produce one artifact" over "The calculus
    // exists to produce / one artifact: a ledger a company".
    fitting.sort(
      (a, b) =>
        Number(a.open) - Number(b.open) ||
        Number(b.clean) - Number(a.clean) ||
        b.kept - a.kept ||
        a.longest - b.longest,
    );
    return fitting[0].lines;
  }
  // Nothing fits: the least bad overrun, so a long heading still renders.
  scored.sort((a, b) => a.longest - b.longest);
  return scored[0]?.lines ?? [text, tail];
}

/** The trail label: a couple of lowercase words, never a whole heading. */
function shortOf(heading: string) {
  // Stop at the first punctuation break: "scoring", not "scoring: how".
  const head = stripNumber(heading).split(/[:;,]/)[0] ?? heading;
  const words = (head.length > 2 ? head : stripNumber(heading))
    .toLowerCase()
    .split(/\s+/);
  let short = words[0] ?? "note";
  for (const word of words.slice(1)) {
    if (`${short} ${word}`.length > 18) break;
    short = `${short} ${word}`;
  }
  // "the loop a" is where the cap landed, not a label; drop the lean.
  return short.replace(/[:;,.]$/, "").replace(DANGLING, "");
}

/** Whole sentences up to a limit, so a lede never trails off mid-clause. */
function compact(text: string, limit = 240) {
  if (text.length <= limit) return text;
  const window = text.slice(0, limit);
  const stop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! "),
  );
  if (stop > limit / 3) return window.slice(0, stop + 1);
  const space = window.lastIndexOf(" ");
  return `${window.slice(0, space > limit / 3 ? space : limit)}…`;
}

/**
 * A list item as a row. "Label: body" when the note wrote it that way, then a
 * first sentence and its remainder, then a leading clause. The last resort
 * splits on a word boundary rather than leaving a paragraph in the title slot:
 * the note carries the sentence either way, and the row has to stay readable.
 */
function asRow(item: string): { title: string; note: string } {
  const colon = item.indexOf(": ");
  if (colon > 2 && colon < 60) {
    return {
      title: item.slice(0, colon),
      note: compact(item.slice(colon + 2), 200),
    };
  }

  const stop = item.search(/(?<=[.?!])\s/);
  if (stop > 2 && stop < 90) {
    return {
      title: item.slice(0, stop + 1),
      note: compact(item.slice(stop + 1).trim(), 200),
    };
  }

  const comma = item.indexOf(", ");
  if (comma > 12 && comma < 70) {
    return { title: item.slice(0, comma), note: compact(item.slice(comma + 2), 200) };
  }

  if (item.length <= 70) return { title: item, note: "" };
  const cut = item.lastIndexOf(" ", 56);
  return {
    title: item.slice(0, cut > 20 ? cut : 56),
    note: compact(item.slice(cut > 20 ? cut + 1 : 56), 200),
  };
}

/* ------------------------------- chaptering ------------------------------- */

type Chapter = {
  id: string;
  /** Empty for the premise, which sits before the note's first heading. */
  heading: string;
  blocks: Block[];
};

/** Ids come from headings, not positions, so inserting a chapter later does
 *  not silently repoint every shared trail URL after it. */
function chapterId(heading: string, taken: Set<string>) {
  const base =
    stripNumber(heading)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32)
      .replace(/-$/, "") || "chapter";
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  taken.add(id);
  return id;
}

/**
 * The note's spine: everything before the first `h2` becomes the premise, and
 * every `h2` opens a chapter that owns the blocks under it.
 */
function chaptersOf(post: Post): Chapter[] {
  const taken = new Set<string>();
  const premise: Chapter = { id: "premise", heading: "", blocks: [] };
  taken.add(premise.id);
  const chapters: Chapter[] = [];

  for (const block of post.body) {
    if (block.kind === "h2") {
      chapters.push({
        id: chapterId(block.text, taken),
        heading: block.text,
        blocks: [],
      });
      continue;
    }
    (chapters[chapters.length - 1] ?? premise).blocks.push(block);
  }

  // A premise with no prose of its own is not a beat; the note simply opens
  // straight into its first heading.
  const hasProse = premise.blocks.some(
    (block) => block.kind === "p" || block.kind === "quote",
  );
  return hasProse ? [premise, ...chapters] : chapters;
}

/* The block union puts every prose kind in one member, so `Extract` by kind
   cannot narrow it; these three predicates do the narrowing instead. */
type TextBlock = Extract<Block, { text: string }>;
type ListBlock = Extract<Block, { kind: "list" }>;
type TableBlock = Extract<Block, { kind: "table" }>;

/** A chart paragraph: prose that carries a figure's numbers inside it. */
const isChart = (block: Block): block is TextBlock =>
  block.kind === "p" && "text" in block && block.text.startsWith("Chart: ");

const firstText = (blocks: Block[], kind: TextBlock["kind"]) =>
  blocks.find((block): block is TextBlock => "text" in block && block.kind === kind);

const firstList = (blocks: Block[]) =>
  blocks.find((block): block is ListBlock => block.kind === "list");

const firstTable = (blocks: Block[]) =>
  blocks.find((block): block is TableBlock => block.kind === "table");

/* --------------------------------- beats --------------------------------- */

/**
 * Sections a note must exceed before its journey branches. At or under this,
 * the whole note fits in one scroll and a fork would only ask the reader to
 * choose what to miss.
 */
const BRANCH_ABOVE = 6;

const PROMPTS = ["Where next?", "Keep going?", "What next?"];

/** Code and tables want the copy to dominate; prose can take the light. */
const DENSE_POSES: PoseName[] = ["recede", "drained"];
const PROSE_POSES: PoseName[] = ["flooded", "drained", "centre"];

/** One chapter as one beat: a title, a compact lede, and at most one
 *  dominant detail structure, chosen by what the chapter actually holds. */
function chapterNode(
  chapter: Chapter,
  index: number,
  post: Post,
  /** Omitted on a scroll document: no fork, so no prompt either. */
  choices?: { label: string; to: string }[],
): JourneyNodeSpec {
  const list = firstList(chapter.blocks);
  const code = firstText(chapter.blocks, "code");
  const table = firstTable(chapter.blocks);
  const premise = !chapter.heading;

  // The note's own chart, generated from the sentence that carries its
  // numbers. Where one parses it is the beat's visual and its strongest
  // detail, so the other structures stand down and say so in the caption.
  const figure = chapter.blocks.reduce<Figure | null>(
    (found, block) => found ?? (isChart(block) ? figureFromChart(block.text) : null),
    null,
  );

  // The premise reads the note's opening quote first: that is where a note
  // states its thesis, while its first paragraph is often only a byline.
  // Inside a chapter the paragraph leads and the quote is the fallback.
  // Chart paragraphs are excluded either way: that prose is figure material,
  // and reading it as a lede would print the chart's numbers twice.
  const prose = chapter.blocks.filter((block) => !isChart(block));
  const paragraph = premise
    ? (firstText(prose, "quote") ?? firstText(prose, "p"))
    : (firstText(prose, "p") ?? firstText(prose, "quote"));

  // The content picks the rotation and the position picks the pose in it, so
  // seven code-heavy chapters in a row still move the glass. A derived
  // document cannot read narrative intent, so the rotation carries the rhythm
  // and the copy carries the meaning. Neither rotation opens on `centre`: the
  // opening beat is already there, and a walk that does not move is not one.
  const dense = Boolean(code || table || figure);
  const even = index % 2 === 0;
  const base: PoseName = dense
    ? DENSE_POSES[index % DENSE_POSES.length]
    : PROSE_POSES[index % PROSE_POSES.length];

  const source = chapter.heading
    ? stripNumber(chapter.heading)
    : (paragraph?.text ?? post.title);

  const rows = !figure && list ? list.items.slice(0, 4).map(asRow) : undefined;
  const panelRows =
    !figure && !list && table
      ? table.rows.slice(0, 4).map((row) => ({
          title: row[0] ?? "",
          note: table.header
            .slice(1, 5)
            .map((head, i) => `${head} ${row[i + 1] ?? ""}`)
            .join(" · "),
        }))
      : undefined;

  // Anything trimmed is said out loud rather than silently dropped.
  const trimmed: string[] = [];
  if (list && (figure || list.items.length > 4)) {
    trimmed.push(`${list.items.length} points`);
  }
  if (table && (figure || (panelRows && table.rows.length > 4))) {
    trimmed.push(`${table.rows.length} rows`);
  }

  return {
    short: chapter.heading ? shortOf(chapter.heading) : "the premise",
    pose: { base },
    beat: {
      layout: even ? "left" : "right",
      marker: `${String(index + 1).padStart(2, "0")} · ${
        chapter.heading ? shortOf(chapter.heading) : post.tag
      }`,
      title: titleFor(source, post.tag),
      ...(paragraph ? { lede: compact(paragraph.text) } : {}),
      ...(figure ? { figure } : {}),
      ...(rows ? { rows } : {}),
      ...(panelRows ? { panelRows } : {}),
      ...(!rows && !panelRows && code ? { code: code.text } : {}),
      caption: trimmed.length
        ? `Condensed from the note, which carries ${trimmed.join(" and ")}.`
        : "Condensed from the note.",
    },
    ...(choices?.length ? { prompt: PROMPTS[index % PROMPTS.length], choices } : {}),
  };
}

/* ------------------------------- the journey ------------------------------ */

/**
 * Build the journey for one note. Throws rather than returning an invalid
 * document: every caller is a prerendered route, so a derivation bug fails
 * the build instead of shipping a page the engine would refuse.
 */
export function buildResearchJourney(post: Post): JourneyDefinition {
  const chapters = chaptersOf(post);
  const sections = chapters.filter((chapter) => chapter.heading).length;

  // A short note is a scroll, not a graph. Forking a four-section note buys
  // the reader nothing but a decision, so those become one linear document:
  // beats in order, no prompts, no choices, the shape app/how-it-works ships
  // by hand. Only a note long enough that reading all of it is a real
  // commitment gets entry points and exits.
  const branching = sections > BRANCH_ABOVE;

  const walked: Record<string, JourneyNodeSpec> = {};
  chapters.forEach((chapter, i) => {
    const next = chapters[i + 1];
    walked[chapter.id] = chapterNode(
      chapter,
      i,
      post,
      branching
        ? next
          ? [
              {
                label: next.heading ? shortOf(next.heading) : "the premise",
                to: next.id,
              },
              { label: "Wrap it up", to: "close" },
            ]
          : [{ label: "Close the note", to: "close" }]
        : undefined,
    );
  });

  // Three ways in: from the top, from the middle, or straight to the end.
  const entries: { label: string; to: string }[] = [];
  if (chapters[0]) {
    entries.push({ label: "From the top", to: chapters[0].id });
  }
  if (chapters.length > 2) {
    const middle = chapters[Math.floor(chapters.length / 2)];
    entries.push({
      label: middle.heading ? shortOf(middle.heading) : "the premise",
      to: middle.id,
    });
  }
  entries.push({ label: "Straight to the end", to: "close" });

  // Assembled opening-first, so the document reads in order for anyone who
  // opens the JSON rather than the page. On a scroll document that order is
  // the whole structure.
  const nodes: Record<string, JourneyNodeSpec> = {
    open: {
      short: "the note",
      pose: { base: "centre" },
      beat: {
        layout: "center",
        marker: `${post.tag} · interactive`,
        title: titleFor(post.title, "on the record."),
        glass: 1,
        lede: post.dek,
        caption: `${chapters.length + 2} beats · ${post.readingMinutes} min to read in full`,
      },
      ...(branching ? { prompt: "Where do you want to start?", choices: entries } : {}),
    },
    ...walked,
    close: {
      short: "the end",
      pose: { base: "finale" },
      beat: {
        layout: "center",
        title: branching
          ? ["That was one path.", "The note has the rest."]
          : ["That is the note,", "in one pass."],
        glass: 1,
        lede: branching
          ? `This walk is one route through ${post.title}. The full note carries every chapter, the tables, the code, and the source it was adapted from.`
          : `This is ${post.title} condensed to its beats. The full note carries every paragraph, the tables, the code, and the source it was adapted from.`,
        links: [
          { href: `/research/${post.slug}`, label: "Read the full note" },
          { href: "/research", label: "All research", tone: "ghost" },
        ],
      },
    },
  };

  const definition: JourneyDefinition = {
    slug: derivedSlug(post),
    name: post.title,
    // A scroll document needs no walk rules: there is no branch to bound, no
    // trail to rewind, and no path to replay. Leaving them out is what makes
    // the JSON of a short note plainly a list of beats.
    rules: branching
      ? {
          start: "open",
          // The longest legal path is the opening, every chapter, and the close.
          maxDepth: chapters.length + 2,
          allowRewind: true,
          allowReplay: true,
        }
      : { start: "open" },
    nodes,
  };

  const problem = validateDefinition(definition);
  if (problem) {
    throw new Error(`Derived journey for ${post.slug} is invalid: ${problem}`);
  }
  return definition;
}

/** The derived journey behind a journeys-API slug, or null if it names none. */
export function researchJourneyBySlug(slug: string): JourneyDefinition | null {
  if (!slug.startsWith(DERIVED_PREFIX)) return null;
  const post = getPost(slug.slice(DERIVED_PREFIX.length));
  return post ? buildResearchJourney(post) : null;
}

/** True for any slug the .quirq folder must not own. */
export const isDerivedSlug = (slug: string) => researchJourneyBySlug(slug) !== null;
