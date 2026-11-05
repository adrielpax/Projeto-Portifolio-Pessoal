import { cases } from "@/lib/content";

/** Projeto em destaque: estudo de caso real (problema → solução → resultado) */
export function Projects() {
  return (
    <section id="sec-projects" className="relative pb-20 pt-28 md:pb-28 md:pt-36" aria-labelledby="projects-title">
      <div className="container-page">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker-line">Projeto em destaque</span>
            <h2 id="projects-title" tabIndex={-1} className="mt-3 font-display text-[40px] font-semibold uppercase leading-[0.92] text-white outline-none md:text-[58px]">
              O que já está no ar
            </h2>
          </div>
          <a
            href="https://github.com/adrielpax"
            target="_blank"
            rel="noreferrer"
            className="text-[15px] font-semibold text-white/80 underline decoration-white/40 underline-offset-4 hover:text-white"
          >
            Ver tudo no GitHub
          </a>
        </div>

        {cases.map((c) => (
          <article key={c.title} className="reveal glass relative mt-10 grid overflow-hidden md:grid-cols-[0.9fr_1.1fr]">
            <div
              className="relative min-h-[260px] overflow-hidden"
              style={c.brand ? { background: `linear-gradient(90deg, ${c.brand[0]}, ${c.brand[1]})` } : undefined}
            >
              {c.image && (
                // o logo já vem com o degradê da marca; ocupa o painel inteiro
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={`Logo do ${c.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
            <div className="p-6 text-white md:p-10">
              <span className="text-[13px] font-medium uppercase tracking-[0.04em] text-white/55">
                {c.client}, {c.year}
              </span>
              <h3 className="mt-2 font-display text-[40px] font-semibold uppercase leading-none md:text-[52px]">{c.title}</h3>
              <p className="mt-1 text-[14px] text-white/60">{c.role}</p>
              <p className="mt-5 text-[19px] font-medium leading-snug">{c.result}</p>
              <dl className="mt-6 grid gap-4 text-[15px] leading-snug md:grid-cols-2">
                <div>
                  <dt className="font-semibold">Problema</dt>
                  <dd className="mt-1 text-white/65">{c.problem}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Solução</dt>
                  <dd className="mt-1 text-white/65">{c.solution}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {c.stack.map((t) => (
                  <span key={t} className="chip-glass">
                    {t}
                  </span>
                ))}
              </div>
              {c.link && (
                <a href={c.link} target="_blank" rel="noreferrer" className="para mt-7 inline-block bg-white px-6 py-2.5 text-[15px] font-semibold text-black hover:opacity-85">
                  Ver o Meu Barbeiro
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
