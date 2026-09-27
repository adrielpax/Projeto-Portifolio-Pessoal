import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import Reveal from "@/components/os/Reveal";
import { getCertifications, resolveImage } from "@/lib/sanity/data";

export const metadata: Metadata = {
  title: "Certificações",
  description:
    "Certificações técnicas e oficiais de Adriel Silva — conhecimentos validados em ferramentas e tecnologias.",
  alternates: { canonical: "/certificacoes" },
};

export default async function CertificacoesPage() {
  const certs = await getCertifications();

  return (
    <div className="px-5 py-10 md:px-12 lg:px-16">
      <Reveal>
        <header className="mb-8">
          <span className="hud-label flex items-center gap-2">
            <span className="text-hud-detail">CRT</span>
            <span className="h-px w-8 bg-hud-line" /> Credenciais
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-hud-text md:text-4xl">
            Certificações
          </h1>
          <p className="mt-1 max-w-xl text-sm text-hud-muted">
            Conhecimento validado — e aplicado em projeto real.
          </p>
        </header>
      </Reveal>

      {certs.length === 0 ? (
        <p className="py-16 text-center text-sm text-hud-muted">
          Nenhuma certificação cadastrada ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((c, i) => {
            const logo = resolveImage(c.logo, 140);
            return (
              <Reveal key={c._id} delay={i * 0.05}>
                <div className="card-glass flex items-start gap-4 rounded-2xl p-4">
                  {logo && (
                    <Image
                      src={logo}
                      alt={c.title}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-hud-line"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {c.issuer && (
                      <span className="hud-label !text-hud-accent">{c.issuer}</span>
                    )}
                    <h3 className="font-display text-sm font-semibold leading-snug text-hud-text">
                      {c.title}
                    </h3>
                    {c.credentialUrl && (
                      <Link
                        href={c.credentialUrl}
                        target="_blank"
                        className="mt-2 inline-flex items-center gap-1 font-display text-xs font-medium text-hud-accent hover:underline"
                      >
                        <BadgeCheck className="h-3.5 w-3.5" /> Ver certificado
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
