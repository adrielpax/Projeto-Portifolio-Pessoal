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
  /** animação de trabalho (loop) */
  seq: number[];
  /** animação de aceno (hover) */
  waveSeq?: number[];
  /** ms por passo da sequência */
  ms: number;
};

/* ------------------------------------------------------------------ */
/* Claude: o Clawd, mascote do Claude Code.                            */
/* Corpo largo, bracinhos laterais, olhos pretos e quatro perninhas.   */
/* ------------------------------------------------------------------ */
const clawdRows = [
  ".ooooooooo.",
  ".ooooooooo.",
  "ookoooookoo",
  "ooooooooooo",
  ".ooooooooo.",
  ".ooooooooo.",
  ".ooooooooo.",
  ".o.o...o.o.",
  ".o.o...o.o.",
];

export const claudeSprite: SpriteDef = {
  width: 11,
  rows: clawdRows,
  palette: { o: "#d97757", k: "#000000" },
  frames: [
    {},
    { 2: "ooooooooooo" }, // 1 piscar
    { 2: ".okoooookoo", 4: "oooooooooo." }, // 2 digitando: braço esquerdo desce
    { 2: "ookoooooko.", 4: ".oooooooooo" }, // 3 digitando: braço direito desce
    { 1: ".oooooooooo", 3: "oooooooooo." }, // 4 aceno: braço direito sobe
    { 0: ".oooooooooo", 1: ".oooooooooo", 2: "ookoooooko.", 3: "oooooooooo." }, // 5 aceno alto
  ],
  seq: [2, 3, 2, 3, 0, 2, 3, 2, 3, 0, 1, 0, 2, 3, 2, 3, 0, 0],
  waveSeq: [4, 5, 4, 5, 4, 5, 0, 1, 0],
  ms: 170,
};

/* ------------------------------------------------------------------ */
/* Codex: robô-nuvem azul com o prompt ">_" no rosto e ">-" no peito.  */
/* ------------------------------------------------------------------ */
const codexRows = [
  "....BBB..BBB...",
  "..BBBBBBBBBBBB.",
  ".BBBBBBBBBBBBBB",
  "BBsssssssssssBB",
  "BBscsssssssssBB",
  "BBsscssssssssBB",
  "BBscssscccsssBB",
  "BBsssssssssssBB",
  ".BBBBBBBBBBBBB.",
  "..BBBBBBBBBBB..",
  "....BBBBBBB....",
  "..BBBcBBccBBB..",
  ".B.BBBBBBBBB.B.",
  "...BBBBBBBBB...",
  "....BB...BB....",
];

export const codexSprite: SpriteDef = {
  width: 15,
  rows: codexRows,
  palette: { B: "#5b7cfa", s: "#131a3a", c: "#d6e2ff" },
  frames: [
    {},
    { 6: "BBscsssssssssBB" }, // 1 cursor apagado
    { 12: "...BBBBBBBBB.B.", 13: ".B.BBBBBBBBB..." }, // 2 digitando
    { 12: ".B.BBBBBBBBB...", 13: "...BBBBBBBBB.B." }, // 3 digitando
    { 11: "..BBBcBBccBBB.B", 12: ".B.BBBBBBBBB..." }, // 4 aceno
    { 10: "....BBBBBBB...B", 11: "..BBBcBBccBBB.B", 12: ".B.BBBBBBBBB..." }, // 5 aceno alto
  ],
  seq: [2, 3, 2, 3, 1, 2, 3, 2, 3, 0, 1, 0, 2, 3, 1, 0],
  waveSeq: [4, 5, 4, 5, 4, 5, 0, 1, 0],
  ms: 190,
};

/* ------------------------------------------------------------------ */
/* Notebook visto por trás (tampa com emblema que pulsa), desenhado    */
/* na frente do personagem.                                           */
/* ------------------------------------------------------------------ */
export function laptopSprite(width: number, glow: string): SpriteDef {
  const mid = Math.floor(width / 2);
  const lid = () => "G" + "g".repeat(width - 2) + "G";
  const emblem = (cols: number[]) =>
    lid()
      .split("")
      .map((c, i) => (cols.includes(i) ? "e" : c))
      .join("");
  return {
    width,
    rows: ["G".repeat(width), emblem([mid]), emblem([mid - 1, mid, mid + 1]), emblem([mid]), "H".repeat(width)],
    palette: { G: "#3b3d44", g: "#1b1c21", H: "#8a8d96", e: glow },
    frames: [{}, { 2: emblem([mid]) }],
    seq: [0, 0, 0, 1, 0, 0, 1, 1],
    ms: 260,
  };
}

/** aplica o patch do frame sobre as linhas base */
export function frameRows(sprite: SpriteDef, frame: number) {
  const patch = sprite.frames[frame] ?? {};
  return sprite.rows.map((row, i) => patch[i] ?? row);
}
