// Inventário (40 espaços, hotbar = 10 primeiros), armaduras, crafting e UI em pixel art
import { ITEMS, RECIPES, SET_BONUS, STATION_NAME, icons, itemLines } from './items.js';
import { drawText, textWidth, LINE } from './font.js';

export const S = 20, GAP = 2;
const X0 = 8, Y0 = 8;
const ARMOR = ['head', 'body', 'legs'];
const ARMOR_GHOST = { head: 'helm_copper', body: 'chest_copper', legs: 'legs_copper' };

export class Inventory {
  constructor() {
    this.slots = new Array(40).fill(null);
    this.armor = { head: null, body: null, legs: null };
    this.cursor = null;
    this.sel = 0;
    this.open = false;
    this.bump = new Float32Array(40);
    this.nameT = 0;
    this.hover = null;
    this.onUI = false;
    this.dropRequest = null;
    this.version = 0; // muda quando armadura muda (para rede)
    this.stations = new Set(); // estações de criação por perto (bancada, fornalha)
    this.chest = null;         // baú aberto: { obj, slots }
    this.onChestChange = null;
  }

  add(id, n) {
    const d = ITEMS[id];
    if (!d) return n;
    for (let i = 0; i < 40 && n > 0; i++) {
      const s = this.slots[i];
      if (s && s.id === id && s.n < d.max) { const k = Math.min(n, d.max - s.n); s.n += k; n -= k; this.bump[i] = 1; }
    }
    for (let i = 0; i < 40 && n > 0; i++)
      if (!this.slots[i]) { const k = Math.min(n, d.max); this.slots[i] = { id, n: k }; n -= k; this.bump[i] = 1; }
    return n;
  }
  count(id) {
    let c = 0;
    for (const s of this.slots) if (s && s.id === id) c += s.n;
    return c;
  }
  remove(id, n) {
    for (let i = 39; i >= 0 && n > 0; i--) {
      const s = this.slots[i];
      if (s && s.id === id) { const k = Math.min(n, s.n); s.n -= k; n -= k; if (!s.n) this.slots[i] = null; }
    }
  }
  selDef() { const s = this.slots[this.sel]; return s ? ITEMS[s.id] : null; }
  consumeSelected(k = 1) {
    const s = this.slots[this.sel];
    if (!s) return;
    s.n -= k;
    if (s.n <= 0) this.slots[this.sel] = null;
  }
  armorDefs() { return ARMOR.map((k) => (this.armor[k] ? ITEMS[this.armor[k].id] : null)); }
  setBonus() {
    const [h, b, l] = this.armorDefs();
    if (h && b && l && h.set === b.set && b.set === l.set) return SET_BONUS[h.set];
    return null;
  }
  defense() {
    let d = 0;
    for (const a of this.armorDefs()) if (a) d += a.defense;
    const sb = this.setBonus();
    return d + (sb ? sb.defense : 0);
  }
  hasMats(r) { return r.in.every(([id, n]) => this.count(id) >= n); }
  canCraft(r) { return (!r.station || this.stations.has(r.station)) && this.hasMats(r); }

  craft(r, toInventory) {
    if (!this.canCraft(r)) return false;
    const d = ITEMS[r.out];
    const c = this.cursor;
    if (!toInventory && c && (c.id !== r.out || c.n + r.n > d.max)) return false;
    for (const [id, n] of r.in) this.remove(id, n);
    if (!toInventory) {
      if (c) c.n += r.n; else this.cursor = { id: r.out, n: r.n };
    } else {
      const left = this.add(r.out, r.n);
      if (left) this.dropRequest = { id: r.out, n: left };
    }
    return true;
  }

  closeChest() {
    if (this.chest) { this.chest.obj.open = false; this.chest = null; }
  }
  openChest(obj) {
    this.closeChest();
    this.chest = { obj, slots: obj.items };
    obj.open = true;
    this.open = true;
  }

  toggle() {
    this.open = !this.open;
    if (!this.open) this.closeChest();
    if (!this.open && this.cursor) {
      const left = this.add(this.cursor.id, this.cursor.n);
      if (left) this.dropRequest = { id: this.cursor.id, n: left };
      this.cursor = null;
    }
  }

  select(i) {
    if (i !== this.sel) { this.sel = i; this.nameT = 1.6; }
  }

  // ---------- layout / interação ----------
  layout() {
    const L = [];
    for (let i = 0; i < 10; i++) L.push({ k: 'slot', i, x: X0 + i * (S + GAP), y: Y0 });
    if (!this.open) return L;
    for (let r = 1; r < 4; r++)
      for (let c = 0; c < 10; c++) L.push({ k: 'slot', i: r * 10 + c, x: X0 + c * (S + GAP), y: Y0 + r * (S + GAP) + 4 });
    const ax = X0 + 10 * (S + GAP) + 10;
    ARMOR.forEach((slot, j) => L.push({ k: 'armor', slot, x: ax, y: Y0 + (j + 1) * (S + GAP) + 4 }));
    const ry = Y0 + 4 * (S + GAP) + 20;
    if (this.chest) {
      for (let i = 0; i < this.chest.slots.length; i++) L.push({ k: 'cslot', i, x: X0 + (i % 10) * (S + GAP), y: ry + Math.floor(i / 10) * (S + GAP) });
    } else RECIPES.forEach((r, j) => L.push({ k: 'recipe', r, x: X0 + (j % 10) * (S + GAP), y: ry + Math.floor(j / 10) * (S + GAP) }));
    return L;
  }
  panelRect() {
    const w = 10 * (S + GAP) + 10 + S + 60, rows = this.chest ? Math.ceil(this.chest.slots.length / 10) : Math.ceil(RECIPES.length / 10);
    return { x: X0 - 5, y: Y0 - 5, w: w + 8, h: 4 * (S + GAP) + 24 + rows * (S + GAP) + 10 };
  }
  hit(L, x, y) {
    for (const e of L) if (x >= e.x && x < e.x + S && y >= e.y && y < e.y + S) return e;
    return null;
  }

  ui(mx, my, clicks, shift) {
    const L = this.layout();
    this.hover = this.hit(L, mx, my);
    const pr = this.panelRect();
    const inPanel = this.open && mx >= pr.x && mx < pr.x + pr.w && my >= pr.y && my < pr.y + pr.h;
    this.onUI = !!this.hover || inPanel;
    for (const c of clicks) {
      const e = this.hit(L, c.x, c.y);
      const cInPanel = this.open && c.x >= pr.x && c.x < pr.x + pr.w && c.y >= pr.y && c.y < pr.y + pr.h;
      if (!e) {
        if (cInPanel) c.used = true;
        else if (this.open && this.cursor && c.button === 0) { this.dropRequest = this.cursor; this.cursor = null; c.used = true; }
        continue;
      }
      c.used = true;
      if (e.k === 'slot') this.clickSlot(e.i, c.button, c.shift);
      else if (e.k === 'cslot') { this.clickIn(this.chest.slots, e.i, c.button, c.shift, true); this.chestChanged(); }
      else if (e.k === 'armor') this.clickArmor(e.slot, c.button, c.shift);
      else if (e.k === 'recipe' && c.button === 0) this.craft(e.r, c.shift);
    }
  }

  chestChanged() { if (this.chest && this.onChestChange) this.onChestChange(this.chest.obj); }

  // move uma pilha para outro recipiente (junta com pilhas iguais primeiro)
  moveTo(stack, arr, from, to) {
    const max = ITEMS[stack.id].max;
    let n = stack.n;
    for (let k = from; k < to && n > 0; k++) { const t = arr[k]; if (t && t.id === stack.id && t.n < max) { const m = Math.min(n, max - t.n); t.n += m; n -= m; } }
    for (let k = from; k < to && n > 0; k++) if (!arr[k]) { arr[k] = { id: stack.id, n: Math.min(n, max) }; n -= arr[k].n; }
    return n;
  }

  // clique genérico em um espaço de qualquer recipiente (mochila ou baú)
  clickIn(arr, i, button, shift, isChest) {
    const s = arr[i], c = this.cursor;
    if (button === 0 && shift && s) {
      if (isChest) { const left = this.moveTo(s, this.slots, 0, 40); arr[i] = left ? { id: s.id, n: left } : null; }
      else { const left = this.moveTo(s, this.chest.slots, 0, this.chest.slots.length); arr[i] = left ? { id: s.id, n: left } : null; this.chestChanged(); }
      return;
    }
    if (button === 0) {
      if (c && s && c.id === s.id) {
        const max = ITEMS[s.id].max, m = Math.min(c.n, max - s.n);
        s.n += m; c.n -= m;
        if (!c.n) this.cursor = null;
      } else { arr[i] = c; this.cursor = s; }
    } else if (button === 2) {
      if (!c && s) {
        const half = Math.ceil(s.n / 2);
        this.cursor = { id: s.id, n: half };
        s.n -= half;
        if (!s.n) arr[i] = null;
      } else if (c && (!s || (s.id === c.id && s.n < ITEMS[s.id].max))) {
        if (s) s.n++; else arr[i] = { id: c.id, n: 1 };
        c.n--;
        if (!c.n) this.cursor = null;
      }
    }
  }

  clickSlot(i, button, shift) {
    const s = this.slots[i], c = this.cursor;
    if (!this.open) { this.select(i); return; }
    if (this.chest && !(button === 0 && shift && s && ITEMS[s.id].kind === 'armor')) { this.clickIn(this.slots, i, button, shift, false); return; }
    if (button === 0 && shift && s) {
      const d = ITEMS[s.id];
      if (d.kind === 'armor') { const old = this.armor[d.slot]; this.armor[d.slot] = s; this.slots[i] = old; this.version++; return; }
      // hotbar <-> mochila
      const range = i < 10 ? [10, 40] : [0, 10];
      this.slots[i] = null;
      let n = s.n;
      for (let k = range[0]; k < range[1] && n > 0; k++) { const t = this.slots[k]; if (t && t.id === s.id && t.n < d.max) { const m = Math.min(n, d.max - t.n); t.n += m; n -= m; this.bump[k] = 1; } }
      for (let k = range[0]; k < range[1] && n > 0; k++) if (!this.slots[k]) { this.slots[k] = { id: s.id, n }; n = 0; this.bump[k] = 1; }
      if (n > 0) this.slots[i] = { id: s.id, n };
      return;
    }
    if (button === 0) {
      if (c && s && c.id === s.id) {
        const max = ITEMS[s.id].max, m = Math.min(c.n, max - s.n);
        s.n += m; c.n -= m;
        if (!c.n) this.cursor = null;
      } else { this.slots[i] = c; this.cursor = s; }
    } else if (button === 2) {
      if (!c && s) {
        const half = Math.ceil(s.n / 2);
        this.cursor = { id: s.id, n: half };
        s.n -= half;
        if (!s.n) this.slots[i] = null;
      } else if (c && (!s || (s.id === c.id && s.n < ITEMS[s.id].max))) {
        if (s) s.n++; else this.slots[i] = { id: c.id, n: 1 };
        c.n--;
        if (!c.n) this.cursor = null;
      }
    }
  }

  clickArmor(slot, button, shift) {
    const cur = this.armor[slot], c = this.cursor;
    if (shift && cur) { if (!this.add(cur.id, 1)) { this.armor[slot] = null; this.version++; } return; }
    if (button !== 0) return;
    if (c && (ITEMS[c.id].kind !== 'armor' || ITEMS[c.id].slot !== slot)) return;
    this.armor[slot] = c;
    this.cursor = cur;
    this.version++;
  }

  // ---------- desenho ----------
  slotBox(ctx, x, y, sel, dim) {
    ctx.fillStyle = sel ? 'rgba(58,44,88,0.9)' : dim ? 'rgba(14,10,26,0.55)' : 'rgba(18,14,32,0.78)';
    ctx.fillRect(x + 1, y + 1, S - 2, S - 2);
    ctx.fillStyle = sel ? '#f5d76e' : '#5d5480';
    ctx.fillRect(x + 2, y, S - 4, 1); ctx.fillRect(x + 2, y + S - 1, S - 4, 1);
    ctx.fillRect(x, y + 2, 1, S - 4); ctx.fillRect(x + S - 1, y + 2, 1, S - 4);
    ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + S - 2, y + 1, 1, 1);
    ctx.fillRect(x + 1, y + S - 2, 1, 1); ctx.fillRect(x + S - 2, y + S - 2, 1, 1);
    if (sel) { ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(x + 2, y + 2, S - 4, 1); }
  }
  drawItem(ctx, it, x, y, alpha = 1) {
    if (!it) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(icons[it.id], x + 2, y + 2);
    ctx.globalAlpha = 1;
    if (it.n > 1) { const s = String(it.n); drawText(ctx, s, x + S - 2 - textWidth(s), y + S - 7); }
  }

  draw(ctx, VW, VH, time, player, mx, my) {
    const L = this.layout();
    if (this.open) {
      const p = this.panelRect();
      ctx.fillStyle = 'rgba(10,8,20,0.55)';
      ctx.fillRect(p.x, p.y + S + GAP + 2, p.w, p.h - S - GAP - 2);
      const ax = X0 + 10 * (S + GAP) + 10;
      drawText(ctx, 'Armadura', ax, Y0 + S + GAP - 4 - LINE + 6, '#c8c0e0');
      drawText(ctx, this.chest ? 'Baú (Shift+clique move tudo)' : 'Criar', X0, Y0 + 4 * (S + GAP) + 11, '#c8c0e0');
      // defesa
      const def = this.defense();
      const sx = ax + 2, sy = Y0 + 4 * (S + GAP) + 7;
      ctx.fillStyle = '#6aa6ec'; ctx.fillRect(sx, sy, 7, 5); ctx.fillRect(sx + 1, sy + 5, 5, 2); ctx.fillRect(sx + 2, sy + 7, 3, 1);
      ctx.fillStyle = '#b8dcff'; ctx.fillRect(sx + 1, sy + 1, 2, 3);
      drawText(ctx, String(def), sx + 10, sy + 1, '#fff');
      // boneco
      if (player) {
        const dx = ax + S + 10, dy = Y0 + S + GAP + 8;
        ctx.fillStyle = 'rgba(40,32,64,0.6)';
        ctx.fillRect(dx - 2, dy - 2, 48, 72);
        ctx.drawImage(player.spr, dx - 9, dy - 20, player.spr.width * 2, player.spr.height * 2);
      }
      const sb = this.setBonus();
      if (sb) drawText(ctx, sb.text.split(':')[0] + '!', ax + S + 8, Y0 + S + GAP + 84, '#b8f0a0');
    }
    for (const e of L) {
      if (e.k === 'slot') {
        const bump = this.bump[e.i];
        const y = e.y - (e.i === this.sel ? 2 : 0) - Math.round(Math.sin(bump * Math.PI) * 3);
        this.slotBox(ctx, e.x, y, e.i === this.sel, false);
        this.drawItem(ctx, this.slots[e.i], e.x, y);
        if (e.i < 10) drawText(ctx, String((e.i + 1) % 10), e.x + 2, y + 2, 'rgba(255,255,255,0.45)', 1, null);
      } else if (e.k === 'armor') {
        this.slotBox(ctx, e.x, e.y, false, false);
        const it = this.armor[e.slot];
        if (it) this.drawItem(ctx, it, e.x, e.y);
        else { ctx.globalAlpha = 0.16; ctx.drawImage(icons[ARMOR_GHOST[e.slot]], e.x + 2, e.y + 2); ctx.globalAlpha = 1; }
      } else if (e.k === 'cslot') {
        this.slotBox(ctx, e.x, e.y, false, false);
        this.drawItem(ctx, this.chest.slots[e.i], e.x, e.y);
      } else if (e.k === 'recipe') {
        const ok = this.canCraft(e.r);
        this.slotBox(ctx, e.x, e.y, false, !ok);
        this.drawItem(ctx, { id: e.r.out, n: e.r.n }, e.x, e.y, ok ? 1 : 0.3);
        if (ok) {
          ctx.fillStyle = `rgba(245,215,110,${0.25 + 0.2 * Math.sin(time * 4)})`;
          ctx.fillRect(e.x + 2, e.y + S - 2, S - 4, 1);
        }
      }
    }
    if (!this.open && this.nameT > 0) {
      const s = this.slots[this.sel];
      if (s) {
        ctx.globalAlpha = Math.min(1, this.nameT * 2);
        drawText(ctx, ITEMS[s.id].name, X0, Y0 + S + 6, '#f5e6b0');
        ctx.globalAlpha = 1;
      }
    }
    if (this.hover && !this.cursor) this.tooltip(ctx, VW, VH, mx, my);
    if (this.cursor) this.drawItem(ctx, this.cursor, Math.round(mx) + 2, Math.round(my) + 2);
  }

  tooltip(ctx, VW, VH, mx, my) {
    const e = this.hover;
    let id = null, extra = [];
    if (e.k === 'slot') id = this.slots[e.i]?.id;
    else if (e.k === 'armor') id = this.armor[e.slot]?.id;
    else if (e.k === 'cslot') id = this.chest.slots[e.i]?.id;
    else if (e.k === 'recipe') {
      id = e.r.out;
      if (e.r.station) extra.push([`Perto de: ${STATION_NAME[e.r.station]}`, this.stations.has(e.r.station) ? '#a8f0a0' : '#ff8a8a']);
      extra.push(['Precisa:', '#c8c0e0']);
      for (const [rid, n] of e.r.in) {
        const have = this.count(rid);
        extra.push([`${n} ${ITEMS[rid].name} (${have})`, have >= n ? '#a8f0a0' : '#ff8a8a']);
      }
    }
    if (!id) return;
    const d = ITEMS[id];
    const lines = [[d.name, d.kind === 'armor' || d.glow ? '#8aeeff' : '#ffffff'], ...itemLines(d), ...extra];
    const w = Math.max(...lines.map(([t]) => textWidth(String(t).toUpperCase()))) + 8, h = lines.length * LINE + 6;
    let x = Math.round(mx) + 10, y = Math.round(my) + 8;
    if (x + w > VW) x = VW - w - 2;
    if (y + h > VH) y = VH - h - 2;
    ctx.fillStyle = 'rgba(14,10,28,0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#6a5a9a';
    ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
    lines.forEach(([t, col], i) => drawText(ctx, t, x + 4, y + 4 + i * LINE, col));
  }

  update(dt) {
    for (let i = 0; i < 40; i++) this.bump[i] = Math.max(0, this.bump[i] - dt * 4);
    this.nameT = Math.max(0, this.nameT - dt);
  }

  serialize() { return JSON.stringify({ slots: this.slots, armor: this.armor }); }
  load(str) {
    try {
      const o = JSON.parse(str);
      if (!o || !Array.isArray(o.slots) || o.slots.length !== 40) return false;
      const ok = (s) => s === null || (s && ITEMS[s.id] && s.n > 0);
      if (!o.slots.every(ok) || !ARMOR.every((k) => ok(o.armor?.[k] ?? null))) return false;
      this.slots = o.slots;
      this.armor = { head: o.armor.head ?? null, body: o.armor.body ?? null, legs: o.armor.legs ?? null };
      this.version++;
      return true;
    } catch { return false; }
  }
}
