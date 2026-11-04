import { stackLayers } from "@/lib/content";

export function Stack() {
  return (
    <section className="sec sec-stack frame-inset invisible opacity-0" aria-labelledby="stack-title">
      <div className="flex h-full flex-col justify-between p-5 md:p-10 lg:max-w-[38%]">
        <div>
          <h2 id="stack-title" tabIndex={-1} className="display outline-none">
            Stack
          </h2>
          <p className="stack-desc mt-5 max-w-[34ch] text-[17px] leading-snug text-dim md:text-[19px]">
            Um sistema inteiro, peça por peça. Cada camada desse equipamento é uma parte do que eu construo.
          </p>
        </div>

        <div className="relative">
          <p className="stack-hint text-[15px] text-dim">Role para desmontar</p>
          <div className="stack-legend absolute bottom-0 left-0 right-0 opacity-0">
            <ul className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 md:hidden">
              {stackLayers.map((l) => (
                <li key={l.code} className="text-[14px] leading-tight">
                  <span className="font-display text-[16px]">{l.name}</span>
                  <span className="block text-dim">{l.items.slice(0, 2).join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
