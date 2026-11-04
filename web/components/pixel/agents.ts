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
        [46, 15, 0.6, 0],
        [36, 30, 0.85, 1],
        [38, 24, 0.85, 1],
        [6, 62, 0.7, 0],
        [38, 62, 0.9, 1],
      ],
      mobile: [
        [6, 5, 0.65, 1],
        [62, 82, 0.6, 0],
        [58, 12, 0.5, 0],
        [58, 12, 0.5, 0],
        [58, 13, 0.5, 0],
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
    greeting: "Codex aqui. Quer deixar um recado para o Adriel? Eu levo até o contato.",
    side: "right",
    poses: {
      desktop: [
        [82, 24, 1, 1],
        [58, 15, 0.6, 0],
        [30, 58, 0.85, 1],
        [32, 62, 0.85, 1],
        [18, 66, 0.7, 0],
        [26, 70, 0.9, 1],
      ],
      mobile: [
        [72, 4, 0.65, 1],
        [80, 82, 0.6, 0],
        [77, 13, 0.5, 0],
        [77, 13, 0.5, 0],
        [77, 14, 0.5, 0],
        [72, 8, 0.6, 0],
      ],
    },
  },
];
