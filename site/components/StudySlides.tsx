"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Img } from "@/lib/catalog";
import type { Lang } from "@/lib/i18n";

/**
 * Etüdün görsel dizisi (etüt kartları ve kumaş sayfasındaki etüt).
 * - Kendiliğinden: kareler sırayla, yumuşak geçişle değişir; alttaki çizgiler kaç kare olduğunu ve sıradakine
 *   ne kadar kaldığını gösterir. Yalnızca ekrandayken ve sekme açıkken döner; hareketi azalt açıksa dönmez.
 * - Fareyle: görselin üzerinde sağa-sola gezdikçe o konumdaki kareye geçilir (tıklamak gerekmez); fare çıkınca
 *   döngü kaldığı yerden sürer.
 * - Dokunarak: sağa/sola kaydırınca önceki/sonraki kare. Kaydırma bağlantıyı açmaz.
 * - `video` verilirse ilk kare sessiz döngü videosudur; yalnızca o kare görünürken ve ekrandayken oynar.
 * `offset`: yan yana kartlar aynı anda değişmesin diye ilk geçişe eklenen gecikme (ms).
 */
export function StudySlides({
  images,
  video,
  lang,
  alt,
  sizes,
  priority,
  offset = 0,
  interval = 3800,
  videoInterval = 9000,
  className = "",
}: {
  images: Img[];
  video?: string;
  lang: Lang;
  alt: string;
  sizes: string;
  priority?: boolean;
  offset?: number;
  interval?: number;
  videoInterval?: number;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [first, setFirst] = useState(true);
  const [playing, setPlaying] = useState(false);
  const n = images.length;
  const many = n > 1;
  const active = many && inView && motionOk && tabVisible && !scrubbing;
  const hasVideo = !!video && motionOk;
  const wait = (index === 0 && hasVideo ? videoInterval : interval) + (first ? offset : 0);

  // Ekranda mı, sekme açık mı, hareket serbest mi?
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setMotionOk(!reduce.matches);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onMotion();
    onVis();
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    reduce.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      reduce.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Kendiliğinden ilerleme
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => {
      setFirst(false);
      setIndex((i) => (i + 1) % n);
    }, wait);
    return () => window.clearTimeout(t);
  }, [active, index, wait, n]);

  // Video yalnızca ilk kare görünürken oynar
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (index === 0 && inView && tabVisible) v.play().catch(() => {});
    else v.pause();
  }, [index, inView, tabVisible, hasVideo]);

  const go = (i: number) => {
    setFirst(false);
    setIndex(((i % n) + n) % n);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!many || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n)));
    if (!scrubbing) setScrubbing(true);
    if (i !== index) go(i);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    if (many && e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiped.current = true;
      go(index + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <div
      ref={box}
      className={`media ${className}`}
      style={many ? { touchAction: "pan-y" } : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setScrubbing(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onClickCapture={(e) => {
        // Kaydırma hareketi kartın bağlantısını açmasın
        if (swiped.current) {
          e.preventDefault();
          e.stopPropagation();
          swiped.current = false;
        }
      }}
    >
      <div className="media-inner">
        {images.map((img, i) => (
          <div
            key={img.src}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity ease-out motion-reduce:transition-none ${scrubbing ? "duration-300" : "duration-[1200ms]"} ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={img.src}
              alt={i === 0 ? alt : `${img.alt?.[lang] ?? ""} · ${alt}`}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              className="object-cover"
            />
            {i === 0 && hasVideo && (
              <video
                ref={vid}
                src={video}
                poster={img.src}
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
        ))}
      </div>
      {/* Kenar karartması: görselden 2 px taşar (alt kenarda açık çizgi kalmasın) */}
      <div
        className="pointer-events-none absolute inset-[-2px]"
        style={{ boxShadow: "inset 0 0 90px 24px rgba(20,17,15,0.55)" }}
        aria-hidden="true"
      />
      {many && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex gap-1.5" aria-hidden="true">
          {images.map((img, i) => (
            <span key={img.src} className="relative h-[2px] flex-1 overflow-hidden bg-fildisi/25">
              {i < index && <span className="absolute inset-0 bg-fildisi/80" />}
              {i === index && (
                <span
                  key={`${index}-${active}`}
                  className="absolute inset-0 origin-left bg-fildisi/80"
                  style={active ? { animation: `slide-progress ${wait}ms linear forwards` } : undefined}
                />
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
