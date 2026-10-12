"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/primitives";

/** The whole install. One line, and it is the same line on every machine. */
export const INSTALL_COMMAND = "curl -fsSL https://quirq.ai/install | sh";

export function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      // Denied, or no clipboard at all outside a secure context. The command
      // is selectable text either way, so there is nothing to fall back to.
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2.5 rounded-full border border-hair bg-black/40 py-1.5 pr-1.5 pl-4 backdrop-blur-md sm:gap-3 sm:py-2 sm:pr-2 sm:pl-5">
        {/* The prompt is scenery, not part of what you paste. */}
        <span
          aria-hidden
          className="font-mono text-[11px] text-faint select-none"
        >
          $
        </span>
        <code className="font-mono text-[10.5px] whitespace-nowrap text-ink/90 sm:text-[13px]">
          {INSTALL_COMMAND}
        </code>
        {/* Fixed width: a button that resized on click would shift the command
            out from under the pointer at the exact moment it was clicked. */}
        <button
          type="button"
          onClick={copy}
          aria-label="Copy the install command"
          className={cn(
            "copy-command w-[70px] shrink-0 rounded-full border border-hair-soft bg-white/5 py-2 font-mono text-[9.5px] tracking-[0.14em] uppercase transition-colors duration-300 hover:border-ink/30 sm:w-[86px] sm:text-[10.5px]",
            copied ? "text-spec-green" : "text-dim hover:text-ink",
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        {/* Always mounted so the announcement is a content change in a live
            region rather than a region arriving with content already in it. */}
        <span aria-live="polite" className="sr-only">
          {copied ? "Install command copied to clipboard" : ""}
        </span>
      </div>

      <p className="label mt-3 text-[9.5px]">
        Runs anywhere · macOS, Linux, your cloud
      </p>
    </div>
  );
}
