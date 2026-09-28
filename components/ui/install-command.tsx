"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INSTALL_COMMAND } from "@/lib/products";

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
    <div className="flex w-full min-w-0 max-w-full flex-col items-center">
      {/* The zero-minimum track lets fit-content parents shrink around the
          command while reserving the Copy button's full width. */}
      <div className="grid w-full min-w-0 max-w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border bg-card p-1.5 pl-4 sm:gap-3">
        {/* The prompt is scenery, not part of what you paste. */}
        <span
          aria-hidden
          className="self-start py-2 font-mono text-xs text-muted-foreground select-none sm:text-sm"
        >
          $
        </span>
        <code
          tabIndex={0}
          aria-label="Space installation command"
          className="block min-w-0 max-w-full overflow-x-auto py-2 font-mono text-xs whitespace-nowrap text-card-foreground sm:text-sm"
        >
          {INSTALL_COMMAND}
        </code>
        {/* Fixed width: a button that resized on click would shift the command
            out from under the pointer at the exact moment it was clicked. */}
        <Button
          type="button"
          variant="secondary"
          onClick={copy}
          aria-label="Copy the install command"
          className={cn(
            "copy-command w-11 gap-1.5 px-3 font-mono text-xs sm:w-24",
            copied && "text-success",
          )}
        >
          {copied ? (
            <CheckIcon aria-hidden="true" className="size-4" />
          ) : (
            <CopyIcon aria-hidden="true" className="size-4" />
          )}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </Button>
        {/* Always mounted so the announcement is a content change in a live
            region rather than a region arriving with content already in it. */}
        <span aria-live="polite" className="sr-only">
          {copied ? "Install command copied to clipboard" : ""}
        </span>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        macOS · Linux · Windows via WSL
      </p>
    </div>
  );
}
