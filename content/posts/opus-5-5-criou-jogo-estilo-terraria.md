---
title: "Pedi um jogo estilo Terraria para o Claude Opus 5.5 — em 27 minutos eu já estava jogando"
slug: "opus-5-5-criou-jogo-estilo-terraria"
excerpt: "Três mensagens, pouco mais de uma hora e zero dependências: o Opus 5.5 construiu um sandbox 2D com mineração, construção, luz colorida, inimigos, armaduras, um chefe e multiplayer. E você pode jogar aqui no portfólio."
tags: ["IA", "Claude", "Opus 5.5", "Game Dev", "JavaScript"]
featured: true
coverImage: "public/blog/projeto-terra-capa.png"
---

> **Resumo:** mandei uma mensagem pedindo um jogo parecido com Terraria, mas com pixel art e animações melhores. **27 minutos depois**, o Claude Opus 5.5 me entregou um protótipo jogável. Mais meia hora e ele tinha inimigos, inventário, armaduras, armas, um chefe e multiplayer. Vinte minutos depois, um sistema de construção completo. Tudo em HTML5 Canvas e JavaScript puro, sem nenhuma biblioteca. [Jogue agora o Projeto Terra](/jogo) — roda direto no navegador.

![O Projeto Terra rodando no navegador](IMAGEM: capa em public/blog/projeto-terra-capa.png)

## O pedido

Eu queria testar até onde o Opus 5.5 vai quando o pedido é vago e ambicioso ao mesmo tempo. A primeira mensagem foi literalmente esta:

> "Vamos criar um jogo parecido com Terraria, mas a prioridade é superar esse jogo. Vamos fazer com que os pixels e as animações fiquem melhores. Como faríamos?"

Eu esperava um plano. Ele respondeu com um jogo.

## A linha do tempo (de verdade)

Tirei os horários direto da conversa (horário de Brasília):

| Horário | O que aconteceu |
|---|---|
| 16:37 | Primeira mensagem: "um jogo parecido com Terraria, mas melhor" |
| 17:04 | Protótipo jogável no ar, rodando a 60 fps: mundo gerado, mineração, construção, luz e dia/noite |
| 17:06 | Segunda mensagem: "melhore o personagem, coloque inimigos, melhore o inventário, coloque armaduras e multiplayer" |
| 17:36 | Tudo entregue — e testado com dois jogadores conectados ao mesmo tempo |
| 17:36 | Terceira mensagem: "faz um túnel para expor o game, e ele não precisa ter bichos toda hora" |
| 17:56 | Jogo no ar por um link público para os amigos entrarem, sistema de construção completo e inimigos bem mais raros |

Ou seja: **27 minutos até o primeiro jogo jogável**, cerca de **uma hora** até uma versão com combate, chefe e multiplayer, e **1h19 no total** — com construção e o jogo aberto para os amigos. O resultado tem **4.996 linhas de JavaScript em 22 módulos** e **zero dependências**.

## O que mais me impressionou: ele testou o próprio jogo

Não foi "gerar código e torcer". Durante o processo, o Opus abriu o jogo no navegador, andou pelo mundo, minerou blocos, entrou em cavernas com tochas, conferiu a noite e mediu o desempenho (entre 3 e 8 ms de CPU por quadro). No multiplayer, ele abriu dois jogadores e verificou que um via o outro, que um bloco colocado aparecia para os dois e que o chat chegava. Na construção, ele levantou uma casinha usando as próprias ações do jogo — paredes, telhado, porta, plataforma, móveis e itens guardados no baú — e recarregou a página para confirmar que tudo continuava lá.

Quando algo não funcionava, ele ajustava e testava de novo. Esse ciclo de **construir → jogar → corrigir** é o que separa um protótipo bonito de um jogo que você realmente consegue jogar.

## Como ele "superou" o Terraria no visual

A ideia não foi copiar o Terraria, mas corrigir o que envelheceu nele mantendo o charme do pixel art:

- **Luz colorida e suave:** cada bloco propaga luz RGB com gradiente. A tecla **L** alterna para o modo "retrô" em quadrados, só para comparar.
- **Personagem 100% procedural:** ciclo de corrida, respiração, piscar, poses de pulo e queda. Os olhos seguem o mouse e o cachecol tem física.
- **Squash & stretch sem distorcer pixels:** a deformação é feita na pose (as pernas agacham e esticam), não escalando o sprite.
- **Golpes com peso:** antecipação, impacto, follow-through e rastro de borrão (*smear*), com tremor de tela e blocos que racham.
- **Mundo vivo:** grama e flores balançam com o vento e se afastam quando você passa, folhas caem das árvores e vaga-lumes aparecem à noite.
- **Pixel perfeito:** resolução interna fixa com upscale inteiro, câmera sub-pixel que rola sem tremer e contorno seletivo em vez de preto puro.

## O que tem no jogo

- **Armas:** espadas de madeira, cobre e cristal, arco com flechas que cravam nos blocos e um cajado de cristal com orbes teleguiados.
- **Armaduras:** conjuntos de cobre e cristal desenhados no corpo do personagem, com bônus de conjunto. O de cristal brilha no escuro.
- **Construção:** portas que abrem e fecham (e barram zumbis), plataformas que você atravessa por baixo, paredes de fundo de madeira, pedra e terra, e um martelo para removê-las.
- **Móveis:** bancada de trabalho, baú com 20 espaços e fornalha com fogo animado que ilumina em volta. Algumas receitas só funcionam perto da bancada ou da fornalha.
- **Inimigos:** gosmas que se preparam antes de pular, zumbis à noite e morcegos nas cavernas. Ao morrer, se desfazem pixel por pixel. Eles vêm em ondas pequenas à noite, com calmaria entre elas — dá tempo de construir em paz.
- **Chefe — O Abominável:** um olho gigante que te segue, boca de dentes podres, tentáculos com física, investidas, cuspe ácido e fase de fúria. Invoque com a *Isca nojenta* (slot 9 da hotbar) — se tiver coragem.
- **Inventário e criação:** 40 espaços, arrastar e soltar e receitas para criar itens.

## Como jogar

Abra [/jogo](/jogo) no computador (ele precisa de teclado e mouse):

- **A / D** para andar e **Espaço** para pular (segure para pular mais alto)
- **Botão esquerdo** usa o item: minera, ataca, atira ou coloca blocos
- **1 a 0** ou a roda do mouse trocam o item da hotbar
- **E** abre o inventário, as armaduras e a criação
- **Botão direito** abre e fecha portas e baús; **S** desce das plataformas; o **martelo** (tecla 0) remove paredes
- **T** (segurando) acelera o dia; espere a noite para ver a luz das tochas
- **L** compara a luz suave com a retrô

> 💡 Aqui no portfólio o jogo roda **offline**: o mundo é gerado no seu navegador, e só o personagem e o inventário ficam salvos — as construções somem ao recarregar a página. O multiplayer existe (dá para abrir o jogo para os amigos por um túnel apontando para o seu computador — o Opus configurou isso e testou a conexão de fora), mas precisa do servidor próprio do jogo rodando — algo que a hospedagem do portfólio não oferece. Quem sabe numa próxima versão.

## O que eu tiro disso

A barreira entre "ter uma ideia" e "ter algo funcionando" praticamente sumiu. Eu não escrevi uma linha desse jogo: meu trabalho foi **dizer o que eu queria e cobrar qualidade**. E foi exatamente isso que fez diferença: em vez de pedir "um jogo tipo Terraria", pedi para **superar** o Terraria no que mais importa para mim — pixels e animação. O Opus 5.5 levou esse critério a sério em cada detalhe.

Para mim, como desenvolvedor, isso muda o jogo (sem trocadilho): o valor está cada vez mais em saber **o que construir, para quem e com qual padrão de qualidade**. A execução ficou muito, muito rápida.

Agora é com você: [entre no Projeto Terra](/jogo), minere até uma caverna, construa uma casa com porta e fornalha e me conte o que achou. E se derrotar o Abominável, eu quero saber. 👾
