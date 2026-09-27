"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import SystemClock from "./SystemClock";
import ReadingModeToggle from "./ReadingModeToggle";

export default function Topbar({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  // Atalho ⌘K / Ctrl+K para focar a busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/blog?q=${encodeURIComponent(term)}` : "/blog");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hud-line bg-hud-bg/80 px-3 backdrop-blur-xl md:px-5">
      <button
        onClick={onOpenMobileNav}
        aria-label="Abrir menu"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-hud-muted transition-colors
        active:scale-95 hover:bg-white/[0.06] hover:text-hud-text md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Busca nos posts do blog */}
      <form onSubmit={submit} className="relative min-w-0 flex-1 sm:max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-hud-muted" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar no blog…"
          aria-label="Buscar posts no blog"
          enterKeyHint="search"
          className="h-11 w-full rounded-xl border border-hud-line bg-white/5 pl-9 pr-3
          font-mono text-base text-hud-text placeholder:text-hud-muted/70 backdrop-blur
          outline-none transition-colors focus:border-hud-accent/50 sm:h-10 sm:pr-16 sm:text-sm"
        />
        {/* Atalho só faz sentido onde existe teclado */}
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-muted sm:block">
          ⌘K
        </kbd>
      </form>

      {/* Status ao vivo + modo leitura */}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <ReadingModeToggle />
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
        <SystemClock />
        <span className="flex items-center gap-1.5 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="hud-label !text-emerald-400">online</span>
        </span>
        </div>
      </div>
    </header>
  );
}
