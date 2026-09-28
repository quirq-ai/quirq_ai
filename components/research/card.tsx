import Link from "next/link";
import { noteNumber, type Post } from "@/lib/research";
import { PostBanner } from "./banner";

const pad = (n: number) => String(n).padStart(2, "0");

/** Mono meta line: note number, then the fine-grained tag. */
function CardMeta({ post }: { post: Post }) {
  return (
    <span className="mt-5 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
      <span className="numeric">{pad(noteNumber(post))}</span>
      <span aria-hidden className="h-px w-4 bg-border" />
      <span>{post.tag}</span>
    </span>
  );
}

function ReadMeta({ post }: { post: Post }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
      {[post.date, `${post.readingMinutes} min read`].filter(Boolean).join(" · ")}
    </span>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One note in the index grid. */
export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <Link href={`/research/${post.slug}`} className="group flex flex-col">
      <PostBanner
        banner={post.banner}
        zoom
        priority={priority}
        sizes="(min-width: 1024px) 366px, (min-width: 640px) 45vw, 92vw"
        className="aspect-[16/9] w-full"
      />

      <CardMeta post={post} />

      <span className="mt-3 block text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground">
        {post.title}
      </span>
      {/* No `block` here: line-clamp sets its own display, and the two
          utilities land in the same layer, so one silently cancels the other. */}
      <span className="mt-2.5 line-clamp-3 text-[14px] leading-[1.65] text-muted-foreground">
        {post.dek}
      </span>

      <span className="mt-4 flex items-center gap-2 text-muted-foreground">
        <ReadMeta post={post} />
        <Arrow className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
      </span>
    </Link>
  );
}

/**
 * The feature at the top of a page-one listing: the same record, given the
 * width of the column and a real banner instead of a thumbnail.
 */
export function LeadCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/research/${post.slug}`}
      className="group grid items-center gap-7 lg:grid-cols-[1.2fr_1fr] lg:gap-11"
    >
      <PostBanner
        banner={post.banner}
        zoom
        priority
        sizes="(min-width: 1024px) 620px, 92vw"
        className="aspect-[16/10] w-full"
      />

      <span className="block">
        <span className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-sm"
            style={{ background: "var(--primary)" }}
          />
          {/* Not "latest": POSTS is in reading order, not publication order,
              so the lead is the entry point rather than the newest note. */}
          <span>Start here</span>
          <span aria-hidden className="h-px w-4 bg-border" />
          <span className="numeric">{pad(noteNumber(post))}</span>
          <span aria-hidden className="h-px w-4 bg-border" />
          <span>{post.tag}</span>
        </span>

        <span className="mt-4 block text-[clamp(25px,3vw,34px)] font-semibold leading-[1.12] tracking-[-0.025em] text-foreground">
          {post.title}
        </span>
        <span className="mt-4 block max-w-[52ch] text-[15px] leading-[1.7] text-muted-foreground">
          {post.dek}
        </span>

        <span className="mt-6 flex items-center gap-3 text-muted-foreground">
          <ReadMeta post={post} />
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors duration-300 group-hover:border-input group-hover:text-foreground"
          >
            <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}
