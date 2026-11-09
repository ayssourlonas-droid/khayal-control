// World 15, Lantern Deep, the extras on the hermit crab's helmet (see w15-8.js): a dimly lit lamp port, the air
// hose off its brass coupling (ribbed rubber that swings between beats, a brass end cap, bubbles leaking from
// it), and the crown: an exhaust valve, a little coral garden growing beside it and barnacles on the shoulders
// of the dome. The coral sways and the bubbles move from one beat to the next.
import { path, ink, rad, rgba, shade, bloom, line, ellipse, circle, INK } from './w15-kit-2.js';
import { BRASS, GLOW, brassH, brassV, barnacles, coral } from './w15-kit-2.js';

const HOSE_RUBBER = '#1b2f38';

const bez = (P, t) => [0, 1].map((i) => (1 - t) ** 3 * P[0][i] + 3 * (1 - t) ** 2 * t * P[1][i] + 3 * (1 - t) * t * t * P[2][i] + t ** 3 * P[3][i]);
const dbez = (P, t) => [0, 1].map((i) => 3 * (1 - t) ** 2 * (P[1][i] - P[0][i]) + 6 * (1 - t) * t * (P[2][i] - P[1][i]) + 3 * t * t * (P[3][i] - P[2][i]));

// A small lamp port on the right of the dome, dimly lit.
export function sidePort(b, l) {
  ellipse(b, 13.4, -8.6, 3, 3.9, 0.3);
  ink(b, rad(b, 13.4, -8.6, 1, 5, [[0, shade(BRASS, 0.4)], [1, shade(BRASS, -0.5)]]), 1.8);
  ellipse(b, 13.4, -8.6, 1.7, 2.5, 0.3);
  ink(b, rad(b, 13.4, -8.6, 0.2, 3, [[0, '#2a9a80'], [1, '#07302c']]), 0.8);
  ellipse(l, 13.4, -8.6, 1.5, 2.2, 0.3);
  l.fillStyle = rgba(GLOW, 0.35);
  l.fill();
  bloom(l, 13.4, -8.6, 7, GLOW, 0.2);
}

// The coupling on the left of the dome and the air hose off it: ribbed rubber that swings between beats, a
// brass end cap, and a couple of bubbles leaking from it.
export function hose(b, f) {
  const s = f ? 1.8 : -1.5;
  path(b, [[-15.5, -9.5], [-21.5, -9.5], [-21.5, -2.5], [-15.5, -2.5]]);
  ink(b, brassH(b, -21.5, -15.5), 1.8);
  path(b, [[-23.4, -11.6], [-21, -11.6], [-21, 0.6], [-23.4, 0.6]]);
  ink(b, brassV(b, -11.6, 0.6, shade(BRASS, -0.15)), 1.6);
  const P = [[-23, -5.5], [-31.5, -6], [-33 + s * 0.5, 3], [-27.5 + s, 15]];
  b.beginPath();
  b.moveTo(...P[0]);
  b.bezierCurveTo(...P[1], ...P[2], ...P[3]);
  line(b, INK, 7);
  line(b, HOSE_RUBBER, 4.8);
  b.beginPath();
  b.moveTo(P[0][0], P[0][1] - 1.2);
  b.bezierCurveTo(P[1][0], P[1][1] - 1.2, P[2][0] - 1.2, P[2][1], P[3][0] - 1.2, P[3][1]);
  line(b, rgba('#9fd8e8', 0.28), 1);
  for (let i = 1; i < 11; i++) { // the wire winding
    const [x, y] = bez(P, i / 11.5);
    const [dx, dy] = dbez(P, i / 11.5);
    const k = 2.5 / Math.hypot(dx, dy);
    path(b, [[x - dy * k + dx * k * 0.3, y + dx * k - dy * k * 0.3], [x + dy * k - dx * k * 0.3, y - dx * k + dy * k * 0.3]], true);
    line(b, rgba('#5a8a98', 0.5), 0.8);
  }
  const [ex, ey] = bez(P, 0.94);
  b.beginPath();
  b.moveTo(ex, ey);
  b.lineTo(...P[3]);
  line(b, INK, 7.4);
  line(b, brassV(b, ey, P[3][1]), 5);
  ellipse(b, P[3][0], P[3][1] + 0.4, 2.8, 1.2);
  b.fillStyle = '#050e12';
  b.fill();
  for (const [dx, dy, r] of f ? [[-3, 3, 1.6], [-6, -2, 1.1], [-2, -6, 0.8]] : [[2, 3, 1.4], [4.5, -2, 1.7], [1, -6.5, 1]]) { // bubbles
    circle(b, P[3][0] + dx, P[3][1] + dy, r);
    b.fillStyle = rgba('#bff4ff', 0.16);
    b.fill();
    line(b, rgba('#bff4ff', 0.75), 0.7);
  }
}

// On top: the exhaust valve, a coral garden growing beside it, barnacles on the shoulders of the dome.
export function crown(b, f) {
  const w = f ? 0.1 : -0.08;
  coral(b, -11.8, -12.4, 5.6, -2.3 + w, '#a870e0', 3, 1.8, 2);
  coral(b, -7.4, -16.6, 5, -1.95 - w, '#ff8fb0', 5, 1.6, 2);
  path(b, [[-3.4, -18.2], [3.4, -18.2], [2.4, -21.2], [-2.4, -21.2]]);
  ink(b, brassH(b, -3.4, 3.4), 1.5);
  circle(b, 0, -22, 2.1);
  ink(b, rad(b, 0, -22, 0.2, 2.4, [[0, shade(BRASS, 0.7)], [0.6, BRASS], [1, shade(BRASS, -0.55)]], -0.7, -22.8), 1.3);
  barnacles(b, 11, 5, 1.8, 3, 1, 3);
  barnacles(b, -11.6, 6, 1.5, 2, 2, 2.2);
  barnacles(b, 15, 20, 1.6, 2, 3, 2.4);
}

