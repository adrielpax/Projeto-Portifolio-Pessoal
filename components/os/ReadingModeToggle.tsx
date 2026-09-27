"use client";

import { useSyncExternalStore } from "react";
import { BookOpen, MonitorCog } from "lucide-react";

const CLASSE = "modo-leitura";

/** Observa a classe do <html> — a fonte da verdade do Modo Leitura. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * Alterna o Modo Leitura (tema claro). O estado vive na classe
 * `modo-leitura` do <html> (aplicada antes da hidratação pelo script do
 * layout), persiste em localStorage e fica fixo na URL como ?modo=leitura —
 * o token viaja junto quando o link é compartilhado.
 */
export default function ReadingModeToggle() {
  const on = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains(CLASSE),
    () => false,
  );

  const toggle = () => {
    const next = !on;
    document.documentElement.classList.toggle(CLASSE, next);
    try {
      localStorage.setItem(CLASSE, next ? "1" : "0");
    } catch {}
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("modo", "leitura");
    else url.searchParams.delete("modo");
    window.history.replaceState(null, "", url);
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Voltar ao modo sistema" : "Modo leitura (tema claro)"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hud-line text-hud-muted
      transition-colors hover:bg-white/[0.06] hover:text-hud-text"
    >
      {on ? <MonitorCog className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
    </button>
  );
}
