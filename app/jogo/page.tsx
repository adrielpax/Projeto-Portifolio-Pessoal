import type { Metadata } from "next";
import GameFrame from "./GameFrame";

export const metadata: Metadata = {
  title: "Projeto Terra — jogue no navegador",
  description:
    "Sandbox 2D estilo Terraria criado com o Claude Opus 5.5 em pouco mais de uma hora: mineração, construção, inimigos, armaduras e um chefe. Roda direto no navegador.",
  alternates: { canonical: "/jogo" },
};

/**
 * O jogo fica FORA do shell do portfólio: precisa da tela inteira, do teclado
 * e do mouse (esconde o cursor). Ele vive em /games/terra como site estático
 * e é carregado num iframe da mesma origem.
 */
export default function JogoPage() {
  return <GameFrame />;
}
