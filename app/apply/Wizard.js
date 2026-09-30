"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Shell, { STEPS } from "./Shell";
import Step1Details from "./Step1Details";
import Step2Verify from "./Step2Verify";
import Step3Profile from "./Step3Profile";
import { RADIUS_DEFAULT } from "@/app/lib/profile";

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
  const [step, setStep] = useState(1);
  const [app, setApp] = useState({ applicantId: null, email: "", firstName: "" });
  const [details, setDetails] = useState({ firstName: "", lastName: "", email: "", mobile: "" });
  const [profile, setProfile] = useState({
    postcode: "", dateOfBirth: "", experience: "", hoursAWeek: "", bio: "",
    services: {}, animals: [], attributes: [], credentials: [], travelMiles: RADIUS_DEFAULT,
  });

  useEffect(() => {
    const saved = load();
    if (saved?.applicantId) {
      setApp({ applicantId: saved.applicantId, email: saved.email, firstName: saved.firstName });
      setDetails((d) => ({ ...d, ...(saved.details || {}) }));
      if (saved.profile) setProfile((x) => ({ ...x, ...saved.profile }));
      setStep(saved.step || 2);
    }
  }, []);

  const goto = (n, next = app) => {
    setStep(n);
    save({ ...next, step: n, details, profile });
  };

  // Step 1 renders on the server and on the first client pass, so the form is
  // in the HTML rather than appearing after hydration. Someone resuming sees a
  // brief step 1 before the effect moves them on, which is the rarer case and
  // far better than every visitor watching an empty card.
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
            save({ ...next, step: 2, details, profile });
          }}
          onDone={() => goto(3)}
        />
      </Shell>
    );
  }

  if (step === 3) {
    return (
      <Shell step={3} meta="About you">
        <Step3Profile
          applicantId={app.applicantId}
          initial={profile}
          onBack={() => goto(2)}
          onDone={(next) => {
            setProfile(next);
            setStep(4);
            save({ ...app, step: 4, details, profile: next });
          }}
        />
      </Shell>
    );
  }

  // Step 4 is next. The chrome stays honest rather than dead-ending.
  return (
    <Shell step={4} meta="Check and consent">
      <div className="card-body soon">
        <div className="panel-ico ico-tick" style={{ margin: "0 auto 16px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>Your answers are saved</h3>
        <p>
          The last step, where you check everything over and confirm the declarations, is being
          finished now. Nothing has been sent to anyone yet, and nothing will be until you agree
          to it there. We will email you the moment you can complete it.
        </p>
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <button type="button" className="btn btn-out" onClick={() => goto(3)}>Back to my answers</button>
          <Link href="/" className="btn btn-pri">Back to Leashh</Link>
        </div>
      </div>
    </Shell>
  );
}
