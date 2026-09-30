"use client";
import Link from "next/link";

// "No dead end. Both buttons lead somewhere useful." "All four rail steps show
// complete." "Steps 1 and 3 name the handover and the identity check again.
// Second time the applicant has seen both, which is intentional."
export default function Complete({ firstName, reference, postcode, miles, onReset }) {
  return (
    <div className="panel">
      <div className="panel-ico ico-tick">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h3>You are in, {firstName}</h3>
      <p>Your application is complete. Keep your reference somewhere safe.</p>
      <div className="ref">Reference {reference}</div>

      <div className="steps-out">
        <div><i>1</i><span>Your application goes to the company that operates the Pet Nanny network.</span></div>
        <div><i>2</i><span>It contacts you directly, usually within five working days, and tells you who it is.</span></div>
        <div><i>3</i><span>It verifies your identity and asks for any documents it needs.</span></div>
        <div><i>4</i><span>Once approved, your profile goes live to owners within <b>{miles} miles</b> of <b>{postcode}</b>.</span></div>
      </div>

      <div style={{ marginTop: "26px", display: "flex", gap: "11px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-out" onClick={onReset}>Back to Leashh</Link>
        <Link href="/privacy" className="btn btn-out">Read the privacy notice</Link>
      </div>
    </div>
  );
}
