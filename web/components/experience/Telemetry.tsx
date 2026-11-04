"use client";

import { useEffect, useState } from "react";

const NAMES: Record<string, string> = {
  hero: "Início",
  projects: "Projetos",
  stack: "Stack",
  blog: "Blog",
  contact: "Contato",
};

/** rodapé discreto: seção atual e a hora em Betim */
export function Telemetry({ active }: { active: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <footer aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex h-[44px] items-center justify-between px-4 text-[13px] text-dim md:h-[52px] md:px-6">
      <span className="text-paper">{NAMES[active] ?? NAMES.hero}</span>
      <span className="tabular-nums">Betim, {time}</span>
    </footer>
  );
}
