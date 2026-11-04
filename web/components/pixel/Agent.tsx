"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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

/** terminal flutuante em que o agente "programa" sozinho, em loop */
function CodePanel({ def, visible }: { def: AgentDef; visible: boolean }) {
  const [lines, setLines] = useState<string[]>([""]);
  const state = useRef({ line: 0, ch: 0, pause: 0, clear: false });

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const s = state.current;
      if (s.pause > 0) {
        s.pause--;
        return;
      }
      if (s.clear) {
        s.clear = false;
        setLines([""]);
        return;
      }
      const target = def.code[s.line];
      if (s.ch < target.length) {
        s.ch++;
        setLines((prev) => [...prev.slice(0, -1), target.slice(0, s.ch)]);
        return;
      }
      // linha terminada: próxima linha, ou reinicia depois de uma pausa
      s.line++;
      s.ch = 0;
      if (s.line >= def.code.length) {
        s.line = 0;
        s.pause = 50;
        s.clear = true; // mantém o código na tela durante a pausa
      } else {
        s.pause = 6;
        setLines((prev) => [...prev.slice(-4), ""]);
      }
    }, 45);
    return () => window.clearInterval(id);
  }, [def.code]);

  return (
    <div
      className={`code-panel pointer-events-none absolute -top-6 hidden glass glass-sm w-[208px] p-3 font-[ui-monospace,Menlo,monospace] text-[10px] leading-[1.45] text-paper/75 backdrop-blur-sm transition-opacity duration-500 md:block ${
        def.panelSide === "right" ? "left-full ml-3" : "right-full mr-3"
      } ${visible ? "opacity-100" : "opacity-0"}`}
      aria-hidden
    >
      <div className="mb-1.5 flex items-center gap-1.5 border-b border-white/10 pb-1.5 text-[11px] text-dim">
        <span className="inline-block h-1.5 w-1.5" style={{ background: def.accent }} />
        {def.name}
      </div>
      {lines.map((l, i) => (
        <div key={i} className="truncate whitespace-pre">
          {l}
          {i === lines.length - 1 && <span className="caret" style={{ background: def.accent }} />}
        </div>
      ))}
    </div>
  );
}

type ConnectState = "idle" | "connecting" | "soon";

function ChatBar({ def, open }: { def: AgentDef; open: boolean }) {
  const text = useTypewriter(def.greeting, open);
  const [connect, setConnect] = useState<ConnectState>("idle");

  useEffect(() => {
    if (!open) setConnect("idle");
  }, [open]);

  const onConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connect !== "idle") return;
    setConnect("connecting");
    // gancho para a próxima fase: integração real com a API do agente
    window.dispatchEvent(new CustomEvent("agent:connect", { detail: { id: def.id } }));
    window.setTimeout(() => setConnect("soon"), 1100);
  };

  return (
    <div
      className={`chat-bar absolute top-full z-10 mt-2 glass glass-sm w-[270px] origin-top overflow-hidden text-[14px] text-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.9,.25,1.15)] ${
        def.panelSide === "right" ? "left-0" : "right-0"
      } ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={`Chat com ${def.name}`}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[13px]">
        <span className="flex items-center gap-2 font-pixel text-[15px]">
          <span className="h-1.5 w-1.5 animate-pulse" style={{ background: def.accent }} />
          {def.name}
        </span>
        <span className="text-dim">online</span>
      </div>
      <p className="min-h-[60px] px-3 py-2.5 leading-snug text-paper/85">
        {text}
        {open && text.length < def.greeting.length && <span className="caret" style={{ background: def.accent }} />}
      </p>
      <div className="flex items-stretch gap-0 border-t border-white/10">
        <input
          readOnly
          tabIndex={open ? 0 : -1}
          placeholder={`Escreva para ${def.name}`}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] text-paper placeholder:text-dim/70 focus:outline-none"
        />
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={onConnect}
          className="border-l border-white/10 px-3 text-[14px] font-medium transition-colors hover:bg-paper hover:text-ink"
          style={{ color: connect === "idle" ? def.accent : undefined }}
        >
          {connect === "idle" ? "Conectar" : connect === "connecting" ? "…" : "Em breve"}
        </button>
      </div>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Agent({ def, showPanel }: { def: AgentDef; showPanel: boolean }) {
  const [open, setOpen] = useState(false);
  const lastPointer = useRef<string>("mouse");
  const h = hash(def.id);
  const floatStyle = {
    "--bob-dur": `${5 + (h % 30) / 10}s`,
    "--bob-delay": `-${(h % 50) / 10}s`,
    "--bob-rot": `${h % 2 ? 1.5 : -1.5}deg`,
  } as CSSProperties;

  return (
    <div className="agent-pos absolute left-0 top-0" data-agent={def.id} style={{ zIndex: open ? 40 : 1 }}>
      <div className="agent-par">
        <div
          className="agent-intro relative"
          onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
          onPointerDown={(e) => (lastPointer.current = e.pointerType)}
          onClick={() => lastPointer.current !== "mouse" && setOpen((o) => !o)}
        >
          <div className="agent-float" style={floatStyle}>
            {def.panel && <CodePanel def={def} visible={showPanel && !open} />}
            <button
              type="button"
              aria-label={`Abrir chat com ${def.name}`}
              aria-expanded={open}
              className="group relative block cursor-pointer"
              onFocus={() => setOpen(true)}
            >
              <span
                className="pointer-events-none absolute inset-x-1 -bottom-2 h-2 opacity-60 blur-md transition-opacity group-hover:opacity-100"
                style={{ background: def.accent }}
              />
              <PixelSprite sprite={def.sprite} px={def.px} className="relative drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]" />
            </button>
            <div className="mt-1.5 flex items-center justify-center gap-1.5 font-pixel text-[13px] text-dim">
              <span className="h-1 w-1" style={{ background: def.accent }} />
              {def.name}
            </div>
          </div>
          <ChatBar def={def} open={open} />
        </div>
      </div>
    </div>
  );
}
