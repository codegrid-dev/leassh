"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Shell, { STEPS } from "./Shell";
import Step1Details from "./Step1Details";
import Step2Verify from "./Step2Verify";
import Step3Profile from "./Step3Profile";
import Step4Consent from "./Step4Consent";
import Complete from "./Complete";
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
  const [reference, setReference] = useState(null);
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
      if (saved.reference) setReference(saved.reference);
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
          onDone={({ applicantId, details: d }) => {
            const next = { applicantId, email: d.email, firstName: d.firstName };
            setApp(next);
            setDetails(d);
            setStep(2);
            save({ ...next, step: 2, details: d, profile });
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
          onEmailChanged={(email, newId) => {
            const next = { ...app, email, applicantId: newId || app.applicantId };
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

  if (step === 4) {
    return (
      <Shell step={4} meta="Check and consent">
        <Step4Consent
          applicantId={app.applicantId}
          details={{ ...details, email: app.email }}
          profile={profile}
          onBack={() => goto(3)}
          onEdit={(n) => goto(n)}
          onDone={(ref) => {
            setReference(ref);
            setStep(5);
            save({ ...app, step: 5, details, profile, reference: ref });
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell step={4} meta="Complete" allComplete>
      <Complete
        firstName={details.firstName}
        reference={reference}
        postcode={profile.postcode}
        miles={profile.travelMiles}
        onReset={() => { try { localStorage.removeItem(KEY); } catch {} }}
      />
    </Shell>
  );
}
