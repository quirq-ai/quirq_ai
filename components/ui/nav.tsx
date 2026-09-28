"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { QuirqLogo } from "./quirq-logo";
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

type NavigationRoute = { href: string; label: string; xo?: boolean };
const OFFERINGS: readonly NavigationRoute[] = [
  { href: "/products", label: "Spaces", xo: true },
  { href: "/xo", label: "Cloud", xo: true },
  { href: "/machinespeed", label: "MachineSpeed" },
];
const RESOURCES: readonly NavigationRoute[] = [
  { href: "/docs", label: "Docs" },
  { href: "/research", label: "Research" },
  { href: "/writing", label: "Writing" },
];
const MOBILE_GROUPS = [
  { id: "offerings", label: "Offerings", routes: OFFERINGS },
  { id: "resources", label: "Resources", routes: RESOURCES },
];
const DESKTOP_NAV = "(min-width: 900px)";

function currentRoute(pathname: string, href: string): "page" | "location" | undefined {
  if (pathname === href) return "page";
  if (
    pathname.startsWith(`${href}/`) ||
    (href === "/research" &&
      (pathname === "/whitepaper" || pathname.startsWith("/whitepaper/")))
  )
    return "location";
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
    <span className={styles.routeTitle}>
      {route.xo && <XoLogo className={styles.productLogo} />}
      {route.label}
    </span>
  );
}

function ResourcesMenu({ pathname }: { pathname: string }) {
  const { open, setOpen } = useNavigationDisclosure();
  const active = RESOURCES.some((route) => currentRoute(pathname, route.href));
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`${styles.groupTrigger} menu-toggle`}
          data-active={active || undefined}
        >
          Resources <ChevronDown aria-hidden="true" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={styles.resourceMenu}
        onCloseAutoFocus={(event) => {
          if (!window.matchMedia(DESKTOP_NAV).matches) {
            event.preventDefault();
            document
              .querySelector<HTMLButtonElement>("[data-mobile-nav-trigger]")
              ?.focus();
          }
        }}
      >
        {RESOURCES.map((route) => (
          <DropdownMenuItem
            asChild
            key={route.href}
            textValue={route.label}
            className={styles.dropdownLink}
          >
            <Link href={route.href} aria-current={currentRoute(pathname, route.href)}>
              {route.label}
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
            Spaces, Cloud, MachineSpeed and resources.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className={styles.mobileNav}>
          {MOBILE_GROUPS.map((group) => (
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
        </nav>
        <SheetFooter>
          <Button asChild>
            <Link href="/#offerings" onClick={() => setOpen(false)}>
              Find your path
            </Link>
          </Button>
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
          {OFFERINGS.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={styles.offeringLink}
              aria-current={currentRoute(pathname, route.href)}
            >
              <RouteLabel route={route} />
            </Link>
          ))}
          <ResourcesMenu key={pathname} pathname={pathname} />
        </div>
        <div className={styles.actions}>
          <Button asChild>
            <Link href="/#offerings">Find your path</Link>
          </Button>
          <MobileNavigation key={pathname} pathname={pathname} />
        </div>
      </nav>
    </header>
  );
}
