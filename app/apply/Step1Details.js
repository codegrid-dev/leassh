"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Turnstile from "./Turnstile";

const FIELDS = ["firstName", "lastName", "email", "mobile"];

// "Validation fires on Continue, not while typing. Errors clear the moment a
//  field is edited." "Scroll to the first failing field and focus it."
export default function Step1Details({ initial, onDone }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState(null);
  const [token, setToken] = useState(null);
  const refs = useRef({});

  const set = (k) => (e) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p));
  };

  const focusFirstBad = (errs) => {
    const first = FIELDS.find((f) => errs[f]);
    const el = first && refs.current[first];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
    setTimeout(() => el.focus({ preventScroll: true }), 300);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFatal(null);
    try {
      const res = await fetch("/api/apply/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...v, turnstileToken: token, website: "" }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.errors) {
        setErrors(body.errors);
        focusFirstBad(body.errors);
        return;
      }
      if (!res.ok) {
        setFatal(body.error || "Something went wrong. Please try again.");
        return;
      }
      onDone({ applicantId: body.applicantId, email: v.email.trim(), firstName: v.firstName.trim() });
    } catch {
      setFatal("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const field = (name, label, props = {}, hint = null) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        ref={(el) => (refs.current[name] = el)}
        className={`inp${errors[name] ? " bad" : ""}`}
        value={v[name]}
        onChange={set(name)}
        aria-invalid={errors[name] ? "true" : undefined}
        aria-describedby={errors[name] ? `${name}-err` : hint ? `${name}-hint` : undefined}
        {...props}
      />
      {hint && !errors[name] && <span className="hint" id={`${name}-hint`}>{hint}</span>}
      {errors[name] && <span className="errmsg" id={`${name}-err`}>{errors[name]}</span>}
    </div>
  );

  return (
    <form className="card-body" onSubmit={submit} noValidate>
      <h3>Let&apos;s start with you</h3>
      <p className="lead">
        Four things and you are through to the next step. You need to be 18 or over and living in
        the UK.
      </p>

      <div className="row">
        {field("firstName", "First name", { placeholder: "Amara", autoComplete: "given-name" })}
        {field("lastName", "Last name", { placeholder: "Kaur", autoComplete: "family-name" })}
      </div>

      {field(
        "email",
        "Email",
        { placeholder: "amara@example.co.uk", type: "email", autoComplete: "email", inputMode: "email" },
        "We send a six digit code here on the next step."
      )}

      {field("mobile", "Mobile", {
        placeholder: "07700 900123",
        type: "tel",
        autoComplete: "tel",
        inputMode: "tel",
      })}

      {/* "The privacy link belongs on this screen, not later. Article 13 says the
          information is given when the data is obtained, and that is now." */}
      <div className="note note-v">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l7.5 3.2v5c0 4.4-3.1 8.4-7.5 9.6C7.6 19.6 4.5 15.6 4.5 11.2v-5z" />
        </svg>
        <span>
          We save these details when you continue, so you can pick up where you left off. Nothing
          goes to anyone else unless you finish your application and agree to it on the last step.
          Read our <Link href="/privacy">privacy notice</Link>.
        </span>
      </div>

      <Turnstile onToken={setToken} />

      {fatal && <p className="errmsg" role="alert" style={{ marginTop: "14px" }}>{fatal}</p>}

      <div className="nav">
        <button type="submit" className="btn btn-pri" disabled={busy}>
          {busy ? "One moment" : "Continue"}
        </button>
      </div>
    </form>
  );
}
