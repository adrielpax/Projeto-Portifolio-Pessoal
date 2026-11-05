"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "@/lib/stage";
import { kf, mulberry32 } from "@/lib/math";
import { overlay, placePoint } from "@/lib/overlay";
import { bridges, communities, SATELLITES_PER_COMMUNITY } from "@/lib/graph";

const PULSES = 80;
const TRAIL = 5;
const WHITE = new THREE.Color("#ffffff");

/* --------------------------------- shaders -------------------------------- */

const pointsVertex = /* glsl */ `
  uniform float uScale;
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / -mv.z;
    vColor = aColor;
    vAlpha = aAlpha * smoothstep(28.0, 5.0, -mv.z);
  }
`;

// nó redondo com núcleo sólido e halo, como nos grafos do graphify
const pointsFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.24, 0.2, d);
    float glow = smoothstep(0.5, 0.0, d) * 0.45;
    float a = (core + glow) * vAlpha * uOpacity;
    if (a < 0.004) discard;
    vec3 col = mix(vColor * 1.15, vec3(1.0), core * 0.15);
    gl_FragColor = vec4(col, a);
  }
`;

const linesVertex = /* glsl */ `
  attribute float aGlow;
  attribute vec3 aColor;
  varying float vGlow;
  varying float vFade;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vGlow = aGlow;
    vColor = aColor;
    vFade = smoothstep(28.0, 5.0, -mv.z);
  }
`;

const linesFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vGlow;
  varying float vFade;
  varying vec3 vColor;
  void main() {
    float a = (0.3 + vGlow * 0.7) * uOpacity * vFade;
    gl_FragColor = vec4(mix(vColor, vec3(1.0), vGlow * 0.5), a);
  }
`;

/* ---------------------------------- grafo --------------------------------- */

type GNode = { p: THREE.Vector3; color: THREE.Color; named: boolean; community: number };

function buildGraph() {
  const rand = mulberry32(11);
  const nodes: GNode[] = [];
  const named: number[] = [];

  communities.forEach((c, ci) => {
    const color = new THREE.Color(c.color);
    const center = new THREE.Vector3(...c.center);
    c.nodes.forEach(() => {
      const p = center.clone().add(new THREE.Vector3((rand() - 0.5) * 2, (rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6));
      named.push(nodes.length);
      nodes.push({ p, color, named: true, community: ci });
    });
    for (let s = 0; s < SATELLITES_PER_COMMUNITY; s++) {
      const p = center.clone().add(new THREE.Vector3((rand() - 0.5) * 2.6, (rand() - 0.5) * 2.2, (rand() - 0.5) * 2.2));
      nodes.push({ p, color, named: false, community: ci });
    }
  });

  const edges: [number, number][] = [];
  const adj: number[][] = nodes.map(() => []);
  const edgeIndex = new Map<string, number>();
  const add = (a: number, b: number) => {
    if (a === b) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (edgeIndex.has(key)) return;
    edgeIndex.set(key, edges.length);
    edges.push([a, b]);
    adj[a].push(b);
    adj[b].push(a);
  };
  const nearest = (i: number, pool: number[], k: number) =>
    pool
      .filter((j) => j !== i)
      .map((j) => ({ j, d: nodes[j].p.distanceToSquared(nodes[i].p) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .map((x) => x.j);

  communities.forEach((_, ci) => {
    const members = nodes.map((n, i) => (n.community === ci ? i : -1)).filter((i) => i >= 0);
    const hubs = members.filter((i) => nodes[i].named);
    // nomeados formam o "esqueleto" da área; satélites se penduram no hub mais próximo
    hubs.forEach((i) => nearest(i, hubs, 2).forEach((j) => add(i, j)));
    members.filter((i) => !nodes[i].named).forEach((i) => {
      nearest(i, hubs, 1).forEach((j) => add(i, j));
      if (rand() < 0.4) nearest(i, members, 2).forEach((j) => add(i, j));
    });
  });

  const nameIndex = new Map<string, number>();
  let k = 0;
  communities.forEach((c) => c.nodes.forEach((name) => nameIndex.set(name, named[k++])));
  bridges.forEach(([a, b]) => {
    const ia = nameIndex.get(a);
    const ib = nameIndex.get(b);
    if (ia !== undefined && ib !== undefined) add(ia, ib);
  });

  // relaxamento por forças (repulsão + molas + atração ao centro da área), como um layout force-directed
  const centers = communities.map((c) => new THREE.Vector3(...c.center));
  const tmp = new THREE.Vector3();
  for (let it = 0; it < 120; it++) {
    const step = 0.02 * (1 - it / 120);
    for (let i = 0; i < nodes.length; i++) {
      const force = new THREE.Vector3();
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        tmp.subVectors(nodes[i].p, nodes[j].p);
        const d2 = Math.max(0.04, tmp.lengthSq());
        if (d2 < 2.5) force.addScaledVector(tmp.normalize(), 0.06 / d2);
      }
      adj[i].forEach((j) => {
        tmp.subVectors(nodes[j].p, nodes[i].p);
        const d = tmp.length();
        force.addScaledVector(tmp.normalize(), (d - (nodes[i].named && nodes[j].named ? 1.1 : 0.55)) * 0.5);
      });
      force.addScaledVector(tmp.subVectors(centers[nodes[i].community], nodes[i].p), 0.08);
      nodes[i].p.addScaledVector(force, step * 10);
    }
  }

  const edgeOf = (a: number, b: number) => edgeIndex.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? 0;
  return { nodes, edges, adj, edgeOf, named, rand };
}

type Pulse = { from: number; to: number; t: number; speed: number };

/* ------------------------------- componente ------------------------------- */

export function NeuralGraph() {
  const group = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const g = useMemo(buildGraph, []);
  const N = g.nodes.length;

  const nodeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const alpha = new Float32Array(N);
    const col = new Float32Array(N * 3);
    g.nodes.forEach((n, i) => {
      n.p.toArray(p, i * 3);
      sizes[i] = n.named ? 7 + Math.min(5, g.adj[i].length) * 0.6 : 2.6 + g.rand() * 1.4;
      alpha[i] = n.named ? 1.0 : 0.75;
      n.color.toArray(col, i * 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return geo;
  }, [g, N]);

  const baseSize = useMemo(() => Float32Array.from(nodeGeo.attributes.aSize.array as Float32Array), [nodeGeo]);
  const baseAlpha = useMemo(() => Float32Array.from(nodeGeo.attributes.aAlpha.array as Float32Array), [nodeGeo]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(g.edges.length * 6);
    const col = new Float32Array(g.edges.length * 6);
    g.edges.forEach(([a, b], i) => {
      g.nodes[a].p.toArray(p, i * 6);
      g.nodes[b].p.toArray(p, i * 6 + 3);
      g.nodes[a].color.toArray(col, i * 6);
      g.nodes[b].color.toArray(col, i * 6 + 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    geo.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(g.edges.length * 2), 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return geo;
  }, [g]);

  const pulseGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const n = PULSES * TRAIL;
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const sizes = new Float32Array(n);
    const alpha = new Float32Array(n);
    for (let i = 0; i < PULSES; i++) {
      for (let k = 0; k < TRAIL; k++) {
        sizes[i * TRAIL + k] = 5 - k * 0.8;
        alpha[i * TRAIL + k] = 1 - k * 0.19;
      }
    }
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) WHITE.toArray(col, i * 3);
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  const pulses = useMemo<Pulse[]>(
    () =>
      Array.from({ length: PULSES }, () => {
        const from = Math.floor(g.rand() * N);
        const nb = g.adj[from];
        return { from, to: nb[Math.floor(g.rand() * nb.length)] ?? from, t: g.rand(), speed: 1 + g.rand() * 1.3 };
      }),
    [g, N],
  );

  const activation = useMemo(() => new Float32Array(N), [N]);
  const edgeGlow = useMemo(() => new Float32Array(g.edges.length), [g]);

  const uniforms = useMemo(
    () => ({
      points: { uScale: { value: 16 }, uOpacity: { value: 1 } },
      pulses: { uScale: { value: 16 }, uOpacity: { value: 1 } },
      lines: { uOpacity: { value: 1 } },
    }),
    [],
  );

  useEffect(() => {
    const s = 15 * gl.getPixelRatio();
    uniforms.points.uScale.value = s;
    uniforms.pulses.uScale.value = s;
  }, [gl, uniforms, size]);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = stage.t;
    const narrow = state.size.width < 768;

    const grp = group.current;
    if (grp) {
      grp.position.set(
        kf(t, narrow ? [0, 0, 0, 0, 0, 0] : [0, 3.1, 2.6, 2.6, -2.6, 0.4]),
        kf(t, narrow ? [0.4, 0.4, 0.3, 0.3, 0.3, 0.4] : [0, 0, -0.2, -0.2, -0.2, -0.3]),
        kf(t, [-0.5, -0.8, -1.6, -1.6, -2, -2.4]),
      );
      grp.scale.setScalar(kf(t, narrow ? [0.6, 0.6, 0.55, 0.55, 0.55, 0.6] : [1.08, 1, 0.9, 0.9, 0.9, 1]));
      grp.rotation.y += dt * (stage.reducedMotion ? 0.01 : 0.04);
      grp.rotation.x = THREE.MathUtils.damp(grp.rotation.x, stage.mouseY * 0.12, 2, dt);
    }
    const opacity = kf(t, [1, 0.9, 0.6, 0.6, 0.6, 0.85]);
    uniforms.points.uOpacity.value = opacity;
    uniforms.pulses.uOpacity.value = opacity;
    uniforms.lines.uOpacity.value = opacity;
    const speedMul = (stage.reducedMotion ? 0.25 : 1) * kf(t, [1, 1.3, 0.8, 0.8, 1, 1.8]);

    // pulsos percorrem o grafo de nó em nó
    const pPos = pulseGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < PULSES; i++) {
      const p = pulses[i];
      const a = g.nodes[p.from].p;
      const b = g.nodes[p.to].p;
      p.t += (dt * p.speed * speedMul) / Math.max(0.2, a.distanceTo(b));
      if (p.t >= 1) {
        activation[p.to] = 1;
        const nb = g.adj[p.to];
        let next = nb[Math.floor(Math.random() * nb.length)];
        if (next === p.from && nb.length > 1) next = nb[(nb.indexOf(next) + 1) % nb.length];
        p.from = p.to;
        p.to = next ?? p.from;
        p.t = 0;
      }
      const e = g.edgeOf(p.from, p.to);
      edgeGlow[e] = Math.min(1, edgeGlow[e] + dt * 6);
      for (let k = 0; k < TRAIL; k++) {
        tmp.lerpVectors(g.nodes[p.from].p, g.nodes[p.to].p, Math.max(0, p.t - k * 0.06));
        tmp.toArray(pPos, (i * TRAIL + k) * 3);
      }
    }
    pulseGeo.attributes.position.needsUpdate = true;

    // nós "acendem" ao receber um pulso
    const nAlpha = nodeGeo.attributes.aAlpha.array as Float32Array;
    const nSize = nodeGeo.attributes.aSize.array as Float32Array;
    const decay = Math.exp(-dt * 2.4);
    for (let i = 0; i < N; i++) {
      activation[i] *= decay;
      nAlpha[i] = Math.min(1, baseAlpha[i] + activation[i] * 0.5);
      nSize[i] = baseSize[i] * (1 + activation[i] * 0.6);
    }
    nodeGeo.attributes.aAlpha.needsUpdate = true;
    nodeGeo.attributes.aSize.needsUpdate = true;

    const lGlow = lineGeo.attributes.aGlow.array as Float32Array;
    const edgeDecay = Math.exp(-dt * 1.6);
    for (let i = 0; i < edgeGlow.length; i++) {
      edgeGlow[i] *= edgeDecay;
      lGlow[i * 2] = edgeGlow[i];
      lGlow[i * 2 + 1] = edgeGlow[i];
    }
    lineGeo.attributes.aGlow.needsUpdate = true;

    // rótulos dos nós nomeados (HTML projetado)
    if (grp) {
      grp.updateMatrixWorld();
      const labelOpacity = narrow ? 0 : Math.max(0, (opacity - 0.25) / 0.75);
      g.named.forEach((nodeIndex, i) => {
        const el = overlay.nodeLabels[i];
        if (!el) return;
        tmp.copy(g.nodes[nodeIndex].p).applyMatrix4(grp.matrixWorld);
        const depth = tmp.distanceTo(state.camera.position);
        const o = labelOpacity * Math.min(1, Math.max(0.25, (13 - depth) / 6)) * (0.75 + activation[nodeIndex] * 0.25);
        el.style.opacity = String(o);
        if (o > 0.01) placePoint(el, tmp, state.camera, state.size, "translate(9px, -50%)");
      });
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={linesVertex}
          fragmentShader={linesFragment}
          uniforms={uniforms.lines}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={nodeGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={pointsVertex}
          fragmentShader={pointsFragment}
          uniforms={uniforms.points}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points geometry={pulseGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={pointsVertex}
          fragmentShader={pointsFragment}
          uniforms={uniforms.pulses}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
