// Céu com degradê pontilhado (dithering Bayer), sol/lua, estrelas, nuvens e
// 3 camadas de parallax com perspectiva atmosférica que mudam de cor com o horário.
import { fbm2, rng } from './noise.js';
import { hex, mixc, rgb, Px } from './art.js';

const N = 2048;
const BAYER = [0.125, 0.625, 0.875, 0.375];

function periodic(seed, freq, oct) {
  const a = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2;
    a[i] = fbm2(Math.cos(ang) * freq + 50, Math.sin(ang) * freq + 50, seed, oct);
  }
  return a;
}
function mountains(seed, freq, amp) {
  const b = periodic(seed, freq, 5), a = new Float32Array(N);
  for (let i = 0; i < N; i++) a[i] = Math.max(0, b[i] - 0.3) * amp * 2.6;
  return a;
}
function forest(seed) {
  const b = periodic(seed, 4, 3), a = new Float32Array(N), r = rng(seed);
  for (let i = 0; i < N; i++) a[i] = Math.max(0, b[i] - 0.35) * 70;
  for (let i = 0; i < N; ) {
    const th = 10 + r() * 18, slope = 2 + r() * 0.8;
    const half = Math.ceil(th / slope);
    for (let k = -half; k <= half; k++) {
      const j = (i + k + N) % N;
      const hill = Math.max(0, b[(i + N) % N] - 0.35) * 70;
      a[j] = Math.max(a[j], hill + th - Math.abs(k) * slope - ((Math.abs(k) & 1) && Math.abs(k) > 1 ? 1 : 0));
    }
    i += 4 + Math.floor(r() * 8);
  }
  return a;
}

function makeCloud(r) {
  const w = 50 + Math.floor(r() * 50), h = 18 + Math.floor(r() * 10), p = new Px(w, h);
  const blobs = [];
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const rad = 5 + r() * (h * 0.45);
    blobs.push([8 + (i / (n - 1)) * (w - 16) + (r() - 0.5) * 6, h - 3 - rad * 0.7, rad]);
  }
  const lit = hex('#ffffff'), mid = hex('#e6ecf7'), sh = hex('#bcc8de');
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let inside = null;
      for (const b of blobs) if ((x - b[0]) ** 2 + (y - b[1]) ** 2 < b[2] * b[2] && y < h - 2) { inside = b; break; }
      if (!inside) continue;
      const dy = (y - inside[1]) / inside[2];
      p.set(x, y, dy < -0.35 ? lit : y > h - 6 ? sh : mid);
    }
  return p.toCanvas();
}

export class Background {
  constructor(seed) {
    this.layers = [
      { par: 0.06, off: -30, h: mountains(seed + 10, 3, 120), day: hex('#a2bde0'), night: hex('#1a2140'), dusk: hex('#c68aa6'), snow: true },
      { par: 0.16, off: 20, h: mountains(seed + 11, 5, 80), day: hex('#6f93b8'), night: hex('#141a33'), dusk: hex('#8f6488') },
      { par: 0.3, off: 60, h: forest(seed + 12), day: hex('#3a6666'), night: hex('#0c1224'), dusk: hex('#4e3f63') },
    ];
    const r = rng(seed + 99);
    this.stars = Array.from({ length: 200 }, () => ({ x: r() * 3000, y: r() * 0.75, b: r(), tw: r() * 6 }));
    this.clouds = Array.from({ length: 8 }, () => {
      const base = makeCloud(r);
      const tint = document.createElement('canvas');
      tint.width = base.width; tint.height = base.height;
      return { base, tint, x: r() * 3000, y: 0.05 + r() * 0.3, speed: 3 + r() * 7, par: 0.03 + r() * 0.08 };
    });
    this.tintT = -1;
    this.skyC = document.createElement('canvas');
    this.skyC.width = 2;
    this.skyX = this.skyC.getContext('2d');
  }

  colors(env) {
    const { day, dusk } = env;
    const top = mixc(mixc(hex('#070a1c'), hex('#4a86d8'), day), hex('#3a3a78'), dusk * 0.7);
    const bot = mixc(mixc(hex('#1c2448'), hex('#b6e0f5'), day), hex('#f59a62'), dusk * 0.85);
    return { top, bot };
  }

  drawSky(ctx, VW, VH, top, bot) {
    if (this.skyC.height !== VH) {
      this.skyC.height = VH;
      this.skyImg = this.skyX.createImageData(2, VH);
    }
    const d = this.skyImg.data, BANDS = 16;
    for (let y = 0; y < VH; y++) {
      const f = Math.pow(y / (VH - 1), 0.85) * (BANDS - 1), b0 = Math.floor(f), fr = f - b0;
      for (let x = 0; x < 2; x++) {
        const band = fr > BAYER[(y & 1) * 2 + x] ? b0 + 1 : b0;
        const c = mixc(top, bot, band / (BANDS - 1)), o = (y * 2 + x) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    this.skyX.putImageData(this.skyImg, 0, 0);
    ctx.fillStyle = ctx.createPattern(this.skyC, 'repeat');
    ctx.fillRect(0, 0, VW, VH);
  }

  disc(ctx, cx, cy, r, col) {
    ctx.fillStyle = col;
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(r * r - dy * dy));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2, 1);
    }
  }

  draw(ctx, VW, VH, camX, camY, env, refY, time, dt) {
    const { top, bot } = this.colors(env);
    this.drawSky(ctx, VW, VH, top, bot);

    // estrelas
    const starA = Math.max(0, 1 - env.day * 1.6);
    if (starA > 0.01) {
      for (const s of this.stars) {
        const x = Math.round((((s.x - camX * 0.01) % 3000) + 3000) % 3000);
        if (x >= VW) continue;
        const y = Math.round(s.y * VH);
        const a = starA * (0.4 + 0.6 * s.b) * (0.6 + 0.4 * Math.sin(time * 2 + s.tw));
        ctx.fillStyle = `rgba(255,250,235,${a})`;
        ctx.fillRect(x, y, 1, 1);
        if (s.b > 0.93) {
          ctx.fillStyle = `rgba(255,250,235,${a * 0.4})`;
          ctx.fillRect(x - 1, y, 3, 1);
          ctx.fillRect(x, y - 1, 1, 3);
        }
      }
    }

    // sol e lua
    const horizon = VH * 0.72;
    const ang = (env.t - 0.25) * Math.PI * 2;
    const sx = VW * 0.5 - Math.cos(ang) * VW * 0.42, sy = horizon - Math.sin(ang) * VH * 0.62;
    if (Math.sin(ang) > -0.25) {
      ctx.globalAlpha = 0.08; this.disc(ctx, sx, sy, 26, '#fff2c0');
      ctx.globalAlpha = 0.12; this.disc(ctx, sx, sy, 17, '#fff2c0');
      ctx.globalAlpha = 1;
      this.disc(ctx, sx, sy, 10, env.dusk > 0.4 ? '#ffd08a' : '#fff6d6');
      this.disc(ctx, sx - 2, sy - 2, 6, '#ffffff');
    }
    const mx = VW * 0.5 + Math.cos(ang) * VW * 0.42, my = horizon + Math.sin(ang) * VH * 0.62;
    if (-Math.sin(ang) > -0.25) {
      ctx.globalAlpha = 0.1; this.disc(ctx, mx, my, 16, '#cfe0ff');
      ctx.globalAlpha = 1;
      this.disc(ctx, mx, my, 8, '#e6ecf8');
      ctx.fillStyle = '#b4bfd8';
      ctx.fillRect(Math.round(mx - 3), Math.round(my - 2), 2, 2);
      ctx.fillRect(Math.round(mx + 2), Math.round(my + 1), 3, 2);
      ctx.fillRect(Math.round(mx - 1), Math.round(my + 4), 2, 1);
    }

    // nuvens (re-tingidas conforme o horário)
    if (time - this.tintT > 0.25) {
      this.tintT = time;
      const tc = mixc(mixc(hex('#2a3152'), hex('#ffffff'), env.day), hex('#ffb495'), env.dusk * 0.6);
      for (const c of this.clouds) {
        const t = c.tint.getContext('2d');
        t.globalCompositeOperation = 'source-over';
        t.clearRect(0, 0, c.tint.width, c.tint.height);
        t.drawImage(c.base, 0, 0);
        t.globalCompositeOperation = 'multiply';
        t.fillStyle = rgb(tc);
        t.fillRect(0, 0, c.tint.width, c.tint.height);
        t.globalCompositeOperation = 'destination-in';
        t.drawImage(c.base, 0, 0);
      }
    }
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      const span = VW + 400;
      const x = Math.round((((c.x - camX * c.par) % span) + span) % span) - 200;
      const y = Math.round(c.y * VH + (refY - camY - VH * 0.5) * c.par * 0.5);
      ctx.globalAlpha = 0.92;
      ctx.drawImage(c.tint, x, y);
    }
    ctx.globalAlpha = 1;

    // montanhas / floresta
    for (const L of this.layers) {
      let col = mixc(L.night, L.day, env.day);
      col = mixc(col, L.dusk, env.dusk * 0.5);
      col = mixc(col, bot, 0.18 * (1 - L.par * 2)); // perspectiva atmosférica
      const rim = rgb(mixc(col, bot, 0.45)), fill = rgb(col);
      const snow = rgb(mixc(mixc(hex('#e8f0fa'), col, 0.25), bot, 0.2));
      const baseline = VH * 0.62 + L.off + (refY - camY - VH * 0.5) * L.par;
      if (baseline - 200 > VH) continue;
      const off = camX * L.par;
      for (let x = 0; x < VW; x++) {
        const idx = ((Math.floor(x + off) % N) + N) % N;
        const hgt = L.h[idx];
        const top = Math.round(baseline - hgt);
        if (top >= VH) continue;
        ctx.fillStyle = fill;
        ctx.fillRect(x, top, 1, VH - top);
        if (L.snow && hgt > 150) {
          ctx.fillStyle = snow;
          ctx.fillRect(x, top, 1, Math.min(6, Math.round((hgt - 150) * 0.35) + 1));
        } else {
          ctx.fillStyle = rim;
          ctx.fillRect(x, top, 1, 1);
        }
      }
    }
  }
}
