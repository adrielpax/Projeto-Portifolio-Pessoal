import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: profile.site, changeFrequency: "monthly", priority: 1 },
    { url: `${profile.site}/links`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
