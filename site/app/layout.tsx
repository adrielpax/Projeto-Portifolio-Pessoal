import type { Metadata } from "next";
import { Heebo, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const heeboSans = Heebo({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adriel | Analista e Desenvolvedor de Soluções em Technologia",
  description: "Desenvolvimento / analise e administração de Sistemas para soluções em technologia e Automação",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={cn("font-sans", inter.variable)}>
      <body
        className={`${heeboSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
        
        {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
