"use client";

import { useRef, type ReactNode } from "react";
import type { SectionId } from "@/lib/content";

type Item = {
  id: string;
  label: string;
  /** gradiente do ícone, como os apps do macOS */
  tile: string;
  icon: ReactNode;
  section?: SectionId;
  href?: string;
};

const TILE = "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))";

const stroke = { stroke: "rgba(255,255,255,0.92)", strokeWidth: 1.5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ITEMS: (Item | "divider")[] = [
  {
    id: "projects",
    label: "Projetos",
    section: "projects",
    tile: TILE,
    icon: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" {...stroke} />,
  },
  {
    id: "stack",
    label: "Stack",
    section: "stack",
    tile: TILE,
    icon: (
      <g {...stroke}>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
      </g>
    ),
  },
  {
    id: "blog",
    label: "Blog",
    section: "blog",
    tile: TILE,
    icon: <path d="M7 4h7l4 4v12H7zM14 4v4h4M9.5 12h6M9.5 15.5h6" {...stroke} />,
  },
  {
    id: "contact",
    label: "Contato",
    section: "contact",
    tile: TILE,
    icon: <path d="M4 7h16v10H4zM4 7l8 6 8-6" {...stroke} />,
  },
  "divider",
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/adrielpax",
    tile: TILE,
    icon: <path d="M9 18l-5-6 5-6M15 6l5 6-5 6" {...stroke} />,
  },
  {
    id: "links",
    label: "Links",
    href: "/links",
    tile: TILE,
    icon: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" {...stroke} />,
  },
];

/** Dock do macOS: ícones crescem perto do ponteiro e um ponto marca a seção aberta */
export function Dock({ active, go }: { active: SectionId; go: (id: SectionId) => void }) {
  const icons = useRef<(HTMLElement | null)[]>([]);

  const magnify = (x: number | null) => {
    icons.current.forEach((el) => {
      if (!el) return;
      if (x === null || document.documentElement.classList.contains("a11y-reduce-motion")) {
        el.style.transform = "";
        return;
      }
      const r = el.getBoundingClientRect();
      const d = Math.abs(x - (r.left + r.width / 2));
      const s = 1 + 0.55 * Math.max(0, 1 - d / 110);
      el.style.transform = `translateY(${-(s - 1) * 22}px) scale(${s})`;
    });
  };

  let i = -1;
  return (
    <nav
      aria-label="Dock"
      className="nav-chrome dock glass invisible fixed bottom-3 left-1/2 z-50 hidden -translate-x-1/2 items-end gap-2 px-2.5 pb-2 pt-2.5 opacity-0 md:flex"
      onPointerMove={(e) => magnify(e.clientX)}
      onPointerLeave={() => magnify(null)}
    >
      {ITEMS.map((it, k) => {
        if (it === "divider") return <span key={k} className="mx-1 h-11 w-px self-center bg-white/20" aria-hidden />;
        i++;
        const idx = i;
        const isActive = it.section === active;
        const tile = (
          <span
            ref={(el) => {
              icons.current[idx] = el;
            }}
            className="dock-icon flex h-12 w-12 items-center justify-center cut-sm"
            style={{ background: it.tile }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
              {it.icon}
            </svg>
          </span>
        );
        const label = <span className="dock-label glass glass-sm">{it.label}</span>;
        const dot = <span className={`mt-1 h-1 w-3 ${isActive ? "bg-paper" : "bg-transparent"}`} aria-hidden />;
        const cls = "group relative flex flex-col items-center outline-none";
        return it.section ? (
          <button key={it.id} type="button" className={cls} onClick={() => go(it.section!)} aria-label={it.label} aria-current={isActive ? "true" : undefined}>
            {label}
            {tile}
            {dot}
          </button>
        ) : (
          <a key={it.id} href={it.href} className={cls} aria-label={it.label} target={it.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {label}
            {tile}
            {dot}
          </a>
        );
      })}
    </nav>
  );
}
