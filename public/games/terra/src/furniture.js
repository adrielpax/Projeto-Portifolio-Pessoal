// Móveis (objetos de vários blocos): bancada de trabalho, baú e fornalha.
// Sprites desenhados pixel a pixel com as mesmas rampas de cor dos blocos.
import { TILE } from './config.js';
import { PAL, Px, selOut, hex, ramp5 } from './art.js';
import { hash2 } from './noise.js';

// (x, y) de um objeto = célula inferior esquerda; ocupa w x h células para cima/direita
export const OBJ = {
  workbench: { name: 'Bancada de trabalho', w: 2, h: 1, item: 'workbench', hardness: 0.4 },
  chest: { name: 'Baú', w: 2, h: 2, item: 'chest', hardness: 0.4, slots: 20 },
  furnace: { name: 'Fornalha', w: 2, h: 2, item: 'furnace', hardness: 0.6 },
};

const W = PAL.wood, S = PAL.stone;
const GOLD = ['#5a3a18', '#8a6424', '#c9a040', '#f0d070', '#fff0b0'].map(hex);
export const sprites = {};

function workbench() {
  const p = new Px(32, 16);
  for (let x = 0; x < 32; x++) {
    p.set(x, 4, W[4]); p.set(x, 5, x === 11 || x === 22 ? W[1] : W[3]); p.set(x, 6, W[1]);
  }
  for (const lx of [2, 27])
    for (let y = 7; y < 16; y++) { p.set(lx, y, W[3]); p.set(lx + 1, y, W[2]); p.set(lx + 2, y, W[1]); }
  for (let x = 5; x < 27; x++) { p.set(x, 11, W[2]); p.set(x, 12, W[1]); }
  // martelo e serrote em cima da bancada
  for (let x = 5; x <= 10; x++) p.set(x, 3, W[2]);
  for (let y = 1; y <= 3; y++) { p.set(11, y, [150, 156, 170]); p.set(12, y, [110, 116, 130]); }
  p.set(11, 1, [220, 226, 236]);
  for (let x = 17; x <= 24; x++) { p.set(x, 2, [200, 206, 216]); p.set(x, 3, x % 2 ? [120, 126, 140] : [200, 206, 216]); }
  for (let y = 1; y <= 3; y++) { p.set(25, y, W[1]); p.set(26, y, W[2]); }
  selOut(p, 0.3);
  return p;
}

function chest(open) {
  const p = new Px(32, 32), G = GOLD;
  // corpo
  for (let y = 17; y < 32; y++)
    for (let x = 2; x <= 29; x++) {
      let c = y === 22 || y === 27 ? W[1] : x === 2 ? W[3] : x === 29 ? W[1] : W[2];
      if (y === 17) c = W[3];
      if (open && y >= 17 && y <= 19 && x > 3 && x < 28) c = y === 17 ? W[3] : [40, 20, 18];
      p.set(x, y, c);
    }
  if (open) { p.set(10, 19, G[3]); p.set(12, 18, G[4]); p.set(19, 19, G[3]); p.set(21, 19, G[2]); p.set(15, 19, [140, 220, 255]); }
  // tampa
  if (!open) {
    for (let y = 10; y <= 16; y++) {
      const x0 = y === 10 ? 5 : y === 11 ? 3 : 2, x1 = 31 - x0;
      for (let x = x0; x <= x1; x++) p.set(x, y, y === 16 ? W[0] : y <= 11 ? W[4] : x === x0 ? W[3] : x === x1 ? W[1] : W[3]);
    }
  } else {
    for (let y = 4; y <= 9; y++) {
      const x0 = y === 4 ? 6 : 4, x1 = 31 - x0;
      for (let x = x0; x <= x1; x++) p.set(x, y, y === 9 ? G[2] : y === 4 ? W[3] : W[1]);
    }
  }
  // cintas de metal e fechadura
  const bandTop = open ? 17 : 11;
  for (const bx of [6, 24])
    for (let y = bandTop; y < 31; y++) { p.set(bx, y, G[3]); p.set(bx + 1, y, G[2]); }
  if (open) for (const bx of [6, 24]) for (let y = 5; y <= 8; y++) { p.set(bx, y, G[3]); p.set(bx + 1, y, G[2]); }
  for (let x = 2; x <= 29; x++) { p.set(x, 30, G[2]); p.set(x, 31, G[1]); }
  if (!open) {
    for (let y = 15; y <= 19; y++) for (let x = 14; x <= 17; x++) p.set(x, y, y === 15 ? G[4] : G[3]);
    p.set(15, 17, [30, 16, 10]); p.set(16, 17, [30, 16, 10]); p.set(15, 18, [30, 16, 10]);
  }
  selOut(p, 0.3);
  return p;
}

function furnace() {
  const p = new Px(32, 32);
  const inArch = (x, y) => y >= 17 && y <= 28 && ((y >= 22 && x >= 9 && x <= 22) || (x + 0.5 - 16) ** 2 + (y + 0.5 - 23) ** 2 < 49);
  for (let y = 6; y < 32; y++)
    for (let x = 1; x <= 30; x++) {
      if (y < 9 && (x < 1 + (9 - y) || x > 30 - (9 - y))) continue; // topo arredondado
      if (inArch(x, y)) { p.set(x, y, [26, 10, 10]); continue; }
      const row = Math.floor((y - 6) / 4), off = row % 2 ? 4 : 0;
      const mortar = (y - 6) % 4 === 3 || (x + off) % 8 === 0;
      let c = mortar ? S[1] : hash2(Math.floor((x + off) / 8), row, 5) < 0.5 ? S[2] : S[3];
      if (!mortar && (y - 6) % 4 === 0) c = S[4];
      if (y >= 29) c = S[1];
      // tijolos em volta da boca ficam alaranjados pelo calor
      if (!mortar && (x + 0.5 - 16) ** 2 + (y + 0.5 - 23) ** 2 < 100) c = mortar ? c : [168, 104, 78];
      p.set(x, y, c);
    }
  for (let y = 0; y < 7; y++) for (let x = 21; x <= 26; x++) p.set(x, y, y === 0 ? S[4] : x === 21 ? S[3] : x === 26 ? S[1] : S[2]);
  selOut(p, 0.3);
  return p;
}

// reduz 2x fazendo média dos pixels (ícone 16x16 a partir do sprite)
function downsample(src) {
  const p = new Px(16, 16), w = src.w >> 1, h = src.h >> 1, oy = (16 - h) >> 1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const c = src.get(x * 2 + dx, y * 2 + dy);
        if (c[3] > 0) { r += c[0]; g += c[1]; b += c[2]; n++; }
        a += c[3];
      }
      if (n >= 2) p.set(x, y + oy, [r / n, g / n, b / n], 255);
    }
  return p;
}

export const furnitureIcons = {};
export function buildFurniture() {
  const wb = workbench(), ch = chest(false), cho = chest(true), fu = furnace();
  sprites.workbench = wb.toCanvas();
  sprites.chest = ch.toCanvas();
  sprites.chestOpen = cho.toCanvas();
  sprites.furnace = fu.toCanvas();
  furnitureIcons.workbench = downsample(wb);
  furnitureIcons.chest = downsample(ch);
  furnitureIcons.furnace = downsample(fu);
}

export function drawObject(ctx, o, time) {
  const def = OBJ[o.type];
  const spr = o.type === 'chest' && o.open ? sprites.chestOpen : sprites[o.type];
  const x = o.x * TILE, y = (o.y + 1) * TILE - spr.height;
  ctx.drawImage(spr, x, y);
  if (o.type === 'furnace') {
    // fogo animado dentro da boca
    const f = Math.floor(time * 10);
    for (let fx = 11; fx <= 20; fx++) {
      const h = 2 + Math.floor(hash2(fx, f, 3) * 4 + Math.sin(time * 6 + fx) * 1.2);
      for (let k = 0; k < h; k++) {
        ctx.fillStyle = k === 0 ? '#fff3c0' : k < 2 ? '#ffd24a' : k < 4 ? '#ff8a2a' : '#c8402a';
        ctx.fillRect(x + fx, y + 28 - k, 1, 1);
      }
    }
  }
  return def;
}

// plataforma de madeira (passa por baixo, pisa por cima)
export function drawPlatform(ctx, x, y, left, right) {
  const px = x * TILE, py = y * TILE;
  const col = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillStyle = col(W[4]); ctx.fillRect(px, py, TILE, 1);
  ctx.fillStyle = col(W[3]); ctx.fillRect(px, py + 1, TILE, 2);
  ctx.fillStyle = col(W[2]); ctx.fillRect(px, py + 2, TILE, 1);
  ctx.fillStyle = col(W[1]); ctx.fillRect(px, py + 3, TILE, 1);
  ctx.fillStyle = col(W[0]); ctx.fillRect(px, py + 4, TILE, 1);
  ctx.fillRect(px + 7, py + 1, 1, 3);
  if (!left) { ctx.fillRect(px, py, 1, 5); ctx.fillStyle = col(W[1]); ctx.fillRect(px + 1, py + 5, 2, 1); ctx.fillRect(px + 2, py + 6, 1, 2); }
  if (!right) { ctx.fillStyle = col(W[0]); ctx.fillRect(px + 15, py, 1, 5); ctx.fillStyle = col(W[1]); ctx.fillRect(px + 13, py + 5, 2, 1); ctx.fillRect(px + 13, py + 6, 1, 2); }
}

// porta de 3 blocos de altura; part: 0 topo, 1 meio, 2 base
export function drawDoor(ctx, x, y, part, open) {
  const px = x * TILE, py = y * TILE;
  const col = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  if (open) {
    ctx.fillStyle = col(W[0]); ctx.fillRect(px + 1, py, 4, TILE);
    ctx.fillStyle = col(W[3]); ctx.fillRect(px + 2, py, 1, TILE);
    ctx.fillStyle = col(W[2]); ctx.fillRect(px + 3, py, 1, TILE);
    if (part === 0) { ctx.fillStyle = col(W[0]); ctx.fillRect(px + 1, py, 4, 1); }
    if (part === 2) { ctx.fillStyle = col(W[0]); ctx.fillRect(px + 1, py + 15, 4, 1); }
    return;
  }
  const x0 = px + 2, w = 12;
  for (let i = 0; i < w; i++) {
    ctx.fillStyle = col(i === 0 ? W[3] : i === w - 1 ? W[1] : (i >> 2) % 2 ? W[2] : W[3]);
    ctx.fillRect(x0 + i, py, 1, TILE);
    if (i % 4 === 3 && i < w - 1) { ctx.fillStyle = col(W[1]); ctx.fillRect(x0 + i, py, 1, TILE); }
  }
  ctx.fillStyle = col(W[0]);
  ctx.fillRect(x0 - 1, py, 1, TILE);
  ctx.fillRect(x0 + w, py, 1, TILE);
  if (part === 0) { ctx.fillRect(x0 - 1, py, w + 2, 1); ctx.fillStyle = col(W[1]); ctx.fillRect(x0, py + 6, w, 2); }
  if (part === 2) { ctx.fillRect(x0 - 1, py + 15, w + 2, 1); ctx.fillStyle = col(W[1]); ctx.fillRect(x0, py + 9, w, 2); }
  if (part === 1) {
    ctx.fillStyle = col(GOLD[2]); ctx.fillRect(x0 + 8, py + 7, 2, 2);
    ctx.fillStyle = col(GOLD[4]); ctx.fillRect(x0 + 8, py + 7, 1, 1);
  }
}
