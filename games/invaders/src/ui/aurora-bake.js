// The aurora's strips, baked once each (aurora.js draws them as slices): a curtain seen face on, its hem
// at the bottom and its rays standing up from it, TW px of ray pattern that repeats seamlessly (PAD
// columns are the first ones again, so a slice never has to wrap). Every column is a ray: its own
// strength sets how bright it burns and how high it climbs, and the colours run from a magenta hem
// through a white-green core to teal, blue and violet where the light thins out.
import { cached, rgba, mix, hash } from './sprites.js';
import { clamp, TAU } from '../core/math.js';

export const TW = 640;
export const TH = 320;
const PAD = 80; // at least the widest slice read from a strip: 64 px at half quality, stretched by rho up to 1.21
const AT = [0, 0.02, 0.05, 0.1, 0.18, 0.28, 0.4, 0.52, 0.65, 0.78, 0.9, 1]; // where a column's colour stops sit, hem to crown

// Colour stops from the hem (0) to the crown (1): [at, colour, alpha].
const RAMPS = [
  [[0, '#ff4ad0', 0], [0.025, '#ff6ae0', 0.9], [0.06, '#e8ffe0', 1], [0.13, '#6dff9a', 1], [0.28, '#30f070', 0.85], [0.46, '#20d89a', 0.5], [0.7, '#3a8cff', 0.26], [0.9, '#8a4cff', 0.1], [1, '#8a4cff', 0]],
  [[0, '#5ab0ff', 0], [0.03, '#8ae0ff', 0.7], [0.08, '#d0ffff', 1], [0.18, '#40f0ff', 0.9], [0.4, '#2a9cff', 0.55], [0.68, '#6a56ff', 0.28], [1, '#7a3cff', 0]],
  [[0, '#ff3aa0', 0], [0.03, '#ff5ac0', 0.7], [0.1, '#ff98e8', 0.9], [0.26, '#d060ff', 0.75], [0.6, '#7a4aff', 0.34], [1, '#4a3aff', 0]],
];

// Sums of sines with whole numbers of periods in TW, so the pattern joins up end to end: from broad
// beams down to single-pixel rays: [periods in TW, amplitude, phase].
const BANDS = [[5, 0.5, 0], [11, 0.45, 1.3], [23, 0.4, 2.1], [47, 0.35, 0.7], [97, 0.3, 4.2], [199, 0.22, 5.5], [321, 0.18, 2.6]];

// The strength of the ray at column x of strip c, 0 to 1: mostly dim, with bright rays standing out.
function raw(x, c) {
  const u = (x / TW) * TAU;
  let s = 0;
  for (const [f, a, p] of BANDS) s += a * Math.sin(u * f + p + c * 1.7);
  const v = clamp(0.5 + s / 3.4, 0, 1) ** 2.4;
  return clamp(v * 1.9 + (hash(x * 7 + c) > 0.985 ? 0.4 : 0), 0.05, 1);
}

// Each ray softened by its neighbours, so none is a hard single-pixel line.
const strength = (x, c) => 0.25 * raw(x - 1, c) + 0.5 * raw(x, c) + 0.25 * raw(x + 1, c);

// The colour and alpha of the ramp at v.
function at(ramp, v) {
  let i = 1;
  while (i < ramp.length - 1 && ramp[i][0] < v) i++;
  const [a0, c0, k0] = ramp[i - 1];
  const [a1, c1, k1] = ramp[i];
  const u = clamp((v - a0) / (a1 - a0), 0, 1);
  return [mix(c0, c1, u), k0 + (k1 - k0) * u];
}

export const strip = (c) => cached('aurora' + c, TW + PAD, TH, (g) => {
  const table = AT.map((v) => at(RAMPS[c], v));
  for (let x = 0; x < TW + PAD; x++) {
    const r = strength((x + TW) % TW, c);
    const reach = 0.3 + 0.7 * r;
    const gr = g.createLinearGradient(0, TH, 0, 0);
    AT.forEach((v, j) => {
      const fall = v < 0.06 ? 1 : clamp(1 - (v - 0.06) / (reach - 0.06), 0, 1) ** 0.8;
      const [col, a] = table[j];
      gr.addColorStop(v, rgba(col, a * fall * (v < 0.06 ? 0.6 + 0.4 * r : 0.14 + 0.86 * r)));
    });
    g.fillStyle = gr;
    g.fillRect(x, 0, 1, TH);
  }
});
