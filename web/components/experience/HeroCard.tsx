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
      <div className="hero-card-bg glass glass-clear cut absolute inset-0" />

      {/* foto em tela cheia no card, com degradê que funde no vidro */}
      <div className="hero-photo cut pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* celular: foto em cima, rosto visível, desfazendo no vidro; desktop: foto à direita */}
        <img
          src={profile.avatar}
          alt=""
          className="hero-photo__img absolute inset-x-0 top-0 h-[260px] w-full object-cover object-[50%_18%] [mask-image:linear-gradient(180deg,#000_45%,transparent_92%)] sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-full sm:w-[72%] sm:object-[50%_22%] sm:[mask-image:linear-gradient(90deg,transparent,#000_42%)]"
        />
        {/* degradê que termina no vidro (translúcido), não no preto */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(10,12,16,0.5)_0%,rgba(10,12,16,0.28)_40%,rgba(10,12,16,0)_72%)] sm:block" />
      </div>

      {/* recorte do rosto: invisível no card, aparece quando voa para a navbar */}
      <div className="hero-avatar pointer-events-none invisible absolute right-[18%] top-[14%] h-[96px] w-[96px] origin-top-left opacity-0" aria-hidden>
        <ProfilePhoto className="h-full w-full" alt="" />
      </div>

      <div className="relative p-5 pt-[200px] [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] sm:p-9 sm:pt-9 md:p-11">
        <div className="hero-copy sm:max-w-[58%] sm:min-w-[260px]">
          <h1 className="intro font-display text-[40px] font-semibold uppercase leading-[0.86] sm:text-[68px] md:text-[84px]">
            {profile.name}
          </h1>
          <p className="intro mt-4 max-w-[20ch] text-[21px] font-semibold leading-[1.08] sm:mt-6 sm:text-[30px]">{profile.headline}</p>
          <p className="intro mt-2 max-w-[42ch] text-[14px] leading-snug text-paper/70 sm:mt-3 sm:text-[15px] sm:leading-relaxed">{profile.sub}</p>
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

        <div className="intro mt-5 sm:mt-8">
          <div className="hero-links-rule h-px origin-left bg-white/20" />
          <nav className="mt-5 flex flex-wrap gap-x-7 gap-y-3" aria-label="Seções">
            {navLinks.map((l) => (
              <button key={l.id} type="button" onClick={() => go(l.id)} className={`hero-link ${navLinkClass} hover:opacity-60`}>
                <NavLinkText label={l.label} />
              </button>
            ))}
          </nav>
        </div>

        <div className="hero-socials mt-6 hidden sm:block">
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
