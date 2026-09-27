import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Reveal from "@/components/os/Reveal";
import Spotlight from "@/components/os/Spotlight";
import { getPosts, resolveImage } from "@/lib/sanity/data";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos sobre desenvolvimento full-stack, Next.js, automação e IA aplicada por Adriel Silva.",
  alternates: { canonical: "/blog" },
};

function filterPosts(posts: Post[], q?: string) {
  if (!q) return posts;
  const t = q.toLowerCase();
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(t) ||
      p.excerpt?.toLowerCase().includes(t) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(t)),
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const all = await getPosts();
  const posts = filterPosts(all, q);

  // Sem busca ativa, o registro mais recente vira o destaque do log.
  const destaque = !q && posts.length > 0 ? posts[0] : null;
  const registros = destaque ? posts.slice(1) : posts;
  const cover = destaque ? resolveImage(destaque.coverImage, 1000) : null;

  return (
    <div className="px-5 py-10 md:px-12 lg:px-16">
      <Reveal>
        <header className="mb-8">
          <span className="hud-label flex items-center gap-2">
            <span className="text-hud-detail">LOG</span>
            <span className="h-px w-8 bg-hud-line" /> Registro do sistema
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-hud-text md:text-4xl">
            Blog
          </h1>
          <p className="mt-1 max-w-xl text-sm text-hud-muted">
            {q ? (
              <>
                Resultados para <span className="text-hud-accent-2">“{q}”</span> ·{" "}
                {posts.length} {posts.length === 1 ? "registro" : "registros"}
              </>
            ) : (
              "Decisões técnicas, IA e o que aprendo construindo produtos."
            )}
          </p>
        </header>
      </Reveal>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-hud-muted">
          Nenhum registro encontrado{q ? ` para “${q}”` : ""}.{" "}
          <Link href="/blog" className="text-hud-accent-2 hover:underline">
            Ver todos
          </Link>
        </p>
      ) : (
        <>
          {/* Registro em destaque — o mais recente */}
          {destaque && (
            <Reveal>
              <Spotlight className="mb-6 rounded-lg">
                <Link
                  href={`/blog/${destaque.slug}`}
                  className="card-glass group grid overflow-hidden md:grid-cols-2"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-hud-surface-2 md:aspect-auto md:min-h-[260px]">
                    {cover && (
                      <Image
                        src={cover}
                        alt={destaque.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
                    <span className="hud-label text-hud-detail">
                      Último registro · {formatDate(destaque.publishedAt)}
                    </span>
                    <h2 className="font-display text-xl font-bold leading-snug text-hud-text md:text-2xl">
                      {destaque.title}
                    </h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-hud-muted">
                      {destaque.excerpt}
                    </p>
                    {destaque.tags && destaque.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {destaque.tags.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-steel"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-hud-accent-2">
                      ler registro <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Spotlight>
            </Reveal>
          )}

          {/* Log — linhas de registro */}
          {registros.length > 0 && (
            <Reveal delay={0.06}>
              <div className="hud-panel divide-y divide-hud-line/70 overflow-hidden">
                {registros.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group grid gap-1 px-5 py-4 transition-colors hover:bg-white/[0.04] sm:grid-cols-[8.5rem_1fr_auto] sm:items-center sm:gap-4"
                  >
                    <time className="font-mono text-[11px] text-hud-detail">
                      {formatDate(post.publishedAt)}
                    </time>
                    <span className="min-w-0">
                      <h2 className="truncate font-display text-sm font-semibold text-hud-text transition-colors group-hover:text-hud-accent-2">
                        {post.title}
                      </h2>
                      <p className="mt-0.5 line-clamp-1 text-xs text-hud-muted">
                        {post.excerpt}
                      </p>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                      {post.tags?.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-steel"
                        >
                          {t}
                        </span>
                      ))}
                      <ArrowUpRight className="h-3.5 w-3.5 text-hud-muted transition-all group-hover:translate-x-0.5 group-hover:text-hud-text" />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </>
      )}
    </div>
  );
}
