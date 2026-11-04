"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "@/lib/stage";
import { kf } from "@/lib/math";
import { NeuralGraph } from "./NeuralGraph";
import { overlay } from "@/lib/overlay";
import { namedNodes } from "@/lib/graph";

/** câmera acompanha o mouse e faz um leve dolly entre as seções */
function CameraRig() {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const cam = state.camera;
    const narrow = state.size.width < 768;
    const z = kf(stage.t, narrow ? [11, 11, 9.4, 9.8, 11, 11] : [9, 8.6, 9.4, 9.4, 9.4, 9]);
    cam.position.x = THREE.MathUtils.damp(cam.position.x, stage.mouseX * 0.55, 2.2, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, -stage.mouseY * 0.35, 2.2, dt);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, z, 3, dt);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/** rótulos HTML posicionados pela cena (ver lib/overlay.ts) */
function Overlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {namedNodes.map((n, i) => (
        <div
          key={n.name}
          ref={(el) => {
            overlay.nodeLabels[i] = el;
          }}
          className="node-label absolute left-0 top-0"
          style={{ opacity: 0, color: n.color }}
        >
          {n.name}
        </div>
      ))}
    </div>
  );
}

export default function Scene({ active = true }: { active?: boolean }) {
  return (
    <>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 9], fov: 45, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <CameraRig />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 7, 6]} intensity={1.6} />
        <directionalLight position={[-6, -3, -4]} intensity={0.6} color="#8fa2ff" />
        <pointLight position={[0, 0.5, 2]} intensity={6} distance={6} color="#e07a52" />
        <NeuralGraph />
      </Canvas>
      <Overlay />
    </>
  );
}
