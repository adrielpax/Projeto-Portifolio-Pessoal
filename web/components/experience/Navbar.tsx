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
          <div className="nav-chrome invisible hidden text-left opacity-0 lg:block">
            <div className="font-pixel text-[20px] font-semibold leading-none">{profile.name}</div>
          </div>
        </button>

        <nav className="relative flex items-center gap-4 px-4 py-2.5 sm:gap-6 md:gap-8 md:px-6" aria-label="Navegação principal">
          <span className="nav-chrome glass glass-pill invisible absolute inset-0 -z-10 opacity-0" aria-hidden />
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
              <NavLinkText label={l.label} />
            </button>
          ))}
          <Link
            href="/links"
            className="nav-chrome pointer-events-auto invisible hidden rounded-full bg-paper px-4 py-1.5 text-[15px] font-medium text-ink opacity-0 transition-opacity hover:opacity-80 md:inline-block"
          >
            Links
          </Link>
        </nav>
      </div>
    </header>
  );
}
