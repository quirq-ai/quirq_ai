"use client";

import {
  ActionLink,
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
  cn,
} from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { FigureView } from "./figure";
import type { BeatData } from "./types";

/**
 * One generic component renders any story beat from its data. /dynamic,
 * /scenes and the /editor all compose their middles from this.
 */

/** One component renders every beat of this page from its data. */
export function StoryBeat({ data }: { data: BeatData }) {
  const center = data.layout === "center";
  const titleLines = data.title.map((line, i) =>
    data.glass === i ? <GlassText key={i}>{line}</GlassText> : line,
  );

  return (
    <Beat index={data.index} id={data.id}>
      <div
        className={cn(
          "relative",
          center && "over-stage flex flex-col items-center text-center",
          !center && "max-w-2xl",
          data.layout === "left" && "md:max-w-[62%]",
          data.layout === "right" && "md:ml-auto md:max-w-[62%]",
        )}
      >
        <GlassPool scrimClassName={center ? "mx-auto max-w-3xl" : undefined}>
          {data.marker && <Marker>{data.marker}</Marker>}

          {center ? (
            <h2 className="display mx-auto max-w-[16ch]">
              <Reveal delay={0.05}>{titleLines[0]}</Reveal>
              <Reveal delay={0.13}>{titleLines[1]}</Reveal>
            </h2>
          ) : (
            <h2
              className={cn("over-stage mt-8", data.panelRows ? "display-sm" : "display")}
            >
              <Reveal delay={0.05}>{titleLines[0]}</Reveal>
              <Reveal delay={0.13}>{titleLines[1]}</Reveal>
            </h2>
          )}

          {data.lede && (
            <Rise delay={0.24}>
              <p className={cn("lede over-stage mt-7", center && "mx-auto text-center")}>
                {data.lede}
              </p>
            </Rise>
          )}

          {data.figure && (
            <Rise delay={0.28}>
              <FigureView figure={data.figure} />
            </Rise>
          )}

          {data.rows && (
            <div className="mt-9">
              {data.rows.map((row, i) => (
                <Rise key={row.title} delay={0.28 + i * 0.07}>
                  <div className="flex gap-5 border-t border-hair py-4.5 sm:gap-7">
                    <span className="font-mono text-[11px] text-faint">0{i + 1}</span>
                    <div>
                      <p className="over-stage text-[15.5px] font-medium text-ink">
                        {row.title}
                      </p>
                      <p className="over-stage mt-1 text-[13.5px] leading-relaxed text-dim">
                        {row.note}
                      </p>
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
          )}

          {data.tiles && (
            <Rise delay={0.28} className="mt-9">
              <div className="grid gap-px overflow-hidden rounded-2xl border border-hair bg-white/6 backdrop-blur-xl">
                {data.tiles.map((tile) => (
                  <div key={tile.label} className="bg-black/55 px-5 py-4.5 sm:px-6">
                    <p className="label text-[9.5px]">{tile.label}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-dim">
                      {tile.body}
                    </p>
                  </div>
                ))}
              </div>
            </Rise>
          )}

          {data.code && (
            <Rise delay={0.36} className="mt-4">
              <pre className="overflow-x-auto rounded-2xl border border-hair-soft bg-black/55 p-5 font-mono text-[12px] leading-[1.7] text-ink/80 backdrop-blur-xl">
                {data.code}
              </pre>
            </Rise>
          )}

          {data.panelRows && (
            <Rise delay={0.24} className="mt-9">
              <div className="overflow-hidden rounded-2xl border border-hair bg-black/50 backdrop-blur-xl">
                {data.panelRows.map((row, i) => (
                  <div
                    key={row.title}
                    className={cn(
                      "flex items-start gap-4 px-5 py-4 sm:gap-6 sm:px-6",
                      i > 0 && "border-t border-hair-soft",
                    )}
                  >
                    <span className="w-4 shrink-0 pt-0.5 text-center font-mono text-[11px] text-faint">
                      0{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-medium text-ink">{row.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-dim">
                        {row.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Rise>
          )}

          {data.caption && (
            <Rise delay={0.42} className="relative mt-5">
              {!center && <TextScrim />}
              <p className="over-stage relative font-mono text-[10.5px] leading-relaxed text-dim">
                {data.caption}
              </p>
            </Rise>
          )}

          {data.links && (
            <Rise
              delay={0.34}
              className={cn(
                "mt-11 flex flex-wrap items-center gap-3",
                center && "justify-center",
              )}
            >
              {data.links.map((link) => (
                <ActionLink
                  key={link.href}
                  href={link.href}
                  tone={link.tone}
                  newTab={link.newTab}
                >
                  {link.label}
                </ActionLink>
              ))}
            </Rise>
          )}
        </GlassPool>
      </div>
    </Beat>
  );
}
