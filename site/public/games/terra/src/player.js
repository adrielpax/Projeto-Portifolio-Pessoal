// Personagem: física com "game feel" + animação procedural desenhada pixel a pixel.
// Squash & stretch é feito MUDANDO A POSE (agachar/esticar pernas), não escalando
// o sprite — nenhum pixel é distorcido. Armaduras e armas são desenhadas no corpo.
import { TILE } from './config.js';
import { Px, selOut, hex, lerp, mixc, rotateInto, shadeDark, shadeLight } from './art.js';
import { ITEMS, MAT_RAMP, handSprite, bowSprite } from './items.js';

export const SW = 34, SH = 50, OX = 16, OY = 46;
export const RUN = 165;
const ACC_G = 1700, ACC_A = 1050, FRIC = 2100, GRAV = 1550, JUMP = 440, MAXF = 640;

export const HAIR_COLORS = ['#e0603c', '#f2c14a', '#3b2a3a', '#8a5a3a', '#e8e8f0', '#5a8ae0', '#d85ab0'];
export const SHIRT_COLORS = ['#3f7fd0', '#d04848', '#48a860', '#e0a030', '#8a5ad0', '#40b0b0', '#e8e0d0'];
export const SKIN_TONES = ['#f2c29b', '#d9a07a', '#a86e4a', '#6e4630'];
export const HAIR_STYLES = ['Espetado', 'Rabo de cavalo', 'Longo'];

const approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const easeIn = (t) => t * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function buildLook(l) {
  const skin = hex(l.skin), hair = hex(l.hair), shirt = hex(l.shirt), pants = hex(l.pants || '#40365a');
  return {
    skin, skinD: shadeDark(skin, 0.3), blush: mixc(skin, [235, 95, 110], 0.35),
    hair, hairL: shadeLight(hair, 0.35), hairD: shadeDark(hair, 0.35),
    shirt, shirtD: shadeDark(shirt, 0.35), shirtL: shadeLight(shirt, 0.3),
    pants, pantsD: shadeDark(pants, 0.35),
    boot: hex('#6a3e2a'), bootD: hex('#3a2218'), belt: hex('#5a3a2a'), buckle: hex('#f0c850'),
    eye: hex(l.eye || '#1c1026'), scarf: hex(l.scarf || '#e0484e'),
    style: l.style | 0, zombie: !!l.zombie, noScarf: !!l.zombie,
  };
}

export function swingAngle(p, kind) {
  if (kind === 'melee') {
    if (p <= 0) return -2.2;
    if (p < 0.15) return lerp(-2.2, -2.6, easeOut(p / 0.15));
    if (p < 0.45) return lerp(-2.6, 1.5, easeIn((p - 0.15) / 0.3));
    if (p < 0.6) return lerp(1.5, 1.6, easeOut((p - 0.45) / 0.15));
    return lerp(1.6, -2.2, easeInOut((p - 0.6) / 0.4));
  }
  if (p <= 0) return -2.0;
  if (p < 0.18) return lerp(-2.0, -2.5, easeOut(p / 0.18));
  if (p < 0.55) return lerp(-2.5, 1.0, easeIn((p - 0.18) / 0.37));
  if (p < 0.7) return lerp(1.0, 1.15, easeOut((p - 0.55) / 0.15));
  return lerp(1.15, -2.0, easeInOut((p - 0.7) / 0.3));
}

// ---------------- desenho do humanoide (jogadores e zumbis) ----------------
function P(p, x, y, w, h, c) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.set(OX + x + i, OY - (y + j), c);
}
function seg(p, x0, y0, x1, y1, w, c) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let s = 0; s <= n; s++) {
    const x = Math.round(x0 + ((x1 - x0) * s) / n), y = Math.round(y0 + ((y1 - y0) * s) / n);
    P(p, x - (w >> 1), y, w, 1, c);
  }
}

export function drawHumanoid(p, st, L, arm) {
  p.d.fill(0);
  const [hA, bA, lA] = arm || [null, null, null];
  const hm = hA && MAT_RAMP[hA.mat], bm = bA && MAT_RAMP[bA.mat], lm = lA && MAT_RAMP[lA.mat];
  const shirt = bm ? bm[2] : L.shirt, shirtD = bm ? bm[1] : L.shirtD, shirtL = bm ? bm[3] : L.shirtL;
  const pants = lm ? lm[2] : L.pants, pantsD = lm ? lm[1] : L.pantsD;
  const boot = lm ? lm[1] : L.boot, bootD = lm ? lm[0] : L.bootD;
  const zombie = L.zombie;
  const amt = Math.min(1, Math.abs(st.vx) / st.run);
  const running = st.onGround && Math.abs(st.vx) > 12;
  const drop = Math.max(0, Math.round(st.crouch)), str = Math.max(0, Math.round(-st.crouch));
  const bob = running ? Math.round((1 - Math.abs(Math.cos(st.runPhase))) * 1.4 * amt) : 0;
  const br = !running && st.onGround && Math.sin(st.breath * 2.2) > 0.2 ? 1 : 0;
  const hipY = 10 - drop + str + bob;
  const hy = hipY + 10 + br, shY = hipY + 8 + br, hx = zombie ? 1 : 0;
  const wk = st.weapon ? st.weapon.kind : null;

  let legs;
  const legAmp = zombie ? 3 : 5;
  if (!st.onGround) legs = st.vy < 0 ? [{ fx: 3, fy: 4 }, { fx: -2, fy: 2 }] : [{ fx: 2, fy: 1 }, { fx: -3, fy: 2 }];
  else if (running)
    legs = [0, Math.PI].map((o) => ({
      fx: Math.round(Math.sin(st.runPhase + o) * legAmp * amt),
      fy: Math.round(Math.max(0, Math.cos(st.runPhase + o)) * (zombie ? 1.5 : 3) * amt),
    }));
  else legs = [{ fx: 1 + (drop > 1 ? 1 : 0), fy: 0 }, { fx: -2 - (drop > 1 ? 1 : 0), fy: 0 }];

  const out = { neck: hy, hand: [1, shY - 6], back: [-1, shY - 6] };
  const armPose = (front) => {
    const sx = front ? 1 : -1;
    const dir = (a, r) => [sx + Math.round(Math.cos(a) * r), shY - Math.round(Math.sin(a) * r)];
    if (front && st.swing > 0 && (wk === 'tool' || wk === 'melee')) return dir(st.toolA, 5);
    if (st.aiming && (wk === 'bow' || wk === 'staff')) {
      if (front) return dir(st.aimA, 6);
      if (wk === 'bow') return dir(st.aimA, 2 - Math.round(st.pull * 0.6));
    }
    if (front && st.pokeT > 0) return dir(st.aimA, 6);
    if (front && st.holdTorch) return [sx + 4, shY - 3];
    if (zombie) return front ? [sx + 7, shY - 1 + (running ? Math.round(Math.sin(st.runPhase) * 0.8) : 0)] : [sx + 6, shY];
    if (!st.onGround) return st.vy < 0 ? [sx + (front ? 3 : -3), shY - 2] : [sx + (front ? 3 : -2), shY + 3];
    if (running) {
      const s = Math.sin(st.runPhase + (front ? Math.PI : 0));
      return [sx + Math.round(s * 4 * amt), shY - 6 + Math.round(Math.abs(s) * 2 * amt)];
    }
    return [sx + (front ? 0 : -1), shY - 6];
  };
  const drawArm = (front) => {
    const sx = front ? 1 : -1;
    const [ax, ay] = armPose(front);
    const ex = Math.round((sx + ax) / 2) - (zombie ? 0 : 1), ey = Math.round((shY + ay) / 2);
    seg(p, sx, shY, ex, ey, 2, front ? shirt : shirtD);
    const skin = front ? L.skin : L.skinD;
    seg(p, ex, ey, ax, ay, 2, bm ? (front ? bm[1] : bm[0]) : skin);
    P(p, ax - 1, ay - 1, 2, 2, skin);
    if (front) out.hand = [ax, ay]; else out.back = [ax, ay];
  };
  const drawLeg = (hipX, leg, front) => {
    const col = front ? pants : pantsD;
    const ax = leg.fx, ay = leg.fy + 3;
    const kx = Math.round((hipX + ax) / 2 + 1 + (leg.fy > 1 ? 1 : 0)), ky = Math.round((hipY + ay) / 2);
    seg(p, hipX, hipY, kx, ky, 3, col);
    seg(p, kx, ky, ax, ay, 3, col);
    if (lm && front) P(p, kx - 1, ky, 2, 1, lm[4]);
    P(p, ax - 1, leg.fy, 4, 3, front ? boot : bootD);
    P(p, ax + 3, leg.fy, 1, 2, front ? boot : bootD);
    P(p, ax - 1, leg.fy, 5, 1, bootD);
    if (lm && front) P(p, ax + 1, leg.fy + 2, 2, 1, lm[3]);
  };

  drawArm(false);
  drawLeg(-1, legs[1], false);
  if (bm) P(p, -4, shY - 1, 3, 3, bm[1]);
  // tronco
  P(p, -3, hipY + 1, 7, 9 + br, shirt);
  P(p, -3, hipY + 1, 1, 9 + br, shirtD);
  P(p, -2, hipY + 9 + br, 5, 1, shirtL);
  P(p, -3, hipY + 1, 7, 1, bm ? bm[0] : L.belt);
  P(p, 1, hipY + 1, 1, 1, bm ? bm[4] : L.buckle);
  if (bm) { P(p, -1, hipY + 4, 1, 4, bm[4]); P(p, 2, hipY + 3, 1, 5, bm[1]); }
  if (zombie) { P(p, 1, hipY + 3, 2, 1, L.skin); P(p, -2, hipY + 6, 1, 2, L.skin); P(p, 2, hipY + 8, 1, 1, L.skinD); }
  drawLeg(1, legs[0], true);

  // cabeça
  P(p, hx - 3, hy, 8, 8, L.skin);
  P(p, hx - 3, hy, 8, 1, L.skinD);
  P(p, hx - 1, hy + 2, 1, 2, L.skinD);
  if (!zombie) P(p, hx + 3, hy + 1, 1, 1, L.blush);
  const eyeDY = st.aimA < -0.45 ? 1 : st.aimA > 0.45 ? -1 : 0;
  if (st.blink > 0) {
    P(p, hx + 2, hy + 2 + eyeDY, 1, 2, L.eye);
    if (zombie) P(p, hx + 2, hy + 3 + eyeDY, 1, 1, [255, 60, 60]);
  } else P(p, hx + 2, hy + 2, 1, 1, L.skinD);
  if (st.hurt > 0.2 || zombie) P(p, hx + 3, hy + 1, 1, 1, [110, 30, 40]);

  if (hm) {
    P(p, hx - 4, hy + 4, 9, 4, hm[2]);
    P(p, hx - 3, hy + 8, 7, 1, hm[2]);
    P(p, hx - 4, hy + 4, 9, 1, hm[1]);
    P(p, hx - 2, hy + 7, 3, 1, hm[4]);
    P(p, hx - 3, hy + 6, 1, 1, hm[3]);
    P(p, hx - 4, hy + 1, 2, 3, hm[1]);
    P(p, hx + 4, hy + 2, 1, 2, hm[2]);
    if (hA.mat === 'crystal') { P(p, hx - 1, hy + 9, 1, 2, hm[4]); P(p, hx + 1, hy + 9, 1, 1, hm[3]); P(p, hx - 3, hy + 9, 1, 1, hm[3]); }
  } else {
    P(p, hx - 4, hy + 5, 9, 3, L.hair);
    P(p, hx - 4, hy + 1, 3, 5, L.hair);
    P(p, hx - 2, hy + 7, 3, 1, L.hairL);
    P(p, hx + 3, hy + 4, 2, 1, L.hair);
    if (zombie) { P(p, hx + 1, hy + 7, 1, 1, L.skin); P(p, hx - 2, hy + 5, 1, 1, L.skinD); }
    else if (L.style === 0) { P(p, hx - 3, hy + 8, 1, 1, L.hair); P(p, hx - 1, hy + 8, 2, 1, L.hair); P(p, hx + 2, hy + 8, 1, 1, L.hair); P(p, hx, hy + 9, 1, 1, L.hairL); }
    else if (L.style === 1) P(p, hx - 5, hy + 5, 1, 2, L.hairD);
    else if (L.style === 2) { P(p, hx - 4, hy - 3, 3, 5, L.hair); P(p, hx - 5, hy - 2, 1, 6, L.hairD); P(p, hx + 4, hy + 2, 1, 3, L.hair); }
    if (!zombie && L.style !== 1 && (Math.abs(st.vx) > st.run * 0.6 || st.vy > 250)) P(p, hx - 5, hy + 3, 1, 4, L.hair);
  }
  if (!L.noScarf) { P(p, -4, hy - 1, 8, 2, L.scarf); P(p, -4, hy - 1, 8, 1, shadeDark(L.scarf, 0.35)); }
  drawArm(true);
  if (bm) { P(p, 0, shY - 1, 3, 3, bm[2]); P(p, 0, shY + 1, 3, 1, bm[4]); }

  selOut(p, 0.3);
  if (st.hurt > 0) {
    const k = Math.min(1, st.hurt) * 0.85;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3]) { p.d[i] += (255 - p.d[i]) * k; p.d[i + 1] += (255 - p.d[i + 1]) * k; p.d[i + 2] += (255 - p.d[i + 2]) * k; }
  }
  return out;
}

// ---------------- jogador ----------------
export class Player {
  constructor(x, y, look) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.w = 12; this.h = 30;
    this.onGround = false; this.face = 1; this.coyote = 0; this.jumpBuf = 0;
    this.runPhase = 0; this.lastStep = 1; this.crouch = 0; this.crouchV = 0;
    this.breath = 0; this.blink = 3; this.stepOff = 0;
    this.swingP = 0; this.hitDone = false; this.toolA = -2; this.prevToolA = -2;
    this.pokeT = 0; this.aimA = 0; this.aiming = false; this.useCD = 0; this.pull = 0; this.nocked = false;
    this.neck = 20; this.hand = [0, 0]; this.backHand = [0, 0];
    this.hp = 100; this.maxHp = 100; this.invuln = 0; this.hurtFlash = 0; this.sinceHurt = 99; this.stun = 0;
    this.dead = false; this.deadT = 0;
    this.armor = [null, null, null]; this.weapon = null; this.holdTorch = false;
    this.glowPts = [];
    this.setLook(look || { hair: HAIR_COLORS[0], shirt: SHIRT_COLORS[0], skin: SKIN_TONES[0], style: 0 });
    this.px = new Px(SW, SH);
    this.spr = document.createElement('canvas');
    this.spr.width = SW; this.spr.height = SH;
    this.sctx = this.spr.getContext('2d');
    this.simg = this.sctx.createImageData(SW, SH);
    this.tpx = new Px(44, 44);
    this.tool = document.createElement('canvas');
    this.tool.width = this.tool.height = 44;
    this.tctx = this.tool.getContext('2d');
    this.timg = this.tctx.createImageData(44, 44);
    this.scarf = [];
    for (let i = 0; i < 9; i++) this.scarf.push({ x: x - i * 2, y: y - 20, px: x - i * 2, py: y - 20 });
    this.tail = [];
    for (let i = 0; i < 6; i++) this.tail.push({ x, y: y - 26 + i * 2, px: x, py: y - 26 + i * 2 });
  }

  setLook(l) { this.lookRaw = l; this.look = buildLook(l); }

  collides(world, x = this.x, y = this.y) {
    const l = x - this.w / 2, r = x + this.w / 2, t = y - this.h;
    const tx0 = Math.floor(l / TILE), tx1 = Math.floor((r - 0.001) / TILE);
    const ty0 = Math.floor(t / TILE), ty1 = Math.floor((y - 0.001) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (world.isSolid(tx, ty)) return true;
    return false;
  }

  moveX(dx, world) {
    if (!dx) return;
    this.x += dx;
    if (!this.collides(world)) return;
    if (this.onGround) {
      for (let up = 1; up <= TILE; up++)
        if (!this.collides(world, this.x, this.y - up)) { this.y -= up; this.stepOff += up; return; }
    }
    if (dx > 0) this.x = Math.floor((this.x + this.w / 2) / TILE) * TILE - this.w / 2 - 0.001;
    else this.x = (Math.floor((this.x - this.w / 2) / TILE) + 1) * TILE + this.w / 2 + 0.001;
    this.vx = 0;
  }

  poke() { this.pokeT = 0.16; }

  hurt(dmg, dir, defense, fx) {
    if (this.invuln > 0 || this.dead) return 0;
    const d = Math.max(1, Math.round(dmg * (0.9 + Math.random() * 0.2) - defense * 0.75));
    this.hp -= d;
    this.invuln = 0.8; this.hurtFlash = 1; this.sinceHurt = 0; this.stun = 0.18;
    this.vx = dir * 240; this.vy = -240; this.onGround = false;
    fx.hurt(this, d);
    if (this.hp <= 0) { this.hp = 0; this.dead = true; this.deadT = 4; fx.die(this); }
    return d;
  }

  // entrada local -> física -> animação. Retorna eventos para o jogo.
  update(dt, c, world, fx, wind, time) {
    const ev = { mineHit: false, shoot: false };
    this.stun = Math.max(0, this.stun - dt);
    const dir = this.stun > 0 ? 0 : (c.right ? 1 : 0) - (c.left ? 1 : 0);
    if (dir) {
      const turning = Math.sign(this.vx) === -dir;
      if (turning && this.onGround && Math.abs(this.vx) > 100) fx.skid(this);
      this.vx = approach(this.vx, dir * RUN, (this.onGround ? ACC_G : ACC_A) * (turning ? 1.9 : 1) * dt);
    } else if (this.stun <= 0) this.vx = approach(this.vx, 0, (this.onGround ? FRIC : ACC_A * 0.35) * dt);

    this.coyote = this.onGround ? 0.1 : this.coyote - dt;
    this.jumpBuf = c.jumpPressed ? 0.13 : this.jumpBuf - dt;
    if (this.jumpBuf > 0 && this.coyote > 0 && this.stun <= 0) {
      this.vy = -JUMP; this.jumpBuf = 0; this.coyote = 0; this.onGround = false;
      this.crouch = -2.6; this.crouchV = 0;
      fx.jump(this);
    }
    let g = GRAV;
    if (this.vy < 0 && !c.jump && this.stun <= 0) g *= 2.4;
    else if (Math.abs(this.vy) < 60 && c.jump) g *= 0.55;
    this.vy = Math.min(MAXF, this.vy + g * dt);

    const wasGround = this.onGround;
    const steps = Math.max(1, Math.ceil((Math.max(Math.abs(this.vx), Math.abs(this.vy)) * dt) / 4));
    const sdt = dt / steps;
    let impact = 0;
    this.dropT = Math.max(0, (this.dropT || 0) - dt);
    if (c.down) this.dropT = 0.2; // segurar para baixo atravessa plataformas
    for (let s = 0; s < steps; s++) {
      this.moveX(this.vx * sdt, world);
      const prevY = this.y;
      this.y += this.vy * sdt;
      if (this.collides(world)) {
        if (this.vy > 0) { impact = Math.max(impact, this.vy); this.y = Math.floor((this.y - 0.001) / TILE) * TILE; }
        else this.y = (Math.floor((this.y - this.h) / TILE) + 1) * TILE + this.h;
        this.vy = 0;
      } else if (this.vy > 0 && this.dropT <= 0) {
        const top = world.platformLand(this.x - this.w / 2, this.x + this.w / 2, prevY, this.y);
        if (top !== null) { impact = Math.max(impact, this.vy); this.y = top; this.vy = 0; }
      }
    }
    this.onGround = this.vy >= 0 && (this.collides(world, this.x, this.y + 1) ||
      (this.dropT <= 0 && world.onPlatform(this.x - this.w / 2, this.x + this.w / 2, this.y)));
    if (this.onGround && !wasGround && impact > 120) {
      this.crouch = Math.min(4.5, impact / 130);
      this.crouchV = 0;
      fx.land(this, impact);
    }

    // uso de arma/ferramenta
    const w = this.weapon, wk = w ? w.kind : null;
    this.useCD = Math.max(0, this.useCD - dt);
    if (wk === 'tool' || wk === 'melee') {
      if (this.swingP > 0 || c.use) {
        const was = this.swingP;
        this.swingP += dt / w.speed;
        if (was === 0) this.swingId = (this.swingId || 0) + 1;
        if (!this.hitDone && this.swingP >= 0.55) { this.hitDone = true; ev.mineHit = wk === 'tool'; }
        if (this.swingP >= 1) { this.hitDone = false; this.swingP = c.use ? this.swingP - 1 : 0; if (c.use) this.swingId++; }
      }
    } else this.swingP = 0;
    this.aiming = (wk === 'bow' || wk === 'staff') && (c.use || this.useCD > 0);
    if (this.aiming && c.use && this.useCD <= 0) { ev.shoot = true; this.useCD = w.speed; }
    const charge = w && this.aiming ? 1 - this.useCD / w.speed : 1;
    this.nocked = charge > 0.35;
    this.pull = this.nocked ? Math.round(Math.min(1, (charge - 0.35) / 0.45) * 3) : 0;
    this.prevToolA = this.toolA;
    this.toolA = swingAngle(this.swingP, wk);
    this.pokeT = Math.max(0, this.pokeT - dt);
    if (this.swingP > 0 || this.pokeT > 0 || this.aiming || c.use) this.face = c.aimX >= this.x ? 1 : -1;
    else if (Math.abs(this.vx) > 8 && this.stun <= 0) this.face = Math.sign(this.vx);
    this.aimA = Math.atan2(c.aimY - (this.y - this.neck + 2), (c.aimX - this.x) * this.face);

    // vida
    this.sinceHurt += dt;
    if (this.sinceHurt > 4 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 3 * dt);

    this.animate(dt, fx, wind, time);
    return ev;
  }

  animate(dt, fx, wind, time) {
    this.crouchV += (-170 * this.crouch - 15 * this.crouchV) * dt;
    this.crouch += this.crouchV * dt;
    this.stepOff *= Math.exp(-dt * 16);
    if (Math.abs(this.stepOff) < 0.3) this.stepOff = 0;
    this.breath += dt;
    this.blink -= dt;
    if (this.blink < -0.12) this.blink = 2 + Math.random() * 3.5;
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 7);
    const running = this.onGround && Math.abs(this.vx) > 12;
    if (running) {
      this.runPhase += (Math.abs(this.vx) * dt) / 8.5;
      const sg = Math.sin(this.runPhase) >= 0 ? 1 : -1;
      if (sg !== this.lastStep) { this.lastStep = sg; if (fx && Math.abs(this.vx) > 80) fx.step(this); }
    } else if (this.onGround) {
      const target = Math.round(this.runPhase / Math.PI) * Math.PI;
      this.runPhase += (target - this.runPhase) * Math.min(1, dt * 12);
    }
    this.updateChain(this.scarf, this.x - this.face * 4, this.y + this.stepOff - this.neck + 0.5, 2.2, dt, wind, time, 1);
    this.updateChain(this.tail, this.x - this.face * 5, this.y + this.stepOff - this.neck - 5.5, 2, dt, wind, time, 0.5);
  }

  updateChain(s, ax, ay, L, dt, wind, time, flutter) {
    s[0].x = s[0].px = ax;
    s[0].y = s[0].py = ay;
    const dt2 = dt * dt, speed = Math.min(1, Math.abs(this.vx) / RUN);
    for (let i = 1; i < s.length; i++) {
      const p = s[i];
      const vx = (p.x - p.px) * 0.92, vy = (p.y - p.py) * 0.92;
      p.px = p.x; p.py = p.y;
      p.x += vx + wind * 160 * flutter * dt2;
      p.y += vy + (240 + Math.sin(time * 13 + i * 0.8) * 200 * speed * flutter) * dt2;
    }
    for (let it = 0; it < 3; it++)
      for (let i = 1; i < s.length; i++) {
        const a = s[i - 1], b = s[i];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
        if (d > L) { b.x = a.x + (dx / d) * L; b.y = a.y + (dy / d) * L; }
      }
  }

  // ---------- rede ----------
  serialize() {
    const r = (v) => Math.round(v * 10) / 10;
    return {
      x: r(this.x), y: r(this.y), vx: r(this.vx), vy: r(this.vy), og: this.onGround ? 1 : 0, f: this.face,
      sw: r(this.swingP * 100) / 100, w: this.weapon ? this.weapon.id : 0, am: this.aiming ? 1 : 0, aa: r(this.aimA),
      pl: this.pull, nk: this.nocked ? 1 : 0, ar: this.armor.map((a) => (a ? a.id : 0)), hp: Math.ceil(this.hp),
      dead: this.dead ? 1 : 0, ht: this.holdTorch ? 1 : 0, iv: this.invuln > 0 ? 1 : 0,
    };
  }
  applyNet(s) { this.net = s; }
  remoteUpdate(dt, wind, time) {
    const s = this.net;
    if (!s) return;
    if (Math.hypot(s.x - this.x, s.y - this.y) > 160) { this.x = s.x; this.y = s.y; }
    else {
      const k = 1 - Math.exp(-dt * 14);
      this.x += (s.x - this.x) * k;
      this.y += (s.y - this.y) * k;
    }
    const wasG = this.onGround;
    this.onGround = !!s.og;
    if (!wasG && this.onGround && (this.prevVy || 0) > 250) this.crouch = Math.min(4.5, this.prevVy / 130);
    if (wasG && !this.onGround && s.vy < -100) this.crouch = -2.6;
    this.prevVy = s.vy;
    this.vx = s.vx; this.vy = s.vy; this.face = s.f || 1;
    this.weapon = ITEMS[s.w] || null;
    this.prevToolA = this.toolA;
    this.swingP = s.sw || 0;
    this.toolA = swingAngle(this.swingP, this.weapon ? this.weapon.kind : null);
    this.aiming = !!s.am; this.aimA = s.aa || 0; this.pull = s.pl | 0; this.nocked = !!s.nk;
    this.armor = (s.ar || [0, 0, 0]).map((id) => ITEMS[id] || null);
    this.hp = s.hp; this.dead = !!s.dead; this.holdTorch = !!s.ht;
    if (s.iv && this.invuln <= 0) { this.invuln = 0.5; this.hurtFlash = 1; }
    this.animate(dt, null, wind, time);
  }

  // ---------- desenho ----------
  drawSprite() {
    const r = drawHumanoid(this.px, {
      vx: this.vx, vy: this.vy, onGround: this.onGround, runPhase: this.runPhase, crouch: this.crouch,
      breath: this.breath, blink: this.blink, swing: this.swingP, toolA: this.toolA, weapon: this.weapon,
      aiming: this.aiming, aimA: this.aimA, pokeT: this.pokeT, holdTorch: this.holdTorch && !this.aiming && this.swingP === 0,
      hurt: this.hurtFlash, run: RUN, pull: this.pull,
    }, this.look, this.armor);
    this.neck = r.neck;
    this.hand = r.hand;
    this.backHand = r.back;
    this.simg.data.set(this.px.d);
    this.sctx.putImageData(this.simg, 0, 0);
  }

  drawChain(ctx, s, col, colD, thickUntil) {
    for (let pass = 0; pass < 2; pass++) {
      ctx.fillStyle = pass === 0 ? colD : col;
      for (let i = 0; i < s.length - 1; i++) {
        const a = s[i], b = s[i + 1];
        const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
        const th = i < thickUntil ? 2 : 1;
        for (let k = 0; k <= n; k++) {
          const x = Math.round(a.x + ((b.x - a.x) * k) / n), y = Math.round(a.y + ((b.y - a.y) * k) / n);
          ctx.fillRect(x, y + (pass === 0 ? 1 : 0), th, 1);
        }
      }
    }
  }

  blitRotated(ctx, sprite, a, hwx, hwy) {
    rotateInto(sprite.px, sprite.gx, sprite.gy, a, this.tpx, 22, 22);
    this.timg.data.set(this.tpx.d);
    this.tctx.putImageData(this.timg, 0, 0);
    ctx.drawImage(this.tool, hwx - 22, hwy - 22);
  }

  draw(ctx, time) {
    this.glowPts.length = 0;
    if (this.dead) return;
    this.drawSprite();
    const sx = Math.round(this.x), sy = Math.round(this.y + this.stepOff);
    const L = this.look;
    if (this.invuln > 0 && Math.floor(time * 20) % 2 === 0) ctx.globalAlpha = 0.45;
    if (L.style === 1 && !this.armor[0]) this.drawChain(ctx, this.tail, `rgb(${L.hair})`, `rgb(${L.hairD})`, 3);
    if (!L.noScarf) this.drawChain(ctx, this.scarf, `rgb(${L.scarf})`, `rgb(${shadeDark(L.scarf, 0.4)})`, 6);
    ctx.save();
    if (this.face < 0) { ctx.translate(sx * 2 + 1, 0); ctx.scale(-1, 1); }
    ctx.drawImage(this.spr, sx - OX, sy - 1 - OY);
    ctx.restore();

    const w = this.weapon, wk = w ? w.kind : null;
    const hwx = sx + this.face * this.hand[0], hwy = sy - 1 - this.hand[1];
    const flip = (fn) => {
      ctx.save();
      if (this.face < 0) { ctx.translate(hwx * 2 + 1, 0); ctx.scale(-1, 1); }
      fn();
      ctx.restore();
    };
    if (this.swingP > 0 && (wk === 'tool' || wk === 'melee')) {
      flip(() => {
        const da = this.toolA - this.prevToolA;
        if (da > 0.25) {
          const r0 = wk === 'melee' ? 9 : 11, r1 = wk === 'melee' ? 18 : 14;
          ctx.fillStyle = w.glow ? 'rgba(170,245,255,0.6)' : w.smear || 'rgba(255,250,235,0.55)';
          for (let a = this.prevToolA; a < this.toolA; a += 0.05)
            for (let r = r0; r <= r1; r += 1.5) {
              const x = Math.round(hwx + Math.cos(a) * r), y = Math.round(hwy + Math.sin(a) * r);
              ctx.fillRect(x, y, 1, 1);
              if (w.glow && Math.random() < 0.15) this.glowPts.push([this.face < 0 ? 2 * hwx - x : x, y, w.glow]);
            }
        }
        this.blitRotated(ctx, handSprite(w), this.toolA, hwx, hwy);
      });
    } else if (this.aiming && wk === 'bow') {
      flip(() => this.blitRotated(ctx, bowSprite(this.pull, this.nocked), this.aimA, hwx, hwy));
    } else if (this.aiming && wk === 'staff') {
      flip(() => this.blitRotated(ctx, handSprite(w), this.aimA, hwx, hwy));
      const tip = 15;
      this.glowPts.push([hwx + this.face * Math.cos(this.aimA) * tip, hwy + Math.sin(this.aimA) * tip, '#8aeeff', 1]);
    } else if (this.holdTorch && this.swingP === 0) {
      const tx = hwx - (this.face > 0 ? 0 : 1), ty = hwy;
      ctx.fillStyle = '#5f3f2c'; ctx.fillRect(tx, ty - 1, 2, 6);
      const fr = Math.floor(time * 12);
      const fh = 3 + (fr % 3 === 0 ? 1 : 0);
      ctx.fillStyle = '#ff7a2a'; ctx.fillRect(tx - 1, ty - 1 - fh, 4, fh);
      ctx.fillStyle = '#ffd84a'; ctx.fillRect(tx, ty - fh, 2, fh - 1);
      ctx.fillStyle = '#fffbe6'; ctx.fillRect(tx, ty - 2, 2, 1);
      this.glowPts.push([tx + 1, ty - 3, '#ffaa55', 2]);
    }
    ctx.globalAlpha = 1;
  }

  // ponto de saída dos projéteis (ombro + direção da mira)
  muzzle(dist = 14) {
    const sy = this.y - this.neck + 2;
    return [this.x + this.face * Math.cos(this.aimA) * dist, sy + Math.sin(this.aimA) * dist, Math.cos(this.aimA) * this.face, Math.sin(this.aimA)];
  }
}
