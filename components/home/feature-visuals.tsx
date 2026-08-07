import { classes } from "@/components/home/shell";
import { Mark } from "@/components/ui/primitives";
import {
  AnthropicIcon,
  ClaudeCodeIcon,
  CodexIcon,
  CursorIcon,
  DeepseekIcon,
  McpIcon,
  OpenaiIcon,
  OpenclawIcon,
} from "@/components/ui/brand-icons";

/**
 * The five feature-card visuals, rebuilt as DOM.
 *
 * These shipped as flat PNGs in the first cut of the page. Five of them were
 * carrying real text, real brand marks and a real state machine baked into
 * pixels, which meant no selection, no screen reader, no theming, no hover, and
 * a 2x export for every breakpoint. Redrawing them here costs a few dozen lines
 * and gets all of that back.
 *
 * Server-safe on purpose: no "use client", no hooks. `Mark` comes from the
 * client primitives module, which is fine to *render* from a server component
 * (it resolves to a client reference); what would throw is calling one of that
 * module's plain functions, such as `cn`, during the server render. Hence
 * `classes` from the shell instead.
 */

/* ========================================================================== */
/* Dynamic Scaling                                                            */
/* ========================================================================== */

/**
 * A focus just inside the bottom-right corner, and four bands radiating from
 * it. Both radii are the same share of the card box rather than of a square,
 * so the bands are ellipses that track the card's own proportions: nearly
 * round when the card is a single phone column, flatter when it spans two
 * desktop columns. A true circle would need a definite height, which this
 * component does not own and should not assume.
 */
const ARC_FOCUS = { x: 0.86, y: 0.9 };
const ARC_RADII = [0.22, 0.38, 0.54, 0.72];

function arcInset(radius: number) {
  return {
    left: `${(ARC_FOCUS.x - radius) * 100}%`,
    right: `${(1 - ARC_FOCUS.x - radius) * 100}%`,
    top: `${(ARC_FOCUS.y - radius) * 100}%`,
    bottom: `${(1 - ARC_FOCUS.y - radius) * 100}%`,
  };
}

export function ScalingArcs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={classes(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      {ARC_RADII.map((radius) => (
        <span
          key={radius}
          className="absolute rounded-full border border-white/[0.18]"
          style={arcInset(radius)}
        />
      ))}
      {/* The mark sits at the focus, so the bands read as radiating from it
          rather than as decoration that happens to be near it. */}
      <Mark className="absolute left-[86%] top-[90%] h-8 w-6 -translate-x-1/2 -translate-y-1/2 text-white/[0.18] sm:h-9 sm:w-7" />
    </div>
  );
}

/* ========================================================================== */
/* Production-ready                                                           */
/* ========================================================================== */

const DEPLOY_STEPS = [
  { label: "Merged to main", state: "done" },
  { label: "Pushed to GHCR", state: "done" },
  { label: "Promoted to :stable", state: "done" },
  { label: "Updating environment", state: "active" },
  { label: "Listen for heartbeat", state: "pending" },
] as const;

/**
 * The deployment timeline. This one is content, not decoration: it names five
 * real stages in order, so it is an ordered list and the live stage is marked
 * with `aria-current`, which is the whole reason it stopped being a PNG.
 */
export function DeployTimeline({ className }: { className?: string }) {
  const last = DEPLOY_STEPS.length - 1;

  return (
    // Centred and capped a step under the width the source export used. On the
    // card it was drawn for the cap never binds; it only stops the chips from
    // stretching into a letterbox if the visual is ever dropped on a wide card.
    <ol
      aria-label="Deployment timeline"
      className={classes("mx-auto w-full max-w-[300px]", className)}
    >
      {DEPLOY_STEPS.map((step, index) => {
        const active = step.state === "active";

        return (
          <li
            key={step.label}
            aria-current={active ? "step" : undefined}
            className="relative flex items-stretch gap-3"
          >
            <span
              aria-hidden
              className="relative flex w-2 flex-none items-center justify-center self-stretch"
            >
              {/* Clipping the rail to half a row at each end, rather than
                  measuring the gap between dots, keeps the joins exact even
                  when a chip wraps to two lines on a narrow card. */}
              <span
                className={classes(
                  "absolute left-1/2 w-px -translate-x-1/2 bg-white/15",
                  index === 0 ? "top-1/2" : "top-0",
                  index === last ? "bottom-1/2" : "bottom-0",
                )}
              />
              {active ? (
                // `.pulse-dot` owns its own size, radius, colour and position,
                // and is declared outside Tailwind's layers so it wins any
                // utility restating them. It also carries `flex: none`, which
                // is why every use in this codebase makes it a direct flex
                // child: it needs blockifying for its own size to apply. Only
                // `z-10` is added, so it paints over the rail.
                <span className="pulse-dot z-10" />
              ) : (
                <span
                  className={classes(
                    "relative z-10 h-2 w-2 rounded-full",
                    step.state === "done" ? "bg-spec-green/45" : "bg-white/25",
                  )}
                />
              )}
            </span>

            <span
              className={classes(
                "my-0.5 min-w-0 flex-1 rounded-lg bg-white/[0.07] px-2.5 py-1.5 font-mono text-[9.5px] leading-[1.5]",
                active ? "text-ink" : "text-dim",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ========================================================================== */
/* Context Optimization                                                       */
/* ========================================================================== */

/**
 * Five bars folding down the page, alternating edge and weight.
 *
 * Tops are absolute percentages rather than a flex distribution because the
 * five 16.66% bars have to divide the box exactly. The step is
 * (100 - 16.66) / 4 = 20.835%, which puts the first bar on the top edge, the
 * last on the bottom edge, and the same slice of air between every pair.
 */
const CONTEXT_BARS = [
  { top: "0", align: "right-0", tone: "bg-white/[0.19]" },
  { top: "20.835%", align: "left-0", tone: "bg-white/[0.86]" },
  { top: "41.67%", align: "right-0", tone: "bg-white/[0.19]" },
  { top: "62.505%", align: "left-0", tone: "bg-white/[0.86]" },
  { top: "83.34%", align: "right-0", tone: "bg-white/[0.19]" },
] as const;

export function ContextLadder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={classes(
        "relative mx-auto aspect-[21/17] w-full max-w-[250px]",
        className,
      )}
    >
      {CONTEXT_BARS.map((bar) => (
        <span
          key={bar.top}
          style={{ top: bar.top }}
          className={classes(
            "absolute h-[16.66%] w-[59.9%] rounded-[18px]",
            bar.align,
            bar.tone,
          )}
        />
      ))}
    </div>
  );
}

/* ========================================================================== */
/* Universal Runtime                                                          */
/* ========================================================================== */

const RUNTIME_TILES = [
  { name: "Claude Code", Icon: ClaudeCodeIcon },
  { name: "Codex", Icon: CodexIcon },
  { name: "Cursor", Icon: CursorIcon },
  { name: "OpenClaw", Icon: OpenclawIcon },
  { name: "DeepSeek", Icon: DeepseekIcon },
  { name: "OpenAI", Icon: OpenaiIcon },
  { name: "Anthropic", Icon: AnthropicIcon },
  { name: "MCP", Icon: McpIcon },
] as const;

/** Where the three droppers meet the lattice, as a share of the bracket width. */
const DROPPER_POSITIONS = [11, 50, 89];

/**
 * One runtime fanning into many.
 *
 * The lattice is fully populated. The source export left two tiles empty to
 * balance the grid, but an empty bordered tile reads as content that failed to
 * load rather than as breathing room, so every cell carries a mark.
 */
export function RuntimeLattice({ className }: { className?: string }) {
  return (
    <div className={classes("flex w-full flex-col items-center", className)}>
      {/* The bracket is exactly as wide as the lattice below it and the
          droppers run all the way down to the tiles, so the connector reads as
          one runtime fanning out rather than as a rule floating above a grid.
          162px is four 36px tiles plus three 6px gaps; keep the two in step. */}
      <div aria-hidden className="relative h-3 w-[162px] max-w-full">
        <span className="absolute inset-x-[11%] top-0 h-px bg-white/20" />
        {DROPPER_POSITIONS.map((left) => (
          <span
            key={left}
            style={{ left: `${left}%` }}
            className="absolute top-0 h-3 w-px bg-white/20"
          />
        ))}
      </div>

      <ul className="grid w-fit grid-cols-4 gap-1.5">
        {RUNTIME_TILES.map(({ name, Icon }) => (
          <li
            key={name}
            className="group grid h-9 w-9 place-items-center rounded-lg border border-white/[0.12] bg-white/[0.04] transition-colors duration-300 hover:border-white/[0.24]"
          >
            <Icon className="h-4 w-4 text-white/60 transition-colors duration-300 group-hover:text-ink" />
            <span className="sr-only">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ========================================================================== */
/* Efficiency Charts                                                          */
/* ========================================================================== */

/**
 * Bar heights as a share of the plot, and nothing else.
 *
 * These are deliberately not data. The source publishes a shape and an
 * ILLUSTRATIVE tag, so the bars stay `aria-hidden` decoration and the panel
 * says so in text. Promoting them to a `Figure` would mean attaching units and
 * categories the product has never measured, which is the one thing this
 * repository forbids outright.
 */
const EFFICIENCY_BARS = [24, 30, 36, 42, 49, 57, 66, 76, 87, 100];

export function EfficiencyPanel({ className }: { className?: string }) {
  return (
    <div
      className={classes(
        "relative mx-auto w-full max-w-[300px] overflow-hidden rounded-[20px] bg-white/[0.09] p-4 backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="label">COST EFFICIENCY</p>
        <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-white/80">
          ILLUSTRATIVE
        </span>
      </div>

      <p className="mt-3 flex items-center gap-3">
        <strong className="numeric text-[clamp(24px,2.2vw,32px)] leading-none font-semibold text-spec-green">
          +87%
        </strong>
        <span className="font-mono text-[10px] leading-[1.25] font-bold text-dim">
          PAST
          <br />
          30 DAYS
        </span>
      </p>

      <div
        aria-hidden
        className="mt-5 flex h-[clamp(56px,9vw,96px)] items-end gap-[4px]"
      >
        {EFFICIENCY_BARS.map((height, index) => (
          <span
            key={height}
            className="flex-1 rounded-[3px]"
            style={{
              height: `${height}%`,
              // A flat greyscale ramp: brightness carries the ascent, so the
              // shape survives with no colour cue at all.
              background: `rgba(244,243,240,${(
                0.42 +
                (index * 0.43) / (EFFICIENCY_BARS.length - 1)
              ).toFixed(3)})`,
            }}
          />
        ))}
      </div>

      <p className="sr-only">
        Illustrative cost-efficiency trend. No underlying values are published.
      </p>
    </div>
  );
}
