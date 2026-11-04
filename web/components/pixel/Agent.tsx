"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { PixelSprite } from "./PixelSprite";
import type { AgentDef } from "./agents";

/** digita `text` caractere por caractere enquanto `active` for true */
export function useTypewriter(text: string, active: boolean, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) {
      setOut("");
      return;
    }
    if (document.documentElement.classList.contains("a11y-reduce-motion")) {
      setOut(text);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, active, speed]);
  return out;
}

/** mini chat em balão, sobre a cabeça do personagem */
function MiniChat({ def, open, onClose, id }: { def: AgentDef; open: boolean; onClose: () => void; id: string }) {
  const text = useTypewriter(def.greeting, open);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // real: leva o recado para o formulário de contato e rola até lá
  const onConnect = () => {
    const message = inputRef.current?.value.trim() ?? "";
    window.dispatchEvent(new CustomEvent("agent:connect", { detail: { id: def.id, message } }));
    onClose();
  };

  return (
    <div
      id={id}
      role="dialog"
      aria-label={`Conversa com ${def.name}`}
      aria-hidden={!open}
      className={`glass glass-sm absolute bottom-full left-1/2 z-20 mb-4 w-[min(290px,80vw)] -translate-x-1/2 origin-bottom text-[14px] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.9,.25,1.15)] ${
        open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-90 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="flex items-center gap-2 font-display text-[16px]">
          <span className="h-2 w-2" style={{ background: def.accent }} />
          {def.name}
        </span>
        <button type="button" onClick={onClose} tabIndex={open ? 0 : -1} className="px-2 text-dim hover:text-paper" aria-label="Fechar conversa">
          ✕
        </button>
      </div>
      <p className="min-h-[64px] px-4 pb-3 leading-snug text-paper/90" aria-live="polite">
        {text}
      </p>
      <form
        className="flex items-center gap-2 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          onConnect();
        }}
      >
        <input
          ref={inputRef}
          tabIndex={open ? 0 : -1}
          aria-label="Recado para o Adriel"
          placeholder="Seu recado (opcional)"
          className="min-w-0 flex-1 bg-white/10 px-4 py-2 text-[14px] text-paper placeholder:text-dim focus:outline-none focus:ring-1 focus:ring-white/40"
        />
        <button
          type="submit"
          tabIndex={open ? 0 : -1}
          className="para bg-paper px-5 py-2 text-[14px] font-medium text-ink transition-transform active:scale-95"
        >
          Falar com o Adriel
        </button>
      </form>
      {/* rabinho do balão */}
      <span className="glass absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 [--radius:3px]" aria-hidden />
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Agent({ def }: { def: AgentDef }) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const chatId = useId();
  const h = hash(def.id);
  const floatStyle = {
    "--bob-dur": `${5 + (h % 30) / 10}s`,
    "--bob-delay": `-${(h % 50) / 10}s`,
    "--bob-rot": `${h % 2 ? 1.2 : -1.2}deg`,
  } as CSSProperties;
  const W = def.sprite.width * def.px;
  const showButton = hover || open;

  return (
    <div className="agent-pos absolute left-0 top-0" data-agent={def.id} style={{ zIndex: open ? 40 : 1 }}>
      <div className="agent-par">
        <div
          className="agent-intro relative"
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHover(false)}
        >
          <MiniChat def={def} open={open} onClose={() => setOpen(false)} id={chatId} />
          <div className="agent-float relative" style={floatStyle}>
            {/* personagem + notebook na frente */}
            <div className="relative" style={{ width: W }}>
              <PixelSprite sprite={def.sprite} px={def.px} waving={hover && !open} title={`${def.name} programando`} />
              <div className="absolute" style={{ left: def.laptop.x * def.px, top: def.laptop.y * def.px }}>
                <PixelSprite sprite={def.laptop.sprite} px={def.px * def.laptop.scale} />
              </div>
            </div>

            {/* botão flutuante de chat */}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={chatId}
              aria-label={open ? `Fechar conversa com ${def.name}` : `Conversar com ${def.name}`}
              className={`glass glass-pill absolute top-0 flex h-11 w-11 items-center justify-center text-[18px] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.9,.25,1.15)] focus-visible:opacity-100 ${
                def.side === "left" ? "-right-14" : "-left-14"
              } ${showButton ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0 focus-visible:pointer-events-auto focus-visible:scale-100"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 4.5A2.5 2.5 0 0 1 5.5 2h9A2.5 2.5 0 0 1 17 4.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4h0.5A2.5 2.5 0 0 1 3 10.5z" fill="currentColor" />
              </svg>
            </button>

            <div className="mt-4 text-center font-display text-[14px] text-dim">{def.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
