import * as THREE from "three";

/**
 * Rótulos HTML que acompanham objetos 3D. Os elementos são renderizados
 * fora do <Canvas> (Scene.tsx) e reposicionados a cada frame pela cena,
 * sem criar raízes React extras.
 */
export const overlay = {
  nodeLabels: [] as (HTMLDivElement | null)[],
  labels: [] as (HTMLDivElement | null)[],
};

const v = new THREE.Vector3();

function toScreen(el: HTMLElement, p: THREE.Vector3, camera: THREE.Camera, size: { width: number; height: number }, extra: string) {
  v.copy(p).project(camera);
  const x = (v.x * 0.5 + 0.5) * size.width;
  const y = (-v.y * 0.5 + 0.5) * size.height;
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) ${extra}`;
  return v.z < 1;
}

/** posiciona `el` sobre o ponto de mundo de `obj` */
export function place(el: HTMLElement, obj: THREE.Object3D, camera: THREE.Camera, size: { width: number; height: number }, extra = "") {
  return toScreen(el, new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld), camera, size, extra);
}

/** posiciona `el` sobre um ponto em coordenadas de mundo */
export function placePoint(el: HTMLElement, p: THREE.Vector3, camera: THREE.Camera, size: { width: number; height: number }, extra = "") {
  return toScreen(el, p, camera, size, extra);
}
