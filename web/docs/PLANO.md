# Portfólio v3: plano de produto e design

> Status: **protótipo funcional** em `web/`. O site antigo em `site/` continua intacto até a troca.

## 1. Conceito

**"Painel de missão com alma de jogo."**
Estética minimalista de controle de missão (preto, branco, tipografia larga, telemetria, cantoneiras de HUD) com fonte e personagens em pixel art. O jogo aparece nos detalhes (agentes, avatar pixelado, decodificação de texto); a estrutura continua a de um sistema sério.

O objetivo da primeira dobra é responder em menos de 5 segundos:
**quem é** (nome + foto), **o que faz** (full stack · automação · IA) e **por que importa** (frase de impacto), com os links ao alcance.

## 2. Direção de arte (revisão 2)

A primeira versão caiu em padrões típicos de página gerada por IA (preto azulado + verde-ácido, rótulos em caixa alta espaçada, "A · B · C", setas em todo link, cantoneiras de HUD, animação de entrada em toda seção). A revisão segue a skill `frontend-design` (em `.claude/skills/`):

| Token | Valor | Uso |
| --- | --- | --- |
| Vácuo | `#000000` | fundo |
| Branco | `#ffffff` | texto, botões principais |
| Cinza | `#8c8c8c` | texto secundário |
| Clawd | `#d97757` | só no Clawd e nas coisas dele |
| Codex | `#8fa2ff` | só no Codex |
| Comunidades do grafo | laranja, amarelo, ciano, verde, lilás | IA, Python, Frontend, Backend, Automação industrial |

- **Vidro estilo Apple (Liquid Glass)**: `.glass` em `app/globals.css`. Desfoque + saturação, aro de refração, brilho especular que segue o ponteiro e hover com mola. Usado no card do hero, na moldura, na navbar (pílula), nos cards, no blog, no formulário e nos chats dos agentes.
- **Tipografia**: Pixelify Sans (pixel com minúsculas reais) nos títulos em caixa normal; Barlow (família DIN, sinalização industrial) no texto.
- **Movimento**: um único momento de palco, o card virando navbar. Seções trocam por fade. Sem tela de boot e sem texto embaralhando.
- **Grafo de fundo no estilo graphify**: comunidades coloridas, nós nomeados com rótulo, satélites e pontes entre áreas (`lib/graph.ts`), layout por forças e pulsos percorrendo as ligações.

### Revisão 3
- **Personagens**: Clawd (pixels quadrados, olhos pretos, bracinhos, quatro perninhas) e Codex (robô-nuvem azul com `>_` no rosto), cada um com notebook. Animações de trabalho (digitar, piscar, cursor). No hover acenam e aparece um botão de chat flutuante; o mini chat abre num balão sobre a cabeça. As pessoas genéricas em pixel saíram.
- **Foto**: redonda, sem pixelado (`components/ProfilePhoto.tsx`).
- **Navbar como IHM industrial de nova geração**: seletor de telas em vidro com thumb deslizante (mola), LED verde na tela ativa, barra de processo com marcações de escala (progresso do scroll) e status "Online em Betim" com relógio ao vivo.
- **Acessibilidade**: painel com três chaves (reduzir movimento, alto contraste, texto maior) salvas no navegador e iniciadas pelas preferências do sistema; link "Pular para o conteúdo"; anúncio da seção atual para leitor de tela; Esc fecha chats e painel; títulos de seção focáveis; cena 3D e rodapé ocultos de leitores de tela.

## 3. Arquitetura da experiência

O scroll **não** rola a página. Ele move uma linha do tempo.

```
┌─ palco fixo (100vw × 100vh) ───────────────────────────┐
│  z50  Navbar        (começa vazia, recebe o card)      │
│  z40  Telemetria                                        │
│  z30  Agentes pixel (hover → chat + CONECTAR)           │
│  z20  Card do hero → moldura → seções                   │
│  z0   Cena 3D (grafo neural + equipamento)              │
└─────────────────────────────────────────────────────────┘
  .track  (600vh, invisível): só gera o scroll nativo
```

Uma **timeline GSAP única** com 6 rótulos, ligada ao scroll por ScrollTrigger (`scrub` + `snap: labelsDirectional`). Cada gesto de rolagem leva à próxima parada. A cena 3D lê o mesmo tempo (`stage.t`), então DOM e WebGL ficam sincronizados sem eventos extras.

| t | Rótulo | O que acontece |
| --- | --- | --- |
| 0 | `hero` | Card central com avatar pixelado, nome, frase e links. Agentes e usuários flutuam e programam em volta. Grafo neural pulsando atrás. |
| 0 → 1 | | **A mágica**: o avatar voa e vira o ícone de perfil da navbar (esquerda); os links voam para a direita e formam a navbar; o fundo do card cresce e vira a moldura da seção. |
| 1 | `projects` | Projetos em cards com "assinatura" em pixel. Grafo recua para a direita. |
| 2 | `stack` | Equipamento 3D sobe montado. Grafo some ao fundo. |
| 3 | `stack-open` | O equipamento **desmonta** camada por camada; cada peça é uma camada da stack (tampa=Frontend, processador=IA, placa=Backend, cooler=Automação, baterias=Dados, base=Infra). |
| 4 | `blog` | Lista de posts estilo log. Equipamento sai por cima. |
| 5 | `contact` | Chamada grande + formulário. Grafo volta "pensando mais rápido" (pulsos 2×). |

A navbar faz `scrollTo` para o rótulo; links `/#blog` funcionam vindos de outras páginas.

## 4. Cenas 3D

**Grafo de memória (sempre presente)**
- 170 neurônios em forma de "cérebro" (aglomerados dentro de um elipsoide), 3 vizinhos mais próximos + ligações longas.
- 70 pulsos com rastro viajam de nó em nó; ao chegar, o nó acende e o caminho brilha (branco, laranja Claude, azul Codex).
- Trechos de código (`memory.recall(k=8)`, `attention(q,k,v)`…) aparecem perto dos nós mais conectados.
- Shaders próprios: pontos quadrados (pixel) com halo, sem texturas externas.

**Equipamento que desmonta**
- Modelado de forma procedural (sem arquivo .glb), materiais escuros com arestas brancas (visual de blueprint).
- Explosão escalonada pelo scroll, parafusos saem primeiro, cooler acelera.
- Rótulos HTML projetados a cada frame (camada própria em `lib/overlay.ts`).

## 5. Agentes em pixel art

- **Claude**: o **Clawd**, mascote do Claude Code, reproduzido pixel a pixel a partir do logo em blocos do terminal (pixels 2× mais altos que largos, como no terminal), com um notebook ao lado. **Codex**: não existe mascote oficial em pixel; usamos o prompt `>_` que abre o Codex CLI, numa caixa de terminal. **Usuários de IA**: 3 devs de moletom (variações de cor, um com fone).
- Desenhados como texto (`components/pixel/sprites.ts`): fácil criar novos personagens e frames.
- Animações: piscar, digitar (mãos alternando), flutuar, parallax com o mouse.
- Claude e Codex têm terminal flutuante digitando código em loop (só no hero).
- **Hover/tap** abre a barrinha de chat com saudação digitada + campo de mensagem + botão **CONECTAR**.
  - Hoje: dispara `window` event `agent:connect` com `{ id }` e mostra "Em breve".
  - Fase 4: abrir sessão real (ver roadmap).
- Os agentes acompanham o scroll: flanqueiam o card no hero, ficam na coluna livre em Projetos/Blog, "trabalham" ao lado do equipamento na Stack e voltam no Contato.

> Nota de marca: os personagens são criações originais inspiradas nos produtos, sem logotipos oficiais. Se quiser usar logos reais de Anthropic/OpenAI, conferir as diretrizes de marca de cada empresa.

## 6. Linktree

**Decisão: página separada em `/links`**, porque:
- É o link de bio (Instagram, GitHub, LinkedIn): precisa abrir instantaneamente no celular, então **sem WebGL**.
- Mantém a identidade (avatar pixelado, cantoneiras, Claude/Codex flutuando no desktop).
- A navbar e o card do hero apontam para ela.

## 7. Stack técnica

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript | SEO, rotas (`/links`, `/blog/[slug]`), API routes para contato e agentes |
| Estilo | Tailwind CSS 4 | tokens no `@theme`, sem arquivo de config |
| 3D | three + @react-three/fiber 9 | cena declarativa; shaders próprios |
| Animação | GSAP 3 + ScrollTrigger + @gsap/react | timeline única com scrub/snap e rótulos |
| Fontes | @fontsource (Pixelify Sans, Barlow) | self-hosted, sem depender de rede no build |

## 8. Performance e acessibilidade

- Cena 3D carregada com `dynamic(..., { ssr: false })`; `dpr` limitado a 1.75.
- `prefers-reduced-motion`: sem boot, sem flutuação, pulsos e rotação desacelerados.
- Conteúdo de todas as seções existe no DOM (indexável, legível por leitor de tela); navegação por teclado com foco visível.
- A timeline é reconstruída no resize real (ignora barra de endereço do mobile).
- **A fazer**: fallback sem WebGL (imagem estática), medir Lighthouse no mobile, avaliar remover `backdrop-filter` da moldura em aparelhos fracos.

## 9. Roadmap

- [x] **Fase 0: protótipo** (este PR): experiência completa com conteúdo placeholder.
- [ ] **Fase 1: conteúdo real**: textos finais, projetos com links/imagens, LinkedIn/email, revisar a frase de impacto.
- [ ] **Fase 2: blog**: posts em MDX (`content/blog/*.mdx`), rota `/blog/[slug]` com o mesmo visual, RSS.
- [ ] **Fase 3: contato de verdade**: `POST /api/contact` com validação (zod), honeypot + rate limit, envio por email (Resend) ou planilha. **Corrigir o site antigo** (ver §11).
- [ ] **Fase 4: CONECTAR**: botão abre chat real com um agente que conhece o portfólio (Claude via API Anthropic em route handler com streaming; system prompt com currículo/projetos; limites de uso). Codex pode ficar como "executor" de demos.
- [ ] **Fase 5: polimento e deploy**: OG image em pixel, favicon animado, fallback sem WebGL, testes E2E (Playwright) das paradas do scroll, trocar a raiz do deploy de `site/` para `web/`.

## 10. Decisões em aberto

1. **Frase de impacto**: "Código que trabalha enquanto você dorme." Manter ou trocar?
2. **Avatar**: foto pixelada (hover revela a foto real) ou um sprite seu em pixel art desenhado à mão?
3. **Projetos**: curadoria manual (atual) ou puxar do GitHub com stars/linguagem?
4. **Blog**: MDX no repositório ou CMS (o README antigo cita Strapi)?
5. **Idioma**: só PT-BR ou PT/EN?

## 11. Achados no site antigo (`site/`)

- `site/.env` está versionado com a URL do Google Apps Script, e `pages/api/contacts.ts` tem a mesma URL como fallback no código.
- O "painel admin" abre digitando `admin` no teclado, sem autenticação, e lê os contatos enviados (nomes, emails, mensagens) via `GET /api/contacts`.
- Recomendação: remover o `.env` do git, trocar a URL do Apps Script (gerar nova implantação) e proteger/remover a leitura de contatos antes de qualquer novo deploy.
