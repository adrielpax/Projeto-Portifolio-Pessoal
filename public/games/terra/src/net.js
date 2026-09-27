// Cliente de rede: conecta no /ws do servidor; se falhar, o jogo roda offline.
export class Net {
  constructor() {
    this.ws = null;
    this.id = 0;
    this.online = false;
    this.onMessage = null;
    this.onClose = null;
  }

  connect(name, look) {
    return new Promise((resolve, reject) => {
      let done = false, ws;
      const fail = (e) => { if (!done) { done = true; clearTimeout(to); try { ws && ws.close(); } catch {} reject(e); } };
      const to = setTimeout(() => fail(new Error('tempo esgotado')), 3000);
      try {
        ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
      } catch (e) { return fail(e); }
      this.ws = ws;
      ws.onopen = () => ws.send(JSON.stringify({ t: 'hello', name, look }));
      ws.onmessage = (ev) => {
        let m;
        try { m = JSON.parse(ev.data); } catch { return; }
        if (m.t === 'welcome' && !done) {
          done = true;
          clearTimeout(to);
          this.online = true;
          this.id = m.id;
          resolve(m);
        } else if (done && this.onMessage) this.onMessage(m);
      };
      ws.onerror = () => fail(new Error('sem servidor'));
      ws.onclose = () => {
        const was = this.online;
        this.online = false;
        if (was && this.onClose) this.onClose();
        fail(new Error('fechado'));
      };
    });
  }

  send(obj) {
    if (this.online && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
  }
}

export async function serverStatus() {
  try {
    const r = await fetch('/status', { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}
