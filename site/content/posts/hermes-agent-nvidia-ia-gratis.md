---
title: "IA gratuita na prática: instale o Hermes Agent + NVIDIA NIM e crie seus próprios agentes"
slug: "hermes-agent-nvidia-ia-gratis"
excerpt: "Um guia passo a passo para usar inteligência artificial de graça com o build.nvidia.com, instalar o Hermes Agent e criar agentes de IA simples — sem cartão de crédito."
tags: ["IA", "Hermes Agent", "NVIDIA NIM", "Agentes", "Tutorial"]
featured: true
coverImage: "public/blog/hermes-nvidia-capa.svg  (faça upload como capa no Studio)"
---

> **Resumo:** dá para usar IA de ponta **sem pagar nada** combinando o **NVIDIA NIM** (build.nvidia.com), que libera 100+ modelos com chave gratuita, e o **Hermes Agent**, um agente de código aberto da Nous Research que *aprende com o uso*. Neste post você instala tudo, conecta a IA gratuita e cria seu primeiro agente.

![Fluxo: build.nvidia.com → Hermes Agent → seus agentes](IMAGEM: faça upload de public/blog/hermes-nvidia-capa.svg)

## Por que essa combinação?

A maioria das pessoas acha que rodar IA boa custa caro. Não precisa. A jogada é separar duas coisas:

- **O "cérebro" (o modelo):** quem fornece a inteligência. Aqui usamos o **NVIDIA NIM**, que dá uma chave de API gratuita com **40 requisições/minuto** e **mais de 100 modelos**, sem cartão de crédito.
- **O "corpo" (o agente):** quem executa tarefas, lembra do contexto e cria habilidades. Aqui usamos o **Hermes Agent** — *"o agente que evolui com você"*.

O Hermes tem um **ciclo de aprendizado fechado**: ele cria habilidades a partir da experiência, busca em conversas passadas e vai melhorando sozinho. E o melhor: conecta no NVIDIA NIM com **uma variável de ambiente e uma linha de configuração**.

---

## Parte 1 — Pegue sua chave de IA gratuita (NVIDIA NIM)

Leva de 3 a 5 minutos e **não pede cartão**.

1. Acesse **[build.nvidia.com](https://build.nvidia.com)** e crie uma conta gratuita (e-mail e senha).
2. Vá em **Settings → API Keys** (`build.nvidia.com/settings/api-keys`) ou abra qualquer modelo no catálogo e clique em **Get API Key**.
3. Clique em **Generate API Key**. Você recebe uma chave que começa com `nvapi-`, com créditos gratuitos de inferência e limite de **40 req/min**.

> 💡 Guarde a chave em local seguro. Ela é como uma senha — nunca a publique em repositórios públicos.

### Teste rápido (opcional)

A API é compatível com a biblioteca da OpenAI. Se quiser confirmar que sua chave funciona antes de seguir:

```python
# teste_nvidia.py
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"],
)

resp = client.chat.completions.create(
    model="nvidia/llama-3.3-nemotron-super-49b-v1.5",
    messages=[{"role": "user", "content": "Diga olá em uma frase curta."}],
    max_tokens=64,
)

print(resp.choices[0].message.content)
```

Se imprimiu uma resposta, sua IA gratuita está no ar. ✅

---

## Parte 2 — Instale o Hermes Agent

O Hermes roda em Linux, macOS, WSL2 e Termux, e também no Windows. Ele já traz o que precisa (Python, Node, Git, etc.).

**Linux / macOS / WSL2 / Termux:**

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

**Windows (PowerShell):**

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

> ⚠️ Antes de rodar qualquer script de instalação da internet, confirme que a URL é a oficial (`hermes-agent.nousresearch.com`). Boa prática de segurança sempre.

Depois de instalar, recarregue o terminal e inicie:

```bash
source ~/.bashrc    # ou ~/.zshrc
hermes              # começa a conversar
```

Comandos úteis que você vai usar bastante:

| Tarefa | Comando |
|---|---|
| Assistente de configuração | `hermes setup` |
| Escolher provedor/modelo de IA | `hermes model` |
| Configurar ferramentas | `hermes tools` |
| Diagnosticar problemas | `hermes doctor` |

---

## Parte 3 — Conecte a IA gratuita da NVIDIA ao Hermes

Aqui está a mágica: uma variável de ambiente e uma linha de config.

**1. Salve sua chave** no arquivo `~/.hermes/.env`:

```bash
# ~/.hermes/.env
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**2. Aponte o Hermes para a NVIDIA.** Você pode fazer pontual:

```bash
hermes chat --provider nvidia --model nvidia/nemotron-3-super-120b-a12b
```

Ou deixar **permanente** no `config.yaml`:

```yaml
# ~/.hermes/config.yaml
model:
  provider: "nvidia"
  default: "nvidia/nemotron-3-super-120b-a12b"
```

Pronto. O Hermes anexa automaticamente o cabeçalho de billing do NIM em cada requisição ao `build.nvidia.com` — você não configura mais nada.

![Hermes Agent rodando no terminal, conectado à NVIDIA](IMAGEM: faça upload de public/blog/hermes-terminal.svg)

> 🔁 **Trocar de modelo é trivial:** rode `hermes model` e escolha outro modelo do catálogo. Quer rodar local depois? Basta apontar `NVIDIA_BASE_URL=http://localhost:8000/v1` para uma instância NIM local.

---

## Parte 4 — Crie seu primeiro agente (simples, mas poderoso)

No Hermes, um "agente" é uma **skill**: um arquivo `SKILL.md` com instruções. Texto simples vira um superpoder reutilizável.

![Os 4 passos para criar um agente no Hermes](IMAGEM: faça upload de public/blog/hermes-criar-agente.svg)

### O jeito preguiçoso (recomendado)

Só **peça**. Depois de resolver uma tarefa, o Hermes oferece salvar o procedimento como skill — via a ferramenta `skill_manage`. Exemplo de conversa:

```text
você ›  crie um agente que resume os e-mails da minha caixa de entrada
hermes › Vou criar uma skill para isso. 🛠️
         → skills/resumo-email/SKILL.md criado
         ✓ skill salva! use com /resumo-email
```

### O jeito manual (controle total)

Crie a pasta e o arquivo:

```bash
mkdir -p ~/.hermes/skills/resumo-email
```

```markdown
---
name: resumo-email
description: Resume e prioriza os e-mails não lidos da caixa de entrada.
---

# Resumo de e-mails

Quando o usuário pedir um resumo da caixa de entrada:

1. Busque os e-mails não lidos das últimas 24h.
2. Agrupe por remetente e assunto.
3. Liste em tópicos: **urgente**, **responder hoje**, **pode esperar**.
4. Sugira 1 ação para cada item urgente.
```

Toda skill instalada vira automaticamente um **comando de barra**:

```text
/resumo-email resuma minha caixa de entrada de hoje
```

> 🧠 **Carregamento progressivo:** o Hermes só lê o conteúdo da skill quando realmente precisa — economizando tokens (e, portanto, créditos). Ele lista metadados primeiro e aprofunda sob demanda.

---

## Recapitulando

- ✅ **IA gratuita:** chave `nvapi-` no build.nvidia.com, 100+ modelos, 40 req/min, sem cartão.
- ✅ **Agente em 1 comando:** instale o Hermes e rode `hermes`.
- ✅ **Conexão em 2 linhas:** `NVIDIA_API_KEY` no `.env` + `provider: nvidia` no `config.yaml`.
- ✅ **Agentes sob medida:** um `SKILL.md` em markdown vira um `/comando` — e o próprio Hermes aprende novas skills sozinho.

A barreira para construir com IA caiu para perto de zero. Comece pequeno, crie uma skill que resolva uma chatice do seu dia, e deixe o agente evoluir com você.

---

### Fontes e leitura

- Hermes Agent — repositório oficial: github.com/NousResearch/hermes-agent
- Documentação do Hermes: hermes-agent.nousresearch.com/docs
- NVIDIA NIM — chaves de API: build.nvidia.com/settings/api-keys
