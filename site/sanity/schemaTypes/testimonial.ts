import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Depoimento",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Depoimento",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Quem disse",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Cargo / empresa",
      type: "string",
    }),
    defineField({
      name: "avatar",
      title: "Foto (opcional)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sourceUrl",
      title: "Link da fonte (LinkedIn, e-mail, etc.)",
      description: "Opcional, mas aumenta muito a credibilidade.",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Ordem",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "author", subtitle: "role", media: "avatar" },
  },
});
