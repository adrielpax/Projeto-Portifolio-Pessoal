/**
 * Gera capas SVG branded para projetos que ainda não têm screenshot.
 * Mantém a identidade visual do portfólio (claro, translúcido, acento laranja).
 */

const PALETTES = [
  { a: "#0071e3", b: "#7ab8ff" },
  { a: "#7aa7ff", b: "#c9a7ff" },
  { a: "#34c79a", b: "#7ad4c0" },
  { a: "#f2547d", b: "#7ab8ff" },
];

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Quebra o título em até 2 linhas para caber na capa. */
function wrap(title, max = 18) {
  const words = title.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur.trim());
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

export function makeCover({ title, stack = [], label = "", index = 0 }) {
  const p = PALETTES[index % PALETTES.length];
  const lines = wrap(title);
  const chips = stack.slice(0, 4);

  let chipX = 80;
  const chipSvg = chips
    .map((s) => {
      const w = 26 + s.length * 12.5;
      const el = `<g transform="translate(${chipX} 560)">
      <rect width="${w}" height="46" rx="23" fill="#ffffff" opacity="0.82"/>
      <rect width="${w}" height="46" rx="23" fill="none" stroke="#11182714"/>
      <text x="${w / 2}" y="30" font-size="19" fill="#3d4650" text-anchor="middle" font-family="Inter,sans-serif" font-weight="500">${esc(s)}</text>
    </g>`;
      chipX += w + 14;
      return el;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#eef1f6"/>
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="90"/>
    </filter>
  </defs>

  <rect width="1200" height="750" fill="url(#bg)"/>
  <g filter="url(#blur)" opacity="0.75">
    <circle cx="980" cy="150" r="230" fill="${p.a}" opacity="0.55"/>
    <circle cx="1080" cy="620" r="200" fill="${p.b}" opacity="0.45"/>
    <circle cx="180" cy="680" r="180" fill="${p.a}" opacity="0.22"/>
  </g>

  <g stroke="#11182710" stroke-width="1">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="750"/>`).join("")}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 80}" x2="1200" y2="${i * 80}"/>`).join("")}
  </g>

  ${label ? `<g transform="translate(80 120)">
    <rect width="8" height="8" rx="4" fill="${p.a}"/>
    <text x="24" y="9" font-size="20" fill="#6b7280" letter-spacing="3.2" font-family="monospace">${esc(label.toUpperCase())}</text>
  </g>` : ""}

  ${lines
    .map(
      (l, i) =>
        `<text x="80" y="${300 + i * 82}" font-size="70" font-weight="700" fill="#14161b" font-family="Inter,Segoe UI,sans-serif" letter-spacing="-1.5">${esc(l)}</text>`,
    )
    .join("\n")}

  ${chipSvg}
</svg>`;
}
