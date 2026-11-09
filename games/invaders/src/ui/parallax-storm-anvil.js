// The far layer of Anvil Sky (stormanvils; parallax-storm.js registers it): a sea of cloud along the horizon with five towers of
// cumulonimbus rising out of it, each a craggy column with shoulders that spreads at the top into a flat ANVIL (one wing longer than the
// other) with an overshooting dome above it and hanging pouches (mammatus) under its overhang. A gap is left at the sun (SUN_X), where the
// sky's slit shows between the towers. Every tower is a shape bent by noise and lit by parallax-storm-field.js (cold lilac on what faces
// up and toward the sun, the sun's orange from the horizon up to the anvil's belly, pockets of pale light inside); rain hangs in slanted
// veils under the anvil; and a few lights flicker inside (out.lights, drawn by parallax.js; flourish-storm.js brightens them with every
// flash, which is why TOWERS is exported). Each tower is baked on a canvas of its own and laid on the layer, base first, so the sea covers
// every foot. The painter takes the layer's seeded rng.
import { glow, noise2 } from './sprites.js';
import { clamp } from '../core/math.js';
import { smoothstep } from './sky-bodies-10-kit.js';
import { paintCloud, unit } from './parallax-storm-field.js';
import { offscreen, veils, SUN_X } from './parallax-storm-kit.js';
import { warmStormFx } from './flourish-storm-sprites.js';

export const SEA = 512; // the cloud sea's top in the layer (the layer is 700 tall, so the sea is the lower quarter of the frame)
export const TOWERS = [ // x (layer px), top of the anvil, its left and right half-widths, the column's half-width, the anvil's thickness, the column's lean
  { x: 330, top: 190, wl: 250, wr: 300, wc: 92, thick: 74, lean: 24, shoulder: [[-110, 330, 62], [120, 300, 70]] },
  { x: 840, top: 292, wl: 170, wr: 230, wc: 72, thick: 56, lean: -18, shoulder: [[100, 380, 50]] },
  { x: 1190, top: 150, wl: 360, wr: 310, wc: 108, thick: 88, lean: 30, shoulder: [[-150, 300, 80], [150, 260, 74]] },
  { x: 1960, top: 236, wl: 280, wr: 190, wc: 82, thick: 64, lean: -26, shoulder: [[-90, 360, 56]] },
  { x: 2230, top: 350, wl: 150, wr: 120, wc: 52, thick: 40, lean: 10, shoulder: [] },
];
const PAD = 140; // spare canvas round a tower: its dome and its anvil's tips

// The tower's shape in canvas px (cx the column's foot, top the anvil's lid, yB the foot): the largest of the column, its shoulders, the anvil,
// its dome and its pouches.
function shapeOf(T, cx, top, yB, pouches) {
  const yA = top + T.thick * 0.55;
  return (x, y) => {
    const v = clamp((yB - y) / (yB - yA), 0, 1);
    const mid = cx + T.lean * v ** 1.3 + 30 * (noise2(0, y, 150, T.x) - 0.5);
    let s = Math.min(T.wc * (1.12 - 0.42 * v + 0.16 * Math.sin(v * 9 + T.x)) * (0.8 + 0.5 * noise2(y, 0, 90, T.x + 5)) - Math.abs(x - mid), y - yA + 30);
    for (const [dx, sTop, w] of T.shoulder) { // a lower tower beside the column, its crown round
      const [sx, sy] = [cx + dx, sTop - T.top + top + w];
      s = Math.max(s, y > sy ? w - Math.abs(x - sx) : w - Math.hypot(x - sx, y - sy));
    }
    const u = (x - cx) / (x < cx ? T.wl : T.wr);
    const au = Math.min(Math.abs(u), 1);
    const lid = top + 22 * au ** 3;
    const belly = top + 14 + T.thick * (1 - au ** 1.5) * (0.92 + 0.16 * Math.sin(u * 14 + T.x));
    s = Math.max(s, Math.min(y - lid, belly - y) - Math.max(0, Math.abs(u) - 1) * 80);
    s = Math.max(s, (1 - Math.hypot((x - cx - T.lean) / (T.wc * 1.1), (y - top + 4) / 46)) * 40);
    if (Math.abs(y - top - 14 - T.thick * 0.7) < 60) for (const [px, py, r] of pouches) s = Math.max(s, r - Math.hypot(x - px, y - py));
    return s;
  };
}

function tower(g, rng, L, out, T, w) {
  const [ox, oy] = [T.x - T.wl - PAD, T.top - 170];
  const [cw, ch] = [T.wl + T.wr + PAD * 2, SEA - oy + 60];
  const [cx, top] = [T.x - ox, T.top - oy];
  const pouches = [];
  for (let k = 0; k < 10; k++) {
    const u = (k + 0.5 + (rng() - 0.5) * 0.6) / 10 * 1.7 - 0.85;
    const au = Math.abs(u);
    pouches.push([cx + u * (u < 0 ? T.wl : T.wr), top + 14 + T.thick * (1 - au ** 1.5) + 4, 12 + 12 * rng() * (1 - au * 0.5)]);
  }
  const [c, tg] = offscreen(cw, ch);
  const shape = shapeOf(T, cx, top, SEA - oy + 40, pouches);
  paintCloud(tg, rng, shape, [0, 0, cw, ch], {
    color: L.color, mid: '#252f5e', cold: '#7686d0', warm: '#ff9a50', glow: L.glow, light: unit(SUN_X > T.x ? 0.55 : -0.55, -0.85),
    warmAt: (x, y) => smoothstep(top + T.thick + 60, SEA - oy, y) * 0.9, n: 190, edge: 340, rMax: 70, rEdge: 26, lit: 0.4, pockets: 8, pocketA: 0.15,
    squash: (x, y) => (y < top + T.thick + 10 && Math.abs(x - cx) > T.wc * 1.2 ? [2.4, 0.55] : [1, 1]), // the anvil's fibres are wide and flat
  });
  veils(tg, rng, cx - T.wl * 0.7, top + T.thick, (T.wl + T.wr) * 0.7, SEA - T.top - T.thick - 20, 6, 46, '#7c8cc8', 0.14); // rain under the anvil
  g.globalAlpha = 0.6; // the edge goes soft: a blurred copy under the cloud, like the haze round a real one
  g.filter = 'blur(7px)';
  g.drawImage(c, ox, oy);
  g.globalAlpha = 1;
  g.filter = 'blur(1.2px)';
  g.drawImage(c, ox, oy);
  g.filter = 'none';
  [[0, T.thick * 0.4, T.wr * 0.5], [T.lean, T.thick + 110, T.wc * 1.3]].forEach(([dx, dy, r], i) => { // the anvil's heart flickers, the column's pulses
    out.lights.push({ x: Math.min(T.x + dx, w - 20), y: T.top + dy, r: Math.min(150, r * 1.3), color: L.glow, mode: i ? 'pulse' : 'flicker', ph: rng(), a: 0.24 });
  });
}

// The sea: a low bank of cloud with a cauliflower top, its foot dark, the stretch under the sun lit warm.
function sea(g, rng, w, h, L) {
  const top = (x) => 78 + 10 * Math.sin(x * 0.008) + 6 * Math.sin(x * 0.023 + 2);
  const sh = h - SEA + 90;
  const [c, sg] = offscreen(w, sh);
  paintCloud(sg, rng, (x, y) => y - top(x), [0, 0, w, 260], {
    color: L.color, mid: '#2a3668', cold: '#7484cc', warm: '#ff9a50', glow: L.glow, light: unit(0.5, -0.86), n: 230, edge: 520, rMax: 90, rEdge: 40, lit: 0.45,
    warmAt: (x, y) => Math.exp(-(((x - SUN_X) / 520) ** 2)) * (1 - smoothstep(0, 110, y - top(x))), pockets: 10, pocketA: 0.1,
  });
  sg.globalCompositeOperation = 'lighter';
  sg.globalAlpha = 0.6;
  sg.drawImage(glow('#ff8a3a'), SUN_X - 560, -10, 1120, 190); // the sun lights the stretch of sea under it
  g.drawImage(c, 0, SEA - 78);
}

export function stormanvils(g, w, h, rng, L, out) {
  warmStormFx(); // the sprites the flourishes draw are baked with the layers, so no frame of the fight pays for one
  for (const T of TOWERS) tower(g, rng, L, out, T, w);
  sea(g, rng, w, h, L);
  g.fillStyle = L.color;
  g.fillRect(0, SEA + 90, w, h);
}
