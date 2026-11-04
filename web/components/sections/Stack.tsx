import { stackLayers } from "@/lib/content";

export function Stack() {
  return (
    <section id="sec-stack" className="relative border-t border-concrete-2 pb-8 pt-20 md:pb-10 md:pt-28" aria-labelledby="stack-title">
      <div className="container-page">
        <div className="reveal max-w-[640px]">
          <span className="tag-safety">Stack</span>
          <h2 id="stack-title" tabIndex={-1} className="mt-3 font-display text-[40px] font-semibold uppercase leading-[0.92] outline-none md:text-[58px]">
            Ferramentas por camada
          </h2>
          <p className="mt-4 text-[16px] leading-snug text-slate">Da interface à infraestrutura, o que uso para colocar sistemas de pé.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stackLayers.map((l, i) => (
            <div key={l.code} className="card-light reveal p-5" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[22px] font-semibold uppercase leading-none">{l.name}</h3>
                <span className="font-mono text-[12px] text-slate">{l.code}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.items.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
