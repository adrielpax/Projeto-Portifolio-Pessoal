"use client";

import { useState, type FormEvent } from "react";
import { profile, socials } from "@/lib/content";
import { Scramble } from "@/components/experience/Scramble";

type Status = "idle" | "sending" | "sent";

export function Contact({ active }: { active: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("sending");
    // TODO (fase 3): POST /api/contact com validação, rate limit e envio por email
    window.setTimeout(() => setStatus("sent"), 1200);
  };

  return (
    <section className="sec sec-contact frame-inset invisible opacity-0" aria-labelledby="contact-title">
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto p-4 text-center md:p-8">
        <div className="reveal kicker">04 // canal aberto</div>
        <h2 id="contact-title" className="reveal display mt-3 !text-[30px] sm:!text-[44px] md:!text-[60px]">
          <Scramble text="Vamos construir" play={active} />
          <br />
          algo juntos?
        </h2>
        <p className="reveal mt-4 max-w-[46ch] text-[13px] leading-relaxed text-dim">
          Um produto, uma automação ou aquele sistema que ninguém quis encarar. Me conta o que você precisa.
        </p>

        <form onSubmit={onSubmit} className="reveal contact-form mt-6 w-full max-w-[560px] border border-white/12 bg-ink/85 text-left backdrop-blur-sm md:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <label className="field sm:border-r">
              <span>Nome</span>
              <input name="name" required autoComplete="name" placeholder="Seu nome" />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="voce@empresa.com" />
            </label>
          </div>
          <label className="field border-t">
            <span>Mensagem</span>
            <textarea name="message" required rows={3} placeholder="Conte sobre o projeto…" />
          </label>
          <button
            type="submit"
            className="flex w-full items-center justify-between border-t border-white/12 px-4 py-3.5 font-pixel text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-paper hover:text-ink"
          >
            <span>{status === "idle" ? "Transmitir mensagem" : status === "sending" ? "Transmitindo…" : "Mensagem recebida ✓"}</span>
            <span>{status === "sent" ? "" : "→"}</span>
          </button>
        </form>

        <div className="reveal mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {socials.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="font-pixel text-[9px] uppercase tracking-[0.16em] text-dim transition-colors hover:text-paper"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
        <div className="reveal mt-3 font-pixel text-[8px] uppercase tracking-[0.2em] text-faint">
          {profile.location} · © {new Date().getFullYear()} {profile.name}
        </div>
      </div>
    </section>
  );
}
