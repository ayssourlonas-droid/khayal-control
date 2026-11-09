// What the look bakes into its sky beyond the gradient, one painter per look.body. Painted once per
// level into the sky canvas; nothing here animates.
import { glow, rgba, addGlow } from './sprites.js';
import { stars, moon, brush, horizonGlow } from './sky-paint.js';

// The blood moon's centre and radius; moon.js swells a white one over it.
export const MOON = { x: 640, y: 360, r: 205 };

// The ink-brush clouds across the moon and the dusk, [x, y, length, width] each. moon.js paints them
// again over the white moon, so they cross it as they cross the red one.
const STROKES = [
  [180, 300, 700, 26], [520, 430, 760, 34], [260, 520, 520, 18], [900, 250, 620, 14],
  [1150, 380, 680, 22], [1300, 560, 620, 30], [80, 640, 560, 20], [700, 600, 900, 24],
];

export function clouds(g) {
  STROKES.forEach(([x, y, len, w], i) => brush(g, x, y, len, w, rgba('#0b0607', 0.82 - (i % 3) * 0.12), i + 1));
}

// A blood moon low on the left, ink-brush clouds across it and the dusk, the horizon lit red.
function redmoon(g) {
  const { x, y, r } = MOON;
  stars(g, 70, 41, 520, 0.45);
  addGlow(g, glow('#ff2a1a'), x, y, 640, 0.65);
  addGlow(g, glow('#ff6a4a'), x, y, 300, 0.5);
  moon(g, x, y, r, '#ff7a5a', '#a01818', '#6a0a0a', 17);
  clouds(g);
  horizonGlow(g, '#c83a2a', 0.35, 560);
}

export const BODIES = { redmoon };
