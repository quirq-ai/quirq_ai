import type { MouseEventHandler } from "react";
import { APP_URL } from "@/lib/products";
import { Button } from "./button";
import { XoLogo } from "./xo-logo";

type TryOnXoProps = {
  size?: "default" | "lg";
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** Shared direct entry to the XO platform, using Quirq's action styling. */
export function TryOnXo({ size = "default", className, onClick }: TryOnXoProps) {
  return (
    <Button asChild size={size} className={className}>
      <a
        href={APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Try on XO (opens in a new tab)"
        onClick={onClick}
      >
        <span aria-hidden="true">Try on</span>
        <XoLogo className="size-3 min-w-[30px]" />
      </a>
    </Button>
  );
}
