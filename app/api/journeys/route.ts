import { promises as fs } from "fs";
import path from "path";
import { validateDefinition, type JourneyDefinition } from "@/app/journey/defs";
import { isDerivedSlug } from "@/lib/research-journey";
import { crossOrigin, writeAtomic } from "./guards";

/**
 * The .quirq folder: journey definitions as local files, one JSON per
 * journey, holding the entire tree and its rules. GET lists what the folder
 * offers; POST (development only) stores the active journey back into it.
 *
 * Journeys derived from research notes are deliberately not listed here. They
 * are fetchable by slug like any other (`research-<note>`), but there is one
 * per note and they would bury the folder's own handful of journeys in the
 * library row. /research is their directory, and every note links its own.
 */

const DIR = path.join(process.cwd(), ".quirq", "journeys");

export const dynamic = "force-dynamic";

export async function GET() {
  const journeys: { slug: string; name: string; file: string }[] = [];
  try {
    const files = await fs.readdir(DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(DIR, file), "utf8");
        const def = JSON.parse(raw);
        // A leftover file under a derived slug is not a second journey: the
        // GET for that slug serves the derived document either way.
        if (def?.slug && def?.name && !isDerivedSlug(def.slug)) {
          journeys.push({ slug: def.slug, name: def.name, file });
        }
      } catch {
        /* an unreadable file is skipped, not fatal */
      }
    }
    return Response.json({ journeys });
  } catch {
    // No folder yet: an empty library, not an error.
    return Response.json({ journeys: [] });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("The .quirq folder is read-only outside development.", {
      status: 405,
    });
  }
  if (crossOrigin(request)) {
    return new Response("Cross-origin writes are refused.", { status: 403 });
  }
  let def: JourneyDefinition;
  try {
    def = await request.json();
  } catch {
    return new Response("Body must be a journey definition.", { status: 400 });
  }
  if (!def?.slug || !/^[a-z0-9-]{1,64}$/.test(def.slug)) {
    return new Response("Definition needs a kebab-case slug.", { status: 400 });
  }
  // A derived journey is generated from its note on every read, so a file
  // under that slug could only ever be a stale copy of it.
  if (isDerivedSlug(def.slug)) {
    return new Response(
      `${def.slug} is derived from a research note; edit the note instead.`,
      { status: 409 },
    );
  }
  const problem = validateDefinition(def);
  if (problem) {
    return new Response(`Definition rejected: ${problem}`, { status: 400 });
  }
  await fs.mkdir(DIR, { recursive: true });
  const file = path.join(DIR, `${def.slug}.json`);
  // Storing the tree never erases the walk already recorded in the file.
  if (!def.recording) {
    try {
      const existing = JSON.parse(await fs.readFile(file, "utf8"));
      if (existing?.recording) def.recording = existing.recording;
    } catch {
      /* no existing file: nothing to preserve */
    }
  }
  await writeAtomic(file, JSON.stringify(def, null, 2));
  return Response.json({ saved: `${def.slug}.json` });
}
