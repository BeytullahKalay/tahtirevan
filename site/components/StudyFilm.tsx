"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/catalog";

/**
 * Etüt görseli + sessiz döngü videosu.
 * Video yalnızca ekrandayken oynar (telefonda pil ve takılma için), ekrandan çıkınca durur.
 * Hareketi azalt ayarı açıksa video hiç yüklenmez, yalnızca görsel kalır.
 * Kenarlardaki karartma, açık stüdyo zeminli kareleri koyu sayfaya bağlar.
 */
export function StudyFilm({
  image,
  video,
  alt,
  sizes,
  priority,
  className = "",
}: {
  image: Img;
  video?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAllowed(!reduce.matches);
    const onChange = () => setAllowed(!reduce.matches);
    reduce.addEventListener("change", onChange);
    return () => reduce.removeEventListener("change", onChange);
  }, [video]);

  useEffect(() => {
    const el = box.current;
    const v = vid.current;
    if (!allowed || !el || !v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, [allowed]);

  return (
    <div ref={box} className={`media ${className}`}>
      <div className="media-inner">
        <Image src={image.src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        {video && allowed && (
          <video
            ref={vid}
            src={video}
            poster={image.src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playing ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      {/* Kenar karartması: görselden 2 px taşar (alt kenarda açık çizgi kalmasın) */}
      <div
        className="pointer-events-none absolute inset-[-2px]"
        style={{ boxShadow: "inset 0 0 90px 24px rgba(20,17,15,0.55)" }}
        aria-hidden="true"
      />
    </div>
  );
}

