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
  headline: "Código que trabalha enquanto você dorme.",
  sub: "Full stack, automações e agentes de IA. Do pixel ao pipeline, rodando em produção.",
  location: "Betim, MG",
  coords: { lat: -19.968, lon: -44.198 },
  status: "Disponível para projetos",
  avatar: "/images/perfil.jpeg",
  /** recorte do rosto na foto (frações da imagem) usado pelo avatar pixelado */
  avatarCrop: { x: 0.27, y: 0.1, size: 0.38 },
  email: "contato@seudominio.dev", // TODO: email público de contato
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
  { id: "blog", label: "Blog", index: "03" },
  { id: "contact", label: "Contato", index: "04" },
];

export const socials = [
  { id: "github", label: "GitHub", href: "https://github.com/adrielpax" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" }, // TODO: URL do perfil
  { id: "email", label: "Email", href: `mailto:${profile.email}` },
  { id: "links", label: "Links", href: "/links" },
];

export type Project = {
  code: string;
  title: string;
  description: string;
  year: string;
  status: string;
  tags: string[];
  href: string;
  seed: number;
};

export const projects: Project[] = [
  {
    code: "P-01",
    title: "Automação com n8n",
    description:
      "Fluxos que conectam CRM, planilhas e WhatsApp e tiram trabalho manual do caminho do time.",
    year: "2025",
    status: "Em produção",
    tags: ["n8n", "Webhooks", "APIs REST"],
    href: "https://github.com/adrielpax", // TODO
    seed: 11,
  },
  {
    code: "P-02",
    title: "E-commerce integrado",
    description:
      "Catálogo, estoque e pedidos sincronizados entre Mercado Livre, WooCommerce e Nuvemshop.",
    year: "2025",
    status: "Em produção",
    tags: ["Node.js", "Filas", "Integrações"],
    href: "https://github.com/adrielpax", // TODO
    seed: 23,
  },
  {
    code: "P-03",
    title: "SaaS Auth Kit",
    description:
      "Base de autenticação multi-tenant: sessões, papéis e convites prontos para novos produtos.",
    year: "2024",
    status: "Estudo",
    tags: ["Next.js", "Fastify", "PostgreSQL"],
    href: "https://github.com/adrielpax", // TODO
    seed: 37,
  },
  {
    code: "P-04",
    title: "Portfólio v3",
    description:
      "Este site: cena 3D, agentes em pixel art e uma timeline de scroll que monta a navegação.",
    year: "2026",
    status: "Protótipo",
    tags: ["Next.js", "Three.js", "GSAP"],
    href: "https://github.com/adrielpax/Projeto-Portifolio-Pessoal",
    seed: 52,
  },
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

export const posts = [
  {
    date: "2026.10.18",
    title: "Como uso Claude e Codex no meu fluxo de desenvolvimento",
    tags: ["IA", "Workflow"],
    read: "6 min",
    href: "#", // TODO: /blog/slug
  },
  {
    date: "2026.09.02",
    title: "n8n em produção: o que aprendi automatizando processos reais",
    tags: ["Automação"],
    read: "8 min",
    href: "#",
  },
  {
    date: "2026.07.21",
    title: "Do Figma ao deploy: o pipeline de um projeto full stack",
    tags: ["Next.js", "DevOps"],
    read: "5 min",
    href: "#",
  },
];

/** Página /links (estilo linktree). */
export const linktree = [
  { label: "Portfólio", note: "site completo", href: "/" },
  { label: "GitHub", note: "código e projetos", href: "https://github.com/adrielpax" },
  { label: "LinkedIn", note: "experiência", href: "https://www.linkedin.com/" }, // TODO
  { label: "Blog", note: "notas de campo", href: "/#blog" },
  { label: "Email", note: "orçamentos e parcerias", href: `mailto:${profile.email}` },
];
