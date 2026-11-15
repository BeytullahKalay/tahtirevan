"use client";

import { useEffect } from "react";

/** Oturumdaki ilk girişte bir saniyeyi geçmeyen monogram animasyonu. */
export const introScript = `try{if(!sessionStorage.getItem('tr-intro')){document.documentElement.classList.add('intro-on')}}catch(e){}`;

export function Intro() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-on")) return;
    try {
      sessionStorage.setItem("tr-intro", "1");
    } catch {}
    const t = window.setTimeout(() => root.classList.remove("intro-on"), 980);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="intro" aria-hidden="true">
      <svg width="92" height="92" viewBox="0 0 100 100" className="text-altin">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
        <text
          x="50"
          y="51"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#E9E1D3"
          style={{ fontFamily: "var(--font-serif)", fontSize: 34, letterSpacing: "0.06em" }}
        >
          TR
        </text>
      </svg>
    </div>
  );
}
