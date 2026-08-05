"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { INSTALL_COMMAND } from "@/components/ui/install-command";
import { Reveal, Rise, cn } from "@/components/ui/primitives";
import { beatsResized } from "@/lib/beat-registry";
import {
  DEFAULT_ENDPOINT,
  INSTANCE_ENDPOINT_STORAGE_KEY,
  INSTANCE_RECONNECT_STORAGE_KEY,
  probeInstance,
  type Connection,
} from "@/lib/quirq/instance";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { number: "01", label: "Install" },
  { number: "02", label: "Connect" },
  { number: "03", label: "Dashboard" },
] as const;

type Step = 1 | 2 | 3;
type CopyState = "idle" | "copied" | "failed";
type Connected = Extract<Connection, { state: "connected" }>;

function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("h-3.5 w-3.5", className)}
      fill="none"
      aria-hidden
    >
      <path
        d="m3.25 8.25 3 3 6.5-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("h-3 w-3", className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M2 10 10 2m0 0H4m6 0v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepRail({ current }: { current: Step }) {
  return (
    <div className="relative border-b border-hair-soft px-5 py-5 sm:px-9">
      <span
        aria-hidden
        className="absolute top-[37px] right-[16.666%] left-[16.666%] h-px bg-white/10"
      />
      <motion.span
        aria-hidden
        className="absolute top-[37px] left-[16.666%] h-px"
        style={{ background: "var(--spectrum)" }}
        initial={false}
        animate={{ width: `${((current - 1) / 2) * 66.668}%` }}
        transition={{ duration: 0.75, ease: EASE }}
      />

      <ol className="relative z-10 grid grid-cols-3">
        {STEPS.map((item, index) => {
          const number = (index + 1) as Step;
          const complete = current > number;
          const active = current === number;

          return (
            <li
              key={item.number}
              aria-current={active ? "step" : undefined}
              className="flex flex-col items-center text-center"
            >
              <motion.span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[9px] transition-colors duration-500",
                  complete &&
                    "border-spec-green/40 bg-[#07140b] text-spec-green",
                  active && "border-ink/40 bg-ink text-void",
                  !active &&
                    !complete &&
                    "border-hair bg-black text-faint",
                )}
                animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                {complete ? <CheckMark /> : item.number}
              </motion.span>
              <span
                className={cn(
                  "mt-2 font-mono text-[8.5px] tracking-[0.16em] uppercase transition-colors duration-500 sm:text-[9.5px]",
                  active || complete ? "text-ink" : "text-faint",
                )}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function InstallStep({
  copyState,
  onCopy,
  onContinue,
}: {
  copyState: CopyState;
  onCopy: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[300px] max-w-2xl flex-col items-center justify-center text-center sm:min-h-[330px]">
      <p className="font-mono text-[9px] tracking-[0.2em] text-spec-blue uppercase">
        Step 01 · install Quirq
      </p>
      <h3 className="mt-4 text-[clamp(24px,4vw,36px)] leading-tight font-semibold tracking-[-0.025em] text-ink">
        Run one command. Keep your setup.
      </h3>
      <p className="mt-3 max-w-[48ch] text-[13.5px] leading-relaxed text-dim sm:text-[14.5px]">
        Run this in your terminal. It installs the quirq CLI under{" "}
        <code className="font-mono text-ink/85">~/.quirq</code> and leaves your
        shell configuration untouched.
      </p>

      <div className="mt-7 flex w-full max-w-[590px] items-center rounded-full border border-hair bg-black/55 p-1.5 pl-4 text-left backdrop-blur-xl sm:pl-5">
        <span
          aria-hidden
          className="mr-2.5 shrink-0 font-mono text-[11px] text-faint"
        >
          $
        </span>
        <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[10px] whitespace-nowrap text-ink/90 sm:text-[12.5px]">
          {INSTALL_COMMAND}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "ml-3 w-[76px] shrink-0 rounded-full border border-hair-soft bg-white/5 py-2.5 font-mono text-[9px] tracking-[0.14em] uppercase transition-colors sm:w-[90px] sm:text-[10px]",
            copyState === "copied"
              ? "text-spec-green"
              : "text-dim hover:border-ink/25 hover:text-ink",
          )}
          aria-label="Copy the install command"
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Select"
              : "Copy"}
        </button>
      </div>

      <p
        aria-live="polite"
        className="mt-3 min-h-4 font-mono text-[9.5px] text-faint"
      >
        {copyState === "copied"
          ? "Command copied. Run it in your terminal, then continue."
          : copyState === "failed"
            ? "Clipboard access was blocked. Select and copy the command manually."
            : "Nothing runs from this page—you stay in control."}
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="focus-on-ink group mt-6 inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-mono text-[10.5px] tracking-[0.14em] text-void uppercase transition-opacity hover:opacity-85"
      >
        I ran the command
        <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function ConnectStep({
  endpoint,
  connection,
  onEndpointChange,
  onConnect,
  onBack,
}: {
  endpoint: string;
  connection: Connection;
  onEndpointChange: (value: string) => void;
  onConnect: () => void;
  onBack: () => void;
}) {
  const busy = connection.state === "connecting";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConnect();
  };

  return (
    <div className="mx-auto flex min-h-[300px] max-w-xl flex-col justify-center sm:min-h-[330px]">
      <div className="text-center">
        <p className="font-mono text-[9px] tracking-[0.2em] text-spec-purple uppercase">
          Step 02 · find the workspace
        </p>
        <h3 className="mt-4 text-[clamp(24px,4vw,36px)] leading-tight font-semibold tracking-[-0.025em] text-ink">
          Connect your local workspace.
        </h3>
        <p className="mx-auto mt-3 max-w-[50ch] text-[13.5px] leading-relaxed text-dim sm:text-[14.5px]">
          Enter the loopback address for your running XO Space instance. Quirq
          reads one local snapshot only after you press Connect.
        </p>
      </div>

      <form onSubmit={submit} className="mt-7">
        <label
          htmlFor="onboarding-endpoint"
          className="font-mono text-[9px] tracking-[0.16em] text-faint uppercase"
        >
          Local endpoint
        </label>
        <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
          <input
            id="onboarding-endpoint"
            name="endpoint"
            type="url"
            inputMode="url"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={endpoint}
            disabled={busy}
            onChange={(event) => onEndpointChange(event.target.value)}
            placeholder={DEFAULT_ENDPOINT}
            className="h-11 w-full min-w-0 shrink-0 rounded-full border border-hair bg-black/55 px-5 font-mono text-[11.5px] text-ink transition-colors placeholder:text-faint hover:border-ink/20 focus:border-ink/35 disabled:opacity-50 sm:flex-1"
          />
          <button
            type="submit"
            disabled={busy}
            className="focus-on-ink inline-flex h-11 shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink px-6 font-mono text-[10.5px] tracking-[0.14em] text-void uppercase transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-55"
          >
            {busy && (
              <span
                aria-hidden
                className="h-3 w-3 animate-spin rounded-full border border-void/25 border-t-void"
              />
            )}
            {busy
              ? "Connecting"
              : connection.state === "failed"
                ? "Try again"
                : "Connect"}
          </button>
        </div>
      </form>

      <div
        aria-live="polite"
        className="mt-4 min-h-[54px] rounded-xl border border-hair-soft bg-black/30 px-4 py-3"
      >
        {connection.state === "connecting" ? (
          <p className="font-mono text-[10.5px] text-dim">
            Reaching <span className="text-ink">{connection.endpoint}</span>…
          </p>
        ) : connection.state === "failed" ? (
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] text-spec-yellow uppercase">
              No local answer
            </p>
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-dim">
              {connection.reason} The current bridge works only when this site
              and XO Space run on the same machine.
            </p>
          </div>
        ) : (
          <p className="font-mono text-[10px] leading-relaxed text-faint">
            Default: {DEFAULT_ENDPOINT}. Loopback addresses only; the proxy
            refuses every remote host.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        disabled={busy}
        className="mx-auto mt-4 font-mono text-[9.5px] tracking-[0.12em] text-faint uppercase underline-offset-4 transition-colors hover:text-ink hover:underline disabled:opacity-40"
      >
        Back to the command
      </button>
    </div>
  );
}

function SuccessStep({
  connection,
  onReset,
}: {
  connection: Connected;
  onReset: () => void;
}) {
  const { payload } = connection;
  const rootReady = payload.root.exists && payload.root.readable;
  const spaceDashboardHref = `${connection.endpoint.replace(/\/+$/, "")}/space/#/dashboard`;

  return (
    <div className="mx-auto flex min-h-[300px] max-w-2xl flex-col items-center justify-center text-center sm:min-h-[330px]">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-spec-green/35"
          animate={{ scale: [0.88, 1.16], opacity: [0.75, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="absolute inset-2 rounded-full border border-spec-green/25 bg-spec-green/8" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-spec-green text-[#031006] shadow-[0_0_34px_rgba(48,209,88,0.34)]">
          <CheckMark className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-5 font-mono text-[9px] tracking-[0.2em] text-spec-green uppercase">
        Step 03 · handshake complete
      </p>
      <h3 className="mt-3 text-[clamp(25px,4vw,38px)] leading-tight font-semibold tracking-[-0.025em] text-ink">
        Your workspace answered.
      </h3>
      <p className="mt-2.5 max-w-[52ch] font-mono text-[10px] leading-relaxed break-all text-dim">
        {connection.endpoint}
      </p>

      <dl className="mt-6 grid w-full grid-cols-3 gap-px overflow-hidden rounded-xl border border-hair-soft bg-white/6 text-left">
        <div className="bg-black/65 px-3 py-3.5 sm:px-5">
          <dt className="font-mono text-[8px] tracking-[0.14em] text-faint uppercase">
            Root
          </dt>
          <dd
            className={cn(
              "mt-1.5 text-[11px]",
              rootReady ? "text-spec-green" : "text-spec-yellow",
            )}
          >
            {rootReady ? "Readable" : "Needs access"}
          </dd>
        </div>
        <div className="bg-black/65 px-3 py-3.5 sm:px-5">
          <dt className="font-mono text-[8px] tracking-[0.14em] text-faint uppercase">
            Watcher
          </dt>
          <dd
            className={cn(
              "mt-1.5 text-[11px]",
              payload.watcher.enabled ? "text-spec-green" : "text-dim",
            )}
          >
            {payload.watcher.enabled ? "Running" : "Paused"}
          </dd>
        </div>
        <div className="bg-black/65 px-3 py-3.5 sm:px-5">
          <dt className="font-mono text-[8px] tracking-[0.14em] text-faint uppercase">
            Round trip
          </dt>
          <dd className="mt-1.5 text-[11px] text-ink">
            {connection.latencyMs} ms
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={spaceDashboardHref}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-on-ink group inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-mono text-[10.5px] tracking-[0.14em] text-void uppercase transition-opacity hover:opacity-85"
        >
          Open Space dashboard
          <span className="sr-only"> (opens in a new tab)</span>
          <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-hair bg-black/35 px-5 py-3.5 font-mono text-[9.5px] tracking-[0.12em] text-dim uppercase transition-colors hover:border-ink/25 hover:text-ink"
        >
          Use another workspace
        </button>
      </div>
    </div>
  );
}

/**
 * A real local onboarding handshake, not a simulated success animation.
 *
 * The install route adds the reference CLI; the next step explicitly probes
 * the separate XO Space instance through the existing loopback-only proxy.
 * Only a validated 2xx response unlocks the dashboard handoff.
 *
 * Not a beat: it deliberately occupies the glide between delivery and ledger,
 * exactly where the calculator it replaces lived.
 */
export function Onboarding() {
  const [step, setStep] = useState<Step>(1);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [connection, setConnection] = useState<Connection>({ state: "idle" });
  const copyTimer = useRef<number | undefined>(undefined);
  const attempt = useRef(0);
  const wizard = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      window.clearTimeout(copyTimer.current);
      attempt.current += 1;
    },
    [],
  );

  useEffect(() => {
    beatsResized();
  }, [step, connection.state]);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopyState("copied");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopyState("idle"), 2400);
    } catch {
      setCopyState("failed");
    }
  };

  const showStep = (next: Step) => {
    setStep(next);
    window.requestAnimationFrame(() => {
      wizard.current?.scrollIntoView({ block: "start" });
    });
  };

  const connect = async () => {
    const target = endpoint.trim() || DEFAULT_ENDPOINT;
    const token = attempt.current + 1;
    attempt.current = token;
    setConnection({ state: "connecting", endpoint: target });

    const result = await probeInstance(target);
    if (attempt.current !== token) return;
    setConnection(result);

    if (result.state !== "connected") return;

    try {
      window.localStorage.setItem(INSTANCE_ENDPOINT_STORAGE_KEY, target);
      window.sessionStorage.setItem(INSTANCE_RECONNECT_STORAGE_KEY, "1");
    } catch {
      // Storage may be denied. The success state remains truthful; the
      // dashboard simply asks for the explicit connection again.
    }
    showStep(3);
  };

  const resetConnection = () => {
    attempt.current += 1;
    try {
      window.sessionStorage.removeItem(INSTANCE_RECONNECT_STORAGE_KEY);
    } catch {
      // Storage may be unavailable; resetting the visible flow still works.
    }
    setConnection({ state: "idle" });
    showStep(2);
  };

  return (
    <section
      id="onboarding"
      aria-labelledby="onboarding-title"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <div className="relative flex flex-col items-center text-center">
          <GlassPool scrimClassName="mx-auto max-w-3xl">
            <Rise>
              <p className="label over-stage">
                Connect your workspace · three steps
              </p>
            </Rise>

            <h2 id="onboarding-title" className="display-sm over-stage mt-7">
              <Reveal delay={0.05}>Install. Connect.</Reveal>
              <Reveal delay={0.13}>
                <GlassText>Open your dashboard.</GlassText>
              </Reveal>
            </h2>

            <Rise delay={0.2}>
              <p className="lede over-stage mx-auto mt-6 max-w-[48ch]">
                Run the command, point Quirq at your local Space instance, and
                land on your own workspace data—not a product demo.
              </p>
            </Rise>
          </GlassPool>
        </div>

        <Rise delay={0.1} className="mx-auto mt-10 max-w-[900px]">
          <div
            ref={wizard}
            className="scroll-mt-20 overflow-hidden rounded-[22px] border border-hair bg-black/80 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <StepRail current={step} />

            <div className="relative px-5 py-6 sm:px-9 sm:py-7">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.42, ease: EASE }}
                >
                  {step === 1 ? (
                    <InstallStep
                      copyState={copyState}
                      onCopy={() => void copyCommand()}
                      onContinue={() => showStep(2)}
                    />
                  ) : step === 2 ? (
                    <ConnectStep
                      endpoint={endpoint}
                      connection={connection}
                      onEndpointChange={setEndpoint}
                      onConnect={() => void connect()}
                      onBack={() => showStep(1)}
                    />
                  ) : connection.state === "connected" ? (
                    <SuccessStep
                      connection={connection}
                      onReset={resetConnection}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Rise>

        <Rise delay={0.18} className="mx-auto mt-5 max-w-[70ch] text-center">
          <p className="font-mono text-[9.5px] leading-relaxed text-faint">
            Local connection is read-only and loopback-only. The current bridge
            works when this site and XO Space run on the same machine.
          </p>
        </Rise>
      </div>
    </section>
  );
}
