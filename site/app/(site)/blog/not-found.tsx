import Link from "next/link";

export default function BlogNotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center">
      <span className="hud-label">Erro 404 · registro não encontrado</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-hud-text">
        Post não encontrado
      </h1>
      <p className="mt-1 text-sm text-hud-muted">
        Esse artigo pode ter sido movido ou ainda não foi publicado.
      </p>
      <Link
        href="/blog"
        className="mt-6 rounded-xl bg-hud-accent px-5 py-2.5 font-display text-sm font-semibold text-hud-bg transition-transform hover:scale-105"
      >
        Ver todos os posts
      </Link>
    </main>
  );
}
