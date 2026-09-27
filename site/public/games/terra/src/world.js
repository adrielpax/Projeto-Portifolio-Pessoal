// Mundo em grade: blocos, paredes de fundo, decorações e árvores
import { TILE, T, W, SOLID, WORLD_W, WORLD_H } from './config.js';
import { fbm2, hash2 } from './noise.js';
import { OBJ } from './furniture.js';

export class World {
  constructor(seed) {
    this.seed = seed;
    this.w = WORLD_W;
    this.h = WORLD_H;
    const n = this.w * this.h;
    this.tiles = new Uint8Array(n);
    this.walls = new Uint8Array(n);
    this.deco = new Uint8Array(n); // 1 tufo, 2-4 flores, 5 cogumelo brilhante
    this.surface = new Int16Array(this.w);
    this.skyTop = new Int16Array(this.w); // primeira célula que bloqueia o sol em cada coluna
    this.trees = [];
    this.damage = new Map();
    this.placeAnim = new Map();
    this.hitAnim = new Map();
    this.events = [];
    this.objects = [];        // móveis: { id, type, x, y, items?, open? }
    this.objMap = new Map();  // célula -> objeto
    this.refY = Math.floor(this.h * 0.26) * TILE;
    this.generate();
  }

  inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) {
    if (x < 0 || x >= this.w || y >= this.h) return T.STONE;
    if (y < 0) return T.AIR;
    return this.tiles[y * this.w + x];
  }
  isSolid(x, y) { return SOLID[this.get(x, y)] === 1; }
  solidAt(px, py) { return this.isSolid(Math.floor(px / TILE), Math.floor(py / TILE)); }
  wallAt(x, y) { return this.inb(x, y) ? this.walls[y * this.w + x] : 0; }

  topSolid(x) {
    let y = 0;
    while (y < this.h && !SOLID[this.tiles[y * this.w + x]]) y++;
    return y;
  }
  updateSky(x) {
    let y = 0;
    const { tiles, walls, w, h } = this;
    while (y < h && !SOLID[tiles[y * w + x]] && !walls[y * w + x]) y++;
    this.skyTop[x] = y;
  }

  torchSupported(x, y) {
    return this.wallAt(x, y) || this.isSolid(x, y + 1) || this.isSolid(x - 1, y) || this.isSolid(x + 1, y);
  }

  // ---------- móveis ----------
  objAt(x, y) { return this.inb(x, y) ? this.objMap.get(y * this.w + x) : undefined; }
  objCells(o, fn) {
    const d = OBJ[o.type];
    for (let dy = 0; dy < d.h; dy++) for (let dx = 0; dx < d.w; dx++) fn(o.x + dx, o.y - dy);
  }
  canPlaceObject(type, x, y) {
    const d = OBJ[type];
    for (let dy = 0; dy < d.h; dy++)
      for (let dx = 0; dx < d.w; dx++) {
        const cx = x + dx, cy = y - dy;
        if (!this.inb(cx, cy) || this.get(cx, cy) !== T.AIR || this.objAt(cx, cy)) return false;
      }
    for (let dx = 0; dx < d.w; dx++) if (!this.isSolid(x + dx, y + 1) && this.get(x + dx, y + 1) !== T.PLATFORM) return false;
    return true;
  }
  addObject(o) {
    if (o.type === 'chest' && !o.items) o.items = new Array(OBJ.chest.slots).fill(null);
    this.objects.push(o);
    this.objCells(o, (x, y) => { this.objMap.set(y * this.w + x, o); this.deco[y * this.w + x] = 0; });
  }
  removeObject(o) {
    const i = this.objects.indexOf(o);
    if (i < 0) return;
    this.objects.splice(i, 1);
    this.objCells(o, (x, y) => this.objMap.delete(y * this.w + x));
  }
  objById(id) { return this.objects.find((o) => o.id === id); }

  // ---------- paredes ----------
  setWall(x, y, v) {
    if (!this.inb(x, y)) return;
    this.walls[y * this.w + x] = v;
    this.updateSky(x);
  }

  // ---------- plataformas (sólidas só por cima) ----------
  // retorna o y do topo da plataforma atravessada ao descer de yPrev até yNew, ou null
  platformLand(x0, x1, yPrev, yNew) {
    const tx0 = Math.floor(x0 / TILE), tx1 = Math.floor((x1 - 0.001) / TILE);
    const ty0 = Math.floor(yPrev / TILE), ty1 = Math.floor(yNew / TILE);
    for (let ty = ty0; ty <= ty1; ty++) {
      const top = ty * TILE;
      if (yPrev > top + 0.5 || yNew < top) continue;
      for (let tx = tx0; tx <= tx1; tx++) if (this.get(tx, ty) === T.PLATFORM) return top;
    }
    return null;
  }
  onPlatform(x0, x1, y) {
    if (Math.abs(y - Math.round(y / TILE) * TILE) > 0.5) return false;
    const ty = Math.round(y / TILE), tx0 = Math.floor(x0 / TILE), tx1 = Math.floor((x1 - 0.001) / TILE);
    for (let tx = tx0; tx <= tx1; tx++) if (this.get(tx, ty) === T.PLATFORM) return true;
    return false;
  }

  // ---------- portas (3 blocos de altura) ----------
  isDoor(x, y) { const t = this.get(x, y); return t === T.DOOR_C || t === T.DOOR_O; }
  doorSpan(x, y) {
    let top = y, bot = y;
    while (top > y - 2 && this.isDoor(x, top - 1)) top--;
    while (bot < top + 2 && this.isDoor(x, bot + 1)) bot++;
    return [top, bot];
  }

  setTile(x, y, t) {
    if (!this.inb(x, y)) return;
    const i = y * this.w + x;
    this.tiles[i] = t;
    if (t !== T.AIR) this.deco[i] = 0;
    else if (y > 0) this.deco[i - this.w] = 0; // a decoração em cima perdeu o chão
    if (SOLID[t] && y + 1 < this.h && this.tiles[i + this.w] === T.GRASS) this.tiles[i + this.w] = T.DIRT;
    this.updateSky(x);
    // móveis apoiados neste bloco caem
    if (!SOLID[t] && t !== T.PLATFORM && y > 0) {
      const above = this.objAt(x, y - 1);
      if (above && above.y === y - 1) {
        this.removeObject(above);
        this.events.push({ x: above.x, y: above.y, item: OBJ[above.type].item, items: above.items, objId: above.id });
      }
    }
    if (!SOLID[t]) {
      for (const [dx, dy] of [[0, -1], [1, 0], [-1, 0], [0, 1]]) {
        const nx = x + dx, ny = y + dy;
        if (this.get(nx, ny) === T.TORCH && !this.torchSupported(nx, ny)) {
          this.tiles[ny * this.w + nx] = T.AIR;
          this.events.push({ x: nx, y: ny, id: T.TORCH });
        }
      }
    }
  }

  findTree(x, y) { return this.trees.find((t) => t.x === x && y >= t.top && y <= t.base); }
  breakTree(tree) {
    let n = 0;
    for (let y = tree.top; y <= tree.base; y++)
      if (this.tiles[y * this.w + tree.x] === T.TRUNK) { this.tiles[y * this.w + tree.x] = T.AIR; n++; }
    this.trees.splice(this.trees.indexOf(tree), 1);
    this.updateSky(tree.x);
    return n;
  }

  generate() {
    const { w, h, seed, tiles, walls, deco } = this;
    const dd = new Int16Array(w);
    for (let x = 0; x < w; x++) {
      this.surface[x] = Math.floor(
        h * 0.26 + (fbm2(x * 0.0035, 0.5, seed, 4) - 0.5) * 110 + (fbm2(x * 0.03, 7.7, seed + 1, 3) - 0.5) * 16
      );
      dd[x] = 5 + Math.floor(fbm2(x * 0.06, 3.1, seed + 2, 2) * 9);
    }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x, depth = y - this.surface[x];
        if (depth < 0) continue;
        const dirtLayer = depth < dd[x];
        let t = dirtLayer ? T.DIRT : T.STONE;
        if (t === T.STONE && fbm2(x * 0.07, y * 0.07, seed + 3, 2) > 0.68) t = T.DIRT;
        else if (t === T.DIRT && depth > 2 && fbm2(x * 0.09, y * 0.09, seed + 8, 2) > 0.7) t = T.STONE;
        if (depth > 1) walls[i] = dirtLayer ? W.DIRT : W.STONE;
        if (depth > 4) {
          const tun = Math.abs(fbm2(x * 0.018, y * 0.03, seed + 4, 3) - 0.5) < 0.014 + Math.min(depth, 80) * 0.0001;
          const cav = fbm2(x * 0.022, y * 0.035, seed + 5, 4) > 0.67 - Math.min(depth, 160) * 0.0005;
          if (tun || cav) t = T.AIR;
        }
        if (t === T.STONE) {
          if (fbm2(x * 0.2, y * 0.2, seed + 6, 2) > 0.73) t = T.COPPER;
          else if (depth > 30 && fbm2(x * 0.2, y * 0.2, seed + 7, 2) > 0.8) t = T.CRYSTAL;
        }
        if (y >= h - 3) t = T.STONE;
        tiles[i] = t;
      }
    // grama na terra exposta ao céu
    for (let x = 0; x < w; x++)
      for (let y = 1; y < Math.min(h, this.surface[x] + 8); y++) {
        const i = y * w + x;
        if (tiles[i] === T.DIRT && tiles[i - w] === T.AIR && !walls[i - w]) tiles[i] = T.GRASS;
      }
    // árvores
    let last = -10;
    for (let x = 8; x < w - 8; x++) {
      if (x - last < 4 || hash2(x, 1, seed) > 0.17) continue;
      const y = this.topSolid(x);
      if (y >= h || tiles[y * w + x] !== T.GRASS) continue;
      if (tiles[y * w + x - 1] !== T.GRASS || tiles[y * w + x + 1] !== T.GRASS) continue;
      const ht = 5 + Math.floor(hash2(x, 2, seed) * 6);
      let ok = y - ht - 4 > 0;
      for (let k = 1; ok && k <= ht + 3; k++) if (tiles[(y - k) * w + x] !== T.AIR) ok = false;
      if (!ok) continue;
      for (let k = 1; k <= ht; k++) tiles[(y - k) * w + x] = T.TRUNK;
      const branches = [];
      for (let by = y - ht + 3; by <= y - 3; by++)
        if (hash2(x, by, seed + 11) < 0.3) branches.push({ y: by, side: hash2(x, by, seed + 12) < 0.5 ? -1 : 1, v: (hash2(x, by, seed + 13) * 3) | 0 });
      this.trees.push({ x, base: y - 1, top: y - ht, v: Math.floor(hash2(x, 3, seed) * 3), branches });
      last = x;
    }
    // decorações de superfície
    for (let x = 0; x < w; x++) {
      const y = this.topSolid(x);
      if (y < 1 || y >= h) continue;
      if (tiles[y * w + x] === T.GRASS && tiles[(y - 1) * w + x] === T.AIR) {
        const r = hash2(x, 4, seed);
        deco[(y - 1) * w + x] = r < 0.42 ? 1 : r < 0.49 ? 2 : r < 0.55 ? 3 : r < 0.59 ? 4 : 0;
      }
    }
    // cogumelos brilhantes nas cavernas
    for (let y = 1; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (y - this.surface[x] > 18 && SOLID[tiles[i]] && tiles[i - w] === T.AIR && walls[i - w] && hash2(x, y, seed + 9) < 0.035)
          deco[i - w] = 5;
      }
    for (let x = 0; x < w; x++) this.updateSky(x);
  }
}
