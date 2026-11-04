/**
 * Todo o conteúdo editável do portfólio fica aqui.
 * Trocar textos, links e projetos não exige mexer nos componentes.
 * Itens marcados com TODO são placeholders para preencher com dados reais.
 */

export const profile = {
  name: "Adriel Lucas",
  handle: "adrielpax",
  role: "Desenvolvedor Full Stack",
  focus: ["Produtos web", "Automação", "Agentes de IA"],
  /** posicionamento: para quem e qual resultado, numa frase */
  headline: "Automatizo operações com software e IA.",
  sub: "Integrações, agentes de IA e painéis que tiram trabalho manual do caminho, do chão de fábrica ao dashboard. Desenvolvedor full stack em Betim, MG.",
  /** chamada principal do site; sem href, o botão leva à tela de contato */
  cta: { label: "Agendar uma conversa", href: "" }, // TODO: link do WhatsApp ou Calendly
  site: "https://adrieldev.vercel.app",
  location: "Betim, MG",
  coords: { lat: -19.968, lon: -44.198 },
  status: "Disponível para projetos",
  avatar: "/images/perfil.jpeg",
  /** recorte do rosto na foto (frações da imagem) */
  avatarCrop: { x: 0.27, y: 0.1, size: 0.38 },
  /** email público de contato; vazio = formulário e link de email ficam ocultos */
  email: "", // TODO: preencher
};

export type SectionId = "hero" | "projects" | "stack" | "blog" | "contact";

/** Rótulos da timeline mestre: cada unidade = uma "parada" do scroll. */
export const timelineLabels: { label: string; section: SectionId }[] = [
  { label: "hero", section: "hero" },
  { label: "projects", section: "projects" },
  { label: "stack", section: "stack" },
  { label: "stack-open", section: "stack" },
  { label: "blog", section: "blog" },
  { label: "contact", section: "contact" },
];

export const navLinks: { id: SectionId; label: string; index: string }[] = [
  { id: "projects", label: "Projetos", index: "01" },
  { id: "stack", label: "Stack", index: "02" },
  { id: "blog", label: "Log", index: "03" },
  { id: "contact", label: "Contato", index: "04" },
];

export const socials = [
  { id: "github", label: "GitHub", href: "https://github.com/adrielpax" },
  { id: "linkedin", label: "LinkedIn", href: "" }, // TODO: URL do perfil
  { id: "email", label: "Email", href: profile.email ? `mailto:${profile.email}` : "" },
  { id: "links", label: "Links", href: "/links" },
].filter((s) => s.href); // links sem URL não aparecem

export type Project = {
  /** nome do repositório no GitHub */
  repo: string;
  title: string;
  description: string;
  /** último push no GitHub (AAAA-MM-DD) */
  pushed: string;
  language: string;
  tags: string[];
  href: string;
  /** site publicado, quando existe */
  demo?: string;
  /** captura do projeto em /public/images/projects (sem imagem, a capa é gerada) */
  image?: string;
  /** cor da capa gerada quando não há imagem */
  tint?: string;
};

const gh = (repo: string) => `https://github.com/adrielpax/${repo}`;

/**
 * Projetos reais, tirados dos repositórios públicos de github.com/adrielpax
 * (descrições do próprio repositório). Atualize aqui quando subir algo novo.
 */
export const projects: Project[] = [
  {
    repo: "project-orion",
    title: "Projeto Orion",
    description: "Site e landing page de SaaS com painéis de funil.",
    pushed: "2025-10-04",
    language: "JavaScript",
    tags: ["Landing page", "SaaS", "Funis"],
    href: gh("project-orion"),
    demo: "https://orion-flax.vercel.app",
    tint: "#ada2d6",
  },
  {
    repo: "Projeto-Portifolio-Pessoal",
    title: "Portfólio pessoal",
    description: "Este site: cena 3D, agentes em pixel art e navegação guiada pelo scroll.",
    pushed: "2026-11-02",
    language: "TypeScript",
    tags: ["Next.js", "Three.js", "GSAP"],
    href: gh("Projeto-Portifolio-Pessoal"),
    demo: "https://adrieldev.vercel.app",
    image: "/images/projects/portfolio-v3.jpg",
  },
  {
    repo: "spider-app",
    title: "Spider App",
    description: "Busca por geolocalização com chat em tempo real.",
    pushed: "2026-07-31",
    language: "Web",
    tags: ["Geolocalização", "Tempo real"],
    href: gh("spider-app"),
    tint: "#d9a185",
  },
  {
    repo: "ecommerce-optimize-nextjs",
    title: "E-commerce otimizado",
    description: "E-commerce em Next.js com foco em otimização.",
    pushed: "2026-08-24",
    language: "Next.js",
    tags: ["Next.js", "E-commerce"],
    href: gh("ecommerce-optimize-nextjs"),
    tint: "#96c7a4",
  },
];

/**
 * Estudos de caso: trabalhos reais (inclusive de clientes, com dados borrados).
 * Preencha com fatos e números verdadeiros; enquanto vazio, a vitrine mostra só os repositórios.
 */
export type CaseStudy = {
  client: string; // ex.: "Indústria de autopeças (NDA)"
  title: string;
  problem: string;
  solution: string;
  /** resultado mensurável e verdadeiro, ex.: "-12 h/semana de digitação" */
  result: string;
  stack: string[];
  image?: string;
};

export const cases: CaseStudy[] = [];

/** Repositórios menores e estudos, mostrados no registro de atividade */
export const archive = [
  { repo: "Chat_app", pushed: "2023-10-18", language: "JavaScript", note: "Chat com React, Node.js, Express e Socket.io" },
  { repo: "LandPage_ContactForm_Model-001", pushed: "2023-06-05", language: "JavaScript", note: "Landing page que grava contatos no Google Sheets" },
  { repo: "fullstack-project", pushed: "2024-07-13", language: "JavaScript", note: "Projeto full stack" },
  { repo: "simple_react_calculator", pushed: "2024-10-10", language: "React", note: "Calculadora em React (desafio DIO)" },
  { repo: "React_app_nlw", pushed: "2021-09-07", language: "TypeScript", note: "App React do NLW" },
  { repo: "Pygame_Space_game", pushed: "2021-09-07", language: "Python", note: "Jogo de nave em Pygame" },
  { repo: "adrielpax", pushed: "2026-03-27", language: "Markdown", note: "Perfil do GitHub" },
];

/** Camadas do equipamento que se desmonta na seção Stack (de cima para baixo). */
export const stackLayers = [
  { code: "L1", name: "Frontend", part: "Tampa", items: ["React", "Next.js", "React Native", "Tailwind"] },
  { code: "L2", name: "IA & Agentes", part: "Processador", items: ["Claude", "Codex", "MCP", "RAG", "Python"] },
  { code: "L3", name: "Backend", part: "Placa", items: ["Node.js", "FastAPI", "Fastify", "REST/GraphQL"] },
  { code: "L4", name: "Automação", part: "Cooler", items: ["n8n", "CLP", "SCADA", "MQTT", "Modbus"] },
  { code: "L5", name: "Dados", part: "Baterias", items: ["PostgreSQL", "MongoDB", "Firebase"] },
  { code: "L6", name: "Infra", part: "Base", items: ["Docker", "Nginx", "CI/CD", "Git"] },
];


/** Página /links (estilo linktree). */
export const linktree = [
  { label: "Portfólio", note: "site completo", href: "/" },
  { label: "GitHub", note: "código e projetos", href: "https://github.com/adrielpax" },
  { label: "Projeto Orion", note: "projeto publicado", href: "https://orion-flax.vercel.app" },
  { label: "LinkedIn", note: "experiência", href: "" }, // TODO
  { label: "Email", note: "orçamentos e parcerias", href: profile.email ? `mailto:${profile.email}` : "" },
].filter((l) => l.href);
