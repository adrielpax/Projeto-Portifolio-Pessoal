"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "@/lib/stage";
import { kf, mulberry32 } from "@/lib/math";
import { overlay, place, SNIPPETS } from "@/lib/overlay";

const NODES = 170;
const PULSES = 70;
const TRAIL = 4;

const WHITE = new THREE.Color("#ededea");
const CLAUDE = new THREE.Color("#e07a52");
const CODEX = new THREE.Color("#8fa2ff");


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
    vAlpha = aAlpha * smoothstep(26.0, 5.0, -mv.z);
  }
`;

// núcleo quadrado (pixel) + halo suave
const pointsFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = abs(gl_PointCoord - 0.5);
    float core = 1.0 - step(0.19, max(c.x, c.y));
    float glow = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * 0.35;
    float a = (core + glow) * vAlpha * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
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
    vFade = smoothstep(26.0, 5.0, -mv.z);
  }
`;

const linesFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vGlow;
  varying float vFade;
  varying vec3 vColor;
  void main() {
    vec3 col = mix(vec3(0.93), vColor, vGlow);
    float a = (0.075 + vGlow * 0.6) * uOpacity * vFade;
    gl_FragColor = vec4(col, a);
  }
`;

/* ---------------------------------- grafo --------------------------------- */

function buildGraph() {
  const rand = mulberry32(7);
  const gauss = () => {
    const u = Math.max(1e-6, rand());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const R = new THREE.Vector3(4.4, 2.5, 2.4);
  const centers = Array.from(
    { length: 9 },
    () => new THREE.Vector3((rand() - 0.5) * 6.4, (rand() - 0.5) * 3, (rand() - 0.5) * 2.8),
  );
  const pos: THREE.Vector3[] = [];
  for (let i = 0; i < NODES; i++) {
    let p: THREE.Vector3;
    if (rand() < 0.72) {
      const c = centers[Math.floor(rand() * centers.length)];
      p = c.clone().add(new THREE.Vector3(gauss() * 0.8, gauss() * 0.6, gauss() * 0.7));
    } else {
      p = new THREE.Vector3((rand() * 2 - 1) * R.x, (rand() * 2 - 1) * R.y, (rand() * 2 - 1) * R.z);
    }
    // mantém dentro de um elipsoide (forma de "cérebro")
    const k = (p.x / R.x) ** 2 + (p.y / R.y) ** 2 + (p.z / R.z) ** 2;
    if (k > 1) p.multiplyScalar(1 / Math.sqrt(k));
    pos.push(p);
  }

  const edges: [number, number][] = [];
  const adj: number[][] = pos.map(() => []);
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
  for (let i = 0; i < NODES; i++) {
    const near = pos
      .map((p, j) => ({ j, d: p.distanceToSquared(pos[i]) }))
      .sort((a, b) => a.d - b.d)
      .slice(1, 4);
    near.forEach(({ j }) => add(i, j));
  }
  for (let m = 0; m < 22; m++) {
    const a = Math.floor(rand() * NODES);
    const b = Math.floor(rand() * NODES);
    if (pos[a].distanceTo(pos[b]) < 3.8) add(a, b);
  }
  const edgeOf = (a: number, b: number) => edgeIndex.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? 0;
  return { pos, edges, adj, edgeOf, rand };
}

type Pulse = { from: number; to: number; t: number; speed: number; color: THREE.Color };

/* ------------------------------- componente ------------------------------- */

export function NeuralGraph() {
  const group = useRef<THREE.Group>(null);
  const anchors = useRef<(THREE.Group | null)[]>([]);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const g = useMemo(buildGraph, []);

  const nodeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(NODES * 3);
    const sizes = new Float32Array(NODES);
    const alpha = new Float32Array(NODES);
    const col = new Float32Array(NODES * 3);
    g.pos.forEach((v, i) => {
      v.toArray(p, i * 3);
      sizes[i] = 2.2 + Math.min(4, g.adj[i].length) * 0.55 + g.rand() * 1.2;
      alpha[i] = 0.55;
      WHITE.toArray(col, i * 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return geo;
  }, [g]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(g.edges.length * 6);
    const glow = new Float32Array(g.edges.length * 2);
    const col = new Float32Array(g.edges.length * 6);
    g.edges.forEach(([a, b], i) => {
      g.pos[a].toArray(p, i * 6);
      g.pos[b].toArray(p, i * 6 + 3);
      WHITE.toArray(col, i * 6);
      WHITE.toArray(col, i * 6 + 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    geo.setAttribute("aGlow", new THREE.BufferAttribute(glow, 1));
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
        sizes[i * TRAIL + k] = 5.5 - k * 1.1;
        alpha[i * TRAIL + k] = 1 - k * 0.24;
      }
    }
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return geo;
  }, []);

  const pulses = useMemo<Pulse[]>(() => {
    return Array.from({ length: PULSES }, () => {
      const from = Math.floor(g.rand() * NODES);
      const nb = g.adj[from];
      const to = nb[Math.floor(g.rand() * nb.length)] ?? from;
      const r = g.rand();
      return {
        from,
        to,
        t: g.rand(),
        speed: 1.1 + g.rand() * 1.4,
        color: r < 0.14 ? CLAUDE : r < 0.24 ? CODEX : WHITE,
      };
    });
  }, [g]);

  const activation = useMemo(() => new Float32Array(NODES), []);
  const actColor = useMemo(() => Array.from({ length: NODES }, () => WHITE), []);
  const edgeGlow = useMemo(() => new Float32Array(g.edges.length), [g]);
  const edgeColor = useMemo(() => Array.from({ length: g.edges.length }, () => WHITE), [g]);

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
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = stage.t;
    const narrow = state.size.width < 768;

    // -------- posição/escala do grafo por seção (rótulos 0..5) --------
    const grp = group.current;
    if (grp) {
      grp.position.set(
        kf(t, narrow ? [0, 0, 0, 0, 0, 0] : [0.3, 2.9, 3.6, 3.6, -3, 0]),
        kf(t, narrow ? [0.6, 0.4, 1.2, 1.2, 0.4, 0.6] : [0, -0.2, 0, 0, -0.2, -0.5]),
        kf(t, [0, -1.2, -9, -10, -2, -3]),
      );
      const sc = kf(t, narrow ? [0.62, 0.55, 0.5, 0.5, 0.55, 0.62] : [1, 0.86, 0.8, 0.8, 0.86, 1.05]);
      grp.scale.setScalar(sc);
      grp.rotation.y += dt * (stage.reducedMotion ? 0.01 : 0.045);
      grp.rotation.x = THREE.MathUtils.damp(grp.rotation.x, stage.mouseY * 0.12, 2, dt);
    }
    const opacity = kf(t, [1, 0.6, 0.16, 0.1, 0.5, 0.75]);
    uniforms.points.uOpacity.value = opacity;
    uniforms.pulses.uOpacity.value = opacity;
    uniforms.lines.uOpacity.value = opacity;
    const speedMul = (stage.reducedMotion ? 0.25 : 1) * kf(t, [1, 0.85, 0.4, 0.4, 1, 1.9]);

    // -------- pulsos viajando de neurônio em neurônio --------
    const pPos = pulseGeo.attributes.position.array as Float32Array;
    const pCol = pulseGeo.attributes.aColor.array as Float32Array;
    for (let i = 0; i < PULSES; i++) {
      const p = pulses[i];
      const a = g.pos[p.from];
      const b = g.pos[p.to];
      const len = Math.max(0.2, a.distanceTo(b));
      p.t += (dt * p.speed * speedMul) / len;
      if (p.t >= 1) {
        activation[p.to] = 1;
        actColor[p.to] = p.color;
        const nb = g.adj[p.to];
        let next = nb[Math.floor(Math.random() * nb.length)];
        if (next === p.from && nb.length > 1) next = nb[(nb.indexOf(next) + 1) % nb.length];
        p.from = p.to;
        p.to = next ?? p.from;
        p.t = 0;
      }
      const e = g.edgeOf(p.from, p.to);
      edgeGlow[e] = Math.min(1, edgeGlow[e] + dt * 6);
      edgeColor[e] = p.color;
      for (let k = 0; k < TRAIL; k++) {
        const tt = Math.max(0, p.t - k * 0.07);
        tmp.lerpVectors(g.pos[p.from], g.pos[p.to], tt);
        tmp.toArray(pPos, (i * TRAIL + k) * 3);
        p.color.toArray(pCol, (i * TRAIL + k) * 3);
      }
    }
    pulseGeo.attributes.position.needsUpdate = true;
    pulseGeo.attributes.aColor.needsUpdate = true;

    // -------- neurônios acendem ao receber um pulso e apagam devagar --------
    const nAlpha = nodeGeo.attributes.aAlpha.array as Float32Array;
    const nCol = nodeGeo.attributes.aColor.array as Float32Array;
    const decay = Math.exp(-dt * 2.4);
    for (let i = 0; i < NODES; i++) {
      activation[i] *= decay;
      const act = activation[i];
      nAlpha[i] = 0.42 + act * 0.58;
      tmpColor.copy(WHITE).lerp(actColor[i], act);
      tmpColor.toArray(nCol, i * 3);
    }
    nodeGeo.attributes.aAlpha.needsUpdate = true;
    nodeGeo.attributes.aColor.needsUpdate = true;

    const lGlow = lineGeo.attributes.aGlow.array as Float32Array;
    const lCol = lineGeo.attributes.aColor.array as Float32Array;
    const edgeDecay = Math.exp(-dt * 1.6);
    for (let i = 0; i < edgeGlow.length; i++) {
      edgeGlow[i] *= edgeDecay;
      lGlow[i * 2] = edgeGlow[i];
      lGlow[i * 2 + 1] = edgeGlow[i];
      edgeColor[i].toArray(lCol, i * 6);
      edgeColor[i].toArray(lCol, i * 6 + 3);
    }
    lineGeo.attributes.aGlow.needsUpdate = true;
    lineGeo.attributes.aColor.needsUpdate = true;

    // -------- trechos de código que aparecem perto de alguns nós --------
    grp?.updateMatrixWorld();
    const clock = state.clock.elapsedTime;
    overlay.snippets.forEach((el, i) => {
      const anchor = anchors.current[i];
      if (!el || !anchor) return;
      const phase = (clock / 9 + i / SNIPPETS.length) % 1;
      const vis = Math.max(0, Math.sin(Math.min(1, phase / 0.45) * Math.PI));
      const o = vis * Math.max(0, opacity - 0.2) * (narrow ? 0 : 1);
      el.style.opacity = String(o);
      if (o > 0) place(el, anchor, state.camera, state.size, "translate(10px, -50%)");
    });
  });

  // nós "hub" (mais conexões) recebem os trechos de código
  const snippetNodes = useMemo(
    () =>
      g.pos
        .map((p, i) => ({ i, deg: g.adj[i].length, p }))
        .sort((a, b) => b.deg - a.deg)
        .filter((_, k) => k % 3 === 0)
        .slice(0, SNIPPETS.length),
    [g],
  );

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
      {snippetNodes.map(({ i, p }, k) => (
        <group
          key={i}
          position={p}
          ref={(el) => {
            anchors.current[k] = el;
          }}
        />
      ))}
    </group>
  );
}
