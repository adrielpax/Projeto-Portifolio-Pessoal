/**
 * Dados do site num lugar só — domínio e canais de contato.
 *
 * Atenção: "adriel.dev" pertence a outra pessoa. Use NEXT_PUBLIC_SITE_URL
 * apenas com um domínio seu; sem ela, vale o deploy da Vercel.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://adrieldev.vercel.app"
).replace(/\/$/, "");

export const LINKS = {
  chat: "https://typebot.co/my-typebot-75c4uvl",
  github: "https://github.com/adrielpax",
  linkedin: "https://linkedin.com/in/adriel-lucas",
} as const;
