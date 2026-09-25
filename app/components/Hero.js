"use client";
import { useEffect, useRef, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const RATES = [
  { rate: 16, label: "Dog walking", sub: "£16/hr" },
  { rate: 14, label: "Drop-in visits", sub: "£14/hr" },
  { rate: 20, label: "Pet bathing", sub: "£20/hr" },
];
const MAX_SLOTS = 4;

const money = (n) => "£" + Math.round(n).toLocaleString("en-GB");

// Counts up to a new weekly figure, honouring prefers-reduced-motion
// as the guidelines require.
function useCountUp(value) {
  const [shown, setShown] = useState(value);
  // null on first run, so the figure counts up from zero on load exactly as
  // the prototype does. Server renders the real total, so no-JS still reads right.
  const from = useRef(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { from.current = value; setShown(value); return; }
    let raf, t0 = null;
    const start = from.current === null ? 0 : from.current, dur = 420;
    const frame = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(start + (value - start) * e);
      if (p < 1) raf = requestAnimationFrame(frame);
      else from.current = value;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return shown;
}

export default function Hero() {
  const [hours, setHours] = useState([2, 0, 2, 0, 2, 3, 2]);
  const [rate, setRate] = useState(16);

  const total = hours.reduce((a, b) => a + b, 0);
  const weekly = total * rate;
  const shownWeekly = useCountUp(weekly);

  // Tapping the slot you are already on clears back down to it.
  const setSlot = (day, slot) =>
    setHours((h) => h.map((v, i) => (i === day ? (v === slot + 1 ? slot : slot + 1) : v)));

  return (
    <section className="hero" id="top">
      <div className="wrap hero-in">
        <div>
          <span className="eyebrow">Pet Nanny applications open · UK · 18 and over</span>
          <h1>Spare hours.<br /><span className="cash">Spare cash.</span></h1>
          <p className="hero-sub">
            Leashh puts you in front of pet owners on your own street. You set your rates, you pick
            who you work with, and the walk you were going on anyway starts paying.
          </p>
          <div className="hero-cta">
            <a href="/apply" className="btn btn-primary">Become a Pet Nanny</a>
            <a href="#how" className="btn btn-ghost">See how it works</a>
          </div>
          <div className="hero-trust">
            {[
              "2 million pet owners already on Leashh",
              "Free to join, no listing fee",
              "You set the price, you keep it",
            ].map((t) => (
              <span className="trust-item" key={t}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="dial" id="dial">
          <div className="dial-top">
            <div>
              <h3>What are your spare hours worth?</h3>
              <p>Tap the hours you could give each week.</p>
            </div>
            <span className="dial-badge">Live</span>
          </div>

          <div className="seg" role="group" aria-label="Choose a service to price">
            {RATES.map((r) => (
              <button key={r.rate} type="button" aria-pressed={rate === r.rate}
                onClick={() => setRate(r.rate)}>
                {r.label}<small>{r.sub}</small>
              </button>
            ))}
          </div>

          <div className="week" id="week">
            {DAYS.map((d, i) => (
              <div className={`day${hours[i] === 0 ? " empty" : ""}`} key={d} data-day={i}>
                <div className="day-label">{d}</div>
                <div className="slots" role="group" aria-label={FULL[i]}>
                  {Array.from({ length: MAX_SLOTS }, (_, s) => (
                    <button key={s} type="button"
                      className={`slot${s < hours[i] ? " on" : ""}`}
                      aria-label={`Set ${FULL[i]} to ${s + 1} hour${s ? "s" : ""}`}
                      onClick={() => setSlot(i, s)} />
                  ))}
                </div>
                <div className="day-hrs">{hours[i] ? hours[i] + "h" : "0h"}</div>
              </div>
            ))}
          </div>

          <div className="dial-out">
            <div>
              <span className="lbl">You could earn</span>
              <div className="big money" id="wk">{money(shownWeekly)}</div>
              <div className="sub">
                a week · <span className="money" id="mo">{money(weekly * 4.33)}</span> a month ·{" "}
                <span className="money" id="yr">{money(weekly * 52)}</span> a year
              </div>
            </div>
            <div className="go">
              <a href="/apply" className="btn btn-primary btn-sm">Claim it</a>
            </div>
          </div>
          <p className="dial-note">
            Based on typical Leashh rates in UK towns and cities. Your own price is yours to set, and
            plenty of Pet Nannies charge more at weekends and bank holidays.
          </p>
        </div>
      </div>
    </section>
  );
}
