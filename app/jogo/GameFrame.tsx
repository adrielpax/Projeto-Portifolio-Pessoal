"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Maximize2, Monitor } from "lucide-react";

const JOGO_URL = "/games/terra/index.html";
const POST_URL = "/blog/opus-5-5-criou-jogo-estilo-terraria";

/** O jogo pede teclado e mouse: em telas de toque só avisamos. */
const SEM_TECLADO = "(pointer: coarse) and (hover: none)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(SEM_TECLADO);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export default function GameFrame() {
  const frame = useRef<HTMLIFrameElement>(null);
  const toque = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(SEM_TECLADO).matches,
    () => false,
  );

  // O iframe precisa do foco para receber o teclado (A/D, Espaço, E…).
  const focarJogo = () => frame.current?.contentWindow?.focus();

  const telaCheia = () => {
    frame.current?.requestFullscreen?.().then(focarJogo).catch(() => {});
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#07060c] text-[#e8e2f5]">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-[#0e0a1c] px-3 font-mono text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[#b8b0d0] transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Portfólio</span>
        </Link>

        <span className="truncate font-semibold tracking-[0.2em] text-[#f5d76e]">
          PROJETO TERRA
        </span>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={POST_URL}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[#b8b0d0] transition-colors hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Como foi feito</span>
          </Link>
          {!toque && (
            <button
              onClick={telaCheia}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[#b8b0d0] transition-colors hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Tela cheia</span>
            </button>
          )}
        </div>
      </header>

      {toque ? (
        <div className="grid flex-1 place-items-center p-6 text-center">
          <div className="max-w-sm space-y-3">
            <Monitor className="mx-auto h-10 w-10 text-[#f5d76e]" />
            <p className="font-mono text-sm font-semibold text-white">
              Esse jogo pede teclado e mouse.
            </p>
            <p className="text-sm leading-relaxed text-[#b8b0d0]">
              Abra este link no computador para jogar. Enquanto isso, dá para
              ler como ele foi feito em pouco mais de uma hora.
            </p>
            <Link
              href={POST_URL}
              className="inline-flex items-center gap-2 rounded-md bg-[#f5d76e] px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-[#1a1020]"
            >
              <BookOpen className="h-4 w-4" /> Ler o post
            </Link>
          </div>
        </div>
      ) : (
        <iframe
          ref={frame}
          src={JOGO_URL}
          title="Projeto Terra — jogo sandbox 2D"
          onLoad={focarJogo}
          allow="fullscreen"
          className="w-full flex-1 border-0"
        />
      )}
    </div>
  );
}
