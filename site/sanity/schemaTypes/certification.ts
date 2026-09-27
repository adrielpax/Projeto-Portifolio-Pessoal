import { defineField, defineType } from "sanity";

export const certification = defineType({
  name: "certification",
  title: "Certificação",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título da certificação",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "issuer",
      title: "Emissor (ex: Google, AWS, Alura)",
      type: "string",
    }),
    defineField({
      name: "logo",
      title: "Logo / imagem",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "credentialUrl",
      title: "Link da credencial",
      type: "url",
    }),
    defineField({
      name: "issuedAt",
      title: "Data de emissão",
      type: "date",
    }),
    defineField({
      name: "order",
      title: "Ordem",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Ordem",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "issuer", media: "logo" },
  },
});
