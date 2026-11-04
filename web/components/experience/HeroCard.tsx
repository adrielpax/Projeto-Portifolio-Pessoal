"use client";

import { navLinks, profile, socials, type SectionId } from "@/lib/content";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { NavLinkText, navLinkClass } from "./NavLinkText";

/**
 * Card do hero. Ao rolar, a timeline em Experience.tsx:
 *  - leva .hero-avatar até .nav-avatar-slot (vira o ícone de perfil da navbar)
 *  - leva cada .hero-link até o .nav-slot correspondente (vira os links da navbar)
 *  - troca .hero-card-bg pela .frame, que se expande e vira a moldura das seções
 */
export function HeroCard({ go }: { go: (id: SectionId) => void }) {
  return (
    <div className="hero-card pointer-events-auto relative w-[min(680px,calc(100vw-24px))]">
      <div className="hero-card-bg glass absolute inset-0" />
      <div className="relative p-5 sm:p-8 md:p-10">
        <div className="flex flex-row items-end gap-5 sm:gap-7">
          <div className="hero-avatar relative h-[88px] w-[88px] shrink-0 origin-top-left sm:h-[132px] sm:w-[132px]">
            <div className="intro h-full w-full">
              <ProfilePhoto className="h-full w-full" />
            </div>
          </div>
          <div className="hero-copy min-w-0 pb-1">
            <h1 className="intro font-pixel text-[38px] font-semibold leading-[0.9] sm:text-[60px] md:text-[72px]">
              {profile.name}
            </h1>
          </div>
        </div>

        <div className="hero-copy">
          <p className="intro mt-7 max-w-[24ch] text-[24px] font-medium leading-[1.15] sm:text-[30px]">{profile.headline}</p>
          <p className="intro mt-3 max-w-[52ch] text-[16px] leading-relaxed text-dim">
            Sou desenvolvedor full stack em Betim, MG. Faço produtos web, automações com n8n e agentes de IA que rodam em produção.
          </p>
        </div>

        <div className="intro mt-8">
          <div className="hero-links-rule h-px origin-left bg-white/15" />
          <nav className="mt-5 flex flex-wrap gap-x-7 gap-y-3" aria-label="Seções">
            {navLinks.map((l) => (
              <button key={l.id} type="button" onClick={() => go(l.id)} className={`hero-link ${navLinkClass} hover:opacity-60`}>
                <NavLinkText label={l.label} />
              </button>
            ))}
          </nav>
        </div>

        <div className="hero-socials mt-6">
          <div className="intro flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-[15px]">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-dim">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="transition-colors hover:text-paper"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse bg-paper" />
              {profile.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
