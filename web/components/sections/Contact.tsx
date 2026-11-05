"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { profile, socials } from "@/lib/content";

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
    <section id="sec-contact" className="relative py-20 md:py-28" aria-labelledby="contact-title">
      <div className="container-page">
        <div className="reveal glass relative grid gap-10 p-7 text-white md:grid-cols-[1.1fr_1fr] md:p-12">
          <div>
            <span className="kicker-line">Contato</span>
            <h2 id="contact-title" tabIndex={-1} className="mt-3 font-display text-[40px] font-semibold uppercase leading-[0.92] outline-none md:text-[56px]">
              Vamos construir algo que funcione
            </h2>
            <p className="mt-4 max-w-[40ch] text-[16px] leading-snug text-white/70">
              Tem um processo que come o dia do seu time ou um produto para tirar do papel? Me conta o cenário.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {profile.cta.href && (
                <a href={profile.cta.href} target="_blank" rel="noreferrer" className="para bg-white px-6 py-3 text-[15px] font-semibold text-black hover:opacity-85">
                  {profile.cta.label}
                </a>
              )}
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-[15px] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {profile.email ? (
            <form onSubmit={onSubmit} className="grid gap-3 self-start">
              <input name="name" required autoComplete="name" placeholder="Seu nome" className="field-dark" />
              <input name="email" type="email" required autoComplete="email" placeholder="Seu email" className="field-dark" />
              <textarea ref={messageRef} name="message" required rows={4} placeholder="Sobre o projeto" className="field-dark resize-none" />
              <button type="submit" className="para bg-white px-6 py-3 text-left text-[15px] font-semibold text-black hover:opacity-85">
                {opened ? "Seu app de email abriu com a mensagem. Só enviar." : "Escrever email"}
              </button>
            </form>
          ) : (
            <div className="self-start border-l-2 border-white pl-5">
              <p className="font-display text-[22px] font-semibold uppercase">github.com/adrielpax</p>
              <p className="mt-1 text-[15px] text-white/65">O email público ainda não foi configurado. Por enquanto, o contato é pelo GitHub.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
