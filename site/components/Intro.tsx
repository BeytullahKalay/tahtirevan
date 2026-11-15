"use client";

import { useEffect } from "react";
import { Emblem } from "./Brand";

/** Oturumdaki ilk girişte bir saniyeyi geçmeyen amblem animasyonu. */
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
      <Emblem className="h-auto w-[132px] text-altin" />
    </div>
  );
}
