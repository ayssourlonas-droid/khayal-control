// The middle layer of Anvil Sky (stormpillars): nearer cloud, broken pillars of it rising out of a low bank, each a leaning column whose top
// has been torn off by the wind into rags, between them curtains of rain hanging from the deck. A gap is left at the sun. Baked like the far
// towers (parallax-storm-field.js), but colder, darker, craggier and with less of the sun's light, since the sun is far behind them.
import { paintCloud, unit } from './parallax-storm-field.js';
import { smoothstep } from './sky-bodies-10-kit.js';
import { clamp } from '../core/math.js';
import { noise2 } from './sprites.js';
import { offscreen, veils, SUN_X } from './parallax-storm-kit.js';

const BASE = 330; // the low bank's top in the layer (460 tall: the frame's lower half)
export const PILLARS = [ // x, top, half-width, lean (px the crown sits right of the foot); clear of the far towers' columns (parallax-storm-anvil.js) and of the sun
  { x: 130, top: 190, wc: 90, lean: 30 }, { x: 560, top: 110, wc: 118, lean: -40 }, { x: 990, top: 224, wc: 70, lean: 24 },
  { x: 1340, top: 150, wc: 70, lean: 30 }, { x: 1800, top: 100, wc: 70, lean: -30 }, { x: 2170, top: 200, wc: 70, lean: 20 },
];

// The pillars and the bank as one shape in layer px.
function shape(x, y) {
  let s = y - (BASE + 6 * Math.sin(x * 0.011) + 5 * Math.sin(x * 0.031 + 1)); // the bank
  for (const P of PILLARS) {
    const v = clamp((BASE + 30 - y) / (BASE + 30 - P.top), 0, 1);
    const mid = P.x + P.lean * v ** 1.4 + 9 * Math.sin(v * 6 + P.x) + 26 * (noise2(0, y, 110, P.x) - 0.5);
    const hw = P.wc * (1.05 - 0.34 * v + 0.14 * Math.sin(v * 7 + P.x)) * (0.8 + 0.45 * noise2(y, 0, 70, P.x + 3));
    s = Math.max(s, Math.min(hw - Math.abs(x - mid), y - P.top + 6));
  }
  return s;
}

export function stormpillars(g, w, h, rng, L, out) {
  veils(g, rng, 0, 0, w, BASE + 30, 22, 52, '#5c6cb0', 0.16, 0.16); // curtains of rain from the deck, across the whole layer
  const [c, mg] = offscreen(w, h);
  paintCloud(mg, rng, shape, [0, 0, w, h], {
    color: L.color, mid: '#1c2650', cold: '#7686d0', warm: '#c87050', glow: L.glow, light: unit(0.45, -0.89), n: 420, edge: 760, rMax: 60, rEdge: 30, lit: 0.42,
    warmAt: (x, y) => smoothstep(BASE - 120, BASE + 20, y) * Math.exp(-(((x - SUN_X) / 700) ** 2)) * 0.8, pockets: 14, pocketA: 0.16,
  });
  g.drawImage(c, 0, 0);
  for (const P of PILLARS) out.lights.push({ x: P.x + P.lean * 0.6, y: P.top + 80, r: Math.min(120, P.wc * 1.3), color: L.glow, mode: P.x % 3 ? 'flicker' : 'pulse', ph: rng(), a: 0.22 });
}
