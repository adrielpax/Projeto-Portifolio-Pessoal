/**
 * Segundo hero: aparece na primeira rolada, dentro da janela "aberta"
 * (sem vidro), com o grafo e os triângulos visíveis ao fundo.
 */
const PILLARS = [
  { title: "Integrações e APIs", text: "Sistemas, marketplaces, planilhas e webhooks conversando sem retrabalho." },
  { title: "Agentes de IA", text: "Assistentes que leem, classificam e respondem com o contexto do negócio." },
  { title: "Automação industrial", text: "Do chão de fábrica ao painel: dados de máquinas e sensores organizados." },
];

export function Intro() {
  return (
    <section className="sec sec-intro frame-inset invisible opacity-0" aria-labelledby="intro-title">
      <div className="flex h-full flex-col justify-center p-6 md:px-14">
        <h2 id="intro-title" tabIndex={-1} className="max-w-[16ch] font-display text-[44px] font-semibold uppercase leading-[0.9] outline-none md:text-[76px]">
          Do processo manual ao sistema que roda sozinho.
        </h2>
        <p className="mt-5 max-w-[46ch] text-[16px] leading-snug text-paper/75 md:text-[18px]">
          Mapeio o processo, integro os sistemas e coloco IA onde ela realmente economiza tempo.
        </p>
        <ul className="mt-10 grid max-w-[980px] gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.title} className="border-t border-white/25 pt-4">
              <span className="flex items-center gap-2 font-display text-[18px] font-semibold uppercase">
                <span className="led" style={{ ["--led" as string]: "#3ddc84" }} aria-hidden />
                {p.title}
              </span>
              <span className="mt-2 block text-[14px] leading-snug text-paper/65">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
