import type { Metadata } from "next";
import Link from "next/link";
import { linktree, profile } from "@/lib/content";
import { PixelAvatar } from "@/components/pixel/PixelAvatar";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { claudeSprite, codexSprite } from "@/components/pixel/sprites";

export const metadata: Metadata = {
  title: `Links · ${profile.name}`,
  description: `Todos os links de ${profile.name} num só lugar.`,
};

/** Página estilo "linktree": leve (sem WebGL) e pensada para o link da bio. */
export default function LinksPage() {
  return (
    <main className="links-bg relative flex min-h-[100svh] justify-center px-4 py-10 sm:py-16">
      <div className="relative w-full max-w-[440px]">
        <div className="pointer-events-none absolute -left-2 -top-4 hidden sm:block">
          <div className="agent-float" style={{ ["--bob-dur" as string]: "5.5s" }}>
            <PixelSprite sprite={claudeSprite} px={3} />
          </div>
        </div>
        <div className="pointer-events-none absolute -right-2 top-24 hidden sm:block">
          <div className="agent-float" style={{ ["--bob-dur" as string]: "6.5s", ["--bob-delay" as string]: "-2s" }}>
            <PixelSprite sprite={codexSprite} px={3} />
          </div>
        </div>

        <header className="flex flex-col items-center text-center">
          <div className="brackets p-2">
            <PixelAvatar src={profile.avatar} crop={profile.avatarCrop} grid={32} interactive className="h-[104px] w-[104px]" alt={`Foto de ${profile.name}`} />
          </div>
          <h1 className="mt-5 font-pixel text-[22px] uppercase tracking-[0.04em]">{profile.name}</h1>
          <p className="mt-2 font-pixel text-[9px] uppercase tracking-[0.22em] text-dim">
            {profile.role} · {profile.focus.join(" · ")}
          </p>
          <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-paper/80">{profile.headline}</p>
          <span className="mt-4 flex items-center gap-2 font-pixel text-[9px] uppercase tracking-[0.18em] text-signal">
            <span className="h-1.5 w-1.5 animate-pulse bg-signal" />
            {profile.status}
          </span>
        </header>

        <ul className="mt-9 flex flex-col gap-2.5">
          {linktree.map((l, i) => {
            const external = l.href.startsWith("http") || l.href.startsWith("mailto");
            const inner = (
              <>
                <span className="font-pixel text-[9px] text-dim group-hover:text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="block font-pixel text-[13px] uppercase tracking-[0.1em]">{l.label}</span>
                  <span className="mt-1 block text-[11px] text-dim group-hover:text-ink/60">{l.note}</span>
                </span>
                <span className="font-pixel text-[11px] transition-transform group-hover:translate-x-1">{external ? "↗" : "→"}</span>
              </>
            );
            const cls =
              "group flex items-center gap-4 border border-white/12 bg-ink/70 px-4 py-4 backdrop-blur-sm transition-colors duration-200 hover:bg-paper hover:text-ink";
            return (
              <li key={l.label}>
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

        <footer className="mt-10 flex items-center justify-between font-pixel text-[8px] uppercase tracking-[0.2em] text-faint">
          <span>adriel.sys / links</span>
          <span>{profile.location}</span>
        </footer>
      </div>
    </main>
  );
}
