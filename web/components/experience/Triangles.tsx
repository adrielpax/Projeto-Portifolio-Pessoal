import type { CSSProperties } from "react";
import { mulberry32 } from "@/lib/math";

/** poucos triângulos de vidro subindo devagar, com desfoque do fundo */
const rand = mulberry32(42);
const TRIS = Array.from({ length: 7 }, (_, i) => ({
  i,
  size: 56 + rand() * 120,
  left: 4 + rand() * 88,
  dur: 30 + rand() * 26,
  delay: -rand() * 56,
  dx: (rand() - 0.5) * 140,
  r0: rand() * 360,
  r1: rand() * 360 + 140,
}));

export function Triangles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {TRIS.map((t) => (
        <span
          key={t.i}
          className="tri-glass"
          style={
            {
              left: `${t.left}%`,
              width: t.size,
              height: t.size * 0.88,
              "--dur": `${t.dur}s`,
              "--delay": `${t.delay}s`,
              "--dx": `${t.dx}px`,
              "--r0": `${t.r0}deg`,
              "--r1": `${t.r1}deg`,
            } as CSSProperties
          }
        >
          <i />
          <i />
        </span>
      ))}
    </div>
  );
}
