// Desenho do mundo: paredes, árvores, blocos (autotile), decorações animadas e tochas
import { TILE, T, SOLID } from './config.js';
import { atlas, tileSrcY, wallSrcY, TRUNK_Y, CRACK_Y, canopies, branchLeaves } from './tiles.js';
import { PAL, rgb, hex } from './art.js';
import { hash2 } from './noise.js';
import { drawObject, drawPlatform, drawDoor, OBJ } from './furniture.js';

const GR = PAL.grass.map((c) => rgb(c));
const BARK = PAL.bark.map((c) => rgb(c));
const LEAF = PAL.leaf.map((c) => rgb(c));
const FLOWER = { 2: ['#e8485a', '#ffd0d4'], 3: ['#f5c93a', '#fff3b0'], 4: ['#7aa8ff', '#e0ecff'] };
const easeOutBack = (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

function makeGlow([r, g, b]) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.35, `rgba(${r},${g},${b},0.35)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return c;
}
const glowCache = {};
export function glowAt(ctx, x, y, col, size, alpha) {
  const g = glowCache[col] || (glowCache[col] = makeGlow(hex(col)));
  ctx.globalAlpha = alpha;
  ctx.drawImage(g, Math.round(x - size / 2), Math.round(y - size / 2), size, size);
  ctx.globalAlpha = 1;
}
const GLOW_WARM = makeGlow([255, 170, 90]);
const GLOW_CYAN = makeGlow([90, 200, 255]);
const GLOW_TEAL = makeGlow([80, 255, 220]);

export function canopySway(tree, time, wind) {
  return Math.round(Math.sin(time * 1.2 + tree.x * 0.7) * 1.2 + wind);
}

export function drawWorld(ctx, world, view, time, wind, player, out) {
  const { tiles, walls, deco, w, h } = world;
  out.torches.length = 0;
  out.crystals.length = 0;
  out.shrooms.length = 0;
  out.furnaces = out.furnaces || [];
  out.furnaces.length = 0;
  const x0 = Math.max(0, view.x0), x1 = Math.min(w - 1, view.x1);
  const y0 = Math.max(0, view.y0), y1 = Math.min(h - 1, view.y1);

  // 1) paredes de fundo
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x, wl = walls[i];
      if (wl) ctx.drawImage(atlas, 0, wallSrcY(wl, (hash2(x, y, 3) * 4) | 0), TILE, TILE, x * TILE, y * TILE, TILE, TILE);
      else if (!SOLID[tiles[i]] && y > world.surface[x] + 12) {
        ctx.fillStyle = '#0d0a12';
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

  // 2) árvores
  for (const tr of world.trees) {
    if (tr.x < x0 - 3 || tr.x > x1 + 3) continue;
    for (let y = tr.top; y <= tr.base; y++) {
      if (tiles[y * w + tr.x] !== T.TRUNK) continue;
      const col = y === tr.base ? 4 : (hash2(tr.x, y, 8) * 4) | 0;
      ctx.drawImage(atlas, col * TILE, TRUNK_Y, TILE, TILE, tr.x * TILE, y * TILE, TILE, TILE);
    }
    const sway = canopySway(tr, time, wind);
    for (const b of tr.branches) {
      if (tiles[b.y * w + tr.x] !== T.TRUNK) continue;
      const bx = tr.x * TILE + (b.side > 0 ? 12 : 1), by = b.y * TILE + 8;
      ctx.fillStyle = BARK[0];
      ctx.fillRect(bx + (b.side > 0 ? 0 : -1), by - 1, 5, 3);
      ctx.fillStyle = BARK[2];
      ctx.fillRect(bx + (b.side > 0 ? 0 : 0), by, 4, 1);
      const lv = branchLeaves[b.v];
      const lx = b.side > 0 ? bx + 1 : bx - lv.width + 4;
      ctx.drawImage(lv, lx + Math.round(sway * 0.6), by - lv.height + 6);
    }
    const cv = canopies[tr.v];
    ctx.drawImage(cv, tr.x * TILE + 8 - (cv.width >> 1) + sway, tr.top * TILE - cv.height + 22);
  }

  // 2.5) móveis
  for (const o of world.objects) {
    const d = OBJ[o.type];
    if (o.x + d.w < x0 - 1 || o.x > x1 + 1 || o.y < y0 - 1 || o.y - d.h > y1 + 1) continue;
    drawObject(ctx, o, time);
    if (o.type === 'furnace') out.furnaces.push(o);
  }

  // 3) blocos
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x, t = tiles[i];
      if (t === T.AIR || t === T.TRUNK) continue;
      if (t === T.TORCH) { out.torches.push({ x, y }); continue; }
      if (t === T.PLATFORM) { drawPlatform(ctx, x, y, world.get(x - 1, y) === T.PLATFORM || world.isSolid(x - 1, y), world.get(x + 1, y) === T.PLATFORM || world.isSolid(x + 1, y)); continue; }
      if (t === T.DOOR_C || t === T.DOOR_O) {
        const [top] = world.doorSpan(x, y);
        drawDoor(ctx, x, y, Math.min(2, y - top), t === T.DOOR_O);
        continue;
      }
      const mask =
        (world.isSolid(x, y - 1) ? 0 : 1) | (world.isSolid(x + 1, y) ? 0 : 2) |
        (world.isSolid(x, y + 1) ? 0 : 4) | (world.isSolid(x - 1, y) ? 0 : 8);
      const v = (hash2(x, y, 77) * 4) | 0;
      let size = TILE, ox = 0, oy = 0;
      const pa = world.placeAnim.get(i);
      if (pa !== undefined) {
        const k = Math.min(1, (time - pa) / 0.22);
        size = Math.round(TILE * (0.5 + 0.5 * easeOutBack(k)));
        ox = oy = (TILE - size) >> 1;
      }
      const ha = world.hitAnim.get(i);
      if (ha !== undefined && time - ha < 0.07) oy += 1;
      ctx.drawImage(atlas, mask * TILE, tileSrcY(t, v), TILE, TILE, x * TILE + ox, y * TILE + oy, size, size);
      const dmg = world.damage.get(i);
      if (dmg) ctx.drawImage(atlas, Math.min(3, (dmg.v * 4) | 0) * TILE, CRACK_Y, TILE, TILE, x * TILE, y * TILE + oy, TILE, TILE);
      if (t === T.CRYSTAL && mask) out.crystals.push({ x, y });
    }

  // 4) decorações que balançam com o vento e são empurradas pelo jogador
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const d = deco[y * w + x];
      if (d) drawDeco(ctx, x, y, d, time, wind, player, out);
    }

  // 5) tochas animadas
  for (const tc of out.torches) drawTorch(ctx, tc.x, tc.y, time);
}

function drawDeco(ctx, x, y, kind, time, wind, player, out) {
  const gy = (y + 1) * TILE;
  let bend = wind * 1.6 + Math.sin(time * 2.3 + x * 0.8) * 0.7;
  const dx = x * TILE + 8 - player.x;
  if (Math.abs(dx) < 16 && Math.abs(player.y - gy) < 26) bend += (Math.sign(dx || 1) * (16 - Math.abs(dx))) / 3.5;
  if (kind === 1) {
    for (let b = 0; b < 5; b++) {
      const hgt = 3 + Math.floor(hash2(x * 7 + b, y, 11) * 5);
      const bx = x * TILE + 1 + b * 3 + Math.floor(hash2(x, b, 12) * 2);
      const col = GR[2 + Math.floor(hash2(x, b, 13) * 3)];
      for (let k = 0; k < hgt; k++) {
        const t = (k + 1) / hgt;
        ctx.fillStyle = k === 0 ? GR[1] : col;
        ctx.fillRect(bx + Math.round(bend * t * t), gy - 1 - k, 1, 1);
      }
    }
  } else if (kind <= 4) {
    const hgt = 6 + Math.floor(hash2(x, y, 14) * 4), bx = x * TILE + 7;
    ctx.fillStyle = GR[1];
    for (let k = 0; k < hgt; k++) ctx.fillRect(bx + Math.round(bend * ((k + 1) / hgt) ** 2), gy - 1 - k, 1, 1);
    const hx = bx + Math.round(bend), hy = gy - hgt - 1;
    const [pc, cc] = FLOWER[kind];
    ctx.fillStyle = pc;
    ctx.fillRect(hx - 1, hy, 3, 1);
    ctx.fillRect(hx, hy - 1, 1, 3);
    ctx.fillStyle = cc;
    ctx.fillRect(hx, hy, 1, 1);
  } else if (kind === 5) {
    const bx = x * TILE + 6;
    ctx.fillStyle = '#d8d0c0';
    ctx.fillRect(bx + 1, gy - 3, 2, 3);
    ctx.fillStyle = '#2aa0c0';
    ctx.fillRect(bx - 1, gy - 5, 6, 2);
    ctx.fillStyle = '#6ff5ff';
    ctx.fillRect(bx, gy - 6, 4, 1);
    ctx.fillRect(bx - 1, gy - 5, 2, 1);
    out.shrooms.push({ x, y });
  }
}

export function drawTorch(ctx, x, y, time) {
  const cx = x * TILE + 7, by = y * TILE + 15;
  ctx.fillStyle = '#5f3f2c';
  ctx.fillRect(cx, by - 7, 2, 8);
  ctx.fillStyle = '#8a5c3c';
  ctx.fillRect(cx, by - 7, 1, 8);
  ctx.fillStyle = '#3a2a20';
  ctx.fillRect(cx - 1, by - 8, 4, 2);
  const frame = Math.floor(time * 12 + x * 3);
  const fh = 3 + Math.floor(hash2(frame, x, 5) * 3), fb = by - 9;
  ctx.fillStyle = '#ff7a2a';
  ctx.fillRect(cx - 1, fb - fh + 1, 4, fh);
  ctx.fillRect(cx + (frame & 1), fb - fh, 1, 1);
  ctx.fillStyle = '#ffd84a';
  ctx.fillRect(cx, fb - fh + 2, 2, fh - 1);
  ctx.fillStyle = '#fffbe6';
  ctx.fillRect(cx, fb, 2, 1);
}

// Brilho aditivo (bloom falso) desenhado DEPOIS da luz
export function drawGlow(ctx, out, time) {
  for (const t of out.torches) {
    const f = 0.85 + 0.15 * Math.sin(time * 13 + t.x * 1.3) * Math.sin(time * 7.3 + t.y);
    const s = Math.round(46 * f);
    ctx.globalAlpha = 0.3 * f;
    ctx.drawImage(GLOW_WARM, t.x * TILE + 8 - s / 2, t.y * TILE + 3 - s / 2, s, s);
  }
  for (const c of out.crystals) {
    const p = 0.5 + 0.5 * Math.sin(time * 2 + c.x * 0.7 + c.y);
    ctx.globalAlpha = 0.1 + 0.12 * p;
    ctx.drawImage(GLOW_CYAN, c.x * TILE + 8 - 16, c.y * TILE + 8 - 16, 32, 32);
  }
  for (const f of out.furnaces || []) {
    const fl = 0.85 + 0.15 * Math.sin(time * 11 + f.x);
    glowAt(ctx, f.x * TILE + 16, f.y * TILE + 10, '#ff9a4a', Math.round(50 * fl), 0.3 * fl);
  }
  for (const m of out.shrooms) {
    ctx.globalAlpha = 0.3 + 0.08 * Math.sin(time * 3 + m.x);
    ctx.drawImage(GLOW_TEAL, m.x * TILE + 8 - 12, m.y * TILE + 11 - 12, 24, 24);
  }
  ctx.globalAlpha = 1;
}

export { LEAF };
