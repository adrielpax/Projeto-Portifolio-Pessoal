import { projects } from "@/lib/content";

export function Projects() {
  return (
    <section className="sec sec-projects frame-inset invisible opacity-0" aria-labelledby="projects-title">
      <div className="flex h-full flex-col overflow-hidden p-5 md:p-10">
        <div className="flex items-end justify-between gap-6">
          <h2 id="projects-title" className="display">
            Projetos
          </h2>
          <a href="https://github.com/adrielpax" target="_blank" rel="noreferrer" className="btn-line mb-2 hidden sm:inline-flex">
            Ver tudo no GitHub
          </a>
        </div>

        <div className="projects-grid -mx-5 mt-6 flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:mt-8 md:gap-5">
          {projects.map((p) => (
            <a
              key={p.code}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="glass glass-hover group relative flex min-w-[80vw] snap-start flex-col p-6 sm:min-w-0 md:p-7"
            >
              <span className="text-[14px] text-dim">
                {p.status}, {p.year}
              </span>
              <h3 className="mt-3 font-pixel text-[28px] font-semibold leading-none md:text-[36px]">{p.title}</h3>
              <p className="mt-3 max-w-[44ch] text-[15px] leading-snug text-dim md:text-[16px]">{p.description}</p>
              <span className="mt-auto pt-5 text-[14px] text-paper/70">{p.tags.join(", ")}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
