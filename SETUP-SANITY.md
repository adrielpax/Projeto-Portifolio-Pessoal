# Conectar o Sanity (CMS grátis) ao portfólio

O site já funciona **sem** Sanity (usa dados de exemplo). Siga abaixo para
gerenciar todo o conteúdo pelo painel em `/studio`.

## 1. Criar o projeto (grátis)

1. Acesse https://www.sanity.io/manage e faça login (GitHub/Google).
2. Clique em **Create new project** → dê um nome (ex: `portfolio-adriel`).
3. Dataset: **production** (público).
4. Copie o **Project ID** que aparece no painel.

## 2. Preencher as variáveis de ambiente

1. Copie `.env.example` para `.env.local`.
2. Cole o Project ID:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=seuProjectIdAqui
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
NEXT_PUBLIC_SITE_URL=https://adrieldev.vercel.app
```

## 3. Liberar acesso (CORS)

No painel do Sanity → **API → CORS origins → Add origin**, adicione:

- `http://localhost:3000`
- a URL do seu deploy (ex: `https://seudominio.vercel.app`)

Marque **Allow credentials**.

## 4. Rodar

```bash
pnpm dev
```

- Site: http://localhost:3000
- Painel de gestão: http://localhost:3000/studio

Na primeira vez, o Studio vai pedir para **registrar o studio** ou **adicionar
host de desenvolvimento** — escolha registrar para sincronizar os schemas.

## 5. O que você gerencia no /studio

- **📝 Blog** — artigos com capa, corpo rico, tags, SEO (para ranquear no Google)
- **📨 Mensagens** — o que chega pelo formulário de contato do site
- **📸 Galeria de Projetos** — projetos e case studies
- **🛡️ Certificações**

Tudo que você publicar aparece no site automaticamente (revalida a cada 60s,
sem precisar de novo deploy).

## 6. Receber as mensagens do formulário

O formulário de contato (`/api/mensagem`) grava cada mensagem em todos os
destinos configurados — basta um funcionar para nada se perder.

### Sanity (recomendado)

1. sanity.io/manage → seu projeto → **API → Tokens → Add API token**.
2. Nome: `site-contato` · Permissão: **Editor**.
3. Cole em `SANITY_WRITE_TOKEN` (no `.env.local` e na Vercel).

As mensagens aparecem em **/studio → 📨 Mensagens**, com status
(nova / respondida / arquivada) e um campo de notas internas. Elas são gravadas
com ID `lead.<uuid>` — IDs com ponto ficam **fora da API pública** do dataset,
então nome e contato dos visitantes só aparecem para quem está logado.

> Use um token separado: o `SANITY_API_TOKEN` atual é só de leitura.

### Planilha Google (opcional)

1. Crie uma planilha com os cabeçalhos
   `recebidoEm | nome | contato | mensagem | origem`.
2. **Extensões → Apps Script**, cole e salve:

   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSheet()
       .appendRow([d.recebidoEm, d.nome, d.contato, d.mensagem, d.origem || ""]);
     return ContentService.createTextOutput("ok");
   }
   ```

3. **Implantar → Nova implantação → App da Web** · Executar como: *você* ·
   Quem pode acessar: *Qualquer pessoa*.
4. Cole a URL gerada em `SHEETS_WEBHOOK_URL`.

### Notificação no celular (opcional)

Crie um webhook no Discord (canal → Integrações → Webhooks) ou no Slack e cole
em `CONTACT_WEBHOOK_URL`.

### Anti-spam incluso

Campo isca invisível, descarte de envios feitos em menos de 3s e limite de
5 mensagens por IP a cada 10 minutos.

## Deploy (Vercel)

Adicione as mesmas variáveis de ambiente em **Vercel → Settings → Environment
Variables**. O `/studio` vai junto no mesmo deploy — um único projeto, grátis.

## SEO já incluso

- `sitemap.xml` e `robots.txt` gerados automaticamente
- Metadata dinâmica + OpenGraph + Twitter Card por post
- JSON-LD (`BlogPosting`) em cada artigo para o Google entender o conteúdo
- `/studio` bloqueado nos robôs de busca
