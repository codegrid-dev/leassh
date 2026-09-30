"use client";
import { useEffect, useRef, useState } from "react";

const LEN = 6;

// "Six separate boxes. Typing advances, backspace retreats, pasting a full code
//  fills all six." "All six boxes take the error style together. The applicant
//  cannot know which digit is wrong." "Entered digits stay on screen."
export default function Step2Verify({ applicantId, email, onDone, onEmailChanged }) {
  const [digits, setDigits] = useState(Array(LEN).fill(""));
  const [error, setError] = useState(null);
  const [lockedOut, setLockedOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [changing, setChanging] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [emailError, setEmailError] = useState(null);
  const boxes = useRef([]);

  useEffect(() => { boxes.current[0]?.focus(); }, []);

  const code = digits.join("");

  const put = (i, ch) => {
    setDigits((p) => { const n = [...p]; n[i] = ch; return n; });
    setError(null);
  };

  const onChange = (i) => (e) => {
    const only = e.target.value.replace(/\D/g, "");
    if (!only) { put(i, ""); return; }
    if (only.length > 1) {          // a paste landed in one box
      const next = [...digits];
      for (let k = 0; k < LEN - i; k++) next[i + k] = only[k] ?? next[i + k];
      setDigits(next); setError(null);
      boxes.current[Math.min(i + only.length, LEN - 1)]?.focus();
      return;
    }
    put(i, only);
    if (i < LEN - 1) boxes.current[i + 1]?.focus();
  };

  const onKeyDown = (i) => (e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      put(i - 1, "");
      boxes.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) boxes.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LEN - 1) boxes.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const only = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, LEN);
    if (!only) return;
    e.preventDefault();
    const next = Array(LEN).fill("");
    for (let k = 0; k < only.length; k++) next[k] = only[k];
    setDigits(next); setError(null);
    boxes.current[Math.min(only.length, LEN - 1)]?.focus();
  };

  const confirm = async (e) => {
    e.preventDefault();
    if (busy || code.length !== LEN) return;
    setBusy(true); setNotice(null);
    try {
      const res = await fetch("/api/apply/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicantId, code }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) { onDone(); return; }
      setError(body.error || "That code is not right. Check your email and try again.");
      setLockedOut(Boolean(body.lockedOut) || res.status === 410);
      boxes.current[0]?.focus();     // "Focus returns to the first box."
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const res = await fetch("/api/apply/code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicantId }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setDigits(Array(LEN).fill("")); setLockedOut(false);
        setNotice("A new code is on its way. The previous one no longer works.");
        boxes.current[0]?.focus();
      } else {
        setError(body.error || "Could not send a new code. Try again shortly.");
      }
    } finally { setBusy(false); }
  };

  const saveEmail = async (e) => {
    e.preventDefault();
    setBusy(true); setEmailError(null);
    try {
      const res = await fetch("/api/apply/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ applicantId, email: newEmail }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        onEmailChanged(newEmail.trim().toLowerCase(), body.applicantId);
        setChanging(false); setDigits(Array(LEN).fill("")); setLockedOut(false); setError(null);
        setNotice("Code sent to your new address.");
        boxes.current[0]?.focus();
      } else {
        setEmailError(body.errors?.email || body.error || "Could not change the address.");
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="panel" style={{ paddingTop: "26px" }}>
      <div className="panel-ico ico-mail">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18v12H3z" /><path d="M3 7l9 7 9-7" />
        </svg>
      </div>
      <h3>Check your email</h3>
      <p>
        We have sent a six digit code to <b>{email}</b>. Enter it below so we know the address is
        real. The code expires in 15 minutes.
      </p>

      <form onSubmit={confirm}>
        <div className={`code${error ? " bad" : ""}`} onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (boxes.current[i] = el)}
              value={d}
              onChange={onChange(i)}
              onKeyDown={onKeyDown(i)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={LEN}
              aria-label={`Digit ${i + 1} of ${LEN}`}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "code-err" : undefined}
            />
          ))}
        </div>

        {error && <p className="errmsg" id="code-err" role="alert" style={{ textAlign: "center" }}>{error}</p>}
        {notice && <p className="hint" role="status" style={{ textAlign: "center" }}>{notice}</p>}

        <div style={{ marginTop: "16px" }}>
          <button type="submit" className="btn btn-pri" disabled={busy || code.length !== LEN || lockedOut}>
            {busy ? "Checking" : "Confirm my email"}
          </button>
        </div>
      </form>

      {/* "Change your email address matters. A typo at step 1 otherwise traps
          the applicant here with no way out." */}
      {!changing ? (
        <p className="resend">
          Nothing arrived? Check your spam folder,{" "}
          <button type="button" className="linkish" onClick={resend} disabled={busy}>send a new code</button>, or{" "}
          <button type="button" className="linkish" onClick={() => setChanging(true)}>change your email address</button>.
        </p>
      ) : (
        <form onSubmit={saveEmail} style={{ marginTop: "18px", textAlign: "left" }}>
          <div className="field">
            <label htmlFor="newEmail">New email address</label>
            <input
              id="newEmail" type="email" inputMode="email"
              className={`inp${emailError ? " bad" : ""}`}
              value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setEmailError(null); }}
              aria-invalid={emailError ? "true" : undefined}
              aria-describedby={emailError ? "newEmail-err" : undefined}
            />
            {emailError && <span className="errmsg" id="newEmail-err">{emailError}</span>}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button type="submit" className="btn btn-pri btn-sm" disabled={busy}>Send a code here</button>
            <button type="button" className="linkish" onClick={() => { setChanging(false); setNewEmail(email); setEmailError(null); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
