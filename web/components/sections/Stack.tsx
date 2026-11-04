import { stackLayers } from "@/lib/content";
import { Scramble } from "@/components/experience/Scramble";

export function Stack({ active }: { active: boolean }) {
  const total = stackLayers.reduce((n, l) => n + l.items.length, 0);
  return (
    <section className="sec sec-stack frame-inset invisible opacity-0" aria-labelledby="stack-title">
      <div className="flex h-full flex-col justify-between p-4 md:p-8 lg:max-w-[36%]">
        <div>
          <div className="reveal kicker">02 // arquitetura</div>
          <h2 id="stack-title" className="reveal display mt-3">
            <Scramble text="Stack" play={active} />
          </h2>
          <p className="reveal stack-desc mt-4 max-w-[36ch] text-[13px] leading-relaxed text-dim">
            Um sistema completo, camada por camada. Da interface à infraestrutura, cada peça é uma tecnologia que uso no dia a dia.
          </p>
        </div>

        <div className="relative">
          <div className="reveal stack-hint flex items-center gap-3 font-pixel text-[10px] uppercase tracking-[0.2em] text-paper">
            <span className="blink">▼</span> role para desmontar
          </div>
          <div className="stack-legend absolute bottom-0 left-0 right-0">
            <ul className="mb-4 grid grid-cols-3 gap-x-3 gap-y-2.5 md:hidden">
              {stackLayers.map((l) => (
                <li key={l.code} className="reveal-2 font-pixel text-[8px] uppercase leading-tight tracking-[0.12em]">
                  <span className="text-claude">{l.code}</span> {l.name}
                </li>
              ))}
            </ul>
            <div className="reveal-2 font-pixel text-[10px] uppercase tracking-[0.2em] text-dim">
              {stackLayers.length} camadas · {total} tecnologias
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
