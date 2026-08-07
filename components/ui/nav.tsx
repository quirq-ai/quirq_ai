"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { QuirqLogo } from "./quirq-logo";
import styles from "./nav.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const DESKTOP_NAV = "(min-width: 700px)";

/**
 * The links and labels authored in the Figma navigation, plus Enterprise.
 *
 * `newTab` marks a destination that is its own property rather than another
 * page of this site: it opens in a new tab and carries a visible mark saying
 * so, so the tab switch is never a surprise.
 */
const ROUTES = [
  { href: "/products", label: "Products" },
  { href: "/research", label: "Research" },
  { href: "/writing", label: "Writing" },
  { href: "/machinespeed", label: "Enterprise", newTab: true },
] as const;

function OffsiteMark() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={styles.offsiteMark}
    >
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 11.5L11.5 2.5M11.5 2.5H4.5M11.5 2.5V9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const brand = useRef<HTMLAnchorElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  // Every route now has its own destination, so the path decides the active
  // item outright. (Writing used to point at /research and needed excluding.)
  const isActive = (href: string) => pathname.startsWith(href);

  // A route change completes the drawer's job. The persistent root layout
  // keeps this component mounted, so it must close itself explicitly.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const desktop = window.matchMedia(DESKTOP_NAV);
    const focusable = () =>
      Array.from(
        drawer.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));

    const focusFrame = requestAnimationFrame(() => focusable()[0]?.focus());

    const restoreToggle = () => {
      setOpen(false);
      requestAnimationFrame(() => toggle.current?.focus());
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        restoreToggle();
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onDesktop = () => {
      if (!desktop.matches) return;
      setOpen(false);
      requestAnimationFrame(() => brand.current?.focus());
    };

    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);

    return () => {
      cancelAnimationFrame(focusFrame);
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return (
    <>
      <header className={styles.shell} data-site-nav>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link
            ref={brand}
            href="/"
            className={styles.brand}
            aria-label={pathname === "/" ? "quirq, back to top" : "quirq, home"}
          >
            <QuirqLogo alt="" className={styles.logo} />
          </Link>

          <div className={styles.links}>
            {ROUTES.map((route) => {
              const active = isActive(route.href);
              const offsite = "newTab" in route && route.newTab;
              return (
                <Link
                  key={route.label}
                  href={route.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    offsite
                      ? `${styles.offsite}${active ? ` ${styles.activeLink}` : ""}`
                      : active
                        ? styles.activeLink
                        : undefined
                  }
                  {...(offsite
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {route.label}
                  {offsite && (
                    <>
                      <OffsiteMark />
                      <span className="sr-only">(opens in a new tab)</span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          <Link href="/products" className={styles.cta}>
            Get Started
          </Link>

          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="site-drawer"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
            className={`${styles.menuButton} menu-toggle`}
          >
            <span aria-hidden className={styles.menuIcon}>
              <span className={open ? styles.menuLineOpenOne : undefined} />
              <span className={open ? styles.menuLineOpenTwo : undefined} />
            </span>
          </button>
        </nav>
      </header>

      <AnimatePresence initial={false}>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={() => {
                setOpen(false);
                requestAnimationFrame(() => toggle.current?.focus());
              }}
            />

            <motion.aside
              ref={drawer}
              id="site-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="site-drawer-title"
              className={styles.drawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.42, ease: EASE }}
            >
              <p id="site-drawer-title" className={styles.drawerLabel}>
                Navigation
              </p>
              <ul className={styles.drawerLinks}>
                {ROUTES.map((route, index) => {
                  const active = isActive(route.href);
                  const offsite = "newTab" in route && route.newTab;
                  return (
                    <li key={route.label}>
                      <Link
                        href={route.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={active ? styles.activeDrawerLink : undefined}
                        {...(offsite
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <span className={styles.routeNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          {route.label}
                          {offsite && (
                            <span className="sr-only">
                              {" "}
                              (opens in a new tab)
                            </span>
                          )}
                        </span>
                        <Arrow />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
