"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Shell, { STEPS } from "./Shell";
import Step1Details from "./Step1Details";
import Step2Verify from "./Step2Verify";

const KEY = "leashh.application";

// Resumability comes from the record, not from this. The stored id only saves
// the applicant re-entering step 1 after a refresh; the server is still the
// authority, and a duplicate email resumes the same record anyway.
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
};
const save = (v) => {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
};

export default function Wizard() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(1);
  const [app, setApp] = useState({ applicantId: null, email: "", firstName: "" });
  const [details, setDetails] = useState({ firstName: "", lastName: "", email: "", mobile: "" });

  useEffect(() => {
    const saved = load();
    if (saved?.applicantId) {
      setApp({ applicantId: saved.applicantId, email: saved.email, firstName: saved.firstName });
      setDetails((d) => ({ ...d, ...(saved.details || {}) }));
      setStep(saved.step || 2);
    }
    setReady(true);
  }, []);

  const goto = (n, next = app) => {
    setStep(n);
    save({ ...next, step: n, details });
  };

  // Avoid rendering step 1 for a split second before the saved state loads.
  if (!ready) return <Shell step={1} meta="Your details"><div className="card-body" /></Shell>;

  if (step === 1) {
    return (
      <Shell step={1} meta="Your details">
        <Step1Details
          initial={details}
          onDone={(next) => {
            setApp(next);
            goto(2, next);
          }}
        />
      </Shell>
    );
  }

  if (step === 2) {
    return (
      <Shell step={2} meta="Verify your email">
        <Step2Verify
          applicantId={app.applicantId}
          email={app.email}
          onEmailChanged={(email) => {
            const next = { ...app, email };
            setApp(next);
            save({ ...next, step: 2, details });
          }}
          onDone={() => goto(3)}
        />
      </Shell>
    );
  }

  // Steps 3 and 4 are next. The chrome stays honest rather than dead-ending.
  return (
    <Shell step={3} meta={STEPS[2].title}>
      <div className="card-body soon">
        <div className="panel-ico ico-tick" style={{ margin: "0 auto 16px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>Your email is confirmed</h3>
        <p>
          That is the only check we make. The rest of the form, where you set your services and
          your rates, is being finished now. We have your details safe and we will email you the
          moment you can carry on.
        </p>
        <div style={{ marginTop: "24px" }}>
          <Link href="/" className="btn btn-pri">Back to Leashh</Link>
        </div>
      </div>
    </Shell>
  );
}
