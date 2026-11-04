import { posts } from "@/lib/content";

const fmt = (d: string) => {
  const [y, m, day] = d.split(".").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
};

export function Blog() {
  return (
    <section className="sec sec-blog frame-inset invisible opacity-0" aria-labelledby="blog-title">
      <div className="flex h-full flex-col overflow-hidden p-5 md:p-10 lg:grid lg:grid-cols-[minmax(240px,0.7fr)_2fr] lg:gap-14">
        <div>
          <h2 id="blog-title" tabIndex={-1} className="display outline-none">
            Blog
          </h2>
          <p className="mt-5 hidden max-w-[30ch] text-[17px] leading-snug text-dim sm:block">
            O que aprendo construindo: IA no dia a dia, automação e arquitetura.
          </p>
        </div>
        <ol className="mt-6 flex flex-col gap-3 self-center lg:mt-0">
          {posts.map((p) => (
            <li key={p.title}>
              <a href={p.href} className="glass glass-sm glass-hover group relative block px-6 py-5 md:px-7 md:py-6">
                <span className="block text-[20px] font-medium leading-tight transition-opacity group-hover:opacity-60 md:text-[28px]">
                  {p.title}
                </span>
                <span className="mt-2 block text-[14px] text-dim">
                  {fmt(p.date)}, {p.read} de leitura
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
