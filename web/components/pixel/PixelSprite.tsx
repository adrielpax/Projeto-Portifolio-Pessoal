"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { frameRows, type SpriteDef } from "./sprites";

type Rect = { x: number; y: number; w: number; fill: string };

/** junta pixels vizinhos da mesma cor numa linha para gerar menos <rect> */
function toRects(rows: string[], palette: Record<string, string>): Rect[] {
  const out: Rect[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === ".") {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      out.push({ x, y, w, fill: palette[ch] });
      x += w;
    }
  });
  return out;
}

function useFrameCycle(sprite: SpriteDef, playing: boolean, waving: boolean) {
  const seq = waving && sprite.waveSeq ? sprite.waveSeq : sprite.seq;
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    if (!playing) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setStep((s) => (s + 1) % seq.length);
    }, sprite.ms);
    return () => window.clearInterval(id);
  }, [sprite, seq, playing]);
  return playing ? (seq[step] ?? 0) : 0;
}

type Props = {
  sprite: SpriteDef;
  /** tamanho de cada pixel em px de tela */
  px?: number;
  playing?: boolean;
  /** toca a animação de aceno no lugar da de trabalho */
  waving?: boolean;
  className?: string;
  title?: string;
};

function PixelSpriteBase({ sprite, px = 5, playing = true, waving = false, className, title }: Props) {
  const frame = useFrameCycle(sprite, playing, waving);
  const rects = useMemo(() => toRects(frameRows(sprite, frame), sprite.palette), [sprite, frame]);
  const h = sprite.rows.length;
  return (
    <svg
      width={sprite.width * px}
      height={h * px}
      viewBox={`0 0 ${sprite.width} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}

export const PixelSprite = memo(PixelSpriteBase);
