/**
 * Semeia o Sanity com os projetos e certificações REAIS do Adriel.
 *
 * Regra de integridade: nada de métrica inventada. Os campos de resultado
 * (metrics/outcome) ficam vazios para o Adriel preencher com números que
 * ele consiga comprovar — no /studio.
 *
 * Uso: node --env-file=.env.local scripts/seed-portfolio.mjs
 * Idempotente: rodar de novo atualiza os mesmos documentos.
 */

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "next-sanity";
import { makeCover } from "./make-cover.mjs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) throw new Error("Faltam NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_API_TOKEN");

const client = createClient({ projectId, dataset, apiVersion: "2025-01-01", token, useCdn: false });

// ── Projetos reais (verificados: GitHub + sites no ar) ───────────────────────
const projects = [
  {
    id: "barberboost",
    title: "Meu Barbeiro (BarberBoost)",
    username: "barberboost",
    role: "Fundador & Desenvolvedor Full-Stack",
    year: "2025",
    status: "producao",
    link: "https://barberboost.vercel.app/",
    description:
      "Web app que automatiza a troca de mensagens e os agendamentos de barbearias, reduzindo o tempo gasto no WhatsApp e organizando a agenda em um só lugar.",
    problem:
      "Barbeiros perdem horas por dia respondendo mensagens repetidas no WhatsApp para marcar, confirmar e remarcar horários. Sem agenda centralizada, aparecem furos, esquecimentos e clientes atendidos em duplicidade.",
    solution:
      "Construí uma plataforma web que centraliza a agenda e automatiza a conversa de agendamento: o cliente marca sozinho, recebe confirmação automática e o barbeiro acompanha tudo por um painel. O projeto tem direitos reservados e registro de propriedade intelectual (Lei nº 9.609/98, Lei nº 9.610/98, INPI).",
    outcome:
      "O agendamento acontece sem conversa manual: o cliente marca sozinho e a agenda vive num painel único, em produção e em uso real. Produto com registro de propriedade intelectual no INPI.",
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "PostgreSQL"],
    featured: true,
    order: 0,
    localImage: "public/images/trofeus/meu-barbeiro.png",
  },
  {
    id: "precinho-rei",
    title: "E-commerce Precinho Rei",
    username: "precinhorei",
    role: "Desenvolvedor Full-Stack",
    year: "2025",
    status: "producao",
    link: "https://precinhorei.vercel.app/",
    description:
      "Plataforma de e-commerce construída em Next.js, com UX inspirada nas grandes marketplaces e arquitetura preparada para expansão white-label.",
    problem:
      "Pequenos lojistas dependem de marketplaces que cobram comissões altas e não oferecem controle sobre a marca nem sobre os dados dos clientes.",
    solution:
      "Desenvolvi uma loja completa em Next.js com catálogo, carrinho e fluxo de compra pensados para conversão, seguindo padrões de usabilidade que o público já conhece de Amazon, Shopee e Mercado Livre. A base foi estruturada para virar white-label e atender várias lojas.",
    outcome:
      "Loja completa no ar — catálogo, carrinho e fluxo de compra — com arquitetura pronta para ser replicada como white-label em novas lojas.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    featured: true,
    order: 1,
    localImage: "public/images/projects/precinho-rei.png",
  },
  {
    id: "project-orion",
    title: "Project Orion",
    username: "orion",
    role: "Desenvolvedor",
    year: "2025",
    status: "producao",
    link: "https://orion-flax.vercel.app",
    repo: "https://github.com/adrielpax/project-orion",
    description:
      "Landing page de SaaS com painéis de funil, construída para capturar e qualificar leads ao longo da jornada de conversão.",
    problem:
      "Produtos SaaS perdem leads quando a página só apresenta o produto e não conduz o visitante por um caminho claro até a conversão.",
    solution:
      "Montei uma landing page com painéis de funil, estruturando a jornada em etapas para acompanhar onde o lead entra e onde ele para.",
    outcome:
      "Landing em produção com o funil instrumentado por etapas — pronta para medir onde cada lead entra e onde abandona a jornada.",
    stack: ["JavaScript", "Next.js", "Vercel"],
    order: 2,
  },
  {
    id: "chat-realtime",
    title: "Chat em tempo real",
    username: "chatapp",
    role: "Desenvolvedor Full-Stack",
    year: "2023",
    status: "concluido",
    repo: "https://github.com/adrielpax/Chat_app",
    description:
      "Aplicação de chat em tempo real com comunicação via WebSockets, cobrindo conexão persistente, salas e entrega instantânea de mensagens.",
    problem:
      "Aplicações que dependem de requisições HTTP tradicionais não conseguem entregar mensagens instantâneas sem ficar consultando o servidor repetidamente.",
    solution:
      "Implementei comunicação bidirecional com Socket.IO sobre Node.js e Express, mantendo conexão persistente entre cliente e servidor para entrega imediata das mensagens.",
    outcome:
      "Mensagens entregues em tempo real com conexão persistente entre salas — código aberto, publicado no GitHub.",
    stack: ["React", "Node.js", "Socket.IO", "Express"],
    order: 3,
  },
  {
    id: "landing-captura",
    title: "Landing de captação com Google Sheets",
    username: "landpage",
    role: "Desenvolvedor",
    year: "2023",
    status: "concluido",
    repo: "https://github.com/adrielpax/LandPage_ContactForm_Model-001",
    description:
      "Landing page com formulário de contato integrado ao Google Sheets, registrando cada lead direto na planilha sem precisar de banco de dados.",
    problem:
      "Negócios pequenos precisam captar leads, mas não têm estrutura (nem orçamento) para manter um back-end e um banco de dados só para um formulário.",
    solution:
      "Integrei o formulário diretamente ao Google Sheets, transformando a planilha no destino dos leads — simples de manter e imediato para quem já trabalha com planilhas.",
    outcome:
      "Leads caindo direto na planilha do cliente, com custo zero de infraestrutura — sem servidor nem banco de dados para manter.",
    stack: ["JavaScript", "HTML5", "Google Sheets API"],
    order: 4,
  },
];

// ── Certificações reais (Vercel Learn) ──────────────────────────────────────
const certifications = [
  {
    id: "vercel-nextjs",
    title: "Next.js App Router Fundamentals",
    issuer: "Vercel",
    order: 0,
    localImage: "public/images/formacao/vercel.png",
  },
  {
    id: "vercel-react",
    title: "React Foundations",
    issuer: "Vercel",
    order: 1,
    localImage: "public/images/formacao/vercel.png",
  },
];

async function uploadLocal(path, filename) {
  if (!existsSync(path)) return null;
  const asset = await client.assets.upload("image", readFileSync(path), { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function uploadCover(p, index) {
  const svg = makeCover({
    title: p.title,
    stack: p.stack,
    label: p.role?.split("&")[0]?.trim() || "Projeto",
    index,
  });
  const asset = await client.assets.upload("image", Buffer.from(svg), {
    filename: `${p.id}-cover.svg`,
    contentType: "image/svg+xml",
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

const tx = client.transaction();
let i = 0;

for (const p of projects) {
  const image = p.localImage
    ? await uploadLocal(p.localImage, `${p.id}.png`)
    : await uploadCover(p, i);

  const { id, ...rest } = p;
  delete rest.localImage;
  // Sem ponto no _id: IDs com "." ficam privados no Sanity e o site (que lê
  // sem token) deixaria de enxergar o documento.
  tx.createOrReplace({
    _id: `project-${id}`,
    _type: "project",
    ...rest,
    slug: { _type: "slug", current: id },
    ...(image ? { image } : {}),
    metrics: [], // preencher no /studio com números comprováveis
  });
  console.log(`  · projeto: ${p.title}`);
  i++;
}

for (const c of certifications) {
  const logo = await uploadLocal(c.localImage, `${c.id}.png`);
  const { id, ...rest } = c;
  delete rest.localImage;
  tx.createOrReplace({
    _id: `certification-${id}`,
    _type: "certification",
    ...rest,
    ...(logo ? { logo } : {}),
  });
  console.log(`  · certificação: ${c.title}`);
}

await tx.commit();
console.log(`\n✅ ${projects.length} projetos e ${certifications.length} certificações no Sanity.`);
console.log("→ Preencha as métricas de resultado em /studio (só números comprováveis).");
