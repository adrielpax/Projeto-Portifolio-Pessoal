import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/sanity/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Case studies — as páginas que mais importam para quem busca o trabalho.
  const projectUrls: MetadataRoute.Sitemap = projects
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/projetos/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projetos`, changeFrequency: "monthly", priority: 0.9 },
    ...projectUrls,
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...postUrls,
    { url: `${SITE_URL}/certificacoes`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/jogo`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
