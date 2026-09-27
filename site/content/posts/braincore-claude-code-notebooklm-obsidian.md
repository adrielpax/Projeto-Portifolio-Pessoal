---
title: "Braincore: conecte o Claude Code ao NotebookLM e ao Obsidian e construa seu segundo cérebro"
slug: "braincore-segundo-cerebro-claude-code-notebooklm-obsidian"
excerpt: "Como transformar o Claude Code no núcleo de um segundo cérebro: capturando no Obsidian, organizando com IA e sintetizando no NotebookLM. O fluxo que eu chamo de Braincore."
tags: ["IA", "Claude Code", "Obsidian", "NotebookLM", "Segundo Cérebro", "Produtividade"]
featured: true
coverImage: "Canva: capa gerada (faça upload no Studio)"
---

> **Resumo:** um "segundo cérebro" só funciona de verdade quando alguém *organiza* o que você joga lá dentro. A ideia do **Braincore** é colocar o **Claude Code** como esse núcleo pensante: você captura no **Obsidian**, o Claude Code conecta, distila e relaciona as notas, e o **NotebookLM** sintetiza tudo em resumos e áudio. Três ferramentas, um cérebro.

![As três peças do Braincore: Obsidian, Claude Code e NotebookLM](IMAGEM: capa do Canva)

## O problema do "segundo cérebro" tradicional

Quase todo mundo que tenta montar um segundo cérebro esbarra no mesmo muro: **acúmulo sem síntese**. Você salva links, anota ideias, joga PDFs numa pasta — e seis meses depois tem um cemitério de notas que ninguém lê.

Falta um *bibliotecário*: alguém que leia o que entrou, conecte com o que já existe, descarte o ruído e transforme tudo em conhecimento utilizável. Esse bibliotecário não precisa ser você. Pode ser uma IA com acesso direto às suas notas.

É aí que entra o **Braincore**.

## As três peças

| Peça | Papel no cérebro | Por quê |
|---|---|---|
| **Obsidian** | A **memória** | Suas notas em arquivos `.md` locais, com links `[[ ]]`. Você é dono dos dados, em texto puro. |
| **Claude Code** | O **núcleo / córtex** | Lê e escreve direto no seu vault: organiza, conecta, resume e cria novas notas. É o agente que pensa sobre a memória. |
| **NotebookLM** | A **síntese** | Ingere as notas como fontes e devolve resumos, mapas mentais e até *podcasts* de áudio do seu próprio conteúdo. |

A sacada é que o **Obsidian é só uma pasta de arquivos markdown**. E o Claude Code é excelente justamente em ler e escrever arquivos. Então a conexão entre eles é direta — sem plugin, sem API.

## Parte 1 — Claude Code + Obsidian (a memória viva)

Um vault do Obsidian é uma pasta no seu computador. Basta abrir o Claude Code apontando para ela:

```bash
# abra o Claude Code dentro do seu vault
cd /caminho/do/seu/vault-obsidian
claude
```

A partir daqui, o Claude Code enxerga todas as suas notas. Você pode pedir coisas como:

```text
você › leia minhas notas da pasta /inbox, conecte cada ideia
        com notas existentes usando links [[ ]] e mova para /permanentes
```

Para o cérebro ter **identidade e regras**, crie um arquivo `CLAUDE.md` na raiz do vault. Ele é lido automaticamente em toda sessão:

```markdown
# CLAUDE.md — regras do meu segundo cérebro

- Notas novas chegam em /inbox. Sua função é processá-las.
- Sempre conecte ideias com links [[wikilink]] do Obsidian.
- Use tags #area/... para classificar por área da vida.
- Nunca apague uma nota; mova para /arquivo se ficar obsoleta.
- Escreva no meu tom: direto, sem jargão desnecessário.
```

> 💡 **Dica:** peça ao Claude Code para manter um arquivo `MOC.md` (Map of Content) — um índice vivo que ele atualiza sozinho conforme novas notas entram. É o sumário do seu cérebro.

## Parte 2 — Claude Code + NotebookLM (a síntese)

O Obsidian guarda; o **NotebookLM entende e sintetiza**. O fluxo:

1. O Claude Code seleciona as notas relevantes de um tema (ex: tudo com a tag `#projeto/x`).
2. Essas notas viram **fontes** no NotebookLM.
3. O NotebookLM gera: **resumo**, **guia de estudo**, **linha do tempo** e o famoso **Audio Overview** (um podcast com dois apresentadores discutindo *o seu* conteúdo).

Você pode automatizar a ingestão com a API do NotebookLM, criando um notebook por área do seu cérebro:

```text
você › junte minhas notas sobre "arquitetura de software" em um único
        documento e crie um notebook no NotebookLM com elas como fonte
```

O resultado: você "estuda" o próprio conhecimento ouvindo um podcast no trânsito, gerado a partir das notas que o Claude Code organizou.

![Fluxo do Braincore: capturar → organizar → sintetizar](IMAGEM: diagrama do Canva)

## Parte 3 — O loop Braincore (onde a mágica acontece)

A força não está em nenhuma ferramenta isolada, e sim no **ciclo**:

1. **Capturar** — você joga ideias cruas no `/inbox` do Obsidian (pelo celular, no meio do dia).
2. **Processar** — o Claude Code lê o inbox, conecta com notas antigas, cria links e tags, descarta duplicatas.
3. **Sintetizar** — o NotebookLM transforma um cluster de notas em resumo + áudio.
4. **Devolver** — os insights da síntese voltam para o Obsidian como notas novas.

E o ciclo recomeça, cada volta deixando o cérebro mais denso e conectado. O Claude Code aberto, processando esse fluxo, é o que eu chamo de **Braincore** — o núcleo do cérebro.

## Por que isso muda o jogo

- **Você para de organizar manualmente.** Captura no impulso; o Claude Code arruma depois.
- **Nada se perde.** Toda nota é conectada a algo — o oposto do cemitério de notas.
- **Você consome seu próprio conhecimento.** Resumos e podcasts feitos sob medida do que *você* salvou.
- **Tudo é seu.** Markdown local no Obsidian. Sem lock-in, sem nuvem obrigatória.

## Recapitulando

- ✅ **Obsidian** = memória em markdown (seus dados, seu controle).
- ✅ **Claude Code** = o córtex que lê, conecta e escreve no vault.
- ✅ **NotebookLM** = a síntese em texto e áudio.
- ✅ **Braincore** = o loop capturar → processar → sintetizar → devolver.

Comece simples: aponte o Claude Code para um vault, crie um `CLAUDE.md` com 5 regras e processe seu primeiro `/inbox`. Em uma semana, seu segundo cérebro deixa de ser um depósito e vira um interlocutor.

---

### Ferramentas citadas

- Claude Code — o agente de código da Anthropic no terminal
- Obsidian — notas locais em markdown com links
- NotebookLM — síntese e Audio Overviews do Google
