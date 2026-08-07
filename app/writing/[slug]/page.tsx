import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BodyBlock } from "@/components/prose/body";
import { SiteFooter } from "@/components/ui/footer";
import { Rise } from "@/components/ui/primitives";
import { getPost } from "@/lib/research";
import { ESSAYS, getEssay } from "../essays";
import { THOUGHTS } from "../data";
import styles from "../writing.module.css";

/**
 * One Thoughts essay.
 *
 * The piece is a companion to a research note, so the page is built from three
 * records that each stay in one place: the card in data.ts owns the title,
 * date, reading time and art; essays.ts owns the body; lib/research.ts owns
 * the study it is written about. Nothing is restated across them, so a date or
 * a title cannot disagree with itself.
 *
 * It renders through the same prose component as /research and /whitepaper, so
 * the three reading surfaces cannot drift apart.
 */

/** The card carrying this essay's metadata. Essays only ever come from Thoughts. */
const cardFor = (slug: string) => THOUGHTS.find((card) => card.slug === slug);

export function generateStaticParams() {
  return ESSAYS.map((essay) => ({ slug: essay.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const card = cardFor((await params).slug);
  if (!card) return {};

  const image = `/assets/writing/${card.img}.jpg`;

  return {
    title: card.title,
    description: card.desc,
    openGraph: {
      type: "article",
      title: card.title,
      description: card.desc,
      url: `/writing/${card.slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: card.title,
      description: card.desc,
      images: [image],
    },
  };
}

export default async function WritingEssay({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const essay = getEssay(slug);
  const card = cardFor(slug);
  if (!essay || !card) notFound();

  // The study this piece is about. Read from the research catalogue rather
  // than restated, so a retitled note retitles its companion's link too.
  const study = getPost(essay.source.slug);

  return (
    // The index page's shell, so an essay sits on the same ground the list
    // does rather than on the site's default black.
    <div className={styles.page}>
      <article className="mx-auto w-full max-w-[760px] px-5 pt-24 pb-16 sm:px-8 sm:pt-28">
      <Rise>
        <Link
          href="/writing"
          className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M7.5 2L3.5 6L7.5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Writings
        </Link>
      </Rise>

      <header className="mt-8">
        <Rise className="lg:-mx-14">
          <div className="overflow-hidden rounded-2xl border border-hair">
            <Image
              src={`/assets/writing/${card.img}.jpg`}
              alt=""
              width={1200}
              height={675}
              priority
              sizes="(min-width: 1024px) 810px, (min-width: 640px) 700px, 92vw"
              className="aspect-[2.4/1] w-full object-cover"
            />
          </div>
        </Rise>

        <Rise delay={0.05}>
          <p className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-2 font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
            <span>Thoughts</span>
            <span aria-hidden>·</span>
            <span>{card.date}</span>
            <span aria-hidden>·</span>
            <span>{card.read} read</span>
          </p>
        </Rise>

        <Rise delay={0.1}>
          <h1 className="mt-5 text-[clamp(30px,4.2vw,46px)] leading-[1.08] font-semibold tracking-[-0.03em] text-ink">
            {card.title}
          </h1>
        </Rise>

        <Rise delay={0.16}>
          <p className="mt-6 text-[17px] leading-[1.65] text-ink/70">
            {card.desc}
          </p>
        </Rise>

        {/* Said before the piece, not after it: this is a companion, and every
            figure in it belongs to the study named here. */}
        <Rise delay={0.22}>
          <p className="mt-7 border-t border-hair pt-6 text-[13.5px] leading-[1.7] text-dim">
            A companion to the research note{" "}
            <Link
              href={`/research/${essay.source.slug}`}
              className="text-ink underline decoration-hair underline-offset-4 transition-colors hover:decoration-ink"
            >
              {study?.title ?? essay.source.title}
            </Link>
            . Every figure below is that study&rsquo;s; this piece argues about
            them rather than adding to them.
          </p>
        </Rise>
      </header>

      <div className="mt-10">
        {essay.body.map((block, i) => (
          <BodyBlock key={i} block={block} />
        ))}
      </div>

      <footer className="mt-14 border-t border-hair pt-7">
        <Link
          href={`/research/${essay.source.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-hair bg-black/40 px-5 py-5 transition-colors hover:border-ink/25"
        >
          <span className="min-w-0">
            <span className="label block">Read the study</span>
            <span className="mt-2 block text-[16px] font-semibold text-ink">
              {study?.title ?? essay.source.title}
            </span>
            {study ? (
              <span className="mt-1.5 block text-[13.5px] leading-[1.6] text-dim">
                {study.dek}
              </span>
            ) : null}
          </span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className="shrink-0 rotate-180 text-dim transition-transform duration-300 group-hover:translate-x-1"
          >
            <path
              d="M7.5 2L3.5 6L7.5 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          </Link>
        </footer>
      </article>

      <div className={styles.footBase}>
        <SiteFooter />
      </div>
    </div>
  );
}
