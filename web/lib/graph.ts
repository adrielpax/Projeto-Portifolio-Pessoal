/**
 * Grafo de conhecimento de fundo, no estilo do graphify: comunidades coloridas,
 * nós nomeados (com rótulo) e satélites sem nome, ligações dentro de cada área
 * e pontes entre áreas. Editar aqui muda o que aparece na cena.
 */

export type Community = {
  id: string;
  name: string;
  color: string;
  center: [number, number, number];
  nodes: string[];
};

export const communities: Community[] = [
  {
    id: "ai",
    name: "IA & agentes",
    color: "#d9a185",
    center: [-2.6, 1.0, 0.4],
    nodes: ["Claude", "Codex", "LLMs", "RAG", "MCP", "Agentes", "Embeddings", "Prompting"],
  },
  {
    id: "python",
    name: "Python",
    color: "#d8c58a",
    center: [-0.2, 2.0, -1.4],
    nodes: ["Python", "FastAPI", "Pandas", "NumPy", "PyTorch", "Jupyter"],
  },
  {
    id: "front",
    name: "Frontend",
    color: "#8fc3db",
    center: [2.7, 0.9, 0.2],
    nodes: ["React", "Next.js", "TypeScript", "Tailwind", "Three.js", "GSAP", "React Native"],
  },
  {
    id: "back",
    name: "Backend",
    color: "#96c7a4",
    center: [1.6, -1.6, -0.6],
    nodes: ["Node.js", "Fastify", "PostgreSQL", "MongoDB", "Docker", "Nginx", "REST/GraphQL"],
  },
  {
    id: "industrial",
    name: "Automação industrial",
    color: "#ada2d6",
    center: [-2.0, -1.7, -0.2],
    nodes: ["CLP", "SCADA", "Modbus", "OPC UA", "MQTT", "Sensores", "IoT", "n8n"],
  },
];

/** pontes entre áreas (nomes precisam existir acima) */
export const bridges: [string, string][] = [
  ["Claude", "MCP"],
  ["Codex", "TypeScript"],
  ["Agentes", "n8n"],
  ["RAG", "Embeddings"],
  ["Embeddings", "Python"],
  ["PyTorch", "LLMs"],
  ["FastAPI", "PostgreSQL"],
  ["Pandas", "SCADA"],
  ["MQTT", "Node.js"],
  ["IoT", "MQTT"],
  ["n8n", "Node.js"],
  ["Next.js", "Node.js"],
  ["REST/GraphQL", "React"],
  ["Three.js", "Python"],
  ["Docker", "FastAPI"],
  ["Agentes", "Claude"],
  ["OPC UA", "Python"],
];

export const SATELLITES_PER_COMMUNITY = 20;

/** lista achatada dos nós nomeados, na mesma ordem usada pela cena e pelos rótulos */
export const namedNodes = communities.flatMap((c) => c.nodes.map((name) => ({ name, community: c.id, color: c.color })));
