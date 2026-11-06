"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { line } from "@/lib/lineStore";

const ProductionLine = dynamic(() => import("@/components/three/ProductionLine"), { ssr: false });

const STATIONS = [
  { id: "feeder", name: "Alimentador", tag: "M-01" },
  { id: "robot", name: "Robô de montagem", tag: "R-02" },
  { id: "inspect", name: "Inspeção (laser)", tag: "S-03" },
  { id: "pusher", name: "Expulsor de refugo", tag: "Y-04" },
  { id: "plc", name: "CLP", tag: "PLC" },
];

type Kpi = { produced: number; rejected: number; rate: number; quality: number; last: string; onBelt: number };

/**
 * Sinótico 3D de uma linha de produção, como uma tela SCADA: a cena roda só
 * quando a seção está visível e os indicadores leem o estado 4 vezes por segundo.
 */
export function Synoptic() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [kpi, setKpi] = useState<Kpi>({ produced: 0, rejected: 0, rate: 0, quality: 100, last: "—", onBelt: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      const total = line.produced + line.rejected;
      setKpi({
        produced: line.produced,
        rejected: line.rejected,
        rate: line.elapsed > 5 ? (line.produced / line.elapsed) * 60 : 0,
        quality: total ? (line.produced / total) * 100 : 100,
        last: line.lastInspection,
        onBelt: line.onBelt,
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <section id="sec-line" ref={ref} className="relative py-20 md:py-28" aria-labelledby="line-title">
      <div className="container-page">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[640px]">
            <span className="kicker-line">Sinótico 3D</span>
            <h2 id="line-title" className="mt-3 font-display text-[40px] font-semibold uppercase leading-[0.92] text-white md:text-[58px]">
              Linha de produção ao vivo
            </h2>
            <p className="mt-4 text-[16px] leading-snug text-white/65">
              O tipo de tela que eu construo para a indústria: cada máquina com estado, contagem e qualidade em tempo real.
            </p>
          </div>
          <span className="flex items-center gap-2 text-[13px] text-white/55">
            <span className="led" style={{ ["--led" as string]: "#3ddc84" }} aria-hidden />
            Simulação rodando no seu navegador
          </span>
        </div>

        <div className="reveal glass relative mt-10 grid overflow-hidden lg:grid-cols-[1fr_300px]">
          <div className="relative h-[360px] md:h-[500px]" aria-label="Cena 3D da linha de produção" role="img">
            <ProductionLine active={active} />
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-white/70">
              Linha 01 · Montagem e inspeção
            </div>
          </div>

          <aside className="border-t border-white/10 p-5 text-white lg:border-l lg:border-t-0" aria-label="Indicadores da linha">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[12px] uppercase tracking-[0.05em] text-white/50">Produzidas</dt>
                <dd className="font-display text-[34px] font-semibold leading-none tabular-nums">{kpi.produced}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.05em] text-white/50">Refugo</dt>
                <dd className="font-display text-[34px] font-semibold leading-none tabular-nums text-[#ff6b6b]">{kpi.rejected}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.05em] text-white/50">Ritmo</dt>
                <dd className="font-display text-[24px] font-semibold leading-none tabular-nums">
                  {kpi.rate.toFixed(0)} <span className="text-[14px] text-white/50">pç/min</span>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.05em] text-white/50">Qualidade</dt>
                <dd className="font-display text-[24px] font-semibold leading-none tabular-nums">{kpi.quality.toFixed(1)}%</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-2 border-t border-white/10 pt-4 text-[14px]">
              {STATIONS.map((s) => {
                const detail =
                  s.id === "inspect" ? `último: ${kpi.last}` : s.id === "robot" ? `ciclo ${line.robotCycle.toFixed(1)} s` : s.id === "feeder" ? `${kpi.onBelt} na esteira` : "rodando";
                const nok = s.id === "inspect" && kpi.last === "NOK";
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="led" style={{ ["--led" as string]: nok ? "#ff4d4d" : "#3ddc84" }} aria-hidden />
                      {s.name}
                      <span className="font-mono text-[11px] text-white/35">{s.tag}</span>
                    </span>
                    <span className="text-[12.5px] text-white/55 tabular-nums">{detail}</span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
