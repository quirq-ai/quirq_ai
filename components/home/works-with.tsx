"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { PARTNERS } from "@/components/home/partner-logos";
import { classes } from "@/components/home/shell";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The credibility shelf, as a bare row rather than a section.
 *
 * It has no `Section` wrapper and no rhythm of its own because it is not a
 * chapter: it is the last thing the fold says. The hero owns its placement, so
 * the promise and the proof of the promise arrive in one screen instead of the
 * proof waiting below the scroll line where most readers never take it.
 *
 * The row changes shape twice rather than scaling one layout down. Two columns
 * on a phone and four on a tablet keep each wordmark readable; only from lg
 * does it become the single justified line the deck drew, and `flex-nowrap`
 * there is deliberate, because a row of partners that wraps to a widow reads as
 * an accident rather than as a list.
 */
export function PartnerRow({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p id="works-with-label" className="label text-center text-[9.5px]">
        WORKS WITH
      </p>

      <ul
        aria-labelledby="works-with-label"
        // Seven marks divide badly into two columns, so the seventh would sit
        // alone in the left cell and read as a mistake rather than as the end
        // of a list. Spanning the last item centres it. From sm the grid is
        // four wide and the remainder is three, which needs no help.
        className="mt-5 grid w-full grid-cols-2 items-center justify-items-center gap-x-8 gap-y-7 [&>li:last-child]:col-span-2 sm:mt-6 sm:grid-cols-4 sm:gap-x-10 sm:[&>li:last-child]:col-span-1 lg:flex lg:flex-nowrap lg:justify-between lg:gap-x-9"
      >
        {PARTNERS.map((partner, index) => (
          <motion.li
            key={partner.name}
            // The dim/lift lives here rather than on each mark: the inlined
            // wordmarks are all fill="currentColor", so one colour change on
            // the row's item drives the whole mark, whatever its path count.
            className="text-ink/40 transition-colors duration-300 hover:text-ink/80"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            // In the fold, so it enters with the hero rather than waiting for a
            // scroll that has not happened yet.
            transition={{ duration: 0.7, delay: 0.8 + index * 0.05, ease: EASE }}
          >
            {partner.kind === "svg" ? (
              <partner.Mark className={partner.className} />
            ) : (
              <Image
                src={partner.src}
                // Decorative: the sr-only name below is the one accessible
                // name for this item, so alt text here would say it twice.
                alt=""
                width={partner.width}
                height={partner.height}
                sizes="112px"
                // A raster cannot take currentColor, so this one entry matches
                // the row's two weights through opacity instead.
                className={classes(
                  partner.className,
                  "opacity-40 transition-opacity duration-300 hover:opacity-80",
                )}
              />
            )}
            <span className="sr-only">{partner.name}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
