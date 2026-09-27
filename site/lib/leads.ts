import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";

import { apiVersion, dataset, hasSanity, safeProjectId } from "@/sanity/env";
import type { Lead } from "./contato";

/**
 * Destinos de uma mensagem do Módulo de contato. Cada um liga sozinho quando
 * a variável de ambiente correspondente existe:
 *
 *  - sanity      SANITY_WRITE_TOKEN   → documento "lead" no /studio (principal)
 *  - planilha    SHEETS_WEBHOOK_URL   → linha numa planilha Google (Apps Script)
 *  - notificação CONTACT_WEBHOOK_URL  → aviso no Discord/Slack
 *
 * Só roda no servidor: o token de escrita nunca vai para o navegador.
 */

export type LeadRegistro = Lead & { origem?: string; recebidoEm: string };

type Destino = { nome: string; enviar: (lead: LeadRegistro) => Promise<void> };

function destinoSanity(): Destino | null {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!hasSanity || !token) return null;

  const client = createClient({
    projectId: safeProjectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  return {
    nome: "sanity",
    async enviar(lead) {
      await client.create({
        // O ponto no _id deixa o documento privado: fora da API pública do
        // dataset, visível só para quem está logado no Studio.
        _id: `lead.${randomUUID()}`,
        _type: "lead",
        status: "novo",
        ...lead,
      });
    },
  };
}

function destinoPlanilha(): Destino | null {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return null;
  return {
    nome: "planilha",
    async enviar(lead) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`planilha ${res.status}`);
    },
  };
}

function destinoNotificacao(): Destino | null {
  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return null;
  return {
    nome: "notificacao",
    async enviar(lead) {
      const texto = [
        "📨 Nova mensagem no portfólio",
        `— De: ${lead.nome}`,
        `— Contato: ${lead.contato}`,
        lead.origem ? `— Página: ${lead.origem}` : null,
        "",
        lead.mensagem,
      ]
        .filter((l) => l !== null)
        .join("\n");

      // Discord espera { content }; Slack espera { text }. No Discord,
      // allowed_mentions vazio impede que o visitante dispare @everyone.
      const payload = url.includes("hooks.slack.com")
        ? { text: texto }
        : { content: texto, allowed_mentions: { parse: [] } };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`notificacao ${res.status}`);
    },
  };
}

export type ResultadoEntrega =
  | { status: "entregue"; destinos: string[] }
  | { status: "sem-destino" }
  | { status: "falhou" };

/**
 * Envia para todos os destinos configurados em paralelo. Basta um aceitar
 * para a mensagem estar a salvo; as falhas ficam no log do servidor.
 */
export async function entregarLead(lead: LeadRegistro): Promise<ResultadoEntrega> {
  const destinos = [destinoSanity(), destinoPlanilha(), destinoNotificacao()].filter(
    (d): d is Destino => d !== null,
  );
  if (destinos.length === 0) return { status: "sem-destino" };

  const resultados = await Promise.allSettled(destinos.map((d) => d.enviar(lead)));
  const entregues: string[] = [];
  resultados.forEach((r, i) => {
    if (r.status === "fulfilled") entregues.push(destinos[i].nome);
    else console.error(`[contato] destino ${destinos[i].nome} falhou:`, r.reason);
  });

  return entregues.length > 0
    ? { status: "entregue", destinos: entregues }
    : { status: "falhou" };
}
