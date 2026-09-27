import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post do Blog",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (r) => r.required().min(10).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo (aparece na lista e no Google)",
      type: "text",
      rows: 3,
      validation: (r) => r.max(200).warning("Ideal até 160 caracteres para SEO."),
    }),
    defineField({
      name: "coverImage",
      title: "Imagem de capa",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Texto alternativo", type: "string" }),
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "publishedAt",
      title: "Data de publicação",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      title: "Destaque na home do blog",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Título H2", value: "h2" },
            { title: "Título H3", value: "h3" },
            { title: "Citação", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Negrito", value: "strong" },
              { title: "Itálico", value: "em" },
              { title: "Código", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                ],
              },
            ],
          },
        },
        { type: "image", options: { hotspot: true } },
        {
          type: "code",
          name: "code",
          title: "Bloco de código",
          options: {
            language: "bash",
            languageAlternatives: [
              { title: "Bash / Terminal", value: "bash" },
              { title: "PowerShell", value: "powershell" },
              { title: "Python", value: "python" },
              { title: "TypeScript", value: "typescript" },
              { title: "JavaScript", value: "javascript" },
              { title: "JSON", value: "json" },
              { title: "YAML", value: "yaml" },
              { title: "Markdown", value: "markdown" },
              { title: "Texto", value: "text" },
            ],
            withFilename: true,
          },
        },
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "Título SEO (opcional, sobrescreve o título)",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Descrição SEO (opcional, sobrescreve o resumo)",
      type: "text",
      rows: 2,
      group: "seo",
    }),
  ],
  groups: [{ name: "seo", title: "SEO" }],
  orderings: [
    {
      title: "Mais recentes",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
