import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { JourneyEngine } from "@/components/journey/engine";
import { POSTS, getPost } from "@/lib/research";
import { buildResearchJourney, derivedSlug } from "@/lib/research-journey";

/**
 * Interactive reading: one research note, walked instead of scrolled.
 *
 * The document is derived from the note at build time, checked by the journey
 * validator, and handed to the loading engine as a prop. The same document is
 * served as JSON at /api/journeys/research-<slug>, so this page and the API
 * cannot disagree: they call the same builder.
 */
export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};

  return {
    title: `${post.title}, interactive`,
    description: `Walk ${post.title} instead of scrolling it: pick where to start, and the glass performs the path you take. Derived from the note itself.`,
    openGraph: {
      type: "article",
      title: `${post.title}, interactive`,
      description: post.dek,
      url: `/journey/read/${post.slug}`,
      images: [
        {
          url: post.banner.src,
          width: post.banner.width,
          height: post.banner.height,
          alt: post.banner.alt,
        },
      ],
    },
  };
}

export default async function ReadInteractively({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const definition = buildResearchJourney(post);

  return (
    <StagePage>
      <JourneyEngine
        definition={definition}
        footer={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">
              This walk
            </span>
            <Button asChild variant="outline">
              <Link href={`/research/${post.slug}`}>The full note</Link>
            </Button>
            {/* The document itself, in the open: the page and the API serve
                the same derived JSON. */}
            <Button asChild variant="outline">
              <a
                href={`/api/journeys/${derivedSlug(post)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                The JSON
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/journey/load?src=${derivedSlug(post)}`}>In the loader</Link>
            </Button>
          </div>
        }
      />

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-black via-black/85 to-transparent"
        />
        <SiteFooter />
      </div>
    </StagePage>
  );
}
