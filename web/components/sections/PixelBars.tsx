import { mulberry32 } from "@/lib/math";

/** "assinatura" visual gerada a partir da seed do projeto (barras em pixel) */
export function PixelBars({ seed, cols = 32, rows = 8 }: { seed: number; cols?: number; rows?: number }) {
  const rand = mulberry32(seed);
  let h = 2 + rand() * 4;
  const accentCol = Math.floor(rand() * cols);
  const bars = Array.from({ length: cols }, (_, x) => {
    h = Math.max(1, Math.min(rows, h + (rand() - 0.5) * 3));
    return { x, h: Math.round(h), accent: x === accentCol };
  });
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="none" shapeRendering="crispEdges" className="pixel-bars h-full w-full" aria-hidden>
      {bars.map((b) => (
        <g key={b.x} className="pixel-bars__col" style={{ animationDelay: `${(b.x % 7) * -0.13}s` }}>
          {Array.from({ length: b.h }, (_, y) => (
            <rect
              key={y}
              x={b.x + 0.12}
              y={rows - 1 - y + 0.12}
              width={0.76}
              height={0.76}
              fill={b.accent && y === b.h - 1 ? "#e07a52" : `rgba(237,237,234,${0.14 + (y / rows) * 0.5})`}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
