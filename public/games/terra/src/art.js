// Ferramentas de pixel art: paletas, buffer de pixels e contorno "sel-out"

export const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const rgb = (c, a = 1) =>
  a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
export const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// Rampas com hue-shift: sombras puxam para roxo/azul, luzes para amarelo (técnica clássica de pixel art)
export const PAL = {
  dirt: ['#2b1a24', '#4d2c2b', '#734432', '#98623f', '#bf8a55'].map(hex),
  grass: ['#15392f', '#22683c', '#3c9a42', '#6bc24b', '#b8e86c'].map(hex),
  stone: ['#22222e', '#3a3c4b', '#565968', '#767a87', '#a3a6ad'].map(hex),
  copper: ['#5a2418', '#9a4a26', '#d27a38', '#f2b060', '#ffe4a8'].map(hex),
  crystal: ['#24185a', '#3a4fc8', '#48a8f0', '#8aeeff', '#eaffff'].map(hex),
  wood: ['#34201a', '#5a3822', '#80542e', '#a7743e', '#cc9a58'].map(hex),
  bark: ['#241618', '#40281f', '#5f3f2c', '#7f5838', '#a07548'].map(hex),
  leaf: ['#10301f', '#1c5430', '#2e7e38', '#56a844', '#9ad05a'].map(hex),
};

export class Px {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  set(x, y, c, a = 255) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.d[i] = c[0];
    this.d[i + 1] = c[1];
    this.d[i + 2] = c[2];
    this.d[i + 3] = a;
  }
  get(x, y) {
    const i = (y * this.w + x) * 4;
    return [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]];
  }
  alpha(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[(y * this.w + x) * 4 + 3];
  }
  clear(x, y) {
    this.set(x, y, [0, 0, 0], 0);
  }
  clone() {
    const p = new Px(this.w, this.h);
    p.d.set(this.d);
    return p;
  }
  toImageData() {
    return new ImageData(new Uint8ClampedArray(this.d), this.w, this.h);
  }
  toCanvas() {
    const c = document.createElement('canvas');
    c.width = this.w;
    c.height = this.h;
    c.getContext('2d').putImageData(this.toImageData(), 0, 0);
    return c;
  }
}

// Rotação pixel-perfect por amostragem inversa: cada pixel de destino busca
// o pixel de origem correspondente (sem blur e sem buracos).
// (gx, gy) = pivô na origem; (cx, cy) = onde o pivô cai no destino.
export function rotateInto(src, gx, gy, a, dst, cx, cy) {
  const d = dst.d, s = src.d, cs = Math.cos(a), sn = Math.sin(a);
  d.fill(0);
  for (let j = 0; j < dst.h; j++)
    for (let i = 0; i < dst.w; i++) {
      const dx = i - cx + 0.5, dy = j - cy + 0.5;
      const sx = Math.floor(dx * cs + dy * sn + gx), sy = Math.floor(-dx * sn + dy * cs + gy);
      if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue;
      const si = (sy * src.w + sx) * 4;
      if (s[si + 3] === 0) continue;
      const di = (j * dst.w + i) * 4;
      d[di] = s[si]; d[di + 1] = s[si + 1]; d[di + 2] = s[si + 2]; d[di + 3] = s[si + 3];
    }
  return dst;
}

// sombra/luz com hue-shift para gerar rampas a partir de uma cor base
export const shadeDark = (c, k = 0.38) => mixc(c, [38, 18, 62], k);
export const shadeLight = (c, k = 0.32) => mixc(c, [255, 244, 205], k);
export const ramp5 = (c) => [shadeDark(c, 0.72), shadeDark(c, 0.4), c, shadeLight(c, 0.3), shadeLight(c, 0.62)];

// Contorno "selective outline": cada pixel de borda recebe uma versão escura
// da cor vizinha em vez de preto puro — o sprite fica legível sem parecer "adesivo".
export function selOut(p, k = 0.32) {
  const src = p.clone();
  const N = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) {
      if (src.alpha(x, y) !== 0) continue;
      for (const [dx, dy] of N) {
        if (src.alpha(x + dx, y + dy) > 128) {
          const c = src.get(x + dx, y + dy);
          p.set(x, y, [c[0] * k + 8, c[1] * k + 4, c[2] * k + 16]);
          break;
        }
      }
    }
}
