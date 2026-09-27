import { createClient } from "next-sanity";
import { apiVersion, dataset, safeProjectId } from "@/sanity/env";

export const client = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: true, // CDN do Sanity = rápido e dentro do plano grátis
});
