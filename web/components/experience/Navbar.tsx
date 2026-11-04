"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navLinks, profile, type SectionId } from "@/lib/content";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { NavLinkText, navLinkClass } from "./NavLinkText";

const LED_ON = "#3ddc84";

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/**
 * Navbar como uma IHM industrial de nova geração: seletor de telas em vidro com
 * "thumb" deslizante, LEDs de estado por tela, barra de processo (progresso do
 * scroll) e bloco de status do sistema.
 *
 * Ela começa "vazia": avatar e links ficam invisíveis até o card do hero chegar
 * voando. Os .nav-slot servem de alvo de medição e depois assumem o lugar.
 * Os LEDs ficam em posição absoluta para não mudar onde o texto cai.
 */
export function Navbar({ active, go }: { active: SectionId; go: (id: SectionId) => void }) {
  const time = useClock();
  const slots = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = slots.current[active];
      setThumb(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[64px] md:h-[76px]">
      <div className="flex h-full items-center justify-between gap-4 px-3 md:px-6">
        {/* identificação + status do sistema */}
        <button type="button" onClick={() => go("hero")} className="pointer-events-auto flex items-center gap-3" aria-label="Voltar ao início">
          <div className="nav-avatar-slot invisible h-[38px] w-[38px] rounded-full opacity-0">
            <ProfilePhoto className="h-full w-full" alt="" />
          </div>
          <div className="nav-chrome invisible hidden text-left opacity-0 lg:block">
            <div className="font-display text-[18px] font-semibold leading-none">{profile.name}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-dim">
              <span className="led" style={{ ["--led" as string]: LED_ON }} aria-hidden />
              Online em Betim <span className="tabular-nums text-paper/80">{time}</span>
            </div>
          </div>
        </button>

        {/* seletor de telas */}
        <nav className="relative flex items-center gap-5 px-5 py-3 sm:gap-7 md:gap-9 md:px-7" aria-label="Navegação principal">
          <span className="nav-chrome glass glass-pill invisible absolute inset-0 -z-10 opacity-0" aria-hidden />
          {thumb && (
            <span
              aria-hidden
              className="nav-chrome nav-thumb invisible absolute top-1.5 bottom-1.5 -z-[5] rounded-full opacity-0"
              style={{ left: thumb.left - 16, width: thumb.width + 26 }}
            />
          )}
          {navLinks.map((l) => {
            const on = active === l.id;
            return (
              <button
                key={l.id}
                ref={(el) => {
                  slots.current[l.id] = el;
                }}
                type="button"
                onClick={() => go(l.id)}
                aria-current={on ? "true" : undefined}
                className={`nav-slot pointer-events-auto invisible relative opacity-0 transition-colors ${navLinkClass} ${
                  on ? "text-paper" : "text-dim hover:text-paper"
                }`}
              >
                <span
                  aria-hidden
                  className="led absolute -left-3 top-1/2 -translate-y-1/2"
                  style={{ ["--led" as string]: on ? LED_ON : "rgba(255,255,255,0.22)", ["--glow" as string]: on ? "1" : "0" }}
                />
                <NavLinkText label={l.label} />
              </button>
            );
          })}
          <Link
            href="/links"
            className="nav-chrome pointer-events-auto invisible ml-1 hidden rounded-full bg-paper px-4 py-1.5 text-[15px] font-medium text-ink opacity-0 transition-opacity hover:opacity-80 md:inline-block"
          >
            Links
          </Link>
          {/* barra de processo: progresso do scroll com marcações de escala */}
          <span className="nav-chrome process-bar invisible absolute inset-x-6 bottom-[5px] h-[2px] opacity-0" aria-hidden>
            <span className="nav-progress block h-full origin-left scale-x-0 rounded-full" />
          </span>
        </nav>
      </div>
    </header>
  );
}
