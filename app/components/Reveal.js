"use client";
import { useEffect } from "react";

// Scroll reveal for .rv elements, ported from the prototype.
// Falls back to showing everything where IntersectionObserver is missing.
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".rv"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, i) => {
          if (!en.isIntersecting) return;
          setTimeout(() => en.target.classList.add("in"), i * 70);
          io.unobserve(en.target);
        });
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
