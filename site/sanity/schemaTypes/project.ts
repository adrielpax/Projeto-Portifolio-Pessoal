import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Projeto",
  type: "document",
  groups: [
    { name: "basico", title: "Básico", default: true },
    { name: "case", title: "Case study" },
    { name: "prova", title: "Resultados" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "basico",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL do case)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      group: "basico",
    }),
    defineField({
      name: "username",
      title: "Identificador curto (ex: barberboost)",
      type: "string",
      group: "basico",
    }),
    defineField({
      name: "description",
      title: "Descrição curta (aparece no card)",
      type: "text",
      rows: 3,
      group: "basico",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Imagem do projeto",
      type: "image",
      options: { hotspot: true },
      group: "basico",
    }),
    defineField({
      name: "link",
      title: "Link ao vivo",
      type: "url",
      group: "basico",
    }),
    defineField({
      name: "repo",
      title: "Repositório (GitHub)",
      type: "url",
      group: "basico",
    }),
    defineField({
      name: "role",
      title: "Meu papel (ex: Desenvolvedor Full-Stack, Fundador)",
      type: "string",
      group: "basico",
    }),
    defineField({
      name: "year",
      title: "Ano",
      type: "string",
      group: "basico",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Em produção", value: "producao" },
          { title: "Em desenvolvimento", value: "desenvolvimento" },
          { title: "Concluído", value: "concluido" },
          { title: "Arquivado", value: "arquivado" },
        ],
        layout: "radio",
      },
      initialValue: "producao",
      group: "basico",
    }),
    defineField({
      name: "stack",
      title: "Tecnologias usadas",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "basico",
    }),

    // ── Case study ──────────────────────────────────────────────
    defineField({
      name: "problem",
      title: "O problema (qual dor o projeto resolve)",
      type: "text",
      rows: 4,
      group: "case",
    }),
    defineField({
      name: "solution",
      title: "A solução (o que eu construí)",
      type: "text",
      rows: 4,
      group: "case",
    }),
    defineField({
      name: "outcome",
      title: "O resultado (o que mudou depois)",
      type: "text",
      rows: 4,
      group: "case",
    }),

    // ── Prova / resultados ──────────────────────────────────────
    defineField({
      name: "metrics",
      title: "Métricas de resultado",
      description:
        "Use apenas números que você consegue comprovar. Ex: 'Tempo de agendamento' → '-70%'.",
      type: "array",
      group: "prova",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", title: "Valor (ex: -70%, 3s, 1.2k)", type: "string" },
            { name: "label", title: "O que representa", type: "string" },
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        },
      ],
    }),

    defineField({
      name: "featured",
      title: "Destaque (aparece primeiro)",
      type: "boolean",
      initialValue: false,
      group: "basico",
    }),
    defineField({
      name: "order",
      title: "Ordem (menor aparece primeiro)",
      type: "number",
      initialValue: 0,
      group: "basico",
    }),
  ],
  orderings: [
    {
      title: "Ordem do portfólio",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "role", media: "image" },
  },
});
