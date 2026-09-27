export function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Imagens do Sanity já chegam redimensionadas pelo CDN deles; só as locais
 * (fallback em /public) precisam passar pelo otimizador do Next.
 */
export function isRemoteImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}
