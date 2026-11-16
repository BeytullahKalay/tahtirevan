"use client";

import * as THREE from "three";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, useGLTF } from "@react-three/drei";
import type { ChairCtrl, ChairFabric } from "./ctrl";
import { createVelvetMaterial, velvetSheen } from "./velvet";

/* ---------- Kumaş dokuları: tek tek, gerektiğinde yüklenir ve oturum boyunca saklanır ---------- */
const textureCache = new Map<string, Promise<THREE.Texture>>();
const loader = new THREE.TextureLoader();

/** Dokunun bir tekrarı kaç metreye yayılır (genişlik). */
const REPEAT_W = 0.52;

/**
 * Tek bir figürün sırtın ortasına elle yerleştirildiği kumaşlar (döşemecinin "figür ortalama" işi).
 * x, y: figürün (başın) görseldeki yeri, sol üstten oran; w: bir tekrarın genişliği (m), baş sırta sığsın diye.
 * Bu kumaşlar ayna çevrilmeden döşenir: desen kusursuz tekrar eder, aynalamak hayvanı ortadan ikiye
 * bölüp simetrik bir yüz yapıyordu.
 */
type Figure = { x: number; y: number; w: number };
const FIGURES: Record<string, Figure> = {
  panthera: { x: 0.42, y: 0.3, w: 0.42 },
};

/** Kumaşın 3B dokusu: seçilen kumaşın `tex` adresi (oturum boyunca önbellekte). */
function loadFabricTexture(url: string) {
  let p = textureCache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((t) => {
      const img = t.image as { width: number; height: number };
      const H = REPEAT_W * (img.height / img.width);
      t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.repeat.set(1 / REPEAT_W, 1 / H);
      t.offset.set(0, -YB / H + 0.08);
      t.needsUpdate = true;
      return t;
    });
    p.catch(() => textureCache.delete(url));
    textureCache.set(url, p);
  }
  return p;
}

/**
 * Figürlü kumaşta dokunun bu koltuğa özel kopyası: ayna yok, figür sırtın tam ortasında.
 * UV metre cinsinden: u = sırtın ortasından yay uzunluğu (0 = orta), v = yükseklik (alt kenar YB).
 */
function placeFigure(base: THREE.Texture, fig: Figure, backH: number) {
  const t = base.clone();
  const img = t.image as { width: number; height: number };
  const H = fig.w * (img.height / img.width);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / fig.w, 1 / H);
  t.offset.set(fig.x, 1 - fig.y - (YB + backH / 2) / H);
  t.needsUpdate = true;
  return t;
}

/* ---------- Model ---------- */

/**
 * Sitedeki hazır koltuk. Panelden yüklenen modeller de aynı biçimde hazırlanır (`payload/chairModel.ts`):
 * metre ölçeğinde, tabanı y=0'da, önü +z; parçalar malzeme adıyla ayrılmış (Kumas = sırt, Kadife = oturak,
 * gerisi metal). Kumas parçasının UV'si metredir (u: sırtın ortasından yay uzunluğu, v: yükseklik).
 */
export const DEFAULT_MODEL = "/models/koltuk-4.glb";
/** Desenin başladığı yükseklik (m); her modelde sırt kumaşının alt kenarı buraya hizalanır. */
const YB = 0.555;
/** Kadraja sığma sınırı (m): kamera bu boydaki bir koltuğa göre ayarlı. */
const FIT_H = 0.81;
const FIT_W = 0.8;

useGLTF.preload(DEFAULT_MODEL);

type Status = { onReady?: () => void; onLoading?: (loading: boolean) => void };

/** Panelden gelen model açılamazsa (silinmiş, bozuk) hazır koltuğa döner; sayfa bozulmaz. */
class ModelFallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Chair({ fabric, ctrl, model, onReady, onLoading }: { fabric: ChairFabric; ctrl: MutableRefObject<ChairCtrl>; model: string } & Status) {
  const { scene } = useGLTF(model);

  const fabricMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        roughness: 0.82,
        sheen: 0.8,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color("#5a4a3a"),
        side: THREE.DoubleSide,
      }),
    [],
  );
  // Renk aşağıda (useFrame) yumuşakça değişir; malzeme bir kez kurulur
  const velvetMat = useMemo(() => createVelvetMaterial(fabric.velvet), []);
  // Fotoğraftaki gövde: saten mat siyah boya (ayna gibi parlamaz)
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0d0d0f", metalness: 0.3, roughness: 0.42 }), []);
  // Oturağın ve sırtın kenarındaki siyah biye (deri/suni deri şerit)
  const pipeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0b0a0a", metalness: 0, roughness: 0.5 }), []);

  // Modelin kopyası; parçalara sitenin malzemeleri giydirilir (kumaş, kadife, metal)
  const { chair, backH } = useMemo(() => {
    const root = scene.clone(true);
    let backH = 0.25;
    const fabricMeshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const name = (mesh.material as THREE.Material).name;
      if (name === "Kumas") fabricMeshes.push(mesh);
      if (!mesh.geometry.getAttribute("normal")) mesh.geometry.computeVertexNormals();
      mesh.material = name === "Kumas" ? fabricMat : name === "Kadife" ? velvetMat : name === "Biye" ? pipeMat : metalMat;
    });
    // Deseni sırtın alt kenarından başlat (her modelde sırt farklı yükseklikte)
    if (fabricMeshes.length) {
      const fb = new THREE.Box3();
      fabricMeshes.forEach((m) => fb.expandByObject(m));
      backH = fb.max.y - fb.min.y;
      const shift = YB - fb.min.y;
      for (const m of fabricMeshes) {
        const uv = m.geometry.getAttribute("uv") as THREE.BufferAttribute | undefined;
        if (!uv || Math.abs(shift) < 1e-3) continue;
        m.geometry = m.geometry.clone();
        const u2 = m.geometry.getAttribute("uv") as THREE.BufferAttribute;
        for (let i = 0; i < u2.count; i++) u2.setY(i, u2.getY(i) + shift);
      }
    }
    // Kadraja sığdır: tabanı yerde, ortası eksende
    const b = new THREE.Box3().setFromObject(root);
    const size = b.getSize(new THREE.Vector3());
    const s = Math.min(FIT_H / (size.y || 1), FIT_W / (Math.max(size.x, size.z) || 1), 1.25);
    const c = b.getCenter(new THREE.Vector3());
    const group = new THREE.Group();
    root.position.set(-c.x, -b.min.y, -c.z);
    group.add(root);
    group.scale.setScalar(s);
    return { chair: group, backH };
  }, [scene, fabricMat, velvetMat, metalMat, pipeMat]);

  const velvetTarget = useRef(new THREE.Color(fabric.velvet));
  const sheenTarget = useRef(velvetSheen(fabric.velvet));
  const first = useRef(true);

  // Yalnızca seçilen kumaşın dokusu yüklenir; yüklenene kadar önceki kumaş kalır.
  const status = useRef<Status>({});
  status.current = { onReady, onLoading };
  useEffect(() => {
    let alive = true;
    status.current.onLoading?.(true);
    loadFabricTexture(fabric.tex)
      .then((tex) => {
        if (!alive) return;
        const fig = FIGURES[fabric.id];
        // Önceki figür kopyası bu koltuğa özeldi; yenisi gelince GPU'dan bırak
        if (fabricMat.map && fabricMat.map.userData.figure) fabricMat.map.dispose();
        if (fig) {
          tex = placeFigure(tex, fig, backH);
          tex.userData.figure = true;
        }
        fabricMat.map = tex;
        fabricMat.needsUpdate = true;
        const v = new THREE.Color(fabric.velvet);
        velvetTarget.current.copy(v);
        velvetSheen(v, sheenTarget.current);
        if (first.current) {
          velvetMat.color.copy(v);
          velvetMat.sheenColor.copy(sheenTarget.current);
          first.current = false;
          status.current.onReady?.();
        } else {
          ctrl.current.pulse = 1;
          ctrl.current.vel += 2.6;
        }
        status.current.onLoading?.(false);
      })
      .catch(() => {
        if (alive) status.current.onLoading?.(false);
      });
    return () => {
      alive = false;
    };
  }, [fabric.id, fabric.tex, fabric.velvet, fabricMat, velvetMat, ctrl, backH]);

  useFrame((_, dt) => {
    velvetMat.color.lerp(velvetTarget.current, 1 - Math.pow(0.002, dt));
    velvetMat.sheenColor.lerp(sheenTarget.current, 1 - Math.pow(0.002, dt));
  });

  return <primitive object={chair} />;
}

function Rig({ ctrl, children, shadow }: { ctrl: MutableRefObject<ChairCtrl>; children: React.ReactNode; shadow: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 0.42, 0), []);
  const goal = useMemo(() => new THREE.Vector3(), []);
  const camGoal = useMemo(() => new THREE.Vector3(), []);
  const narrow = size.width < size.height;

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const c = ctrl.current;
    if (!c.dragging) {
      c.idle += dt * 0.16;
      c.drag += c.vel * dt;
      c.vel *= Math.pow(0.06, dt);
    }
    c.pulse = Math.max(0, c.pulse - dt * 1.6);
    const g = group.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, c.rot + c.drag + c.idle, 5, dt);
      const s = 1 - 0.05 * Math.sin(c.pulse * Math.PI);
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 12, dt));
    }
    if (bob.current) bob.current.position.y = 0.008 * Math.sin(c.idle * 6);
    const z = c.zoom;
    const far = narrow ? 2.75 : 2.45;
    camGoal.set(0, THREE.MathUtils.lerp(0.66, 0.95, z), THREE.MathUtils.lerp(far, 1.3, z));
    camera.position.lerp(camGoal, 1 - Math.pow(0.004, dt));
    goal.set(0, THREE.MathUtils.lerp(0.4, 0.6, z), THREE.MathUtils.lerp(0, -0.1, z));
    look.lerp(goal, 1 - Math.pow(0.004, dt));
    camera.lookAt(look);
  });

  // Gölge koltukla birlikte döner; bu yüzden bir kez çizilmesi yeter (her karede yeniden hesaplanmaz).
  return (
    <group ref={group}>
      {shadow}
      <group ref={bob}>{children}</group>
    </group>
  );
}

export default function ChairCanvas({
  fabric,
  model,
  ctrl,
  active,
  onReady,
  onLoading,
}: {
  fabric: ChairFabric;
  /** Panelden gelen GLB adresi; yoksa hazır koltuk. */
  model?: string;
  ctrl: MutableRefObject<ChairCtrl>;
  active: boolean;
} & Status) {
  const chair = { fabric, ctrl, onReady, onLoading };
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const maxDpr = coarse ? 1.5 : 1.75;
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ fov: 30, position: [0, 0.66, 2.45], near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      {/* Kare hızı düşerse çözünürlüğü indir, toparlanınca geri al */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} />
      <Suspense fallback={null}>
        {/* Ürün fotoğrafındaki gibi stüdyo ışığı: önde büyük yumuşak bir kutu, üstte tavan ışığı, iki yanda
            beyaz dolgu, arkada kenarları ayıran ince bir çizgi ışık. Renkler nötr; renk kumaştan gelsin. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.6} position={[0, 1.4, 3]} scale={[5, 3, 1]} />
          <Lightformer form="rect" intensity={1.8} position={[0, 4, 0.4]} rotation-x={Math.PI / 2} scale={[4, 3, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[-3, 1.2, 1]} scale={[2.5, 2.5, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[3, 1.2, 1]} scale={[2.5, 2.5, 1]} />
          <Lightformer form="rect" intensity={2.2} color="#fff4e6" position={[0, 1.6, -3]} scale={[6, 0.6, 1]} />
        </Environment>
        <ambientLight intensity={0.22} />
        <directionalLight position={[0.8, 2.6, 2.6]} intensity={1.35} />
        <Rig
          ctrl={ctrl}
          shadow={
            <ContactShadows
              position={[0, 0.001, 0]}
              opacity={0.75}
              scale={2.4}
              blur={2.2}
              far={1.1}
              resolution={coarse ? 256 : 512}
              frames={1}
              color="#000000"
            />
          }
        >
          {model && model !== DEFAULT_MODEL ? (
            <ModelFallback fallback={<Chair {...chair} model={DEFAULT_MODEL} />}>
              <Chair {...chair} model={model} />
            </ModelFallback>
          ) : (
            <Chair {...chair} model={DEFAULT_MODEL} />
          )}
        </Rig>
      </Suspense>
    </Canvas>
  );
}
