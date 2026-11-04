"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { profile, socials } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";

export function Contact() {
  const [opened, setOpened] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // recado escrito no mini chat do Claude/Codex chega aqui
  useEffect(() => {
    const onConnect = (e: Event) => {
      const msg = (e as CustomEvent<{ message?: string }>).detail?.message;
      if (msg && messageRef.current) messageRef.current.value = msg;
    };
    window.addEventListener("agent:connect", onConnect);
    return () => window.removeEventListener("agent:connect", onConnect);
  }, []);

  // envio real: abre o app de email com a mensagem pronta (sem backend, sem fingir)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `Projeto: contato de ${f.get("name")}`;
    const body = `${f.get("message")}\n\n${f.get("name")} (${f.get("email")})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <section className="sec sec-contact frame-inset invisible opacity-0" aria-labelledby="contact-title">
      <div className="flex h-full flex-col overflow-y-auto p-4 md:px-8 md:pb-6 md:pt-5">
        <SectionHeader code="Tela 04" title="Contato" id="contact-title" meta={<>{profile.location}<br />{profile.status}</>} />
        <div className="mt-6 flex flex-1 flex-col justify-center gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p className="max-w-[24ch] font-display text-[34px] font-semibold uppercase leading-[0.95] md:text-[44px]">Vamos construir algo que funcione.</p>
          <p className="mt-4 max-w-[38ch] text-[15px] leading-snug text-paper/70">
            Tem um produto para tirar do papel ou um processo que come o dia do seu time? Me conta.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
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

        {profile.email ? (
        <form onSubmit={onSubmit} className="contact-form glass relative w-full overflow-hidden">
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
            <textarea ref={messageRef} name="message" required rows={3} />
          </label>
          <button
            type="submit"
            className="para m-2 w-[calc(100%-1rem)] bg-paper px-6 py-3.5 text-left text-[15px] font-semibold text-ink transition-opacity hover:opacity-85"
          >
            {opened ? "Seu app de email abriu com a mensagem. Só enviar." : "Escrever email"}
          </button>
        </form>
        ) : (
          <a href="https://github.com/adrielpax" target="_blank" rel="noreferrer" className="glass relative block p-6 text-[15px]">
            <span className="font-display text-[22px] font-semibold uppercase">github.com/adrielpax</span>
            <span className="mt-1 block text-paper/65">Enquanto o email público não está configurado, o contato é pelo GitHub.</span>
          </a>
        )}
        </div>
        <p className="mt-4 text-[12px] text-faint">© {new Date().getFullYear()} {profile.name}</p>
      </div>
    </section>
  );
}
