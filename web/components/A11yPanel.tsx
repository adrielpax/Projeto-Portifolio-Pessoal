"use client";

import { useEffect, useId, useRef, useState } from "react";
import { stage } from "@/lib/stage";

type Prefs = { motion: boolean; contrast: boolean; large: boolean };
const KEY = "a11y-prefs";

const OPTIONS: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: "motion", label: "Reduzir movimento", hint: "Para animações, flutuação e transições" },
  { key: "contrast", label: "Alto contraste", hint: "Fundos sólidos e textos mais claros" },
  { key: "large", label: "Texto maior", hint: "Aumenta o texto em 15%" },
];

function apply(p: Prefs) {
  const root = document.documentElement;
  root.classList.toggle("a11y-reduce-motion", p.motion);
  root.classList.toggle("a11y-contrast", p.contrast);
  root.classList.toggle("a11y-large", p.large);
  stage.reducedMotion = p.motion;
  // a timeline mede o layout de novo (texto maior muda tamanhos)
  window.dispatchEvent(new CustomEvent("a11y:change"));
}

/**
 * Painel de acessibilidade: um botão, três chaves. As escolhas ficam salvas
 * neste navegador e "Reduzir movimento" já começa ligado se o sistema pedir.
 */
export function A11yPanel() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ motion: false, contrast: false, large: false });
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let saved: Partial<Prefs> = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    } catch {}
    const initial: Prefs = {
      motion: saved.motion ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      contrast: saved.contrast ?? window.matchMedia("(prefers-contrast: more)").matches,
      large: saved.large ?? false,
    };
    setPrefs(initial);
    apply(initial);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (k: keyof Prefs) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    apply(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="fixed bottom-[52px] left-3 z-[60] md:bottom-[60px] md:left-6">
      <div
        id={panelId}
        role="region"
        aria-label="Opções de acessibilidade"
        hidden={!open}
        className="glass glass-sm absolute bottom-full left-0 mb-3 w-[280px] p-2"
      >
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            role="switch"
            aria-checked={prefs[o.key]}
            onClick={() => toggle(o.key)}
            className="flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-white/10"
          >
            <span>
              <span className="block text-[15px] font-medium">{o.label}</span>
              <span className="block text-[13px] text-dim">{o.hint}</span>
            </span>
            <span
              aria-hidden
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${prefs[o.key] ? "bg-paper" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full transition-[left] duration-300 ${prefs[o.key] ? "left-[18px] bg-ink" : "left-0.5 bg-paper"}`}
              />
            </span>
          </button>
        ))}
      </div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="glass glass-pill relative flex h-11 items-center gap-2 px-4 text-[14px] font-medium"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="4.5" r="2" fill="currentColor" />
          <path d="M4 8.5l8 1.5 8-1.5M12 10v5m0 0l-3 6m3-6l3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Acessibilidade
      </button>
    </div>
  );
}
