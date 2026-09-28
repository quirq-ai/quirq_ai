/**
 * The long-form body vocabulary, shared by every reading surface.
 *
 * Research notes (lib/research.ts) and the whitepaper (lib/whitepaper.ts) both
 * author their bodies in these blocks, and both render through
 * components/prose/body.tsx. Keeping the type here rather than inside one
 * consumer is what stops a second, subtly different renderer from appearing
 * the next time a surface needs prose.
 *
 * Server-safe: plain serializable data, no JSX, no browser modules.
 */

export type Block =
  | { kind: "h2" | "h3" | "p" | "quote" | "code"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] };
