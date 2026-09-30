"use client";
import { useEffect, useRef } from "react";

// Cloudflare Turnstile, rendered explicitly so React owns the container.
// Renders nothing when no site key is configured, which keeps local
// development and the test suite working without a challenge.
export default function Turnstile({ onToken }) {
  const box = useRef(null);
  const widget = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !box.current) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || widget.current !== null || !window.turnstile) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const id = "cf-turnstile-script";
      let s = document.getElementById(id);
      if (!s) {
        s = document.createElement("script");
        s.id = id;
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }

    return () => {
      cancelled = true;
      if (widget.current !== null && window.turnstile) {
        try { window.turnstile.remove(widget.current); } catch {}
        widget.current = null;
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={box} style={{ marginTop: "16px" }} />;
}
