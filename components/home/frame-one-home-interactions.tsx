"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Image from "next/image";
import styles from "./frame-one-home-responsive.module.css";

const WORKFLOW_STEPS = [
  {
    id: "deploy",
    number: "01",
    label: "DEPLOY ENVIRONMENT",
    color: "#2e9bff",
    body: "Spin up the capacity and cloud location your workload needs.",
  },
  {
    id: "manage",
    number: "02",
    label: "MANAGE WORKSPACE",
    color: "#34c759",
    body: "Keep projects, context, models, and agent tools organized in one managed workspace.",
  },
  {
    id: "observe",
    number: "03",
    label: "OBSERVE PRODUCTIVITY",
    color: "#ff9500",
    body: "Calculate beyond token cost and see the efficiency metrics you truly need.",
  },
] as const;

const WORKFLOW_VISUAL = {
  src: "/assets/home-v9/workflow-visual.png",
  alt: "A Quirq workspace graph showing projects grouped by team.",
  width: 557,
  height: 516,
} as const;

const DEPLOY_VISUAL = {
  src: "/accelerate-deploy.png",
  alt: "A deployed Quirq environment showing live resource status, machine logs, and connected cloud services.",
  width: 2070,
  height: 1562,
} as const;

const PRODUCTIVITY_VISUAL = {
  src: "/assets/home-v9/roi-visual.png",
  alt: "An Engineering environment connected to its default project.",
  width: 598,
  height: 580,
} as const;

const LAYERS = [
  {
    id: "output",
    number: "01",
    label: "OUTPUT",
    color: "#2e9bff",
    rail: "linear-gradient(180deg, #2e9bff, #00d9ff)",
    title: "The Work Your Agents Deliver",
    body: "Measure the files, decisions, and verified outcomes your agents produce across models, harnesses, environments, and runtimes.",
  },
  {
    id: "agent",
    number: "02",
    label: "AGENT",
    color: "#34c759",
    rail: "#34c759",
    title: "Any Model. Any Harness.",
    body: "Use any model, harness, or framework within your environment.",
  },
  {
    id: "environment",
    number: "03",
    label: "ENVIRONMENT",
    color: "#ff9500",
    rail: "#ff9500",
    title: "The Workspace That Holds the Work",
    body: "Memory and files persist while the environment snapshots, verifies, and meters each job.",
  },
  {
    id: "runtime",
    number: "04",
    label: "RUNTIME",
    color: "#af52de",
    rail: "#af52de",
    title: "A Place to Actually Act",
    body: "Run on your laptop or deploy to AWS, GCP, Azure, or any Terraform-compatible stack.",
  },
] as const;

/**
 * Small client islands for the two selectors on an otherwise static page.
 * Native details/summary preserves useful disclosure behavior without JS; the
 * controlled state keeps one item open after hydration and holds the layout.
 */
export function WorkflowSelector() {
  const [activeStep, setActiveStep] = useState(2);
  const activeVisual =
    activeStep === 0
      ? DEPLOY_VISUAL
      : activeStep === 2
        ? PRODUCTIVITY_VISUAL
        : WORKFLOW_VISUAL;

  return (
    <div className={styles.workflow}>
      <div
        className={styles.workflowVisualFrame}
        aria-live="polite"
        aria-atomic="true"
      >
        <Image
          src={activeVisual.src}
          alt={activeVisual.alt}
          width={activeVisual.width}
          height={activeVisual.height}
          className={styles.workflowVisual}
          sizes="(max-width: 699px) calc(100vw - 48px), 39vw"
          unoptimized
        />
      </div>

      <div className={styles.workflowCopy}>
        <h2>
          Accelerate Your
          <br />
          AI Workflows
        </h2>
        <ol>
          {WORKFLOW_STEPS.map((step, index) => {
            const isActive = activeStep === index;
            const triggerId = `workflow-trigger-${step.id}`;
            const panelId = `workflow-panel-${step.id}`;

            return (
              <li key={step.id}>
                <details
                  className={styles.workflowStep}
                  name="home-workflow"
                  open={isActive}
                >
                  <summary
                    id={triggerId}
                    aria-controls={panelId}
                    aria-expanded={isActive}
                    className={styles.workflowSummary}
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveStep(index);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveStep(index);
                      }
                    }}
                  >
                    <span
                      className={styles.workflowNumber}
                      style={{ color: step.color }}
                    >
                      {step.number}
                    </span>
                    <span className={styles.workflowLabel}>{step.label}</span>
                    <span className={styles.disclosureIcon} aria-hidden="true" />
                  </summary>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className={styles.workflowPanel}
                  >
                    <p>{step.body}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function LayersSelector() {
  const [activeLayer, setActiveLayer] = useState(0);

  return (
    <div className={styles.layersContent}>
      <div
        className={styles.layersSelector}
        role="group"
        aria-label="Quirq architecture layers"
      >
        {LAYERS.map((layer, index) => {
          const isActive = activeLayer === index;
          const triggerId = `layer-trigger-${layer.id}`;
          const panelId = `layer-panel-${layer.id}`;
          const layerStyle = {
            "--layer-accent": layer.color,
            "--layer-rail": layer.rail,
          } as CSSProperties;

          return (
            <details
              key={layer.id}
              name="home-layers"
              open={isActive}
              className={styles.layerItem}
              style={layerStyle}
            >
              <summary
                id={triggerId}
                aria-controls={panelId}
                aria-expanded={isActive}
                className={styles.layerSummary}
                onClick={(event) => {
                  event.preventDefault();
                  setActiveLayer(index);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveLayer(index);
                  }
                }}
              >
                <span>{layer.number}</span>
                <strong>{layer.label}</strong>
                <span className={styles.disclosureIcon} aria-hidden="true" />
              </summary>
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={styles.layerPanel}
              >
                <h3>{layer.title}</h3>
                <p>{layer.body}</p>
              </div>
            </details>
          );
        })}
      </div>

      <Image
        src="/assets/home-v9/layers-agent-stack.webp"
        alt="An exploded architecture showing output, agent, environment, and runtime layers."
        width={572}
        height={450}
        className={styles.layersArchitecture}
        sizes="(max-width: 699px) calc(100vw - 40px), 40vw"
      />
    </div>
  );
}
