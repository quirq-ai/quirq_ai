import { promises as fs } from "fs";
import path from "path";
import { validateDefinition, type JourneyDefinition } from "@/app/journey/defs";
import { isDerivedSlug } from "@/lib/research-journey";
import { crossOrigin, writeAtomic } from "../../guards";

/**
 * The walk recorder: as the visitor progresses, the client posts the
 * recording so far and it is written into the journey's own JSON file in
 * .quirq, so the document grows a `recording` key transition by transition.
 * If the file does not exist yet, the posted definition seeds it.
 * Development only, like every other write into the folder.
 */

const DIR = path.join(process.cwd(), ".quirq", "journeys");

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("The .quirq folder is read-only outside development.", {
      status: 405,
    });
  }
  if (crossOrigin(request)) {
    return new Response("Cross-origin writes are refused.", { status: 403 });
  }
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) {
    return new Response("Bad slug.", { status: 400 });
  }
  // Derived journeys have no file to grow: they are generated from their note
  // on every read, so a recording written next to one would be orphaned.
  if (isDerivedSlug(slug)) {
    return new Response(`${slug} is derived; walks of it are not recorded.`, {
      status: 409,
    });
  }
  let body: {
    definition?: { slug?: string };
    recording?: { journey?: string; events?: unknown[] };
  };
  try {
    body = await request.json();
  } catch {
    return new Response("Body must carry a recording.", { status: 400 });
  }
  if (body?.recording?.journey !== slug || !Array.isArray(body.recording.events)) {
    return new Response("Recording must belong to this journey.", {
      status: 400,
    });
  }

  const file = path.join(DIR, `${slug}.json`);
  let def: Record<string, unknown> | null = null;
  try {
    def = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    def = null;
  }
  if (!def) {
    const seed = body.definition as JourneyDefinition | undefined;
    if (!seed || seed.slug !== slug) {
      return new Response("No file for this journey and nothing to seed it.", {
        status: 404,
      });
    }
    // Never seed a file the /journey page would list but refuse to load.
    const problem = validateDefinition(seed);
    if (problem) {
      return new Response(`Definition rejected: ${problem}`, { status: 400 });
    }
    def = seed as unknown as Record<string, unknown>;
  }

  def.recording = body.recording;
  await fs.mkdir(DIR, { recursive: true });
  await writeAtomic(file, JSON.stringify(def, null, 2));
  return Response.json({ recorded: body.recording.events.length });
}
