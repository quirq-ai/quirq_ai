"use client";

import { CARD, Section, TYPE, classes } from "@/components/home/shell";
import { Mark, Reveal, Rise } from "@/components/ui/primitives";
import { InstallCommand } from "@/components/ui/install-command";
import {
  ClaudeCodeIcon,
  CursorIcon,
  DeepseekIcon,
  OpenaiIcon,
} from "@/components/ui/brand-icons";

/**
 * The install shelf.
 *
 * Three things move away from the deck here, all for the same reason: the deck
 * shipped pictures of things the site already has as live components.
 *
 *   - The 72px mark was `mark-install.svg`. It is drawn in DOM instead, so the
 *     ring is a border and the glyph inherits `currentColor`.
 *   - The command was a static `<code>` block. `InstallCommand` renders the
 *     same string plus the copy button, the live region and the noscript hook.
 *   - The runtime row was a baked launcher raster. The site's own monochrome
 *     marks tint on hover and survive a 2x display.
 *
 * The card also absolutely-positioned its contents at fixed offsets; this is
 * flow layout, so the tiles cannot slide out from under their label when the
 * copy reflows.
 */

const RUNTIMES = [
  { name: "Claude", Icon: ClaudeCodeIcon },
  { name: "OpenAI", Icon: OpenaiIcon },
  { name: "Cursor", Icon: CursorIcon },
  { name: "DeepSeek", Icon: DeepseekIcon },
] as const;

export function Install() {
  return (
    <Section id="home-install" labelledBy="install-title" rhythm="normal">
      <div className="grid gap-y-12 lg:grid-cols-2 lg:items-start lg:gap-x-[clamp(48px,6.5vw,110px)]">
        <Rise className="w-full max-w-[480px] lg:max-w-none">
          <span
            aria-hidden
            className="grid h-16 w-16 place-items-center rounded-full border border-hair sm:h-[72px] sm:w-[72px]"
          >
            <Mark className="h-7 w-auto text-ink" />
          </span>

          <h2 id="install-title" className={classes(TYPE.heading, "mt-7")}>
            <Reveal delay={0.05}>Install on your local hardware</Reveal>
          </h2>

          <p className="lede mt-5 text-[clamp(13px,1.05vw,15.5px)]">
            Install our local observability tools so you can monitor your usage
            right away.
          </p>
        </Rise>

        <Rise delay={0.28} className="w-full max-w-[480px] lg:max-w-none">
          {/* Demoted from the deck's second <h2>: one section, one h2, and this
              card is a part of "Install on your local hardware" rather than a
              sibling of it. The string is unchanged. */}
          <div className={`${CARD} flex flex-col gap-5 p-6 sm:p-7`}>
            <h3 className="text-[clamp(18px,1.6vw,25px)] leading-[1.3] font-bold tracking-[-0.04em] text-ink">
              Get Started
            </h3>

            <div>
              <p className="label">RUN IN YOUR SHELL</p>
              {/* InstallCommand centres itself for the hero; shrink-wrapping it
                  is what lets it sit flush with the labels above and below. */}
              <div className="mt-3 w-fit">
                <InstallCommand />
              </div>
            </div>

            <div>
              <p className="label">SUPPORTED RUNTIMES</p>
              <ul className="mt-3.5 flex gap-2.5">
                {RUNTIMES.map(({ name, Icon }) => (
                  <li
                    key={name}
                    className="group grid h-11 w-11 place-items-center rounded-[8px] border border-white/[0.18] transition-colors hover:border-white/40 sm:h-[50px] sm:w-[50px]"
                  >
                    {/* `title` gives the mark its own accessible name, which is
                        why the tiles need no ARIA scaffolding. */}
                    <Icon
                      title={name}
                      className="h-5 w-5 text-white/72 transition-colors group-hover:text-ink"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Rise>
      </div>
    </Section>
  );
}
