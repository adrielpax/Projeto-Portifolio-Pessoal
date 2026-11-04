/**
 * Estado compartilhado entre a timeline de scroll (DOM/GSAP) e a cena 3D.
 * É um objeto mutável de propósito: a cena lê a cada frame sem causar re-render.
 */
export const stage = {
  /** tempo da timeline mestre em "unidades de seção" (0 = hero ... 5 = contato) */
  t: 0,
  /** ponteiro normalizado de -1 a 1 */
  mouseX: 0,
  mouseY: 0,
  reducedMotion: false,
};

export const TIMELINE_UNITS = 5;
