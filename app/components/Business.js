"use client";
import { useState } from "react";

// Business listing request. Ported from the prototype, client side only.
// Whether this form is in scope, and where it submits, is still an open
// question with the client, so it deliberately has no backend yet.

const TYPES = [
  "Grooming salon", "Mobile groomer", "Veterinary practice",
  "Boarding kennel or cattery", "Doggy day care", "Trainer or behaviourist",
  "Hydrotherapy or rehabilitation", "Other pet business",
];
const SERVICES = ["Grooming", "Veterinary care", "Boarding", "Day care", "Training", "Microchipping"];
const NEEDS_LICENCE = ["Boarding kennel or cattery", "Doggy day care"];
const RX = {
  email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
  pc: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
};

const reference = (prefix) => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
  return prefix + s;
};

const Field = ({ id, label, bad, err, children }) => (
  <div className={`field${bad ? " bad" : ""}`}>
    <label htmlFor={id}>{label}</label>
    {children}
    <span className="err">{err}</span>
  </div>
);

export default function Business() {
  const [v, setV] = useState({
    bizType: "", bizName: "", bizPc: "", bizRcvs: "", bizLic: "",
    bizContact: "", bizEmail: "", services: [], auth: false, partner: false, mkt: false,
  });
  const [bad, setBad] = useState({});
  const [done, setDone] = useState(null);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setV((p) => ({ ...p, [k]: val }));
    setBad((p) => ({ ...p, [k]: false }));
  };
  const toggleService = (s) => {
    setV((p) => ({
      ...p,
      services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s],
    }));
    setBad((p) => ({ ...p, services: false }));
  };

  const showRcvs = v.bizType === "Veterinary practice";
  const showLic = NEEDS_LICENCE.includes(v.bizType);

  const submit = (e) => {
    e.preventDefault();
    const b = {
      bizType: !v.bizType,
      bizName: !v.bizName.trim(),
      bizContact: !v.bizContact.trim(),
      bizPc: !RX.pc.test(v.bizPc.trim()),
      bizEmail: !RX.email.test(v.bizEmail.trim()),
      bizRcvs: showRcvs && !v.bizRcvs.trim(),
      bizLic: showLic && !v.bizLic.trim(),
      services: v.services.length === 0,
      auth: !v.auth,
      partner: !v.partner,
    };
    setBad(b);
    if (Object.values(b).some(Boolean)) {
      const first = document.querySelector("#bizForm .field.bad, #bizForm .checkline.bad");
      if (first) {
        window.scrollTo({ top: first.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
        const inp = first.querySelector("input,select,textarea");
        if (inp) setTimeout(() => inp.focus({ preventScroll: true }), 350);
      }
      return;
    }
    setDone({
      name: v.bizName.trim(),
      email: v.bizEmail.trim(),
      ref: reference("LSH-B-"),
    });
  };

  return (
    <section className="sec biz" id="business">
      <div className="wrap">
        <div className="biz-in">
          <div>
            <span className="eyebrow">For established businesses</span>
            <h2>Already trading? Get on the map.</h2>
            <p>
              Two million pet owners open Leashh looking for someone near them. Groomers, veterinary
              practices, kennels, catteries, day care and trainers can list their premises free and
              be found by postcode.
            </p>
            <div className="biz-types">
              {[
                "Grooming salons and mobile groomers",
                "Veterinary practices and out of hours clinics",
                "Boarding kennels, catteries and day care",
                "Trainers, behaviourists and hydrotherapists",
              ].map((t) => (
                <div className="biz-type" key={t}>
                  <i>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </i>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="biz-card">
            {!done && (
              <form id="bizForm" noValidate onSubmit={submit}>
                <h3>List your business</h3>
                <p>We check every listing before it goes live. No cost to list.</p>

                <Field id="bizType" label="What kind of business are you?" bad={bad.bizType}
                  err="Please choose a business type">
                  <select className="inp" id="bizType" value={v.bizType} onChange={set("bizType")}>
                    <option value="">Choose one</option>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>

                <div className="row">
                  <Field id="bizName" label="Business name" bad={bad.bizName}
                    err="Please enter your business name">
                    <input className="inp" id="bizName" placeholder="Paws and Claws Spa"
                      value={v.bizName} onChange={set("bizName")} />
                  </Field>
                  <Field id="bizPc" label="Postcode" bad={bad.bizPc}
                    err="Please enter a valid UK postcode">
                    <input className="inp" id="bizPc" placeholder="SE1 0XP"
                      style={{ textTransform: "uppercase" }} value={v.bizPc} onChange={set("bizPc")} />
                  </Field>
                </div>

                {showRcvs && (
                  <Field id="bizRcvs" label="RCVS practice number" bad={bad.bizRcvs}
                    err="Veterinary listings need an RCVS practice number">
                    <input className="inp" id="bizRcvs" placeholder="For example 7412345"
                      value={v.bizRcvs} onChange={set("bizRcvs")} />
                  </Field>
                )}
                {showLic && (
                  <Field id="bizLic" label="Local authority licence number" bad={bad.bizLic}
                    err="Boarding and day care listings need a council licence number">
                    <input className="inp" id="bizLic" placeholder="For example LN/2026/0771"
                      value={v.bizLic} onChange={set("bizLic")} />
                  </Field>
                )}

                <div className="row">
                  <Field id="bizContact" label="Contact name" bad={bad.bizContact}
                    err="Please enter a contact name">
                    <input className="inp" id="bizContact" placeholder="Jessica Woolz"
                      value={v.bizContact} onChange={set("bizContact")} />
                  </Field>
                  <Field id="bizEmail" label="Work email" bad={bad.bizEmail}
                    err="Please enter a valid work email">
                    <input className="inp" id="bizEmail" type="email"
                      placeholder="hello@pawsandclaws.co.uk" value={v.bizEmail} onChange={set("bizEmail")} />
                  </Field>
                </div>

                <div className={`field${bad.services ? " bad" : ""}`}>
                  <span className="legend">Services you offer</span>
                  <div className="chips">
                    {SERVICES.map((s) => (
                      <label className="chip" key={s}>
                        <input type="checkbox" name="bizSvc" value={s}
                          checked={v.services.includes(s)} onChange={() => toggleService(s)} />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                  <span className="err">Please choose at least one service</span>
                </div>

                <div style={{ borderTop: "1px solid var(--line-2)", marginTop: "6px" }}>
                  <div className={`checkline${bad.auth ? " bad" : ""}`}>
                    <input type="checkbox" id="bizAuth" checked={v.auth} onChange={set("auth")} />
                    <label htmlFor="bizAuth">
                      I am authorised to list this business and confirm it holds every{" "}
                      <b>licence and registration</b> the law requires.
                    </label>
                  </div>
                  <div className={`checkline${bad.partner ? " bad" : ""}`}>
                    <input type="checkbox" id="bizPartner" checked={v.partner} onChange={set("partner")} />
                    <label htmlFor="bizPartner">
                      I understand Leashh will pass these details to{" "}
                      <b>a pet services company that operates the network</b>, and I agree that it
                      may contact this business directly about listing and onboarding.
                    </label>
                  </div>
                  <div className="checkline">
                    <input type="checkbox" id="bizMkt" checked={v.mkt} onChange={set("mkt")} />
                    <label htmlFor="bizMkt">
                      Send us occasional emails about new features and how to get more enquiries.
                      Optional.
                    </label>
                  </div>
                </div>
                {(bad.auth || bad.partner) && (
                  <span className="err" id="bizGateErr" style={{ display: "block" }}>
                    Please confirm both required boxes before you submit
                  </span>
                )}

                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: "20px" }}>
                  Request a listing
                </button>
              </form>
            )}

            <div className={`biz-done${done ? " on" : ""}`} id="bizDone">
              <div className="done-tick" style={{ width: "64px", height: "64px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 style={{ fontSize: "23px" }}>Listing requested</h3>
              <p style={{ color: "var(--muted)", marginTop: "10px", fontSize: "15px" }}>
                We will verify <b>{done?.name ?? "your business"}</b> and email{" "}
                <b>{done?.email ?? "you"}</b> once it is live to owners nearby.
              </p>
              <div className="ref" style={{ marginTop: "16px" }}>
                Reference <span>{done?.ref ?? "LSH-B-0000"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
