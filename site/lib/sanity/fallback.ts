import type { Post, Project, Certification } from "./types";

/**
 * Conteúdo base do portfólio.
 *
 * Usado enquanto os documentos correspondentes não existem no Sanity — assim o
 * site nunca aparece vazio para um recrutador. Assim que você cadastrar o mesmo
 * conteúdo no /studio, o Sanity assume automaticamente.
 *
 * Integridade: todos os projetos abaixo são reais e verificáveis (links no ar /
 * repositórios públicos). Métricas de resultado ficam de fora de propósito —
 * cadastre no /studio apenas números que você consiga comprovar.
 */

export const fallbackProjects: Project[] = [
  {
    _id: "project.barberboost",
    slug: "barberboost",
    title: "Meu Barbeiro (BarberBoost)",
    username: "barberboost",
    role: "Fundador & Desenvolvedor Full-Stack",
    year: "2025",
    status: "producao",
    link: "https://barberboost.vercel.app/",
    featured: true,
    image: "/images/trofeus/meu-barbeiro.png",
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS", "PostgreSQL"],
    description:
      "Web app que automatiza a troca de mensagens e os agendamentos de barbearias, reduzindo o tempo gasto no WhatsApp e organizando a agenda em um só lugar.",
    problem:
      "Barbeiros perdem horas por dia respondendo mensagens repetidas no WhatsApp para marcar, confirmar e remarcar horários. Sem uma agenda centralizada, aparecem furos, esquecimentos e clientes marcados em duplicidade.",
    solution:
      "Construí uma plataforma web que centraliza a agenda e automatiza a conversa de agendamento: o cliente marca sozinho, recebe confirmação automática e o barbeiro acompanha tudo por um painel. O projeto tem direitos reservados e registro de propriedade intelectual (Lei nº 9.609/98, Lei nº 9.610/98, INPI).",
    outcome:
      "O agendamento acontece sem conversa manual: o cliente marca sozinho e a agenda vive num painel único, em produção e em uso real. Produto com registro de propriedade intelectual no INPI.",
  },
  {
    _id: "project.precinho-rei",
    slug: "precinho-rei",
    title: "E-commerce Precinho Rei",
    username: "precinhorei",
    role: "Desenvolvedor Full-Stack",
    year: "2025",
    status: "producao",
    link: "https://precinhorei.vercel.app/",
    featured: true,
    image: "/images/projects/precinho-rei.png",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    description:
      "Plataforma de e-commerce construída em Next.js, com UX inspirada nas grandes marketplaces e arquitetura preparada para expansão white-label.",
    problem:
      "Pequenos lojistas dependem de marketplaces que cobram comissões altas e não dão controle sobre a marca nem sobre os dados dos clientes.",
    solution:
      "Desenvolvi uma loja completa em Next.js com catálogo, carrinho e fluxo de compra pensados para conversão, seguindo padrões de usabilidade que o público já conhece de Amazon, Shopee e Mercado Livre. A base foi estruturada para virar white-label e atender várias lojas.",
    outcome:
      "Loja completa no ar — catálogo, carrinho e fluxo de compra — com arquitetura pronta para ser replicada como white-label em novas lojas.",
  },
  {
    _id: "project.orion",
    slug: "project-orion",
    title: "Project Orion",
    username: "orion",
    role: "Desenvolvedor",
    year: "2025",
    status: "producao",
    link: "https://orion-flax.vercel.app",
    repo: "https://github.com/adrielpax/project-orion",
    image: "/images/projects/orion.svg",
    stack: ["Next.js", "JavaScript", "Vercel"],
    description:
      "Landing page de SaaS com painéis de funil, construída para capturar e qualificar leads ao longo da jornada de conversão.",
    problem:
      "Produtos SaaS perdem leads quando a página apenas apresenta o produto e não conduz o visitante por um caminho claro até a conversão.",
    solution:
      "Montei uma landing page com painéis de funil, estruturando a jornada em etapas para acompanhar onde o lead entra e onde ele para.",
    outcome:
      "Landing em produção com o funil instrumentado por etapas — pronta para medir onde cada lead entra e onde abandona a jornada.",
  },
  {
    _id: "project.chat-realtime",
    slug: "chat-realtime",
    title: "Chat em tempo real",
    username: "chatapp",
    role: "Desenvolvedor Full-Stack",
    year: "2023",
    status: "concluido",
    repo: "https://github.com/adrielpax/Chat_app",
    image: "/images/projects/chat-realtime.svg",
    stack: ["React", "Node.js", "Socket.IO", "Express"],
    description:
      "Aplicação de chat em tempo real com comunicação via WebSockets, cobrindo conexão persistente, salas e entrega instantânea de mensagens.",
    problem:
      "Aplicações que dependem de requisições HTTP tradicionais não entregam mensagens instantâneas sem ficar consultando o servidor repetidamente.",
    solution:
      "Implementei comunicação bidirecional com Socket.IO sobre Node.js e Express, mantendo conexão persistente entre cliente e servidor para entrega imediata das mensagens.",
    outcome:
      "Mensagens entregues em tempo real com conexão persistente entre salas — código aberto, publicado no GitHub.",
  },
  {
    _id: "project.landing-captura",
    slug: "landing-captura",
    title: "Landing de captação com Google Sheets",
    username: "landpage",
    role: "Desenvolvedor",
    year: "2023",
    status: "concluido",
    repo: "https://github.com/adrielpax/LandPage_ContactForm_Model-001",
    image: "/images/projects/landing-captura.svg",
    stack: ["JavaScript", "HTML5", "Google Sheets API"],
    description:
      "Landing page com formulário de contato integrado ao Google Sheets, registrando cada lead direto na planilha sem precisar de banco de dados.",
    problem:
      "Negócios pequenos precisam captar leads, mas não têm estrutura nem orçamento para manter um back-end e um banco de dados só para um formulário.",
    solution:
      "Integrei o formulário diretamente ao Google Sheets, transformando a planilha no destino dos leads — simples de manter e imediato para quem já trabalha com planilhas.",
    outcome:
      "Leads caindo direto na planilha do cliente, com custo zero de infraestrutura — sem servidor nem banco de dados para manter.",
  },
];

export const fallbackCertifications: Certification[] = [
  {
    _id: "certification.vercel-nextjs",
    title: "Next.js App Router Fundamentals",
    issuer: "Vercel",
    logo: "/images/formacao/vercel.png",
  },
  {
    _id: "certification.vercel-react",
    title: "React Foundations",
    issuer: "Vercel",
    logo: "/images/formacao/vercel.png",
  },
];

export const fallbackPosts: Post[] = [];
