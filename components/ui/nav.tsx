"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn, Mark } from "./primitives";
import { OpenIn } from "./open-in";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Every route in the bar, in rank order, and the width at which each one earns
 * a seat.
 *
 * Demo and Journey remain fully routable, but stay out of primary navigation
 * while they are supporting experiences rather than top-level destinations.
 * Below its own breakpoint a listed route is reached through the drawer. On
 * phones the closed-loop CTA gets the whole action side of the bar and the
 * drawer carries the navigation.
 *
 * The whitepaper left the bar too. It is the argument rather than a
 * destination, and /research now opens with it: the masthead there carries the
 * paper's title and both ways in, the page and the typeset PDF. The footer
 * keeps a link from every other route.
 *
 * Beats stays in the footer: it is a dev deep-dive and it was the cheapest
 * seat to give up.
 */
const ROUTES = [
  { href: "/dashboard", label: "Dashboard", from: "sm" },
  { href: "/what-is-quirq", label: "What is quirq", from: "lg" },
  { href: "/how-it-works", label: "How it works", from: "xl" },
  { href: "/research", label: "Research", from: "xl" },
] as const;

/** Written out rather than composed: Tailwind reads class names, not strings. */
const SEAT = {
  sm: "hidden sm:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
} as const;

/**
 * The routes that run the 3D shot. Every page runs it now, so the glass bar is
 * the rule and the opaque one is the exception. /demo and /dashboard joined
 * once the scroll runtime started observing section heights: an interactive
 * surface that grows after mount no longer desyncs the choreography from the
 * copy. /research is absent on purpose: it is long-form text and mounts no
 * stage, so its bar keeps a real background.
 */
const STAGE_ROUTES = [
  "/what-is-quirq",
  "/how-it-works",
  "/beats",
  "/whitepaper",
  "/demo",
  "/dashboard",
  "/journey",
  "/engine",
];

/** The width at which every route has a seat, so the drawer is redundant. */
const ALL_SEATED = "(min-width: 80rem)";

/** The active-page marker. Hover only ever gets ink; the spectrum means here. */
function Tick() {
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 rounded-[2px]"
      style={{ background: "var(--spectrum)" }}
    />
  );
}

export function Nav() {
  const pathname = usePathname();
  const home = pathname === "/";
  const onStage =
    home || STAGE_ROUTES.some((route) => pathname.startsWith(route));

  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname.startsWith(href);

  // A navigation is the drawer's whole purpose, so it closes on arrival.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    // The page underneath stays put while the drawer is over it.
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";

    // Widening past xl hides the drawer by media query; without this the lock
    // above would survive it and leave the page unscrollable.
    const seated = window.matchMedia(ALL_SEATED);
    const sync = () => {
      if (seated.matches) setOpen(false);
    };
    sync();

    window.addEventListener("keydown", onKey);
    seated.addEventListener("change", sync);
    return () => {
      window.removeEventListener("keydown", onKey);
      seated.removeEventListener("change", sync);
      root.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      {/* Scroll progress. Driven by the --scroll custom property the scroll
          runtime writes each frame, so it costs no React renders. Pages
          without the runtime leave it at 0, so the rule simply never shows. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px">
        <div
          className="spectrum-rule h-full origin-left"
          style={{ transform: "scaleX(var(--scroll))" }}
        />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        // The long delay belongs to the stage entrance choreography; text
        // pages shouldn't wait for an entrance that isn't happening.
        transition={{
          duration: 0.9,
          delay: onStage ? 0.8 : 0.1,
          ease: EASE,
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-11",
          // The drawer slides out behind the bar, so while it is open the bar
          // needs its own surface on every route, stage or not.
          (!onStage || open) && "border-b border-hair-soft bg-black/60 backdrop-blur-xl",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label={home ? "quirq, back to top" : "quirq, home"}
        >
          <Mark className="h-[19px] w-auto" />
          <span className="font-mark text-[19px] font-semibold tracking-tight">
            quirq
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          {ROUTES.map((route) => {
            const active = isActive(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? "page" : undefined}
                // Invisible padding: the 10px label alone is far under a
                // usable touch target, and the transparent bleed moves no
                // geometry.
                className={cn(
                  // nowrap because a two-word label breaking mid-phrase inside
                  // a 64px bar is the ugliest way to run out of room.
                  "label items-center gap-2 px-2 py-3 -mx-2 -my-3 whitespace-nowrap transition-colors hover:text-ink",
                  SEAT[route.from],
                  active && "text-ink",
                )}
              >
                {active && <Tick />}
                {route.label}
              </Link>
            );
          })}

          {/* Gone at xl, where every route already has a seat. Hidden without
              JavaScript too: an inert control is worse than none, and the
              footer keeps the site reachable on that path. */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen((was) => !was)}
            className="menu-toggle -mx-2 -my-3 inline-flex items-center px-2 py-3 text-dim transition-colors hover:text-ink xl:hidden"
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute left-0 h-px w-full bg-current transition-all duration-300",
                  open ? "top-1/2 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-px w-full bg-current transition-all duration-300",
                  open ? "top-1/2 -rotate-45" : "top-full",
                )}
              />
            </span>
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>

          <OpenIn variant="nav" />
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            {/* A real button, not a clickable div, so dismissing the drawer is
                reachable and announced rather than mouse-only. */}
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-0 z-20 cursor-default bg-black/70 backdrop-blur-sm xl:hidden"
            />

            <motion.div
              id="site-drawer"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              // Under the bar (z-40), not over it: the bar stays legible and
              // its toggle stays live, which is what closes this again. The
              // top padding is the bar's own height.
              className="fixed inset-x-0 top-0 z-30 border-b border-hair bg-black/95 pt-16 backdrop-blur-2xl xl:hidden"
            >
              <nav
                aria-label="All pages"
                className="mx-auto w-full max-w-[1180px] px-5 pt-2 pb-7 sm:px-8 lg:px-11"
              >
                <ul>
                  {ROUTES.map((route, i) => {
                    const active = isActive(route.href);
                    return (
                      <li
                        key={route.href}
                        className="border-b border-hair-soft last:border-b-0"
                      >
                        <Link
                          href={route.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between gap-4 py-4"
                        >
                          <span className="flex items-center gap-3.5">
                            <span className="numeric font-mono text-[10px] tracking-[0.14em] text-faint">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "font-mono text-[12.5px] tracking-[0.16em] uppercase transition-colors",
                                active
                                  ? "text-ink"
                                  : "text-dim group-hover:text-ink",
                              )}
                            >
                              {route.label}
                            </span>
                          </span>

                          {active ? (
                            <Tick />
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden
                              className="text-faint transition-transform duration-300 group-hover:translate-x-1"
                            >
                              <path
                                d="M2 10L10 2M10 2H4M10 2V8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
