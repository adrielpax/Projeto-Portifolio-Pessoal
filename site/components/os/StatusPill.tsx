import type { Project } from "@/lib/sanity/types";

const MAP: Record<string, { label: string; className: string; live?: boolean }> = {
  producao: {
    label: "Em produção",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    live: true,
  },
  desenvolvimento: {
    label: "Em desenvolvimento",
    className: "border-hud-detail/30 bg-hud-detail/10 text-hud-detail",
  },
  concluido: {
    label: "Concluído",
    className: "border-hud-line bg-white/5 text-hud-muted",
  },
  arquivado: {
    label: "Arquivado",
    className: "border-hud-line bg-white/5 text-hud-muted",
  },
};

/** Selo de status do projeto — sinaliza o que está no ar de verdade. */
export default function StatusPill({
  status,
  compact = false,
}: {
  status?: Project["status"];
  compact?: boolean;
}) {
  const s = MAP[status ?? "producao"];
  if (!s) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1
      font-mono text-[10px] font-medium uppercase tracking-wider ${s.className} ${
        compact ? "px-2 py-0.5" : ""
      }`}
    >
      {s.live && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {s.label}
    </span>
  );
}
