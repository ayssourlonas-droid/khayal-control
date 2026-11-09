// Sprites the Lantern Leviathan's lure draws (World 15, Lantern Deep; angler-lure.js), each painted once on first use
// and kept: the stalk that rises from the crown, arches forward over the crest and bends down in front of the face,
// the tether it hangs the lure on, the lure itself (a glassy bulb with a hot white-cyan core) and the soft filaments
// that trail from it with the tiny lights at their tips. Cache keys are all 'anglerLure...'. angler-sprites-2.js
// holds the rest (the rays, the glows' colours, the jaw's and the fins') and warm(), which paints every sprite the
// live extras use ahead of the fight.
//   boss coordinates: the stalk springs from the crown's knob at ROOT, rises to about y -145 and bends over to its
//   tip, TIP; the tether hangs from the tip, L long; the bulb sits at its end, BULB_R in radius. Nothing reaches
//   above y -153.
import { cached } from '../sprites.js';
import { line, lin, rad, rgba, ellipse } from './kit.js';
import { circle, AQUA, PALE, INK } from './angler-kit.js';

export const ROOT = [-4, -122];
export const TIP = [46, -126];
export const L = 42; // the tether's length: the bulb's middle hangs this far below the stalk's tip
export const BULB_R = 23;
export const STALK = { x: -26, y: -153, w: 84, h: 42 }; // the stalk sprite's box in boss coordinates
const CURVE = [ROOT, [-20, -149], [40, -155], TIP];

const bez = (u) => {
  const v = 1 - u;
  const [a, b, c, d] = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u];
  return CURVE.reduce((p, q, i) => [p[0] + q[0] * [a, b, c, d][i], p[1] + q[1] * [a, b, c, d][i]], [0, 0]);
};

// The stalk: a thick root growing out of the crown's knob, tapering fast to a whip with an eyelet for the tether,
// bumpy as flesh is, ringed by a few irregular creases, pale and lit along its upper edge so it reads against both
// the water and the crest, paler toward the tip where the lure's light reaches it.
export const stalk = () => cached('anglerLureStalk', STALK.w, STALK.h, (g) => {
  g.translate(-STALK.x, -STALK.y);
  const N = 18;
  const mid = Array.from({ length: N + 1 }, (_, i) => bez(i / N));
  const width = (i) => 3.2 + 8.2 * (1 - i / N) ** 3 + 0.9 * Math.sin(i * 1.9);
  const edge = (side) => mid.map(([x, y], i) => {
    const [x1, y1] = mid[Math.min(N, i + 1)];
    const [x0, y0] = mid[Math.max(0, i - 1)];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    return [x + (-(y1 - y0) / len) * width(i) * 0.5 * side, y + ((x1 - x0) / len) * width(i) * 0.5 * side];
  });
  const [up, dn] = [edge(1), edge(-1)];
  const poly = () => {
    g.beginPath();
    up.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
    dn.toReversed().forEach(([x, y]) => g.lineTo(x, y));
    g.closePath();
  };
  ellipse(g, ROOT[0], ROOT[1] + 1, 13, 8); // the root flares into the knob, no edge
  g.fillStyle = rad(g, ROOT[0], ROOT[1] + 1, 0, 13, [[0, '#34608a'], [0.6, rgba('#34608a', 0.85)], [1, rgba('#34608a', 0)]]);
  g.fill();
  poly();
  g.fillStyle = lin(g, ROOT[0], ROOT[1], TIP[0], TIP[1], [[0, '#4a7ca8'], [0.35, '#86bcdc'], [1, '#d8f8ff']]);
  g.fill();
  for (const pts of [up, dn]) { // the outline, from a little way up: the root has none
    g.beginPath();
    pts.slice(3).forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
    line(g, INK, 2.4);
  }
  g.save(); // blotches and freckles in the skin
  poly();
  g.clip();
  for (let i = 1; i < N; i += 2) {
    const [x, y] = mid[i];
    g.fillStyle = rad(g, x, y, 0, 6, [[0, rgba('#0a1c34', 0.32)], [1, rgba('#0a1c34', 0)]]);
    g.fillRect(x - 6, y - 6, 12, 12);
    circle(g, x + 1.5, y - 1.4, 0.8);
    g.fillStyle = rgba('#f0ffff', 0.5);
    g.fill();
  }
  g.restore();
  const edgeLine = (pts, c, w) => {
    g.beginPath();
    pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
    line(g, c, w);
  };
  edgeLine(up.map(([x, y]) => [x, y + 1.1]), rgba('#e8fbff', 0.45), 1);
  edgeLine(dn.map(([x, y]) => [x, y - 1.2]), rgba('#12385a', 0.6), 2);
  for (const i of [3, 6, 7, 11, 13]) { // creases, a few, not evenly spaced
    g.beginPath();
    g.moveTo(...up[i]);
    g.quadraticCurveTo((up[i][0] + dn[i][0]) / 2 + 1.5, (up[i][1] + dn[i][1]) / 2 + 1, ...dn[i]);
    line(g, rgba('#12385a', 0.4), 1);
  }
  for (const [i, r] of [[2, 1.6], [5, 1.3], [9, 1.2]]) { // swellings
    circle(g, mid[i][0] + 1, mid[i][1] - 1, r);
    g.fillStyle = rgba('#e8fbff', 0.2);
    g.fill();
  }
  circle(g, TIP[0], TIP[1] + 0.5, 2.4);
  g.fillStyle = '#e4fbff';
  g.fill();
  line(g, INK, 1);
});

// The stalk's own light, additive over it: the lure lights it, most near the tip, so it reads against the dark crown.
export const stalkGlow = () => cached('anglerLureStalkGlow', STALK.w, STALK.h, (g) => {
  g.translate(-STALK.x, -STALK.y);
  const N = 18;
  for (const [w, a] of [[11, 0.06], [7.5, 0.1], [4, 0.17]]) {
    for (let i = 0; i < N; i++) {
      const [p, q] = [bez(i / N), bez((i + 1) / N)];
      g.beginPath();
      g.moveTo(p[0], p[1]);
      g.lineTo(q[0], q[1]);
      line(g, rgba(AQUA, a * (0.35 + 0.65 * (i / N) ** 1.4) * 2), w);
    }
  }
});

// The tether: a hair of pale filament 12 x 44, drawn from its top at (6, 4), a little wavy.
export const tether = () => cached('anglerLureTether', 12, 44, (g) => {
  const pts = [[6, 4], [6.8, 12], [5.4, 20], [6.6, 28], [5.8, 36]];
  for (const [c, w] of [[INK, 3], ['#bfeef8', 1.5]]) {
    g.beginPath();
    pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
    line(g, c, w);
  }
});

// The bulb: a glassy lure, white-hot at the middle and cyan toward its rim, in a small dark cup of flesh at its top,
// 64 x 64, its middle at (32, 34); the glow is added over it (angler-lure.js).
export const BULB = [32, 34];
export const bulb = () => cached('anglerLureBulb', 64, 64, (g) => {
  ellipse(g, 32, 9, 7, 4.4);
  g.fillStyle = '#12304a';
  g.fill();
  line(g, INK, 1.6);
  circle(g, BULB[0], BULB[1], BULB_R);
  g.fillStyle = rad(g, BULB[0], BULB[1], 0, BULB_R, [[0, '#ffffff'], [0.3, '#e4fdff'], [0.62, '#7fe8f4'], [0.88, '#2aa4bc'], [1, '#0d5272']], 30, 31);
  g.fill();
  line(g, '#0a3a52', 1.8);
  for (let i = 0; i < 11; i++) { // faint ribs inside the glass
    const a = (i / 11) * Math.PI * 2 + 0.2;
    g.beginPath();
    g.moveTo(BULB[0] + Math.cos(a) * 9, BULB[1] + Math.sin(a) * 9);
    g.lineTo(BULB[0] + Math.cos(a) * (BULB_R - 2), BULB[1] + Math.sin(a) * (BULB_R - 2));
    line(g, rgba('#ffffff', 0.13), 1);
  }
  ellipse(g, 24, 25, 6, 3.4, -0.7);
  g.fillStyle = rgba('#ffffff', 0.85);
  g.fill();
  g.beginPath();
  g.arc(BULB[0], BULB[1], BULB_R - 3, 0.4, 1.7);
  line(g, rgba('#c8fcff', 0.4), 1.4);
});

// The filaments: six soft threads trailing from the bulb's underside, each curling out to a bead, 96 x 100, the
// bulb's middle at (48, 26) (they are drawn under the bulb, so that they grow out from behind it). TIPS are the
// beads' places, for the lights.
export const FIL = [48, 26];
const ANG = [-1.2, -0.72, -0.26, 0.22, 0.7, 1.16];
const LEN = [14, 24, 32, 30, 22, 13];
export const TIPS = ANG.map((a, i) => [FIL[0] + Math.sin(a) * (BULB_R + LEN[i]), FIL[1] + Math.cos(a) * (BULB_R + LEN[i])]);
export const filaments = () => cached('anglerLureFilaments', 96, 100, (g) => {
  ANG.forEach((a, i) => {
    const [x0, y0] = [FIL[0] + Math.sin(a) * (BULB_R - 4), FIL[1] + Math.cos(a) * (BULB_R - 4)];
    const [tx, ty] = TIPS[i];
    const bow = (i % 2 ? 1 : -1) * 7;
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo((x0 + tx) / 2 + bow, (y0 + ty) / 2 - 1, tx, ty);
    line(g, INK, 2.6);
    line(g, '#a8ecf6', 1.3);
    circle(g, tx, ty, i % 2 ? 2.8 : 2);
    g.fillStyle = '#e8ffff';
    g.fill();
    line(g, '#1a7a94', 0.9);
  });
});

// The lights at the filaments' tips: a small hot glow on each, to be drawn additively over the filaments.
export const filamentGlow = () => cached('anglerLureFilGlow', 96, 100, (g) => {
  for (const [x, y] of TIPS) {
    g.fillStyle = rad(g, x, y, 0, 9, [[0, 'rgba(240,255,255,0.95)'], [0.3, rgba(AQUA, 0.6)], [1, rgba(PALE, 0)]]);
    g.fillRect(x - 9, y - 9, 18, 18);
  }
});
