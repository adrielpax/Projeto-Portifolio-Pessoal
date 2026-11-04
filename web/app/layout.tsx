import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "./globals.css";
import { profile, socials } from "@/lib/content";

const description = `${profile.headline} ${profile.sub}`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: { default: `${profile.name} | Automação, software e IA`, template: `%s | ${profile.name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_BR", url: profile.site, siteName: profile.name, title: profile.name, description },
  twitter: { card: "summary_large_image", title: profile.name, description },
};

/** dados estruturados: ajudam o Google a entender quem é a pessoa do site */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: profile.site,
  image: `${profile.site}${profile.avatar}`,
  address: { "@type": "PostalAddress", addressLocality: "Betim", addressRegion: "MG", addressCountry: "BR" },
  sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  knowsAbout: ["Automação de processos", "Agentes de IA", "n8n", "Next.js", "Node.js", "Automação industrial"],
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
