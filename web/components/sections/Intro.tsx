/**
 * Primeira faixa da página normal: transparente, com o grafo e os triângulos
 * visíveis ao fundo. Diz o que eu faço em uma frase e três frentes.
 */
const PILLARS = [
  { title: "Integrações e APIs", text: "Sistemas, marketplaces, planilhas e webhooks conversando sem retrabalho." },
  { title: "Agentes de IA", text: "Assistentes que leem, classificam e respondem com o contexto do negócio." },
  { title: "Automação industrial", text: "Do chão de fábrica ao painel: dados de máquinas e sensores organizados." },
];

export function Intro() {
  return (
    <section id="sec-intro" className="relative flex min-h-[100svh] items-center py-28 text-white" aria-labelledby="intro-title">
      <div className="container-page">
        <h2 id="intro-title" className="reveal max-w-[16ch] font-display text-[46px] font-semibold uppercase leading-[0.9] md:text-[80px]">
          Do processo manual ao sistema que roda sozinho.
        </h2>
        <p className="reveal mt-6 max-w-[46ch] text-[17px] leading-snug text-white/75 md:text-[19px]">
          Mapeio o processo, integro os sistemas e coloco IA onde ela realmente economiza tempo.
        </p>
        <ul className="mt-12 grid max-w-[1000px] gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <li key={p.title} className="reveal border-t-2 border-safety pt-4" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="font-display text-[20px] font-semibold uppercase">{p.title}</span>
              <span className="mt-2 block text-[15px] leading-snug text-white/70">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
