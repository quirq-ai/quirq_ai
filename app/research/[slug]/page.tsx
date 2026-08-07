import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  POSTS,
  getPost,
  getTopic,
  neighbours,
  noteNumber,
  relatedPosts,
  type Post,
} from "@/lib/research";
import { PostBanner } from "@/components/research/banner";
import { PostCard } from "@/components/research/card";
import { BodyBlock } from "@/components/prose/body";
import { Rise } from "@/components/ui/primitives";

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

  // The banner doubles as the share card: one image per note, so a shared
  // link is recognisably that note rather than the site's generic card.
  const image = {
    url: post.banner.src,
    width: post.banner.width,
    height: post.banner.height,
    alt: post.banner.alt,
  };

  return {
    title: post.title,
    description: post.dek,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.dek,
      url: `/research/${post.slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.dek,
      images: [post.banner.src],
    },
  };
}

/** One neighbour in the program: the note before or after this one. */
function NeighbourLink({
  post,
  direction,
}: {
  post: Post;
  direction: "previous" | "next";
}) {
  const back = direction === "previous";

  return (
    <Link
      href={`/research/${post.slug}`}
      rel={back ? "prev" : "next"}
      className={`group flex items-center gap-4 rounded-2xl border border-hair bg-black/40 px-5 py-5 transition-colors hover:border-ink/25 ${
        back ? "" : "flex-row-reverse text-right"
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className={`shrink-0 text-dim transition-transform duration-300 ${
          back
            ? "group-hover:-translate-x-1"
            : "rotate-180 group-hover:translate-x-1"
        }`}
      >
        <path
          d="M7.5 2L3.5 6L7.5 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="min-w-0">
        <span className="label block">{back ? "Previous" : "Next"}</span>
        <span className="mt-2 block truncate text-[16px] font-semibold text-ink">
          {post.title}
        </span>
      </span>
    </Link>
  );
}

export default async function ResearchPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const topic = getTopic(post.topic);
  const { previous, next } = neighbours(post);
  const related = relatedPosts(post, 2, [previous, next]);

  return (
    <article className="mx-auto w-full max-w-[760px] px-5 pt-24 sm:px-8 sm:pt-28">
      <Rise>
        <Link
          href="/research"
          className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M7.5 2L3.5 6L7.5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Research
        </Link>
      </Rise>

      <header className="mt-8">
        {/* Bleeds past the text column at lg so the banner reads as the note's
            plate rather than a figure inside the prose. */}
        <Rise className="lg:-mx-14">
          <PostBanner
            banner={post.banner}
            priority
            sizes="(min-width: 1024px) 810px, (min-width: 640px) 700px, 92vw"
            className="aspect-[2.4/1] w-full"
          />
        </Rise>

        <Rise delay={0.05}>
          <p className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-2 font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
            <span className="numeric">
              Note {String(noteNumber(post)).padStart(2, "0")}
            </span>
            <span aria-hidden>·</span>
            {topic && (
              <>
                {/* The one cross-link out of an article into its shelf. */}
                <Link
                  href={`/research/topic/${topic.slug}`}
                  className="text-dim underline decoration-hair underline-offset-4 transition-colors hover:text-ink"
                >
                  {topic.label}
                </Link>
                <span aria-hidden>·</span>
              </>
            )}
            <span>
              {[post.tag, post.date, `${post.readingMinutes} min read`]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </p>
        </Rise>
        <Rise delay={0.1}>
          <h1 className="mt-5 text-[clamp(30px,4.4vw,50px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            {post.title}
          </h1>
        </Rise>
        <Rise delay={0.16}>
          <p className="mt-6 text-[17px] leading-[1.65] text-dim">{post.dek}</p>
        </Rise>

        {/* The other way to read it. A plain Link, not the stage CTA: this
            goes to a page that mounts the 3D shot, and the walk is the point,
            not the button. */}
        <Rise delay={0.2}>
          <Link
            href={`/journey/read/${post.slug}`}
            className="group mt-8 inline-flex items-center gap-3 rounded-full border border-hair bg-black/40 py-2 pr-5 pl-2 transition-colors hover:border-ink/25"
          >
            <span
              aria-hidden
              className="h-7 w-7 rounded-full"
              style={{ background: "var(--spectrum)" }}
            />
            <span className="font-mono text-[10.5px] tracking-[0.14em] text-ink uppercase">
              Read it interactively
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.1em] text-faint sm:inline">
              pick your path, the glass follows
            </span>
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="text-dim transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path
                d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </Rise>

        <Rise delay={0.24}>
          <div className="spectrum-rule mt-9 h-px w-14" />
        </Rise>
      </header>

      {/* Not a Rise: whileInView needs a quarter of the element on screen at
          once, which a long article body can never satisfy, so a wrapped body
          would simply stay invisible. Long-form text needs no entrance. */}
      <div>
        {post.body.map((block, i) => (
          <BodyBlock key={i} block={block} />
        ))}

        <p className="mt-14 border-t border-hair-soft pt-6 font-mono text-[10.5px] leading-relaxed tracking-[0.08em] text-faint">
          Adapted from the XO research program · canonical version at{" "}
          <a
            href={post.source}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-dim"
          >
            docs.xo.builders
          </a>
        </p>
      </div>

      {(previous || next) && (
        <Rise delay={0.05}>
          <nav
            aria-label="Notes either side of this one"
            className="mt-12 grid gap-4 sm:grid-cols-2"
          >
            {previous && <NeighbourLink post={previous} direction="previous" />}
            {/* Column two even when there is no previous note, so `next`
                always sits on the side its arrow points to. */}
            {next && (
              <div className="sm:col-start-2">
                <NeighbourLink post={next} direction="next" />
              </div>
            )}
          </nav>
        </Rise>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-hair pt-12">
          <Rise>
            {/* Not "more in <topic>": the list falls back to the wider
                program once a topic runs out, so a topic heading would lie. */}
            <h2 className="label">Keep reading</h2>
          </Rise>
          <div className="mt-8 grid gap-x-7 gap-y-12 sm:grid-cols-2">
            {related.map((it, i) => (
              <Rise key={it.slug} delay={0.06 + i * 0.06}>
                <PostCard post={it} />
              </Rise>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
