// World 13, Sunset Armada, the gull-winged glider (see w13.js): pale canvas on brass spars, a pilot in
// goggles looking down at the ship, a gull's head for a figurehead. The wings beat from raised and swept
// back to spread wide, the beak opens and shuts and a scarf streams from the cockpit the other way each
// beat. The gull, the scarf and the pilot are in w13-8.js.
import { path, ink, lin, rgba, shade, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { BRASS, GOLD, RED, brass, brassV, rope, rivet, stitches, patch, glint, smooth, sunlit } from './w13-kit.js';
import { gull, scarf, pilot } from './w13-8.js';

const TIP = '#3b3858'; // a gull's dark wing tips

// One primary feather from its base to its tip: pale, darkening to the tip, a shaft and a few barbs.
function feather(b, [x0, y0], [x1, y1], w, c) {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const [nx, ny] = [-(y1 - y0) / len, (x1 - x0) / len];
  const at = (u, k) => [x0 + (x1 - x0) * u + nx * k * w, y0 + (y1 - y0) * u + ny * k * w];
  smooth(b, [at(0, 0.5), at(0.5, 1), at(1, 0.4), at(1.1, 0), at(1, -0.4), at(0.5, -1), at(0, -0.5)]);
  ink(b, lin(b, x0, y0, x1, y1, [[0, shade(c, -0.1)], [0.5, c], [0.78, shade(TIP, 0.45)], [1, TIP]]), 1.35);
  path(b, [at(0.06, 0), at(0.96, 0)], true);
  line(b, rgba('#ffffff', 0.55), 0.8);
  b.beginPath();
  for (const u of [0.3, 0.5, 0.7]) {
    const [px, py] = at(u, 0);
    b.moveTo(px, py);
    b.lineTo(...at(u + 0.14, 0.75));
    b.moveTo(px, py);
    b.lineTo(...at(u + 0.14, -0.75));
  }
  line(b, rgba(TIP, 0.45), 0.7);
}

// The right wing (the left is its mirror): a canvas arm on brass ribs, a hand of feathers bent back at the
// wrist like a gull's. f = 1 spread and forward, f = 0 raised and swept back.
function wing(b, l, f, c) {
  const W = f ? [24, 12] : [21, 2];
  const T = f ? [43.6, -8] : [37, -33];
  const [S, R, Wt] = [[5, 8], [5, -18], [W[0] - 1, W[1] - 20]];
  const back = [Wt[0] - 1, Wt[1] - 8]; // where the trailing feathers start
  const lerp = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
  const P = (u, t) => lerp(lerp(S, W, u), lerp(R, Wt, u), t);
  const len = Math.hypot(T[0] - W[0], T[1] - W[1]);
  const [ax, ay] = [(T[0] - W[0]) / len, (T[1] - W[1]) / len];
    for (const v of [1, 0.8, 0.6, 0.4, 0.2]) { // the primaries, outermost first
    const tip = lerp(back, T, v);
    feather(b, lerp(W, T, 0.12 + 0.62 * v), tip, 4.4, c);
  }
  path(b, [S, W, Wt, R]); // the arm, canvas
  ink(b, lin(b, 5, 0, 24, 0, [[0, shade(c, -0.22)], [0.5, c], [1, shade(c, 0.12)]]), 2.6);
  b.save();
  b.clip();
  path(b, [P(0, 0.28), P(1, 0.28), P(1, 0.4), P(0, 0.4)]); // a squadron stripe
  b.fillStyle = rgba(RED, 0.9);
  b.fill();
  sunlit(b, W[1] - 6, W[1] + 4, 0.3);
  patch(b, P(0.72, 0.7)[0], P(0.72, 0.7)[1], 7, 5, f ? 0.3 : -0.2, shade(c, -0.2));
  for (const t of [0.52, 0.68]) stitches(b, ...P(0.06, t), ...P(0.94, t), '#6a5a7a', 3.4, 1.2);
  b.restore();
  for (const u of [0.34, 0.67]) { // the ribs
    path(b, [P(u, 0), P(u, 1)], true);
    line(b, INK, 2.9);
    line(b, BRASS, 1.5);
    rivet(b, ...P(u, 0), 1.3);
    rivet(b, ...P(u, 1), 1.1);
  }
  path(b, [S, W], true); // the leading spar
  line(b, INK, 4.2);
  line(b, brassV(b, 6, 14), 2.4);
  path(b, [P(0, 1), P(1, 1)], true);
  line(b, rgba(INK, 0.7), 1.6);
  rope(b, 4, 3, ...P(0.62, 0.05), 0, 0, 0.9); // bracing wires to the body
  rope(b, 4, -9, ...P(0.62, 0.95), 0, 0, 0.9);
  path(b, [W, T], true); // the hand's leading edge
  line(b, INK, 2.8);
  line(b, shade(BRASS, 0.2), 1.1);
  ellipse(b, W[0], W[1] - 3, 2.6, 2.6); // the wrist joint
  ink(b, brass(b, W[0] - 3, W[0] + 3), 1.5);
  glint(l, W[0], W[1] - 3.4, 2.8, '#fff6d0', 0.85);
  glint(l, T[0] - ax * 2, T[1] - ay * 2, 2.6, '#ffe6b0', 0.8);
  bloom(l, ...P(0.5, 0.45), 14, GOLD, f ? 0.2 : 0.14); // the low sun through the canvas
}

// The fuselage's outline.
function hull(g) {
  g.beginPath();
  g.moveTo(0, -38);
  g.bezierCurveTo(4, -34, 7, -22, 9, -8);
  g.bezierCurveTo(10.4, 4, 9.4, 14, 6.6, 22);
  g.bezierCurveTo(5.4, 26, 3, 28.4, 0, 29);
  g.bezierCurveTo(-3, 28.4, -5.4, 26, -6.6, 22);
  g.bezierCurveTo(-9.4, 14, -10.4, 4, -9, -8);
  g.bezierCurveTo(-7, -22, -4, -34, 0, -38);
}

// A gull-winged glider.
export function diver(b, l, f, c) {
  const s = f ? 1 : -1;
  both((m) => {
    for (const g of [b, l]) {
      g.save();
      g.scale(m, 1);
    }
    wing(b, l, f, c);
    for (const g of [b, l]) g.restore();
  });
  both((m) => { // the tailplane
    path(b, [[m * 4, -30], [m * 18, -37], [m * 17, -30], [m * 5, -22]]);
    ink(b, lin(b, 0, 0, m * 18, 0, [[0, c], [1, shade(c, -0.3)]]), 2);
    path(b, [[m * 11, -34], [m * 10.6, -26.6]], true);
    line(b, rgba(RED, 0.9), 2.2);
    rivet(b, m * 5.6, -27, 1);
  });
  hull(b); // the fuselage
  ink(b, lin(b, -10, 0, 10, 0, [[0, shade(c, 0.25)], [0.4, c], [1, shade(c, -0.42)]]), 2.8);
  b.save();
  b.clip();
  for (const x of [-4.4, 4.4]) { // planking
    b.beginPath();
    b.moveTo(x * 0.45, -36);
    b.bezierCurveTo(x * 1.2, -20, x * 1.5, 14, x * 0.4, 30);
    line(b, rgba(TIP, 0.28), 0.9);
  }
  sunlit(b, 12, 30, 0.4);
  b.restore();
  for (const [y, hw] of [[-24, 4.6], [-13, 8], [24.6, 6]]) { // brass bands round it; the last is the gull's collar
    path(b, [[-hw, y], [hw, y]], true);
    line(b, INK, 3.4);
    line(b, BRASS, 1.5);
    rivet(b, -hw + 0.4, y, 0.9);
    rivet(b, hw - 0.4, y, 0.9);
  }
  gull(b, l, f, c);
  scarf(b, s);
  pilot(b, l);
  gloss(b, -2, -15, 3, 8, 0.45, 0.05);
  bloom(l, 0, 0, 40, c, 0.08 + f * 0.04);
}
