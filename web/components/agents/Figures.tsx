/**
 * Personagens em vetor (SVG), desenhados à mão em formas simples:
 * - Claude: o Clawd (corpo largo, bracinhos laterais, olhos pretos, quatro pernas)
 * - Codex: robô-nuvem azul com visor ">_" e ">-" no peito
 * Cada um trabalha num notebook visto por trás, com o emblema brilhando.
 * Animações em CSS (globals.css): .fig-eyes pisca, .fig-arm-l/.fig-arm-r digitam,
 * e com .is-waving o braço direito acena.
 */

type Props = { waving?: boolean; className?: string };

function Laptop({ x, y, w, h, glow, emblem }: { x: number; y: number; w: number; h: number; glow: string; emblem: React.ReactNode }) {
  const id = `lid-${glow.replace("#", "")}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3d46" />
          <stop offset="1" stopColor="#1d1f24" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* tampa vista por trás */}
      <rect x={x} y={y} width={w} height={h} rx="5" fill={`url(#${id})`} stroke="#5d6170" strokeWidth="1" />
      <rect x={x + 3} y={y + 2} width={w - 6} height="1.5" rx="0.75" fill="#ffffff" opacity="0.18" />
      <g className="fig-emblem" filter={`url(#${id}-glow)`} transform={`translate(${x + w / 2} ${y + h / 2})`}>
        {emblem}
      </g>
      {/* base do teclado */}
      <rect x={x - 8} y={y + h - 1} width={w + 16} height="7" rx="3" fill="#9a9da6" />
      <rect x={x - 8} y={y + h + 4} width={w + 16} height="2" rx="1" fill="#5d6170" />
    </g>
  );
}

/** brilho do Claude: estrela de quatro pontas */
const ClaudeSpark = () => (
  <path d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#ffc4a6" />
);
/** prompt do Codex */
const CodexPrompt = () => (
  <g stroke="#b9c8ff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d="M-9 -5 L-4 0 L-9 5" />
    <path d="M-1 5 H8" />
  </g>
);

export function ClaudeFigure({ waving, className = "" }: Props) {
  return (
    <svg viewBox="0 0 160 132" width="120" height="99" className={`fig ${waving ? "is-waving" : ""} ${className}`} aria-hidden>
      <defs>
        <linearGradient id="clawd-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ea9070" />
          <stop offset="1" stopColor="#c8603c" />
        </linearGradient>
        <linearGradient id="clawd-limb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e07a52" />
          <stop offset="1" stopColor="#b9532f" />
        </linearGradient>
      </defs>
      {/* pernas */}
      {[40, 58, 90, 108].map((x) => (
        <rect key={x} x={x} y="80" width="12" height="40" rx="4" fill="url(#clawd-limb)" />
      ))}
      {/* braços */}
      <rect className="fig-arm-l" x="8" y="38" width="30" height="20" rx="7" fill="url(#clawd-limb)" />
      <rect className="fig-arm-r" x="122" y="38" width="30" height="20" rx="7" fill="url(#clawd-limb)" />
      {/* corpo */}
      <rect x="28" y="8" width="104" height="80" rx="16" fill="url(#clawd-body)" />
      <rect x="36" y="12" width="88" height="10" rx="5" fill="#ffffff" opacity="0.14" />
      {/* olhos */}
      <g className="fig-eyes">
        <rect x="55" y="32" width="11" height="17" rx="4" fill="#111" />
        <rect x="94" y="32" width="11" height="17" rx="4" fill="#111" />
        <rect x="58" y="34" width="3" height="4" rx="1.5" fill="#fff" opacity="0.7" />
        <rect x="97" y="34" width="3" height="4" rx="1.5" fill="#fff" opacity="0.7" />
      </g>
      <Laptop x={48} y={60} w={64} h={42} glow="#ffb08a" emblem={<ClaudeSpark />} />
    </svg>
  );
}

export function CodexFigure({ waving, className = "" }: Props) {
  return (
    <svg viewBox="0 0 150 168" width="104" height="116" className={`fig ${waving ? "is-waving" : ""} ${className}`} aria-hidden>
      <defs>
        <linearGradient id="codex-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8aa2ff" />
          <stop offset="1" stopColor="#4864ec" />
        </linearGradient>
        <linearGradient id="codex-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2450" />
          <stop offset="1" stopColor="#0c1230" />
        </linearGradient>
      </defs>
      {/* pernas */}
      <rect x="58" y="134" width="12" height="26" rx="5" fill="url(#codex-body)" />
      <rect x="80" y="134" width="12" height="26" rx="5" fill="url(#codex-body)" />
      {/* braços */}
      <rect className="fig-arm-l" x="30" y="104" width="16" height="28" rx="8" fill="url(#codex-body)" />
      <rect className="fig-arm-r" x="104" y="104" width="16" height="28" rx="8" fill="url(#codex-body)" />
      {/* corpo */}
      <rect x="48" y="96" width="54" height="44" rx="14" fill="url(#codex-body)" />
      {/* cabeça em forma de nuvem */}
      <g fill="url(#codex-body)">
        <circle cx="46" cy="40" r="22" />
        <circle cx="75" cy="30" r="27" />
        <circle cx="104" cy="40" r="22" />
        <circle cx="30" cy="64" r="18" />
        <circle cx="120" cy="64" r="18" />
        <rect x="20" y="40" width="110" height="58" rx="26" />
      </g>
      <ellipse cx="62" cy="22" rx="16" ry="6" fill="#ffffff" opacity="0.22" />
      {/* visor com o prompt */}
      <rect x="35" y="46" width="80" height="40" rx="13" fill="url(#codex-visor)" />
      <g className="fig-eyes" stroke="#d6e2ff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M50 56 L60 66 L50 76" />
        <path className="fig-cursor" d="M68 76 H84" />
      </g>
      <Laptop x={44} y={104} w={62} h={34} glow="#9fb4ff" emblem={<CodexPrompt />} />
    </svg>
  );
}
