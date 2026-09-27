/**
 * Regras do Módulo de contato — as mesmas no formulário e na API.
 */
export const LIMITES = {
  nome: { min: 2, max: 80 },
  contato: { max: 120 },
  mensagem: { min: 10, max: 2000 },
} as const;

export type Lead = { nome: string; contato: string; mensagem: string };

export type Validacao =
  | { ok: true; lead: Lead }
  | { ok: false; campo: keyof Lead; erro: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** E-mail válido ou telefone com DDD (10+ dígitos, aceita +55, espaços, traços). */
export function contatoValido(valor: string): boolean {
  if (EMAIL.test(valor)) return true;
  const digitos = valor.replace(/\D/g, "");
  return /^[\d\s()+.-]+$/.test(valor) && digitos.length >= 10 && digitos.length <= 15;
}

export function validarLead(input: Partial<Record<keyof Lead, unknown>>): Validacao {
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const nome = texto(input.nome);
  const contato = texto(input.contato);
  const mensagem = texto(input.mensagem);

  if (nome.length < LIMITES.nome.min || nome.length > LIMITES.nome.max)
    return { ok: false, campo: "nome", erro: "Informe seu nome." };
  if (contato.length > LIMITES.contato.max || !contatoValido(contato))
    return {
      ok: false,
      campo: "contato",
      erro: "Informe um e-mail válido ou WhatsApp com DDD.",
    };
  if (mensagem.length < LIMITES.mensagem.min || mensagem.length > LIMITES.mensagem.max)
    return {
      ok: false,
      campo: "mensagem",
      erro: `Conte um pouco mais (mínimo de ${LIMITES.mensagem.min} caracteres).`,
    };

  return { ok: true, lead: { nome, contato, mensagem } };
}
