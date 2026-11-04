import { stackLayers } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";

export function Stack() {
  const total = stackLayers.reduce((n, l) => n + l.items.length, 0);
  return (
    <section className="sec sec-stack frame-inset invisible opacity-0" aria-labelledby="stack-title">
      <div className="flex h-full flex-col p-4 md:px-8 md:pb-6 md:pt-5">
        <SectionHeader
          code="Tela 02"
          title="Stack"
          id="stack-title"
          meta={
            <>
              {stackLayers.length} camadas, {total} tecnologias
              <br />
              role para desmontar
            </>
          }
        />
        <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between lg:max-w-[34%]">
          <p className="stack-desc max-w-[38ch] text-[14px] leading-snug text-paper/70">
            Cada camada do equipamento é uma parte do que eu construo, da interface à infraestrutura.
          </p>
          {/* lista completa, sempre legível (os rótulos 3D são o reforço visual) */}
          <ul className="mt-4 grid grid-cols-2 gap-x-4 lg:sr-only">
            {stackLayers.map((l) => (
              <li key={l.code} className="flex items-baseline justify-between gap-3 border-t border-white/8 py-1.5 text-[12.5px]">
                <span className="font-display text-[15px] font-semibold uppercase">{l.name}</span>
                <span className="truncate text-right text-paper/60">{l.items.join(", ")}</span>
              </li>
            ))}
          </ul>
          <p className="stack-hint sr-only">Role para desmontar</p>
          <div className="stack-legend hidden" />
        </div>
      </div>
    </section>
  );
}
