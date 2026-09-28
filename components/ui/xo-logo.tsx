import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/** Canonical XO cloud mark from xo-swarm/public/xo.svg. The frame removes only
 * the source artboard's empty margin; every point and stroke is preserved. */
export function XoLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="500"
      height="200"
      viewBox="0 150 500 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="15.38"
      strokeMiterlimit="10"
      aria-hidden="true"
      focusable="false"
      {...props}
      className={cn("h-4 w-10 shrink-0", className)}
    >
      <polyline points="36.99 165.84 118.47 247.31 31.16 334.61" />
      <polyline stroke="#83d63a" points="328.12 165.06 246.65 246.53 333.95 333.84" />
      <polyline stroke="#83d63a" points="380.51 165.06 461.99 246.53 374.68 333.84" />
      <polyline points="244.91 165.84 163.44 247.31 250.74 334.61" />
    </svg>
  );
}
