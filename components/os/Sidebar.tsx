"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Newspaper,
  ShieldCheck,
  Gamepad2,
  MessageSquare,
  ChevronsLeft,
  Terminal,
} from "lucide-react";
import { LINKS } from "@/lib/site";

const nav = [
  { href: "/", label: "Sistema", code: "SYS", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/projetos", label: "Projetos", code: "PRJ", icon: FolderGit2, match: (p: string) => p.startsWith("/projetos") },
  { href: "/blog", label: "Blog", code: "LOG", icon: Newspaper, match: (p: string) => p.startsWith("/blog") },
  { href: "/certificacoes", label: "Certificações", code: "CRT", icon: ShieldCheck, match: (p: string) => p.startsWith("/certificacoes") },
  { href: "/jogo", label: "Jogo", code: "GME", icon: Gamepad2, match: (p: string) => p.startsWith("/jogo") },
] as const;

export default function Sidebar({
  collapsed,
  onToggle,
  variant = "desktop",
}: {
  collapsed: boolean;
  onToggle: () => void;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <aside
      className={`h-dvh shrink-0 flex-col border-r border-hud-line
      bg-hud-surface/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.45)] transition-[width] duration-300 ease-out
      ${isMobile ? "flex w-64" : `sticky top-0 hidden md:flex ${collapsed ? "w-16" : "w-60"}`}`}
    >
      {/* Marca */}
      <Link
        href="/"
        className="flex h-16 items-center gap-3 border-b border-hud-line px-4"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-hud-accent/15 text-hud-accent ring-1 ring-hud-accent/30">
          <Terminal className="h-5 w-5" />
        </span>
        {!collapsed && (
          <span className="overflow-hidden">
            <span className="block font-display text-sm font-bold leading-none tracking-widest text-hud-text">
              AdrielDev
            </span>
            <span className="hud-label">Portfólio · 2026</span>
          </span>
        )}
      </Link>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 p-2.5">
        {!collapsed && <span className="hud-label px-2.5 pb-1 pt-2">Navegação</span>}
        {nav.map(({ href, label, code, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors
              ${active ? "bg-hud-accent/10 text-hud-text" : "text-hud-muted hover:bg-white/[0.06] hover:text-hud-text"}`}
            >
              {active && (
                <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-hud-detail" />
              )}
              <Icon className={`h-5 w-5 shrink-0 ${active ? "text-hud-accent" : ""}`} strokeWidth={active ? 2.3 : 1.9} />
              {!collapsed && (
                <span className="flex-1 font-display text-[13px] font-medium tracking-wide">
                  {label}
                </span>
              )}
              {!collapsed && (
                <span className="hud-label opacity-60 group-hover:opacity-100">{code}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé: contato + colapso */}
      <div className="border-t border-hud-line p-2.5">
        <a
          href={LINKS.chat}
          target="_blank"
          rel="noopener noreferrer"
          title="Contato"
          className="btn-primary gap-3 rounded-lg px-3 py-2.5"
        >
          <MessageSquare className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          {!collapsed && (
            <span className="font-display text-[13px] font-semibold tracking-wide">Contato</span>
          )}
        </a>
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`mt-2 w-full items-center gap-3 rounded-lg px-3 py-2 text-hud-muted
          transition-colors hover:bg-white/[0.06] hover:text-hud-text ${
            isMobile ? "hidden" : "flex"
          }`}
        >
          <ChevronsLeft
            className={`h-5 w-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
          {!collapsed && <span className="hud-label">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
