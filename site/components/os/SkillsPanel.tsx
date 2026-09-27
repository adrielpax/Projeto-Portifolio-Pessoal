"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";

type Skill = { name: string; icon: string; ai?: boolean };
type Group = { label: string; items: Skill[] };

const groups: Group[] = [
  {
    label: "IA & Agentes",
    items: [
      { name: "Claude Code", icon: "/images/skills/claude.svg", ai: true },
      { name: "OpenAI", icon: "/images/skills/openai.svg", ai: true },
      { name: "n8n", icon: "/images/skills/n8n.png" },
    ],
  },
  {
    label: "Front-end",
    items: [
      { name: "Next.js", icon: "/images/skills/nextjs.jpeg" },
      { name: "React", icon: "/images/skills/react.png" },
      { name: "TypeScript", icon: "/images/skills/typescript.png" },
      { name: "JavaScript", icon: "/images/skills/javascript.png" },
      { name: "Tailwind CSS", icon: "/images/skills/tailwindcss.png" },
      { name: "HTML5", icon: "/images/skills/html5.png" },
      { name: "CSS", icon: "/images/skills/css.png" },
    ],
  },
  {
    label: "Back-end & Dados",
    items: [
      { name: "Node.js", icon: "/images/skills/nodejs.jpeg" },
      { name: "Python", icon: "/images/skills/python.png" },
      { name: "Java", icon: "/images/skills/java.png" },
      { name: "Spring Boot", icon: "/images/skills/springboot.png" },
      { name: "PostgreSQL", icon: "/images/skills/postgresql.png" },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { name: "Git", icon: "/images/skills/git.png" },
      { name: "GitHub", icon: "/images/skills/github.png" },
      { name: "Docker", icon: "/images/skills/docker.jpg" },
      { name: "WordPress", icon: "/images/skills/wordpress.png" },
    ],
  },
];

const total = groups.reduce((n, g) => n + g.items.length, 0);

export default function SkillsPanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="hud-panel overflow-hidden">
      {/* Cabeçalho clicável */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-hud-accent/12 text-hud-accent ring-1 ring-hud-accent/25">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="flex-1">
          <span className="block font-display text-base font-semibold tracking-tight text-hud-text">
            Habilidades técnicas
          </span>
          <span className="hud-label">{total} tecnologias · 4 áreas</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-hud-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="skills-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-hud-line px-5 py-5">
              {groups.map((group) => (
                <div key={group.label}>
                  <span className="hud-label mb-2.5 flex items-center gap-2">
                    {group.label}
                    <span className="h-px flex-1 bg-hud-line" />
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {group.items.map((s, i) => (
                      <motion.div
                        key={s.name}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        className="group/skill relative"
                      >
                        <div
                          className={`relative grid h-14 w-14 place-items-center rounded-2xl border bg-white/[0.06]
                          shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                          transition-all duration-300 group-hover/skill:-translate-y-1
                          group-hover/skill:shadow-[0_12px_26px_rgba(255,255,255,0.12)]
                          ${s.ai ? "border-hud-accent/40" : "border-hud-line"}`}
                        >
                          <Image
                            src={s.icon}
                            alt={s.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-md object-contain"
                          />
                          {s.ai && (
                            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-hud-accent text-hud-accent-fg shadow">
                              <Sparkles className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>
                        {/* Tooltip */}
                        <span
                          className="pointer-events-none absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap
                          rounded-md bg-hud-text px-2 py-1 font-mono text-[10px] text-hud-bg opacity-0
                          transition-opacity duration-200 group-hover/skill:opacity-100"
                        >
                          {s.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
