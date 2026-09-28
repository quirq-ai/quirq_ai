import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Shared with xo-swarm's shadcn foundation; safe in server and client modules.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
