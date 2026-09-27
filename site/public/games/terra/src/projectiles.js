// Projéteis: flecha (gravidade, crava no bloco), orbe de cristal (teleguiado) e ácido do boss (hostil)
export class Projectiles {
  constructor() {
    this.list = [];
  }

  spawn(p) {
    p.t = 0;
    p.life ??= p.kind === 'arrow' ? 4 : p.kind === 'bolt' ? 1.8 : 3;
    p.dir = [p.vx, p.vy];
    this.list.push(p);
  }

  // hooks: { enemies, player, onHitEnemy(e, p), onHitPlayer(p), particles }
  update(dt, world, h) {
    const L = this.list;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i];
      p.t += dt;
      p.life -= dt;
      if (p.life <= 0) { L.splice(i, 1); continue; }
      if (p.stuck) continue;
      if (p.kind === 'arrow') p.vy += 520 * dt;
      else if (p.kind === 'acid') p.vy += 300 * dt;
      else if (p.kind === 'bolt') {
        // teleguiado: gira a velocidade na direção do inimigo mais próximo
        let tgt = null, best = 170;
        for (const e of h.enemies) { const d = Math.hypot(e.x - p.x, e.y - e.h / 2 - p.y); if (d < best) { best = d; tgt = e; } }
        const sp = Math.hypot(p.vx, p.vy) || 1;
        if (tgt) {
          const want = Math.atan2(tgt.y - tgt.h / 2 - p.y, tgt.x - p.x), cur = Math.atan2(p.vy, p.vx);
          let da = want - cur;
          while (da > Math.PI) da -= Math.PI * 2;
          while (da < -Math.PI) da += Math.PI * 2;
          const a = cur + Math.max(-6 * dt, Math.min(6 * dt, da));
          p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
        }
        if (Math.random() < 0.8)
          h.particles.add({ kind: 2, glow: true, x: p.x, y: p.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, life: 0.3, color: Math.random() < 0.5 ? '#8aeeff' : '#e8ffff', grav: 0, collide: false });
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (Math.abs(p.vx) + Math.abs(p.vy) > 1) p.dir = [p.vx, p.vy];
      if (world.solidAt(p.x, p.y)) {
        if (p.kind === 'arrow') { p.stuck = true; p.life = Math.min(p.life, 3); p.x -= p.vx * dt * 0.5; p.y -= p.vy * dt * 0.5; continue; }
        this.splash(h.particles, p);
        L.splice(i, 1);
        continue;
      }
      if (p.hostile) {
        const pl = h.player;
        if (!pl.dead && Math.abs(p.x - pl.x) < pl.w / 2 + 2 && p.y > pl.y - pl.h - 2 && p.y < pl.y + 2) {
          h.onHitPlayer(p);
          this.splash(h.particles, p);
          L.splice(i, 1);
        }
      } else if (p.local) {
        for (const e of h.enemies) {
          if (Math.abs(p.x - e.x) < e.w / 2 + 3 && p.y > e.y - e.h - 3 && p.y < e.y + 3) {
            h.onHitEnemy(e, p);
            this.splash(h.particles, p);
            L.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  splash(particles, p) {
    const col = p.kind === 'acid' ? ['#9ad04a', '#d8f080'] : p.kind === 'bolt' ? ['#8aeeff', '#ffffff'] : ['#a7743e', '#d8dce8'];
    for (let k = 0; k < 8; k++)
      particles.add({ kind: p.kind === 'arrow' ? 0 : 2, glow: p.kind !== 'arrow', x: p.x, y: p.y, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 140, life: 0.4 + Math.random() * 0.3, color: col[k % 2], grav: 500 });
  }

  draw(ctx) {
    for (const p of this.list) {
      if (p.kind === 'arrow') {
        const d = Math.hypot(p.dir[0], p.dir[1]) || 1, ux = p.dir[0] / d, uy = p.dir[1] / d;
        ctx.globalAlpha = Math.min(1, p.life);
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = i < 2 ? '#dfe4ee' : i < 7 ? '#8a5a34' : i === 7 ? '#f0f0f0' : '#e04848';
          ctx.fillRect(Math.round(p.x - ux * i), Math.round(p.y - uy * i), 1, 1);
        }
        ctx.globalAlpha = 1;
      } else if (p.kind === 'acid') {
        const x = Math.round(p.x), y = Math.round(p.y);
        ctx.fillStyle = '#3a5a18'; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2, 3, 5);
        ctx.fillStyle = '#9ad04a'; ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.fillStyle = '#e0f8a0'; ctx.fillRect(x - 1, y - 1, 1, 1);
      }
    }
  }

  drawGlow(ctx) {
    for (const p of this.list) {
      if (p.kind === 'bolt') {
        const x = Math.round(p.x), y = Math.round(p.y);
        ctx.fillStyle = 'rgba(90,200,255,0.35)'; ctx.fillRect(x - 3, y - 3, 7, 7);
        ctx.fillStyle = '#8aeeff'; ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, 1, 1);
      } else if (p.kind === 'acid') {
        ctx.fillStyle = 'rgba(150,220,60,0.25)';
        ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 7, 7);
      }
    }
  }
}
