// Tela inicial: nome, aparência (com prévia animada) e status do servidor
import { Player, HAIR_COLORS, SHIRT_COLORS, SKIN_TONES, HAIR_STYLES } from './player.js';
import { serverStatus } from './net.js';

const KEY = 'terra_profile';

export function loadProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && p.look) return p;
  } catch {}
  return {
    name: 'Aventureiro ' + ((Math.random() * 900 + 100) | 0),
    look: { hair: HAIR_COLORS[0], shirt: SHIRT_COLORS[0], skin: SKIN_TONES[0], style: 0 },
  };
}

export function runLobby() {
  const el = document.getElementById('lobby');
  const prof = loadProfile();
  const look = { ...prof.look };
  const nameEl = document.getElementById('lname');
  nameEl.value = prof.name;

  const swatches = (id, list, key) => {
    const box = document.getElementById(id);
    box.innerHTML = '';
    for (const c of list) {
      const b = document.createElement('button');
      b.className = 'sw' + (look[key] === c ? ' on' : '');
      b.style.background = c;
      b.title = c;
      b.onclick = () => { look[key] = c; swatches(id, list, key); prev.setLook(look); };
      box.appendChild(b);
    }
  };
  const styles = () => {
    const box = document.getElementById('lstyle');
    box.innerHTML = '';
    HAIR_STYLES.forEach((n, i) => {
      const b = document.createElement('button');
      b.className = 'opt' + (look.style === i ? ' on' : '');
      b.textContent = n;
      b.onclick = () => { look.style = i; styles(); prev.setLook(look); };
      box.appendChild(b);
    });
  };

  // prévia animada usando o mesmo código de desenho do jogo
  const cv = document.getElementById('lpreview'), pc = cv.getContext('2d');
  pc.imageSmoothingEnabled = false;
  const prev = new Player(34, 92, look);
  prev.onGround = true;
  let last = performance.now(), raf = 0, t = 0;
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    prev.aimA = Math.sin(t * 0.7) * 0.6;
    prev.animate(dt, null, Math.sin(t * 0.5) * 0.6, t);
    pc.clearRect(0, 0, cv.width, cv.height);
    pc.fillStyle = '#2a2240';
    pc.fillRect(0, 92, cv.width, 8);
    prev.draw(pc, t);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  swatches('lhair', HAIR_COLORS, 'hair');
  swatches('lshirt', SHIRT_COLORS, 'shirt');
  swatches('lskin', SKIN_TONES, 'skin');
  styles();

  const st = document.getElementById('lstatus');
  serverStatus().then((s) => {
    if (!s) { st.innerHTML = 'Servidor não encontrado — o jogo roda <b>offline</b>.'; return; }
    const n = s.players.length;
    st.innerHTML = `Servidor online · ${n ? `${n} jogando: ${s.players.map(escape).join(', ')}` : 'ninguém jogando ainda'}` +
      (s.lan.length ? `<br>Amigos na mesma rede entram por: <b>${s.lan.map(escape).join(' ou ')}</b>` : '');
  });

  return new Promise((resolve) => {
    const go = () => {
      const name = nameEl.value.trim().slice(0, 16) || prof.name;
      try { localStorage.setItem(KEY, JSON.stringify({ name, look })); } catch {}
      cancelAnimationFrame(raf);
      el.remove();
      resolve({ name, look });
    };
    document.getElementById('lplay').onclick = go;
    nameEl.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  });
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
