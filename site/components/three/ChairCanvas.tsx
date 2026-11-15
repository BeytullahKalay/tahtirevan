"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import type { ChairCtrl, ChairFabric } from "./ctrl";

/* ---------- Kumaş dokuları: tek tek, gerektiğinde yüklenir ve oturum boyunca saklanır ---------- */
const textureCache = new Map<string, Promise<THREE.Texture>>();
const loader = new THREE.TextureLoader();

/** Kumaşın 3B dokusu: seçilen kumaşın `tex` adresi (oturum boyunca önbellekte). */
function loadFabricTexture(url: string) {
  let p = textureCache.get(url);
  if (!p) {
    p = loader.loadAsync(url).then((t) => {
      const img = t.image as { width: number; height: number };
      const W = 0.52; // dokunun bir tekrarı kaç metreye yayılır
      const H = W * (img.height / img.width);
      t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.repeat.set(1 / W, 1 / H);
      t.offset.set(0, -YB / H + 0.08);
      t.needsUpdate = true;
      return t;
    });
    p.catch(() => textureCache.delete(url));
    textureCache.set(url, p);
  }
  return p;
}

/* ---------- Ölçüler (metre) ---------- */
const SX = 0.33; // yan çerçevelerin x konumu
const TUBE = 0.0125;
const APEX_Y = 0.7;
const FRONT_Z = 0.31;
const BACK_Z = -0.36;
const APEX_Z = -0.02;
const RAIL_Y = 0.36;

// Sırt kabuğu
const RX = 0.3;
const RZ = 0.28;
const Z0 = -0.02;
const T = 0.05;
const PHI0 = -0.12;
const PHI1 = Math.PI + 0.12;
const YB = 0.555;
const yt = (phi: number) => 0.735 + 0.075 * Math.pow(Math.max(0, Math.sin(phi)), 1.4);
const ring = (phi: number, r = 0) => new THREE.Vector3((RX + r) * Math.cos(phi), 0, Z0 - (RZ + r) * Math.sin(phi));

/** Tüp UV'lerini dünya ölçüsüne çevirir; kumaş tüm yüzeylerde aynı ölçekte görünür. */
function worldTube(curve: THREE.Curve<THREE.Vector3>, tubular: number, radius: number, radial = 16, center = 0.5) {
  const g = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
  const L = curve.getLength();
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - center) * L, uv.getY(i) * Math.PI * 2 * radius);
  return g;
}

function useShell() {
  return useMemo(() => {
    const N = 140;
    const M = 12;
    const phis = Array.from({ length: N + 1 }, (_, i) => PHI0 + ((PHI1 - PHI0) * i) / N);
    const s = [0];
    for (let i = 1; i <= N; i++) s[i] = s[i - 1] + ring(phis[i]).distanceTo(ring(phis[i - 1]));
    const mid = s[N] / 2;

    const surface = (r: number) => {
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      phis.forEach((phi, i) => {
        const p = ring(phi, r);
        for (let j = 0; j <= M; j++) {
          const y = YB + ((yt(phi) - YB) * j) / M;
          pos.push(p.x, y, p.z);
          uv.push(s[i] - mid, y);
        }
      });
      for (let i = 0; i < N; i++)
        for (let j = 0; j < M; j++) {
          const a = i * (M + 1) + j;
          const b = (i + 1) * (M + 1) + j;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };

    const edge = (r: number, top: boolean) =>
      new THREE.CatmullRomCurve3(
        phis.filter((_, i) => i % 2 === 0).map((phi) => {
          const p = ring(phi, r);
          p.y = top ? yt(phi) : YB;
          return p;
        }),
      );

    const endLine = (phi: number) => {
      const a = ring(phi);
      const b = ring(phi);
      a.y = YB;
      b.y = yt(phi);
      return new THREE.LineCurve3(a, b);
    };

    const corners = [PHI0, PHI1].flatMap((phi) => {
      const a = ring(phi);
      const b = ring(phi);
      a.y = YB;
      b.y = yt(phi);
      return [a, b];
    });

    return {
      outer: surface(T / 2),
      inner: surface(-T / 2),
      top: worldTube(edge(0, true), 160, T / 2),
      bottom: worldTube(edge(0, false), 160, T / 2),
      ends: [worldTube(endLine(PHI0), 8, T / 2), worldTube(endLine(PHI1), 8, T / 2)],
      corners,
      piping: [
        new THREE.TubeGeometry(edge(T / 2 - 0.002, true), 200, 0.0045, 8),
        new THREE.TubeGeometry(edge(-T / 2 + 0.002, true), 200, 0.0045, 8),
        new THREE.TubeGeometry(edge(T / 2 - 0.002, false), 200, 0.0045, 8),
        new THREE.TubeGeometry(edge(-T / 2 + 0.002, false), 200, 0.0045, 8),
      ],
    };
  }, []);
}

function useFrameGeometry() {
  return useMemo(() => {
    const side = (x: number) => {
      const F = new THREE.Vector3(x, 0, FRONT_Z);
      const A = new THREE.Vector3(x, APEX_Y, APEX_Z);
      const B = new THREE.Vector3(x, 0, BACK_Z);
      const p1 = A.clone().sub(A.clone().sub(F).normalize().multiplyScalar(0.08));
      const p2 = A.clone().sub(A.clone().sub(B).normalize().multiplyScalar(0.08));
      const path = new THREE.CurvePath<THREE.Vector3>();
      path.add(new THREE.LineCurve3(F, p1));
      path.add(new THREE.QuadraticBezierCurve3(p1, A, p2));
      path.add(new THREE.LineCurve3(p2, B));
      return new THREE.TubeGeometry(path, 220, TUBE, 16, false);
    };
    const zF = FRONT_Z + ((APEX_Z - FRONT_Z) * RAIL_Y) / APEX_Y;
    const zB = BACK_Z + ((APEX_Z - BACK_Z) * RAIL_Y) / APEX_Y;
    const rod = (a: THREE.Vector3, b: THREE.Vector3, r = TUBE * 0.85) => new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, r, 14, false);
    const rails = [
      rod(new THREE.Vector3(-SX, RAIL_Y, zF), new THREE.Vector3(-SX, RAIL_Y, zB)),
      rod(new THREE.Vector3(SX, RAIL_Y, zF), new THREE.Vector3(SX, RAIL_Y, zB)),
      rod(new THREE.Vector3(-SX, RAIL_Y, zF - 0.035), new THREE.Vector3(SX, RAIL_Y, zF - 0.035)),
      rod(new THREE.Vector3(-SX, RAIL_Y, zB + 0.035), new THREE.Vector3(SX, RAIL_Y, zB + 0.035)),
    ];
    const feet = [-SX, SX].flatMap((x) => [new THREE.Vector3(x, 0.004, FRONT_Z), new THREE.Vector3(x, 0.004, BACK_Z)]);
    const joints = [-SX, SX].flatMap((x) => [new THREE.Vector3(x, RAIL_Y, zF), new THREE.Vector3(x, RAIL_Y, zB)]);
    return { sides: [side(-SX), side(SX)], rails, feet, joints };
  }, []);
}

function seatPiping(halfW: number, halfD: number, r: number, y: number) {
  const s = new THREE.Shape();
  s.moveTo(-halfW + r, -halfD);
  s.lineTo(halfW - r, -halfD);
  s.quadraticCurveTo(halfW, -halfD, halfW, -halfD + r);
  s.lineTo(halfW, halfD - r);
  s.quadraticCurveTo(halfW, halfD, halfW - r, halfD);
  s.lineTo(-halfW + r, halfD);
  s.quadraticCurveTo(-halfW, halfD, -halfW, halfD - r);
  s.lineTo(-halfW, -halfD + r);
  s.quadraticCurveTo(-halfW, -halfD, -halfW + r, -halfD);
  const pts = s.getSpacedPoints(160).map((p) => new THREE.Vector3(p.x, y, p.y));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 220, 0.0045, 8, true);
}

/* ---------- Model ---------- */

const SEAT = { w: 0.6, h: 0.12, d: 0.47, y: RAIL_Y + TUBE + 0.06, z: -0.005 };

type Status = { onReady?: () => void; onLoading?: (loading: boolean) => void };

function Chair({ fabric, ctrl, onReady, onLoading }: { fabric: ChairFabric; ctrl: MutableRefObject<ChairCtrl> } & Status) {
  const shell = useShell();
  const frame = useFrameGeometry();
  const piping = useMemo(() => seatPiping(SEAT.w / 2 + 0.001, SEAT.d / 2 + 0.001, 0.045, SEAT.y + SEAT.h / 2 - 0.03), []);

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
  const velvetMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: fabric.velvet,
        roughness: 0.92,
        sheen: 0.7,
        sheenRoughness: 0.32,
        sheenColor: new THREE.Color("#a04a52"),
      }),
    [],
  );
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0c0c0e", metalness: 0.55, roughness: 0.34 }), []);
  const pipeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0e0d0c", roughness: 0.55 }), []);

  const velvetTarget = useRef(new THREE.Color(fabric.velvet));
  const sheenTarget = useRef(new THREE.Color("#a04a52"));
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
        fabricMat.map = tex;
        fabricMat.needsUpdate = true;
        const v = new THREE.Color(fabric.velvet);
        velvetTarget.current.copy(v);
        sheenTarget.current.copy(v).lerp(new THREE.Color("#ffffff"), 0.22);
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
  }, [fabric.tex, fabric.velvet, fabricMat, velvetMat, ctrl]);

  useFrame((_, dt) => {
    velvetMat.color.lerp(velvetTarget.current, 1 - Math.pow(0.002, dt));
    velvetMat.sheenColor.lerp(sheenTarget.current, 1 - Math.pow(0.002, dt));
  });

  return (
    <group>
      {/* Çerçeve */}
      {frame.sides.map((g, i) => (
        <mesh key={`s${i}`} geometry={g} material={metalMat} />
      ))}
      {frame.rails.map((g, i) => (
        <mesh key={`r${i}`} geometry={g} material={metalMat} />
      ))}
      {[...frame.feet, ...frame.joints].map((p, i) => (
        <mesh key={`f${i}`} position={p} material={metalMat}>
          <sphereGeometry args={[i < 4 ? TUBE * 1.05 : TUBE * 0.95, 16, 12]} />
        </mesh>
      ))}

      {/* Oturak */}
      <RoundedBox args={[SEAT.w, SEAT.h, SEAT.d]} radius={0.045} smoothness={6} position={[0, SEAT.y, SEAT.z]} material={velvetMat} />
      <mesh geometry={piping} position={[0, 0, SEAT.z]} material={pipeMat} />

      {/* Sırt */}
      <mesh geometry={shell.outer} material={fabricMat} />
      <mesh geometry={shell.inner} material={fabricMat} />
      <mesh geometry={shell.top} material={fabricMat} />
      <mesh geometry={shell.bottom} material={fabricMat} />
      {shell.ends.map((g, i) => (
        <mesh key={`e${i}`} geometry={g} material={fabricMat} />
      ))}
      {shell.corners.map((p, i) => (
        <mesh key={`c${i}`} position={p} material={fabricMat}>
          <sphereGeometry args={[T / 2, 20, 14]} />
        </mesh>
      ))}
      {shell.piping.map((g, i) => (
        <mesh key={`p${i}`} geometry={g} material={pipeMat} />
      ))}
    </group>
  );
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
  ctrl,
  active,
  onReady,
  onLoading,
}: {
  fabric: ChairFabric;
  ctrl: MutableRefObject<ChairCtrl>;
  active: boolean;
} & Status) {
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
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[0.4, 3, 2.2]} scale={[4, 2.2, 1]} />
          <Lightformer form="rect" intensity={1.1} color="#ffe2bd" position={[-3, 1.2, 1.4]} scale={[3, 2, 1]} />
          <Lightformer form="rect" intensity={1.8} position={[2.6, 1.6, -2.4]} scale={[3, 2, 1]} />
          <Lightformer form="ring" intensity={1.2} color="#b08d57" position={[-1.5, 2, -3]} scale={2.2} />
        </Environment>
        <ambientLight intensity={0.12} />
        <directionalLight position={[1.4, 3, 2.2]} intensity={1.1} />
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
          <Chair fabric={fabric} ctrl={ctrl} onReady={onReady} onLoading={onLoading} />
        </Rig>
      </Suspense>
    </Canvas>
  );
}
