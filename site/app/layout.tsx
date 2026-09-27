import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Chakra_Petch } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Display/HUD — angular, "tático", identidade de console
const chakra = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = SITE_URL;

export const viewport: Viewport = {
  themeColor: "#0a0e17",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Adriel Silva — Desenvolvedor Full-Stack & Automação",
    template: "%s | Adriel Silva",
  },
  description:
    "Desenvolvedor full-stack especializado em SaaS, automações e IA aplicada. Projetos em produção, case studies e bastidores técnicos.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Adriel Silva",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={cn(inter.variable, chakra.variable, geistMono.variable, "dark")}
    >
      <body className="font-sans antialiased">
        {/* Aplica o Modo Leitura antes da pintura (token ?modo=leitura na URL
            ou preferência salva) — evita flash de tema errado. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var q=new URLSearchParams(location.search).get("modo");var s=localStorage.getItem("modo-leitura");if(q==="leitura"||(q!=="sistema"&&s==="1")){document.documentElement.classList.add("modo-leitura")}}catch(e){}',
          }}
        />
        {children}
      </body>
    </html>
  );
}
