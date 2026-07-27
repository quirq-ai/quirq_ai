"use client";

import { useEffect, useRef } from "react";
import { Mark, Reveal, Rise } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { LoopCta } from "@/components/ui/loop-cta";
import { registerBeat } from "@/lib/beat-registry";

export function Invite() {
  // This section keeps its own layout (the footer rides inside it), so it
  // does not use the Beat primitive; it registers with the runtime directly.
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!el.current) return;
    return registerBeat({ id: "invite", index: 4, el: el.current });
  }, []);

  return (
    <section
      ref={el}
      id="invite"
      data-beat={4}
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      <div className="flex flex-1 items-center py-28">
        <div className="relative mx-auto w-full max-w-[1180px] px-5 text-center sm:px-8 lg:px-11">
          <GlassPool scrimClassName="mx-auto max-w-3xl">
          <h2 className="display over-stage mx-auto max-w-[16ch]">
            <Reveal delay={0.05}>Close the loop</Reveal>
            <Reveal delay={0.13}>
              <GlassText>on every run.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.24}>
            <p className="lede over-stage mx-auto mt-7 text-center">
              Tighten the engineering loop between an agent&apos;s action and a
              verified outcome.
            </p>
          </Rise>

          <Rise delay={0.34} className="mt-10">
            <LoopCta />
          </Rise>
          </GlassPool>
        </div>
      </div>

      <footer className="relative">
        {/* The form is at its largest here and fills the lower frame, so the
            footer needs a base to sit on rather than floating over the glass. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-linear-to-t from-black via-black/90 to-transparent"
        />
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-end justify-between gap-7 px-5 pb-9 sm:px-8 lg:px-11">
          <div>
            <div className="flex items-center gap-2.5">
              <Mark className="h-[18px] w-auto text-ink" />
              <span className="font-mark text-[17px] font-semibold">quirq</span>
              <span className="text-[13px] text-faint">· by XO Labs</span>
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
              Tokens meter consumption.{" "}
              <span className="glass-text">Quirqs meter delivery.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-5 sm:gap-7">
            {[
              { href: "/whitepaper", label: "Whitepaper", newTab: false },
              { href: "/llm.txt", label: "llm.txt", newTab: true },
              { href: "https://xo.builders", label: "xo.builders", newTab: true },
              { href: "mailto:suraj@xo.builders", label: "Contact", newTab: false },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                className="label px-2 py-2 -mx-2 -my-2 transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="spectrum-rule h-px w-full opacity-50" />
      </footer>
    </section>
  );
}
