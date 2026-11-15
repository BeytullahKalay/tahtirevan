"use client";

/**
 * Panelde 3B model önizlemesi (Medya › 3B modeller). Kaydedilen modeli döndürerek gösterir:
 * "Parçalar" görünümünde kumaş/kadife/biye/metal ayrımı renkle, "Kumaşla" görünümünde örnek bir kumaşla.
 */
import { useDocumentInfo } from "@payloadcms/ui";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createVelvetMaterial } from "@/components/three/velvet";

const PART_COLORS: Record<string, string> = { Kumas: "#2fae5a", Kadife: "#d23a3a", Biye: "#e8c547" };
const SAMPLE_FABRICS = ["rossaria", "mayura", "soraya", "simur"];

type Mode = "parts" | "fabric";

export function ModelPreview() {
  const { savedDocumentData } = useDocumentInfo();
  const url = savedDocumentData?.url as string | undefined;
  const version = savedDocumentData?.updatedAt as string | undefined;
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("parts");
  const [fabric, setFabric] = useState(SAMPLE_FABRICS[0]);
  const [error, setError] = useState(false);
  const api = useRef<{ apply: (mode: Mode, fabric: string) => void } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || !url) return;
    setError(false);
    const width = el.clientWidth;
    const height = Math.round(Math.min(420, width * 0.75));
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight("#ffffff", "#3a3530", 2.2));
    const sun = new THREE.DirectionalLight("#ffffff", 1.6);
    sun.position.set(1.5, 3, 2.5);
    scene.add(sun);
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.01, 50);
    const pivot = new THREE.Group();
    scene.add(pivot);

    const metal = new THREE.MeshStandardMaterial({ color: "#2a2a30", metalness: 0.4, roughness: 0.45 });
    const partMats = Object.fromEntries(Object.entries(PART_COLORS).map(([k, c]) => [k, new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })]));
    const fabricMat = new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide });
    const velvetMat = createVelvetMaterial("#6e1820");
    const pipeMat = new THREE.MeshStandardMaterial({ color: "#0b0a0a", roughness: 0.5 });
    const textures = new Map<string, THREE.Texture>();
    const meshes: THREE.Mesh[] = [];
    let current: [Mode, string] = ["parts", SAMPLE_FABRICS[0]];

    const apply = (m: Mode, f: string) => {
      current = [m, f];
      for (const mesh of meshes) {
        const name = mesh.userData.part as string;
        mesh.material = m === "parts" ? (partMats[name] ?? metal) : name === "Kumas" ? fabricMat : name === "Kadife" ? velvetMat : name === "Biye" ? pipeMat : metal;
      }
      if (m === "fabric") {
        let t = textures.get(f);
        if (!t) {
          t = new THREE.TextureLoader().load(`/fabrics/tex/${f}.webp`, (tex) => {
            const img = tex.image as { width: number; height: number };
            const W = 0.52;
            tex.repeat.set(1 / W, 1 / (W * (img.height / img.width)));
            tex.needsUpdate = true;
          });
          t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
          t.colorSpace = THREE.SRGBColorSpace;
          textures.set(f, t);
        }
        fabricMat.map = t;
        fabricMat.needsUpdate = true;
      }
    };
    api.current = { apply };

    let alive = true;
    const src = version ? `${url}?v=${encodeURIComponent(version)}` : url;
    new GLTFLoader().load(
      src,
      (gltf) => {
        if (!alive) return;
        const root = gltf.scene;
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.userData.part = (mesh.material as THREE.Material).name;
          if (!mesh.geometry.getAttribute("normal")) mesh.geometry.computeVertexNormals();
          meshes.push(mesh);
        });
        // Ortala ve kadraja sığdır
        const b = new THREE.Box3().setFromObject(root);
        const c = b.getCenter(new THREE.Vector3());
        const s = b.getSize(new THREE.Vector3());
        root.position.sub(new THREE.Vector3(c.x, b.min.y, c.z));
        pivot.add(root);
        const r = Math.max(s.x, s.y, s.z);
        camera.position.set(0, s.y * 0.75, r * 2.6);
        camera.lookAt(0, s.y * 0.45, 0);
        apply(...current);
      },
      undefined,
      () => alive && setError(true),
    );

    // Sürükleyince döner, bırakınca yavaşça kendi döner
    let drag: number | null = null;
    let spin = 0.35;
    const down = (e: PointerEvent) => {
      drag = e.clientX;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag == null) return;
      pivot.rotation.y += (e.clientX - drag) * 0.01;
      drag = e.clientX;
      spin = 0;
    };
    const up = () => {
      drag = null;
    };
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);

    let last = performance.now();
    renderer.setAnimationLoop((now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (drag == null) spin = Math.min(0.35, spin + dt * 0.1);
      pivot.rotation.y += spin * dt;
      renderer.render(scene, camera);
    });

    return () => {
      alive = false;
      api.current = null;
      renderer.setAnimationLoop(null);
      renderer.dispose();
      textures.forEach((t) => t.dispose());
      el.removeChild(renderer.domElement);
    };
  }, [url, version]);

  useEffect(() => {
    api.current?.apply(mode, fabric);
  }, [mode, fabric]);

  const btn = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid var(--theme-elevation-250)",
    background: active ? "var(--theme-elevation-800)" : "transparent",
    color: active ? "var(--theme-elevation-0)" : "var(--theme-elevation-800)",
    cursor: "pointer",
    fontSize: 13,
  });

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Önizleme</div>
      {!url ? (
        <p style={{ color: "var(--theme-elevation-500)", fontSize: 13 }}>
          .glb dosyasını seçip <strong>Kaydet</strong>&apos;e basın; model parçalara ayrılınca burada döner.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <button type="button" style={btn(mode === "parts")} onClick={() => setMode("parts")}>
              Parçalar
            </button>
            <button type="button" style={btn(mode === "fabric")} onClick={() => setMode("fabric")}>
              Kumaşla
            </button>
            {mode === "fabric" &&
              SAMPLE_FABRICS.map((f) => (
                <button key={f} type="button" style={btn(fabric === f)} onClick={() => setFabric(f)}>
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
          </div>
          <div
            ref={box}
            style={{ width: "100%", maxWidth: 560, borderRadius: 6, overflow: "hidden", background: "var(--theme-elevation-50)" }}
          />
          {error ? (
            <p style={{ color: "var(--theme-error-500)", fontSize: 13 }}>Model açılamadı. Dosyayı yeniden yüklemeyi deneyin.</p>
          ) : (
            mode === "parts" && (
              <p style={{ color: "var(--theme-elevation-600)", fontSize: 13, marginTop: 8 }}>
                <span style={{ color: PART_COLORS.Kumas }}>■</span> Kumaş (sırt) &nbsp; <span style={{ color: PART_COLORS.Kadife }}>■</span> Kadife (oturak) &nbsp; <span style={{ color: PART_COLORS.Biye }}>■</span> Biye (kenar şeridi)
                &nbsp; <span style={{ color: "#555" }}>■</span> Metal (gövde). Sürükleyerek çevirin.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
