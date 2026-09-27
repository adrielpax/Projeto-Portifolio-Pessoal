"use client";

import { useRef } from "react";

/**
 * Halo de luz que segue o cursor (classe `.spotlight` em globals.css).
 * Só escreve CSS vars dentro de rAF — nada de re-render por movimento —
 * e ignora ponteiros de toque, onde o efeito não faz sentido.
 */
export default function Spotlight({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || frame.current !== null) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--spot-x", `${x}px`);
      el.style.setProperty("--spot-y", `${y}px`);
      frame.current = null;
    });
  };

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
