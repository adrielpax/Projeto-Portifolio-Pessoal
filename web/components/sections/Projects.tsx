"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cases, projects, type CaseStudy, type Project } from "@/lib/content";
import { SectionHeader, monthYear } from "./SectionHeader";

/** imagem do projeto, ou uma capa gerada (cor + nome do repositório) enquanto não há captura */
function Cover({ p, large = false }: { p: Project; large?: boolean }) {
  if (p.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.image} alt={`Tela do projeto ${p.title}`} className="h-full w-full object-cover object-top" draggable={false} />;
  }
  return (
    <div
      className="flex h-full w-full items-end p-3"
      style={{ background: `radial-gradient(120% 140% at 0% 0%, ${p.tint}50, transparent 62%), linear-gradient(160deg, #15161a, #0a0a0c)` }}
      role="img"
      aria-label={`Capa do projeto ${p.title}`}
    >
      <span className={`font-mono text-white/55 ${large ? "text-[15px]" : "text-[11px]"}`}>{p.repo}</span>
    </div>
  );
}

/** linhas "chave / valor" no estilo de painel industrial */
function Spec({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-t border-white/8 py-1 text-[12px]">
      <span className="text-dim">{k}</span>
      <span className="truncate text-paper/85">{v}</span>
    </div>
  );
}

/** janela no estilo Quick Look do macOS com o projeto em destaque */
function QuickLook({ p, onClose }: { p: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="quicklook-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        onClick={(e) => e.stopPropagation()}
        className="quicklook glass relative flex max-h-[88vh] w-[min(980px,100%)] flex-col overflow-hidden"
      >
        <div className="window-bar relative flex h-11 shrink-0 items-center px-4">
          <div className="flex gap-2">
            <button ref={closeRef} type="button" className="traffic bg-[#ff5f57]" onClick={onClose} aria-label="Fechar" />
            <span className="traffic bg-[#febc2e]" aria-hidden />
            <span className="traffic bg-[#28c840]" aria-hidden />
          </div>
          <p className="absolute left-1/2 -translate-x-1/2 font-mono text-[12px] text-paper/70">{p.repo}</p>
        </div>
        <div className="h-[min(48vh,540px)] w-full shrink-0 overflow-hidden bg-black">
          <Cover p={p} large />
        </div>
        <div className="grid min-h-0 gap-6 overflow-y-auto p-6 md:grid-cols-[1fr_280px] md:p-7">
          <div>
            <h3 className="font-display text-[30px] font-semibold uppercase leading-none">{p.title}</h3>
            <p className="mt-3 max-w-[56ch] text-[15px] leading-snug text-paper/75">{p.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.demo && (
                <a href={p.demo} target="_blank" rel="noreferrer" className="para bg-paper px-5 py-2 text-[14px] font-semibold text-ink">
                  Abrir site
                </a>
              )}
              <a href={p.href} target="_blank" rel="noreferrer" className="para bg-white/12 px-5 py-2 text-[14px] font-semibold">
                Ver código
              </a>
            </div>
          </div>
          <div>
            <Spec k="Repositório" v={p.repo} />
            <Spec k="Linguagem" v={p.language} />
            <Spec k="Último push" v={monthYear(p.pushed)} />
            <Spec k="Publicado" v={p.demo ? new URL(p.demo).host : "não"} />
            <Spec k="Tags" v={p.tags.join(", ")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** estudo de caso: problema, solução e resultado mensurável */
function CaseCard({ c }: { c: CaseStudy }) {
  return (
    <article className="glass glass-sm relative flex min-w-[78vw] snap-start flex-col overflow-hidden sm:min-w-0">
      {c.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.image} alt="" className="h-28 w-full object-cover object-top" />
      )}
      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-[11px] uppercase tracking-[0.06em] text-dim">{c.client}</span>
        <h3 className="mt-1 font-display text-[19px] font-semibold uppercase leading-none">{c.title}</h3>
        <p className="mt-2 font-display text-[22px] font-semibold leading-none text-[#3ddc84]">{c.result}</p>
        <div className="mt-auto pt-2">
          <Spec k="Problema" v={c.problem} />
          <Spec k="Solução" v={c.solution} />
          <Spec k="Stack" v={c.stack.join(", ")} />
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const published = projects.filter((p) => p.demo).length;
  const shown = projects.slice(0, Math.max(0, 6 - cases.length));
  const many = cases.length + shown.length > 4;

  const close = () => {
    setOpen(null);
    lastFocus.current?.focus();
  };

  return (
    <section className="sec sec-projects frame-inset invisible opacity-0" aria-labelledby="projects-title">
      <div className="flex h-full flex-col overflow-hidden p-4 md:px-8 md:pb-6 md:pt-5">
        <SectionHeader
          code="Tela 01"
          title="Projetos"
          id="projects-title"
          meta={
            <>
              {cases.length > 0 && <>{cases.length} estudos de caso, </>}
              {projects.length} repositórios em destaque, {published} publicados
              <br />
              <a href="https://github.com/adrielpax" target="_blank" rel="noreferrer" className="text-paper underline-offset-2 hover:underline">
                github.com/adrielpax
              </a>
            </>
          }
        />

        <div className={`projects-grid -mx-4 mt-4 flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-y-auto sm:px-0 lg:grid-rows-2 lg:overflow-visible ${many ? "lg:grid-cols-3" : ""}`}>
          {cases.map((c) => (
            <CaseCard key={c.title} c={c} />
          ))}
          {shown.map((p) => (
            <button
              key={p.repo}
              type="button"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(p);
              }}
              aria-label={`Detalhes de ${p.title}`}
              className="glass glass-sm glass-hover group relative flex h-[min(52vh,400px)] min-h-0 min-w-[78vw] snap-start flex-col self-start overflow-hidden text-left sm:h-auto sm:min-w-0 sm:self-stretch"
            >
              <div className="relative h-[42%] min-h-[96px] w-full shrink-0 overflow-hidden">
                <Cover p={p} />
                {p.demo && (
                  <span className="para absolute right-2 top-2 bg-paper px-3 py-0.5 text-[11px] font-semibold text-ink">No ar</span>
                )}
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate font-display text-[19px] font-semibold uppercase leading-none">{p.title}</h3>
                  <span className="shrink-0 text-[11px] text-dim tabular-nums">{monthYear(p.pushed)}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-paper/65">{p.description}</p>
                <div className="mt-auto pt-2">
                  <Spec k={p.language} v={p.tags.join(", ")} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {open && createPortal(<QuickLook p={open} onClose={close} />, document.body)}
    </section>
  );
}
