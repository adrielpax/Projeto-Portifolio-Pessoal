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
              da interface à infraestrutura
            </>
          }
        />
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <p className="stack-desc max-w-[38ch] text-[14px] leading-snug text-paper/70">
            As ferramentas que uso no dia a dia, organizadas por camada.
          </p>
          {/* lista completa, sempre legível (os rótulos 3D são o reforço visual) */}
          <ul className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {stackLayers.map((l) => (
              <li key={l.code} className="flex items-baseline justify-between gap-3 border-t border-white/8 py-1.5 text-[12.5px]">
                <span className="font-display text-[15px] font-semibold uppercase">{l.name}</span>
                <span className="truncate text-right text-paper/60">{l.items.join(", ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
