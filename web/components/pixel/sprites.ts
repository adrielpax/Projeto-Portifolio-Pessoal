/**
 * Pixel art desenhada como texto: cada caractere é um pixel e a paleta
 * traduz o caractere em cor. "." é transparente.
 * Frames são "patches": só as linhas que mudam em relação à base.
 */

export type Patch = Record<number, string>;

export type SpriteDef = {
  width: number;
  rows: string[];
  palette: Record<string, string>;
  frames: Patch[];
  /** sequência de frames tocada em loop */
  seq: number[];
  /** ms por passo da sequência */
  ms: number;
  /** altura de cada pixel em relação à largura (2 = pixel de meio caractere do terminal) */
  aspect?: number;
};

const W = 16;
const r = (ch: string, n: number) => ch.repeat(n);
/** centraliza o conteúdo numa linha de 16 pixels */
const c = (s: string) => {
  const pad = W - s.length;
  const left = Math.floor(pad / 2);
  return r(".", left) + s + r(".", pad - left);
};

/** frames de digitação: mãos alternam entre a linha das mãos e a de baixo */
function typing(rows: string[], handRow: number, hand: string): Patch[] {
  const mid = rows[handRow].slice(2, 14);
  const below = rows[handRow + 1].slice(2, 14);
  return [
    { [handRow]: "." + hand + mid + hand + hand, [handRow + 1]: hand + "." + below + ".." },
    { [handRow]: hand + hand + mid + hand + ".", [handRow + 1]: ".." + below + "." + hand },
  ];
}

/* ------------------------------------------------------------------ */
/* Claude: o Clawd, mascote do Claude Code, pixel a pixel a partir do  */
/* logo do terminal ( ▐▛███▜▌ / ▝▜█████▛▘ /  ▘▘ ▝▝ ), com um notebook   */
/* ao lado. O corpo do Clawd fica intacto.                             */
/* ------------------------------------------------------------------ */
const claudeRows = [
  "...oooooooooooo....GGGGGGGGG.",
  "...ookooooookoo....GcccbbbbG.",
  ".oooooooooooooooo..GbbccccbG.",
  "...oooooooooooo....GGGGGGGGG.",
  "....o.o....o.o....GGGGGGGGGGG",
];

export const claudeSprite: SpriteDef = {
  width: 29,
  rows: claudeRows,
  palette: {
    o: "#d97757",
    k: "#000000",
    G: "#5b5d64",
    b: "#1c1d21",
    c: "#ffb08a",
  },
  frames: [
    {},
    { 1: "...oooooooooooo....GcccbbbbG." }, // piscar
    { 1: "...ookooooookoo....GbbccccbG.", 2: ".oooooooooooooooo..GcccccbbG."}, // código rolando na tela
  ],
  seq: [0, 2, 0, 2, 0, 1, 0, 2, 0, 2, 2, 0],
  ms: 260,
  aspect: 2,
};

/* ------------------------------------------------------------------ */
/* Codex: o Codex não tem mascote oficial em pixel; usamos o prompt     */
/* ">_" que abre o Codex CLI, numa caixa de terminal, com notebook.    */
/* ------------------------------------------------------------------ */
const codexRows = [
  ".wwwwwwwww.............",
  "wbbbbbbbbbw............",
  "wbwbbbbbbbw..GGGGGGGGG.",
  "wbbwbbbbbbw..GeeebbbbG.",
  "wbwbbwwwbbw..GbbeeeebG.",
  "wbbbbbbbbbw..GGGGGGGGG.",
  ".wwwwwwwww..GGGGGGGGGGG",
];

export const codexSprite: SpriteDef = {
  width: 23,
  rows: codexRows,
  palette: {
    w: "#ffffff",
    b: "#000000",
    G: "#5b5d64",
    e: "#8fa2ff",
  },
  frames: [
    {},
    { 4: "wbwbbbbbbbw..GbbeeeebG." }, // cursor piscando
    { 3: "wbbwbbbbbbw..GbbeeeebG.", 4: "wbwbbwwwbbw..GeeeeebbG."},
  ],
  seq: [0, 1, 0, 1, 2, 1, 2, 0, 1, 0],
  ms: 380,
};

/* ------------------------------------------------------------------ */
/* Usuários de IA: devs de moletom (variações de cor e fone)          */
/* ------------------------------------------------------------------ */
type UserLook = { hair: string; skin: string; hoodie: string; pants: string; phones?: string };

function userSprite(look: UserLook): SpriteDef {
  const phones = Boolean(look.phones);
  const rows = [
    c(""),
    c(r("h", 6)),
    phones ? c("e" + r("h", 8) + "e") : c(r("h", 8)),
    phones ? c("e" + "h" + r("f", 6) + "h" + "e") : c("h" + r("f", 6) + "h"),
    c("f" + "k" + r("f", 4) + "k" + "f"),
    c(r("f", 8)),
    c(r("f", 6)),
    c(r("H", 10)),
    c("H" + r("G", 12) + "H"),
    c("ff" + r("g", 12) + "ff"),
    c(r("g", 5) + "ll" + r("g", 5)),
    c(r("g", 5) + "ll" + r("g", 5)),
    c(r("g", 12)),
    c(r("G", 14)),
    c("pp" + r(".", 6) + "pp"),
  ];
  return {
    width: W,
    rows,
    palette: {
      h: look.hair,
      f: look.skin,
      k: "#121212",
      H: look.hoodie,
      g: "#1c1d21",
      G: "#5b5d64",
      l: "#ededea",
      p: look.pants,
      e: look.phones ?? "#000",
    },
    frames: [{}, { 4: c(r("f", 8)) }, ...typing(rows, 9, "f")],
    seq: [2, 3, 2, 3, 0, 0, 2, 3, 2, 3, 1, 0, 2, 3, 0, 0],
    ms: 160,
  };
}

export const userSprites = {
  u1: userSprite({ hair: "#111113", skin: "#c68b65", hoodie: "#34353c", pants: "#1a1a1e" }),
  u2: userSprite({ hair: "#5a3d24", skin: "#e2b493", hoodie: "#d8d8d3", pants: "#2a2a30", phones: "#6dffb0" }),
  u3: userSprite({ hair: "#c9c9cc", skin: "#8d5a3b", hoodie: "#4a4f63", pants: "#1a1a1e" }),
};

/** aplica o patch do frame sobre as linhas base */
export function frameRows(sprite: SpriteDef, frame: number) {
  const patch = sprite.frames[frame] ?? {};
  return sprite.rows.map((row, i) => patch[i] ?? row);
}
