"use client";

import { useEffect, useState } from "react";

const GLYPHS = "█▓▒░<>/\\|=+*#01XYZ";

/** texto que "decodifica" a partir de caracteres aleatórios quando `play` liga */
export function Scramble({ text, play, duration = 650 }: { text: string; play: boolean; duration?: number }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const reveal = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        s += i < reveal || text[i] === " " ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, text, duration]);
  return (
    <span aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
