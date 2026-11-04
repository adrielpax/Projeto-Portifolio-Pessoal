"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Crop = { x: number; y: number; size: number };

type Props = {
  src: string;
  crop: Crop;
  /** resolução da grade de pixels em repouso */
  grid?: number;
  /** ao passar o mouse a foto "resolve" de pixel para a imagem real */
  interactive?: boolean;
  className?: string;
  alt?: string;
};

/**
 * Desenha a foto numa grade pequena, em tons de cinza posterizados,
 * e escala com image-rendering: pixelated. No hover a grade aumenta
 * até revelar a foto original.
 */
export function PixelAvatar({ src, crop, grid = 34, interactive = false, className = "", alt = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const res = useRef({ n: grid });
  const [reveal, setReveal] = useState(false);

  const draw = useCallback(
    (n: number) => {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return;
      const size = Math.max(4, Math.round(n));
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const s = img.naturalWidth * crop.size;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, img.naturalWidth * crop.x, img.naturalHeight * crop.y, s, s, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size);
      const d = data.data;
      const levels = 6;
      for (let i = 0; i < d.length; i += 4) {
        const px = (i / 4) % size;
        const py = Math.floor(i / 4 / size);
        // vinheta: escurece as bordas para destacar o rosto
        const dx = px / size - 0.5;
        const dy = py / size - 0.45;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vig = 1 - 0.6 * Math.min(1, Math.max(0, (dist - 0.28) / 0.4));
        let l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        l = Math.pow(l, 0.72) * vig;
        let v = (l - 0.45) * 1.25 + 0.5;
        v = Math.min(1, Math.max(0, v));
        v = Math.round(v * (levels - 1)) / (levels - 1);
        // leve tom quente nos claros para não ficar "morto"
        d[i] = v * 240;
        d[i + 1] = v * 234;
        d[i + 2] = v * 226;
      }
      ctx.putImageData(data, 0, 0);
    },
    [crop.size, crop.x, crop.y],
  );

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      draw(res.current.n);
    };
  }, [src, draw]);

  const animateTo = (n: number, onDone?: () => void) => {
    tween.current?.kill();
    tween.current = gsap.to(res.current, {
      n,
      duration: 0.45,
      ease: "steps(7)",
      onUpdate: () => draw(res.current.n),
      onComplete: onDone,
    });
  };

  const onEnter = () => {
    if (!interactive) return;
    animateTo(140, () => setReveal(true));
  };
  const onLeave = () => {
    if (!interactive) return;
    setReveal(false);
    animateTo(grid);
  };

  return (
    <div
      className={`relative overflow-hidden bg-faint ${className}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      role="img"
      aria-label={alt}
    >
      <canvas ref={canvasRef} className="pixelated absolute inset-0 h-full w-full" />
      {interactive && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute max-w-none transition-opacity duration-300"
          style={{
            opacity: reveal ? 1 : 0,
            width: `${100 / crop.size}%`,
            left: `${(-crop.x / crop.size) * 100}%`,
            top: `${(-crop.y / crop.size) * 100}%`,
          }}
        />
      )}
    </div>
  );
}
