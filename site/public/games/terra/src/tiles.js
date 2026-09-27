// Geração procedural do atlas de blocos.
// Cada bloco tem 4 variantes x 16 máscaras de vizinhança (autotiling):
// bordas expostas ganham contorno, luz no topo, sombra embaixo e cantos arredondados.
import { TILE, T } from './config.js';
import { PAL, Px, selOut, mixc } from './art.js';
import { hash2, noise2, rng } from './noise.js';

export const VARIANTS = 4;
const AUTO = [T.DIRT, T.GRASS, T.STONE, T.COPPER, T.CRYSTAL, T.PLANK];
const AUTO_ROW = {};
AUTO.forEach((t, i) => (AUTO_ROW[t] = i * VARIANTS));
const WALL_ROW = AUTO.length * VARIANTS;
const TRUNK_ROW = WALL_ROW + 3 * VARIANTS;
const CRACK_ROW = TRUNK_ROW + 1;
const ROWS = CRACK_ROW + 1;

export const atlas = document.createElement('canvas');
export const canopies = [];
export const tileSrcY = (type, v) => (AUTO_ROW[type] + v) * TILE;
export const wallSrcY = (wall, v) => (WALL_ROW + (wall - 1) * VARIANTS + v) * TILE;
export const TRUNK_Y = TRUNK_ROW * TILE;
export const CRACK_Y = CRACK_ROW * TILE;

const S = TILE;
const darker = (c, k = 0.55) => [c[0] * k, c[1] * k * 0.95, c[2] * k * 1.1 + 6];
const WARM = [255, 236, 190];
const COOL = [20, 10, 40];

function texDirt(v, seed) {
  const P = PAL.dirt, p = new Px(S, S), r = rng(seed * 31 + v * 7 + 1);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const n = noise2(x * 0.32 + v * 19.1, y * 0.32 + v * 7.3, seed) * 0.78 + hash2(x + v * 64, y, seed + 1) * 0.22;
      p.set(x, y, P[n < 0.4 ? 1 : n < 0.63 ? 2 : 3]);
    }
  for (let i = 0; i < 3; i++) {
    const x = 1 + Math.floor(r() * 12), y = 2 + Math.floor(r() * 11);
    p.set(x, y, P[4]);
    p.set(x + 1, y, P[3]);
    p.set(x, y + 1, P[3]);
    p.set(x + 1, y + 1, P[1]);
  }
  for (let i = 0; i < 4; i++) p.set(Math.floor(r() * S), Math.floor(r() * S), P[0]);
  return p;
}

// Pedra com "células" de Voronoi: pedaços de rocha com bisel (luz em cima, sombra embaixo)
function texStone(v, seed) {
  const P = PAL.stone, p = new Px(S, S), r = rng(seed * 17 + v * 977 + 3);
  const pts = [];
  for (let i = 0; i < 5; i++) pts.push([r() * S, r() * S, r()]);
  const edge = new Uint8Array(S * S), cell = new Uint8Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let d1 = 1e9, d2 = 1e9, ci = 0;
      pts.forEach((pt, k) => {
        for (const ox of [-S, 0, S])
          for (const oy of [-S, 0, S]) {
            const d = Math.hypot(x + 0.5 - (pt[0] + ox), y + 0.5 - (pt[1] + oy));
            if (d < d1) { d2 = d1; d1 = d; ci = k; } else if (d < d2) d2 = d;
          }
      });
      cell[y * S + x] = ci;
      edge[y * S + x] = d2 - d1 < 1.25 ? 1 : 0;
    }
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      if (edge[i]) { p.set(x, y, P[1]); continue; }
      let c = pts[cell[i]][2] < 0.5 ? 2 : 3;
      if (edge[((y + S - 1) % S) * S + x]) c = Math.min(4, c + 1);
      else if (edge[((y + 1) % S) * S + x]) c -= 1;
      if (hash2(x + v * 40, y, seed + 5) < 0.07) c = Math.max(1, c - 1);
      p.set(x, y, P[c]);
    }
  return p;
}

function ring(p, pts, col) {
  const set = new Set(pts.map(([x, y]) => x + ',' + y));
  for (const [x, y] of pts)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
      if (!set.has(x + dx + ',' + (y + dy))) p.set(x + dx, y + dy, col);
}

function texCopper(v, seed) {
  const p = texStone(v, seed + 11), C = PAL.copper, r = rng(seed + v * 51 + 9);
  const n = 2 + (r() < 0.5 ? 1 : 0);
  for (let k = 0; k < n; k++) {
    const cx = 2 + Math.floor(r() * 10), cy = 2 + Math.floor(r() * 10);
    const shape = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [1, 2]].filter((_, i) => i < 4 || r() < 0.7);
    const pts = shape.map(([x, y]) => [cx + x, cy + y]);
    ring(p, pts, darker(PAL.stone[0], 0.8));
    shape.forEach(([x, y]) => p.set(cx + x, cy + y, x + y === 0 ? C[4] : x + y >= 3 ? C[1] : x + y === 1 ? C[3] : C[2]));
  }
  return p;
}

function texCrystal(v, seed) {
  const p = texStone(v, seed + 23), C = PAL.crystal, r = rng(seed + v * 71 + 5);
  for (let k = 0; k < 2; k++) {
    const bx = 3 + Math.floor(r() * 9), by = 10 + Math.floor(r() * 4), dir = r() < 0.5 ? 1 : -1, len = 5 + Math.floor(r() * 3);
    const pts = [];
    for (let t = 0; t < len; t++) {
      const x = bx + Math.round(t * dir * 0.45), y = by - t;
      pts.push([x, y], [x + 1, y]);
    }
    ring(p, pts, darker(C[0], 0.9));
    for (let t = 0; t < len; t++) {
      const x = bx + Math.round(t * dir * 0.45), y = by - t;
      const tip = t === len - 1;
      p.set(x, y, tip ? C[4] : t === 0 ? C[1] : C[3]);
      p.set(x + 1, y, tip ? C[3] : t === 0 ? C[0] : C[2]);
    }
  }
  return p;
}

function texPlank(v, seed) {
  const P = PAL.wood, p = new Px(S, S);
  for (let y = 0; y < S; y++) {
    const pl = y >> 2, ly = y & 3;
    const jx = 2 + Math.floor(hash2(pl, v, seed + 3) * 12);
    for (let x = 0; x < S; x++) {
      const n = noise2(x * 0.2 + pl * 13 + v * 7, y * 0.9, seed + 4);
      let c = ly === 3 ? P[0] : ly === 0 ? P[3] : n < 0.42 ? P[1] : P[2];
      if (x === jx && ly !== 3) c = P[0];
      p.set(x, y, c);
    }
    p.set(jx - 1, pl * 4 + 1, [170, 170, 180]);
    p.set(jx + 1, pl * 4 + 1, [170, 170, 180]);
  }
  return p;
}

function makeBase(type, v, seed) {
  switch (type) {
    case T.DIRT:
    case T.GRASS: return texDirt(v, seed);
    case T.STONE: return texStone(v, seed);
    case T.COPPER: return texCopper(v, seed);
    case T.CRYSTAL: return texCrystal(v, seed);
    case T.PLANK: return texPlank(v, seed);
  }
}

// máscara: 1=topo exposto, 2=direita, 4=baixo, 8=esquerda
function autotile(base, type, mask, v) {
  const p = base.clone();
  const P = type === T.PLANK ? PAL.wood : type === T.DIRT || type === T.GRASS ? PAL.dirt : PAL.stone;
  const top = mask & 1, right = mask & 2, bottom = mask & 4, left = mask & 8;
  const grassy = type === T.GRASS && top;
  const G = PAL.grass;
  const O = darker(P[0]), OG = darker(G[0]);

  if (grassy) {
    for (let x = 0; x < S; x++) {
      const dep = 3 + Math.floor(hash2(x, v, 55) * 3);
      for (let y = 0; y < dep; y++)
        p.set(x, y, y === dep - 1 ? G[1] : hash2(x, y + v * 16, 56) < 0.25 ? G[3] : G[2]);
      if (hash2(x, v, 57) < 0.22) p.set(x, dep, G[1]); // gotas de grama escorrendo
    }
  }
  if (left)
    for (let y = 0; y < S; y++) {
      p.set(1, y, mixc(p.get(1, y), WARM, 0.22));
      p.set(0, y, grassy && y < 8 ? OG : O);
    }
  if (right)
    for (let y = 0; y < S; y++) {
      p.set(14, y, mixc(p.get(14, y), COOL, 0.28));
      p.set(15, y, grassy && y < 7 ? OG : O);
    }
  if (grassy) {
    if (left) for (let y = 1; y < 7 + (v & 1) * 2; y++) p.set(1, y, G[2]);
    if (right) for (let y = 1; y < 6 + (v >> 1) * 2; y++) p.set(14, y, G[1]);
  }
  if (top)
    for (let x = 0; x < S; x++) {
      p.set(x, 0, grassy ? OG : O);
      if (x > 0 && x < 15) p.set(x, 1, grassy ? (hash2(x, v, 58) < 0.7 ? G[4] : G[3]) : mixc(p.get(x, 1), WARM, 0.38));
    }
  if (bottom)
    for (let x = 0; x < S; x++) {
      p.set(x, 14, mixc(p.get(x, 14), COOL, 0.3));
      p.set(x, 15, O);
    }
  // entalhes orgânicos no topo/base (quebra a linha reta)
  if (type !== T.PLANK) {
    for (let x = 3; x < 13; x++) {
      if (top && !grassy && hash2(x, v * 16 + mask, 91) < 0.12) { p.clear(x, 0); p.set(x, 1, O); }
      if (bottom && hash2(x, v * 16 + mask, 92) < 0.12) { p.clear(x, 15); p.set(x, 14, O); }
    }
  }
  // cantos arredondados
  const corner = (cx, cy, sx, sy, col) => {
    p.clear(cx, cy);
    p.clear(cx + sx, cy);
    p.clear(cx, cy + sy);
    p.set(cx + sx, cy + sy, col);
  };
  if (top && left) corner(0, 0, 1, 1, grassy ? OG : O);
  if (top && right) corner(15, 0, -1, 1, grassy ? OG : O);
  if (bottom && left) corner(0, 15, 1, -1, O);
  if (bottom && right) corner(15, 15, -1, -1, O);
  return p;
}

function texWall(type, v, seed) {
  if (type === 3) { // parede de tábuas (construída pelo jogador): mais clara que as naturais
    const p = texPlank(v, seed + 300);
    for (let i = 0; i < p.d.length; i += 4) { p.d[i] *= 0.62; p.d[i + 1] *= 0.58; p.d[i + 2] = p.d[i + 2] * 0.62 + 6; }
    return p;
  }
  const p = type === 1 ? texDirt(v, seed + 100) : texStone(v, seed + 200);
  for (let i = 0; i < p.d.length; i += 4) {
    p.d[i] *= 0.42;
    p.d[i + 1] *= 0.4;
    p.d[i + 2] = p.d[i + 2] * 0.5 + 4;
  }
  return p;
}

function texTrunk(v, seed, isBase) {
  const B = PAL.bark, p = new Px(S, S);
  for (let y = 0; y < S; y++) {
    const wexp = isBase ? Math.max(0, y - 10) : 0;
    const l = 4 - Math.floor(wexp * 0.8), r = 11 + Math.floor(wexp * 0.8);
    for (let x = l; x <= r; x++) {
      let c;
      if (x === l || x === r) c = darker(B[0]);
      else if (x === l + 1) c = B[3];
      else if (x === r - 1) c = B[1];
      else {
        const n = noise2(x * 0.9 + v * 5, y * 0.15 + v * 3, seed + 4);
        c = n < 0.35 ? B[1] : n < 0.7 ? B[2] : B[3];
      }
      p.set(x, y, c);
    }
  }
  if (!isBase && v === 2) {
    p.set(7, 7, B[0]); p.set(8, 7, B[1]); p.set(7, 8, B[1]); p.set(8, 6, B[4]);
  }
  return p;
}

// Rachaduras progressivas: o mesmo padrão cresce a cada estágio
function texCrack(stage, seed) {
  const p = new Px(S, S), r = rng(seed + 777);
  const branches = [];
  for (let b = 0; b < 5; b++) branches.push({ x: 7.5, y: 7.5, a: (b / 5) * Math.PI * 2 + r() * 0.8 });
  const maxStep = (stage + 1) * 2;
  for (let s = 0; s < maxStep; s++)
    for (const br of branches) {
      br.a += (r() - 0.5) * 0.9;
      br.x += Math.cos(br.a) * 1.1;
      br.y += Math.sin(br.a) * 1.1;
      const x = Math.round(br.x), y = Math.round(br.y);
      p.set(x, y, [16, 8, 22], 190);
      if (p.alpha(x + 1, y + 1) === 0) p.set(x + 1, y + 1, [255, 255, 255], 45);
    }
  return p;
}

// Copa das árvores: união de esferas iluminadas (luz vinda de cima-esquerda) + contorno seletivo
function makeCanopy(v, seed, W = 80, H = 64) {
  const p = new Px(W, H), r = rng(seed + v * 313 + W), L = PAL.leaf;
  const cx = W / 2, cy = H * 0.6, R = Math.min(W, H) * 0.3;
  const blobs = [[cx, cy, R]];
  const n = W > 40 ? 9 : 4;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 0.9 + r() * Math.PI * 1.2, d = R * (0.55 + r() * 0.5);
    blobs.push([cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d * 0.95, R * (0.45 + r() * 0.35)]);
  }
  blobs.push([cx - R * 0.9, cy + R * 0.35, R * 0.5], [cx + R * 0.9, cy + R * 0.35, R * 0.5]);
  const lx = -0.45, ly = -0.75, lz = 0.5, ln = Math.hypot(lx, ly, lz);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let best = null, bz = -1;
      for (const b of blobs) {
        const dx = x + 0.5 - b[0], dy = y + 0.5 - b[1], d2 = dx * dx + dy * dy;
        if (d2 < b[2] * b[2]) {
          const z = Math.sqrt(b[2] * b[2] - d2) + b[2] * 0.25;
          if (z > bz) { bz = z; best = [dx / b[2], dy / b[2], Math.sqrt(Math.max(0, 1 - (d2 / (b[2] * b[2])))), b, d2]; }
        }
      }
      if (!best) continue;
      const [nx, ny, nz, b, d2] = best;
      if (d2 > (b[2] - 1.3) ** 2 && hash2(x, y, seed + v) < 0.3) continue; // borda irregular
      let lum = (nx * lx + ny * ly + nz * lz) / ln + (noise2(x * 0.4, y * 0.4, seed + v * 9) - 0.5) * 0.55;
      const idx = lum < -0.35 ? 0 : lum < 0.05 ? 1 : lum < 0.45 ? 2 : lum < 0.75 ? 3 : 4;
      p.set(x, y, L[idx]);
    }
  selOut(p, 0.4);
  return p.toCanvas();
}

export function buildAtlas(seed = 1337) {
  atlas.width = 16 * S;
  atlas.height = ROWS * S;
  const ctx = atlas.getContext('2d');
  for (const type of AUTO)
    for (let v = 0; v < VARIANTS; v++) {
      const base = makeBase(type, v, seed);
      for (let m = 0; m < 16; m++) ctx.putImageData(autotile(base, type, m, v).toImageData(), m * S, (AUTO_ROW[type] + v) * S);
    }
  for (let w = 1; w <= 3; w++)
    for (let v = 0; v < VARIANTS; v++) ctx.putImageData(texWall(w, v, seed).toImageData(), 0, wallSrcY(w, v));
  for (let v = 0; v < 4; v++) ctx.putImageData(texTrunk(v, seed, false).toImageData(), v * S, TRUNK_Y);
  ctx.putImageData(texTrunk(0, seed, true).toImageData(), 4 * S, TRUNK_Y);
  for (let k = 0; k < 4; k++) ctx.putImageData(texCrack(k, seed).toImageData(), k * S, CRACK_Y);
  canopies.length = 0;
  for (let v = 0; v < 3; v++) canopies.push(makeCanopy(v, seed));
  branchLeaves.length = 0;
  for (let v = 0; v < 3; v++) branchLeaves.push(makeCanopy(v + 10, seed, 26, 20));
}
export const branchLeaves = [];
