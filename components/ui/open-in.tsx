"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn, CTA_SPRING } from "./primitives";
import {
  AnthropicIcon,
  ClaudeCodeIcon,
  CodexIcon,
  CursorIcon,
  OpenaiIcon,
} from "./brand-icons";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The context handoff. Every target receives the same closed-loop engineering
 * brief, so the CTA moves from positioning to a concrete setup conversation.
 */
const PROMPT = encodeURIComponent(
  "Help me close the loop on agentic engineering with quirq. Read https://quirq.ai/llm.txt, then inspect my current project and identify the shortest feedback loop from an agent action to an environment snapshot, a verified outcome, and a ledger result. Explain the mint rule briefly, then give me a concrete setup plan with the exact commands and files needed for this project.",
);

type Target = {
  name: string;
  note: string;
  href: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

/* URL schemes verified against what the "Open in" menus on shadcn, Expo,
   GitBook and Vercel docs ship in 2026. Every link prefills the agent's
   composer; nothing auto-runs. Codex has no browser route, so it is the one
   protocol link that needs its app installed. */
const TARGETS: Target[] = [
  {
    name: "Claude Code",
    note: "claude.ai/code",
    href: `https://claude.ai/code/new?q=${PROMPT}`,
    Icon: ClaudeCodeIcon,
  },
  {
    name: "Codex",
    note: "needs the app",
    href: `codex://new?prompt=${PROMPT}`,
    Icon: CodexIcon,
  },
  {
    name: "Cursor",
    note: "cursor.com/link",
    href: `https://cursor.com/link/prompt?text=${PROMPT}`,
    Icon: CursorIcon,
  },
  {
    name: "Claude",
    note: "claude.ai",
    href: `https://claude.ai/new?q=${PROMPT}`,
    Icon: AnthropicIcon,
  },
  {
    name: "ChatGPT",
    note: "chatgpt.com",
    href: `https://chatgpt.com/?q=${PROMPT}`,
    Icon: OpenaiIcon,
  },
];

/* The marks shown on the button itself. A row of logos says "this opens in
   your agent" faster than any label can, so the control leads with them and
   the words only confirm it. */
const LEAD = TARGETS.slice(0, 3);

const MENU_WIDTH = 256; // w-64, needed to clamp the fixed panel to the viewport
const GAP = 10;

type Anchor = { top: number; left: number };

/**
 * The closed-loop CTA opens an agent handoff menu. The whole pill is one
 * disclosure button, so there is no false primary action and no email detour.
 * The same control appears in the nav, hero, and final invite.
 *
 * The menu renders through a portal at a fixed position. The hero lives in a
 * section that clips its overflow (the text scrims bleed past the page edge),
 * so an in-flow absolute panel would be cut off at the section boundary.
 */
export function OpenIn({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "nav";
  className?: string;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const open = anchor !== null;
  const host = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const reduced = useReducedMotion();
  const hero = variant === "hero";

  /** Close and hand focus back to the trigger if it was inside the panel:
      the panel portals to document.body, so without this a keyboard user is
      dropped at the end of the document when it unmounts. */
  const close = () => {
    if (panel.current?.contains(document.activeElement)) {
      trigger.current?.focus();
    }
    setAnchor(null);
  };

  const place = (): Anchor | null => {
    const rect = host.current?.getBoundingClientRect();
    if (!rect) return null;
    // Hero: centred under the button. Nav: right-aligned to it. Both clamped
    // so the panel never leaves the viewport.
    const ideal = hero
      ? rect.left + rect.width / 2 - MENU_WIDTH / 2
      : rect.right - MENU_WIDTH;
    const left = Math.min(
      Math.max(ideal, 12),
      window.innerWidth - MENU_WIDTH - 12,
    );
    return { top: rect.bottom + GAP, left };
  };

  // Light-dismiss on pointer-outside and Escape. Scroll and resize re-anchor
  // the fixed panel to the button instead of closing: Lenis keeps emitting
  // scroll events as it settles, and closing on them kills the menu the same
  // frame it opens.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!host.current?.contains(t) && !panel.current?.contains(t)) {
        setAnchor(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const follow = () => setAnchor((a) => (a ? place() : a));
    // Focus rides into the panel so Tab walks the links in order; the portal
    // otherwise leaves them at the far end of the document's tab sequence.
    panel.current?.querySelector("a")?.focus();
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={host} className={cn("relative", className)}>
      {/* Same gesture as the invite CTA: spring lift + spectrum bloom. The
          bloom lives on this wrapper because the pill clips its overflow for
          the segment divider, which would crop the halo. */}
      <motion.div
        className="group relative inline-flex"
        whileHover={{ y: hero ? -3 : -2 }}
        transition={CTA_SPRING}
      >
        <span
          aria-hidden
          // `cta-bloom`: same noscript hook as ActionLink's bloom. See there.
          className="cta-bloom absolute -inset-px -z-10 rounded-full opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-70"
          style={{ background: "var(--spectrum)" }}
        />
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label="Close the loop with your agent"
          onClick={() => setAnchor(open ? null : place())}
          className={cn(
            "openin-toggle focus-on-ink inline-flex items-stretch overflow-hidden rounded-full bg-ink font-mono text-void uppercase transition-opacity hover:opacity-85",
            hero
              ? "py-3.5 pl-6 text-[11.5px] tracking-[0.14em]"
              : "py-2 pl-4 text-[10.5px] tracking-[0.14em]",
          )}
        >
          <span
            className={cn(
              "inline-flex items-center",
              hero ? "gap-2.5 pr-4" : "gap-2 pr-2.5",
            )}
          >
            {/* The marks carry the agent affordance; the label carries intent. */}
            <span
              aria-hidden
              className={cn("flex items-center", hero ? "gap-1.5" : "gap-1")}
            >
              {LEAD.map((target) => (
                <target.Icon
                  key={target.name}
                  className={hero ? "h-[15px] w-[15px]" : "h-3 w-3"}
                />
              ))}
            </span>
            <span>Close the loop</span>
          </span>

          <span
            aria-hidden
            className={cn(
              "w-px self-stretch bg-void/20",
              hero ? "my-[-4px]" : "my-[-2px]",
            )}
          />
          <span
            aria-hidden
            className={cn(
              "inline-flex items-center justify-center",
              hero ? "w-11" : "w-9",
            )}
          >
            <motion.svg
              width={hero ? 12 : 10}
              height={hero ? 12 : 10}
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </span>
        </button>
      </motion.div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {/* A disclosure of plain links, not an ARIA menu: links carry no
                menuitem semantics, so Tab/Shift+Tab is the whole keyboard
                contract and no arrow-key handling is owed. */}
            {open && (
              <motion.div
                ref={panel}
                id={menuId}
                aria-label="Open quirq in an agent"
                initial={
                  reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
                }
                animate={
                  reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
                }
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{
                  top: anchor?.top,
                  left: anchor?.left,
                  width: MENU_WIDTH,
                }}
                className="fixed z-[70] overflow-hidden rounded-2xl border border-hair bg-black/85 shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-xl"
              >
                <p className="border-b border-hair-soft px-4 pb-2.5 pt-3 font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">
                  Choose your agent
                </p>
                <div className="py-1.5">
                  {TARGETS.map((target) => (
                    <a
                      key={target.name}
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={close}
                      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.06]"
                    >
                      <target.Icon className="h-[17px] w-[17px] shrink-0 text-dim transition-colors group-hover:text-ink" />
                      <span className="flex-1">
                        <span className="block text-[13.5px] font-medium text-ink">
                          Close the loop in {target.name}
                        </span>
                        <span className="block font-mono text-[9.5px] tracking-[0.08em] text-faint">
                          {target.note}
                        </span>
                      </span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className="text-dim opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                      >
                        <path
                          d="M2 10L10 2M10 2H4M10 2V8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
