import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getPost, getPostSlugs, resolveImage } from "@/lib/sanity/data";
import { formatDate } from "@/lib/format";
import PortableBody from "@/components/blog/PortableBody";
import { LINKS, SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post não encontrado" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || "";
  const cover = resolveImage(post.coverImage, 1200);

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt,
      url: `/blog/${post.slug}`,
      images: cover ? [{ url: cover, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const cover = resolveImage(post.coverImage, 1200);
  const siteUrl = SITE_URL;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: cover ? [cover] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: "Adriel Silva", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="mb-5 inline-flex items-center gap-1.5 font-mono text-xs text-hud-muted
        transition-colors hover:text-hud-text"
      >
        <ArrowLeft className="h-4 w-4" /> voltar ao blog
      </Link>

      <article>
        <header className="mb-6">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags?.map((t) => (
              <span
                key={t}
                className="rounded-md border border-hud-line px-2 py-0.5 font-mono text-[10px] text-hud-steel"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-hud-text sm:text-4xl">
            {post.title}
          </h1>
          <p className="hud-label mt-3">
            {formatDate(post.publishedAt)} · por Adriel Silva
          </p>
        </header>

        {cover && (
          <div className="hud-brackets relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-hud-line bg-hud-surface-2">
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {post.body && post.body.length > 0 ? (
          <PortableBody value={post.body} />
        ) : (
          <p className="text-sm text-hud-muted">{post.excerpt}</p>
        )}
      </article>

      {/* CTA de contato no fim do post */}
      <div className="hud-brackets mt-12 rounded-2xl border border-hud-line bg-gradient-to-tr from-hud-surface to-hud-bg p-6 text-center">
        <span className="hud-label">Módulo de contato</span>
        <p className="mt-2 font-display text-lg font-bold text-hud-text">
          Gostou do conteúdo?
        </p>
        <p className="mt-1 text-xs text-hud-muted">Vamos construir algo juntos.</p>
        <a
          href={LINKS.chat}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-hud-accent px-6 py-2.5 font-display text-xs font-semibold text-hud-bg transition-transform hover:scale-105"
        >
          Entrar em contato
        </a>
      </div>
    </main>
  );
}
