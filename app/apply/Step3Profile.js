"use client";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/app/lib/services";
import { ANIMALS, ATTRIBUTES, CREDENTIALS, CREDENTIAL_EXCLUSIVE } from "@/app/lib/chips";
import { EXPERIENCE, HOURS, BIO_MIN, RADIUS_MIN, RADIUS_MAX } from "@/app/lib/profile";

const ORDER = ["postcode", "dateOfBirth", "services", "experience", "hoursAWeek", "bio", "animals", "travelMiles"];

const Tick = () => (
  <span className="tick">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  </span>
);

export default function Step3Profile({ applicantId, initial, onBack, onDone }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState(null);
  const refs = useRef({});
  const priceRefs = useRef({});
  const [focusService, setFocusService] = useState(null);

  // The price input does not exist until the render after the tick, so focus
  // has to wait for that render rather than fire from inside the updater.
  useEffect(() => {
    if (!focusService) return;
    priceRefs.current[focusService]?.focus();
    setFocusService(null);
  }, [focusService]);

  const set = (k, val) => {
    setV((p) => ({ ...p, [k]: val }));
    setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p));
  };

  const toggleChip = (group, key) => {
    const cur = v[group];
    let next;
    if (group === "credentials") {
      if (key === CREDENTIAL_EXCLUSIVE) {
        next = cur.includes(key) ? [] : [key];           // ticking it clears the rest
      } else {
        next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
        next = next.filter((k) => k !== CREDENTIAL_EXCLUSIVE);
      }
    } else {
      next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
    }
    set(group, next);
  };

  // "The price field only appears once a service is ticked, and it takes focus
  //  automatically."
  const toggleService = (key) => {
    const adding = !(key in v.services);
    setV((p) => {
      const s = { ...p.services };
      if (adding) s[key] = ""; else delete s[key];
      return { ...p, services: s };
    });
    if (adding) setFocusService(key);
    setErrors((p) => (p.services ? { ...p, services: undefined } : p));
  };

  const setPrice = (key, raw) => {
    const clean = raw.replace(/[^\d.]/g, "");
    setV((p) => ({ ...p, services: { ...p.services, [key]: clean } }));
    setErrors((p) => (p.services ? { ...p, services: undefined } : p));
  };

  const focusFirstBad = (errs) => {
    const first = ORDER.find((f) => errs[f]);
    const el = first && refs.current[first];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
    setTimeout(() => {
      // Do not steal focus if the applicant has already started interacting
      // with something else in the meantime.
      const a = document.activeElement;
      if (a && a !== document.body && a.matches("input,select,textarea,button,a")) return;
      el.focus?.({ preventScroll: true });
    }, 300);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setFatal(null);
    try {
      const res = await fetch("/api/apply/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicantId, ...v }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.errors) {
        setErrors(body.errors); focusFirstBad(body.errors); return;
      }
      if (!res.ok) { setFatal(body.error || "Could not save your answers."); return; }
      onDone(v);
    } catch {
      setFatal("Could not reach the server. Check your connection and try again.");
    } finally { setBusy(false); }
  };

  const err = (k) => errors[k] && <span className="errmsg" id={`${k}-err`}>{errors[k]}</span>;
  const aria = (k) => ({
    "aria-invalid": errors[k] ? "true" : undefined,
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  const bioLen = v.bio.trim().length;

  const chipGroup = (group, options, legend, hint) => (
    <div className="field" ref={(el) => (refs.current[group] = el)}>
      <span className="legend">{legend}</span>
      <div className="chips">
        {options.map(([key, label]) => (
          <label key={key} className={`chip${v[group].includes(key) ? " on" : ""}`}>
            <input
              type="checkbox"
              checked={v[group].includes(key)}
              onChange={() => toggleChip(group, key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      {hint && <span className="hint">{hint}</span>}
      {err(group)}
    </div>
  );

  return (
    <form className="card-body" onSubmit={submit} noValidate>
      <h3>Where you are, and what you offer</h3>
      <p className="lead">
        This is the longest step and the last one before you check your answers. Nothing here needs
        a document.
      </p>

      <div className="row">
        <div className="field">
          <label htmlFor="postcode">Postcode</label>
          <input
            id="postcode" ref={(el) => (refs.current.postcode = el)}
            className={`inp${errors.postcode ? " bad" : ""}`}
            value={v.postcode} placeholder="LS6 2AB" autoComplete="postal-code"
            style={{ textTransform: "uppercase" }}
            onChange={(e) => set("postcode", e.target.value)}
            onBlur={(e) => set("postcode", e.target.value.trim().toUpperCase())}
            {...aria("postcode")}
          />
          {!errors.postcode && <span className="hint">Owners see your area, never your street.</span>}
          {err("postcode")}
        </div>
        <div className="field">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth" type="date" ref={(el) => (refs.current.dateOfBirth = el)}
            className={`inp${errors.dateOfBirth ? " bad" : ""}`}
            value={v.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)}
            {...aria("dateOfBirth")}
          />
          {!errors.dateOfBirth && <span className="hint">You must be 18 or over.</span>}
          {err("dateOfBirth")}
        </div>
      </div>

      <div className="rule" ref={(el) => (refs.current.services = el)}>
        What will you offer, and for how much?
      </div>
      {SERVICES.map((s) => {
        const on = s.k in v.services;
        return (
          <div key={s.k} className={`pick${on ? " on" : ""}${errors.services ? " bad" : ""}`}>
            <label className="pick-top">
              <input type="checkbox" checked={on} onChange={() => toggleService(s.k)} />
              <Tick />
              <span>
                <b>{s.n}</b>
                <small>{s.d}</small>
              </span>
            </label>
            {on && (
              <div className="pick-rate">
                <span className="money-in">
                  <span>£</span>
                  <input
                    className="inp"
                    ref={(el) => (priceRefs.current[s.k] = el)}
                    value={v.services[s.k]} inputMode="decimal"
                    aria-label={`Your price for ${s.n}`}
                    onChange={(e) => setPrice(s.k, e.target.value)}
                  />
                </span>
                <span className="unit">{s.unit}</span>
                <span className="typical">Owners usually pay £{s.lo} to £{s.hi}</span>
              </div>
            )}
          </div>
        );
      })}
      {err("services")}

      <div className="note note-m" style={{ marginTop: "18px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v18M16.5 7.5C16 5.9 14.3 5 12 5c-2.5 0-4 1.2-4 3s1.6 2.6 4 3.2c2.6.6 4.4 1.4 4.4 3.4S14.7 18 12 18c-2.4 0-4.2-.9-4.7-2.6" />
        </svg>
        <span>
          Owners pay you directly, in whatever way the two of you agree. There is no commission and
          no cut taken from your rate.
        </span>
      </div>

      <div className="rule">A bit about you</div>

      <div className="row">
        <div className="field">
          <label htmlFor="experience">Experience with animals</label>
          <select id="experience" ref={(el) => (refs.current.experience = el)}
            className={`inp sel${errors.experience ? " bad" : ""}`}
            value={v.experience} onChange={(e) => set("experience", e.target.value)} {...aria("experience")}>
            <option value="">Choose one</option>
            {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
          </select>
          {err("experience")}
        </div>
        <div className="field">
          <label htmlFor="hoursAWeek">Hours a week you can offer</label>
          <select id="hoursAWeek" ref={(el) => (refs.current.hoursAWeek = el)}
            className={`inp sel${errors.hoursAWeek ? " bad" : ""}`}
            value={v.hoursAWeek} onChange={(e) => set("hoursAWeek", e.target.value)} {...aria("hoursAWeek")}>
            <option value="">Choose one</option>
            {HOURS.map((x) => <option key={x}>{x}</option>)}
          </select>
          {err("hoursAWeek")}
        </div>
      </div>

      <div className="field">
        <label htmlFor="bio">About you</label>
        <textarea id="bio" ref={(el) => (refs.current.bio = el)}
          className={`inp ta${errors.bio ? " bad" : ""}`}
          value={v.bio} onChange={(e) => set("bio", e.target.value)}
          placeholder="Mention your own pets, your garden, the park you know inside out."
          {...aria("bio")} />
        {!errors.bio && (
          <span className="hint" style={bioLen >= BIO_MIN ? { color: "var(--ink-2)" } : undefined}>
            {bioLen} characters. Aim for {BIO_MIN} or more.
          </span>
        )}
        {err("bio")}
      </div>

      {chipGroup("animals", ANIMALS, "Animals you are happy with")}
      {chipGroup("attributes", ATTRIBUTES, "Anything else worth knowing")}
      {chipGroup("credentials", CREDENTIALS, "Licences, insurance and certificates you already hold",
        "Just tick what you hold. We do not ask you to upload anything.")}

      <div className="field">
        <label htmlFor="travelMiles">
          How far will you travel? <b style={{ color: "var(--v-700)" }}>{v.travelMiles} miles</b>
        </label>
        <input id="travelMiles" type="range" className="radius"
          ref={(el) => (refs.current.travelMiles = el)}
          min={RADIUS_MIN} max={RADIUS_MAX} step={1} value={v.travelMiles}
          onChange={(e) => set("travelMiles", Number(e.target.value))} />
        {err("travelMiles")}
      </div>

      {fatal && <p className="errmsg" role="alert">{fatal}</p>}

      <div className="nav">
        <button type="button" className="back" onClick={onBack}>Back</button>
        {/* "The button says Check my answers, not Continue, so nobody mistakes
            it for the submit." */}
        <button type="submit" className="btn btn-pri" disabled={busy}>
          {busy ? "Saving" : "Check my answers"}
        </button>
      </div>
    </form>
  );
}
