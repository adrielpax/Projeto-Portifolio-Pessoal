import type { CSSProperties } from "react";
import { mulberry32 } from "@/lib/math";

/** poucos triângulos bem claros subindo devagar atrás do conteúdo */
const rand = mulberry32(42);
const TRIS = Array.from({ length: 6 }, (_, i) => {
  const size = 28 + rand() * 110;
  return {
    i,
    size,
    left: rand() * 100,
    dur: 26 + rand() * 30,
    delay: -rand() * 50,
    dx: (rand() - 0.5) * 120,
    r0: rand() * 360,
    r1: rand() * 360 + 120,
    filled: rand() > 0.7,
    alpha: 0.012 + rand() * 0.02,
  };
});

export function Triangles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {TRIS.map((t) => (
        <svg
          key={t.i}
          className="tri"
          width={t.size}
          height={t.size}
          viewBox="0 0 100 100"
          style={
            {
              left: `${t.left}%`,
              "--dur": `${t.dur}s`,
              "--delay": `${t.delay}s`,
              "--dx": `${t.dx}px`,
              "--r0": `${t.r0}deg`,
              "--r1": `${t.r1}deg`,
            } as CSSProperties
          }
        >
          <polygon
            points="50,6 96,92 4,92"
            fill={t.filled ? `rgba(255,255,255,${t.alpha})` : "none"}
            stroke={`rgba(255,255,255,${t.alpha * 2.2})`}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}
    </div>
  );
}
