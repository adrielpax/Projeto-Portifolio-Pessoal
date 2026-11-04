# Portfólio v3 (protótipo)

Reescrita do portfólio: estética de controle de missão + pixel art, com cena 3D e uma timeline de scroll que transforma o card do hero na navbar.

O plano completo (conceito, mapa de cenas, roadmap e decisões em aberto) está em [`docs/PLANO.md`](docs/PLANO.md).

## Rodar

```bash
cd web
npm install
npm run dev
```

Abra http://localhost:3000 (home) e http://localhost:3000/links (linktree).

## Onde mexer

| Quero mudar… | Arquivo |
| --- | --- |
| Textos, links, projetos, posts, camadas da stack | `lib/content.ts` |
| Personagens em pixel art (desenho e animação) | `components/pixel/sprites.ts` |
| Falas, código digitado e posições dos agentes por seção | `components/pixel/agents.ts` |
| Coreografia do scroll (card → navbar, entrada das seções) | `components/experience/Experience.tsx` |
| Grafo neural (nós, pulsos, trechos de código) | `components/three/NeuralGraph.tsx` |
| Equipamento que desmonta | `components/three/Device.tsx` |
| Cores e fontes | `app/globals.css` (`@theme`) |

## Como funciona

- O palco é fixo; um trilho invisível de 600vh gera o scroll nativo.
- Uma timeline GSAP com 6 rótulos (`hero`, `projects`, `stack`, `stack-open`, `blog`, `contact`) é controlada pelo scroll com `scrub` + `snap`.
- `lib/stage.ts` guarda o tempo da timeline e o mouse; a cena 3D lê isso a cada frame (`kf()` em `lib/math.ts` interpola valores por rótulo).
- O botão **Conectar** dos agentes dispara `window.dispatchEvent(new CustomEvent("agent:connect", { detail: { id } }))`: é o gancho para a integração real.
