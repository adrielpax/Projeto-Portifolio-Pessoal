// Registro de itens, sprites de armas/ferramentas, ícones pixelados e receitas
import { TILE, T, W } from './config.js';
import { PAL, Px, selOut, hex, rotateInto, ramp5 } from './art.js';
import { atlas, tileSrcY, wallSrcY } from './tiles.js';
import { drawTorch } from './render.js';
import { furnitureIcons, drawPlatform, drawDoor } from './furniture.js';

const MAT = {
  wood: PAL.wood,
  copper: PAL.copper,
  crystal: PAL.crystal,
  flesh: ramp5(hex('#b04a5e')),
};
export const MAT_RAMP = MAT;

// kind: block | tool | melee | bow | staff | ammo | armor | material | potion
export const ITEMS = {
  dirt: { name: 'Terra', kind: 'block', tile: T.DIRT, max: 999 },
  stone: { name: 'Pedra', kind: 'block', tile: T.STONE, max: 999 },
  plank: { name: 'Madeira', kind: 'block', tile: T.PLANK, max: 999 },
  copper: { name: 'Minério de cobre', kind: 'block', tile: T.COPPER, max: 999 },
  crystal: { name: 'Cristal', kind: 'block', tile: T.CRYSTAL, max: 999 },
  torch: { name: 'Tocha', kind: 'block', tile: T.TORCH, max: 999, desc: 'Ilumina ao redor' },
  platform: { name: 'Plataforma de madeira', kind: 'block', tile: T.PLATFORM, max: 999, desc: 'Suba por baixo, desça com S' },
  door: { name: 'Porta de madeira', kind: 'door', max: 99, desc: 'Ocupa 3 blocos. Clique direito abre' },
  wall_wood: { name: 'Parede de madeira', kind: 'wall', wall: W.WOOD, max: 999, desc: 'Parede de fundo' },
  wall_stone: { name: 'Parede de pedra', kind: 'wall', wall: W.STONE, max: 999, desc: 'Parede de fundo' },
  wall_dirt: { name: 'Parede de terra', kind: 'wall', wall: W.DIRT, max: 999, desc: 'Parede de fundo' },
  workbench: { name: 'Bancada de trabalho', kind: 'furniture', obj: 'workbench', max: 99, desc: 'Libera mais receitas' },
  chest: { name: 'Baú', kind: 'furniture', obj: 'chest', max: 99, desc: 'Guarda 20 pilhas. Clique direito abre' },
  furnace: { name: 'Fornalha', kind: 'furniture', obj: 'furnace', max: 99, desc: 'Derrete minério em barras' },
  copper_bar: { name: 'Barra de cobre', kind: 'material', max: 999, desc: 'Feita na fornalha' },

  gel: { name: 'Gel', kind: 'material', max: 999, desc: 'Solto por gosmas' },
  cloth: { name: 'Tecido', kind: 'material', max: 999, desc: 'Solto por zumbis' },
  wing: { name: 'Asa de morcego', kind: 'material', max: 999, desc: 'Solta por morcegos' },
  arrow: { name: 'Flecha', kind: 'ammo', max: 999, damage: 3, desc: 'Munição do arco' },
  potion: { name: 'Poção de vida', kind: 'potion', max: 30, heal: 50, desc: 'Cura 50 de vida' },
  bait: { name: 'Isca nojenta', kind: 'summon', max: 20, desc: 'Invoca O Abominável' },

  hammer: { name: 'Martelo', kind: 'tool', hammer: true, max: 1, damage: 6, speed: 0.3, knock: 160, mat: 'wood', desc: 'Remove paredes' },
  pickaxe: { name: 'Picareta', kind: 'tool', max: 1, damage: 5, speed: 0.27, knock: 120, mat: 'wood', desc: 'Minera blocos' },
  sword_wood: { name: 'Espada de madeira', kind: 'melee', max: 1, damage: 9, speed: 0.34, knock: 190, mat: 'wood' },
  sword_copper: { name: 'Espada de cobre', kind: 'melee', max: 1, damage: 15, speed: 0.3, knock: 230, mat: 'copper' },
  sword_crystal: { name: 'Espada de cristal', kind: 'melee', max: 1, damage: 24, speed: 0.25, knock: 270, mat: 'crystal', glow: '#8aeeff', desc: 'Golpe cintilante' },
  sword_flesh: { name: 'Lâmina podre', kind: 'melee', max: 1, damage: 34, speed: 0.28, knock: 290, mat: 'flesh', lifesteal: 2, smear: 'rgba(255,120,150,0.6)', desc: 'Rouba vida a cada golpe' },
  bow_wood: { name: 'Arco de madeira', kind: 'bow', max: 1, damage: 10, speed: 0.5, knock: 140, shot: 470, ammo: 'arrow', mat: 'wood', desc: 'Usa flechas' },
  staff_crystal: { name: 'Cajado de cristal', kind: 'staff', max: 1, damage: 17, speed: 0.38, knock: 100, shot: 300, mat: 'crystal', glow: '#8aeeff', desc: 'Projéteis teleguiados' },

  helm_copper: { name: 'Capacete de cobre', kind: 'armor', slot: 'head', max: 1, defense: 2, mat: 'copper', set: 'copper' },
  chest_copper: { name: 'Peitoral de cobre', kind: 'armor', slot: 'body', max: 1, defense: 3, mat: 'copper', set: 'copper' },
  legs_copper: { name: 'Grevas de cobre', kind: 'armor', slot: 'legs', max: 1, defense: 2, mat: 'copper', set: 'copper' },
  helm_crystal: { name: 'Elmo de cristal', kind: 'armor', slot: 'head', max: 1, defense: 4, mat: 'crystal', set: 'crystal' },
  chest_crystal: { name: 'Couraça de cristal', kind: 'armor', slot: 'body', max: 1, defense: 6, mat: 'crystal', set: 'crystal' },
  legs_crystal: { name: 'Grevas de cristal', kind: 'armor', slot: 'legs', max: 1, defense: 4, mat: 'crystal', set: 'crystal' },
};
for (const id in ITEMS) ITEMS[id].id = id;

export const SET_BONUS = {
  copper: { text: 'Conjunto: +3 de defesa', defense: 3 },
  crystal: { text: 'Conjunto: brilha no escuro, +5 de defesa', defense: 5, glow: true },
};

export const TILE_DROP = {
  [T.DIRT]: 'dirt', [T.GRASS]: 'dirt', [T.STONE]: 'stone', [T.COPPER]: 'copper',
  [T.CRYSTAL]: 'crystal', [T.PLANK]: 'plank', [T.TRUNK]: 'plank', [T.TORCH]: 'torch',
  [T.PLATFORM]: 'platform', [T.DOOR_C]: 'door', [T.DOOR_O]: 'door',
};
export const WALL_DROP = { 1: 'wall_dirt', 2: 'wall_stone', 3: 'wall_wood' };

// station: onde a receita pode ser feita (sem station = na mão)
export const STATION_NAME = { workbench: 'Bancada de trabalho', furnace: 'Fornalha' };
export const RECIPES = [
  { out: 'workbench', n: 1, in: [['plank', 10]] },
  { out: 'torch', n: 4, in: [['plank', 1], ['gel', 1]] },
  { out: 'platform', n: 2, in: [['plank', 1]] },
  { out: 'wall_wood', n: 4, in: [['plank', 1]] },
  { out: 'door', n: 1, in: [['plank', 6]], station: 'workbench' },
  { out: 'chest', n: 1, in: [['plank', 8], ['copper_bar', 2]], station: 'workbench' },
  { out: 'furnace', n: 1, in: [['stone', 20], ['plank', 4], ['torch', 3]], station: 'workbench' },
  { out: 'wall_stone', n: 4, in: [['stone', 1]], station: 'workbench' },
  { out: 'hammer', n: 1, in: [['plank', 8]], station: 'workbench' },
  { out: 'arrow', n: 10, in: [['plank', 2], ['stone', 1]], station: 'workbench' },
  { out: 'sword_wood', n: 1, in: [['plank', 7]], station: 'workbench' },
  { out: 'bow_wood', n: 1, in: [['plank', 12]], station: 'workbench' },
  { out: 'potion', n: 1, in: [['gel', 2], ['crystal', 1]], station: 'workbench' },
  { out: 'bait', n: 1, in: [['gel', 6], ['cloth', 3], ['wing', 2]], station: 'workbench' },
  { out: 'copper_bar', n: 1, in: [['copper', 3]], station: 'furnace' },
  { out: 'sword_copper', n: 1, in: [['copper_bar', 6], ['plank', 2]], station: 'workbench' },
  { out: 'helm_copper', n: 1, in: [['copper_bar', 5]], station: 'workbench' },
  { out: 'chest_copper', n: 1, in: [['copper_bar', 8], ['cloth', 3]], station: 'workbench' },
  { out: 'legs_copper', n: 1, in: [['copper_bar', 6]], station: 'workbench' },
  { out: 'sword_crystal', n: 1, in: [['crystal', 12], ['copper_bar', 2]], station: 'workbench' },
  { out: 'staff_crystal', n: 1, in: [['crystal', 12], ['plank', 4], ['wing', 2]], station: 'workbench' },
  { out: 'helm_crystal', n: 1, in: [['crystal', 12], ['wing', 2]], station: 'workbench' },
  { out: 'chest_crystal', n: 1, in: [['crystal', 20], ['wing', 4]], station: 'workbench' },
  { out: 'legs_crystal', n: 1, in: [['crystal', 15], ['wing', 3]], station: 'workbench' },
];

const GOLD = ['#5a3a18', '#8a6424', '#c9a040', '#f0d070', '#fff0b0'].map(hex);

// ---------------- sprites de mão (horizontais, pivô na empunhadura) ----------------
function swordSprite(m) {
  const p = new Px(20, 9);
  const guard = m === MAT.wood ? PAL.wood : GOLD;
  const grip = PAL.bark;
  for (let x = 0; x < 2; x++) for (let y = 3; y <= 5; y++) p.set(x, y, guard[x === 0 ? 1 : 2]);
  for (let x = 2; x <= 5; x++) { p.set(x, 3, grip[3]); p.set(x, 4, (x & 1) ? grip[1] : grip[2]); p.set(x, 5, grip[1]); }
  for (let y = 0; y <= 8; y++) { p.set(6, y, guard[y < 4 ? 3 : 2]); p.set(7, y, guard[1]); }
  for (let x = 8; x <= 17; x++) { p.set(x, 3, m[4]); p.set(x, 4, x > 9 && x < 15 ? m[2] : m[3]); p.set(x, 5, m[1]); }
  p.set(18, 3, m[4]); p.set(18, 4, m[3]); p.set(19, 4, m[4]);
  selOut(p, 0.3);
  return { px: p, gx: 3.5, gy: 4.5 };
}

function pickSprite() {
  const p = new Px(18, 18);
  const h = hex('#8a5a34'), hl = hex('#b98450'), grip = hex('#4a2e20');
  const m = hex('#9aa3b3'), ml = hex('#e2e8f0'), md = hex('#5a6273');
  for (let x = 1; x <= 12; x++) { p.set(x, 8, x < 4 ? grip : hl); p.set(x, 9, x < 4 ? grip : h); }
  for (let y = 1; y <= 16; y++) {
    const dy = y - 8.5, cx = 14 - Math.round((dy * dy) / 16), thick = Math.abs(dy) < 3 ? 3 : 2;
    for (let k = 0; k < thick; k++) p.set(cx - k, y, k === thick - 1 ? (dy < 0 ? ml : m) : k === 0 ? md : m);
  }
  selOut(p, 0.3);
  return { px: p, gx: 2.5, gy: 9 };
}

function hammerSprite() {
  const p = new Px(18, 18);
  const h = hex('#8a5a34'), hl = hex('#b98450'), grip = hex('#4a2e20');
  const m = hex('#9aa3b3'), ml = hex('#e2e8f0'), md = hex('#5a6273');
  for (let x = 1; x <= 12; x++) { p.set(x, 8, x < 4 ? grip : hl); p.set(x, 9, x < 4 ? grip : h); }
  for (let y = 3; y <= 14; y++) for (let x = 11; x <= 15; x++) p.set(x, y, x === 11 ? ml : x === 15 ? md : y === 3 ? ml : y === 14 ? md : m);
  selOut(p, 0.3);
  return { px: p, gx: 2.5, gy: 9 };
}

function staffSprite() {
  const p = new Px(24, 11), W = PAL.wood, C = PAL.crystal;
  for (let x = 0; x <= 17; x++) { p.set(x, 5, W[3]); p.set(x, 6, x % 5 === 2 ? W[0] : W[1]); }
  const shards = [[18, 5, 3], [19, 3, 4], [20, 5, 5], [21, 7, 3], [19, 7, 2]];
  for (const [x, y, len] of shards)
    for (let t = 0; t < len; t++) { p.set(x + t, y - (t >> 1), t === len - 1 ? C[4] : C[3]); p.set(x + t, y - (t >> 1) + 1, C[2]); }
  p.set(21, 5, C[4]); p.set(22, 4, C[4]);
  selOut(p, 0.35);
  return { px: p, gx: 5.5, gy: 5.5, tip: 21 - 5.5 };
}

// arco com a corda puxada "pull" pixels e flecha encaixada opcional
const bowCache = new Map();
export function bowSprite(pull, nocked) {
  const key = pull * 2 + (nocked ? 1 : 0);
  if (bowCache.has(key)) return bowCache.get(key);
  const p = new Px(18, 23), W = PAL.wood;
  const sx = 4; // x da corda em repouso
  for (let y = 1; y <= 21; y++) {
    const dy = y - 11, x = 10 - Math.round((dy * dy) / 16);
    const tip = Math.abs(dy) > 8;
    p.set(x, y, tip ? W[4] : W[3]);
    p.set(x + 1, y, Math.abs(dy) < 2 ? W[0] : W[1]);
  }
  const top = 1, bot = 21, midX = sx - pull;
  const lineTo = (x0, y0, x1, y1) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= n; s++) p.set(Math.round(x0 + ((x1 - x0) * s) / n), Math.round(y0 + ((y1 - y0) * s) / n), [225, 220, 205]);
  };
  lineTo(4, top, midX, 11);
  lineTo(midX, 11, 4, bot);
  if (nocked) {
    for (let x = midX; x <= 14; x++) p.set(x, 11, x > 12 ? [200, 206, 220] : PAL.wood[2]);
    p.set(15, 11, [230, 236, 245]); p.set(14, 10, [170, 176, 190]); p.set(14, 12, [170, 176, 190]);
    p.set(midX, 10, [240, 240, 240]); p.set(midX, 12, [220, 70, 70]);
  }
  selOut(p, 0.3);
  const r = { px: p, gx: 10.5, gy: 11.5 };
  bowCache.set(key, r);
  return r;
}

const spriteCache = {};
export function handSprite(def) {
  if (!def) return null;
  if (spriteCache[def.id]) return spriteCache[def.id];
  let s = null;
  if (def.kind === 'tool') s = def.hammer ? hammerSprite() : pickSprite();
  else if (def.kind === 'melee') s = swordSprite(MAT[def.mat]);
  else if (def.kind === 'staff') s = staffSprite();
  return (spriteCache[def.id] = s);
}

// ---------------- ícones 16x16 ----------------
function paintHelmet(m, crest) {
  const p = new Px(16, 16);
  for (let y = 2; y <= 12; y++)
    for (let x = 1; x <= 14; x++) {
      const dx = x + 0.5 - 8, dy = y + 0.5 - 9;
      const dome = y <= 9 && dx * dx + dy * dy * 1.3 < 38;
      const cheek = y >= 8 && y <= 12 && (x <= 4 || x >= 11) && Math.abs(dx) < 6.6;
      if (!dome && !cheek) continue;
      if (y >= 8 && x > 4 && x < 11) continue; // abertura do rosto
      let c = dx < -2 ? 3 : dx < 2 ? 2 : 1;
      if (dy < -4) c = Math.min(4, c + 1);
      if (y === 8 || y === 9) c = Math.max(1, c - 1);
      p.set(x, y, m[c]);
    }
  p.set(5, 4, m[4]); p.set(6, 3, m[4]);
  if (crest) for (let y = 0; y < 3; y++) { p.set(7, y, m[4]); p.set(8, y + 1, m[3]); }
  selOut(p, 0.3);
  return p;
}
function paintChest(m) {
  const p = new Px(16, 16);
  for (let y = 3; y <= 13; y++) {
    const x0 = y >= 11 ? 5 : 4, x1 = y >= 11 ? 10 : 11;
    for (let x = x0; x <= x1; x++) {
      if (y === 3 && x > 5 && x < 10) continue;
      let c = x <= 5 ? 3 : x <= 8 ? 2 : 1;
      if (y === 11) c = 0;
      if ((x === 7 || x === 8) && y > 4 && y < 11) c = Math.max(1, c - 1);
      p.set(x, y, m[c]);
    }
  }
  for (const [cx, sh] of [[3, 3], [12, 1]])
    for (let y = 2; y <= 6; y++) for (let x = cx - 2; x <= cx + 2; x++) if ((x - cx) ** 2 + (y - 4) ** 2 <= 5) p.set(x, y, m[y < 4 ? Math.min(4, sh + 1) : sh]);
  p.set(5, 6, m[4]);
  selOut(p, 0.3);
  return p;
}
function paintLegs(m) {
  const p = new Px(16, 16);
  for (let x = 4; x <= 11; x++) { p.set(x, 2, m[1]); p.set(x, 3, m[x < 7 ? 3 : 2]); }
  for (const lx of [4, 9])
    for (let y = 4; y <= 12; y++) for (let x = lx; x <= lx + 2; x++) p.set(x, y, m[x === lx ? 3 : x === lx + 2 ? 1 : 2]);
  for (const lx of [4, 9]) { p.set(lx, 7, m[4]); p.set(lx + 1, 7, m[4]); for (let x = lx; x <= lx + 3; x++) p.set(x, 13, m[x === lx + 3 ? 2 : 1]); }
  selOut(p, 0.3);
  return p;
}
function paintBlob(m) {
  const p = new Px(16, 16);
  for (let y = 4; y <= 13; y++) for (let x = 2; x <= 13; x++) {
    const dx = (x + 0.5 - 8) / 5.8, dy = (y + 0.5 - 9.5) / (y < 9.5 ? 5 : 4);
    if (dx * dx + dy * dy > 1) continue;
    p.set(x, y, m[dy < -0.3 && dx < 0 ? 3 : dy > 0.5 ? 1 : 2], 235);
  }
  p.set(5, 6, m[4]); p.set(6, 6, m[4]); p.set(5, 7, m[4]);
  selOut(p, 0.35);
  return p;
}
function paintCloth() {
  const p = new Px(16, 16), C = ramp5(hex('#b89a74'));
  for (let y = 3; y <= 12; y++) for (let x = 2; x <= 13; x++) {
    if (x + y < 7 || x - y > 9) continue;
    p.set(x, y, C[x + y > 16 ? 1 : x > y + 2 ? 3 : 2]);
  }
  for (let x = 3; x <= 12; x++) p.set(x, 8, C[4]);
  selOut(p, 0.3);
  return p;
}
function paintWing() {
  const p = new Px(16, 16), C = ramp5(hex('#6a3a7a'));
  for (let x = 1; x <= 14; x++) {
    const top = 4 + Math.round(Math.abs(x - 3) * 0.35), bot = 10 + (x % 4 === 0 ? -2 : 0) - Math.round(Math.abs(x - 7) * 0.3);
    for (let y = top; y <= bot; y++) p.set(x, y, C[y === top ? 3 : y > bot - 2 ? 1 : 2]);
  }
  for (let x = 1; x <= 14; x++) p.set(x, 4 + Math.round(Math.abs(x - 3) * 0.35), C[4]);
  selOut(p, 0.3);
  return p;
}
function paintPotion() {
  const p = new Px(16, 16), R = ramp5(hex('#e03a4a')), G = [[200, 220, 235], [240, 248, 255]];
  for (let y = 7; y <= 14; y++) for (let x = 3; x <= 12; x++) {
    const d = (x + 0.5 - 8) ** 2 + (y + 0.5 - 10.5) ** 2;
    if (d > 20) continue;
    p.set(x, y, y < 9 ? G[0] : R[x < 7 ? 3 : x > 9 ? 1 : 2]);
  }
  for (let y = 3; y <= 6; y++) { p.set(7, y, G[0]); p.set(8, y, G[1]); }
  p.set(6, 2, PAL.wood[2]); p.set(7, 2, PAL.wood[3]); p.set(8, 2, PAL.wood[3]); p.set(9, 2, PAL.wood[1]);
  p.set(5, 10, G[1]); p.set(5, 11, G[1]);
  selOut(p, 0.3);
  return p;
}
function paintArrow() {
  const p = new Px(16, 16);
  for (let i = 0; i < 11; i++) p.set(3 + i, 12 - i, PAL.wood[2]);
  p.set(13, 2, [230, 236, 245]); p.set(14, 1, [230, 236, 245]); p.set(12, 2, [170, 176, 190]); p.set(13, 3, [170, 176, 190]);
  p.set(2, 12, [240, 240, 240]); p.set(3, 13, [220, 70, 70]); p.set(2, 13, [240, 240, 240]);
  selOut(p, 0.3);
  return p;
}

function paintBait() {
  const p = new Px(16, 16), F = ramp5(hex('#8a4a6a')), G = ramp5(hex('#8aa040'));
  for (let y = 3; y <= 14; y++) for (let x = 2; x <= 13; x++) {
    const a = Math.atan2(y - 9, x - 8), r = 5.2 + Math.sin(a * 3) * 0.9;
    const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 9);
    if (d > r) continue;
    p.set(x, y, F[d > r - 1.2 ? 1 : x + y < 15 ? 3 : 2]);
  }
  for (const [x, y] of [[4, 11], [11, 6], [10, 12]]) { p.set(x, y, G[2]); p.set(x, y - 1, G[4]); }
  for (let y = 6; y <= 9; y++) for (let x = 6; x <= 9; x++) if ((x - 7.5) ** 2 + (y - 7.5) ** 2 < 4.5) p.set(x, y, [232, 220, 176]);
  p.set(8, 8, [200, 40, 40]); p.set(7, 8, [200, 40, 40]); p.set(8, 7, [20, 10, 20]);
  p.set(6, 13, G[3]); p.set(6, 14, G[2]);
  selOut(p, 0.3);
  return p;
}

function paintBar() {
  const p = new Px(16, 16), C = PAL.copper;
  for (let y = 7; y <= 12; y++) for (let x = 2; x <= 13; x++) {
    if ((y === 7 && (x < 4 || x > 11)) || (y === 8 && (x < 3 || x > 12))) continue;
    p.set(x, y, y === 7 ? C[4] : y === 8 ? C[3] : y >= 11 ? C[1] : C[2]);
  }
  p.set(5, 9, C[4]); p.set(6, 9, C[4]);
  selOut(p, 0.3);
  return p;
}

function rotIcon(s) {
  return rotateInto(s.px, s.px.w / 2, s.px.h / 2, -Math.PI / 4, new Px(16, 16), 8, 8);
}

export const icons = {};
export function buildItems() {
  for (const id in ITEMS) {
    const d = ITEMS[id];
    const c = document.createElement('canvas');
    c.width = c.height = 16;
    const x = c.getContext('2d');
    let p = null;
    if (d.kind === 'furniture') p = furnitureIcons[d.obj];
    else if (d.kind === 'wall') {
      x.drawImage(atlas, 0, wallSrcY(d.wall, 0), TILE, TILE, 2, 2, 12, 12);
      x.fillStyle = '#1a1026';
      x.fillRect(1, 1, 14, 1); x.fillRect(1, 14, 14, 1); x.fillRect(1, 1, 1, 14); x.fillRect(14, 1, 1, 14);
    } else if (d.kind === 'door') {
      x.save(); x.translate(0, 0); x.scale(1, 1 / 3);
      for (let k = 0; k < 3; k++) drawDoor(x, 0, k, k, false);
      x.restore();
    } else if (id === 'platform') { x.save(); x.translate(0, 5); drawPlatform(x, 0, 0, false, false); x.restore(); }
    else if (id === 'copper_bar') p = paintBar();
    else if (d.kind === 'block') {
      if (d.tile === T.TORCH) drawTorch(x, 0, 0, 0.3);
      else x.drawImage(atlas, 15 * TILE, tileSrcY(d.tile, 0), TILE, TILE, 0, 0, TILE, TILE);
    } else if (d.kind === 'armor') {
      const m = MAT[d.mat];
      p = d.slot === 'head' ? paintHelmet(m, d.mat === 'crystal') : d.slot === 'body' ? paintChest(m) : paintLegs(m);
    } else if (d.kind === 'melee' || d.kind === 'tool' || d.kind === 'staff') p = rotIcon(handSprite(d));
    else if (d.kind === 'bow') p = rotateInto(bowSprite(0, false).px, 9, 11.5, -Math.PI / 4, new Px(16, 16), 8, 8);
    else if (id === 'gel') p = paintBlob(ramp5(hex('#4aa8f0')));
    else if (id === 'cloth') p = paintCloth();
    else if (id === 'wing') p = paintWing();
    else if (id === 'potion') p = paintPotion();
    else if (id === 'arrow') p = paintArrow();
    else if (id === 'bait') p = paintBait();
    if (p) x.putImageData(p.toImageData(), 0, 0);
    icons[id] = c;
  }
}

export function itemLines(d) {
  const L = [];
  if (d.damage && d.kind !== 'ammo') L.push([`${d.damage} de dano`, '#ffd08a']);
  if (d.kind === 'ammo') L.push([`+${d.damage} de dano`, '#ffd08a']);
  if (d.speed && d.kind !== 'tool') L.push([d.speed < 0.28 ? 'Muito rápido' : d.speed < 0.33 ? 'Rápido' : 'Médio', '#c8c0e0']);
  if (d.defense) L.push([`${d.defense} de defesa`, '#9fd8ff']);
  if (['block', 'wall', 'furniture', 'door'].includes(d.kind)) L.push(['Pode ser colocado', '#a8a0c0']);
  if (d.set) L.push([SET_BONUS[d.set].text, '#b8f0a0']);
  if (d.lifesteal) L.push([`Rouba ${d.lifesteal} de vida`, '#ff9ab0']);
  if (d.desc) L.push([d.desc, '#a8a0c0']);
  return L;
}
