import { claudeSprite, codexSprite, userSprites, type SpriteDef } from "./sprites";

export type AgentKind = "claude" | "codex" | "user";

/** [x em vw, y em vh, escala, opacidade] para cada rótulo da timeline (6 paradas) */
export type Pose = [number, number, number, number];

export type AgentDef = {
  id: string;
  kind: AgentKind;
  name: string;
  model: string;
  accent: string;
  sprite: SpriteDef;
  px: number;
  /** linhas que o agente "digita" no painel de código */
  code: string[];
  /** mensagem que aparece na barrinha de chat ao passar o mouse */
  greeting: string;
  panelSide: "left" | "right";
  /** mostra o terminal flutuante com código sendo digitado */
  panel: boolean;
  poses: { desktop: Pose[]; mobile: Pose[] };
};

const HIDDEN_LEFT: Pose = [-15, 80, 0.6, 0];
const HIDDEN_RIGHT: Pose = [110, 80, 0.6, 0];
const HIDDEN_TOP: Pose = [60, -25, 0.6, 0];

export const agents: AgentDef[] = [
  {
    id: "claude",
    kind: "claude",
    name: "Claude",
    model: "opus",
    accent: "#e07a52",
    sprite: claudeSprite,
    px: 5,
    code: [
      "const ctx = await memory.recall(task)",
      "const plan = think(ctx, { depth: 3 })",
      "for (const step of plan) {",
      "  await tools.run(step)",
      "}",
      "return ship(plan) // ✓",
    ],
    greeting:
      "Oi! Sou o Claude. Estou pareando com o Adriel neste portfólio. Quer que eu conecte você a ele?",
    panelSide: "right",
    panel: true,
    poses: {
      desktop: [
        [6, 24, 1, 1],
        [4, 66, 0.8, 1],
        [33, 24, 0.8, 1],
        [31, 20, 0.8, 1],
        [4, 66, 0.8, 1],
        [6, 30, 1, 1],
      ],
      mobile: [
        [4, 8, 0.7, 1],
        [62, 82, 0.6, 1],
        [58, 12, 0.5, 1],
        [58, 12, 0.5, 1],
        [58, 13, 0.5, 1],
        [4, 8, 0.6, 0],
      ],
    },
  },
  {
    id: "codex",
    kind: "codex",
    name: "Codex",
    model: "cli",
    accent: "#8fa2ff",
    sprite: codexSprite,
    px: 5,
    code: [
      "$ codex exec \"refactor auth\"",
      "> lendo 42 arquivos...",
      "> patch aplicado: auth.ts",
      "> testes: 128 ok",
      "$ git push origin main",
    ],
    greeting: "codex@adriel:~$ pronto para executar tarefas. iniciar sessão?",
    panelSide: "left",
    panel: true,
    poses: {
      desktop: [
        [82, 15, 1, 1],
        [16, 72, 0.8, 1],
        [24, 56, 0.8, 1],
        [26, 60, 0.8, 1],
        [16, 72, 0.8, 1],
        [83, 26, 1, 1],
      ],
      mobile: [
        [70, 7, 0.7, 1],
        [80, 82, 0.6, 1],
        [77, 14, 0.5, 1],
        [77, 14, 0.5, 1],
        [77, 15, 0.5, 1],
        [72, 8, 0.6, 0],
      ],
    },
  },
  {
    id: "user-01",
    kind: "user",
    name: "user.01",
    model: "vibe coder",
    accent: "#ededea",
    sprite: userSprites.u1,
    px: 4,
    code: ["> @claude revisa meu PR?", "✓ 3 sugestões aplicadas"],
    greeting: "Só vim ver o deploy. Tá rodando liso por aqui.",
    panelSide: "right",
    panel: false,
    poses: {
      desktop: [[15, 66, 1, 1], HIDDEN_LEFT, HIDDEN_LEFT, HIDDEN_LEFT, HIDDEN_LEFT, [15, 68, 0.9, 1]],
      mobile: [[6, 79, 0.7, 1], HIDDEN_LEFT, HIDDEN_LEFT, HIDDEN_LEFT, HIDDEN_LEFT, [6, 88, 0.6, 0]],
    },
  },
  {
    id: "user-02",
    kind: "user",
    name: "user.02",
    model: "prompt eng.",
    accent: "#6dffb0",
    sprite: userSprites.u2,
    px: 4,
    code: ["$ agents run --parallel 14", "> 14/14 concluídos"],
    greeting: "Rodando 14 agentes em paralelo. Café no ponto.",
    panelSide: "left",
    panel: false,
    poses: {
      desktop: [[78, 64, 1, 1], HIDDEN_RIGHT, HIDDEN_RIGHT, HIDDEN_RIGHT, HIDDEN_RIGHT, [78, 66, 0.9, 1]],
      mobile: [[72, 79, 0.7, 1], HIDDEN_RIGHT, HIDDEN_RIGHT, HIDDEN_RIGHT, HIDDEN_RIGHT, [74, 88, 0.6, 0]],
    },
  },
  {
    id: "user-03",
    kind: "user",
    name: "user.03",
    model: "data sci.",
    accent: "#ededea",
    sprite: userSprites.u3,
    px: 4,
    code: ["df.groupby('cliente').sum()", "> 1.2M linhas em 0.8s"],
    greeting: "Os dados contam a história. Eu só faço as perguntas.",
    panelSide: "right",
    panel: false,
    poses: {
      desktop: [[60, 7, 0.8, 1], HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP],
      mobile: [HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP, HIDDEN_TOP],
    },
  },
];
