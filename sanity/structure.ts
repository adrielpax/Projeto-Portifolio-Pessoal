import type { StructureResolver } from "sanity/structure";
import { apiVersion } from "./env";

const recentes = [{ field: "recebidoEm", direction: "desc" as const }];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Conteúdo")
    .items([
      S.listItem()
        .title("📨 Mensagens")
        .child(
          S.list()
            .title("Mensagens do site")
            .items([
              S.listItem()
                .title("🟢 Novas")
                .child(
                  S.documentList()
                    .title("Novas")
                    .apiVersion(apiVersion)
                    .filter('_type == "lead" && status == "novo"')
                    .defaultOrdering(recentes),
                ),
              S.listItem()
                .title("Todas")
                .child(
                  S.documentTypeList("lead")
                    .title("Todas as mensagens")
                    .defaultOrdering(recentes),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("📝 Blog")
        .child(S.documentTypeList("post").title("Posts do Blog")),
      S.divider(),
      S.listItem()
        .title("📸 Galeria de Projetos")
        .child(S.documentTypeList("project").title("Projetos")),
      S.listItem()
        .title("🛡️ Certificações")
        .child(S.documentTypeList("certification").title("Certificações")),
      S.listItem()
        .title("💬 Depoimentos")
        .child(S.documentTypeList("testimonial").title("Depoimentos")),
    ]);
