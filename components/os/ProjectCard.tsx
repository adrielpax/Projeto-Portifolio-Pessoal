import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Spotlight from "./Spotlight";
import StatusPill from "./StatusPill";
import { resolveImage } from "@/lib/sanity/data";
import type { Project } from "@/lib/sanity/types";
import { isRemoteImage } from "@/lib/format";

/**
 * Card de projeto do portfólio.
 * Leva ao case study quando existe slug; senão, ao link ao vivo.
 */
export default function ProjectCard({
  project: p,
  className = "",
}: {
  project: Project;
  className?: string;
}) {
  const img = resolveImage(p.image, 800);
  const href = p.slug ? `/projetos/${p.slug}` : (p.link ?? "#");
  const external = !p.slug && Boolean(p.link);

  return (
    <Spotlight className={`h-full rounded-2xl ${className}`}>
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="card-glass group flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-hud-surface-2">
        {img && (
          <Image
            src={img}
            alt={p.title}
            fill
            unoptimized={isRemoteImage(img)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3">
          <StatusPill status={p.status} compact />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-snug text-hud-text">
            {p.title}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-hud-text opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>

        {p.role && (
          <p className="mt-0.5 text-[11px] font-medium text-hud-steel">{p.role}</p>
        )}

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-hud-muted">
          {p.description}
        </p>

        {p.stack && p.stack.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {p.stack.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-md border border-hud-line px-1.5 py-0.5 font-mono text-[10px] text-hud-steel"
              >
                {s}
              </span>
            ))}
            {p.stack.length > 3 && (
              <span className="rounded-md px-1 py-0.5 font-mono text-[10px] text-hud-muted">
                +{p.stack.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
    </Spotlight>
  );
}
