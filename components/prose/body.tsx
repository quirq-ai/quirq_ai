import type { Block } from "@/lib/prose";
import { FigureView } from "@/components/story/figure";
import { figureFromChart } from "@/lib/chart-figure";

/**
 * One block of long-form article body. Kinds map 1:1 to the shapes in
 * lib/prose.ts.
 *
 * Every reading surface renders through here: research notes
 * (app/research/[slug]) and the whitepaper (app/whitepaper). Lifting it out of
 * one page is what keeps a second, subtly different set of prose styles from
 * appearing the next time a surface needs to show a table.
 *
 * Server component. It reaches figure.tsx, which must not import from a
 * "use client" module, so keep this file free of client imports too.
 */
export function BodyBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "h2":
      return (
        <h2 className="mt-14 text-[clamp(21px,2.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-10 text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {block.text}
        </h3>
      );
    case "p": {
      // A chart paragraph carries its numbers in the sentence, so where the
      // figure generator can read them the note shows the chart instead of
      // describing it. Where it cannot, the sentence stands unchanged.
      const figure = figureFromChart(block.text);
      if (figure) return <FigureView figure={figure} />;
      return (
        <p className="mt-5 text-[15.5px] leading-[1.8] text-ink/70">
          {block.text}
        </p>
      );
    }
    case "quote":
      return (
        <blockquote className="relative mt-7 pl-5 text-[16.5px] leading-[1.7] text-ink/90">
          <span
            aria-hidden
            className="absolute inset-y-1 left-0 w-px"
            style={{ background: "var(--spectrum)" }}
          />
          {block.text}
        </blockquote>
      );
    case "code":
      return (
        // Focusable because it scrolls: without tabIndex the clipped part is
        // unreachable by keyboard. The global :focus-visible ring styles it.
        <pre
          tabIndex={0}
          role="region"
          aria-label="Code"
          className="mt-6 overflow-x-auto rounded-xl border border-hair-soft bg-white/[0.04] p-4 font-mono text-[12.5px] leading-[1.7] text-ink/80"
        >
          {block.text}
        </pre>
      );
    case "table":
      return (
        <div
          tabIndex={0}
          role="region"
          aria-label="Table"
          className="mt-6 overflow-x-auto rounded-xl border border-hair-soft"
        >
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair-soft bg-white/[0.03]">
                {block.header.map((cell, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr
                  key={r}
                  className="border-b border-hair-soft last:border-b-0"
                >
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={
                        c === 0
                          ? "px-4 py-2.5 text-[13px] text-ink/85"
                          : "numeric px-4 py-2.5 font-mono text-[12.5px] text-ink/70 tabular-nums"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "list":
      return (
        <ul className="mt-5 space-y-2.5">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-[15.5px] leading-[1.7] text-ink/70"
            >
              <span
                aria-hidden
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
  }
}
