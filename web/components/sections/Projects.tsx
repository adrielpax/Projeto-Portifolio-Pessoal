import { archive, cases, projects, type CaseStudy, type Project } from "@/lib/content";

const monthYear = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "").replace(" de ", " ");

/** imagem do projeto, ou capa gerada (cor + nome do repositório) enquanto não há captura */
function Cover({ p }: { p: Project }) {
  if (p.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.image} alt={`Tela do projeto ${p.title}`} loading="lazy" className="h-full w-full object-cover object-top" />;
  }
  return (
    <div
      className="flex h-full w-full items-end p-4"
      style={{ background: `radial-gradient(120% 140% at 100% 0%, ${p.tint}66, transparent 60%), linear-gradient(160deg, #1e232b, #16191e)` }}
      role="img"
      aria-label={`Capa do projeto ${p.title}`}
    >
      <span className="font-mono text-[12px] text-white/60">{p.repo}</span>
    </div>
  );
}

function CaseCard({ c }: { c: CaseStudy }) {
  return (
    <article className="card-light reveal overflow-hidden md:col-span-2">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        {c.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image} alt="" loading="lazy" className="h-full max-h-[320px] w-full object-cover" />
        )}
        <div className="p-6 md:p-8">
          <span className="text-[13px] font-medium uppercase tracking-[0.04em] text-slate">{c.client}</span>
          <h3 className="mt-1 font-display text-[30px] font-semibold uppercase leading-none">{c.title}</h3>
          <p className="mt-3 font-display text-[28px] font-semibold leading-none text-safety">{c.result}</p>
          <dl className="mt-5 space-y-3 text-[15px] leading-snug">
            <div>
              <dt className="font-semibold">Problema</dt>
              <dd className="text-slate">{c.problem}</dd>
            </div>
            <div>
              <dt className="font-semibold">Solução</dt>
              <dd className="text-slate">{c.solution}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {c.stack.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <section id="sec-projects" className="relative pb-20 pt-24 md:pb-28 md:pt-32" aria-labelledby="projects-title">
      <div className="container-page">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="tag-safety">Projetos</span>
            <h2 id="projects-title" tabIndex={-1} className="mt-3 font-display text-[40px] font-semibold uppercase leading-[0.92] outline-none md:text-[58px]">
              O que já está no ar
            </h2>
          </div>
          <a
            href="https://github.com/adrielpax"
            target="_blank"
            rel="noreferrer"
            className="text-[15px] font-semibold text-steel underline decoration-2 underline-offset-4 hover:text-safety"
          >
            Ver tudo no GitHub
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {cases.map((c) => (
            <CaseCard key={c.title} c={c} />
          ))}
          {projects.map((p, i) => (
            <article key={p.repo} className="card-light reveal flex flex-col overflow-hidden" style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
              <div className="aspect-[16/9] w-full overflow-hidden">
                <Cover p={p} />
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-[26px] font-semibold uppercase leading-none">{p.title}</h3>
                  <span className="shrink-0 text-[13px] text-slate">{monthYear(p.pushed)}</span>
                </div>
                <p className="mt-2 text-[15px] leading-snug text-slate">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex gap-5 pt-5 text-[15px] font-semibold">
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noreferrer" className="text-safety hover:underline">
                      Ver site
                    </a>
                  )}
                  <a href={p.href} target="_blank" rel="noreferrer" className="text-graphite hover:underline">
                    Código
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <details className="reveal mt-10 border-t border-concrete-2 pt-5">
          <summary className="cursor-pointer text-[15px] font-semibold text-graphite">Outros repositórios ({archive.length})</summary>
          <ul className="mt-4 grid gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2">
            {archive.map((a) => (
              <li key={a.repo} className="flex justify-between gap-4 border-b border-concrete-2 py-2">
                <a href={`https://github.com/adrielpax/${a.repo}`} target="_blank" rel="noreferrer" className="hover:text-safety">
                  {a.note}
                </a>
                <span className="shrink-0 text-slate">{monthYear(a.pushed)}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
