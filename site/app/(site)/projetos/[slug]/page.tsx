import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github, Target, Wrench, TrendingUp } from "lucide-react";

import Reveal from "@/components/os/Reveal";
import StatusPill from "@/components/os/StatusPill";
import { getProject, getProjectSlugs, resolveImage } from "@/lib/sanity/data";
import { LINKS } from "@/lib/site";
import { isRemoteImage } from "@/lib/format";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return { title: "Projeto não encontrado" };

  const cover = resolveImage(p.image, 1200);
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/projetos/${p.slug}` },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      images: cover ? [{ url: cover, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function ProjectCasePage({ params }: Params) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();

  const cover = resolveImage(p.image, 1400);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://adrieldev.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    description: p.description,
    url: `${siteUrl}/projetos/${p.slug}`,
    author: { "@type": "Person", name: "Adriel Silva" },
    ...(p.link ? { sameAs: p.link } : {}),
  };

  const blocks = [
    { icon: Target, label: "O problema", text: p.problem },
    { icon: Wrench, label: "A solução", text: p.solution },
    { icon: TrendingUp, label: "O resultado", text: p.outcome },
  ].filter((b) => Boolean(b.text));

  return (
    <div className="px-5 py-10 md:px-12 lg:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/projetos"
        className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-hud-muted transition-colors hover:text-hud-text"
      >
        <ArrowLeft className="h-4 w-4" /> todos os projetos
      </Link>

      <div className="mx-auto max-w-4xl">
        <Reveal>
          <header className="mb-7">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusPill status={p.status} />
              {p.year && <span className="hud-label">{p.year}</span>}
            </div>

            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-hud-text md:text-5xl">
              {p.title}
            </h1>

            {p.role && (
              <p className="mt-2 font-display text-sm font-medium text-hud-steel">
                {p.role}
              </p>
            )}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-hud-muted md:text-base">
              {p.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-5 py-2.5 font-display text-sm font-semibold"
                >
                  Ver ao vivo <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {p.repo && (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost px-5 py-2.5 font-display text-sm font-medium"
                >
                  <Github className="h-4 w-4" /> Código
                </a>
              )}
            </div>
          </header>
        </Reveal>

        {cover && (
          <Reveal delay={0.05}>
            <div className="hud-brackets relative mb-9 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-hud-line bg-hud-surface shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
              <Image
                src={cover}
                alt={p.title}
                fill
                priority
                unoptimized={isRemoteImage(cover)}
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        {/* Métricas comprováveis */}
        {p.metrics && p.metrics.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mb-9 grid gap-3 sm:grid-cols-3">
              {p.metrics.map((m) => (
                <div key={m.label} className="hud-panel p-5 text-center">
                  <p className="font-display text-3xl font-bold text-hud-text">
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs text-hud-muted">{m.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Case: problema → solução → resultado */}
        <div className="space-y-5">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.06}>
              <section className="hud-panel p-6">
                <span className="hud-label mb-2.5 flex items-center gap-2">
                  <b.icon className="h-3.5 w-3.5 text-hud-detail" />
                  {b.label}
                </span>
                <p className="text-[15px] leading-7 text-hud-text/85">{b.text}</p>
              </section>
            </Reveal>
          ))}
        </div>

        {/* Stack */}
        {p.stack && p.stack.length > 0 && (
          <Reveal delay={0.1}>
            <section className="mt-9">
              <span className="hud-label mb-3 block">Tecnologias usadas</span>
              <div className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg border border-hud-line bg-white/5 px-3 py-1.5
                    font-mono text-xs text-hud-text transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* CTA */}
        <Reveal>
          <div className="hud-panel mt-12 flex flex-col items-center gap-2 p-8 text-center">
            <h2 className="font-display text-xl font-bold text-hud-text">
              Precisa de algo parecido?
            </h2>
            <p className="max-w-md text-sm text-hud-muted">
              Do MVP à produção — me conte o problema que você quer resolver.
            </p>
            <a
              href={LINKS.chat}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-3 px-6 py-3 font-display text-sm font-semibold"
            >
              Iniciar conversa <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
