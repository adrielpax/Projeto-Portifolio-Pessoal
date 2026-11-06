"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { line } from "@/lib/lineStore";

/* ------------------------------ geometria da linha ------------------------------ */

const BELT_Y = 0.62; // topo da esteira
const BELT_W = 1.2;
const X0 = -6.6;
const X1 = 6.6;
const ST = { feeder: -5.9, robot: -2.2, inspect: 1.4, pusher: 3.3, end: 6.6 };
const SPEED = 1.35; // m/s
const SPAWN = 1.6; // s entre peças
const PARTS = 14;
const SLATS = 54;
const REJECT_RATE = 0.12;

const C = {
  frame: "#4a505b",
  dark: "#262a31",
  belt: "#23272e",
  raw: "#8d96a1",
  ok: "#f1f3f5",
  nok: "#ff4d4d",
  run: "#3ddc84",
  laser: "#4fd1ff",
  robot: "#d9dde3",
};

type Part = { on: boolean; x: number; y: number; z: number; vy: number; vz: number; state: "raw" | "ok" | "nok"; pushed: boolean; checked: boolean };

/* ------------------------------ peças pequenas ------------------------------ */

function Box({ size, position, color = C.frame, metal = 0.6, rough = 0.45, emissive, emissiveIntensity = 1.5, shadow = true }: {
  size: [number, number, number];
  position: [number, number, number];
  color?: string;
  metal?: number;
  rough?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shadow?: boolean;
}) {
  return (
    <mesh position={position} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metal} roughness={rough} emissive={emissive ?? "#000"} emissiveIntensity={emissive ? emissiveIntensity : 0} />
    </mesh>
  );
}

/* ------------------------------ robô de montagem ------------------------------ */

function Robot() {
  const turret = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    // ciclo: gira até a esteira, desce, "monta", sobe e volta
    const p = (clock.elapsedTime % line.robotCycle) / line.robotCycle;
    const reach = Math.sin(p * Math.PI * 2) * 0.5 + 0.5;
    if (turret.current) turret.current.rotation.y = -0.35 - reach * 1.2;
    if (shoulder.current) shoulder.current.rotation.z = 0.75 - reach * 0.55;
    if (elbow.current) elbow.current.rotation.z = -1.35 + reach * 0.35;
  });
  return (
    <group position={[ST.robot, 0, -1.5]} scale={1.3}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.36, 28]} />
        <meshStandardMaterial color={C.frame} metalness={0.7} roughness={0.35} />
      </mesh>
      <group ref={turret} position={[0, 0.36, 0]}>
        <mesh castShadow position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.32, 0.36, 0.32, 24]} />
          <meshStandardMaterial color={C.robot} metalness={0.3} roughness={0.35} />
        </mesh>
        <group ref={shoulder} position={[0, 0.36, 0]}>
          <mesh castShadow position={[0.62, 0, 0]}>
            <boxGeometry args={[1.25, 0.22, 0.24]} />
            <meshStandardMaterial color={C.robot} metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.2, 20, 16]} />
            <meshStandardMaterial color="#ff8a3d" metalness={0.4} roughness={0.4} />
          </mesh>
          <group ref={elbow} position={[1.24, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.16, 20, 16]} />
              <meshStandardMaterial color="#ff8a3d" metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh castShadow position={[0.5, 0, 0]}>
              <boxGeometry args={[1.0, 0.17, 0.19]} />
              <meshStandardMaterial color={C.robot} metalness={0.3} roughness={0.35} />
            </mesh>
            {/* garra */}
            <mesh castShadow position={[1.02, -0.06, 0]}>
              <boxGeometry args={[0.12, 0.3, 0.3]} />
              <meshStandardMaterial color={C.frame} metalness={0.7} roughness={0.35} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------ cena completa ------------------------------ */

function Line({ shadows }: { shadows: boolean }) {
  const parts = useRef<Part[]>(
    Array.from({ length: PARTS }, () => ({ on: false, x: 0, y: 0, z: 0, vy: 0, vz: 0, state: "raw" as const, pushed: false, checked: false })),
  );
  const partMesh = useRef<THREE.InstancedMesh>(null);
  const slatMesh = useRef<THREE.InstancedMesh>(null);
  const beam = useRef<THREE.MeshStandardMaterial>(null);
  const rod = useRef<THREE.Mesh>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const feederLed = useRef<THREE.MeshStandardMaterial>(null);
  const spawnT = useRef(0);
  const flash = useRef(0);
  const flashColor = useRef(new THREE.Color(C.laser));
  const push = useRef(0);

  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const laser = useMemo(() => new THREE.Color(C.laser), []);

  // LEDs do CLP em duas fileiras de 4 (posição fixa, só a cor anima)
  useLayoutEffect(() => {
    const m = leds.current;
    if (!m) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < 8; i++) {
      d.position.set(-0.45 + (i % 4) * 0.3, i < 4 ? 0.12 : -0.12, 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    line.elapsed += dt;
    const t = state.clock.elapsedTime;

    // taliscas da esteira correndo
    const sm = slatMesh.current;
    if (sm) {
      const span = X1 - X0;
      for (let i = 0; i < SLATS; i++) {
        const x = X0 + ((((i / SLATS) * span + t * SPEED) % span) + span) % span;
        tmp.position.set(x, BELT_Y + 0.004, 0);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(1, 1, 1);
        tmp.updateMatrix();
        sm.setMatrixAt(i, tmp.matrix);
      }
      sm.instanceMatrix.needsUpdate = true;
    }

    // alimentador solta uma peça a cada SPAWN segundos
    spawnT.current += dt;
    if (spawnT.current >= SPAWN) {
      spawnT.current = 0;
      const free = parts.current.find((p) => !p.on);
      if (free) Object.assign(free, { on: true, x: ST.feeder + 0.4, y: BELT_Y + 0.21, z: 0, vy: 0, vz: 0, state: "raw", pushed: false, checked: false });
    }

    let onBelt = 0;
    const pm = partMesh.current;
    parts.current.forEach((p, i) => {
      if (p.on) {
        if (p.pushed) {
          // expulsa para a caçamba de refugo, com queda
          p.z += p.vz * dt;
          if (Math.abs(p.z) > BELT_W / 2) {
            p.vy -= 9.8 * dt;
            p.y += p.vy * dt;
          }
          if (p.y < 0.35) {
            p.on = false;
            line.rejected++;
          }
        } else {
          p.x += SPEED * dt;
          onBelt++;
          // montagem no robô: a peça "muda" de bruta para montada
          if (p.state === "raw" && p.x > ST.robot + 0.2) p.state = "ok";
          // inspeção: feixe acende verde (OK) ou vermelho (NOK)
          if (!p.checked && p.x > ST.inspect) {
            p.checked = true;
            const nok = Math.random() < REJECT_RATE;
            if (nok) p.state = "nok";
            line.lastInspection = nok ? "NOK" : "OK";
            flash.current = 1;
            flashColor.current.set(nok ? C.nok : C.run);
          }
          // expulsor empurra as reprovadas
          if (p.state === "nok" && p.x > ST.pusher) {
            p.pushed = true;
            p.x = ST.pusher;
            p.vz = 3.2;
            push.current = 1;
          }
          // fim da linha: vai para a caçamba de produção
          if (p.x > X1 - 0.3) {
            p.on = false;
            line.produced++;
          }
        }
      }
      if (pm) {
        tmp.position.set(p.x, p.on ? p.y : -50, p.z);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.setScalar(p.on ? 1 : 0.001);
        tmp.updateMatrix();
        pm.setMatrixAt(i, tmp.matrix);
        pm.setColorAt(i, col.set(p.state === "raw" ? C.raw : p.state === "ok" ? C.ok : C.nok));
      }
    });
    line.onBelt = onBelt;
    if (pm) {
      pm.instanceMatrix.needsUpdate = true;
      if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    }

    // feixe de inspeção pisca com o resultado
    flash.current = Math.max(0, flash.current - dt * 2.5);
    if (beam.current) {
      beam.current.emissive.copy(laser).lerp(flashColor.current, flash.current);
      beam.current.emissiveIntensity = 1.6 + flash.current * 3;
      beam.current.opacity = 0.35 + flash.current * 0.5;
    }
    // haste do expulsor
    push.current = Math.max(0, push.current - dt * 2.2);
    if (rod.current) rod.current.position.z = -0.95 + Math.sin(push.current * Math.PI) * 0.75;

    // LEDs do CLP piscando em padrões diferentes
    const lm = leds.current;
    if (lm) {
      for (let i = 0; i < 8; i++) {
        const on = Math.sin(t * (2 + i * 0.7) + i) > 0.1;
        lm.setColorAt(i, col.set(i === 7 ? (on ? C.nok : "#3a1515") : on ? C.run : "#123a24"));
      }
      if (lm.instanceColor) lm.instanceColor.needsUpdate = true;
    }
    if (feederLed.current) feederLed.current.emissiveIntensity = spawnT.current < 0.25 ? 3 : 0.6;
  });

  return (
    <group>
      {/* piso técnico */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#111317" roughness={0.9} />
      </mesh>
      <gridHelper args={[24, 48, "#22262d", "#121418"]} position={[0, 0.002, 0]} />

      {/* estrutura e esteira */}
      <Box size={[X1 - X0 + 0.4, 0.36, BELT_W + 0.24]} position={[0, 0.4, 0]} color={C.frame} />
      <Box size={[X1 - X0, 0.04, BELT_W]} position={[0, BELT_Y - 0.02, 0]} color={C.belt} metal={0.2} rough={0.8} />
      {[-6, -3, 0, 3, 6].flatMap((x) => [-1, 1].map((s) => <Box key={`${x}${s}`} size={[0.12, 0.25, 0.12]} position={[x, 0.11, s * (BELT_W / 2 + 0.04)]} color={C.dark} />))}
      <instancedMesh ref={slatMesh} args={[undefined, undefined, SLATS]} frustumCulled={false}>
        <boxGeometry args={[0.05, 0.01, BELT_W * 0.94]} />
        <meshStandardMaterial color="#3a3f48" metalness={0.5} roughness={0.5} />
      </instancedMesh>

      {/* peças */}
      <instancedMesh ref={partMesh} args={[undefined, undefined, PARTS]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshStandardMaterial metalness={0.25} roughness={0.4} />
      </instancedMesh>

      {/* alimentador */}
      <group position={[ST.feeder, 0, 0]}>
        <Box size={[1.0, 1.0, 1.5]} position={[0, 1.55, 0]} color={C.frame} />
        <Box size={[0.6, 0.35, 0.9]} position={[0.1, 0.95, 0]} color={C.dark} />
        <mesh position={[0.52, 1.9, 0.55]}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshStandardMaterial ref={feederLed} color={C.run} emissive={C.run} emissiveIntensity={0.6} />
        </mesh>
      </group>

      <Robot />

      {/* pórtico de inspeção com feixe */}
      <group position={[ST.inspect, 0, 0]}>
        <Box size={[0.18, 1.7, 0.18]} position={[0, 0.85, -BELT_W / 2 - 0.25]} />
        <Box size={[0.18, 1.7, 0.18]} position={[0, 0.85, BELT_W / 2 + 0.25]} />
        <Box size={[0.3, 0.26, BELT_W + 0.7]} position={[0, 1.75, 0]} color={C.dark} />
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.03, 1.0, BELT_W]} />
          <meshStandardMaterial ref={beam} color="#000" emissive={C.laser} emissiveIntensity={1.6} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>

      {/* expulsor de refugo + caçamba */}
      <group position={[ST.pusher, 0, 0]}>
        <Box size={[0.5, 0.5, 0.6]} position={[0, BELT_Y + 0.25, -1.35]} color={C.frame} />
        <mesh ref={rod} position={[0, BELT_Y + 0.21, -0.95]} castShadow>
          <boxGeometry args={[0.36, 0.3, 0.12]} />
          <meshStandardMaterial color={C.robot} metalness={0.4} roughness={0.35} />
        </mesh>
        <Box size={[1.1, 0.5, 1.0]} position={[0, 0.25, 1.45]} color="#2a1517" />
        <Box size={[1.12, 0.04, 1.02]} position={[0, 0.5, 1.45]} color={C.nok} emissive={C.nok} emissiveIntensity={0.6} shadow={false} />
      </group>

      {/* caçamba de produção */}
      <group position={[ST.end + 0.85, 0, 0]}>
        <Box size={[1.2, 0.55, 1.6]} position={[0, 0.28, 0]} color="#13261b" />
        <Box size={[1.22, 0.04, 1.62]} position={[0, 0.56, 0]} color={C.run} emissive={C.run} emissiveIntensity={0.6} shadow={false} />
      </group>

      {/* armário do CLP com LEDs */}
      <group position={[0.2, 0, -2.4]}>
        <Box size={[1.4, 1.8, 0.55]} position={[0, 0.9, 0]} color="#1d2026" />
        <Box size={[1.2, 0.5, 0.02]} position={[0, 1.35, 0.28]} color="#0b0c0f" metal={0.1} rough={0.3} />
        <instancedMesh ref={leds} args={[undefined, undefined, 8]} position={[0, 0.85, 0.29]}>
          <boxGeometry args={[0.09, 0.09, 0.02]} />
          <meshBasicMaterial />
        </instancedMesh>
      </group>

      <Lights shadows={shadows} />
    </group>
  );
}

function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#dfe8ff", "#1a1a1a", 1.2]} />
      <directionalLight
        position={[4, 10, 7]}
        intensity={3.4}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[ST.inspect, 1.4, 0]} intensity={5} distance={4} color={C.laser} />
      <directionalLight position={[-6, 4, -6]} intensity={1.2} color="#8fb4ff" />
    </>
  );
}

/** câmera em vista isométrica que acompanha levemente o mouse */
function CameraRig() {
  useFrame((state, delta) => {
    const cam = state.camera;
    const px = state.pointer.x;
    const py = state.pointer.y;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, 1.5 + px * 1.4, 2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 6.4 + py * 0.6, 2, delta);
    cam.lookAt(0.2, 1.1, -0.6);
  });
  return null;
}

export default function ProductionLine({ active }: { active: boolean }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, isMobile ? 1 : 1.5]}
      shadows={isMobile ? false : "percentage"}
      camera={{ position: [1.5, 6.4, 11.5], fov: isMobile ? 62 : 44 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <CameraRig />
      <Line shadows={!isMobile} />
    </Canvas>
  );
}
