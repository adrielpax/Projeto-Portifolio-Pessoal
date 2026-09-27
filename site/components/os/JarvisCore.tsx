"use client";

import { useRef } from "react";
import Link from "next/link";

type Node = {
  label: string;
  value: number;
  href: string;
  /** posição do readout ao redor do núcleo */
  className: string;
};

/** Latitudes do globo: deslocamento no eixo e diâmetro (r = √(R²−z²), R=115). */
const PARALLELS = [
  { z: 0, d: 230 },
  { z: 42, d: 214 },
  { z: -42, d: 214 },
  { z: 78, d: 169 },
  { z: -78, d: 169 },
];

const MERIDIANS = [0, 45, 90, 135];

/**
 * Jarvis — globo-mundo de dados do sistema.
 * Wireframe em CSS 3D (só transform/opacity, GPU) que inclina seguindo o
 * cursor; readouts com dados reais do portfólio orbitam o globo e são
 * navegáveis. Renderizado apenas em telas grandes.
 */
export default function JarvisCore({
  stats,
}: {
  stats: { projetos: number; live: number; stack: number; certs: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const nodes: Node[] = [
    { label: "PROJETOS", value: stats.projetos, href: "/projetos", className: "left-0 top-6 -translate-x-1/2" },
    { label: "NO AR", value: stats.live, href: "/projetos", className: "right-0 top-16 translate-x-1/2" },
    { label: "TECNOLOGIAS", value: stats.stack, href: "/#painel", className: "bottom-14 left-0 -translate-x-1/2" },
    { label: "CERTIFICADOS", value: stats.certs, href: "/certificacoes", className: "bottom-4 right-2 translate-x-1/3" },
  ];

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || frame.current !== null) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--jarvis-ry", `${dx * 16}deg`);
      el.style.setProperty("--jarvis-rx", `${-dy * 16}deg`);
      frame.current = null;
    });
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--jarvis-ry", "0deg");
    el.style.setProperty("--jarvis-rx", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-hidden={false}
      className="jarvis relative h-72 w-72 select-none xl:h-80 xl:w-80"
    >
      {/* Cena 3D — globo wireframe + órbitas */}
      <div className="jarvis-scene">
        <div className="jarvis-core-glow" />
        <div className="jarvis-orbit jarvis-orbit-a" />
        <div className="jarvis-orbit jarvis-orbit-b" />
        <div className="jarvis-globe">
          {MERIDIANS.map((a) => (
            <div
              key={a}
              className="jarvis-meridian"
              style={{ transform: `rotateY(${a}deg)` }}
            />
          ))}
          {PARALLELS.map((p) => (
            <div
              key={p.z}
              className="jarvis-parallel"
              style={{
                width: p.d,
                height: p.d,
                transform: `translate(-50%, -50%) rotateX(90deg) translateZ(${p.z}px)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Readouts — dados reais, navegáveis */}
      {nodes.map((n) => (
        <Link
          key={n.label}
          href={n.href}
          className={`group absolute z-10 flex flex-col items-center gap-0.5 ${n.className}`}
        >
          <span className="font-display text-lg font-bold leading-none text-hud-text transition-colors group-hover:text-hud-accent-2">
            {n.value}
          </span>
          <span className="rounded-[3px] border border-hud-line bg-hud-bg/70 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-hud-muted backdrop-blur transition-colors group-hover:border-hud-accent/40 group-hover:text-hud-text">
            {n.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
