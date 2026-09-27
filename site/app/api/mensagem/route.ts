import { NextResponse } from "next/server";

import { validarLead } from "@/lib/contato";
import { entregarLead } from "@/lib/leads";

/**
 * Canal de mensagens do portfólio.
 *
 * O visitante envia pelo Módulo de contato; a mensagem é validada, passa por
 * filtros anti-spam e é gravada em todos os destinos configurados (Sanity,
 * planilha, notificação — ver lib/leads.ts). Sem nenhum destino, respondemos
 * 503 e o front oferece o chat, para nenhuma mensagem se perder em silêncio.
 */

/** Envios mais rápidos que isso depois de abrir a página são de robô. */
const TEMPO_MINIMO_MS = 3_000;

/** Limite por IP. Em memória: vale por instância — freio, não muralha. */
const JANELA_MS = 10 * 60_000;
const MAX_POR_JANELA = 5;
const envios = new Map<string, number[]>();

function excedeuLimite(ip: string): boolean {
  const agora = Date.now();
  const recentes = (envios.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= MAX_POR_JANELA) {
    envios.set(ip, recentes);
    return true;
  }
  recentes.push(agora);
  envios.set(ip, recentes);
  // Evita crescer sem fim numa instância que vive muito.
  if (envios.size > 5_000) envios.clear();
  return false;
}

/** Só o caminho da página (sem domínio nem query), para contexto no Studio. */
function limparOrigem(valor: unknown): string | undefined {
  if (typeof valor !== "string" || !valor.startsWith("/")) return undefined;
  return valor.split(/[?#]/)[0].slice(0, 200);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "payload" }, { status: 400 });
  }

  // Anti-spam silencioso: o robô recebe "ok" e não aprende a contornar.
  //  - `website` é um campo invisível que só robôs preenchem;
  //  - `t` é o instante em que o formulário apareceu na tela.
  const abertoEm = Number(body.t);
  const rapidoDemais =
    !Number.isFinite(abertoEm) || Date.now() - abertoEm < TEMPO_MINIMO_MS;
  if (body.website || rapidoDemais) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido";
  if (excedeuLimite(ip)) {
    return NextResponse.json({ ok: false, error: "limite" }, { status: 429 });
  }

  const validacao = validarLead(body);
  if (!validacao.ok) {
    return NextResponse.json(
      { ok: false, error: "campos", campo: validacao.campo, mensagem: validacao.erro },
      { status: 400 },
    );
  }

  const resultado = await entregarLead({
    ...validacao.lead,
    origem: limparOrigem(body.origem),
    recebidoEm: new Date().toISOString(),
  });

  if (resultado.status === "sem-destino") {
    return NextResponse.json(
      { ok: false, error: "canal-indisponivel" },
      { status: 503 },
    );
  }
  if (resultado.status === "falhou") {
    return NextResponse.json({ ok: false, error: "entrega" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
