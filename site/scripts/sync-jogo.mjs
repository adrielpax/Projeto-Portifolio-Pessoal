/**
 * Copia o Projeto Terra (jogo em HTML5 Canvas + JS puro) para o portfólio.
 *
 * Só vão os arquivos do cliente (index.html + src/). O server.js e os saves
 * ficam de fora: na Vercel não existe servidor WebSocket, então o jogo detecta
 * a ausência do multiplayer e roda offline, salvando no navegador.
 *
 * Uso:
 *   node scripts/sync-jogo.mjs [pasta-do-jogo]
 */

import { cpSync, existsSync, rmSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ORIGEM_PADRAO =
  "C:/Users/playe/OneDrive/Documentos/DEVELOPMENT/PROJETOS_2026_DESENVOLVIMENTO/TESTE";

const origem = resolve(process.argv[2] || ORIGEM_PADRAO);
const destino = resolve("public/games/terra");

for (const item of ["index.html", "src"]) {
  if (!existsSync(join(origem, item))) {
    console.error(`✗ não achei ${item} em ${origem}`);
    process.exit(1);
  }
}

rmSync(destino, { recursive: true, force: true });
cpSync(join(origem, "index.html"), join(destino, "index.html"));
cpSync(join(origem, "src"), join(destino, "src"), { recursive: true });

const arquivos = readdirSync(join(destino, "src")).filter((f) => f.endsWith(".js"));
const bytes = arquivos.reduce((n, f) => n + statSync(join(destino, "src", f)).size, 0);
console.log(
  `✓ Projeto Terra copiado: ${arquivos.length} módulos (${(bytes / 1024).toFixed(0)} KB) → public/games/terra`,
);
