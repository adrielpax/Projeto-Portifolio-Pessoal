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
/* Claude: criatura laranja com notebook (emblema de brilho na tampa) */
/* ------------------------------------------------------------------ */
const claudeRows = [
  c(""),
  c(r("o", 10)),
  c(r("o", 12)),
  c("ooo" + "kk" + "oo" + "kk" + "ooo"),
  c("ooo" + "kk" + "oo" + "kk" + "ooo"),
  c(r("o", 12)),
  c("ooooo" + "OO" + "ooooo"),
  c("o" + r("G", 12) + "o"),
  c("oo" + r("g", 12) + "oo"),
  c(r("g", 4) + "s" + "gg" + "s" + r("g", 4)),
  c(r("g", 5) + "ss" + r("g", 5)),
  c(r("g", 5) + "ss" + r("g", 5)),
  c(r("g", 4) + "s" + "gg" + "s" + r("g", 4)),
  c(r("g", 12)),
  c(r("G", 14)),
  c("oo" + r(".", 6) + "oo"),
];

export const claudeSprite: SpriteDef = {
  width: W,
  rows: claudeRows,
  palette: {
    o: "#e07a52",
    O: "#a9512f",
    k: "#16110f",
    g: "#1c1d21",
    G: "#5b5d64",
    s: "#ffb08a",
  },
  frames: [
    {},
    { 3: c(r("o", 12)) }, // piscar
    ...typing(claudeRows, 8, "o"),
  ],
  seq: [0, 2, 3, 2, 3, 0, 0, 1, 0, 2, 3, 2, 3, 2, 3, 0],
  ms: 170,
};

/* ------------------------------------------------------------------ */
/* Codex: robô claro com rosto de terminal ">_"                        */
/* ------------------------------------------------------------------ */
const codexRows = [
  c("a"),
  c("W"),
  c(r("w", 12)),
  c("w" + r("b", 10) + "w"),
  c("w" + "b" + "c" + r("b", 8) + "w"),
  c("w" + "bb" + "c" + r("b", 7) + "w"),
  c("w" + "b" + "c" + "b" + "ccc" + r("b", 4) + "w"),
  c("w" + r("b", 10) + "w"),
  c(r("w", 12)),
  c("w" + r("G", 12) + "w"),
  c("ww" + r("g", 12) + "ww"),
  c(r("g", 4) + "e" + r("g", 7)),
  c(r("g", 5) + "e" + r("g", 6)),
  c(r("g", 4) + "e" + "g" + "ee" + r("g", 4)),
  c(r("g", 12)),
  c(r("G", 14)),
  c("WW" + r(".", 6) + "WW"),
];

export const codexSprite: SpriteDef = {
  width: W,
  rows: codexRows,
  palette: {
    w: "#e9e9e6",
    W: "#9c9ca3",
    b: "#0b0c10",
    c: "#8fa2ff",
    a: "#8fa2ff",
    g: "#1c1d21",
    G: "#5b5d64",
    e: "#8fa2ff",
  },
  frames: [
    {},
    { 0: c("W"), 6: c("w" + "b" + "c" + r("b", 8) + "w") }, // cursor e antena apagados
    ...typing(codexRows, 10, "w"),
  ],
  seq: [0, 2, 3, 2, 3, 1, 1, 0, 2, 3, 2, 3, 1, 0],
  ms: 190,
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
