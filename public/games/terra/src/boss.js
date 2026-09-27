// ======================= BOSS: O ABOMINÁVEL =======================
// Bolo de carne pulsante com olho gigante injetado, olhinho extra torto,
// boca de dentes podres, pústulas, veias latejando e tentáculos com física Verlet.
// Fase 2 (<50% de vida): olho vermelho, mais rápido, investidas teleguiadas.
import { hex, ramp5, selOut } from './art.js';
import { hash2, noise2 } from './noise.js';
import { Enemy, factory } from './enemies.js';

const FLESH = ramp5(hex('#a04a5e'));
const SICK = ramp5(hex('#8aa040'));
const BONE = ramp5(hex('#d8cc98'));
const IRIS1 = ramp5(hex('#8ac040'));
const IRIS2 = ramp5(hex('#e03030'));
const STATES = ['hover', 'windup', 'charge', 'recover', 'spit', 'summon', 'roar', 'flee'];

export class Boss extends Enemy {
  constructor(id, x, y) {
    super(id, 'boss', x, y, 0);
    this.state = 'hover'; this.stT = 2.5; this.phase = 1;
    this.mouth = 0.2; this.lid = 0.15; this.look = [0, 1]; this.spitLeft = 0; this.spitT = 0;
    this.tentacles = [];
    for (let k = 0; k < 5; k++) {
      const ch = [];
      for (let i = 0; i < 8; i++) ch.push({ x, y: y + i * 3, px: x, py: y + i * 3 });
      this.tentacles.push(ch);
    }
    const r = (n) => hash2(id % 100000, n, 91);
    this.pustules = Array.from({ length: 7 }, (_, i) => [r(i) * Math.PI * 2, 12 + r(i + 20) * 9, 1 + ((r(i + 40) * 2) | 0)]);
    this.veins = Array.from({ length: 6 }, (_, i) => {
      const pts = [];
      let a = r(i + 60) * Math.PI * 2, d = 22;
      for (let k = 0; k < 16; k++) { pts.push([Math.cos(a) * d, Math.sin(a) * d]); a += (r(i * 20 + k) - 0.5) * 0.5; d -= 1; }
      return pts;
    });
    this.bodyR = new Float32Array(64);
  }

  get cy() { return this.y - 22; }
  get mouthPos() { return [this.x, this.cy + 12]; }

  ai(dt, players, api) {
    let tgt = null, best = 1e9;
    for (const p of players) {
      if (p.dead) continue;
      const d = Math.hypot(p.x - this.x, p.y - this.cy);
      if (d < best) { best = d; tgt = p; }
    }
    if (!tgt) {
      this.state = 'flee';
      this.vy -= 400 * dt;
      this.y += this.vy * dt;
      if (this.y < -400) this.gone = true;
      return;
    }
    if (this.phase === 1 && this.hp < this.maxHp / 2) {
      this.phase = 2; this.state = 'roar'; this.stT = 1.3;
      api.banner('O Abominável está furioso!');
      api.shake(1);
    }
    const spd = this.phase === 2 ? 1.35 : 1;
    this.stT -= dt;
    const tx = tgt.x - this.x, ty = tgt.y - 16 - this.cy, td = Math.hypot(tx, ty) || 1;
    const steer = (gx, gy, k) => {
      this.vx += ((gx - this.x) * 2.2 - this.vx) * Math.min(1, dt * k);
      this.vy += ((gy - this.cy) * 2.2 - this.vy) * Math.min(1, dt * k);
    };
    switch (this.state) {
      case 'hover':
        steer(tgt.x + Math.sin(this.t * 0.9) * 110, tgt.y - 140, 2 * spd);
        if (this.stT <= 0) {
          const r = Math.random();
          if (r < 0.42) { this.state = 'windup'; this.stT = 0.75 / spd; }
          else if (r < 0.78 || this.phase === 1) { this.state = 'spit'; this.stT = 1.2; this.spitLeft = this.phase === 2 ? 6 : 3; this.spitT = 0.3; }
          else { this.state = 'summon'; this.stT = 1; api.summon(this.x - 30, this.cy); api.summon(this.x + 30, this.cy); }
        }
        break;
      case 'windup': // antecipação: recua e treme antes da investida
        this.vx *= 1 - Math.min(1, dt * 5);
        this.vy += ((-ty / td) * 60 - this.vy) * Math.min(1, dt * 4);
        if (this.stT <= 0) {
          this.vx = (tx / td) * 500 * spd;
          this.vy = (ty / td) * 500 * spd;
          this.state = 'charge'; this.stT = 0.75;
          api.shake(0.4);
        }
        break;
      case 'charge':
        if (this.phase === 2) { this.vx += (tx / td) * 320 * dt; this.vy += (ty / td) * 320 * dt; }
        if (this.stT <= 0) { this.state = 'recover'; this.stT = 0.6; }
        break;
      case 'recover':
        this.vx *= 1 - Math.min(1, dt * 3);
        this.vy *= 1 - Math.min(1, dt * 3);
        if (this.stT <= 0) { this.state = 'hover'; this.stT = (1.6 + Math.random()) / spd; }
        break;
      case 'spit':
        steer(tgt.x + Math.sin(this.t) * 60, tgt.y - 150, 2);
        this.spitT -= dt;
        if (this.spitT <= 0 && this.spitLeft > 0) {
          this.spitLeft--;
          this.spitT = 0.2;
          const a = Math.atan2(ty, tx) + (Math.random() - 0.5) * 0.5, s = 230 + Math.random() * 60;
          const [mx, my] = this.mouthPos;
          api.spit(mx, my, Math.cos(a) * s, Math.sin(a) * s - 60);
        }
        if (this.spitLeft <= 0 && this.stT <= 0) { this.state = 'hover'; this.stT = 1.4 / spd; }
        break;
      default: // summon / roar
        this.vx *= 1 - Math.min(1, dt * 4);
        this.vy *= 1 - Math.min(1, dt * 4);
        if (this.stT <= 0) { this.state = 'hover'; this.stT = 1.2; }
    }
    this.face = tx >= 0 ? 1 : -1;
  }

  phys(world, dt) { // atravessa blocos, como os chefes voadores do gênero
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  damage(dmg, dir, kb) {
    this.hp -= dmg;
    this.hurtT = 0.1;
    this.hpShow = 3;
    this.vx += dir * kb * 0.08;
    return this.hp <= 0;
  }

  animate(dt) {
    super.animate(dt);
    const open = this.state === 'spit' || this.state === 'windup' || this.state === 'roar' || this.state === 'summon';
    this.mouth += ((open ? 1 : 0.2) - this.mouth) * Math.min(1, dt * 6);
    const lidT = this.state === 'windup' || this.phase === 2 ? 0.42 : 0.15;
    this.lid += (lidT - this.lid) * Math.min(1, dt * 6);
    this.tentacles.forEach((ch, k) => {
      const ax = this.x + (k - 2) * 7, ay = this.cy + 19 - Math.abs(k - 2);
      ch[0].x = ch[0].px = ax;
      ch[0].y = ch[0].py = ay;
      const dt2 = dt * dt;
      for (let i = 1; i < ch.length; i++) {
        const p = ch[i];
        const vx = (p.x - p.px) * 0.9, vy = (p.y - p.py) * 0.9;
        p.px = p.x; p.py = p.y;
        p.x += vx + Math.sin(this.t * 4 + k * 1.7 + i * 0.6) * 300 * dt2;
        p.y += vy + 320 * dt2;
      }
      for (let it = 0; it < 3; it++)
        for (let i = 1; i < ch.length; i++) {
          const a = ch[i - 1], b = ch[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
          if (d > 3.5) { b.x = a.x + (dx / d) * 3.5; b.y = a.y + (dy / d) * 3.5; }
        }
    });
  }

  follow(dt) {
    super.follow(dt);
    if (this.netState !== undefined) this.state = STATES[this.netState] || 'hover';
    if (this.netPhase) this.phase = this.netPhase;
  }

  pack() {
    const a = super.pack();
    a.push(STATES.indexOf(this.state), this.phase);
    return a;
  }

  lookAt(players) {
    let best = null, bd = 1e9;
    for (const p of players) {
      if (p.dead) continue;
      const d = Math.hypot(p.x - this.x, p.y - this.cy);
      if (d < bd) { bd = d; best = p; }
    }
    if (!best) return;
    const dx = best.x - this.x, dy = best.y - 16 - this.cy, d = Math.hypot(dx, dy) || 1;
    this.look[0] += (dx / d - this.look[0]) * 0.2;
    this.look[1] += (dy / d - this.look[1]) * 0.2;
  }

  render() {
    const p = this.px, t = this.t;
    p.d.fill(0);
    const cx = this.D.ox, cy = this.D.oy - 22, R = this.phase === 2 ? 25 : 24;
    const sh = this.state === 'windup' || this.state === 'roar' ? Math.round(Math.sin(t * 60)) : 0;
    const bodyR = this.bodyR;
    for (let k = 0; k < 64; k++) {
      const a = (k / 64) * Math.PI * 2;
      bodyR[k] = R + Math.sin(a * 3 + t * 2.1) * 2.2 + Math.sin(a * 5 - t * 3.3) * 1.4 + (noise2(k * 0.4, 3, 17) - 0.5) * 5;
    }
    const inBody = (x, y) => {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const k = ((Math.round((Math.atan2(dy, dx) / (Math.PI * 2)) * 64) % 64) + 64) % 64;
      const d = Math.hypot(dx, dy);
      return d <= bodyR[k] ? bodyR[k] - d : -1;
    };
    const set = (x, y, c) => p.set(x + sh, y, c);
    // corpo de carne com manchas
    for (let y = 0; y < p.h; y++)
      for (let x = 0; x < p.w; x++) {
        const edge = inBody(x, y);
        if (edge < 0) continue;
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        const l = (-dx * 0.5 - dy * 0.8) / R + (noise2(x * 0.3, y * 0.3, 7) - 0.5) * 0.6;
        let c = l > 0.5 ? 4 : l > 0.15 ? 3 : l > -0.3 ? 2 : l > -0.65 ? 1 : 0;
        if (edge < 1.5) c = Math.min(c, 1);
        if (hash2(x, y, 5) < 0.06) c = Math.max(0, c - 1);
        set(x, y, FLESH[c]);
      }
    // veias latejando
    const pulse = Math.sin(t * (this.phase === 2 ? 9 : 5)) > 0;
    for (const v of this.veins)
      for (const [vx, vy] of v) {
        const x = Math.round(cx + vx), y = Math.round(cy + vy);
        if (inBody(x, y) > 1) set(x, y, pulse ? [128, 22, 44] : [88, 16, 34]);
      }
    // pústulas
    for (const [a, d, s] of this.pustules) {
      const px = Math.round(cx + Math.cos(a + t * 0.1) * d), py = Math.round(cy + Math.sin(a + t * 0.1) * d);
      const sz = s + (Math.sin(t * 3 + a * 5) > 0.6 ? 1 : 0);
      for (let yy = -sz; yy <= sz; yy++)
        for (let xx = -sz; xx <= sz; xx++)
          if (xx * xx + yy * yy <= sz * sz + 0.5 && inBody(px + xx, py + yy) > 0) set(px + xx, py + yy, SICK[yy < 0 ? 3 : 2]);
      if (inBody(px - 1, py - sz) > 0) set(px - 1, py - sz, SICK[4]);
    }
    // boca com dentes tortos (alguns faltando)
    const mw = 22, mh = Math.round(3 + this.mouth * 8), my = cy + 9;
    for (let y = 0; y < mh; y++)
      for (let x = -mw / 2; x < mw / 2; x++) {
        const nx = x / (mw / 2), ny = (y - mh / 2) / (mh / 2 + 0.01);
        if (nx * nx + ny * ny * 0.8 > 1 + Math.sin(x * 1.7) * 0.08) continue;
        set(cx + x, my + y, y > mh - 3 && this.mouth > 0.5 ? [150, 40, 60] : [34, 8, 16]);
      }
    for (let x = -mw / 2 + 2; x < mw / 2 - 1; x += 3) {
      if (hash2(x, 2, 23) < 0.2) continue;
      const len = 2 + ((hash2(x, 1, 23) * 3) | 0), bend = hash2(x, 3, 23) < 0.4 ? 1 : 0;
      for (let k = 0; k < len; k++) {
        set(cx + x + (k === len - 1 ? bend : 0), my + k, BONE[k === 0 ? 3 : 2]);
        if (this.mouth > 0.4 && k < len - 1) set(cx + x + 1, my + mh - 1 - k, BONE[1]);
      }
    }
    // olho gigante com vasinhos, seguindo o jogador
    const er = this.phase === 2 ? 10 : 9, ex = cx + Math.round(this.look[0] * 3), ey = cy - 7 + Math.round(this.look[1] * 2);
    for (let y = -er; y <= er; y++)
      for (let x = -er; x <= er; x++) {
        const d = Math.hypot(x, y);
        if (d > er) continue;
        let c = d > er - 1.2 ? [150, 130, 100] : y > er * 0.4 ? [200, 188, 150] : [236, 226, 190];
        if (d > er * 0.55 && hash2(Math.round(Math.atan2(y, x) * 5), Math.round(d), 11) < 0.14) c = [200, 40, 50];
        set(ex + x, ey + y, c);
      }
    const ir = 4, ix = ex + Math.round(this.look[0] * 4), iy = ey + Math.round(this.look[1] * 3);
    const iris = this.phase === 2 ? IRIS2 : IRIS1;
    for (let y = -ir; y <= ir; y++)
      for (let x = -ir; x <= ir; x++) if (x * x + y * y <= ir * ir + 1) set(ix + x, iy + y, iris[x + y < -1 ? 3 : x + y > 2 ? 1 : 2]);
    const pw = this.state === 'windup' ? 1 : 0; // pupila dilata na antecipação
    for (let y = -3; y <= 3; y++) for (let x = -pw; x <= pw; x++) set(ix + x, iy + y, [16, 6, 12]);
    set(ix - 2, iy - 2, [255, 255, 255]);
    // pálpebra carnuda (fica mais baixa quando furioso)
    const lidRows = this.blink < 0 ? er * 2 + 2 : Math.round(this.lid * er * 2);
    for (let y = -er - 1; y < -er - 1 + lidRows; y++)
      for (let x = -er - 1; x <= er + 1; x++)
        if (Math.hypot(x, y) <= er + 1) set(ex + x, ey + y, FLESH[y === -er - 2 + lidRows ? 1 : 2]);
    // olhinho extra torto, olhando para outro lado
    const sx = cx - 15, sy = cy - 12;
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 9) set(sx + x, sy + y, [226, 214, 176]);
    set(sx + 1, sy + 1, [30, 10, 20]); set(sx + 2, sy + 1, [200, 40, 50]);
    selOut(p, 0.3);
    if (this.hurtT > 0) for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3]) { p.d[i] = 255; p.d[i + 1] = 235; p.d[i + 2] = 235; }
    this.img.data.set(p.d);
    this.ctx.putImageData(this.img, 0, 0);
  }

  draw(ctx) {
    // tentáculos atrás do corpo, afinando até a ponta, com ventosas
    for (const ch of this.tentacles)
      for (let i = 0; i < ch.length - 1; i++) {
        const a = ch[i], b = ch[i + 1], th = Math.max(1, 4 - (i >> 1));
        const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)));
        for (let k = 0; k <= n; k++) {
          const x = Math.round(a.x + ((b.x - a.x) * k) / n), y = Math.round(a.y + ((b.y - a.y) * k) / n);
          ctx.fillStyle = `rgb(${FLESH[0]})`;
          ctx.fillRect(x - (th >> 1) - 1, y, th + 2, 1);
          ctx.fillStyle = `rgb(${FLESH[i % 2 ? 1 : 2]})`;
          ctx.fillRect(x - (th >> 1), y, th, 1);
        }
        if (i % 2 === 0 && th > 1) { ctx.fillStyle = `rgb(${FLESH[4]})`; ctx.fillRect(Math.round(b.x), Math.round(b.y), 1, 1); }
      }
    this.render();
    ctx.drawImage(this.canvas, Math.round(this.x) - this.D.ox, Math.round(this.y) - this.D.oy);
  }
}

const baseMake = factory.make;
factory.make = (id, type, x, y, variant) => (type === 'boss' ? new Boss(id, x, y) : baseMake(id, type, x, y, variant));
