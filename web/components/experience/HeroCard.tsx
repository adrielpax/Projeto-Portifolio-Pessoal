"use client";

import { navLinks, profile, socials, type SectionId } from "@/lib/content";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { NavLinkText, navLinkClass } from "./NavLinkText";

/**
 * Card do hero: a foto ocupa o card inteiro, revelada por um degradê
 * transparente à direita; à esquerda, vidro escuro com o texto.
 *
 * Ao rolar, a timeline em Experience.tsx:
 *  - apaga a foto e faz o recorte do rosto (.hero-avatar) voar até a navbar
 *  - leva cada .hero-link até o .nav-slot correspondente (vira os links da navbar)
 *  - troca .hero-card-bg pela .frame, que se expande e vira a moldura das seções
 */
export function HeroCard({ go }: { go: (id: SectionId) => void }) {
  return (
    <div className="hero-card cut pointer-events-auto relative w-[min(760px,calc(100vw-24px))]">
      <div className="hero-card-bg glass cut absolute inset-0" />

      {/* foto em tela cheia no card, com degradê que funde no vidro */}
      <div className="hero-photo cut pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.avatar} alt="" className="hero-photo__img absolute inset-y-0 right-0 h-full w-[72%] object-cover object-[50%_22%] [mask-image:linear-gradient(90deg,transparent,#000_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.78)_34%,rgba(0,0,0,0.15)_68%,rgba(0,0,0,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(0,0,0,0.75),transparent)]" />
      </div>

      {/* recorte do rosto: invisível no card, aparece quando voa para a navbar */}
      <div className="hero-avatar pointer-events-none invisible absolute right-[18%] top-[14%] h-[96px] w-[96px] origin-top-left opacity-0" aria-hidden>
        <ProfilePhoto className="h-full w-full" alt="" />
      </div>

      <div className="relative p-6 sm:p-9 md:p-11">
        <div className="hero-copy max-w-[58%] min-w-[260px]">
          <h1 className="intro font-display text-[46px] font-semibold uppercase leading-[0.86] sm:text-[68px] md:text-[84px]">
            {profile.name}
          </h1>
          <p className="intro mt-6 max-w-[20ch] text-[24px] font-semibold leading-[1.08] sm:text-[30px]">{profile.headline}</p>
          <p className="intro mt-3 max-w-[42ch] text-[15px] leading-relaxed text-paper/70">{profile.sub}</p>
          <div className="intro mt-6 flex flex-wrap items-center gap-4">
            {profile.cta.href ? (
              <a href={profile.cta.href} target="_blank" rel="noreferrer" className="para bg-paper px-6 py-2.5 text-[15px] font-semibold text-ink transition-opacity hover:opacity-85">
                {profile.cta.label}
              </a>
            ) : (
              <button type="button" onClick={() => go("contact")} className="para bg-paper px-6 py-2.5 text-[15px] font-semibold text-ink transition-opacity hover:opacity-85">
                {profile.cta.label}
              </button>
            )}
            <span className="flex items-center gap-2 text-[13px] text-paper/70">
              <span className="led" style={{ ["--led" as string]: "#3ddc84" }} aria-hidden />
              {profile.status}
            </span>
          </div>
        </div>

        <div className="intro mt-8">
          <div className="hero-links-rule h-px origin-left bg-white/20" />
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
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-paper/60">
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
          </div>
        </div>
      </div>
    </div>
  );
}
