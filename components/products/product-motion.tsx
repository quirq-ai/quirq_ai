"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Optional entry motion: server content is visible before and without JavaScript. */
export function ProductMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (
      !element ||
      !("IntersectionObserver" in window) ||
      !("animate" in Element.prototype)
    )
      return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;

    const observe = () => {
      observer?.disconnect();
      for (const animation of animations) animation.cancel();
      animations.clear();
      if (preference.matches) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer?.unobserve(entry.target);
            // Leave the initial viewport and deep-link destination undisturbed.
            if (entry.boundingClientRect.top < window.innerHeight * 0.4) continue;
            const animation = entry.target.animate(
              [
                { opacity: 0.65, transform: "translateY(20px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
            );
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          }
        },
        { threshold: 0.06, rootMargin: "0px 0px -24px 0px" },
      );

      for (const target of element.querySelectorAll("[data-product-reveal]")) {
        observer.observe(target);
      }
    };

    observe();
    preference.addEventListener("change", observe);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", observe);
      for (const animation of animations) animation.cancel();
    };
  }, []);

  return (
    <div ref={root} className={className} data-product-page>
      {children}
    </div>
  );
}
