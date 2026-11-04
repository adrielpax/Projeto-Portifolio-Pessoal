"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { navLinks, profile, type SectionId } from "@/lib/content";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { NavLinkText, navLinkClass } from "./NavLinkText";

const LED_ON = "#ff6a13";

/**
 * Navbar como uma IHM industrial de nova geração: seletor de telas em vidro escuro
 * com "thumb" deslizante, LED na tela ativa e barra de progresso da página.
 *
 * Ela começa "vazia": avatar e links ficam invisíveis até o card do hero chegar
 * voando. Os .nav-slot servem de alvo de medição e depois assumem o lugar.
 * Os LEDs ficam em posição absoluta para não mudar onde o texto cai.
 */
export function Navbar({ active, go }: { active: SectionId; go: (id: SectionId) => void }) {
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
        {/* identificação */}
        <button type="button" onClick={() => go("hero")} className="pointer-events-auto relative flex items-center gap-3 p-1.5 pr-4" aria-label="Voltar ao início">
          <span className="nav-chrome glass glass-dark cut-sm invisible absolute inset-0 -z-10 opacity-0" aria-hidden />
          <div className="nav-avatar-slot invisible h-[36px] w-[36px] opacity-0">
            <ProfilePhoto className="h-full w-full" alt="" />
          </div>
          <span className="nav-chrome invisible hidden font-display text-[19px] font-semibold uppercase leading-none text-white opacity-0 sm:block">
            {profile.name}
          </span>
        </button>

        {/* seletor de telas */}
        <nav className="relative flex items-center gap-5 px-5 py-3 sm:gap-7 md:gap-9 md:px-7" aria-label="Navegação principal">
          <span className="nav-chrome glass glass-dark cut invisible absolute inset-0 -z-10 opacity-0" aria-hidden />
          {thumb && (
            <span
              aria-hidden
              className="nav-chrome nav-thumb invisible absolute top-1.5 bottom-1.5 -z-[5] para opacity-0"
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
                  on ? "text-white" : "text-white/60 hover:text-white"
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
            className="nav-chrome pointer-events-auto invisible para ml-1 hidden bg-safety px-5 py-1.5 text-[15px] font-semibold text-white opacity-0 transition-opacity hover:opacity-85 md:inline-block"
          >
            Links
          </Link>
          {/* barra de processo: progresso do scroll com marcações de escala */}
          <span className="nav-chrome process-bar invisible absolute inset-x-6 bottom-[5px] h-[2px] opacity-0" aria-hidden>
            <span className="nav-progress block h-full origin-left scale-x-0" />
          </span>
        </nav>
      </div>
    </header>
  );
}
