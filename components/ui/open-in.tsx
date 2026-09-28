"use client";

import type { ReactElement } from "react";
import { ArrowUpRightIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "@/lib/utils";
import {
  AnthropicIcon,
  ClaudeCodeIcon,
  CodexIcon,
  CursorIcon,
  OpenaiIcon,
} from "./brand-icons";

/**
 * The context handoff. Every target receives the same closed-loop engineering
 * brief, so the CTA moves from positioning to a concrete setup conversation.
 */
const PROMPT = encodeURIComponent(
  "Help me close the loop on agentic engineering with quirq. Read https://quirq.ai/llm.txt, then inspect my current project and identify the shortest feedback loop from an agent action to an environment snapshot, a verified outcome, and a ledger result. Explain the mint rule briefly, then give me a concrete setup plan with the exact commands and files needed for this project.",
);

type Target = {
  name: string;
  note: string;
  href: string;
  Icon: (props: { className?: string }) => ReactElement;
};

/* URL schemes verified against what the "Open in" menus on shadcn, Expo,
   GitBook and Vercel docs ship in 2026. Every link prefills the agent's
   composer; nothing auto-runs. Codex has no browser route, so it is the one
   protocol link that needs its app installed. */
const TARGETS: Target[] = [
  {
    name: "Claude Code",
    note: "claude.ai/code",
    href: `https://claude.ai/code/new?q=${PROMPT}`,
    Icon: ClaudeCodeIcon,
  },
  {
    name: "Codex",
    note: "needs the app",
    href: `codex://new?prompt=${PROMPT}`,
    Icon: CodexIcon,
  },
  {
    name: "Cursor",
    note: "cursor.com/link",
    href: `https://cursor.com/link/prompt?text=${PROMPT}`,
    Icon: CursorIcon,
  },
  {
    name: "Claude",
    note: "claude.ai",
    href: `https://claude.ai/new?q=${PROMPT}`,
    Icon: AnthropicIcon,
  },
  {
    name: "ChatGPT",
    note: "chatgpt.com",
    href: `https://chatgpt.com/?q=${PROMPT}`,
    Icon: OpenaiIcon,
  },
];

const LEAD = TARGETS.slice(0, 3);

/** Radix owns positioning, keyboard navigation, focus return and dismissal. */
export function OpenIn({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "nav";
  className?: string;
}) {
  const hero = variant === "hero";

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size={hero ? "lg" : "sm"}
            className="openin-toggle group gap-3"
            aria-label="Close the loop with your agent"
          >
            <span aria-hidden="true" className="flex items-center gap-1.5">
              {LEAD.map((target) => (
                <target.Icon key={target.name} className="size-4" />
              ))}
            </span>
            <span>Close the loop</span>
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={hero ? "center" : "end"}
          collisionPadding={12}
          className="w-72 max-w-[calc(100vw-1.5rem)]"
          aria-label="Choose your agent"
        >
          {TARGETS.map((target) => (
            <DropdownMenuItem key={target.name} asChild>
              <a
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-3"
              >
                <target.Icon className="size-4" />
                <span className="flex-1">
                  <span className="block font-medium">{target.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {target.note}
                  </span>
                </span>
                <ArrowUpRightIcon aria-hidden="true" className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <noscript>
        <details className="rounded-lg border border-border bg-card p-4 text-card-foreground">
          <summary className="cursor-pointer font-medium">
            Open quirq in your agent
          </summary>
          <ul className="mt-3 space-y-1">
            {TARGETS.map((target) => (
              <li key={target.name}>
                <a
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                >
                  {target.name}
                  <ArrowUpRightIcon aria-hidden="true" className="size-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      </noscript>
    </div>
  );
}
