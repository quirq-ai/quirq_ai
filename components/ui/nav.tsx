"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { QuirqLogo } from "./quirq-logo";
import { TryOnXo } from "./try-on-xo";
import { XoLogo } from "./xo-logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import styles from "./nav.module.css";

type NavigationRoute = {
  href: string;
  label: string;
  description?: string;
};

const GROUPS: readonly {
  id: string;
  label: string;
  routes: readonly NavigationRoute[];
}[] = [
  {
    id: "products",
    label: "Products",
    routes: [
      {
        href: "/products",
        label: "Space",
        description: "Projects, agents and tools in one place.",
      },
      {
        href: "/xo",
        label: "Cloud",
        description: "Managed computers for your agents.",
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    routes: [
      { href: "/docs", label: "Docs" },
      { href: "/research", label: "Research" },
      { href: "/writing", label: "Writing" },
    ],
  },
] as const;
const DESKTOP_NAV = "(min-width: 900px)";

function currentRoute(pathname: string, href: string): "page" | "location" | undefined {
  if (pathname === href) return "page";
  if (
    pathname.startsWith(`${href}/`) ||
    (href === "/research" &&
      (pathname === "/whitepaper" || pathname.startsWith("/whitepaper/")))
  ) {
    return "location";
  }
  return undefined;
}

function useNavigationDisclosure() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_NAV);
    const closeOnBreakpoint = () => setOpen(false);
    query.addEventListener("change", closeOnBreakpoint);
    return () => query.removeEventListener("change", closeOnBreakpoint);
  }, []);

  return { open, setOpen };
}

function RouteLabel({ route }: { route: NavigationRoute }) {
  return (
    <span className={styles.routeCopy}>
      <span className={styles.routeTitle}>
        {route.label}
        {route.href === "/xo" && <XoLogo className="size-3 min-w-[30px]" />}
      </span>
      {route.description && (
        <span className={styles.routeDescription}>{route.description}</span>
      )}
    </span>
  );
}

function NavigationGroup({
  group,
  pathname,
}: {
  group: (typeof GROUPS)[number];
  pathname: string;
}) {
  const { open, setOpen } = useNavigationDisclosure();
  const active = group.routes.some((route) => currentRoute(pathname, route.href));

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`${styles.groupTrigger} menu-toggle`}
          data-active={active || undefined}
        >
          {group.label} <ChevronDown aria-hidden="true" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={group.id === "products" ? styles.productMenu : styles.resourceMenu}
        onCloseAutoFocus={(event) => {
          if (!window.matchMedia(DESKTOP_NAV).matches) {
            event.preventDefault();
            document
              .querySelector<HTMLButtonElement>("[data-mobile-nav-trigger]")
              ?.focus();
          }
        }}
      >
        {group.routes.map((route) => (
          <DropdownMenuItem
            asChild
            key={route.href}
            textValue={route.label}
            className={styles.dropdownLink}
          >
            <Link href={route.href} aria-current={currentRoute(pathname, route.href)}>
              <RouteLabel route={route} />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const { open, setOpen } = useNavigationDisclosure();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${styles.mobileTrigger} menu-toggle`}
          aria-label="Open navigation menu"
          data-mobile-nav-trigger
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        onCloseAutoFocus={(event) => {
          if (window.matchMedia(DESKTOP_NAV).matches) {
            event.preventDefault();
            document.querySelector<HTMLAnchorElement>("[data-site-brand]")?.focus();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>Explore Quirq</SheetTitle>
          <SheetDescription className="sr-only">
            Products, resources and enterprise services.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className={styles.mobileNav}>
          {GROUPS.map((group) => (
            <section
              key={group.id}
              className={styles.mobileGroup}
              aria-labelledby={`mobile-${group.id}-heading`}
            >
              <h3 id={`mobile-${group.id}-heading`} className={styles.mobileGroupTitle}>
                {group.label}
              </h3>
              {group.routes.map((route) => (
                <SheetClose asChild key={route.href}>
                  <Link
                    href={route.href}
                    className={styles.mobileLink}
                    aria-current={currentRoute(pathname, route.href)}
                  >
                    <RouteLabel route={route} />
                  </Link>
                </SheetClose>
              ))}
            </section>
          ))}
          <SheetClose asChild>
            <Link
              href="/machinespeed"
              className={styles.mobileLink}
              aria-current={currentRoute(pathname, "/machinespeed")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enterprise <ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </SheetClose>
        </nav>
        <SheetFooter>
          <TryOnXo onClick={() => setOpen(false)} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function Nav() {
  const pathname = usePathname();
  return (
    <header className={styles.shell} data-site-nav>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/" className={styles.brand} data-site-brand aria-label="quirq, home">
          <QuirqLogo alt="" className={styles.logo} />
        </Link>
        <div className={styles.links}>
          {GROUPS.map((group) => (
            <NavigationGroup
              key={`${group.id}:${pathname}`}
              group={group}
              pathname={pathname}
            />
          ))}
          <Link
            href="/machinespeed"
            className={styles.enterpriseLink}
            aria-current={currentRoute(pathname, "/machinespeed")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enterprise <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </Link>
        </div>
        <div className={styles.actions}>
          <TryOnXo />
          <MobileNavigation key={pathname} pathname={pathname} />
        </div>
      </nav>
    </header>
  );
}
