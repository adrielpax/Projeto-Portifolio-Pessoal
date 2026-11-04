"use client";

import Link from "next/link";
import { navLinks, profile, type SectionId } from "@/lib/content";
import { PixelAvatar } from "@/components/pixel/PixelAvatar";
import { NavLinkText, navLinkClass } from "./NavLinkText";

/**
 * A navbar começa "vazia": avatar e links ficam invisíveis até o card do hero
 * chegar voando. Os .nav-slot servem de alvo de medição e depois assumem o lugar.
 */
export function Navbar({ active, go }: { active: SectionId; go: (id: SectionId) => void }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[64px] md:h-[76px]">
      <div className="flex h-full items-center justify-between px-3 md:px-6">
        <button type="button" onClick={() => go("hero")} className="pointer-events-auto flex items-center gap-3" aria-label="Voltar ao início">
          <div className="nav-avatar-slot invisible h-[34px] w-[34px] opacity-0 ring-1 ring-white/20">
            <PixelAvatar src={profile.avatar} crop={profile.avatarCrop} grid={24} className="h-full w-full" />
          </div>
          <div className="nav-chrome invisible hidden text-left leading-tight opacity-0 lg:block">
            <div className="font-pixel text-[11px] uppercase tracking-[0.14em]">{profile.name}</div>
            <div className="mt-1 font-pixel text-[8px] uppercase tracking-[0.2em] text-dim">{profile.role}</div>
          </div>
        </button>

        <nav className="flex items-center gap-3.5 sm:gap-5 md:gap-7" aria-label="Navegação principal">
          {navLinks.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              aria-current={active === l.id ? "true" : undefined}
              className={`nav-slot pointer-events-auto invisible relative opacity-0 transition-colors ${navLinkClass} ${
                active === l.id ? "text-paper" : "text-dim hover:text-paper"
              }`}
            >
              <NavLinkText index={l.index} label={l.label} />
              <span
                className={`absolute -bottom-2.5 left-0 h-px bg-claude transition-all duration-300 ${active === l.id ? "w-full" : "w-0"}`}
              />
            </button>
          ))}
          <Link
            href="/links"
            className="nav-chrome pointer-events-auto invisible hidden border border-white/20 px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.16em] opacity-0 transition-colors hover:bg-paper hover:text-ink md:inline-block"
          >
            Links ↗
          </Link>
        </nav>
      </div>
      <div className="nav-chrome invisible absolute inset-x-0 bottom-0 h-px bg-white/10 opacity-0">
        <div className="nav-progress h-px origin-left scale-x-0 bg-paper" />
      </div>
    </header>
  );
}
