import { projects } from "@/lib/content";
import { Scramble } from "@/components/experience/Scramble";
import { PixelBars } from "./PixelBars";

export function Projects({ active }: { active: boolean }) {
  return (
    <section className="sec sec-projects frame-inset invisible opacity-0" aria-labelledby="projects-title">
      <div className="flex h-full flex-col gap-5 overflow-hidden p-4 md:p-8 lg:grid lg:grid-cols-[minmax(240px,0.75fr)_2fr] lg:gap-10">
        <header className="flex flex-col">
          <div className="reveal kicker">01 // seleção</div>
          <h2 id="projects-title" className="reveal display mt-3">
            <Scramble text="Projetos" play={active} />
          </h2>
          <p className="reveal mt-4 hidden max-w-[34ch] text-[13px] leading-relaxed text-dim sm:block">
            Sistemas em produção, estudos e experimentos. Cada um nasceu de um problema concreto.
          </p>
          <a href="https://github.com/adrielpax" target="_blank" rel="noreferrer" className="reveal btn-line mt-4 self-start md:mt-6">
            Ver tudo no GitHub ↗
          </a>
        </header>

        <div className="projects-grid -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:gap-4 lg:content-center">
          {projects.map((p) => (
            <a
              key={p.code}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="reveal project-card group relative flex min-w-[78vw] snap-start flex-col border border-white/10 bg-ink/75 p-4 transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.03] sm:min-w-0 md:p-5"
            >
              <div className="flex items-center justify-between font-pixel text-[8px] uppercase tracking-[0.18em] text-dim md:text-[9px]">
                <span>
                  {p.code} · {p.year}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 ${p.status === "Em produção" ? "bg-signal" : "bg-dim"}`} />
                  {p.status}
                </span>
              </div>
              <div className="mt-3 h-8 md:h-10">
                <PixelBars seed={p.seed} />
              </div>
              <h3 className="mt-3 font-pixel text-[15px] uppercase leading-tight md:text-[17px]">{p.title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-dim">{p.description}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="shrink-0 font-pixel text-[9px] uppercase tracking-[0.16em] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-claude">
                  Abrir ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
