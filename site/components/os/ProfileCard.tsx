"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Download, Github, Linkedin, MapPin, MessageSquare, Share2 } from "lucide-react";

import Magnetic from "./Magnetic";
import { LINKS, SITE_URL } from "@/lib/site";

const PERFIL = {
  nome: "Adriel Silva",
  cargo: "Desenvolvedor Full-Stack · Automação & IA",
  pitch:
    "Do zero ao deploy: produto, código e automação — com IA onde ela gera resultado.",
  focos: ["SaaS", "Automação", "IA aplicada", "Next.js", "Node.js", "Python"],
  local: "Betim, MG · Brasil",
  site: SITE_URL,
  github: LINKS.github,
  linkedin: LINKS.linkedin,
  contato: LINKS.chat,
};

/** vCard 3.0 — permite salvar o contato direto na agenda do celular. */
function montarVCard() {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:Silva;Adriel;;;`,
    `FN:${PERFIL.nome}`,
    `TITLE:${PERFIL.cargo}`,
    `ADR;TYPE=WORK:;;Betim;MG;;;Brasil`,
    `URL:${PERFIL.site}`,
    `X-SOCIALPROFILE;TYPE=github:${PERFIL.github}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${PERFIL.linkedin}`,
    "END:VCARD",
  ].join("\r\n");
}

export default function ProfileCard() {
  const [salvo, setSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const salvarContato = () => {
    const blob = new Blob([montarVCard()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "adriel-silva.vcf";
    a.click();
    URL.revokeObjectURL(url);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const compartilhar = async () => {
    // URL atual — carrega o token ?modo=leitura quando o modo está ativo.
    const url = window.location.href;
    const dados = {
      title: PERFIL.nome,
      text: `${PERFIL.nome} — ${PERFIL.cargo}`,
      url,
    };
    // Share nativo no celular; nos desktops, copia o link.
    if (navigator.share) {
      try {
        await navigator.share(dados);
        return;
      } catch {
        return; // usuário cancelou
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="hud-panel hud-brackets overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        {/* Foto */}
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-1 ring-hud-line shadow-[0_12px_30px_rgba(0,0,0,0.5)] sm:h-32 sm:w-32">
            <Image
              src="/images/profile.png"
              alt="Adriel Silva"
              fill
              priority
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover object-top"
            />
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 rounded-[4px] border border-hud-surface bg-emerald-500 px-2 py-1 shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-white">
              disponível
            </span>
          </span>
        </div>

        {/* Identidade */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="hud-label">Cartão de visitas</p>
          <h2 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight text-hud-text sm:text-3xl">
            {PERFIL.nome}
          </h2>
          <p className="mt-1 text-sm font-medium text-hud-steel">
            {PERFIL.cargo}
          </p>
          <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-hud-muted sm:justify-start">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {PERFIL.local}
          </p>

          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-hud-text/80">
            {PERFIL.pitch}
          </p>

          {/* Focos — leitura rápida para quem recruta */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {PERFIL.focos.map((f) => (
              <span
                key={f}
                className="rounded-md border border-hud-line bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-hud-steel"
              >
                {f}
              </span>
            ))}
          </div>

          {/* Ações — alvos grandes para o toque */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Magnetic className="col-span-2">
              <a
                href={PERFIL.contato}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary min-h-11 w-full px-5 font-display text-sm font-semibold sm:w-auto"
              >
                <MessageSquare className="h-4 w-4" /> Falar comigo
              </a>
            </Magnetic>

            <button
              onClick={salvarContato}
              className="btn-ghost min-h-11 px-4 font-display text-xs font-medium"
            >
              {salvo ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" /> Salvo
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Salvar contato
                </>
              )}
            </button>

            <button
              onClick={compartilhar}
              className="btn-ghost min-h-11 px-4 font-display text-xs font-medium"
            >
              {copiado ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" /> Link copiado
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Compartilhar
                </>
              )}
            </button>

            <a
              href={PERFIL.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="btn-ghost min-h-11 text-hud-muted hover:text-hud-text sm:w-11"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={PERFIL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="btn-ghost min-h-11 text-hud-muted hover:text-hud-text sm:w-11"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
