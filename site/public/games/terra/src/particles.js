// Partículas com física simples e colisão com o mundo
// kind: 0 lasca/poeira, 1 folha, 2 faísca (brilho), 3 nuvem de poeira, 4 vagalume, 5 partícula no ar
export class Particles {
  constructor() {
    this.list = [];
  }

  add(p) {
    if (this.list.length > 3000) return;
    p.t = 0;
    p.max = p.life;
    p.size ??= 1;
    p.grav ??= 600;
    p.bounce ??= 0.4;
    p.kind ??= 0;
    p.collide ??= true;
    p.seed = Math.random() * 100;
    this.list.push(p);
  }

  // "desintegração": cada pixel do sprite vira uma partícula com física
  burstFrom(px, x0, y0, flip, power = 1, step = 2) {
    const cx = px.w / 2, cy = px.h / 2;
    for (let y = 0; y < px.h; y += step)
      for (let x = (y / step) & 1; x < px.w; x += step) {
        const i = (y * px.w + x) * 4;
        if (px.d[i + 3] < 100) continue;
        const wx = flip ? x0 + (px.w - 1 - x) : x0 + x;
        const dx = (flip ? cx - x : x - cx) / cx, dy = (y - cy) / cy;
        this.add({
          x: wx, y: y0 + y, vx: dx * 120 * power + (Math.random() - 0.5) * 60, vy: dy * 80 * power - 80 - Math.random() * 120 * power,
          life: 0.7 + Math.random() * 0.9, color: `rgb(${px.d[i]},${px.d[i + 1]},${px.d[i + 2]})`, size: step > 2 ? 2 : 1, bounce: 0.35, grav: 600,
        });
      }
  }

  count(kind) {
    let n = 0;
    for (const p of this.list) if (p.kind === kind) n++;
    return n;
  }

  update(dt, world, wind) {
    const L = this.list;
    const k2 = Math.min(1, dt * 2.5), k3 = Math.min(1, dt * 3), k4 = Math.min(1, dt * 4);
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.t += dt;
      p.life -= dt;
      if (p.life <= 0) { L[i] = L[L.length - 1]; L.pop(); continue; }
      switch (p.kind) {
        case 1: // folha: balança e plana ao vento
          if (!p.rest) {
            p.vx += (wind * 50 + Math.sin(p.t * 3 + p.seed) * 45 - p.vx) * k2;
            p.vy += (32 + Math.sin(p.t * 5 + p.seed) * 26 - p.vy) * k3;
          }
          break;
        case 3:
          p.vx *= 1 - k4; p.vy *= 1 - k4; p.vy -= 10 * dt;
          break;
        case 4:
          p.vx += (Math.sin(p.t * 1.3 + p.seed) * 20 - p.vx) * dt;
          p.vy += (Math.cos(p.t * 1.7 + p.seed * 2) * 14 - p.vy) * dt;
          break;
        case 5:
          p.vx += (wind * 6 - p.vx) * dt;
          p.vy += (Math.sin(p.t + p.seed) * 3 - p.vy) * dt;
          break;
        default:
          p.vy += p.grav * dt;
          if (p.drag) { p.vx *= 1 - Math.min(1, p.drag * dt); p.vy *= 1 - Math.min(1, p.drag * dt); }
      }
      if (p.rest) continue;
      let nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
      if (p.collide) {
        if (world.solidAt(nx, p.y)) { p.vx = -p.vx * p.bounce; nx = p.x; }
        if (world.solidAt(nx, ny)) {
          if (p.kind === 1) { p.rest = true; p.life = Math.min(p.life, 1.5); }
          p.vy = -p.vy * p.bounce;
          p.vx *= 0.7;
          ny = p.y;
        }
      }
      p.x = nx;
      p.y = ny;
    }
  }

  draw(ctx, glow) {
    for (const p of this.list) {
      if (!!p.glow !== glow) continue;
      const fade = Math.min(1, p.life / Math.min(0.4, p.max * 0.5));
      const x = Math.round(p.x), y = Math.round(p.y);
      ctx.fillStyle = p.color;
      switch (p.kind) {
        case 1: {
          ctx.globalAlpha = fade;
          const flip = Math.sin(p.t * 7 + p.seed) > 0;
          ctx.fillRect(x, y, flip ? 2 : 1, flip ? 1 : 2);
          break;
        }
        case 2:
          ctx.globalAlpha = fade * 0.5;
          ctx.fillRect(Math.round(p.x - p.vx * 0.025), Math.round(p.y - p.vy * 0.025), 1, 1);
          ctx.globalAlpha = fade;
          ctx.fillRect(x, y, 1, 1);
          break;
        case 3: {
          const s = Math.round(1 + (1 - p.life / p.max) * 2.5);
          ctx.globalAlpha = fade * 0.55;
          ctx.fillRect(x - (s >> 1), y - (s >> 1), s, s);
          break;
        }
        case 4: {
          const b = 0.5 + 0.5 * Math.sin(p.t * 3 + p.seed);
          ctx.globalAlpha = fade * b * 0.25;
          ctx.fillRect(x - 1, y - 1, 3, 3);
          ctx.globalAlpha = fade * b;
          ctx.fillRect(x, y, 1, 1);
          break;
        }
        case 5:
          ctx.globalAlpha = fade * 0.5;
          ctx.fillRect(x, y, 1, 1);
          break;
        default:
          ctx.globalAlpha = fade;
          ctx.fillRect(x, y, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }
}
