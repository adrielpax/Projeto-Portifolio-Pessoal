// Fonte pixel 3x5 (maiúsculas, números, pontuação e acentos do português)
const G = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001011001111',
  4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001111',
  ' ': '000000000000000', '.': '000000000000010', ',': '000000000010100', ':': '000010000010000',
  '-': '000000111000000', '+': '000010111010000', '/': '001001010100100', '!': '010010010000010',
  '?': '110001010000010', '(': '010100100100010', ')': '010001001001010', '=': '000111000111000',
  '%': '101001010100101', "'": '010010000000000', '>': '100010001010100', '<': '001010100010001',
  '#': '101111101111101', '·': '000000010000000', '"': '101101000000000', ';': '000010000010100', '*': '000101010101000', '_': '000000000000111',
};
// acentos: letra base + marca
const ACC = {
  Á: ['A', 'acute'], À: ['A', 'grave'], Â: ['A', 'circ'], Ã: ['A', 'tilde'],
  É: ['E', 'acute'], Ê: ['E', 'circ'], Í: ['I', 'acute'], Ó: ['O', 'acute'],
  Ô: ['O', 'circ'], Õ: ['O', 'tilde'], Ú: ['U', 'acute'], Ç: ['C', 'ced'],
};

export const LINE = 8;
export const textWidth = (s, sc = 1) => (s.length ? s.length * 4 - 1 : 0) * sc;

function glyph(ctx, ch, x, y, sc) {
  let base = ch, mark = null;
  if (ACC[ch]) [base, mark] = ACC[ch];
  const g = G[base] || G['?'];
  for (let i = 0; i < 15; i++) if (g[i] === '1') ctx.fillRect(x + (i % 3) * sc, y + ((i / 3) | 0) * sc, sc, sc);
  if (mark === 'acute') ctx.fillRect(x + 2 * sc, y - 2 * sc, sc, sc);
  else if (mark === 'grave') ctx.fillRect(x, y - 2 * sc, sc, sc);
  else if (mark === 'circ') { ctx.fillRect(x + sc, y - 2 * sc, sc, sc); ctx.fillRect(x, y - sc, sc, sc); ctx.fillRect(x + 2 * sc, y - sc, sc, sc); }
  else if (mark === 'tilde') { ctx.fillRect(x, y - sc, sc, sc); ctx.fillRect(x + sc, y - 2 * sc, sc, sc); ctx.fillRect(x + 2 * sc, y - sc, sc, sc); }
  else if (mark === 'ced') ctx.fillRect(x + sc, y + 5 * sc, sc, sc);
}

export function drawText(ctx, str, x, y, col = '#fff', sc = 1, shadow = '#140c1e') {
  str = String(str).toUpperCase();
  x = Math.round(x);
  y = Math.round(y);
  if (shadow) {
    ctx.fillStyle = shadow;
    let cx = x + sc;
    for (const ch of str) { glyph(ctx, ch, cx, y + sc, sc); cx += 4 * sc; }
  }
  ctx.fillStyle = col;
  let cx = x;
  for (const ch of str) { glyph(ctx, ch, cx, y, sc); cx += 4 * sc; }
}

// quebra em linhas de no máximo n caracteres
export function wrap(str, n) {
  const words = String(str).split(/\s+/), lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > n) { if (cur) lines.push(cur); cur = w.slice(0, n); }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
