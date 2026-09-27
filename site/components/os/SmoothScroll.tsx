"use client";

import { useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";

/**
 * Scroll suave apenas onde ele ajuda.
 *
 * Em telas de toque o navegador já entrega um scroll nativo excelente — nesses
 * casos o Lenis só adiciona atraso entre o dedo e a tela. Também respeitamos
 * quem pede menos movimento no sistema.
 */
const QUERY =
  "(pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  // No servidor não há mídia: começa com scroll nativo e liga no cliente.
  const suave = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );

  // O Lenis fica AO LADO da página, nunca em volta dela: trocar o elemento que
  // envolve `children` depois da hidratação remontaria a árvore inteira e o
  // React descartaria o HTML vindo do servidor.
  return (
    <>
      {suave && (
        <ReactLenis
          root
          options={{
            // 0.09 deixava a rolagem "descolada" do mouse; 0.18 mantém o
            // polimento sem a sensação de travamento.
            lerp: 0.18,
            smoothWheel: true,
            syncTouch: false,
          }}
        />
      )}
      {children}
    </>
  );
}
