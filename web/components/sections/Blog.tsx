import { archive, projects } from "@/lib/content";
import { SectionHeader, monthYear } from "./SectionHeader";

/** registro real de atividade: repositórios públicos ordenados pelo último push */
const rows = [
  ...projects.map((p) => ({ repo: p.repo, pushed: p.pushed, language: p.language, note: p.description, href: p.href, live: Boolean(p.demo) })),
  ...archive.map((a) => ({ ...a, href: `https://github.com/adrielpax/${a.repo}`, live: false })),
].sort((a, b) => b.pushed.localeCompare(a.pushed));

export function Blog() {
  return (
    <section className="sec sec-blog frame-inset invisible opacity-0" aria-labelledby="blog-title">
      <div className="flex h-full flex-col overflow-hidden p-4 md:px-8 md:pb-6 md:pt-5">
        <SectionHeader
          code="Tela 03"
          title="Log de atividade"
          id="blog-title"
          meta={
            <>
              {rows.length} repositórios públicos
              <br />
              fonte: GitHub
            </>
          }
        />
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">Repositórios públicos ordenados pelo último push</caption>
            <thead className="sticky top-0 bg-black/60 text-[11px] uppercase tracking-[0.06em] text-dim backdrop-blur">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">Último push</th>
                <th scope="col" className="py-2 pr-4 font-medium">Repositório</th>
                <th scope="col" className="hidden py-2 pr-4 font-medium md:table-cell">Linguagem</th>
                <th scope="col" className="hidden py-2 pr-4 font-medium lg:table-cell">Descrição</th>
                <th scope="col" className="py-2 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.repo} className="border-t border-white/8 transition-colors hover:bg-white/[0.04]">
                  <td className="py-2.5 pr-4 text-dim tabular-nums">{monthYear(r.pushed)}</td>
                  <td className="py-2.5 pr-4">
                    <a href={r.href} target="_blank" rel="noreferrer" className="font-mono text-[12.5px] hover:underline">
                      {r.repo}
                    </a>
                  </td>
                  <td className="hidden py-2.5 pr-4 text-paper/75 md:table-cell">{r.language}</td>
                  <td className="hidden max-w-[44ch] truncate py-2.5 pr-4 text-paper/65 lg:table-cell">{r.note}</td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex items-center gap-1.5 text-[12px]">
                      <span className="led" style={{ ["--led" as string]: r.live ? "#3ddc84" : "rgba(255,255,255,0.25)", ["--glow" as string]: r.live ? "1" : "0" }} aria-hidden />
                      {r.live ? "No ar" : "Código"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
