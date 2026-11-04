import type { Metadata } from "next";
import Link from "next/link";
import { linktree, profile } from "@/lib/content";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { claudeSprite, codexSprite } from "@/components/pixel/sprites";

export const metadata: Metadata = {
  title: `Links de ${profile.name}`,
  description: `Todos os links de ${profile.name} num só lugar.`,
};

/** Página estilo "linktree": leve (sem WebGL) e pensada para o link da bio. */
export default function LinksPage() {
  return (
    <main className="relative flex min-h-[100svh] justify-center bg-ink px-5 py-12 sm:py-20">
      <div className="relative w-full max-w-[460px]">
        <header>
          <div className="flex items-end justify-between">
            <ProfilePhoto className="h-[96px] w-[96px]" />
            <div className="flex items-end gap-3 pb-1" aria-hidden>
              <div className="agent-float" style={{ ["--bob-dur" as string]: "5.5s" }}>
                <PixelSprite sprite={claudeSprite} px={3} />
              </div>
              <div className="agent-float" style={{ ["--bob-dur" as string]: "6.5s", ["--bob-delay" as string]: "-2s" }}>
                <PixelSprite sprite={codexSprite} px={3} />
              </div>
            </div>
          </div>
          <h1 className="mt-6 font-display text-[40px] font-semibold leading-none">{profile.name}</h1>
          <p className="mt-3 text-[18px] leading-snug text-dim">{profile.headline}</p>
        </header>

        <ul className="mt-10 border-t border-white/20">
          {linktree.map((l) => {
            const external = l.href.startsWith("http") || l.href.startsWith("mailto");
            const inner = (
              <>
                <span className="font-display text-[24px] font-semibold leading-none">{l.label}</span>
                <span className="text-[15px] text-dim">{l.note}</span>
              </>
            );
            const cls = "flex items-baseline justify-between gap-4 py-5 transition-opacity hover:opacity-60";
            return (
              <li key={l.label} className="border-b border-white/20">
                {external ? (
                  <a href={l.href} target="_blank" rel="noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={l.href} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-[14px] text-dim">
          {profile.status}. Betim, MG.
        </p>
      </div>
    </main>
  );
}
