import type { Figure, FigureSeries } from "@/components/story/types";

/**
 * Chart paragraphs into figures.
 *
 * The research notes describe their charts in prose and carry the numbers in
 * the same sentence: "Codex / Claude by environment: E0 228k / 606k; E1 256k /
 * 639k". This module reads that sentence and returns a figure spec, so the
 * visual is generated from the note rather than drawn beside it. Nothing is
 * invented: every value and label in the result appears in the paragraph.
 *
 * It fails closed. A paragraph describing a stack diagram, a matrix, or a
 * scatter whose points were never listed returns null, and the caller leaves
 * the prose exactly as it is. Half a chart is worse than a sentence.
 */

const PREFIX = "Chart: ";

/** A number as the note wrote it: "228k", "1.87M", "67%", "about 90 percent". */
const VALUE = String.raw`(?:about\s+|up\s+to\s+|~)?\d[\d.,]*\s*(?:%|percent|K|k|M|B)?`;

const pairPattern = new RegExp(String.raw`^(.+?)\s+(${VALUE})\s*/\s*(${VALUE})\.?$`);
const singlePattern = new RegExp(String.raw`^(.+?)\s+(${VALUE})\.?$`);

/** The note's numeral, and the number the geometry needs. */
function readValue(raw: string): { value: number; display: string } | null {
  const display = raw.trim().replace(/\.$/, "");
  const cleaned = display
    .replace(/^(about|up to|~)\s*/i, "")
    .replace(/,/g, "")
    .trim();
  const digits = Number.parseFloat(cleaned);
  if (!Number.isFinite(digits)) return null;

  const scale = /\bB$/.test(cleaned)
    ? 1_000_000_000
    : /\bM$/.test(cleaned)
      ? 1_000_000
      : /\b[Kk]$/.test(cleaned)
        ? 1_000
        : 1;

  return { value: digits * scale, display };
}

const sentencesOf = (text: string) =>
  text
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

/** Segments that end in a number are the data; the rest is commentary. */
const numericSegments = (sentence: string) =>
  sentence
    .split(";")
    .map((segment) => segment.trim().replace(/\.$/, ""))
    .filter((segment) => new RegExp(String.raw`${VALUE}$`).test(segment));

/**
 * Series names out of a data sentence's header: "Codex / Claude by
 * environment" and "Percentage of tasks correct, Codex / Claude" both name
 * Codex and Claude.
 */
function seriesNames(header: string): string[] | null {
  const trimmed = header
    .replace(/\s+by\s+[\w\s-]+$/i, "")
    .split(", ")
    .pop()
    ?.trim();
  if (!trimmed || !trimmed.includes(" / ")) return null;
  const names = trimmed.split(" / ").map((name) => name.trim());
  return names.every((name) => name.length > 0 && name.length < 24) ? names : null;
}

/**
 * Colour is value on this site, so it is spent only on a measure that reads as
 * an outcome: a percentage, a score, a rate. Anything counting what was
 * consumed (tokens, calls, files opened, minutes) stays monochrome, and
 * monochrome is the default when the unit does not say.
 */
const toneFor = (text: string, percent: boolean): FigureSeries["tone"] =>
  percent || /score|index|rate|share of|pass|solved|correct|accuracy|quirq/i.test(text)
    ? "value"
    : "cost";

export function figureFromChart(text: string): Figure | null {
  if (!text.startsWith(PREFIX)) return null;
  const body = text.slice(PREFIX.length).trim();

  const sentences = sentencesOf(body);
  if (sentences.length === 0) return null;

  // The data sentence is the one carrying the most numeric segments; ties go
  // to the earlier sentence, so a summary that repeats a number cannot win.
  let dataAt = -1;
  let best = 1;
  sentences.forEach((sentence, at) => {
    const count = numericSegments(sentence).length;
    if (count > best) {
      best = count;
      dataAt = at;
    }
  });
  if (dataAt === -1) return null;

  const dataSentence = sentences[dataAt];
  const colon = dataSentence.lastIndexOf(": ");
  const header = colon === -1 ? "" : dataSentence.slice(0, colon);
  const data = colon === -1 ? dataSentence : dataSentence.slice(colon + 2);

  const names = seriesNames(header);
  const categories: string[] = [];
  const columns: { value: number; display: string }[][] = [];

  for (const segment of numericSegments(data)) {
    const pair = names && names.length === 2 ? segment.match(pairPattern) : null;
    if (pair) {
      const first = readValue(pair[2]);
      const second = readValue(pair[3]);
      if (!first || !second) return null;
      categories.push(pair[1].trim().replace(/,$/, ""));
      columns.push([first, second]);
      continue;
    }
    const single = segment.match(singlePattern);
    if (!single) return null;
    const only = readValue(single[2]);
    if (!only) return null;
    categories.push(single[1].trim().replace(/,$/, ""));
    columns.push([only]);
  }

  const width = columns[0]?.length ?? 0;
  if (categories.length < 2 || width === 0) return null;
  // Every category must report the same number of series, or the figure would
  // be comparing rows that do not hold the same measurement.
  if (columns.some((column) => column.length !== width)) return null;

  const title = dataAt === 0 ? "" : sentences[0];
  const unit = title.match(/\(([^)]+)\)/)?.[1];

  // A chart of percentages is read against 100, not against its own tallest
  // bar: 67% has to look like two thirds of the way up.
  const percent = columns.every((column) =>
    column.every((cell) => /%|percent/.test(cell.display)),
  );
  const tone = toneFor(`${title} ${header} ${unit ?? ""}`, percent);

  // One series needs no name in a legend; the unit already says what it is.
  const single = header.split(", ").pop()?.trim();
  const labels =
    width === 2 && names && names.length === 2
      ? names
      : [single && single.length < 24 ? single : "measured"];

  const series: FigureSeries[] = labels.map((label, at) => ({
    label,
    tone,
    values: columns.map((column) => column[at].value),
    display: columns.map((column) => column[at].display),
  }));

  const commentary = sentences.filter((_, at) => at !== 0 && at !== dataAt).join(" ");

  return {
    kind: "bars",
    categories,
    series,
    ...(unit ? { unit } : {}),
    ...(percent ? { max: 100 } : {}),
    caption: [title.replace(/\s*\([^)]*\)/, ""), commentary]
      .filter(Boolean)
      .join(" ")
      .trim(),
  };
}
