import path from "node:path";
import type { NextConfig } from "next";

// Fixa a raiz do projeto: há um yarn.lock solto em C:\Users\playe que faz o
// Next adivinhar a pasta errada como workspace.
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
