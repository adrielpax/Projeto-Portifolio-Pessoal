"use client";

import { useEffect, useState } from "react";

const STEPS = ["neural_graph", "agents.pixel", "hardware.l1-l6", "telemetry"];

/** abertura curta estilo "sistema ligando"; menos de 1s */
export function Boot({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let v = 0;
    const id = window.setInterval(() => {
      v = Math.min(100, v + 8 + Math.random() * 14);
      setP(v);
      if (v >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setLeaving(true);
          onDone();
        }, 180);
        window.setTimeout(() => setGone(true), 900);
      }
    }, 60);
    return () => window.clearInterval(id);
  }, [onDone]);

  if (gone) return null;
  const blocks = 24;
  const filled = Math.round((p / 100) * blocks);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.2,1)] ${
        leaving ? "[clip-path:inset(0_0_100%_0)]" : "[clip-path:inset(0_0_0_0)]"
      }`}
      aria-hidden
    >
      <div className="w-[280px] font-pixel text-[10px] uppercase tracking-[0.2em] text-dim">
        <div className="mb-4 text-paper">adriel.sys · v3.0</div>
        {STEPS.map((s, i) => (
          <div key={s} className="flex justify-between py-0.5">
            <span>{s}</span>
            <span className={p > (i + 1) * 22 ? "text-signal" : "text-faint"}>{p > (i + 1) * 22 ? "ok" : "··"}</span>
          </div>
        ))}
        <div className="mt-4 flex gap-[3px]">
          {Array.from({ length: blocks }, (_, i) => (
            <span key={i} className={`h-2 flex-1 ${i < filled ? "bg-paper" : "bg-faint"}`} />
          ))}
        </div>
        <div className="mt-2 text-right tabular-nums">{Math.round(p)}%</div>
      </div>
    </div>
  );
}
