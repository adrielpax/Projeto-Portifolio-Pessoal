"use client";

import { navLinks, profile, socials, type SectionId } from "@/lib/content";
import { PixelAvatar } from "@/components/pixel/PixelAvatar";
import { NavLinkText, navLinkClass } from "./NavLinkText";

/**
 * Card do hero. Ao rolar, a timeline em Experience.tsx:
 *  - leva .hero-avatar até .nav-avatar-slot (vira o "ícone de perfil" da navbar)
 *  - leva cada .hero-link até o .nav-slot correspondente (vira os links da navbar)
 *  - troca .hero-card-bg pela .frame, que se expande e vira a moldura das seções
 */
export function HeroCard({ go }: { go: (id: SectionId) => void }) {
  return (
    <div className="hero-card pointer-events-auto relative w-[min(640px,calc(100vw-24px))]">
      <div className="hero-card-bg card-surface brackets absolute inset-0 border border-white/12" />
      <div className="relative p-4 sm:p-6 md:p-7">
        <div className="hero-meta">
          <div className="intro flex items-center justify-between font-pixel text-[8px] uppercase tracking-[0.2em] text-dim md:text-[9px]">
            <span>adriel.sys ▸ perfil</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse bg-signal" /> online
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-row items-start gap-4 sm:mt-5 sm:gap-6 md:gap-7">
          <div className="hero-avatar relative h-[84px] w-[84px] shrink-0 origin-top-left sm:h-[128px] sm:w-[128px] md:h-[148px] md:w-[148px]">
            <div className="intro h-full w-full">
              <PixelAvatar
                src={profile.avatar}
                crop={profile.avatarCrop}
                grid={40}
                interactive
                className="h-full w-full"
                alt={`Foto de ${profile.name}`}
              />
            </div>
          </div>
          <div className="hero-copy min-w-0">
            <h1 className="intro font-pixel text-[26px] uppercase leading-[0.95] tracking-[0.02em] sm:text-[38px] md:text-[46px]">
              {profile.name}
            </h1>
            <p className="intro mt-2.5 font-pixel text-[8px] uppercase tracking-[0.2em] text-dim sm:text-[10px]">
              {profile.role} · {profile.focus.join(" · ")}
            </p>
            <p className="intro mt-4 hidden text-[20px] leading-snug text-paper sm:block md:text-[23px]">{profile.headline}</p>
            <p className="intro mt-2.5 hidden max-w-[46ch] text-[12.5px] leading-relaxed text-dim sm:block">{profile.sub}</p>
          </div>
        </div>
        <div className="hero-copy sm:hidden">
          <p className="intro mt-4 text-[17px] leading-snug text-paper">{profile.headline}</p>
          <p className="intro mt-2 text-[12px] leading-relaxed text-dim">{profile.sub}</p>
        </div>

        <div className="intro mt-5 sm:mt-7">
          <div className="hero-links-rule h-px origin-left bg-white/10" />
          <nav className="mt-4 grid grid-cols-4 gap-2" aria-label="Seções">
            {navLinks.map((l) => (
              <div key={l.id}>
                <button type="button" onClick={() => go(l.id)} className={`hero-link ${navLinkClass} hover:text-claude`}>
                  <NavLinkText index={l.index} label={l.label} />
                </button>
              </div>
            ))}
          </nav>
        </div>

        <div className="hero-socials mt-5">
          <div className="intro flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="font-pixel text-[9px] uppercase tracking-[0.16em] text-dim transition-colors hover:text-paper"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
            <span className="flex items-center gap-2 font-pixel text-[9px] uppercase tracking-[0.16em] text-signal">
              <span className="h-1.5 w-1.5 bg-signal" />
              {profile.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
