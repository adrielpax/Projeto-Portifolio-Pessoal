import { ArrowDownRight, MapPin } from "lucide-react";

/**
 * Painel de disponibilidade — o contexto que um recrutador procura primeiro.
 * O CTA rola até o Módulo de contato (#contato).
 */
export default function AvailabilityCard() {
  return (
    <div className="hud-panel flex h-full flex-col p-5">
      <span className="hud-label">Disponibilidade</span>

      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Aberto a novos projetos
      </p>

      <p className="mt-2 text-xs leading-relaxed text-hud-muted">
        Foco em SaaS, MVPs e automação com IA — do escopo ao deploy.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Freelance", "CLT", "Parceria em produto"].map((m) => (
          <span
            key={m}
            className="rounded-md border border-hud-line bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-hud-steel"
          >
            {m}
          </span>
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-hud-muted">
        <MapPin className="h-3 w-3 shrink-0" /> Betim, MG · Brasil — remoto ou híbrido
      </p>

      <a
        href="#contato"
        className="btn-primary mt-4 w-full px-4 py-2.5 font-display text-xs font-semibold sm:mt-auto"
      >
        Enviar mensagem <ArrowDownRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
