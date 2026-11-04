import type { ReactNode } from "react";

/**
 * Cabeçalho compacto de tela, no estilo de software industrial:
 * código da tela, título curto e metadados à direita.
 */
export function SectionHeader({ code, title, id, meta }: { code: string; title: string; id: string; meta?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 border-b border-white/12 pb-3">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[13px] font-medium uppercase tracking-[0.08em] text-dim tabular-nums">{code}</span>
        <h2 id={id} tabIndex={-1} className="font-display text-[26px] font-semibold uppercase leading-none outline-none md:text-[30px]">
          {title}
        </h2>
      </div>
      {meta && <div className="hidden text-right text-[12px] leading-tight text-dim sm:block">{meta}</div>}
    </header>
  );
}

/** data AAAA-MM-DD → "out 2025" */
export const monthYear = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "").replace(" de ", " ");
