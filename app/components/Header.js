"use client";
import { useEffect, useState } from "react";

const LINKS = [
  ["#how", "How it works"],
  ["#services", "What you can offer"],
  ["#stories", "Pet Nannies"],
  ["#business", "For businesses"],
  ["#faq", "FAQs"],
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`hdr${solid ? " solid" : ""}${open ? " open" : ""}`} id="hdr">
      <div className="wrap hdr-in">
        <a href="#top" className="logo">leashh</a>
        <nav className="nav">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
        <a href="/apply" className="btn btn-ghost btn-sm hdr-cta">Start earning</a>
        <button
          className="burger"
          id="burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      <div className="mnav" id="mnav">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a href="/apply" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
          Start earning
        </a>
      </div>
    </header>
  );
}
