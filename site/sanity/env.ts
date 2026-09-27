/**
 * Configuração de ambiente do Sanity.
 *
 * Enquanto NEXT_PUBLIC_SANITY_PROJECT_ID não estiver preenchido, o site roda
 * com dados de exemplo (fallback). Assim que você criar o projeto grátis em
 * https://sanity.io/manage e preencher o .env.local, tudo passa a vir do CMS.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** true quando há um projeto Sanity real configurado. */
export const hasSanity = projectId.length > 0;

/** projectId seguro para instanciar o client mesmo sem config (placeholder). */
export const safeProjectId = projectId || "placeholder-project";
