"use client";
import Link from "next/link";

export const STEPS = [
  { n: 1, title: "Your details", sub: "Name and contact" },
  { n: 2, title: "Verify your email", sub: "Six digit code" },
  { n: 3, title: "About you", sub: "Services, rates, experience" },
  { n: 4, title: "Check and consent", sub: "Before you submit" },
];

// The chrome every frame shares: wordmark, the two legal links, Save and exit,
// the rail and the progress bar. "Save and exit returns to the homepage."
export default function Shell({ step, meta, children }) {
  return (
    <div className="ui">
      <div className="ui-hdr">
        <Link href="/" className="ui-logo">leashh</Link>
        <nav className="ui-nav">
          <Link href="/privacy">Privacy notice</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/" className="btn btn-out btn-sm">Save and exit</Link>
        </nav>
      </div>

      <div className="ui-shell">
        <aside className="rail">
          <h3>Become a Pet Nanny</h3>
          <p>About five minutes. Free to apply and free to stay listed.</p>
          <div className="rail-steps">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className={`rail-step${s.n === step ? " on" : s.n < step ? " done" : ""}`}
                aria-current={s.n === step ? "step" : undefined}
              >
                <span className="rail-dot">{s.n}</span>
                <span>
                  <b>{s.title}</b>
                  <span className="s">{s.sub}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="rail-help">
            <b>No documents, no ID check</b>
            We never ask you to upload anything. The only check we make is that your email address
            is real.
          </div>
        </aside>

        <div className="card">
          <div className="card-top">
            <div className="pbar">
              <i style={{ width: `${step * 25}%` }} />
            </div>
            <div className="card-meta">
              <span>Step <b>{step}</b> of 4</span>
              <span>{meta}</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
