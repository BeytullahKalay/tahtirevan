"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { CHAIR } from "@/lib/media";
import { newCtrl, type ChairCtrl } from "./three/ctrl";

const ChairCanvas = dynamic(() => import("./three/ChairCanvas"), { ssr: false });

/**
 * WebGL desteği oturumda bir kez denetlenir ve deneme bağlamı hemen bırakılır.
 * (Bırakılmayan bağlamlar birikince tarayıcı en eskisini, yani çalışan sahneyi kapatıyordu.)
 */
let webglSupport: boolean | null = null;
function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    webglSupport = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

type Props = {
  fabricId: string;
  /** Dışarıdan sürülecekse (kaydırma) aynı ref verilir. */
  ctrl?: MutableRefObject<ChairCtrl>;
  className?: string;
  label: string;
  loadingLabel?: string;
};

/**
 * 3B koltuk: sürükleyerek çevrilir, kumaşı dışarıdan değişir.
 * Görünür değilken çizim durur; WebGL yoksa ürün fotoğrafı kalır.
 */
export function ChairStudio({ fabricId, ctrl: outer, className = "", label, loadingLabel = "…" }: Props) {
  const own = useRef<ChairCtrl>(newCtrl());
  const ctrl = outer ?? own;
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setWebgl(hasWebGL());
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onLoading = useCallback((v: boolean) => setLoading(v), []);

  // Sürükleyerek çevirme (dikey kaydırma tarayıcıda kalır)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let lastX = 0;
    let lastT = 0;
    let id: number | null = null;
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      lastX = e.clientX;
      lastT = performance.now();
      ctrl.current.dragging = true;
      ctrl.current.vel = 0;
    };
    const move = (e: PointerEvent) => {
      if (id !== e.pointerId) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const delta = dx * 0.009;
      ctrl.current.drag += delta;
      ctrl.current.vel = (delta / Math.max(1, now - lastT)) * 1000 * 0.6;
      lastX = e.clientX;
      lastT = now;
    };
    const up = (e: PointerEvent) => {
      if (id !== e.pointerId) return;
      id = null;
      ctrl.current.dragging = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [ctrl]);

  const show3d = webgl && ready;

  return (
    <div
      ref={box}
      className={`${/\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative"} cursor-grab select-none active:cursor-grabbing ${className}`}
      role="img"
      aria-label={label}
      aria-busy={loading || (webgl && !ready)}
      style={{ touchAction: "pan-y" }}
    >
      <div className={`pointer-events-none absolute inset-[10%] transition-opacity duration-700 ${show3d ? "opacity-0" : "opacity-100"}`} aria-hidden="true">
        <Image src={CHAIR.src} alt="" fill sizes="(min-width: 1024px) 40vw, 80vw" className="object-contain" />
      </div>
      {webgl && mounted && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <ChairCanvas fabricId={fabricId} ctrl={ctrl} active={active} onReady={onReady} onLoading={onLoading} />
        </div>
      )}
      {/* Yükleniyor: ilk açılışta ve kumaş değişirken */}
      <div
        className={`pointer-events-none absolute left-1/2 top-[8%] flex -translate-x-1/2 items-center gap-2 transition-opacity duration-500 ${
          webgl && (loading || !ready) ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <span className="block h-3 w-3 animate-spin rounded-full border border-altin/30 border-t-altin" />
        <span className="label !text-[10px]">{loadingLabel}</span>
      </div>
    </div>
  );
}
