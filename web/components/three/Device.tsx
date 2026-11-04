"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "@/lib/stage";
import { clamp01, kf, mulberry32, smooth } from "@/lib/math";
import { stackLayers } from "@/lib/content";
import { overlay, place } from "@/lib/overlay";

/* ------------------------------ peças básicas ----------------------------- */

type V3 = [number, number, number];

function Outline({ geometry, opacity = 0.4 }: { geometry: THREE.BufferGeometry; opacity?: number }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 25), [geometry]);
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color="#ededea" transparent opacity={opacity} />
    </lineSegments>
  );
}

type BlockProps = {
  size: V3;
  position?: V3;
  rotation?: V3;
  color?: string;
  edge?: number;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  materialRef?: React.Ref<THREE.MeshStandardMaterial>;
};

function Block({
  size,
  position,
  rotation,
  color = "#18191d",
  edge = 0.4,
  emissive,
  emissiveIntensity = 1,
  metalness = 0.55,
  roughness = 0.5,
  materialRef,
}: BlockProps) {
  const [x, y, z] = size;
  const geo = useMemo(() => new THREE.BoxGeometry(x, y, z), [x, y, z]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          metalness={metalness}
          roughness={roughness}
          emissive={emissive ?? "#000000"}
          emissiveIntensity={emissive ? emissiveIntensity : 0}
        />
      </mesh>
      {edge > 0 && <Outline geometry={geo} opacity={edge} />}
    </group>
  );
}

function Cylinder({
  r,
  h,
  position,
  rotation,
  color = "#1f2026",
  edge = 0.3,
}: {
  r: number;
  h: number;
  position?: V3;
  rotation?: V3;
  color?: string;
  edge?: number;
}) {
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, h, 20), [r, h]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {edge > 0 && <Outline geometry={geo} opacity={edge} />}
    </group>
  );
}

/* --------------------------------- camadas -------------------------------- */

function Cover() {
  return (
    <group>
      <Block size={[3.2, 0.1, 2.2]} color="#1b1c21" edge={0.55} />
      {Array.from({ length: 9 }, (_, i) => (
        <Block key={i} size={[0.9, 0.012, 0.035]} position={[0.95, 0.056, -0.7 + i * 0.175]} color="#050506" edge={0} />
      ))}
      <Block size={[0.08, 0.02, 0.08]} position={[-1.4, 0.06, -0.9]} color="#6dffb0" emissive="#6dffb0" emissiveIntensity={2} edge={0} />
      <Block size={[1.1, 0.012, 0.012]} position={[-0.85, 0.056, 0.85]} color="#ededea" edge={0} />
    </group>
  );
}

function Processor() {
  const chip = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (chip.current) chip.current.emissiveIntensity = 0.9 + Math.sin(clock.elapsedTime * 2.4) * 0.5;
  });
  return (
    <group>
      <Block size={[0.82, 0.05, 0.82]} position={[0, -0.08, 0]} color="#e07a52" emissive="#e07a52" materialRef={chip} edge={0.6} />
      <Block size={[1.3, 0.06, 1.3]} color="#202127" edge={0.5} />
      {Array.from({ length: 9 }, (_, i) => (
        <Block key={i} size={[0.05, 0.3, 1.2]} position={[-0.56 + i * 0.14, 0.18, 0]} color="#2a2b31" edge={0.3} />
      ))}
    </group>
  );
}

function Board() {
  const traces = useMemo(() => {
    const rand = mulberry32(99);
    const pts: number[] = [];
    for (let k = 0; k < 26; k++) {
      let x = (rand() - 0.5) * 2.6;
      let z = (rand() - 0.5) * 1.7;
      for (let s = 0; s < 3; s++) {
        const horizontal = s % 2 === 0;
        const nx = horizontal ? Math.max(-1.4, Math.min(1.4, x + (rand() - 0.5) * 1.4)) : x;
        const nz = horizontal ? z : Math.max(-0.9, Math.min(0.9, z + (rand() - 0.5) * 1));
        pts.push(x, 0.03, z, nx, 0.03, nz);
        x = nx;
        z = nz;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);
  return (
    <group>
      <Block size={[3, 0.05, 2]} color="#0f1013" edge={0.45} />
      <lineSegments geometry={traces}>
        <lineBasicMaterial color="#ededea" transparent opacity={0.28} />
      </lineSegments>
      {[
        [-1.0, -0.5],
        [-0.4, 0.6],
        [0.9, -0.6],
        [1.1, 0.4],
        [-1.1, 0.5],
        [0.2, -0.7],
      ].map(([x, z], i) => (
        <Block key={i} size={[0.32, 0.06, 0.22]} position={[x, 0.05, z]} color="#202127" edge={0.35} />
      ))}
      <Block size={[1.4, 0.2, 0.06]} position={[0, 0.12, 0.78]} color="#1b1c21" edge={0.4} />
      <Block size={[1.4, 0.2, 0.06]} position={[0, 0.12, 0.88]} color="#1b1c21" edge={0.4} />
      {[-1.3, -1.15, -1.0].map((x, i) => (
        <Cylinder key={i} r={0.05} h={0.14} position={[x, 0.09, -0.85]} color="#2a2b31" edge={0.25} />
      ))}
    </group>
  );
}

function Fan({ explode }: { explode: React.RefObject<number> }) {
  const blades = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.y -= dt * (2 + (explode.current ?? 0) * 7) * (stage.reducedMotion ? 0.2 : 1);
  });
  const ring = useMemo(() => new THREE.TorusGeometry(0.6, 0.03, 8, 48), []);
  return (
    <group>
      <Block size={[1.45, 0.16, 0.08]} position={[0, 0, -0.69]} color="#202127" />
      <Block size={[1.45, 0.16, 0.08]} position={[0, 0, 0.69]} color="#202127" />
      <Block size={[0.08, 0.16, 1.3]} position={[-0.69, 0, 0]} color="#202127" />
      <Block size={[0.08, 0.16, 1.3]} position={[0.69, 0, 0]} color="#202127" />
      <mesh geometry={ring} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#2a2b31" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={blades}>
        <Cylinder r={0.16} h={0.12} color="#2a2b31" edge={0.4} />
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <Block size={[0.46, 0.02, 0.17]} position={[0.36, 0, 0]} rotation={[0.45, 0, 0]} color="#3a3b42" edge={0.35} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Battery() {
  return (
    <group>
      {[-0.57, -0.19, 0.19, 0.57].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <Cylinder r={0.17} h={1.8} rotation={[0, 0, Math.PI / 2]} color="#1f2026" edge={0.22} />
          <Cylinder r={0.175} h={0.08} position={[0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]} color="#cfcfca" edge={0} />
          <Block size={[0.05, 0.02, 0.1]} position={[-0.3 + i * 0.12, 0.18, 0]} color="#6dffb0" emissive="#6dffb0" emissiveIntensity={1.6} edge={0} />
        </group>
      ))}
    </group>
  );
}

function Base({ explode }: { explode: React.RefObject<number> }) {
  const screws = useRef<THREE.Group>(null);
  useFrame(() => {
    const e = explode.current ?? 0;
    screws.current?.children.forEach((s) => {
      s.position.y = 0.2 + smooth(clamp01(e * 1.6)) * 1.1;
      s.rotation.y = e * 12;
    });
  });
  return (
    <group>
      <Block size={[3.3, 0.08, 2.3]} color="#141519" edge={0.55} />
      {[
        [-1.5, -1],
        [1.5, -1],
        [-1.5, 1],
        [1.5, 1],
      ].map(([x, z], i) => (
        <Block key={i} size={[0.2, 0.06, 0.2]} position={[x, -0.07, z]} color="#0b0b0d" edge={0.3} />
      ))}
      <group ref={screws}>
        {[
          [-1.45, -0.95],
          [1.45, -0.95],
          [-1.45, 0.95],
          [1.45, 0.95],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.2, z]}>
            <Cylinder r={0.06} h={0.26} color="#bdbdb8" edge={0} />
            <Cylinder r={0.1} h={0.03} position={[0, 0.14, 0]} color="#d8d8d3" edge={0} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* --------------------------------- montagem ------------------------------- */

const ASSEMBLED_Y = [0.62, 0.36, 0.12, -0.08, -0.3, -0.52];
const EXPLODED_GAP = 0.84;

export function Device() {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const parts = useRef<(THREE.Group | null)[]>([]);
  const labels = useRef<(THREE.Group | null)[]>([]);
  const explode = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = stage.t;
    const narrow = state.size.width < 768;
    const vw = state.viewport.width;
    const r = root.current;
    if (!r) return;

    // entra por baixo na seção Stack e sai por cima ao ir para o Blog
    const y = kf(t, narrow ? [-10, -8, -0.9, 0.15, 8, 10] : [-10, -8, 0, 0.1, 8, 10]);
    r.position.set(narrow ? -0.35 : vw * 0.05, y, 0);
    r.visible = Math.abs(y) < 9.5;
    r.scale.setScalar(narrow ? 0.6 : 0.92);
    r.rotation.x = 0.42;

    const e = kf(t, [0, 0, 0, 1, 0.8, 0]);
    explode.current = e;
    if (spin.current) {
      spin.current.rotation.y = THREE.MathUtils.damp(
        spin.current.rotation.y,
        -0.7 + t * 0.35 + stage.mouseX * 0.35 + state.clock.elapsedTime * (stage.reducedMotion ? 0 : 0.06),
        3,
        dt,
      );
    }

    r.updateMatrixWorld();
    const n = ASSEMBLED_Y.length;
    for (let i = 0; i < n; i++) {
      const local = smooth(clamp01(e * 1.5 - i * 0.1));
      const exploded = ((n - 1) / 2 - i) * EXPLODED_GAP;
      const py = ASSEMBLED_Y[i] + (exploded - ASSEMBLED_Y[i]) * local;
      const part = parts.current[i];
      if (part) {
        part.position.y = py;
        part.rotation.y = local * (i % 2 ? -0.18 : 0.18);
      }
      const lg = labels.current[i];
      const el = overlay.labels[i];
      if (lg && el) {
        lg.position.y = py;
        lg.updateMatrixWorld();
        const o = narrow || !r.visible ? 0 : clamp01((local - 0.55) / 0.35);
        el.style.opacity = String(o);
        if (o > 0) place(el, lg, state.camera, state.size, `translate3d(${((1 - o) * 14).toFixed(1)}px, -50%, 0)`);
      }
    }
  });

  const layers: ReactNode[] = [
    <Cover key="c" />,
    <Processor key="p" />,
    <Board key="b" />,
    <Fan key="f" explode={explode} />,
    <Battery key="bt" />,
    <Base key="bs" explode={explode} />,
  ];

  return (
    <group ref={root}>
      <group ref={spin}>
        {layers.map((layer, i) => (
          <group
            key={i}
            ref={(g) => {
              parts.current[i] = g;
            }}
          >
            {layer}
          </group>
        ))}
      </group>
      {stackLayers.map((layer, i) => (
        <group key={layer.code}>
          <group
            position={[2.15, 0, 0]}
            ref={(g) => {
              labels.current[i] = g;
            }}
          />
        </group>
      ))}
    </group>
  );
}
