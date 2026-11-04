export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Intervalo normalizado: 0 antes de a, 1 depois de b. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Interpola um valor por "keyframes" alinhados aos rótulos da timeline.
 * values[i] é o valor no rótulo i (0..5); entre rótulos usa smoothstep.
 */
export function kf(t: number, values: readonly number[]) {
  const max = values.length - 1;
  const tt = t < 0 ? 0 : t > max ? max : t;
  const i = Math.min(max - 1, Math.floor(tt));
  return lerp(values[i], values[i + 1], smooth(tt - i));
}

/** PRNG determinístico para a cena ficar igual em toda visita. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
