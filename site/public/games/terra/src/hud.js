// HUD em pixel art: corações, barra do chefe, chat, avisos, nomes, balões e números de dano
import { drawText, textWidth, wrap, LINE } from './font.js';

const HEART = ['.11.11.', '1111111', '1111111', '.11111.', '..111..', '...1...'];

function heart(ctx, x, y, fill, beat) {
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 7; c++) {
      if (HEART[r][c] !== '1') continue;
      const filled = c < Math.round(fill * 7);
      ctx.fillStyle = filled ? (r === 1 && c < 3 ? '#ff9aa0' : r > 3 ? '#a8203a' : '#e8384a') : 'rgba(40,20,40,0.8)';
      ctx.fillRect(x + c, y + r - beat, 1, 1);
    }
}

export function drawHearts(ctx, VW, hp, maxHp, defense, time, y0 = 8) {
  const n = maxHp / 10, x0 = VW - n * 9 - 6;
  const low = hp / maxHp < 0.3;
  for (let i = 0; i < n; i++) {
    const f = Math.max(0, Math.min(1, (hp - i * 10) / 10));
    const beat = low && Math.sin(time * 9 - i * 0.4) > 0.7 ? 1 : 0;
    heart(ctx, x0 + i * 9, y0, f, beat);
  }
  const s = `${Math.ceil(hp)}/${maxHp}`;
  drawText(ctx, s, VW - 6 - textWidth(s), y0 + 9, low ? '#ff8a8a' : '#f0e0e8');
  if (defense) {
    const sx = x0 - 16;
    ctx.fillStyle = '#6aa6ec'; ctx.fillRect(sx, y0, 7, 5); ctx.fillRect(sx + 1, y0 + 5, 5, 2); ctx.fillRect(sx + 2, y0 + 7, 3, 1);
    ctx.fillStyle = '#b8dcff'; ctx.fillRect(sx + 1, y0 + 1, 2, 3);
    drawText(ctx, String(defense), sx + 2 - (defense > 9 ? 2 : 0), y0 + 10, '#cfe6ff');
  }
}

export function drawBossBar(ctx, VW, VH, boss, time) {
  const w = Math.min(280, VW - 60), x = Math.round((VW - w) / 2), y = VH - 22;
  const k = Math.max(0, boss.hp / boss.maxHp);
  const name = boss.D.name + (boss.phase === 2 ? ' - FÚRIA' : '');
  drawText(ctx, name, Math.round(VW / 2 - textWidth(name.toUpperCase()) / 2), y - 9, boss.phase === 2 ? '#ff6a6a' : '#f0d0e0');
  ctx.fillStyle = '#140a14'; ctx.fillRect(x - 2, y - 2, w + 4, 10);
  ctx.fillStyle = '#5a2a3e'; ctx.fillRect(x - 1, y - 1, w + 2, 8);
  ctx.fillStyle = '#2a1020'; ctx.fillRect(x, y, w, 6);
  const fw = Math.round(w * k);
  ctx.fillStyle = boss.phase === 2 ? '#d02838' : '#a83a70'; ctx.fillRect(x, y, fw, 6);
  ctx.fillStyle = boss.phase === 2 ? '#ff7070' : '#e070a8'; ctx.fillRect(x, y, fw, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (let i = 1; i < 10; i++) ctx.fillRect(x + Math.round((w * i) / 10), y, 1, 6);
  if (boss.hurtT > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x, y, fw, 6); }
}

export function drawBanner(ctx, VW, VH, banner) {
  if (!banner || banner.t <= 0) return;
  const a = Math.min(1, banner.t / 0.5, (banner.max - banner.t) / 0.3 + 0.001);
  ctx.globalAlpha = Math.max(0, a);
  const s = banner.text.toUpperCase(), sc = 2;
  drawText(ctx, s, Math.round(VW / 2 - textWidth(s, sc) / 2), Math.round(VH * 0.28), banner.col || '#ffd0d8', sc);
  ctx.globalAlpha = 1;
}

export function drawChat(ctx, VW, VH, log, time, open) {
  let y = VH - 16 - (open ? 14 : 0);
  for (let i = log.length - 1; i >= 0 && y > VH * 0.45; i--) {
    const m = log[i], age = time - m.t;
    if (!open && age > 12) continue;
    ctx.globalAlpha = open ? 1 : Math.min(1, (12 - age) / 2);
    const lines = wrap(m.name ? `${m.name}: ${m.text}` : m.text, Math.floor((VW * 0.45) / 4));
    for (let j = lines.length - 1; j >= 0; j--) {
      ctx.fillStyle = 'rgba(10,8,20,0.45)';
      ctx.fillRect(6, y - 1, textWidth(lines[j].toUpperCase()) + 4, LINE);
      drawText(ctx, lines[j], 8, y, m.col || '#e8e2f5');
      y -= LINE;
    }
  }
  ctx.globalAlpha = 1;
}

export function drawNameTag(ctx, x, y, name, col = '#ffffff') {
  const s = name.toUpperCase();
  drawText(ctx, s, Math.round(x - textWidth(s) / 2), y, col);
}

export function drawBubble(ctx, x, y, text, alpha) {
  const lines = wrap(text, 22);
  const w = Math.max(...lines.map((l) => textWidth(l.toUpperCase()))) + 8, h = lines.length * LINE + 5;
  const bx = Math.round(x - w / 2), by = Math.round(y - h);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#f4f0ff'; ctx.fillRect(bx + 1, by, w - 2, h); ctx.fillRect(bx, by + 1, w, h - 2);
  ctx.fillRect(Math.round(x) - 1, by + h, 3, 1); ctx.fillRect(Math.round(x), by + h + 1, 1, 1);
  lines.forEach((l, i) => drawText(ctx, l, bx + 4, by + 3 + i * LINE, '#2a2040', 1, null));
  ctx.globalAlpha = 1;
}

// números de dano / cura flutuando
export class FloatTexts {
  constructor() { this.list = []; }
  add(x, y, text, col = '#fff', sc = 1) {
    this.list.push({ x: x + (Math.random() - 0.5) * 8, y, vy: -70, text: String(text), col, sc, t: 0, life: 0.9 });
  }
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const f = this.list[i];
      f.t += dt;
      f.y += f.vy * dt;
      f.vy *= 1 - Math.min(1, dt * 4);
      if (f.t > f.life) this.list.splice(i, 1);
    }
  }
  draw(ctx) {
    for (const f of this.list) {
      const pop = f.t < 0.08 ? 1 : 0; // "pop" no primeiro instante
      ctx.globalAlpha = Math.min(1, (f.life - f.t) / 0.3);
      const s = f.text.toUpperCase(), sc = f.sc + pop;
      drawText(ctx, s, Math.round(f.x - textWidth(s, sc) / 2), Math.round(f.y), f.col, sc);
    }
    ctx.globalAlpha = 1;
  }
}

export function drawCursor(ctx, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  ctx.fillStyle = '#140c1e';
  ctx.fillRect(x - 4, y - 1, 9, 3);
  ctx.fillRect(x - 1, y - 4, 3, 9);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 3, y, 7, 1);
  ctx.fillRect(x, y - 3, 1, 7);
}
