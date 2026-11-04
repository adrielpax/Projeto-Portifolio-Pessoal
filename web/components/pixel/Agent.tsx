"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { AgentDef } from "./agents";

type Mode = "closed" | "menu" | "chat";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const reduced = () => document.documentElement.classList.contains("a11y-reduce-motion");

/* ------------------------------- ícones -------------------------------- */

const IconChat = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
    <path d="M3 4.5A2.5 2.5 0 0 1 5.5 2h9A2.5 2.5 0 0 1 17 4.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4h.5A2.5 2.5 0 0 1 3 10.5z" fill="currentColor" />
  </svg>
);
const IconMic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
/** seta de "enter" (↵) */
const IconEnter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 5v7a3 3 0 0 1-3 3H5M9 11l-4 4 4 4" />
  </svg>
);

/* ------------------------------ componente ------------------------------ */

/**
 * Personagem solto no espaço: deriva devagar, gira, quica nas bordas da tela
 * e pode ser arrastado e arremessado. Um clique abre a barrinha (chat e voz)
 * embaixo dele; o chat abre uma barra maior com campo de texto e botão ↵.
 */
export function Agent({ def }: { def: AgentDef }) {
  const wrap = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("closed");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const modeRef = useRef<Mode>("closed");
  modeRef.current = mode;

  const s = useRef({
    x: 0,
    y: 0,
    vx: def.velocity.x,
    vy: def.velocity.y,
    a: 0,
    va: def.spin,
    dragging: false,
    moved: false,
    offX: 0,
    offY: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    w: 100,
    h: 100,
  });

  useEffect(() => setVoiceOk(getRecognition() !== null), []);

  // laço de física (requestAnimationFrame)
  useEffect(() => {
    const st = s.current;
    st.x = window.innerWidth * def.start.x;
    st.y = window.innerHeight * def.start.y;
    let raf = 0;
    let prev = performance.now();
    const cruise = Math.hypot(def.velocity.x, def.velocity.y);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const el = wrap.current;
      const b = body.current;
      if (el && b) {
        st.w = b.offsetWidth;
        st.h = b.offsetHeight;
        const still = st.dragging || modeRef.current !== "closed" || reduced() || document.hidden;
        if (!still) {
          st.x += st.vx * dt;
          st.y += st.vy * dt;
          st.a += st.va * dt;
          // quica nas bordas da tela
          const maxX = window.innerWidth - st.w;
          const maxY = window.innerHeight - st.h - 24;
          if (st.x < 0) (st.x = 0), (st.vx = Math.abs(st.vx)), (st.va = -st.va);
          if (st.x > maxX) (st.x = maxX), (st.vx = -Math.abs(st.vx)), (st.va = -st.va);
          if (st.y < 64) (st.y = 64), (st.vy = Math.abs(st.vy));
          if (st.y > maxY) (st.y = maxY), (st.vy = -Math.abs(st.vy));
          // depois de um arremesso, volta devagar à velocidade de cruzeiro
          const sp = Math.hypot(st.vx, st.vy);
          if (sp > cruise) {
            const k = Math.max(cruise / sp, Math.exp(-dt * 0.9));
            st.vx *= k;
            st.vy *= k;
          }
        } else if (modeRef.current !== "closed") {
          // com a barra aberta, o personagem endireita para ficar legível
          const wrapped = ((((st.a + 180) % 360) + 360) % 360) - 180;
          st.a = wrapped * (1 - Math.min(1, dt * 5));
        }
        el.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0)`;
        b.style.transform = `rotate(${st.a.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [def]);

  // abre a barra trazendo o personagem para uma área onde ela caiba na tela
  const open = useCallback((next: Mode) => {
    const st = s.current;
    const room = next === "chat" ? Math.min(200, window.innerWidth * 0.45) : 90;
    gsap.to(st, {
      x: gsap.utils.clamp(Math.max(0, room - st.w / 2), Math.max(0, window.innerWidth - st.w / 2 - room), st.x),
      y: gsap.utils.clamp(80, window.innerHeight - st.h - 150, st.y),
      duration: 0.5,
      ease: "power3.out",
    });
    setMode(next);
  }, []);

  const close = useCallback(() => {
    setMode("closed");
    setListening(false);
  }, []);

  useEffect(() => {
    if (mode === "chat") input.current?.focus({ preventScroll: true });
    if (mode === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        body.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, close]);

  /* ----------------------------- arrastar ----------------------------- */
  const onPointerDown = (e: React.PointerEvent) => {
    const st = s.current;
    st.dragging = true;
    st.moved = false;
    st.offX = e.clientX - st.x;
    st.offY = e.clientY - st.y;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.lastT = performance.now();
    gsap.killTweensOf(st);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.dragging) return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - st.lastT) / 1000);
    if (Math.hypot(e.clientX - (st.offX + st.x), e.clientY - (st.offY + st.y)) > 4) st.moved = true;
    st.vx = (e.clientX - st.lastX) / dt;
    st.vy = (e.clientY - st.lastY) / dt;
    st.lastX = e.clientX;
    st.lastY = e.clientY;
    st.lastT = now;
    st.x = e.clientX - st.offX;
    st.y = e.clientY - st.offY;
  };
  const onPointerUp = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    if (!st.moved) {
      // clique: abre/fecha a barrinha
      st.vx = def.velocity.x;
      st.vy = def.velocity.y;
      if (modeRef.current === "closed") open("menu");
      else close();
      return;
    }
    // arremesso: mantém o impulso, limitado
    const sp = Math.hypot(st.vx, st.vy);
    const max = 650;
    if (sp > max) {
      st.vx *= max / sp;
      st.vy *= max / sp;
    }
    if (sp < 5) {
      st.vx = def.velocity.x;
      st.vy = def.velocity.y;
    }
    st.va = def.spin + (st.vx / 40) * (st.vy > 0 ? 1 : -1);
  };

  /* ------------------------------- voz -------------------------------- */
  const startVoice = () => {
    const rec = getRecognition();
    if (!rec) return;
    open("chat");
    rec.lang = "pt-BR";
    rec.interimResults = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      if (input.current) input.current.value = text;
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.current?.value.trim() ?? "";
    if (!message) return;
    window.dispatchEvent(new CustomEvent("agent:connect", { detail: { id: def.id, message } }));
    if (input.current) input.current.value = "";
    close();
  };

  return (
    <div ref={wrap} className="agent-pos absolute left-0 top-0" data-agent={def.id} style={{ zIndex: mode === "closed" ? 1 : 40 }}>
      <div className="agent-intro">
        <button
          ref={body}
          type="button"
          aria-label={`${def.name}: abrir opções de conversa`}
          aria-expanded={mode !== "closed"}
          className="agent-body block cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (mode === "closed") open("menu");
              else close();
            }
          }}
        >
          <def.Figure waving={mode === "menu"} />
        </button>
      </div>

      {/* barrinha: chat e voz */}
      {mode === "menu" && (
        <div
          className="agent-bar glass glass-sm absolute left-1/2 top-full mt-3 flex -translate-x-1/2 items-center gap-1 p-1"
          role="group"
          aria-label={`Opções do ${def.name}`}
        >
          <span className="px-2 font-display text-[14px] font-semibold uppercase">{def.name}</span>
          <button type="button" onClick={() => open("chat")} className="agent-icon-btn" aria-label={`Conversar com ${def.name}`}>
            <IconChat />
          </button>
          <button
            type="button"
            onClick={startVoice}
            disabled={!voiceOk}
            title={voiceOk ? "Falar por voz" : "Seu navegador não oferece reconhecimento de voz"}
            className="agent-icon-btn disabled:opacity-35"
            aria-label="Falar por voz"
          >
            <IconMic />
          </button>
        </div>
      )}

      {/* barra de chat: campo + botão ↵ */}
      {mode === "chat" && (
        <form
          onSubmit={send}
          className="agent-bar glass glass-sm absolute left-1/2 top-full mt-3 flex w-[min(360px,86vw)] -translate-x-1/2 items-center gap-1 p-1.5"
        >
          <input
            ref={input}
            aria-label={`Mensagem para o Adriel, via ${def.name}`}
            placeholder={listening ? "Ouvindo…" : "Escreva sua mensagem"}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] text-paper placeholder:text-paper/45 focus:outline-none"
          />
          {voiceOk && (
            <button type="button" onClick={startVoice} className={`agent-icon-btn ${listening ? "text-[#3ddc84]" : ""}`} aria-label="Falar por voz">
              <IconMic />
            </button>
          )}
          <button type="submit" className="agent-icon-btn bg-paper text-ink hover:bg-paper/85" aria-label="Enviar">
            <IconEnter />
          </button>
        </form>
      )}
    </div>
  );
}
