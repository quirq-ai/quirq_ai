"use client";

import { useId, useState } from "react";
import styles from "./machinespeed.module.css";

/**
 * The ten-hour test, ported from the inline script in machinespeed.html.
 *
 * The two sliders are the only interactive thing on the route, so this is the
 * page's whole client boundary; everything around it stays server-rendered.
 * Values are derived on render rather than written back into the DOM by hand,
 * which is the one structural change from the source script.
 */

/** Working weeks in a year, and the share of repeating hours a workflow returns. */
const WEEKS = 48;
const COEF = 0.8 * (1 - 0.2);
/** The target the whole page is pitched against. */
const TARGET_HOURS = 10;

const money = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");

export function Calculator() {
  const hoursId = useId();
  const rateId = useId();
  const [hours, setHours] = useState(15);
  const [rate, setRate] = useState(85);

  const back = hours * COEF;
  const hit = back >= TARGET_HOURS;
  const pct = Math.min(100, (back / TARGET_HOURS) * 100);

  return (
    <section
      className={styles.calc}
      id="calculator"
      aria-labelledby="calc-heading"
    >
      <div className={styles.k}>The ten-hour test</div>
      <h2 id="calc-heading">What is the repeating work costing you?</h2>
      <p className={styles.lede}>
        Two numbers, and you can see the shape of it. This is a guide, not a
        quote: the real figure comes from measuring one workflow for thirty
        days.
      </p>

      <div className={styles.calcGrid}>
        <div>
          <div className={styles.field}>
            <label htmlFor={hoursId}>
              Hours a week you spend on work that repeats
            </label>
            <div className={styles.row}>
              <input
                type="range"
                id={hoursId}
                min={1}
                max={40}
                step={1}
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
              />
              <div className={styles.val}>
                {hours} <span>hrs</span>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={rateId}>What an hour of your time is worth</label>
            <div className={styles.row}>
              <input
                type="range"
                id={rateId}
                min={25}
                max={400}
                step={5}
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
              />
              <div className={styles.val}>
                ${rate} <span>/hr</span>
              </div>
            </div>
          </div>

          <div className={styles.pair}>
            <div className={styles.stat}>
              <div className={styles.kk}>
                What that repeating work costs you now
              </div>
              <div className={styles.vv}>{money(hours * WEEKS * rate)}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.kk}>
                What the returned hours are worth
              </div>
              <div className={styles.vv}>{money(back * WEEKS * rate)}</div>
            </div>
          </div>
        </div>

        <div className={styles.out}>
          <div className={styles.k} style={{ marginBottom: 12 }}>
            Hours back, every week
          </div>
          <div className={styles.big}>
            {back.toFixed(1)}
            <small>hours</small>
          </div>
          {/* The bar is decoration: the number above it is the same fact, and
              the sentence below states it in words. */}
          <div className={styles.bar} aria-hidden>
            <div
              className={`${styles.fill}${hit ? ` ${styles.hit}` : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className={styles.note} role="status">
            {hit
              ? "Past ten hours a week. The constraint is no longer finding the time: it is deciding what those hours are for."
              : `Ten hours a week is the target. At this rate you would need about ${Math.ceil(
                  TARGET_HOURS / COEF,
                )} hours a week of repeating work to reach it.`}
          </div>
        </div>
      </div>
    </section>
  );
}
