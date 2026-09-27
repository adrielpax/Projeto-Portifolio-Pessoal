import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon — monograma "A" no tema do sistema. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e17",
          borderRadius: 14,
          border: "3px solid rgba(34,211,238,0.55)",
          color: "#22d3ee",
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
