// What the painters of world 17's far layer (parallax-smog-far*.js) share: the ground line, a palette per mode, a seeded rng per
// element, the building's wall, its grid of windows and a lit edge. The palette is the whole difference between the two
// twins heal-layers.js bakes: 'smog' is a grimy city in amber haze (dark umber walls, dead grey glass, a few sickly amber
// windows, a dull gold edge where the sun behind the smog reaches) and 'clean' is the same city on a bright morning (blue-grey
// walls, glass that holds the sky, windows that catch the sun, a warm cream edge). A painter never asks which mode it is in,
// it asks the palette, and no rng call ever sits behind a mode test, so both twins share one silhouette.
// Every stroke stays dim and low-contrast down in the frame: nothing here is magenta or a small bright saturated dot.
import { rgba, hash } from './sprites.js';
import { makeRng } from '../core/rng.js';
import { lamp, poly, fade } from './parallax-smog-kit.js';

export { lamp, poly, fade }; // the mid and near layers' helpers (a light on `out`, a closed path, a fade over a box), the same here

export const GROUND = 380; // the terrace's top in the layer (700 tall; the layer's top is screen y 380): the towers stand on it
export const seeded = (seed) => makeRng((Math.imul(seed | 0, 2654435761) ^ 0x9e3779b9) >>> 0);

export const PAL = {
  smog: {
    tones: ['#3a302b', '#33292a', '#3f342d', '#2f2827', '#463a30'], haze: '#8f6f4a', veil: [0.52, 0.3],
    edge: '#d6a36a', edgeA: 0.62, top: '#e8b97e', shadeL: '#120d0b', shadeA: 0.4, foot: '#0c0807',
    glassTop: '#54483e', glassBot: '#241e1c', win: '#17110f', winHi: '#3b322b', lit: '#e8a74e', litGlow: '#e0983c', glint: '#a08a70', glintA: 0.2,
    steel: '#1f1917', steelHi: '#7a6450', stain: '#0a0706', stainA: 0.3, paper: '#8e857a', roofHi: '#5a4a3c',
    dome: '#403934', domeHi: '#7a6a5a', brick: '#43332b', gas: '#2c2523', gasHi: '#6a5848',
  },
  clean: {
    tones: ['#6f8ba6', '#6684a0', '#7a95ae', '#5d7a98', '#8aa1b8'], haze: '#d6ebf8', veil: [0.5, 0.26],
    edge: '#fff1c8', edgeA: 0.85, top: '#ffffff', shadeL: '#27425e', shadeA: 0.32, foot: '#38526c',
    glassTop: '#b4dcf2', glassBot: '#5e92ba', win: '#4d7aa2', winHi: '#8fbbd8', lit: '#f0faff', litGlow: '#e0f2ff', glint: '#ffffff', glintA: 0.55,
    steel: '#48637e', steelHi: '#e4f4ff', stain: '#3a5270', stainA: 0.08, paper: '#f4efe2', roofHi: '#fff4d2',
    dome: '#72aaa2', domeHi: '#c8f0e4', brick: '#b88a80', gas: '#7e98b4', gasHi: '#e6f4ff',
  },
};
export const palFor = (mode) => PAL[mode === 'clean' ? 'clean' : 'smog'];

// The wall of a building in tone `tone`: the tone, darker toward the foot (soot and distance), a shadow on the left from its
// neighbour, a lit strip down the right edge and one along the roof, both in the palette's edge colour. `far` thins the
// shadow (a far tower is flatter).
export function wall(g, P, x, y, w, h, tone, far = 0) {
  g.fillStyle = tone;
  g.fillRect(x, y, w, h);
  fade(g, x, y, w, h, [[0, rgba(P.foot, 0)], [0.55, rgba(P.foot, 0.1)], [1, rgba(P.foot, 0.38)]]);
  fade(g, x, y, w, h, [[0, rgba(P.shadeL, P.shadeA * (1 - far * 0.5))], [0.3, rgba(P.shadeL, 0)], [0.82, rgba(P.edge, 0)], [1, rgba(P.edge, P.edgeA * 0.32)]], true);
  g.fillStyle = rgba(P.edge, P.edgeA * (1 - far * 0.4));
  g.fillRect(x + w - 2.2, y, 2.2, h);
  g.fillStyle = rgba(P.top, P.edgeA * 0.7);
  g.fillRect(x, y, w, 1.4);
  for (let i = 0, n = Math.floor(w / 26) + 1; i < n; i++) { // soot and rain runs down the face from the roof
    const [sx, len] = [x + 3 + hash(x * 7 + y * 3 + i) * (w - 6), h * (0.12 + 0.3 * hash(x * 5 + y + i * 11))];
    fade(g, sx, y + 2, 1.6 + hash(x + i) * 3, len, [[0, rgba(P.stain, P.stainA)], [1, rgba(P.stain, 0)]]);
  }
}

// A grid of windows in the box (x, y, w, h): cw x ch each, gx x gy apart, in rows and columns that fit. Each window is dark, a
// shade lighter (the sky in it) or lit, by a hash of its place and `seed`, so the twins agree on every one; a lit one is amber in
// the smog and a sun-struck white in the clean light, and now and then (a share of `glow`) leaves a faint light on `out`.
// Windows are batched by colour: three paths a grid.
export function windows(g, P, out, x, y, w, h, o) {
  const { cw, ch, gx, gy, seed, lit = 0.05, glow = 0.2, mode = 'pulse' } = o;
  const cols = Math.max(1, Math.floor((w + gx) / (cw + gx)));
  const rows = Math.max(1, Math.floor((h + gy) / (ch + gy)));
  const x0 = x + (w - (cols * (cw + gx) - gx)) / 2;
  const sets = [[], [], []];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = hash(seed * 977 + r * 131 + c * 7);
      const wx = x0 + c * (cw + gx);
      const wy = y + r * (ch + gy);
      sets[v < lit ? 2 : v < lit + 0.22 ? 1 : 0].push(wx, wy);
      if (v < lit * glow && out.lights.length < 44) lamp(out, wx + cw / 2, wy + ch / 2, 6 + cw, P.litGlow, mode, hash(seed + r + c * 3), 0.3);
    }
  }
  [P.win, P.winHi, P.lit].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    for (let k = 0; k < sets[i].length; k += 2) g.rect(sets[i][k], sets[i][k + 1], cw, ch);
    g.fill();
  });
  return { cols, rows };
}
