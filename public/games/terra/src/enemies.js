// Inimigos: gosma (squash & stretch), zumbi (esqueleto do humanoide) e morcego (bater de asas).
// No multiplayer um cliente é o "host" e simula a IA; os outros só interpolam.
import { TILE } from './config.js';
import { Px, selOut, hex, ramp5, lerp } from './art.js';
import { drawHumanoid, buildLook, SW, SH, OX, OY } from './player.js';

const SLIME = [ramp5(hex('#5ac85a')), ramp5(hex('#4a9af0')), ramp5(hex('#a05ae0'))];
const ZOMBIE_LOOK = buildLook({ skin: '#8fb070', hair: '#34362a', shirt: '#6a5a4a', pants: '#3a4050', zombie: true, eye: '#1a1010' });
const BAT = ramp5(hex('#5e3c70'));
const approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));

export const TYPE_LIST = ['slime', 'zombie', 'bat', 'boss'];
export const TYPES = {
  slime: { name: 'Gosma', w: 14, h: 10, hp: 26, dmg: 9, kb: 0.1, sw: 30, sh: 24, ox: 15, oy: 22, drops: [['gel', 1, 3, 1]] },
  zombie: { name: 'Zumbi', w: 12, h: 30, hp: 55, dmg: 15, kb: 0.45, sw: SW, sh: SH, ox: OX, oy: OY, drops: [['cloth', 1, 2, 0.8], ['copper', 1, 3, 0.3]] },
  bat: { name: 'Morcego', w: 12, h: 8, hp: 18, dmg: 11, kb: -0.1, sw: 24, sh: 16, ox: 12, oy: 12, drops: [['wing', 1, 1, 0.65]], fly: true },
  boss: {
    name: 'O Abominável', w: 44, h: 44, hp: 1200, dmg: 22, kb: 0.95, sw: 76, sh: 76, ox: 38, oy: 60, fly: true, boss: true,
    drops: [['crystal', 25, 35, 1], ['wing', 6, 10, 1], ['potion', 3, 5, 1], ['sword_flesh', 1, 1, 1]],
  },
};

// fábrica substituível (boss.js registra a classe do chefe aqui, evitando import circular)
export const factory = { make: (id, type, x, y, variant) => new Enemy(id, type, x, y, variant) };

export class Enemy {
  constructor(id, type, x, y, variant = 0) {
    const D = TYPES[type];
    this.id = id; this.type = type; this.variant = variant; this.D = D;
    this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.w = D.w; this.h = D.h;
    const hm = type === 'slime' ? [1, 1.3, 1.8][variant] : 1, dm = type === 'slime' ? [1, 1.2, 1.5][variant] : 1;
    this.maxHp = Math.round(D.hp * hm); this.hp = this.maxHp; this.dmg = Math.round(D.dmg * dm);
    this.face = 1; this.onGround = false; this.t = Math.random() * 10;
    this.hurtT = 0; this.stun = 0; this.hpShow = 0;
    this.sq = 0; this.sqV = 0; this.jumpT = 1 + Math.random();
    this.runPhase = 0; this.crouch = 0; this.crouchV = 0; this.blink = 2; this.flap = Math.random() * 4;
    this.px = new Px(D.sw, D.sh);
    this.canvas = document.createElement('canvas');
    this.canvas.width = D.sw; this.canvas.height = D.sh;
    this.ctx = this.canvas.getContext('2d');
    this.img = this.ctx.createImageData(D.sw, D.sh);
  }

  coll(world, x = this.x, y = this.y) {
    const l = x - this.w / 2, r = x + this.w / 2, t = y - this.h;
    const tx0 = Math.floor(l / TILE), tx1 = Math.floor((r - 0.001) / TILE);
    const ty0 = Math.floor(t / TILE), ty1 = Math.floor((y - 0.001) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (world.isSolid(tx, ty)) return true;
    return false;
  }

  phys(world, dt) {
    if (this.D.fly) {
      this.x += this.vx * dt;
      if (this.coll(world)) { this.x -= this.vx * dt; this.vx *= -0.6; }
      this.y += this.vy * dt;
      if (this.coll(world)) { this.y -= this.vy * dt; this.vy *= -0.6; }
      return;
    }
    this.vy = Math.min(620, this.vy + 1400 * dt);
    const was = this.onGround;
    let impact = 0;
    this.hitWall = false;
    const steps = Math.max(1, Math.ceil((Math.max(Math.abs(this.vx), Math.abs(this.vy)) * dt) / 4)), sdt = dt / steps;
    for (let s = 0; s < steps; s++) {
      this.x += this.vx * sdt;
      if (this.coll(world)) {
        let stepped = false;
        if (this.type === 'zombie' && this.onGround)
          for (let up = 1; up <= TILE; up++) if (!this.coll(world, this.x, this.y - up)) { this.y -= up; stepped = true; break; }
        if (!stepped) { this.x -= this.vx * sdt; this.hitWall = true; this.vx = this.type === 'slime' ? -this.vx * 0.3 : 0; }
      }
      const prevY = this.y;
      this.y += this.vy * sdt;
      if (this.coll(world)) {
        if (this.vy > 0) { impact = Math.max(impact, this.vy); this.y = Math.floor((this.y - 0.001) / TILE) * TILE; }
        else this.y = (Math.floor((this.y - this.h) / TILE) + 1) * TILE + this.h;
        this.vy = 0;
      } else if (this.vy > 0) {
        const top = world.platformLand(this.x - this.w / 2, this.x + this.w / 2, prevY, this.y);
        if (top !== null) { impact = Math.max(impact, this.vy); this.y = top; this.vy = 0; }
      }
    }
    this.onGround = this.vy >= 0 && (this.coll(world, this.x, this.y + 1) || world.onPlatform(this.x - this.w / 2, this.x + this.w / 2, this.y));
    if (!was && this.onGround && impact > 80) this.onLand(impact);
  }

  onLand(impact) {
    if (this.type === 'slime') { this.sq = Math.min(0.45, impact / 800); this.sqV = 0; }
    else { this.crouch = Math.min(4, impact / 130); this.crouchV = 0; }
  }

  ai(dt, players) {
    let tgt = null, best = this.type === 'bat' ? 300 : this.type === 'zombie' ? 700 : 380;
    for (const p of players) {
      if (p.dead) continue;
      const d = Math.hypot(p.x - this.x, p.y - this.y);
      if (d < best) { best = d; tgt = p; }
    }
    if (this.stun > 0) return;
    if (this.type === 'slime') {
      if (this.onGround) {
        this.vx = approach(this.vx, 0, 700 * dt);
        this.jumpT -= dt;
        if (this.jumpT < 0.3) this.sq = Math.max(this.sq, 0.35 * (1 - this.jumpT / 0.3)); // antecipação
        if (this.jumpT <= 0) {
          const dir = tgt ? Math.sign(tgt.x - this.x) || 1 : Math.random() < 0.5 ? -1 : 1;
          this.face = dir;
          this.vx = dir * (70 + Math.random() * 70) * (tgt ? 1.25 : 0.7);
          this.vy = -(250 + Math.random() * 150);
          this.onGround = false;
          this.sq = -0.3; this.sqV = 0;
          this.jumpT = tgt ? 0.6 + Math.random() * 0.8 : 1.5 + Math.random() * 2;
        }
      }
    } else if (this.type === 'zombie') {
      if (tgt) this.face = Math.sign(tgt.x - this.x) || this.face;
      else if (Math.random() < dt * 0.25) this.face *= -1;
      if (this.onGround) this.vx = approach(this.vx, this.face * (tgt ? 58 : 30), 500 * dt);
      if (this.hitWall && this.onGround) { this.vy = -420; this.onGround = false; }
    } else if (this.type === 'bat') {
      let dx, dy;
      if (tgt) {
        const ax = tgt.x - this.x, ay = tgt.y - 18 - this.y, d = Math.hypot(ax, ay) || 1;
        dx = (ax / d) * 125; dy = (ay / d) * 125;
      } else { dx = Math.cos(this.t * 0.7 + this.id) * 50; dy = Math.sin(this.t * 1.1 + this.id) * 30; }
      dy += Math.sin(this.t * 8) * 70;
      const k = Math.min(1, dt * 2.5);
      this.vx += (dx - this.vx) * k;
      this.vy += (dy - this.vy) * k;
      if (Math.abs(this.vx) > 5) this.face = Math.sign(this.vx);
    }
  }

  animate(dt) {
    this.t += dt;
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.stun = Math.max(0, this.stun - dt);
    this.hpShow = Math.max(0, this.hpShow - dt);
    this.blink -= dt;
    if (this.blink < -0.12) this.blink = 1.5 + Math.random() * 3;
    this.sqV += (-130 * this.sq - 11 * this.sqV) * dt;
    this.sq += this.sqV * dt;
    this.crouchV += (-170 * this.crouch - 15 * this.crouchV) * dt;
    this.crouch += this.crouchV * dt;
    if (this.onGround && Math.abs(this.vx) > 8) this.runPhase += (Math.abs(this.vx) * dt) / 7;
    this.flap += dt * 13;
  }

  damage(dmg, dir, kb) {
    this.hp -= dmg;
    this.hurtT = 0.12;
    this.hpShow = 3;
    const k = kb * (1 - this.D.kb);
    this.vx = dir * k;
    this.vy = this.D.fly ? -k * 0.3 : -Math.max(110, k * 0.7);
    this.onGround = false;
    this.stun = 0.25;
    return this.hp <= 0;
  }

  // ---------- rede ----------
  pack() {
    return [this.id, TYPE_LIST.indexOf(this.type), this.variant, Math.round(this.x), Math.round(this.y), Math.round(this.vx), Math.round(this.vy), this.face, this.hp, this.onGround ? 1 : 0];
  }
  follow(dt) {
    const n = this.net;
    if (!n) return;
    if (Math.hypot(n.x - this.x, n.y - this.y) > 120) { this.x = n.x; this.y = n.y; }
    else { const k = 1 - Math.exp(-dt * 12); this.x += (n.x + n.vx * 0.04 - this.x) * k; this.y += (n.y - this.y) * k; }
    const was = this.onGround;
    this.onGround = n.og;
    if (!was && this.onGround && this.vy > 80) this.onLand(this.vy);
    if (was && !this.onGround && n.vy < -150 && this.type === 'slime') { this.sq = -0.3; this.sqV = 0; }
    this.vx = n.vx; this.vy = n.vy; this.face = n.face;
    if (n.hp < this.hp) this.hpShow = 3;
    this.hp = n.hp;
  }

  // ---------- desenho ----------
  render() {
    const p = this.px;
    if (this.type === 'zombie') {
      drawHumanoid(p, {
        vx: this.vx, vy: this.vy, onGround: this.onGround, runPhase: this.runPhase, crouch: this.crouch, breath: this.t,
        blink: this.blink, swing: 0, toolA: 0, weapon: null, aiming: false, aimA: 0.2, pokeT: 0, holdTorch: false,
        hurt: this.hurtT * 8, run: 60, pull: 0,
      }, ZOMBIE_LOOK, null);
    } else {
      p.d.fill(0);
      if (this.type === 'slime') this.drawSlime(p);
      else this.drawBat(p);
      selOut(p, 0.35);
      if (this.hurtT > 0) for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3]) { p.d[i] = 255; p.d[i + 1] = 255; p.d[i + 2] = 255; }
    }
    this.img.data.set(p.d);
    this.ctx.putImageData(this.img, 0, 0);
  }

  drawSlime(p) {
    const m = SLIME[this.variant], sq = Math.max(-0.35, Math.min(0.5, this.sq));
    const W = Math.round(14 * (1 + sq)), H = Math.max(4, Math.round(11 * (1 - sq)));
    const cx = this.D.ox, base = this.D.oy, split = H * 0.4, hw = W / 2;
    for (let yU = 0; yU < H; yU++)
      for (let x = -Math.ceil(hw); x < Math.ceil(hw); x++) {
        const nx = (x + 0.5) / hw, ny = yU < split ? (yU - split) / (split * 1.25) : (yU - split) / (H - split);
        if (nx * nx + ny * ny > 1) continue;
        let c = ny > 0.3 && nx < -0.1 ? 3 : ny < -0.45 ? 1 : 2;
        if (nx * nx * 5 + (ny + 0.05) ** 2 * 7 < 1) c = 1; // núcleo
        p.set(cx + x, base - yU, m[c], 220);
      }
    p.set(cx - Math.round(W * 0.25), base - Math.round(H * 0.78), m[4]);
    p.set(cx - Math.round(W * 0.25) + 1, base - Math.round(H * 0.78), m[4]);
    p.set(cx - Math.round(W * 0.3), base - Math.round(H * 0.62), m[4]);
    const ey = base - Math.round(H * 0.55), look = this.face;
    for (const ex of [cx - 2 + look, cx + 2 + look]) {
      p.set(ex, ey, [26, 16, 38]);
      if (this.blink > 0) p.set(ex, ey - 1, [26, 16, 38]);
    }
  }

  drawBat(p) {
    const m = BAT, cx = 12, cy = 8;
    const f = Math.floor(this.flap) % 4, tipY = [-6, -1, 3, -1][f];
    for (const s of [-1, 1])
      for (let i = 1; i <= 8; i++) {
        const t = i / 8, top = Math.round(lerp(-1, tipY, t) + (f === 0 ? Math.sin(t * Math.PI) * -1.5 : 0));
        const bot = top + Math.max(1, Math.round((1 - t) * 4)) + (i % 3 === 1 ? 1 : 0);
        for (let y = top; y <= bot; y++) p.set(cx + s * (1 + i), cy + y, y === top ? m[3] : m[1]);
      }
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 5) p.set(cx + x, cy + y, y > 0 ? m[1] : m[2]);
    p.set(cx - 2, cy - 3, m[2]); p.set(cx + 2, cy - 3, m[2]); p.set(cx - 2, cy - 4, m[3]); p.set(cx + 2, cy - 4, m[3]);
    p.set(cx - 1, cy - 1, [255, 80, 80]); p.set(cx + 1, cy - 1, [255, 80, 80]);
    p.set(cx - 1, cy + 2, [240, 240, 240]); p.set(cx + 1, cy + 2, [240, 240, 240]);
  }

  draw(ctx) {
    this.render();
    const sx = Math.round(this.x), sy = Math.round(this.y);
    ctx.save();
    if (this.face < 0) { ctx.translate(sx * 2 + 1, 0); ctx.scale(-1, 1); }
    ctx.drawImage(this.canvas, sx - this.D.ox, sy - this.D.oy + (this.type === 'zombie' ? -1 : 0));
    ctx.restore();
    if (this.hpShow > 0 && this.hp < this.maxHp) {
      const w = 16, k = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(20,10,30,0.8)';
      ctx.fillRect(sx - w / 2 - 1, sy + 2, w + 2, 4);
      ctx.fillStyle = k > 0.5 ? '#6ad05a' : k > 0.25 ? '#f0c040' : '#e04848';
      ctx.fillRect(sx - w / 2, sy + 3, Math.max(1, Math.round(w * k)), 2);
    }
  }
}

export class Enemies {
  constructor() {
    this.list = [];
    this.nextId = 1;
    // Ritmo de aparição: pequenas "ondas" separadas por longos períodos de calmaria.
    this.spawnT = 20;  // primeira tentativa só depois de 20 s de jogo
    this.budget = 0;   // quantos ainda podem nascer nesta onda
    this.calm = 0;     // segundos de calmaria restantes
  }
  byId(id) { return this.list.find((e) => e.id === id); }
  remove(e) { const i = this.list.indexOf(e); if (i >= 0) this.list.splice(i, 1); }

  trySpawn(dt, world, players, env, idBase) {
    this.calm -= dt;
    this.spawnT -= dt;
    if (this.calm > 0 || this.spawnT > 0) return;
    const night = env.day < 0.35;
    this.spawnT = night ? 5 + Math.random() * 6 : 10 + Math.random() * 12;
    const alive = players.filter((p) => !p.dead);
    if (!alive.length) return;
    const P = alive[(Math.random() * alive.length) | 0];
    const ptx = Math.max(0, Math.min(world.w - 1, Math.floor(P.x / TILE))), pty = Math.floor((P.y - 8) / TILE);
    const surface = pty <= world.skyTop[ptx] + 3;
    // de dia, a região em volta do ponto de nascimento é segura
    if (surface && !night && world.spawnX !== undefined && Math.abs(ptx - world.spawnX) < 40) return;
    const near = this.list.filter((e) => !e.D.boss && Math.hypot(e.x - P.x, e.y - P.y) < 900).length;
    if (near >= (surface ? (night ? 4 : 2) : 3)) return;
    if (this.budget <= 0) this.budget = surface ? (night ? 2 + ((Math.random() * 3) | 0) : 1 + (Math.random() < 0.4 ? 1 : 0)) : 1 + ((Math.random() * 3) | 0);
    let type, x, y, variant = 0;
    if (surface) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const tx = Math.floor((P.x + side * (320 + Math.random() * 200)) / TILE);
      if (tx < 2 || tx >= world.w - 2) return;
      const ty = world.topSolid(tx);
      if (ty >= world.h || world.skyTop[tx] < ty) return;
      type = night ? (Math.random() < 0.7 ? 'zombie' : 'slime') : 'slime';
      variant = Math.random() < 0.3 ? 1 : 0;
      x = tx * TILE + 8; y = ty * TILE;
    } else {
      for (let k = 0; k < 14 && !type; k++) {
        const tx = ptx + Math.round((Math.random() * 2 - 1) * 28), ty = pty + Math.round((Math.random() * 2 - 1) * 16);
        if (Math.hypot(tx - ptx, ty - pty) < 14 || !world.inb(tx, ty)) continue;
        if (world.isSolid(tx, ty) || world.isSolid(tx, ty - 1) || !world.wallAt(tx, ty)) continue;
        if (Math.random() < 0.6) { type = 'bat'; x = tx * TILE + 8; y = ty * TILE + 12; }
        else if (world.isSolid(tx, ty + 1)) { type = 'slime'; variant = Math.random() < 0.5 ? 2 : 1; x = tx * TILE + 8; y = (ty + 1) * TILE; }
      }
      if (!type) return;
    }
    this.list.push(new Enemy(idBase + this.nextId++, type, x, y, variant));
    if (--this.budget <= 0) this.calm = 45 + Math.random() * 60; // fim da onda: calmaria de 45–105 s
  }

  // host: IA + física
  boss() { return this.list.find((e) => e.type === 'boss'); }
  updateHost(dt, world, players, api, env) {
    const day = env && env.day > 0.6;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      e.ai(dt, players, api);
      if (e.gone) { this.list.splice(i, 1); continue; }
      e.phys(world, dt);
      e.animate(dt);
      const dist = Math.min(...players.map((p) => Math.hypot(p.x - e.x, p.y - e.y)));
      const far = !e.D.boss && dist > 1400;
      const dawn = day && e.type === 'zombie' && dist > 380; // de manhã os zumbis somem (fora da tela)
      if (far || dawn || e.y > world.h * TILE) this.list.splice(i, 1);
    }
  }
  updateClient(dt) {
    for (const e of this.list) { e.follow(dt); e.animate(dt); }
  }

  pack() { return this.list.map((e) => e.pack()); }
  applyNet(arr) {
    const seen = new Set();
    for (const a of arr) {
      const [id, ti, variant, x, y, vx, vy, face, hp, og] = a;
      seen.add(id);
      let e = this.byId(id);
      if (!e) { e = factory.make(id, TYPE_LIST[ti], x, y, variant); this.list.push(e); }
      e.net = { x, y, vx, vy, face, hp, og: !!og };
      if (a.length > 10) { e.netState = a[10]; e.netPhase = a[11]; }
    }
    this.list = this.list.filter((e) => seen.has(e.id));
  }
  draw(ctx, view) {
    for (const e of this.list) {
      if (e.x < view.x0 * TILE - 40 || e.x > (view.x1 + 1) * TILE + 40 || e.y < view.y0 * TILE - 60 || e.y > (view.y1 + 1) * TILE + 60) continue;
      e.draw(ctx);
    }
  }
}
