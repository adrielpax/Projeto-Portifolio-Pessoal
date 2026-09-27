"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, SendHorizontal } from "lucide-react";

import Magnetic from "./Magnetic";
import { LINKS } from "@/lib/site";
import { LIMITES, validarLead, type Lead } from "@/lib/contato";

type Estado =
  | { tipo: "idle" }
  | { tipo: "enviando" }
  | { tipo: "entregue" }
  | { tipo: "invalido"; campo: keyof Lead; mensagem: string }
  | { tipo: "limite" }
  | { tipo: "erro" };

const inputCls =
  "w-full rounded-xl border border-hud-line bg-white/5 px-4 py-3 text-sm text-hud-text " +
  "placeholder:text-hud-muted/60 outline-none transition-colors focus:border-hud-accent/60 " +
  "aria-[invalid=true]:border-amber-400/70";

/**
 * Módulo de contato do sistema: a mensagem é transmitida para /api/mensagem,
 * que grava no Studio e notifica o Adriel. Os estados são exibidos como um
 * console de transmissão; se o canal cair, o chat vira o caminho.
 */
export default function ContactModule() {
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });
  // Instante em que o formulário apareceu — a API descarta envios de robô
  // feitos rápido demais.
  const abertoEm = useRef(0);
  useEffect(() => {
    abertoEm.current = Date.now();
  }, []);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = Object.fromEntries(new FormData(form).entries());

    const validacao = validarLead(dados);
    if (!validacao.ok) {
      setEstado({ tipo: "invalido", campo: validacao.campo, mensagem: validacao.erro });
      form.querySelector<HTMLElement>(`[name="${validacao.campo}"]`)?.focus();
      return;
    }

    setEstado({ tipo: "enviando" });
    try {
      const res = await fetch("/api/mensagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dados,
          origem: window.location.pathname,
          t: abertoEm.current,
        }),
      });
      if (res.ok) {
        form.reset();
        setEstado({ tipo: "entregue" });
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (res.status === 400 && json.campo) {
        setEstado({ tipo: "invalido", campo: json.campo, mensagem: json.mensagem });
      } else if (res.status === 429) {
        setEstado({ tipo: "limite" });
      } else {
        setEstado({ tipo: "erro" });
      }
    } catch {
      setEstado({ tipo: "erro" });
    }
  }

  const invalido = (campo: keyof Lead) =>
    estado.tipo === "invalido" && estado.campo === campo ? true : undefined;

  return (
    <section
      id="contato"
      className="hud-panel hud-brackets scroll-mt-20 p-6 text-center md:p-12"
    >
      <span className="hud-label">MSG · Módulo de contato</span>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-hud-text md:text-3xl">
        Vamos tirar seu sistema do papel?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-hud-muted">
        Me conte o problema que você precisa resolver — eu respondo com um
        plano de ataque, não com um orçamento genérico.
      </p>

      <form
        onSubmit={enviar}
        noValidate
        className="mx-auto mt-7 grid max-w-xl gap-3 text-left sm:grid-cols-2"
      >
        <input
          name="nome"
          required
          autoComplete="name"
          maxLength={LIMITES.nome.max}
          placeholder="Seu nome"
          aria-label="Seu nome"
          aria-invalid={invalido("nome")}
          className={inputCls}
        />
        <input
          name="contato"
          required
          autoComplete="email"
          maxLength={LIMITES.contato.max}
          placeholder="E-mail ou WhatsApp"
          aria-label="E-mail ou WhatsApp com DDD"
          aria-invalid={invalido("contato")}
          className={inputCls}
        />
        <textarea
          name="mensagem"
          required
          minLength={LIMITES.mensagem.min}
          maxLength={LIMITES.mensagem.max}
          rows={4}
          placeholder="Qual problema você quer resolver?"
          aria-label="Mensagem"
          aria-invalid={invalido("mensagem")}
          className={`${inputCls} sm:col-span-2 resize-y`}
        />

        {/* Campo isca: invisível para pessoas, irresistível para robôs. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Site
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="flex flex-col items-center gap-3 sm:col-span-2">
          <Magnetic className="w-full sm:w-auto">
            <button
              type="submit"
              disabled={estado.tipo === "enviando"}
              className="btn-primary w-full px-8 py-3.5 font-display text-sm font-semibold disabled:opacity-60 sm:w-auto"
            >
              {estado.tipo === "enviando" ? (
                "Transmitindo…"
              ) : (
                <>
                  Enviar mensagem <SendHorizontal className="h-4 w-4" />
                </>
              )}
            </button>
          </Magnetic>

          <p role="status" aria-live="polite" className="min-h-4 font-mono text-xs">
            {estado.tipo === "entregue" && (
              <span className="text-emerald-400">
                [MSG] entregue — respondo no contato informado.
              </span>
            )}
            {estado.tipo === "invalido" && (
              <span className="text-amber-400">[MSG] {estado.mensagem}</span>
            )}
            {estado.tipo === "limite" && (
              <span className="text-amber-400">
                [MSG] muitas mensagens seguidas — tente de novo em alguns minutos.
              </span>
            )}
            {estado.tipo === "erro" && (
              <span className="text-amber-400">
                [MSG] canal indisponível no momento — use o chat abaixo.
              </span>
            )}
          </p>

          <p className="text-center text-[11px] leading-relaxed text-hud-muted">
            Seus dados servem só para eu responder esta mensagem.
          </p>
        </div>
      </form>

      <a
        href={LINKS.chat}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost mt-5 px-5 py-2.5 font-display text-xs font-medium"
      >
        Prefere conversar? Abrir o chat <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </section>
  );
}
