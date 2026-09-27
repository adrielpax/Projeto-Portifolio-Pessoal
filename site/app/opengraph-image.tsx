import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

export const alt = "Adriel Silva — Desenvolvedor Full-Stack & Automação";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Prévia do link no LinkedIn, WhatsApp e afins. Páginas com imagem própria
 * (posts e projetos) sobrescrevem esta pelo generateMetadata.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#0a0e17",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(34,211,238,0.22), transparent 55%)",
          color: "#e6edf5",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: 6,
            color: "#8b96a8",
          }}
        >
          <div style={{ width: 48, height: 2, background: "#22d3ee" }} />
          FULL-STACK · AUTOMAÇÃO · IA APLICADA
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>
            Adriel Silva
          </div>
          <div style={{ fontSize: 40, color: "#b8c2d1", maxWidth: 900 }}>
            Construo sistemas que escalam negócios — do primeiro deploy à operação.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#22d3ee" }}>
          {SITE_URL.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size,
  );
}
