import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/lib/content";

export const alt = `${profile.name}: ${profile.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** imagem de compartilhamento (WhatsApp, LinkedIn, X): foto + nome + posicionamento */
export default async function Image() {
  const photo = await readFile(join(process.cwd(), "public/images/perfil.jpeg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#000", color: "#fff", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={630} height={630} style={{ position: "absolute", right: 0, top: 0, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 720, position: "relative" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: -2 }}>{profile.name}</div>
          <div style={{ fontSize: 40, fontWeight: 600, marginTop: 28, lineHeight: 1.1 }}>{profile.headline}</div>
          <div style={{ fontSize: 24, marginTop: 20, color: "rgba(255,255,255,0.65)" }}>{profile.location}</div>
        </div>
      </div>
    ),
    size,
  );
}
