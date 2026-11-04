"use client";

import { useState, type FormEvent } from "react";
import { profile, socials } from "@/lib/content";

type Status = "idle" | "sending" | "sent";

export function Contact() {
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
      <div className="flex h-full flex-col justify-center overflow-y-auto p-5 md:p-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <h2 id="contact-title" tabIndex={-1} className="display outline-none">
            Vamos conversar
          </h2>
          <p className="mt-5 max-w-[32ch] text-[17px] leading-snug text-dim md:text-[19px]">
            Tem um produto para tirar do papel ou um processo que come o dia do seu time? Me conta.
          </p>
          <div className="mt-6 hidden flex-wrap gap-x-6 gap-y-2 text-[15px] lg:flex">
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="text-dim transition-colors hover:text-paper"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="contact-form glass relative mt-6 w-full overflow-hidden lg:mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <label className="field sm:border-r">
              <span>Nome</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label className="field border-t sm:border-t-0">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
          </div>
          <label className="field border-t">
            <span>Sobre o projeto</span>
            <textarea name="message" required rows={3} />
          </label>
          <button
            type="submit"
            disabled={status !== "idle"}
            className="m-2 w-[calc(100%-1rem)] rounded-[20px] bg-paper px-5 py-4 text-left text-[16px] font-medium text-ink transition-opacity hover:opacity-85 disabled:opacity-70"
          >
            {status === "idle" ? "Enviar mensagem" : status === "sending" ? "Enviando…" : "Mensagem enviada. Respondo por email."}
          </button>
        </form>
        <p className="mt-4 text-[13px] text-faint lg:col-span-2">
          {profile.location}. © {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </section>
  );
}
