import Link from "next/link";
import { Github, Linkedin, MessageSquare } from "lucide-react";
import { LINKS } from "@/lib/site";

const NAV = [
  { href: "/", label: "Sistema" },
  { href: "/projetos", label: "Projetos" },
  { href: "/blog", label: "Blog" },
  { href: "/certificacoes", label: "Certificações" },
  { href: "/jogo", label: "Jogo" },
];

/** Rodapé do sistema — navegação redundante (útil no mobile) + status. */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-hud-line px-5 py-10 md:px-12 lg:px-16">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-sm font-bold tracking-widest text-hud-text">
            AdrielDev
          </p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-hud-muted">
            Sistemas que escalam negócios — SaaS, automações e IA aplicada, do
            primeiro deploy à operação.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <span className="hud-label">Navegação</span>
          <ul className="mt-3 space-y-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="text-xs text-hud-muted transition-colors hover:text-hud-text"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <span className="hud-label">Contato</span>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href="#contato"
                className="inline-flex items-center gap-1.5 text-xs text-hud-muted transition-colors hover:text-hud-text"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Enviar mensagem
              </a>
            </li>
            <li>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-hud-muted transition-colors hover:text-hud-text"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </li>
            <li>
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-hud-muted transition-colors hover:text-hud-text"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-hud-line pt-5">
        <span className="hud-label">SYS · operacional</span>
        <span className="hud-label">© 2026 Adriel Silva</span>
      </div>
    </footer>
  );
}
