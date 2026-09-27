// Loop principal: jogabilidade, combate, rede, câmera e pipeline de renderização
//
// Pipeline por frame:
//  1. fundo (céu pontilhado + parallax) no buffer de baixa resolução
//  2. mundo + entidades numa camada separada
//  3. luz colorida multiplicada só sobre a camada do mundo
//  4. brilho aditivo (tochas, cristais, magias, faíscas)
//  5. upscale inteiro "nearest" com deslocamento sub-pixel da câmera
import { TILE, T, SOLID, HARDNESS, WALL_HARDNESS, BASE_W, BASE_H, DAY_LEN, REACH } from './config.js';
import { World } from './world.js';
import { buildAtlas } from './tiles.js';
import { Lighting } from './lighting.js';
import { Player } from './player.js';
import { Particles } from './particles.js';
import { Background } from './background.js';
import { input, endFrame, initInput } from './input.js';
import { drawWorld, drawGlow, drawTorch, canopySway, glowAt, LEAF } from './render.js';
import { ITEMS, TILE_DROP, WALL_DROP, buildItems, icons } from './items.js';
import { OBJ, buildFurniture, sprites as furnSprites } from './furniture.js';
import { Inventory } from './inventory.js';
import { Enemies, TYPES, factory } from './enemies.js';
import './boss.js';
import { Projectiles } from './projectiles.js';
import { Net } from './net.js';
import { runLobby } from './lobby.js';
import { drawHearts, drawBossBar, drawBanner, drawChat, drawNameTag, drawBubble, FloatTexts, drawCursor } from './hud.js';
import { drawText, textWidth } from './font.js';
import { PAL, rgb, mixc, clamp } from './art.js';
import { atlas, tileSrcY } from './tiles.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const helpEl = document.getElementById('help');
const statsEl = document.getElementById('stats');
const chatEl = document.getElementById('chat');
const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d')]; };
const [buf, bctx] = mk(), [layer, lctx] = mk(), [mask, mctx] = mk(), [hud, hctx] = mk(), [vig, vctx] = mk();
let dpr = 1, scale = 3, VW = BASE_W, VH = BASE_H;
let world, player, bg, inv, myName = 'Jogador', myLook = null, spawnX = 0;
const cam = { x: 0, y: 0, shake: 0 };

function resize() {
  dpr = window.devicePixelRatio || 1;
  const w = Math.floor(innerWidth * dpr), h = Math.floor(innerHeight * dpr);
  canvas.width = w;
  canvas.height = h;
  scale = Math.max(2, Math.round(h / BASE_H));
  VW = Math.ceil(w / scale);
  VH = Math.ceil(h / scale);
  for (const c of [buf, layer, mask]) { c.width = VW + 1; c.height = VH + 1; }
  hud.width = VW; hud.height = VH;
  for (const c of [ctx, bctx, lctx, mctx, hctx]) c.imageSmoothingEnabled = false;
  vig.width = w; vig.height = h;
  if (!w || !h) return;
  if (player) { cam.x = player.x - VW / 2; cam.y = player.y - 20 - VH / 2; }
  const g = vctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.6);
  g.addColorStop(0, 'rgba(10,4,20,0)');
  g.addColorStop(1, 'rgba(10,4,20,0.5)');
  vctx.fillStyle = g;
  vctx.fillRect(0, 0, w, h);
}
addEventListener('resize', resize);
resize();
initInput(canvas);

const TILE_COLORS = {
  [T.DIRT]: PAL.dirt.slice(1, 4), [T.GRASS]: [...PAL.grass.slice(2, 4), PAL.dirt[2]], [T.STONE]: PAL.stone.slice(1, 4),
  [T.COPPER]: [...PAL.copper.slice(2, 4), PAL.stone[2]], [T.CRYSTAL]: PAL.crystal.slice(2, 5),
  [T.PLANK]: PAL.wood.slice(1, 4), [T.PLATFORM]: PAL.wood.slice(1, 4), [T.DOOR_C]: PAL.wood.slice(1, 4), [T.DOOR_O]: PAL.wood.slice(1, 4), [T.TRUNK]: PAL.bark.slice(1, 4), [T.TORCH]: [[255, 180, 80], ...PAL.wood.slice(2, 3)],
};
for (const k in TILE_COLORS) TILE_COLORS[k] = TILE_COLORS[k].map((c) => rgb(c));
const ENEMY_COLORS = {
  slime: ['#5ac85a', '#9ae07a', '#4a9af0'], zombie: ['#6a8a4a', '#8a2a2a', '#4a5a3a'],
  bat: ['#5e3c70', '#8a5aa0', '#2a1a30'], boss: ['#a04a5e', '#6a1a2a', '#8aa040'],
};
const pick = (a) => a[(Math.random() * a.length) | 0];

const particles = new Particles(), lighting = new Lighting(), enemies = new Enemies(), projectiles = new Projectiles();
const floats = new FloatTexts(), pickups = [], remotes = new Map(), chatLog = [];
const net = new Net();
let isHost = true, myId = 1, chatOpen = false, myBubble = null, banner = null;
const env = { t: 0.3, day: 1, dusk: 0, sky: [1, 1, 1] };
let time = 0, wind = 0, placeCD = 0, potionCD = 0, hitStop = 0, target = null;
let netT = 0, enT = 0, timeT = 0, saveT = 0, meleeSwing = -1;
const meleeHit = new Set();
const wallDamage = new Map(), objDamage = new Map();
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const out = { torches: [], crystals: [], shrooms: [] };
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---------------- setup ----------------
function starterKit() {
  const hot = ['pickaxe', 'sword_wood', 'bow_wood', 'torch', 'plank', 'dirt', 'stone', 'potion', 'bait', 'hammer'];
  const n = { torch: 40, plank: 60, dirt: 50, stone: 50, potion: 3, bait: 1 };
  hot.forEach((id, i) => (inv.slots[i] = { id, n: n[id] || 1 }));
  [['arrow', 80], ['copper', 45], ['crystal', 20], ['gel', 8], ['cloth', 4], ['wing', 3]].forEach(([id, k], i) => (inv.slots[10 + i] = { id, n: k }));
}
// kit de construção (entregue uma vez, também para quem já tinha inventário salvo)
function buildKit() {
  const key = 'terra_kit2_' + myName;
  try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch {}
  for (const [id, n] of [['hammer', 1], ['workbench', 1], ['chest', 1], ['furnace', 1], ['door', 2], ['platform', 40], ['wall_wood', 60], ['copper_bar', 6]])
    if (id !== 'hammer' || !inv.count('hammer')) inv.add(id, n);
}
const invKey = () => 'terra_inv_' + myName;
function saveInv() { try { localStorage.setItem(invKey(), inv.serialize()); } catch {} }

function setupWorld(seed, welcome) {
  world = new World(seed);
  bg = new Background(seed);
  if (welcome) {
    for (const [x, y] of welcome.trees) { const tr = world.findTree(x, y); if (tr) world.breakTree(tr); }
    for (const [x, y, v] of welcome.edits) world.setTile(x, y, v);
    for (const [x, y, v] of welcome.walls || []) world.setWall(x, y, v);
    for (const o of welcome.objects || []) if (!world.objById(o.id)) world.addObject({ ...o });
    world.events.length = 0;
  }
  let x = Math.floor(world.w / 2);
  while (world.trees.some((t) => Math.abs(t.x - x) < 2)) x++;
  spawnX = x;
  world.spawnX = x;
  const keep = player;
  player = new Player(x * TILE + 8, world.topSolid(x) * TILE, myLook);
  if (keep) { player.hp = keep.hp; }
  cam.x = player.x - VW / 2;
  cam.y = player.y - 20 - VH / 2;
  particles.list.length = 0;
  pickups.length = 0;
  enemies.list.length = 0;
  projectiles.list.length = 0;
}

function respawn() {
  player.x = spawnX * TILE + 8;
  player.y = world.topSolid(spawnX) * TILE;
  player.vx = player.vy = 0;
  player.hp = player.maxHp;
  player.dead = false;
  player.invuln = 2;
  cam.x = player.x - VW / 2;
  cam.y = player.y - 20 - VH / 2;
}

function computeEnv() {
  const sunH = Math.sin((env.t - 0.25) * Math.PI * 2);
  env.day = smooth(-0.12, 0.3, sunH);
  env.dusk = Math.max(0, 1 - Math.abs(sunH + 0.02) / 0.32);
  const s = mixc([0.09, 0.12, 0.26], [1, 1, 1], env.day);
  env.sky = mixc(s, [1.0, 0.72, 0.56], env.dusk * 0.55);
}

// ---------------- mensagens ----------------
function pushChat(name, text, col) {
  chatLog.push({ name, text, col, t: time });
  if (chatLog.length > 40) chatLog.shift();
}
function showBanner(text, col) { banner = { text, col, t: 3, max: 3 }; }

function addRemote(id, name, look) {
  const r = { p: new Player(0, 0, look || undefined), name, bubble: null, seen: false, wasDead: false };
  remotes.set(id, r);
  return r;
}

function onNet(m) {
  switch (m.t) {
    case 'join': addRemote(m.id, m.name, m.look); pushChat('', `${m.name} entrou no mundo`, '#b8f0a0'); break;
    case 'leave': { const r = remotes.get(m.id); if (r) pushChat('', `${r.name} saiu`, '#c8c0e0'); remotes.delete(m.id); break; }
    case 'state': {
      const r = remotes.get(m.id) || addRemote(m.id, '???', null);
      r.p.applyNet(m.s);
      if (!r.seen) { r.p.x = m.s.x; r.p.y = m.s.y; r.seen = true; }
      break;
    }
    case 'tile': {
      const old = world.get(m.x, m.y), n = world.events.length;
      world.setTile(m.x, m.y, m.v);
      world.events.length = n;
      if (m.v === T.AIR && old && TILE_COLORS[old])
        for (let i = 0; i < 8; i++) particles.add({ x: m.x * TILE + 8, y: m.y * TILE + 8, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160, life: 0.7, color: pick(TILE_COLORS[old]) });
      break;
    }
    case 'tree': { const tr = world.findTree(m.x, m.y); if (tr) { leafBurst(tr); world.breakTree(tr); } break; }
    case 'time': env.t = m.v; break;
    case 'wall': world.setWall(m.x, m.y, m.v); break;
    case 'obj':
      if (m.op === 'add' && m.o && !world.objById(m.o.id)) world.addObject({ ...m.o });
      else if (m.op === 'del') { const o = world.objById(m.id); if (o) { if (inv.chest && inv.chest.obj === o) inv.closeChest(); world.removeObject(o); } }
      break;
    case 'chest': {
      const o = world.objById(m.id);
      if (o && Array.isArray(m.items)) { o.items = m.items; if (inv.chest && inv.chest.obj === o) inv.chest.slots = o.items; }
      break;
    }
    case 'host':
      isHost = m.id === myId;
      if (isHost) pushChat('', 'Você agora é o anfitrião do mundo', '#f5d76e');
      break;
    case 'en': if (!isHost) enemies.applyNet(m.l); break;
    case 'eproj': projectiles.spawn({ kind: 'acid', x: m.x, y: m.y, vx: m.vx, vy: m.vy, hostile: true, dmg: m.dmg }); break;
    case 'ev': onEvent(m); break;
    case 'hit': if (isHost) { const e = enemies.byId(m.id); if (e) applyDamage(e, m.dmg, m.dir, m.kb, m.from); } break;
    case 'summon': if (isHost) spawnBoss(m.x, m.y); break;
    case 'proj': projectiles.spawn({ kind: m.k, x: m.x, y: m.y, vx: m.vx, vy: m.vy, local: false }); break;
    case 'chat': {
      const r = remotes.get(m.id);
      pushChat(r ? r.name : '???', m.text);
      if (r) r.bubble = { text: m.text, t: 5 };
      break;
    }
  }
}
net.onMessage = onNet;
net.onClose = () => { pushChat('', 'Conexão perdida — jogando offline', '#ff8a8a'); isHost = true; remotes.clear(); };

function onEvent(m) {
  if (m.k === 'ehit') {
    if (m.by === myId) return;
    const e = enemies.byId(m.id);
    if (e) { e.hurtT = 0.12; floats.add(e.x, e.y - e.h - 6, m.dmg, '#ffffff'); }
  } else if (m.k === 'edie') onEnemyDie(enemies.byId(m.id), m);
  else if (m.k === 'banner') showBanner(m.text);
  else if (m.k === 'shake') cam.shake = Math.min(1, cam.shake + m.v);
}

// ---------------- efeitos ----------------
function groundColor(p) {
  const t = world.get(Math.floor(p.x / TILE), Math.floor((p.y + 1) / TILE));
  return pick(TILE_COLORS[t] || TILE_COLORS[T.DIRT]);
}
function puff(x, y, vx, vy, color, life = 0.45) {
  particles.add({ kind: 3, x, y, vx, vy, life, color, collide: false });
}
const fx = {
  land(p, impact) {
    const n = Math.min(16, 4 + impact / 50);
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1;
      puff(p.x + s * (2 + Math.random() * 4), p.y - 1, s * (30 + Math.random() * impact * 0.15), -Math.random() * 25, groundColor(p));
    }
    if (impact > 450) cam.shake = Math.min(1, cam.shake + (impact - 450) / 500);
  },
  jump(p) { for (let i = 0; i < 5; i++) puff(p.x + (Math.random() - 0.5) * 8, p.y - 1, (Math.random() - 0.5) * 50, -10 - Math.random() * 20, groundColor(p), 0.35); },
  step(p) { puff(p.x - p.face * 4, p.y - 1, -p.face * (15 + Math.random() * 20), -8 - Math.random() * 10, groundColor(p), 0.35); },
  skid(p) { if (Math.random() < 0.5) puff(p.x + p.face * 3, p.y - 1, Math.sign(p.vx) * 40, -15, groundColor(p), 0.4); },
  hurt(p, d) {
    floats.add(p.x, p.y - 38, d, '#ff5a5a');
    cam.shake = Math.min(1, cam.shake + 0.35);
    hitStop = Math.max(hitStop, 0.06);
    for (let i = 0; i < 10; i++) particles.add({ x: p.x, y: p.y - 18, vx: (Math.random() - 0.5) * 180, vy: -Math.random() * 180, life: 0.6, color: pick(['#c82838', '#8a1a2a', '#ff5a5a']) });
  },
  die(p) {
    p.drawSprite();
    const sx = Math.round(p.x), sy = Math.round(p.y);
    particles.burstFrom(p.px, p.face < 0 ? sx + 16 - p.px.w + 1 : sx - 16, sy - 1 - 46, p.face < 0, 1.2, 1);
    showBanner('Você morreu...', '#ff7a7a');
    cam.shake = 1;
  },
};

function leafBurst(tree) {
  const topY = tree.top * TILE - 14;
  for (let i = 0; i < 60; i++)
    particles.add({ kind: 1, x: tree.x * TILE + 8 + (Math.random() - 0.5) * 48, y: topY + (Math.random() - 0.5) * 34, vx: (Math.random() - 0.5) * 60, vy: -Math.random() * 40, life: 2 + Math.random() * 2.5, color: pick(LEAF.slice(1)) });
}

function spawnPickup(x, y, id, n, noPick = 0, vx) {
  pickups.push({ x, y, vx: vx ?? (Math.random() - 0.5) * 90, vy: -90 - Math.random() * 60, id, n, t: 0, noPick });
}

// ---------------- mundo ----------------
function netSetTile(x, y, v) {
  world.setTile(x, y, v);
  net.send({ t: 'tile', x, y, v });
}

function breakTile(tx, ty, t) {
  const cx = tx * TILE + 8, cy = ty * TILE + 8, cols = TILE_COLORS[t];
  if (t === T.TRUNK) {
    const tree = world.findTree(tx, ty);
    if (!tree) return;
    leafBurst(tree);
    const n = world.breakTree(tree);
    net.send({ t: 'tree', x: tree.x, y: ty });
    for (let y = tree.top; y <= tree.base; y++)
      for (let i = 0; i < 3; i++)
        particles.add({ x: tree.x * TILE + 8, y: y * TILE + 8, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 160, life: 0.8 + Math.random() * 0.6, color: pick(cols), size: Math.random() < 0.3 ? 2 : 1 });
    for (let i = 0; i < n; i++) spawnPickup(tree.x * TILE + 8, (tree.base - i) * TILE + 8, 'plank', 2);
    cam.shake = Math.min(1, cam.shake + 0.45);
    return;
  }
  if (t === T.DOOR_C || t === T.DOOR_O) {
    const [top, bot] = world.doorSpan(tx, ty);
    for (let y = top; y <= bot; y++) netSetTile(tx, y, T.AIR);
    for (let i = 0; i < 16; i++) particles.add({ x: cx, y: (top + 1.5) * TILE, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 200, life: 0.8, color: pick(cols) });
    spawnPickup(cx, cy, 'door', 1);
    cam.shake = Math.min(1, cam.shake + 0.22);
    return;
  }
  netSetTile(tx, ty, T.AIR);
  for (let i = 0; i < 16; i++)
    particles.add({ x: cx + (Math.random() - 0.5) * 12, y: cy + (Math.random() - 0.5) * 12, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 200 - 30, life: 0.6 + Math.random() * 0.7, color: pick(cols), size: Math.random() < 0.3 ? 2 : 1, bounce: 0.45 });
  if (t === T.CRYSTAL || t === T.COPPER)
    for (let i = 0; i < 10; i++)
      particles.add({ kind: 2, glow: true, x: cx, y: cy, vx: (Math.random() - 0.5) * 220, vy: -Math.random() * 220, life: 0.4 + Math.random() * 0.5, color: t === T.CRYSTAL ? '#9ff4ff' : '#ffd08a', grav: 400 });
  spawnPickup(cx, cy, TILE_DROP[t], 1);
  cam.shake = Math.min(1, cam.shake + 0.22);
}

function hitDust(x, y, cols, dir) {
  for (let i = 0; i < 5; i++)
    particles.add({ x: x + dir * 7, y: y - 4 + Math.random() * 8, vx: dir * (40 + Math.random() * 90), vy: -40 - Math.random() * 120, life: 0.4 + Math.random() * 0.4, color: pick(cols), bounce: 0.35 });
}

function doHammer() {
  if (!target || !target.inReach) return;
  const { tx, ty } = target;
  const wl = world.wallAt(tx, ty);
  if (!wl || SOLID[world.get(tx, ty)]) return;
  const key = ty * world.w + tx, d = (wallDamage.get(key) || 0) + 0.3 / WALL_HARDNESS;
  hitDust(tx * TILE + 8, ty * TILE + 8, TILE_COLORS[wl === 2 ? T.STONE : wl === 3 ? T.PLANK : T.DIRT], player.x < tx * TILE + 8 ? -1 : 1);
  cam.shake = Math.min(1, cam.shake + 0.08);
  if (d < 1) { wallDamage.set(key, d); return; }
  wallDamage.delete(key);
  world.setWall(tx, ty, 0);
  net.send({ t: 'wall', x: tx, y: ty, v: 0 });
  spawnPickup(tx * TILE + 8, ty * TILE + 8, WALL_DROP[wl], 1);
}

function mineObject(o) {
  const d = (objDamage.get(o.id) || 0) + 0.26 / OBJ[o.type].hardness;
  const cx = (o.x + OBJ[o.type].w / 2) * TILE, cy = (o.y + 0.5) * TILE;
  hitDust(cx, cy, TILE_COLORS[o.type === 'furnace' ? T.STONE : T.PLANK], player.x < cx ? -1 : 1);
  cam.shake = Math.min(1, cam.shake + 0.1);
  if (d < 1) { objDamage.set(o.id, d); return; }
  objDamage.delete(o.id);
  if (o.items && o.items.some(Boolean)) { floats.add(cx, cy - 20, 'esvazie o baú primeiro', '#ff9a9a'); return; }
  if (inv.chest && inv.chest.obj === o) inv.closeChest();
  world.removeObject(o);
  net.send({ t: 'obj', op: 'del', id: o.id });
  for (let i = 0; i < 14; i++) particles.add({ x: cx, y: cy, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 200, life: 0.8, color: pick(TILE_COLORS[o.type === 'furnace' ? T.STONE : T.PLANK]) });
  spawnPickup(cx, cy, OBJ[o.type].item, 1);
}

function doMine() {
  if (!target || !target.inReach) return;
  if (player.weapon && player.weapon.hammer) return doHammer();
  const { tx, ty } = target;
  const t = world.get(tx, ty);
  if (t === T.AIR) { const o = world.objAt(tx, ty); if (o) mineObject(o); return; }
  if (t === T.AIR || (world.get(tx, ty - 1) === T.TRUNK && t !== T.TRUNK)) return;
  const key = ty * world.w + tx;
  const d = world.damage.get(key) || { v: 0, t: 0 };
  d.v += 0.26 / HARDNESS[t];
  d.t = time;
  world.hitAnim.set(key, time);
  const dir = player.x < tx * TILE + 8 ? -1 : 1;
  for (let i = 0; i < 5; i++)
    particles.add({ x: tx * TILE + 8 + dir * 7, y: ty * TILE + 4 + Math.random() * 8, vx: dir * (40 + Math.random() * 90), vy: -40 - Math.random() * 120, life: 0.4 + Math.random() * 0.4, color: pick(TILE_COLORS[t]), bounce: 0.35 });
  if (t === T.STONE || t === T.COPPER || t === T.CRYSTAL)
    particles.add({ kind: 2, glow: true, x: tx * TILE + 8 + dir * 7, y: ty * TILE + 8, vx: dir * 120, vy: -90, life: 0.25, color: '#fff2c0', grav: 300 });
  cam.shake = Math.min(1, cam.shake + 0.1);
  if (d.v >= 1) { world.damage.delete(key); breakTile(tx, ty, t); }
  else world.damage.set(key, d);
}

function tryPlace(def) {
  if (!target || !target.inReach || placeCD > 0) return;
  const { tx, ty } = target;
  if (!world.inb(tx, ty) || world.get(tx, ty) !== T.AIR || world.objAt(tx, ty)) return;
  if (def.tile === T.TORCH) {
    if (!world.torchSupported(tx, ty)) return;
  } else {
    const l = player.x - player.w / 2, r = player.x + player.w / 2, top = player.y - player.h;
    if (r > tx * TILE && l < tx * TILE + TILE && player.y > ty * TILE && top < ty * TILE + TILE) return;
    for (const e of enemies.list) if (Math.abs(e.x - (tx * TILE + 8)) < e.w / 2 + 8 && e.y > ty * TILE && e.y - e.h < ty * TILE + TILE && !e.D.fly) return;
    const near = (x, y) => world.isSolid(x, y) || world.get(x, y) === T.PLATFORM || world.wallAt(x, y);
    if (!(near(tx - 1, ty) || near(tx + 1, ty) || near(tx, ty - 1) || near(tx, ty + 1) || world.wallAt(tx, ty))) return;
  }
  netSetTile(tx, ty, def.tile);
  inv.consumeSelected();
  world.placeAnim.set(ty * world.w + tx, time);
  placeCD = 0.11;
  player.poke();
  for (let i = 0; i < 6; i++) puff(tx * TILE + Math.random() * 16, ty * TILE + 16, (Math.random() - 0.5) * 40, -Math.random() * 20, 'rgba(230,220,200,1)', 0.35);
}

function overlapsBody(x0, y0, x1, y1) {
  for (const p of allPlayers()) if (!p.dead && p.x + p.w / 2 > x0 && p.x - p.w / 2 < x1 && p.y > y0 && p.y - p.h < y1) return true;
  for (const e of enemies.list) if (!e.D.fly && e.x + e.w / 2 > x0 && e.x - e.w / 2 < x1 && e.y > y0 && e.y - e.h < y1) return true;
  return false;
}

function placeDoor() {
  if (!target || !target.inReach || placeCD > 0) return;
  const { tx } = target;
  for (const b of [target.ty, target.ty + 1, target.ty + 2]) {
    let ok = world.isSolid(tx, b + 1);
    for (let y = b - 2; y <= b && ok; y++) ok = world.inb(tx, y) && world.get(tx, y) === T.AIR && !world.objAt(tx, y);
    if (!ok || overlapsBody(tx * TILE, (b - 2) * TILE, tx * TILE + TILE, (b + 1) * TILE)) continue;
    for (let y = b - 2; y <= b; y++) { netSetTile(tx, y, T.DOOR_C); world.placeAnim.set(y * world.w + tx, time); }
    inv.consumeSelected();
    placeCD = 0.25;
    player.poke();
    return;
  }
}

function toggleDoor(tx, ty) {
  const [top, bot] = world.doorSpan(tx, ty);
  const open = world.get(tx, ty) === T.DOOR_O;
  if (open && overlapsBody(tx * TILE, top * TILE, tx * TILE + TILE, (bot + 1) * TILE)) return; // alguém no vão
  for (let y = top; y <= bot; y++) netSetTile(tx, y, open ? T.DOOR_C : T.DOOR_O);
  puff(tx * TILE + 8, (bot + 1) * TILE - 2, 0, -10, 'rgba(230,220,200,1)', 0.3);
}

function placeWall(def) {
  if (!target || !target.inReach || placeCD > 0) return;
  const { tx, ty } = target;
  if (!world.inb(tx, ty) || world.wallAt(tx, ty)) return;
  const near = (x, y) => world.wallAt(x, y) || world.isSolid(x, y) || world.get(x, y) === T.PLATFORM;
  if (!(near(tx - 1, ty) || near(tx + 1, ty) || near(tx, ty - 1) || near(tx, ty + 1) || world.isSolid(tx, ty))) return;
  world.setWall(tx, ty, def.wall);
  net.send({ t: 'wall', x: tx, y: ty, v: def.wall });
  inv.consumeSelected();
  placeCD = 0.04;
  player.poke();
}

function placeFurniture(def) {
  if (!target || !target.inReach || placeCD > 0) return;
  const { tx, ty } = target;
  if (!world.canPlaceObject(def.obj, tx, ty)) return;
  const o = { id: newId(), type: def.obj, x: tx, y: ty };
  world.addObject(o);
  net.send({ t: 'obj', op: 'add', o: { id: o.id, type: o.type, x: o.x, y: o.y } });
  inv.consumeSelected();
  placeCD = 0.3;
  player.poke();
  for (let i = 0; i < 10; i++) puff(tx * TILE + Math.random() * OBJ[def.obj].w * TILE, (ty + 1) * TILE, (Math.random() - 0.5) * 50, -Math.random() * 20, 'rgba(230,220,200,1)', 0.4);
}

// ---------------- combate ----------------
function hitEnemy(e, base, dir, kb, def) {
  const crit = Math.random() < 0.08;
  const dmg = Math.max(1, Math.round(base * (0.85 + Math.random() * 0.3) * (crit ? 1.6 : 1)));
  floats.add(e.x, e.y - e.h - 6, dmg, crit ? '#ffd84a' : '#ffffff', crit ? 2 : 1);
  e.hurtT = 0.12;
  const cols = ENEMY_COLORS[e.type];
  for (let i = 0; i < 8; i++)
    particles.add({ x: e.x, y: e.y - e.h / 2, vx: dir * (40 + Math.random() * 140), vy: -Math.random() * 160, life: 0.5 + Math.random() * 0.4, color: pick(cols), size: Math.random() < 0.3 ? 2 : 1 });
  particles.add({ kind: 2, glow: true, x: e.x - dir * 4, y: e.y - e.h / 2, vx: dir * 60, vy: -40, life: 0.15, color: '#ffffff', grav: 0, collide: false });
  hitStop = Math.max(hitStop, crit ? 0.07 : 0.04);
  cam.shake = Math.min(1, cam.shake + (crit ? 0.25 : 0.12));
  if (def && def.lifesteal && player.hp < player.maxHp) {
    player.hp = Math.min(player.maxHp, player.hp + def.lifesteal);
    floats.add(player.x, player.y - 38, '+' + def.lifesteal, '#7af07a');
  }
  if (isHost) applyDamage(e, dmg, dir, kb, myId);
  else net.send({ t: 'hit', id: e.id, dmg, dir, kb });
}

function applyDamage(e, dmg, dir, kb, by) {
  if (e.hp <= 0) return;
  const dead = e.damage(dmg, dir, kb);
  net.send({ t: 'ev', k: 'ehit', id: e.id, dmg, by });
  if (by !== myId) { e.hurtT = 0.12; floats.add(e.x, e.y - e.h - 6, dmg, '#ffffff'); }
  if (dead) {
    const info = { k: 'edie', id: e.id, x: e.x, y: e.y, type: e.type };
    net.send({ t: 'ev', ...info });
    onEnemyDie(e, info);
  }
}

function onEnemyDie(e, info) {
  const D = TYPES[info.type];
  if (e) {
    e.render();
    const sx = Math.round(e.x), sy = Math.round(e.y), flip = e.face < 0 && !D.boss;
    particles.burstFrom(e.px, flip ? sx + D.ox - e.px.w + 1 : sx - D.ox, sy - D.oy, flip, D.boss ? 2 : 1, D.boss ? 2 : 1);
    enemies.remove(e);
  }
  for (const [id, a, b, chance] of D.drops) {
    if (Math.random() > chance) continue;
    let n = a + Math.floor(Math.random() * (b - a + 1));
    const parts = Math.min(n, D.boss ? 6 : 2);
    for (let k = 0; k < parts; k++) {
      const q = k === parts - 1 ? n : Math.ceil(n / (parts - k));
      n -= q;
      spawnPickup(info.x + (Math.random() - 0.5) * 16, info.y - 12, id, q);
    }
  }
  if (D.boss) {
    showBanner('O Abominável foi derrotado!', '#b8f0a0');
    cam.shake = 1;
    for (let i = 0; i < 80; i++)
      particles.add({ x: info.x, y: info.y - 22, vx: (Math.random() - 0.5) * 400, vy: -Math.random() * 400, life: 1 + Math.random(), color: pick(ENEMY_COLORS.boss), size: 2, bounce: 0.3 });
  }
}

function meleeCheck(def) {
  const p = player;
  if (p.swingId !== meleeSwing) { meleeSwing = p.swingId; meleeHit.clear(); }
  if (p.swingP < 0.25 || p.swingP > 0.62) return;
  const R = def.kind === 'melee' ? 30 : 20, cx = p.x + p.face * 10, cy = p.y - 18;
  for (const e of enemies.list) {
    if (meleeHit.has(e.id) || e.hp <= 0) continue;
    const nx = clamp(cx, e.x - e.w / 2, e.x + e.w / 2), ny = clamp(cy, e.y - e.h, e.y);
    if (Math.hypot(nx - cx, ny - cy) > R || (e.x - p.x) * p.face < -12) continue;
    meleeHit.add(e.id);
    hitEnemy(e, def.damage, p.face, def.knock, def);
  }
}

function shoot(def) {
  const [mx, my, dx, dy] = player.muzzle(12);
  let kind = 'bolt', dmg = def.damage;
  if (def.kind === 'bow') {
    if (inv.count('arrow') <= 0) { floats.add(player.x, player.y - 40, 'sem flechas', '#ff9a9a'); return; }
    inv.remove('arrow', 1);
    kind = 'arrow';
    dmg += ITEMS.arrow.damage;
  } else {
    for (let i = 0; i < 6; i++) particles.add({ kind: 2, glow: true, x: mx, y: my, vx: dx * 80 + (Math.random() - 0.5) * 60, vy: dy * 80 + (Math.random() - 0.5) * 60, life: 0.25, color: '#bff6ff', grav: 0, collide: false });
  }
  const vx = dx * def.shot, vy = dy * def.shot;
  projectiles.spawn({ kind, x: mx, y: my, vx, vy, dmg, kb: def.knock, local: true, def });
  net.send({ t: 'proj', k: kind, x: Math.round(mx), y: Math.round(my), vx: Math.round(vx), vy: Math.round(vy) });
}

const bossApi = {
  banner: (text) => { showBanner(text); net.send({ t: 'ev', k: 'banner', text }); },
  shake: (v) => { cam.shake = Math.min(1, cam.shake + v); net.send({ t: 'ev', k: 'shake', v }); },
  spit: (x, y, vx, vy) => {
    projectiles.spawn({ kind: 'acid', x, y, vx, vy, hostile: true, dmg: 14 });
    net.send({ t: 'eproj', x: Math.round(x), y: Math.round(y), vx: Math.round(vx), vy: Math.round(vy), dmg: 14 });
  },
  summon: (x, y) => enemies.list.push(factory.make(myId * 1e6 + enemies.nextId++, Math.random() < 0.5 ? 'bat' : 'slime', x, y, 2)),
};

function spawnBoss(x, y) {
  if (enemies.boss()) return;
  enemies.list.push(factory.make(myId * 1e6 + enemies.nextId++, 'boss', x, y - 240, 0));
  bossApi.banner('O Abominável despertou!');
  bossApi.shake(0.8);
}

function allPlayers() {
  const a = [player];
  for (const r of remotes.values()) if (r.seen) a.push(r.p);
  return a;
}

// ---------------- pickups / ambiente ----------------
function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.t += dt;
    const dx = player.x - p.x, dy = player.y - 14 - p.y, d = Math.hypot(dx, dy) || 1;
    const magnet = p.t > Math.max(0.3, p.noPick) && !player.dead && d < 140;
    if (magnet) {
      p.vx += (dx / d) * 1500 * dt; p.vy += (dy / d) * 1500 * dt;
      p.vx *= 1 - Math.min(1, dt * 5); p.vy *= 1 - Math.min(1, dt * 5);
      p.x += p.vx * dt; p.y += p.vy * dt;
    } else {
      p.vy = Math.min(300, p.vy + 500 * dt);
      p.vx *= 1 - Math.min(1, dt * 2);
      const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (!world.solidAt(nx, p.y)) p.x = nx; else p.vx = 0;
      if (!world.solidAt(p.x, ny + 4)) p.y = ny; else p.vy = 0;
    }
    if (magnet && d < 10) {
      const left = inv.add(p.id, p.n);
      if (left < p.n) {
        for (let k = 0; k < 3; k++) particles.add({ kind: 2, glow: true, x: p.x, y: p.y, vx: (Math.random() - 0.5) * 80, vy: -Math.random() * 80, life: 0.3, color: '#fff6c8', grav: 0, collide: false });
        if (left) p.n = left; else pickups.splice(i, 1);
      }
    }
    if (p.t > 120) pickups.splice(i, 1);
  }
}

function ambient(dt) {
  if (env.day > 0.6) for (const p of particles.list) if (p.kind === 4 && p.life > 1) p.life = 1;
  if (env.day < 0.45 && Math.random() < dt * 6 && particles.count(4) < 30) {
    const x = cam.x + Math.random() * VW, tx = Math.floor(x / TILE);
    if (tx >= 0 && tx < world.w) {
      const y = world.skyTop[tx] * TILE - 8 - Math.random() * 90;
      if (y > cam.y && y < cam.y + VH) particles.add({ kind: 4, glow: true, x, y, vx: 0, vy: 0, life: 5 + Math.random() * 6, color: '#d8ff7a', collide: false });
    }
  }
  for (const tr of world.trees) {
    if (tr.x * TILE < cam.x - 40 || tr.x * TILE > cam.x + VW + 40) continue;
    if (Math.random() < dt * 0.3)
      particles.add({ kind: 1, x: tr.x * TILE + 8 + (Math.random() - 0.5) * 40 + canopySway(tr, time, wind), y: tr.top * TILE - 10 + Math.random() * 16, vx: 0, vy: 10, life: 6, color: pick(LEAF.slice(2)) });
  }
  for (const tc of out.torches)
    if (Math.random() < dt * 1.6)
      particles.add({ kind: 2, glow: true, x: tc.x * TILE + 8, y: tc.y * TILE + 2, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 30, life: 0.6 + Math.random() * 0.6, color: '#ffb04a', grav: -20, collide: false });
  for (const c of out.crystals)
    if (Math.random() < dt * 0.15)
      particles.add({ kind: 2, glow: true, x: c.x * TILE + Math.random() * 16, y: c.y * TILE + Math.random() * 16, vx: 0, vy: -6, life: 0.8, color: '#dffcff', grav: 0, collide: false });
  const ptx = clamp(Math.floor(player.x / TILE), 0, world.w - 1);
  if (player.y > (world.skyTop[ptx] + 6) * TILE && Math.random() < dt * 5)
    particles.add({ kind: 5, x: cam.x + Math.random() * VW, y: cam.y + Math.random() * VH, vx: 0, vy: 0, life: 3 + Math.random() * 3, color: '#e8dcc0', collide: false });
  // conjunto de cristal cintila
  for (const p of allPlayers()) {
    if (p.dead || !p.armor.every((a) => a && a.set === 'crystal')) continue;
    if (Math.random() < dt * 6)
      particles.add({ kind: 2, glow: true, x: p.x + (Math.random() - 0.5) * 14, y: p.y - Math.random() * 30, vx: 0, vy: -10, life: 0.6, color: '#bff6ff', grav: 0, collide: false });
  }
  // baba do chefe
  const b = enemies.boss();
  if (b && Math.random() < dt * (b.mouth > 0.5 ? 10 : 3)) {
    const [mx, my] = b.mouthPos;
    particles.add({ x: mx + (Math.random() - 0.5) * 14, y: my + 4, vx: (Math.random() - 0.5) * 20, vy: 20, life: 1.5, color: pick(['#9ad04a', '#c8e878', '#6a9a2a']), grav: 400, bounce: 0.1 });
  }
}

// ---------------- update ----------------
function openChat() {
  chatOpen = true;
  chatEl.value = '';
  chatEl.style.display = 'block';
  setTimeout(() => chatEl.focus(), 0);
}
function closeChat() {
  chatOpen = false;
  chatEl.style.display = 'none';
  chatEl.blur();
}
chatEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const text = chatEl.value.trim().slice(0, 120);
    if (text) {
      pushChat(myName, text, '#ffffff');
      myBubble = { text, t: 5 };
      net.send({ t: 'chat', text });
    }
    closeChat();
  } else if (e.key === 'Escape') closeChat();
  e.stopPropagation();
});

function update(dt) {
  time += dt;
  env.t = (env.t + (dt / DAY_LEN) * (input.keys.has('KeyT') ? 30 : 1)) % 1;
  computeEnv();
  wind = Math.sin(time * 0.23) * 0.7 + Math.sin(time * 0.91 + 1.3) * 0.3;
  const P = input.pressed;

  if (!chatOpen) {
    for (let i = 0; i < 10; i++) if (P.has('Digit' + ((i + 1) % 10))) inv.select(i);
    if (input.wheel && !inv.open) inv.select((inv.sel + input.wheel + 100) % 10);
    if (P.has('KeyE') || (P.has('Escape') && inv.open)) inv.toggle();
    if (P.has('KeyL')) lighting.smooth = !lighting.smooth;
    if (P.has('KeyH')) helpEl.classList.toggle('hidden');
    if (P.has('KeyN') && !net.online) setupWorld((Math.random() * 1e9) | 0, null);
    if (P.has('Enter')) openChat();
  }

  // UI do inventário (consome cliques)
  const hx = (input.mouse.x * dpr) / scale, hy = (input.mouse.y * dpr) / scale;
  for (const c of input.clicks) { c.x = (c.cx * dpr) / scale; c.y = (c.cy * dpr) / scale; }
  inv.ui(hx, hy, input.clicks, input.keys.has('ShiftLeft') || input.keys.has('ShiftRight'));
  inv.update(dt);
  if (inv.dropRequest) {
    const d = inv.dropRequest;
    inv.dropRequest = null;
    spawnPickup(player.x + player.face * 8, player.y - 20, d.id, d.n, 1.5, player.face * 170);
  }

  // estações de criação por perto e baú aberto
  inv.stations.clear();
  for (const o of world.objects) {
    const d = OBJ[o.type], cx = (o.x + d.w / 2) * TILE, cy = (o.y + 1 - d.h / 2) * TILE;
    if (Math.hypot(cx - player.x, cy - (player.y - 16)) < 6 * TILE) inv.stations.add(o.type);
  }
  if (inv.chest) {
    const o = inv.chest.obj;
    if (!world.objects.includes(o) || Math.hypot((o.x + 1) * TILE - player.x, o.y * TILE - player.y) > 7 * TILE || player.dead) inv.closeChest();
  }

  const def = inv.selDef();
  player.armor = inv.armorDefs();
  player.weapon = def && ['tool', 'melee', 'bow', 'staff'].includes(def.kind) ? def : null;
  player.holdTorch = !!def && def.id === 'torch';

  const mwx = hx + cam.x, mwy = hy + cam.y;
  const tx = Math.floor(mwx / TILE), ty = Math.floor(mwy / TILE);
  target = { tx, ty, inReach: Math.hypot(tx * TILE + 8 - player.x, ty * TILE + 8 - (player.y - 16)) <= REACH };

  const k = input.keys, free = !chatOpen && !player.dead;
  const useHeld = free && input.mouse.left && !inv.onUI && !inv.cursor;
  const clicked = free && input.clicks.some((c) => c.button === 0 && !c.used) && !inv.cursor;
  const ctl = {
    left: free && (k.has('KeyA') || k.has('ArrowLeft')),
    right: free && (k.has('KeyD') || k.has('ArrowRight')),
    jump: free && (k.has('Space') || k.has('KeyW') || k.has('ArrowUp')),
    jumpPressed: free && (P.has('Space') || P.has('KeyW') || P.has('ArrowUp')),
    down: free && (k.has('KeyS') || k.has('ArrowDown')),
    use: useHeld && !!player.weapon, place: false, aimX: mwx, aimY: mwy,
  };

  if (player.dead) {
    player.deadT -= dt;
    if (player.deadT <= 0) respawn();
  } else {
    const ev = player.update(dt, ctl, world, fx, wind, time);
    if (ev.mineHit) doMine();
    if (player.weapon && (player.weapon.kind === 'melee' || player.weapon.kind === 'tool')) meleeCheck(player.weapon);
    if (ev.shoot) shoot(player.weapon);
    placeCD -= dt;
    potionCD -= dt;
    if (useHeld && def && def.kind === 'block') tryPlace(def);
    if (useHeld && def && def.kind === 'door') placeDoor();
    if (useHeld && def && def.kind === 'wall') placeWall(def);
    if (useHeld && def && def.kind === 'furniture') placeFurniture(def);
    // clique direito: abrir/fechar porta, abrir baú
    const rclick = free && input.clicks.some((c) => c.button === 2 && !c.used) && !inv.cursor;
    if (rclick && target.inReach) {
      const o = world.objAt(target.tx, target.ty);
      if (world.isDoor(target.tx, target.ty)) toggleDoor(target.tx, target.ty);
      else if (o && o.type === 'chest') { if (inv.chest && inv.chest.obj === o) inv.toggle(); else inv.openChest(o); }
    }
    if (clicked && def && def.kind === 'potion') {
      if (potionCD > 0) floats.add(player.x, player.y - 40, `aguarde ${Math.ceil(potionCD)}s`, '#c8c0e0');
      else if (player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + def.heal);
        potionCD = 8;
        inv.consumeSelected();
        floats.add(player.x, player.y - 40, '+' + def.heal, '#7af07a', 2);
        for (let i = 0; i < 14; i++) particles.add({ kind: 2, glow: true, x: player.x + (Math.random() - 0.5) * 14, y: player.y - Math.random() * 30, vx: 0, vy: -30 - Math.random() * 30, life: 0.8, color: pick(['#ff6a7a', '#ffb0b8']), grav: 0, collide: false });
      }
    }
    if (clicked && def && def.kind === 'summon') {
      if (enemies.boss()) floats.add(player.x, player.y - 40, 'Ele já está aqui...', '#ff9a9a');
      else {
        inv.consumeSelected();
        if (isHost) spawnBoss(player.x, player.y);
        else net.send({ t: 'summon', x: Math.round(player.x), y: Math.round(player.y) });
      }
    }
  }

  // inimigos (o host simula; os outros interpolam)
  const players = allPlayers();
  if (isHost) {
    enemies.trySpawn(dt, world, players, env, myId * 1e6);
    enemies.updateHost(dt, world, players, bossApi, env);
    enT -= dt;
    if (enT <= 0 && net.online) { enT = 1 / 15; net.send({ t: 'en', l: enemies.pack() }); }
    timeT -= dt;
    if (timeT <= 0 && net.online) { timeT = 3; net.send({ t: 'time', v: env.t }); }
  } else enemies.updateClient(dt);
  const boss = enemies.boss();
  if (boss) boss.lookAt(players);

  if (!player.dead)
    for (const e of enemies.list) {
      if (Math.abs(e.x - player.x) < (e.w + player.w) / 2 - 2 && e.y - e.h < player.y && e.y > player.y - player.h) {
        player.hurt(e.dmg, Math.sign(player.x - e.x) || 1, inv.defense(), fx);
        break;
      }
    }

  projectiles.update(dt, world, {
    enemies: enemies.list, player, particles,
    onHitEnemy: (e, p) => hitEnemy(e, p.dmg, Math.sign(p.vx) || 1, p.kb, p.def),
    onHitPlayer: (p) => player.hurt(p.dmg, Math.sign(p.vx) || 1, inv.defense(), fx),
  });

  for (const r of remotes.values()) {
    r.p.remoteUpdate(dt, wind, time);
    if (r.p.dead && !r.wasDead) {
      r.p.drawSprite();
      particles.burstFrom(r.p.px, Math.round(r.p.x) - 16, Math.round(r.p.y) - 47, false, 1.2, 1);
    }
    r.wasDead = r.p.dead;
    if (r.bubble) { r.bubble.t -= dt; if (r.bubble.t <= 0) r.bubble = null; }
  }
  if (myBubble) { myBubble.t -= dt; if (myBubble.t <= 0) myBubble = null; }

  netT -= dt;
  if (netT <= 0 && net.online) { netT = 0.05; net.send({ t: 'state', s: player.serialize() }); }
  saveT -= dt;
  if (saveT <= 0) { saveT = 5; saveInv(); }

  for (const e of world.events) {
    if (e.item) {
      spawnPickup(e.x * TILE + 16, e.y * TILE + 4, e.item, 1);
      for (const it of e.items || []) if (it) spawnPickup(e.x * TILE + 16, e.y * TILE, it.id, it.n);
      if (e.objId) net.send({ t: 'obj', op: 'del', id: e.objId });
    } else spawnPickup(e.x * TILE + 8, e.y * TILE + 8, TILE_DROP[e.id], 1);
  }
  world.events.length = 0;
  for (const [key, d] of world.damage) if (time - d.t > 4) world.damage.delete(key);
  for (const [key, t0] of world.placeAnim) if (time - t0 > 0.3) world.placeAnim.delete(key);
  for (const [key, t0] of world.hitAnim) if (time - t0 > 0.2) world.hitAnim.delete(key);

  updatePickups(dt);
  ambient(dt);
  particles.update(dt, world, wind);
  floats.update(dt);
  if (banner) banner.t -= dt;

  // câmera: suavização exponencial, antecipa a direção, o mouse e o chefe
  const mxs = hx - VW / 2, mys = hy - VH / 2;
  let tcx = player.x - VW / 2 + player.vx * 0.3 + mxs * 0.12;
  let tcy = player.y - 20 - VH / 2 + mys * 0.12 + Math.max(0, player.vy - 300) * 0.15;
  if (boss && Math.hypot(boss.x - player.x, boss.y - player.y) < 500) { tcx += (boss.x - player.x) * 0.25; tcy += (boss.cy - player.y) * 0.2; }
  cam.x += (tcx - cam.x) * (1 - Math.exp(-dt * 7));
  cam.y += (tcy - cam.y) * (1 - Math.exp(-dt * 5));
  cam.x = clamp(cam.x, 0, world.w * TILE - VW);
  cam.y = clamp(cam.y, -VH * 0.5, world.h * TILE - VH);
  cam.shake = Math.max(0, cam.shake - dt * 2.5);
}

// ---------------- render ----------------
function drawTarget(c) {
  const def = inv.selDef();
  if (!target || !target.inReach || !def || player.dead || inv.onUI) return;
  if (!['tool', 'block', 'wall', 'door', 'furniture'].includes(def.kind)) return;
  const { tx, ty } = target;
  const x = tx * TILE, y = ty * TILE;
  if (def.kind === 'furniture') {
    if (!world.canPlaceObject(def.obj, tx, ty)) return;
    const spr = furnSprites[def.obj];
    c.globalAlpha = 0.45;
    c.drawImage(spr, x, (ty + 1) * TILE - spr.height);
    c.globalAlpha = 1;
    return;
  }
  if (def.kind === 'wall') {
    if (world.wallAt(tx, ty)) return;
    c.globalAlpha = 0.5;
    c.drawImage(icons[def.id], x, y);
    c.globalAlpha = 1;
  }
  const has = def.hammer ? !!world.wallAt(tx, ty) : world.get(tx, ty) !== T.AIR || !!world.objAt(tx, ty);
  if (def.kind === 'block' && has) return;
  if (!has && def.kind === 'block') {
    c.globalAlpha = 0.35;
    if (def.tile === T.TORCH) drawTorch(c, tx, ty, time);
    else c.drawImage(atlas, 15 * TILE, tileSrcY(def.tile, 0), TILE, TILE, x, y, TILE, TILE);
    c.globalAlpha = 1;
  }
  const o = Math.round(Math.sin(time * 7) * 0.5 + 0.5);
  c.fillStyle = has ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)';
  const L = 4, a = x - 1 - o, b = y - 1 - o, e = x + TILE + o, f = y + TILE + o;
  c.fillRect(a, b, L, 1); c.fillRect(a, b, 1, L);
  c.fillRect(e - L + 1, b, L, 1); c.fillRect(e, b, 1, L);
  c.fillRect(a, f, L, 1); c.fillRect(a, f - L + 1, 1, L);
  c.fillRect(e - L + 1, f, L, 1); c.fillRect(e, f - L + 1, 1, L);
}

function drawPickups(c) {
  for (const p of pickups) {
    const bob = Math.round(Math.sin(p.t * 4 + p.x) * 1);
    c.drawImage(icons[p.id], Math.round(p.x) - 5, Math.round(p.y) - 5 + bob, 10, 10);
  }
}

function lightExtras() {
  const ex = [];
  for (const p of allPlayers()) {
    if (p.dead) continue;
    const x = Math.floor(p.x / TILE), y = Math.floor((p.y - 16) / TILE);
    if (p.holdTorch) ex.push({ x, y, r: 1.1, g: 0.82, b: 0.52 });
    else if (p.armor.every((a) => a && a.set === 'crystal')) ex.push({ x, y, r: 0.35, g: 0.7, b: 0.95 });
    else if (p === player) ex.push({ x, y, r: 0.16, g: 0.15, b: 0.2 });
    if (p.aiming && p.weapon && p.weapon.kind === 'staff') ex.push({ x, y, r: 0.3, g: 0.65, b: 0.9 });
  }
  for (const o of world.objects) if (o.type === 'furnace') {
    const f = 0.92 + 0.08 * Math.sin(time * 11 + o.x);
    ex.push({ x: o.x, y: o.y, r: 1.2 * f, g: 0.75 * f, b: 0.42 * f }, { x: o.x + 1, y: o.y, r: 1.2 * f, g: 0.75 * f, b: 0.42 * f });
  }
  const b = enemies.boss(); // o chefe emite uma luz doentia própria, para ser legível no escuro
  if (b) ex.push({ x: Math.floor(b.x / TILE), y: Math.floor(b.cy / TILE), r: 0.75, g: 0.6, b: 0.62 });
  for (const pr of projectiles.list) if (pr.kind === 'bolt') ex.push({ x: Math.floor(pr.x / TILE), y: Math.floor(pr.y / TILE), r: 0.4, g: 0.8, b: 1 });
  return ex;
}

function render(dt) {
  const sk = cam.shake * cam.shake * 6;
  const cx = cam.x + (Math.random() * 2 - 1) * sk, cy = cam.y + (Math.random() * 2 - 1) * sk;
  const icx = Math.floor(cx), icy = Math.floor(cy), fx = cx - icx, fy = cy - icy;

  bg.draw(bctx, VW + 1, VH + 1, cx, cy, env, world.refY, time, dt);

  lctx.clearRect(0, 0, layer.width, layer.height);
  lctx.save();
  lctx.translate(-icx, -icy);
  const view = {
    x0: Math.floor(icx / TILE) - 1, y0: Math.floor(icy / TILE) - 1,
    x1: Math.floor((icx + VW) / TILE) + 1, y1: Math.floor((icy + VH) / TILE) + 1,
  };
  drawWorld(lctx, world, view, time, wind, player, out);
  particles.draw(lctx, false);
  drawPickups(lctx);
  enemies.draw(lctx, view);
  for (const r of remotes.values()) if (r.seen) r.p.draw(lctx, time);
  player.draw(lctx, time);
  projectiles.draw(lctx);
  lctx.restore();

  // luz: multiplica sobre a camada do mundo e depois recorta pelo alfa original
  mctx.clearRect(0, 0, mask.width, mask.height);
  mctx.drawImage(layer, 0, 0);
  const M = 12, lx0 = view.x0 - M, ly0 = view.y0 - M;
  const LW = view.x1 - view.x0 + 1 + 2 * M, LH = view.y1 - view.y0 + 1 + 2 * M;
  lighting.compute(world, lx0, ly0, LW, LH, env.sky, time, lightExtras());
  lctx.save();
  lctx.translate(-icx, -icy);
  lctx.globalCompositeOperation = 'multiply';
  lctx.imageSmoothingEnabled = lighting.smooth;
  lctx.drawImage(lighting.canvas, lx0 * TILE, ly0 * TILE, LW * TILE, LH * TILE);
  lctx.restore();
  lctx.imageSmoothingEnabled = false;
  lctx.globalCompositeOperation = 'destination-in';
  lctx.drawImage(mask, 0, 0);
  lctx.globalCompositeOperation = 'source-over';

  bctx.drawImage(layer, 0, 0);
  bctx.save();
  bctx.translate(-icx, -icy);
  bctx.globalCompositeOperation = 'lighter';
  drawGlow(bctx, out, time);
  particles.draw(bctx, true);
  projectiles.drawGlow(bctx);
  for (const p of allPlayers())
    for (const [x, y, col, size] of p.glowPts) {
      if (size) glowAt(bctx, x, y, col, size === 2 ? 30 : 18, size === 2 ? 0.35 : 0.5);
      else { bctx.fillStyle = col; bctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
    }
  const boss = enemies.boss();
  if (boss) glowAt(bctx, boss.x, boss.cy - 7, boss.phase === 2 ? '#ff4040' : '#a0ff60', 40, 0.18 + 0.08 * Math.sin(time * 5));
  bctx.globalCompositeOperation = 'source-over';
  drawTarget(bctx);
  // nomes, balões e números de dano (depois da luz, sempre legíveis)
  for (const r of remotes.values()) {
    if (!r.seen || r.p.dead) continue;
    drawNameTag(bctx, r.p.x, r.p.y - 44, r.name, '#e8f0ff');
    if (r.bubble) drawBubble(bctx, r.p.x, r.p.y - 48, r.bubble.text, Math.min(1, r.bubble.t));
  }
  if (myBubble && !player.dead) drawBubble(bctx, player.x, player.y - 40, myBubble.text, Math.min(1, myBubble.t));
  floats.draw(bctx);
  bctx.restore();

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, -fx * scale, -fy * scale, buf.width * scale, buf.height * scale);
  ctx.drawImage(vig, 0, 0);

  hctx.clearRect(0, 0, hud.width, hud.height);
  const hx = (input.mouse.x * dpr) / scale, hy = (input.mouse.y * dpr) / scale;
  const pr = inv.panelRect();
  const hy0 = inv.open && pr.x + pr.w > VW - 110 ? pr.y + pr.h + 6 : 8; // desce os corações se o inventário ocupar o canto
  drawHearts(hctx, VW, player.hp, player.maxHp, inv.defense(), time, hy0);
  const status = net.online ? `online ${remotes.size + 1}${isHost ? ' *' : ''}` : 'offline';
  drawText(hctx, status, VW - 6 - textWidth(status.toUpperCase()), hy0 + 22, net.online ? '#a8f0a0' : '#a8a0c0');
  if (boss) drawBossBar(hctx, VW, VH, boss, time);
  drawChat(hctx, VW, VH - (boss ? 30 : 0), chatLog, time, chatOpen);
  drawBanner(hctx, VW, VH, banner);
  if (player.dead) {
    const s = `renascendo em ${Math.ceil(player.deadT)}`;
    drawText(hctx, s, Math.round(VW / 2 - textWidth(s.toUpperCase()) / 2), Math.round(VH * 0.28) + 22, '#e8d0d8');
  }
  inv.draw(hctx, VW, VH, time, player, hx, hy);
  if (!inv.cursor) drawCursor(hctx, hx, hy);
  ctx.drawImage(hud, 0, 0, hud.width * scale, hud.height * scale);
}

// ---------------- loop ----------------
let last = performance.now(), fpsAcc = 0, fpsN = 0, cpuAcc = 0;
function ensureSize() {
  const d = window.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(innerWidth * d) || canvas.height !== Math.floor(innerHeight * d)) resize();
  return canvas.width > 0 && canvas.height > 0;
}
// "hit-stop": congela a simulação por alguns ms no impacto. A entrada é
// preservada durante o congelamento (só é limpa depois de um update de verdade).
function step(dt) {
  if (hitStop > 0) { hitStop -= dt; return false; }
  update(dt);
  return true;
}
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!ensureSize()) return requestAnimationFrame(loop);
  const t0 = performance.now();
  const ran = step(dt);
  render(dt);
  if (ran) endFrame();
  cpuAcc += performance.now() - t0;
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) {
    statsEl.textContent = `${Math.round(fpsN / fpsAcc)} fps · ${(cpuAcc / fpsN).toFixed(1)} ms/frame · ${enemies.list.length} inimigos · ${particles.list.length} partículas`;
    fpsAcc = 0; fpsN = 0; cpuAcc = 0;
  }
  requestAnimationFrame(loop);
}

async function boot() {
  buildAtlas(1337);
  buildFurniture();
  buildItems();
  document.getElementById('loading').style.display = 'none';
  const choice = await runLobby();
  myName = choice.name;
  myLook = choice.look;
  document.getElementById('loading').style.display = 'grid';
  document.getElementById('loading').textContent = 'Conectando…';
  let welcome = null;
  try { welcome = await net.connect(myName, myLook); } catch { welcome = null; }
  document.getElementById('loading').textContent = 'Gerando mundo…';
  await new Promise((r) => setTimeout(r, 20));
  inv = new Inventory();
  let saved = null;
  try { saved = localStorage.getItem(invKey()); } catch {}
  if (!saved || !inv.load(saved)) starterKit();
  buildKit();
  inv.onChestChange = (o) => net.send({ t: 'chest', id: o.id, items: o.items });
  if (welcome) {
    myId = welcome.id;
    isHost = welcome.host === welcome.id;
    env.t = welcome.time ?? 0.3;
    setupWorld(welcome.seed, welcome);
    for (const pl of welcome.players) {
      const r = addRemote(pl.id, pl.name, pl.look);
      if (pl.s) { r.p.applyNet(pl.s); r.p.x = pl.s.x; r.p.y = pl.s.y; r.seen = true; }
    }
    pushChat('', `Bem-vindo, ${myName}! ${welcome.players.length ? welcome.players.length + ' jogador(es) online.' : 'Você é o primeiro aqui.'}`, '#f5d76e');
  } else {
    setupWorld((Math.random() * 1e9) | 0, null);
    pushChat('', 'Modo offline (sem servidor multiplayer)', '#c8c0e0');
  }
  pushChat('', 'E: inventário · Enter: chat · clique direito: porta e baú · S desce da plataforma', '#c8c0e0');
  document.getElementById('loading').remove();
  addEventListener('beforeunload', saveInv);
  // gancho de depuração: avança N frames manualmente (útil com a aba em segundo plano)
  const tick = (n = 1, dt = 1 / 60) => {
    for (let i = 0; i < n; i++) if (step(dt)) endFrame();
    if (ensureSize()) render(dt);
  };
  window.__game = {
    get world() { return world; }, get player() { return player; }, get inv() { return inv; },
    env, cam, lighting, input, tick, particles, enemies, projectiles, net, remotes, spawnBoss, factory, setHost: (v) => (isHost = v),
  };
  requestAnimationFrame((t) => { last = t; loop(t); });
}
boot();
