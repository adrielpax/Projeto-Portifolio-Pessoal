"use client";

import { motion, useReducedMotion } from "motion/react";

type StackItem = { name: string; count: number };
type StatusItem = { label: string; count: number; color: string };

/**
 * Painel de dados do sistema — números derivados do conteúdo real.
 * Paleta de status validada (CVD/contraste) via dataviz validator:
 * #059669 / #3b82f6 / #d97706 sobre superfície escura.
 */
export default function SystemPanel({
  stack,
  status,
  total,
}: {
  stack: StackItem[];
  status: StatusItem[];
  total: number;
}) {
  const reduced = useReducedMotion();
  const max = Math.max(...stack.map((s) => s.count), 1);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Tecnologias × projetos — barras horizontais, série única */}
      <div className="hud-panel p-5 lg:col-span-3">
        <span className="hud-label">Tecnologias × projetos</span>
        <ul className="mt-4 space-y-2.5">
          {stack.map((s) => (
            <li
              key={s.name}
              title={`${s.name}: usada em ${s.count} de ${total} projetos`}
              className="grid grid-cols-[7rem_1fr_1.5rem] items-center gap-3 rounded-md px-1 py-0.5 transition-colors hover:bg-white/[0.04]"
            >
              <span className="truncate text-xs text-hud-muted">{s.name}</span>
              <span className="relative h-2.5 overflow-hidden rounded-r-[4px] bg-white/5">
                {reduced ? (
                  <span
                    className="absolute inset-y-0 left-0 rounded-r-[4px] bg-hud-accent"
                    style={{ width: `${(s.count / max) * 100}%` }}
                  />
                ) : (
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(s.count / max) * 100}%` }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 left-0 rounded-r-[4px] bg-hud-accent"
                  />
                )}
              </span>
              <span className="text-right font-mono text-xs text-hud-text">
                {s.count}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-hud-muted">
          Em quantos projetos do portfólio cada tecnologia aparece.
        </p>
      </div>

      {/* Status dos projetos — barra segmentada + legenda com contagens */}
      <div className="hud-panel flex flex-col p-5 lg:col-span-2">
        <span className="hud-label">Status dos projetos</span>
        <div className="mt-4 flex h-3 w-full gap-[2px] overflow-hidden rounded-[4px]">
          {status.map((s) => (
            <span
              key={s.label}
              title={`${s.label}: ${s.count}`}
              className="h-full"
              style={{
                width: `${(s.count / total) * 100}%`,
                background: s.color,
              }}
            />
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {status.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="flex items-center gap-2 text-hud-muted">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="font-mono text-hud-text">{s.count}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto border-t border-hud-line pt-3 text-[11px] text-hud-muted">
          {total} projetos monitorados pelo sistema.
        </p>
      </div>
    </div>
  );
}
