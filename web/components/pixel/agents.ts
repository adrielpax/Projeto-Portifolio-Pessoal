import { claudeSprite, codexSprite, laptopSprite, type SpriteDef } from "./sprites";

/** [x em vw, y em vh, escala, opacidade] para cada rótulo da timeline (6 paradas) */
export type Pose = [number, number, number, number];

export type AgentDef = {
  id: string;
  name: string;
  accent: string;
  sprite: SpriteDef;
  /** tamanho do pixel em px de tela */
  px: number;
  /** notebook na frente do personagem: posição em pixels do sprite */
  laptop: { sprite: SpriteDef; x: number; y: number; scale: number };
  /** mensagem que aparece no mini chat */
  greeting: string;
  /** lado da tela onde o personagem fica no hero (o botão de chat vai para o lado de dentro) */
  side: "left" | "right";
  poses: { desktop: Pose[]; mobile: Pose[] };
};

export const agents: AgentDef[] = [
  {
    id: "claude",
    name: "Claude",
    accent: "#d97757",
    sprite: claudeSprite,
    px: 8,
    laptop: { sprite: laptopSprite(9, "#ffb08a"), x: 2.8, y: 3.7, scale: 0.6 },
    greeting: "Oi! Sou o Claude. Estou programando com o Adriel neste portfólio. Quer falar com ele?",
    side: "left",
    poses: {
      desktop: [
        [9, 30, 1, 1],
        [46, 15, 0.7, 1],
        [33, 26, 0.85, 1],
        [31, 22, 0.85, 1],
        [6, 62, 0.85, 1],
        [8, 66, 0.9, 1],
      ],
      mobile: [
        [6, 9, 0.7, 1],
        [62, 82, 0.6, 1],
        [58, 12, 0.5, 1],
        [58, 12, 0.5, 1],
        [58, 13, 0.5, 1],
        [6, 9, 0.6, 0],
      ],
    },
  },
  {
    id: "codex",
    name: "Codex",
    accent: "#5b7cfa",
    sprite: codexSprite,
    px: 6,
    laptop: { sprite: laptopSprite(11, "#9fb4ff"), x: 3.6, y: 10.4, scale: 0.65 },
    greeting: "Codex aqui. Posso abrir uma sessão e te mostrar o que o Adriel está construindo.",
    side: "right",
    poses: {
      desktop: [
        [82, 24, 1, 1],
        [58, 15, 0.7, 1],
        [24, 56, 0.85, 1],
        [26, 60, 0.85, 1],
        [18, 66, 0.85, 1],
        [22, 70, 0.9, 1],
      ],
      mobile: [
        [72, 8, 0.7, 1],
        [80, 82, 0.6, 1],
        [77, 13, 0.5, 1],
        [77, 13, 0.5, 1],
        [77, 14, 0.5, 1],
        [72, 8, 0.6, 0],
      ],
    },
  },
];
