"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

const NAMES: Record<string, [string, string]> = {
  hero: ["00", "Perfil"],
  projects: ["01", "Projetos"],
  stack: ["02", "Stack"],
  blog: ["03", "Blog"],
  contact: ["04", "Contato"],
};

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** barra inferior estilo transmissão de lançamento */
export function Telemetry({ active }: { active: string }) {
  const now = useClock();
  const [idx, name] = NAMES[active] ?? NAMES.hero;
  const time = now
    ? now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour12: false })
    : "--:--:--";
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex h-[44px] items-center justify-between px-3 font-pixel text-[8px] uppercase tracking-[0.2em] text-dim md:h-[52px] md:px-6 md:text-[9px]">
      <span className="hidden sm:inline">adriel.sys v3 · protótipo</span>
      <span className="flex items-center gap-2 text-paper">
        <span className="h-1.5 w-1.5 animate-pulse bg-signal" />
        {idx}/04 · {name}
      </span>
      <span className="tabular-nums">
        <span className="hidden lg:inline">
          lat {profile.coords.lat.toFixed(3)} · lon {profile.coords.lon.toFixed(3)} ·{" "}
        </span>
        brt {time}
      </span>
    </footer>
  );
}
