"use client";

import { useEffect, useState } from "react";

/** Relógio ao vivo estilo HUD (evita mismatch de hidratação). */
export default function SystemClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums text-hud-steel" suppressHydrationWarning>
      {time ?? "--:--:--"}
    </span>
  );
}
