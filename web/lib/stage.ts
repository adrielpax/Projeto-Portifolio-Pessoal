/**
 * Estado compartilhado entre a timeline de scroll (DOM/GSAP) e a cena 3D.
 * É um objeto mutável de propósito: a cena lê a cada frame sem causar re-render.
 */
export const stage = {
  /** progresso da abertura: 0 = hero, 1 = card já virou navbar */
  t: 0,
  /** a cena 3D só anima enquanto o fundo está visível */
  sceneVisible: true,
  /** ponteiro normalizado de -1 a 1 */
  mouseX: 0,
  mouseY: 0,
  reducedMotion: false,
};

