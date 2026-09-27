---
title: "Seu portfólio não pode quebrar quando o CMS cair: a arquitetura que usei no Next.js 16"
slug: "portfolio-resiliente-nextjs-sanity-fallback"
excerpt: "Um recrutador abre seu site uma única vez. Se der erro, não tem segunda chance. Como construí um portfólio com CMS que continua de pé mesmo se o Sanity sumir."
tags: ["Next.js", "Arquitetura", "Sanity", "Resiliência", "TypeScript"]
featured: true
---

> **Resumo:** um portfólio com CMS tem um ponto único de falha que quase ninguém trata: se a API do CMS cair, ficar lenta ou vier vazia, o site aparece quebrado — justo para quem você mais queria impressionar. A solução que usei tem três camadas: **fallback tipado**, **ISR** e **degradação silenciosa**.

## O problema que ninguém testa

Você conecta o portfólio a um CMS headless, publica e está feliz. O que você provavelmente nunca testou:

- O que aparece se a API do CMS estiver fora do ar?
- O que aparece se a query retornar uma lista **vazia**?
- E se a chave de API expirar?

O cenário mais comum não é o mais dramático. É este: **a query funciona, mas devolve `[]`**. Nenhum erro é lançado, nenhum alarme dispara, e sua página de certificações mostra "nenhuma certificação cadastrada" para o recrutador que acabou de abrir seu currículo.

Foi exatamente o que aconteceu comigo — e o bug estava numa única linha.

## O bug de uma linha só

```typescript
// data.ts
export async function getCertifications(): Promise<Certification[]> {
  const data = await sanityFetch<Certification[]>(certificationsQuery);
  return data ?? fallbackCertifications; // 🐛
}
```

Parece correto. Não é.

O operador `??` só cai para o fallback quando o valor é `null` ou `undefined`. Uma **lista vazia é um valor perfeitamente definido** — então `[] ?? fallback` retorna `[]`, e a página renderiza vazia sem reclamar.

A correção é tratar "vazio" como "sem conteúdo":

```typescript
// data.ts
export async function getCertifications(): Promise<Certification[]> {
  const data = await sanityFetch<Certification[]>(certificationsQuery);
  // `??` não serve: uma lista vazia é "definida" e deixaria a página em branco.
  return data?.length ? data : fallbackCertifications;
}
```

A lição vale além do CMS: **`??` e `||` respondem perguntas diferentes**. `??` pergunta "existe?"; para coleções, o que você quer saber é "tem conteúdo?".

## Camada 1 — Fallback tipado

A ideia central: o conteúdo essencial do portfólio vive no código, tipado, e o CMS **sobrescreve** quando tem algo melhor. O CMS deixa de ser uma dependência e vira um upgrade.

```typescript
// fallback.ts — conteúdo base, versionado junto com o código
export const fallbackProjects: Project[] = [
  {
    _id: "project.barberboost",
    slug: "barberboost",
    title: "Meu Barbeiro (BarberBoost)",
    role: "Fundador & Desenvolvedor Full-Stack",
    status: "producao",
    link: "https://barberboost.vercel.app/",
    stack: ["Next.js", "TypeScript", "React", "PostgreSQL"],
    description: "Web app que automatiza agendamentos de barbearias.",
  },
];
```

O mesmo tipo `Project` serve para os dois lados. Se eu adicionar um campo obrigatório no schema e esquecer de refletir no fallback, o **TypeScript quebra o build** — o erro aparece na minha máquina, não no navegador do recrutador.

## Camada 2 — ISR em vez de fetch no cliente

Buscar dados do CMS pelo navegador cria três problemas de uma vez: o visitante espera, aparece um layout skeleton, e o Google indexa uma página sem conteúdo.

Com o App Router, os dados são buscados no servidor e a página fica **estática com revalidação**:

```typescript
const REVALIDATE = 60;

async function sanityFetch<T>(query: string, params = {}) {
  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE },
  });
}
```

O resultado prático: o visitante recebe HTML pronto (rápido e indexável), o CMS é consultado no máximo uma vez por minuto — e se ele estiver fora do ar, **a última versão boa continua sendo servida**. A falha vira invisível.

## Camada 3 — Degradação silenciosa

A última camada é de interface: nenhuma seção deve exibir a própria ausência.

```tsx
{testimonials.length > 0 && (
  <section>{/* … */}</section>
)}
```

Uma seção "Depoimentos" vazia é pior do que nenhuma seção — ela anuncia o que falta. Se não há conteúdo, a seção simplesmente não existe naquele render.

O mesmo princípio se aplica a números. No meu portfólio, as estatísticas não são digitadas à mão:

```tsx
const stats = {
  live: projects.filter((p) => Boolean(p.link)).length,
  total: projects.length,
  certs: certs.length,
};
```

Isso resolve um problema técnico e um problema de credibilidade ao mesmo tempo: **não existe número desatualizado** quando ele é derivado do conteúdo. E não há tentação de arredondar "5 projetos" para "+15".

## O checklist

Antes de mandar seu portfólio para uma vaga, teste três coisas:

1. **Corte a rede do CMS** (troque a chave de API por lixo) e abra o site. Quebrou?
2. **Esvazie uma coleção** e veja o que renderiza. Aparece "nenhum item"?
3. **Veja o HTML com JavaScript desligado.** O conteúdo está lá para o Google?

Se as três passarem, seu portfólio está pronto para o pior dia da infraestrutura do seu CMS — que provavelmente vai ser o dia em que o recrutador abrir o link.

---

### Resumindo

- `??` verifica existência; para listas, verifique `.length`.
- Fallback tipado transforma o CMS de dependência em upgrade.
- ISR entrega HTML pronto e sobrevive a quedas da API.
- Números derivados do conteúdo nunca ficam desatualizados — nem inflados.
