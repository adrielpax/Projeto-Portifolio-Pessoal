/**
 * Publica um post no Sanity a partir de um arquivo Markdown (com frontmatter).
 *
 * Converte o corpo em PortableText (títulos, parágrafos com negrito/itálico/
 * código/links, blocos de código, citações, listas e tabelas) e cria/atualiza
 * o documento. Idempotente: rodar de novo atualiza o mesmo post (não duplica).
 *
 * Uso:
 *   node --env-file=.env.local scripts/publish-post.mjs <arquivo.md> [capa.png]
 *   node scripts/publish-post.mjs <arquivo.md> --dry-run   (só converte e mostra)
 *
 * Requer no .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET e um token com
 *   permissão de ESCRITA (role "Editor"): SANITY_WRITE_TOKEN — o mesmo do
 *   formulário de contato — ou, na falta dele, SANITY_API_TOKEN.
 */

import { readFileSync } from "node:fs";
import { createClient } from "next-sanity";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [mdPath, coverPath] = args.filter((a) => a !== "--dry-run");
if (!mdPath) {
  console.error("Uso: node --env-file=.env.local scripts/publish-post.mjs <arquivo.md> [capa.png]");
  process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!projectId && !dryRun) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID ausente no .env.local");
if (!token && !dryRun) throw new Error("SANITY_WRITE_TOKEN ausente no .env.local (precisa de role Editor)");

const client = createClient({
  projectId: projectId || "dry-run",
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

// ── chave incremental (sem Math.random p/ reprodutibilidade) ────────────────
let _k = 0;
const key = () => `k${(_k++).toString(36)}`;

// ── frontmatter ─────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let [, k, v] = mm;
    v = v.trim();
    if (v.startsWith("[") && v.endsWith("]")) {
      data[k] = v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else {
      data[k] = v.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: m[2] };
}

// ── inline → spans (negrito, itálico, código, links) ────────────────────────
function inlineToSpans(text, markDefs) {
  const spans = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m;
  const push = (t, marks) => { if (t) spans.push({ _type: "span", _key: key(), text: t, marks }); };
  while ((m = re.exec(text))) {
    if (m.index > last) push(text.slice(last, m.index), []);
    if (m[2] !== undefined) push(m[2], ["strong"]);
    else if (m[3] !== undefined) push(m[3], ["em"]);
    else if (m[4] !== undefined) push(m[4], ["code"]);
    else if (m[5] !== undefined) {
      const _key = key();
      markDefs.push({ _type: "link", _key, href: m[6] });
      push(m[5], [_key]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) push(text.slice(last), []);
  if (spans.length === 0) push(text, []);
  return spans;
}

function block(style, text, extra = {}) {
  const markDefs = [];
  return { _type: "block", _key: key(), style, markDefs, children: inlineToSpans(text, markDefs), ...extra };
}

// ── markdown → PortableText ─────────────────────────────────────────────────
function toPortableText(body) {
  const lines = body.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // bloco de código
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim() || "text";
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) buf.push(lines[i++]);
      i++; // fecha ```
      let code = buf.join("\n");
      let filename;
      const fm = buf[0]?.match(/^\s*(?:#|\/\/)\s*([\w./-]+\.\w+)\s*$/);
      if (fm) { filename = fm[1]; code = buf.slice(1).join("\n").replace(/^\n/, ""); }
      out.push({ _type: "code", _key: key(), language, code, ...(filename ? { filename } : {}) });
      continue;
    }

    // separador / vazio
    if (line.trim() === "" || /^---+$/.test(line.trim())) { i++; continue; }

    // imagem placeholder → ignora (capa/inline tratadas à parte)
    if (/^!\[.*\]\(.*\)/.test(line.trim())) { i++; continue; }

    // títulos
    if (line.startsWith("### ")) { out.push(block("h3", line.slice(4))); i++; continue; }
    if (line.startsWith("## ")) { out.push(block("h2", line.slice(3))); i++; continue; }
    if (line.startsWith("# ")) { out.push(block("h2", line.slice(2))); i++; continue; }

    // citação (junta linhas consecutivas)
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(block("blockquote", buf.join(" ")));
      continue;
    }

    // tabela
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
      rows.forEach((r, idx) => {
        if (/^\s*\|[\s:|-]+\|\s*$/.test(r)) return; // separador
        const c = cells(r);
        if (idx === 0) out.push(block("normal", c.map((x) => `**${x}**`).join("  ·  ")));
        else out.push(block("normal", `**${c[0]}** — ${c.slice(1).join(" — ")}`));
      });
      continue;
    }

    // listas
    if (/^\s*[-*]\s+/.test(line)) {
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        out.push(block("normal", lines[i].replace(/^\s*[-*]\s+/, ""), { listItem: "bullet", level: 1 }));
        i++;
      }
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        out.push(block("normal", lines[i].replace(/^\s*\d+\.\s+/, ""), { listItem: "number", level: 1 }));
        i++;
      }
      continue;
    }

    // parágrafo (junta linhas até uma em branco)
    const buf = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|>|```|\||\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    out.push(block("normal", buf.join(" ")));
  }
  return out;
}

// ── upload de imagem ─────────────────────────────────────────────────────────
async function uploadImage(path) {
  const buf = readFileSync(path);
  const filename = path.split(/[\\/]/).pop();
  const asset = await client.assets.upload("image", buf, { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// ── main ─────────────────────────────────────────────────────────────────────
const raw = readFileSync(mdPath, "utf8");
const { data, body } = parseFrontmatter(raw);
if (!data.slug) throw new Error("Frontmatter sem 'slug'");

const doc = {
  // Sem ponto no _id: IDs com "." ficam privados e o site não enxergaria o post.
  _id: `post-${data.slug}`,
  _type: "post",
  title: data.title,
  slug: { _type: "slug", current: data.slug },
  excerpt: data.excerpt,
  tags: Array.isArray(data.tags) ? data.tags : [],
  featured: data.featured === "true" || data.featured === true,
  publishedAt: new Date().toISOString(),
  body: toPortableText(body),
};

if (dryRun) {
  const tipos = {};
  for (const b of doc.body) {
    const t = b._type === "block" ? (b.listItem ? `lista:${b.listItem}` : b.style) : b._type;
    tipos[t] = (tipos[t] ?? 0) + 1;
  }
  console.log(`🔎 dry-run: "${doc.title}" → /blog/${data.slug}`);
  console.log(`   ${doc.body.length} blocos:`, tipos);
  console.log(`   links:`, doc.body.flatMap((b) => b.markDefs ?? []).map((m) => m.href));
  process.exit(0);
}

if (coverPath) {
  const img = await uploadImage(coverPath);
  doc.coverImage = { ...img, alt: data.title };
  console.log("✓ capa enviada:", img.asset._ref);
}

const res = await client.createOrReplace(doc);
console.log("✅ post publicado:", res._id, "→ /blog/" + data.slug);
