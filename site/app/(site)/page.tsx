import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";

import VideoHero from "@/components/os/VideoHero";
import Reveal from "@/components/os/Reveal";
import Spotlight from "@/components/os/Spotlight";
import AvailabilityCard from "@/components/os/AvailabilityCard";
import ContactModule from "@/components/os/ContactModule";
import SystemPanel from "@/components/os/SystemPanel";
import SkillsPanel from "@/components/os/SkillsPanel";
import ProjectCard from "@/components/os/ProjectCard";
import ProfileCard from "@/components/os/ProfileCard";
import {
  getProjects,
  getPosts,
  getTestimonials,
  getCertifications,
  resolveImage,
} from "@/lib/sanity/data";
import { formatDate } from "@/lib/format";

/** Como o trabalho acontece — pipeline honesto, sem caixa-preta. */
const PIPELINE = [
  {
    numero: "01 · DESCOBERTA",
    titulo: "Entender antes de codar",
    texto:
      "Mapeio o problema, o contexto do negócio e o que 'pronto' significa. Saída: escopo claro e um plano de ataque.",
  },
  {
    numero: "02 · CONSTRUÇÃO",
    titulo: "Ciclos curtos, entregas reais",
    texto:
      "Versões navegáveis desde as primeiras semanas — você acompanha o produto crescendo, não espera uma revelação no final.",
  },
  {
    numero: "03 · OPERAÇÃO",
    titulo: "Produção é o começo",
    texto:
      "Deploy, monitoramento e iteração contínua. Automação e IA entram onde geram resultado que dá para medir.",
  },
] as const;

export default async function Home() {
  const [projects, posts, testimonials, certs] = await Promise.all([
    getProjects(),
    getPosts(),
    getTestimonials(),
    getCertifications(),
  ]);

  const featured = projects.filter((p) => p.featured);
  const rail = featured.length > 0 ? featured : projects.slice(0, 3);

  // ── Dados do painel — derivados do conteúdo real, nunca hardcoded ──
  const stackCount = new Map<string, number>();
  for (const p of projects)
    for (const s of p.stack ?? [])
      stackCount.set(s, (stackCount.get(s) ?? 0) + 1);
  const stackData = [...stackCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  // Paleta de status validada para CVD/contraste (dataviz validator)
  const STATUS_META = [
    { key: "producao", label: "Em produção", color: "#059669" },
    { key: "desenvolvimento", label: "Em desenvolvimento", color: "#6366f1" },
    { key: "concluido", label: "Concluído", color: "#d97706" },
    { key: "arquivado", label: "Arquivado", color: "#8b96a8" },
  ] as const;
  const statusData = STATUS_META.map((m) => ({
    label: m.label,
    color: m.color,
    count: projects.filter((p) => (p.status ?? "producao") === m.key).length,
  })).filter((s) => s.count > 0);

  const stackTotal = new Set(projects.flatMap((p) => p.stack ?? [])).size;

  return (
    <div className="pb-20">
      <VideoHero
        stats={{
          projetos: projects.length,
          live: projects.filter((p) => Boolean(p.link)).length,
          stack: stackTotal,
          certs: certs.length,
        }}
      />

      <div className="space-y-10 px-4 py-8 sm:px-5 md:space-y-14 md:px-12 md:py-12 lg:px-16">
        {/* ── Bloco de identidade: cartão + disponibilidade ── */}
        <section className="grid gap-4 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <ProfileCard />
          </Reveal>
          <Reveal delay={0.06} className="h-full">
            <AvailabilityCard />
          </Reveal>
        </section>

        {/* ── Projetos em destaque ── */}
        <section>
          <Reveal>
            <SectionHeader
              code="PRJ"
              title="Projetos em produção"
              subtitle="Produtos reais em produção — abra e teste você mesmo."
              href="/projetos"
              linkLabel="Ver todos"
            />
          </Reveal>

          {/* O primeiro destaque ocupa a largura de dois cards — vitrine. */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rail.map((p, i) => (
              <Reveal
                key={p._id}
                delay={(i % 3) * 0.06}
                className={i === 0 ? "sm:col-span-2" : undefined}
              >
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Stack técnica (colapsável) ── */}
        <section>
          <Reveal>
            <SkillsPanel />
          </Reveal>
        </section>

        {/* ── Painel de dados do sistema ── */}
        <section id="painel" className="scroll-mt-20">
          <Reveal>
            <SectionHeader
              code="DAT"
              title="Painel do sistema"
              subtitle="O portfólio em números — derivados do conteúdo real."
              href="/projetos"
              linkLabel="Ver projetos"
            />
          </Reveal>
          <Reveal delay={0.06}>
            <SystemPanel
              stack={stackData}
              status={statusData}
              total={projects.length}
            />
          </Reveal>
        </section>

        {/* ── Pipeline: como o trabalho acontece ── */}
        <section>
          <Reveal>
            <SectionHeader
              code="OPS"
              title="Como eu opero"
              subtitle="Do problema ao sistema em produção — sem caixa-preta."
              href="/projetos"
              linkLabel="Ver na prática"
            />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {PIPELINE.map((etapa, i) => (
              <Reveal key={etapa.numero} delay={i * 0.06}>
                <div className="hud-panel h-full p-5">
                  <span className="font-mono text-xs font-semibold text-hud-detail">
                    {etapa.numero}
                  </span>
                  <h3 className="mt-2 font-display text-base font-semibold text-hud-text">
                    {etapa.titulo}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-hud-muted">
                    {etapa.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Depoimentos (só aparece com conteúdo real) ── */}
        {testimonials.length > 0 && (
          <section>
            <Reveal>
              <SectionHeader
                code="REF"
                title="O que dizem"
                subtitle="Resultados na voz de quem contratou."
                href="/projetos"
                linkLabel="Ver projetos"
              />
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.map((t, i) => {
                const avatar = resolveImage(t.avatar, 120);
                return (
                  <Reveal key={t._id} delay={i * 0.06}>
                    <figure className="hud-panel h-full p-6">
                      <Quote className="h-5 w-5 text-hud-steel" />
                      <blockquote className="mt-3 text-sm leading-relaxed text-hud-text/85">
                        {t.quote}
                      </blockquote>
                      <figcaption className="mt-4 flex items-center gap-3">
                        {avatar && (
                          <Image
                            src={avatar}
                            alt={t.author}
                            width={36}
                            height={36}
                            unoptimized
                            className="h-9 w-9 rounded-full object-cover ring-1 ring-hud-line"
                          />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-display text-sm font-semibold text-hud-text">
                            {t.author}
                          </span>
                          {t.role && (
                            <span className="block truncate text-xs text-hud-muted">
                              {t.role}
                            </span>
                          )}
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Blog ── */}
        {posts.length > 0 && (
          <section>
            <Reveal>
              <SectionHeader
                code="LOG"
                title="Do blog"
                subtitle="Decisões técnicas, IA e o que aprendo construindo produtos."
                href="/blog"
                linkLabel="Todos os posts"
              />
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post, i) => {
                const cover = resolveImage(post.coverImage, 720);
                return (
                  <Reveal key={post._id} delay={i * 0.06}>
                    <Spotlight className="h-full rounded-2xl">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="card-glass group flex h-full flex-col overflow-hidden rounded-2xl"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-hud-surface-2">
                        {cover && (
                          <Image
                            src={cover}
                            alt={post.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {post.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded-md border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-steel"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-display text-[15px] font-semibold leading-snug text-hud-text">
                          {post.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-hud-muted">
                          {post.excerpt}
                        </p>
                        <span className="hud-label mt-auto pt-3">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                    </Link>
                    </Spotlight>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Módulo de contato (mensagem em tempo real) ── */}
        <Reveal>
          <ContactModule />
        </Reveal>
      </div>
    </div>
  );
}

function SectionHeader({
  code,
  title,
  subtitle,
  href,
  linkLabel,
}: {
  code: string;
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2.5">
      <div className="min-w-0">
        <span className="hud-label flex items-center gap-2">
          <span className="text-hud-detail">{code}</span>
          <span className="h-px w-6 bg-hud-line" />
        </span>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-hud-text">
          {title}
        </h2>
        <p className="text-sm text-hud-muted">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="link-neon ml-auto flex shrink-0 items-center gap-1 font-display text-xs font-medium text-hud-text transition-transform hover:translate-x-0.5"
      >
        {linkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
