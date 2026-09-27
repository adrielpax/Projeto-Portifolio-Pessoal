// Iluminação colorida por bloco (RGB), propagada com decaimento e
// ampliada com interpolação bilinear -> gradientes suaves em vez de "quadradões".
import { T, SOLID } from './config.js';

export class Lighting {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.smooth = true;
    this.n = 0;
  }

  ensure(W, H) {
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
      this.img = this.ctx.createImageData(W, H);
    }
    if (this.n < W * H) {
      this.n = W * H;
      this.R = new Float32Array(this.n);
      this.G = new Float32Array(this.n);
      this.B = new Float32Array(this.n);
      this.D = new Float32Array(this.n);
    }
  }

  compute(world, x0, y0, W, H, sky, time, extras) {
    this.ensure(W, H);
    const { R, G, B, D } = this;
    const { tiles, deco, skyTop, w, h } = world;
    const [sr, sg, sb] = sky;
    for (let j = 0; j < H; j++) {
      const y = y0 + j;
      for (let i = 0; i < W; i++) {
        const x = x0 + i, k = j * W + i;
        let r = 0, g = 0, b = 0, d = 0.87;
        if (x < 0 || x >= w || y >= h) d = 0.55;
        else if (y < 0) { r = sr; g = sg; b = sb; }
        else {
          const ti = y * w + x, t = tiles[ti];
          if (SOLID[t]) d = 0.62;
          if (y <= skyTop[x]) { r = sr; g = sg; b = sb; }
          if (t === T.TORCH) {
            // >1 satura perto da tocha e alcança mais longe
            const f = 0.93 + 0.07 * Math.sin(time * 11 + x * 1.7 + y) * Math.sin(time * 6.3 + x);
            if (1.35 * f > r) r = 1.35 * f;
            if (1.0 * f > g) g = 1.0 * f;
            if (0.62 * f > b) b = 0.62 * f;
          } else if (t === T.CRYSTAL) {
            // só brilha a face exposta ao ar
            if (!SOLID[world.get(x, y - 1)] || !SOLID[world.get(x, y + 1)] || !SOLID[world.get(x - 1, y)] || !SOLID[world.get(x + 1, y)]) {
              r = Math.max(r, 0.14); g = Math.max(g, 0.34); b = Math.max(b, 0.62);
            }
          } else if (deco[ti] === 5) {
            r = Math.max(r, 0.12); g = Math.max(g, 0.55); b = Math.max(b, 0.6);
          }
        }
        R[k] = r; G[k] = g; B[k] = b; D[k] = d;
      }
    }
    for (const e of extras) {
      const i = e.x - x0, j = e.y - y0;
      if (i < 0 || j < 0 || i >= W || j >= H) continue;
      const k = j * W + i;
      R[k] = Math.max(R[k], e.r); G[k] = Math.max(G[k], e.g); B[k] = Math.max(B[k], e.b);
    }
    // varreduras nas 4 direções (2 iterações bastam para contornar cantos)
    for (let it = 0; it < 2; it++) {
      for (let j = 0; j < H; j++) {
        const row = j * W;
        for (let i = 1; i < W; i++) this.pull(row + i, row + i - 1);
        for (let i = W - 2; i >= 0; i--) this.pull(row + i, row + i + 1);
      }
      for (let i = 0; i < W; i++) {
        for (let j = 1; j < H; j++) this.pull(j * W + i, (j - 1) * W + i);
        for (let j = H - 2; j >= 0; j--) this.pull(j * W + i, (j + 1) * W + i);
      }
    }
    const data = this.img.data;
    for (let k = 0, o = 0; k < W * H; k++, o += 4) {
      data[o] = R[k] * 255;
      data[o + 1] = G[k] * 255;
      data[o + 2] = B[k] * 255;
      data[o + 3] = 255;
    }
    this.ctx.putImageData(this.img, 0, 0);
  }

  pull(k, p) {
    const { R, G, B, D } = this, d = D[k];
    let v = R[p] * d; if (v > R[k]) R[k] = v;
    v = G[p] * d; if (v > G[k]) G[k] = v;
    v = B[p] * d; if (v > B[k]) B[k] = v;
  }
}
