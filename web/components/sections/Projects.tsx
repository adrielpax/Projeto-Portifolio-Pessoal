"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projects, type Project } from "@/lib/content";

/** imagem do projeto, ou uma capa gerada (cor + título) enquanto não há captura */
function Cover({ p, large = false }: { p: Project; large?: boolean }) {
  if (p.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.image} alt={`Tela do projeto ${p.title}`} className="h-full w-full object-cover object-top" draggable={false} />;
  }
  return (
    <div
      className="flex h-full w-full items-end p-4"
      style={{ background: `radial-gradient(120% 120% at 0% 0%, ${p.tint}55, transparent 60%), linear-gradient(160deg, #15161a, #0a0a0c)` }}
      role="img"
      aria-label={`Capa do projeto ${p.title}`}
    >
      <span className={`font-display font-semibold leading-none text-white/85 ${large ? "text-[56px]" : "text-[30px]"}`}>{p.title}</span>
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
          <p className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-paper/70">{p.title}</p>
        </div>
        <div className="h-[min(50vh,560px)] w-full shrink-0 overflow-hidden bg-black">
          <Cover p={p} large />
        </div>
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[14px] text-dim">
              {p.status}, {p.year}
            </p>
            <h3 className="mt-2 font-display text-[34px] font-semibold leading-none">{p.title}</h3>
            <p className="mt-3 max-w-[56ch] text-[16px] leading-snug text-dim">{p.description}</p>
            <p className="mt-3 text-[14px] text-paper/70">{p.tags.join(", ")}</p>
          </div>
          <a href={p.href} target="_blank" rel="noreferrer" className="para shrink-0 bg-paper px-6 py-2.5 text-[15px] font-medium text-ink">
            Abrir no GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = () => {
    setOpen(null);
    lastFocus.current?.focus();
  };

  return (
    <section className="sec sec-projects frame-inset invisible opacity-0" aria-labelledby="projects-title">
      <div className="flex h-full flex-col overflow-hidden p-5 md:px-10 md:pb-8 md:pt-6">
        <div className="flex items-end justify-between gap-6">
          <h2 id="projects-title" tabIndex={-1} className="display outline-none">
            Projetos
          </h2>
          <a href="https://github.com/adrielpax" target="_blank" rel="noreferrer" className="btn-line mb-2 hidden sm:inline-flex">
            Ver tudo no GitHub
          </a>
        </div>

        <div className="projects-grid -mx-5 mt-5 flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:grid-rows-2 sm:overflow-visible sm:px-0 md:gap-5">
          {projects.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(p);
              }}
              aria-label={`Ver ${p.title}`}
              className="glass glass-hover group relative flex min-h-0 min-w-[80vw] snap-start overflow-hidden text-left sm:min-w-0"
            >
              <div className="relative h-full w-[42%] shrink-0 overflow-hidden">
                <Cover p={p} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
                <span className="text-[13px] text-dim">
                  {p.status}, {p.year}
                </span>
                <h3 className="mt-2 font-display text-[22px] font-semibold leading-none md:text-[28px]">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-dim md:text-[15px]">{p.description}</p>
                <span className="mt-auto pt-3 text-[13px] text-paper/70">{p.tags.join(", ")}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {open && createPortal(<QuickLook p={open} onClose={close} />, document.body)}
    </section>
  );
}
