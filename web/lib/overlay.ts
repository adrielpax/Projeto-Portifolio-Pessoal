import * as THREE from "three";

/**
 * Rótulos HTML que acompanham objetos 3D. Os elementos são renderizados
 * fora do <Canvas> (Scene.tsx) e reposicionados a cada frame pela cena,
 * sem criar raízes React extras.
 */
export const overlay = {
  snippets: [] as (HTMLDivElement | null)[],
  labels: [] as (HTMLDivElement | null)[],
};

export const SNIPPETS = [
  "memory.recall(k=8)",
  "attention(q, k, v)",
  "if (goal) plan()",
  "Σ w·x + b",
  "tool_use: deploy",
  "await agent.think()",
];

const v = new THREE.Vector3();

/** posiciona `el` sobre o ponto de mundo de `obj`; devolve false se estiver atrás da câmera */
export function place(
  el: HTMLElement,
  obj: THREE.Object3D,
  camera: THREE.Camera,
  size: { width: number; height: number },
  extra = "",
) {
  v.setFromMatrixPosition(obj.matrixWorld).project(camera);
  const x = (v.x * 0.5 + 0.5) * size.width;
  const y = (-v.y * 0.5 + 0.5) * size.height;
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) ${extra}`;
  return v.z < 1;
}
