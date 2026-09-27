import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";

import Reveal from "@/components/os/Reveal";
import Spotlight from "@/components/os/Spotlight";
import StatusPill from "@/components/os/StatusPill";
import { getProjects, resolveImage } from "@/lib/sanity/data";
import { isRemoteImage } from "@/lib/format";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Portfólio de projetos e sistemas construídos por Adriel Silva — SaaS, e-commerce, automações e MVPs em produção.",
  alternates: { canonical: "/projetos" },
};

export default async function ProjetosPage() {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const live = projects.filter((p) => p.link).length;

  return (
    <div className="px-5 py-10 md:px-12 lg:px-16">
      <Reveal>
        <header className="mb-9">
          <span className="hud-label flex items-center gap-2">
            <span className="text-hud-detail">PRJ</span>
            <span className="h-px w-8 bg-hud-line" /> Dossiê de operações
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-hud-text md:text-4xl">
            Projetos
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-hud-muted">
            {projects.length} projetos — {live} em produção para você abrir e
            testar. Cada um com o problema real que resolvia e como foi resolvido.
          </p>
        </header>
      </Reveal>

      {/* ── Operações principais: fichas em vitrine alternada ── */}
      {featured.length > 0 && (
        <section className="mb-12 space-y-6">
          <span className="hud-label block">Principais</span>
          {featured.map((p, i) => {
            const img = resolveImage(p.image, 1000);
            const caseHref = p.slug ? `/projetos/${p.slug}` : (p.link ?? "#");
            return (
              <Reveal key={p._id} delay={i * 0.05}>
                <Spotlight className="rounded-lg">
                  <article className="card-glass grid overflow-hidden md:grid-cols-2">
                    <Link
                      href={caseHref}
                      className={`group relative block aspect-[16/10] overflow-hidden bg-hud-surface-2 md:aspect-auto md:min-h-[300px] ${
                        i % 2 === 1 ? "md:order-2" : ""
                      }`}
                    >
                      {img && (
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          unoptimized={isRemoteImage(img)}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute left-3 top-3">
                        <StatusPill status={p.status} compact />
                      </div>
                    </Link>

                    <div className="flex flex-col p-6 md:p-8">
                      <span className="hud-label">{p.year ?? "—"}</span>
                      <h2 className="mt-2 font-display text-xl font-bold leading-snug text-hud-text md:text-2xl">
                        {p.title}
                      </h2>
                      {p.role && (
                        <p className="mt-1 text-xs font-medium text-hud-steel">
                          {p.role}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-relaxed text-hud-muted">
                        {p.description}
                      </p>

                      {p.problem && (
                        <p className="mt-4 border-l-2 border-hud-detail/50 pl-3 text-xs leading-relaxed text-hud-muted">
                          <span className="font-mono font-semibold text-hud-detail">
                            ALVO ·{" "}
                          </span>
                          {p.problem}
                        </p>
                      )}

                      {p.stack && p.stack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {p.stack.map((s) => (
                            <span
                              key={s}
                              className="rounded-md border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-steel"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-2.5 pt-1">
                        {p.slug && (
                          <Link
                            href={`/projetos/${p.slug}`}
                            className="btn-primary px-4 py-2 font-display text-xs font-semibold"
                          >
                            Ver o case <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost px-4 py-2 font-display text-xs font-medium"
                          >
                            Ver ao vivo <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Spotlight>
              </Reveal>
            );
          })}
        </section>
      )}

      {/* ── Demais operações: registro tático em linhas ── */}
      {rest.length > 0 && (
        <section>
          <span className="hud-label mb-3 block">Outros projetos</span>
          <Reveal>
            <div className="hud-panel divide-y divide-hud-line/70 overflow-hidden">
              {rest.map((p, i) => {
                const href = p.slug ? `/projetos/${p.slug}` : (p.link ?? "#");
                const external = !p.slug && Boolean(p.link);
                return (
                  <Link
                    key={p._id}
                    href={href}
                    target={external ? "_blank" : undefined}
                    className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.04] md:grid-cols-[2.25rem_1fr_auto_auto] md:gap-5"
                  >
                    <span className="font-mono text-xs font-semibold text-hud-detail">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <h3 className="truncate font-display text-sm font-semibold text-hud-text transition-colors group-hover:text-hud-accent-2">
                        {p.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-hud-muted">
                        {p.description}
                      </p>
                    </span>
                    <span className="hidden shrink-0 gap-1.5 md:flex">
                      {p.stack?.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-steel"
                        >
                          {s}
                        </span>
                      ))}
                    </span>
                    <span className="flex shrink-0 items-center gap-2.5">
                      <span className="hidden sm:inline-flex">
                        <StatusPill status={p.status} compact />
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-hud-muted transition-all group-hover:translate-x-0.5 group-hover:text-hud-text" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
