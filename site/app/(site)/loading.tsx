/**
 * Carregamento entre páginas — renderizado DENTRO do shell (sidebar e topbar
 * continuam no lugar), então a navegação parece instantânea em vez de apagar
 * a tela inteira.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="animate-pulse space-y-6 px-5 py-10 md:px-12 lg:px-16"
    >
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
        <div className="h-8 w-2/3 max-w-md rounded-lg bg-white/[0.08]" />
        <div className="h-3 w-1/2 max-w-sm rounded bg-white/[0.06]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="hud-panel h-56" />
        ))}
      </div>
    </div>
  );
}
