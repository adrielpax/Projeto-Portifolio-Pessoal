import { defineField, defineType } from "sanity";

/**
 * Mensagem recebida pelo Módulo de contato do site.
 *
 * Criada pela rota /api/mensagem com _id "lead.<uuid>": IDs com ponto ficam
 * fora da API pública do Sanity, então nome e contato de quem escreveu só são
 * visíveis aqui no Studio (usuário logado) — nunca para quem consulta o dataset.
 */
export const lead = defineType({
  name: "lead",
  title: "Mensagem",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "🟢 Nova", value: "novo" },
          { title: "✅ Respondida", value: "respondido" },
          { title: "📦 Arquivada", value: "arquivado" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "novo",
    }),
    defineField({ name: "nome", title: "Nome", type: "string", readOnly: true }),
    defineField({
      name: "contato",
      title: "E-mail ou WhatsApp",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "mensagem",
      title: "Mensagem",
      type: "text",
      rows: 6,
      readOnly: true,
    }),
    defineField({
      name: "origem",
      title: "Página de origem",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "recebidoEm",
      title: "Recebida em",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "notas",
      title: "Notas internas",
      description: "Só você vê — próximos passos, orçamento, etc.",
      type: "text",
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: "Mais recentes",
      name: "recentes",
      by: [{ field: "recebidoEm", direction: "desc" }],
    },
  ],
  preview: {
    select: { nome: "nome", contato: "contato", status: "status" },
    prepare({ nome, contato, status }) {
      const icone =
        status === "respondido" ? "✅" : status === "arquivado" ? "📦" : "🟢";
      return { title: `${icone} ${nome ?? "Sem nome"}`, subtitle: contato };
    },
  },
});
