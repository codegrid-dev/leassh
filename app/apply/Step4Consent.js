"use client";
import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/app/lib/services";
import { ANIMALS, CREDENTIALS } from "@/app/lib/chips";
import { MANDATORY, OPTIONAL, TEXTS } from "@/app/lib/declarations";

const label = (pairs, keys) =>
  keys.map((k) => pairs.find(([kk]) => kk === k)?.[1]).filter(Boolean).join(", ");

const ukDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

// Renders **bold** and [text](/href) without handing raw HTML to the DOM.
function Wording({ text }) {
  const parts = text.split(/(\*\*.+?\*\*|\[.+?\]\(.+?\))/g).filter(Boolean);
  return parts.map((p, i) => {
    let m = /^\*\*(.+?)\*\*$/.exec(p);
    if (m) return <b key={i}>{m[1]}</b>;
    m = /^\[(.+?)\]\((.+?)\)$/.exec(p);
    // "The terms and privacy links open in a new tab so nothing entered is lost."
    if (m) return <Link key={i} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</Link>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export default function Step4Consent({ applicantId, details, profile, onBack, onEdit, onDone }) {
  const [ticked, setTicked] = useState({});
  const [gate, setGate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState(null);
  const gateRef = useRef(null);
  const ckRefs = useRef({});

  const toggle = (k) => {
    setTicked((p) => ({ ...p, [k]: !p[k] }));
    setGate(false);          // "Highlighting clears the moment a box is ticked."
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const missing = MANDATORY.filter((k) => !ticked[k]);
    if (missing.length) {
      // "Scroll to the first unconfirmed item. Do not simply grey out the
      //  submit button, because that gives no reason."
      setGate(true);
      const el = ckRefs.current[missing[0]];
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" });
      }
      return;
    }
    setBusy(true); setFatal(null);
    try {
      const res = await fetch("/api/apply/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicantId, accepted: ticked }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setFatal(body.error || "Could not submit your application."); return; }
      onDone(body.reference);
    } catch {
      setFatal("Could not reach the server. Check your connection and try again.");
    } finally { setBusy(false); }
  };

  const services = Object.entries(profile.services).map(([k, price]) => {
    const s = SERVICES.find((x) => x.k === k);
    return s ? `${s.n} at £${price} ${s.unit}` : null;
  }).filter(Boolean);

  // "Every row must be correctable by clicking a completed step in the rail."
  const Row = ({ k, children, step }) => (
    <div className="sum-row">
      <span className="k">{k}</span>
      <span className="v">
        {children}
        {step && (
          <button type="button" className="linkish" style={{ marginLeft: "10px", fontSize: "12.4px" }}
            onClick={() => onEdit(step)}>Change</button>
        )}
      </span>
    </div>
  );

  const Gate = ({ title, required, note, keys }) => (
    <div className={`gate${required ? "" : " plain"}`}>
      <div className="gate-hd">
        <span>
          <b>{title}<span className={`pill ${required ? "pill-req" : "pill-opt"}`}>
            {required ? "Required" : "Optional"}</span></b>
          <span className="s">{note}</span>
        </span>
      </div>
      <div className="gate-bd">
        {keys.map((k) => {
          const on = Boolean(ticked[k]);
          const bad = required && gate && !on;
          return (
            <label key={k} className={`ck${on ? " on" : ""}${bad ? " bad" : ""}`}
              ref={(el) => (ckRefs.current[k] = el)}>
              <input type="checkbox" checked={on} onChange={() => toggle(k)} />
              <span className="box" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <p><Wording text={TEXTS[k]} /></p>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <form className="card-body" onSubmit={submit} noValidate>
      <h3>Check your answers, then confirm</h3>
      <p className="lead">
        Read these carefully. They set out what happens to your application and who will be in
        touch.
      </p>

      <div className="summary">
        <Row k="Name" step={1}>{details.firstName} {details.lastName}</Row>
        <Row k="Email">
          {details.email} <span className="vbadge">VERIFIED</span>
        </Row>
        <Row k="Mobile" step={1}>{details.mobile}</Row>
        <Row k="Date of birth" step={3}>{ukDate(profile.dateOfBirth)}</Row>
        <Row k="Postcode" step={3}>{profile.postcode}</Row>
        <Row k="Services" step={3}>
          {services.map((s, i) => <Fragment key={s}>{i > 0 && <br />}{s}</Fragment>)}
        </Row>
        <Row k="Animals" step={3}>{label(ANIMALS, profile.animals)}</Row>
        <Row k="Experience" step={3}>{profile.experience}</Row>
        <Row k="Availability" step={3}>{profile.hoursAWeek}</Row>
        <Row k="Travel radius" step={3}>{profile.travelMiles} miles</Row>
        {profile.credentials.length > 0 && (
          <Row k="Already holds" step={3}>{label(CREDENTIALS, profile.credentials)}</Row>
        )}
      </div>

      {/* "Both notices sit above the tick boxes. The applicant scrolls past the
          disclosure to reach the thing they are confirming." This is the only
          place the operating company is mentioned, by instruction. */}
      <div className="note note-v">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
        </svg>
        <span>
          <b>What happens after you submit.</b> Leashh introduces Pet Nannies to pet owners. The
          Pet Nanny network itself is operated by a separate pet services company. We pass your
          application to that company so it can assess you, contact you and complete your
          onboarding. It is a separate data controller and will give you its own privacy notice
          when it first contacts you. If you would like its name before then, email{" "}
          <a href="mailto:privacy@leashh.com">privacy@leashh.com</a> and we will tell you.
        </span>
      </div>

      <div className="note note-a">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l9 16H3zM12 9v5M12 17h.01" />
        </svg>
        <span>
          <b>Your identity checks happen later, with that company.</b> Leashh has not checked your
          identity and has not asked you for any documents. Before you can be approved, the
          operating company will verify who you are and ask for whatever paperwork it needs, which
          may include a background check. Submitting this form does not approve you.
        </span>
      </div>

      <Gate title="Declarations" required keys={MANDATORY}
        note="You cannot submit without confirming each of these." />
      <Gate title="Staying in touch" keys={OPTIONAL}
        note="Tick these if you want them. Your application is unaffected either way." />

      {/* "The message sits directly above the submit button, where the eye
          already is." */}
      {gate && (
        <p className="errmsg" role="alert" ref={gateRef} style={{ marginTop: "16px" }}>
          Please confirm every declaration above before you submit
        </p>
      )}
      {fatal && <p className="errmsg" role="alert" style={{ marginTop: "16px" }}>{fatal}</p>}

      <div className="nav">
        <button type="button" className="back" onClick={onBack}>Back</button>
        <button type="submit" className="btn btn-pri" disabled={busy}>
          {busy ? "Submitting" : "Submit my application"}
        </button>
      </div>
    </form>
  );
}
