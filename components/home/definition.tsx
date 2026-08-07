"use client";

import Image from "next/image";
import Link from "next/link";
import { Section, TYPE, classes } from "@/components/home/shell";
import { Reveal, Rise } from "@/components/ui/primitives";

/**
 * The first chapter break: one question, one answer, one quiet way out.
 *
 * The three lines of the answer are hard `<br>`s carried from the deck, not
 * a measure the browser happened to choose. They are the argument's rhythm
 * (claim, method, name), so no `hidden sm:inline` guards: on a phone they
 * simply become three short lines, which is still the phrasing.
 *
 * No `ActionLink` here on purpose. "Read the Research" is an aside, and a
 * solid pill would put a third CTA on a page that already spends its two on
 * the hero and the layer stack.
 */
export function Definition() {
  return (
    <Section
      id="home-definition"
      labelledBy="definition-title"
      rhythm="chapter"
      className="isolate overflow-hidden"
    >
      {/*
        A band behind the headline rather than a cover over the section: the
        export is a horizon of light, and stretched to full section height it
        turns into a wash that greys the copy underneath. `mix-blend-screen`
        because the PNG is an opaque near-black plate: screen is what removes
        the rectangle, not a mood choice.

        It sits high and runs at half strength. At full opacity, centred on the
        headline, this plate is the brightest and most saturated thing on the
        page at that moment: a magenta bar that the type has to fight rather
        than sit in. Lifting it so its core lands above the cap line makes it
        read as a light source the headline is standing under, which is what a
        horizon is supposed to do.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[clamp(110px,12vw,170px)] sm:top-4"
      >
        <Image
          src="/assets/home-v9/definition-glow.png"
          alt=""
          fill
          sizes="100vw"
          className="plate-band object-cover opacity-55 mix-blend-screen"
        />
      </div>

      <div className="mx-auto max-w-[720px] text-center">
        <h2
          id="definition-title"
          className={classes(TYPE.chapterHeading, "over-stage")}
        >
          <Reveal delay={0.05}>What is a quirq?</Reveal>
        </h2>

        <Rise delay={0.22}>
          {/*
            `.lede` is unlayered in globals.css, so it outranks any Tailwind
            utility that touches the same property. This deck line runs on its
            own measure, size and leading, so the three that collide are marked
            important; the class is still worth keeping for its ink colour and
            its baseline behaviour.
          */}
          <p className="lede over-stage mx-auto mt-5 max-w-[58ch]! text-[clamp(13.5px,1.15vw,17px)]! leading-[1.62]! font-normal tracking-[-0.012em]">
            More tokens does not equal more work.
            <br />
            We use machine-level observability and high-level math
            <br />
            to calculate the true unit of work:{" "}
            <strong className="font-bold text-ink">the quirq.</strong>
          </p>
        </Rise>

        <Rise delay={0.3}>
          <Link
            href="/research/the-quirq"
            className="mt-6 inline-block font-mono text-[11.5px] tracking-[0.12em] text-dim uppercase transition-colors hover:text-ink"
          >
            Read the Research →
          </Link>
        </Rise>
      </div>
    </Section>
  );
}
