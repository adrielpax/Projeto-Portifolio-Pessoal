import { posts } from "@/lib/content";
import { Scramble } from "@/components/experience/Scramble";

export function Blog({ active }: { active: boolean }) {
  return (
    <section className="sec sec-blog frame-inset invisible opacity-0" aria-labelledby="blog-title">
      <div className="flex h-full flex-col gap-5 overflow-hidden p-4 md:p-8 lg:grid lg:grid-cols-[minmax(240px,0.75fr)_2fr] lg:gap-10">
        <header className="flex flex-col">
          <div className="reveal kicker">03 // notas de campo</div>
          <h2 id="blog-title" className="reveal display mt-3">
            <Scramble text="Blog" play={active} />
          </h2>
          <p className="reveal mt-4 hidden max-w-[34ch] text-[13px] leading-relaxed text-dim sm:block">
            Escrevo sobre o que construo: IA no fluxo de trabalho, automação e arquitetura de sistemas.
          </p>
          <a href="#" className="reveal btn-line mt-6 hidden self-start sm:inline-flex">
            Todos os posts →
          </a>
        </header>
        <ol className="self-center border-t border-white/10 lg:w-full">
          {posts.map((p, i) => (
            <li key={p.title} className="reveal">
              <a
                href={p.href}
                className="post-row group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-white/10 px-1 py-3.5 transition-colors duration-200 hover:bg-paper hover:text-ink md:grid-cols-[110px_1fr_auto] md:px-3 md:py-6"
              >
                <span className="col-span-2 font-pixel text-[9px] uppercase tracking-[0.16em] text-dim group-hover:text-ink/60 md:col-span-1">
                  {String(i + 1).padStart(2, "0")} · {p.date}
                </span>
                <span>
                  <span className="block text-[14px] leading-snug sm:text-[15px] md:text-[19px]">{p.title}</span>
                  <span className="mt-2 flex gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="tag group-hover:border-ink/30 group-hover:text-ink/70">
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="font-pixel text-[9px] uppercase tracking-[0.16em] transition-transform group-hover:translate-x-1">
                  {p.read} →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
