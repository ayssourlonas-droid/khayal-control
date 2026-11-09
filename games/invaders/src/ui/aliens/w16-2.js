// World 16, Glass Cathedral, the diver (see w16.js): a swallow of cobalt glass, streamlined and pointing down
// into its dive. Two long narrow swept wings of leaded panes (cobalt and clear, w16-wing.js) beat between a
// raised, back-swept pose on beat 0 and a spread, lowered one on beat 1; a forked tail of two glass streamers
// trails behind (above it) and spreads on beat 1; the slim body is banded in lead chevrons, its dome of a head
// wears a ruby crest, an amber beak and a hot little eye each side. Lights: the glass shining through, the
// jewels and the eyes.
import { pane, poly, came, bez, ink, lin, rad, rgba, shade, mix, line, circle, eye, star4, bloom, LEAD, SAPPHIRE, CLEAR, RUBY, AMBER } from './w16-kit.js';
import { lattice } from './w16-wing.js';

const TIP = [[38, -31], [43, 11]]; // a wing's tip on each beat

function edges(m, f) {
  const T = TIP[f];
  const S = [3.5, 16]; // the leading edge's root and the trailing edge's
  const R = [5, -12];
  const at = (P, k, dy) => [P[0] + (T[0] - P[0]) * k, P[1] + (T[1] - P[1]) * k + dy];
  const flip = (pts) => pts.map(([x, y]) => [m * x, y]);
  return [flip(bez(S, at(S, 0.3, 11), at(S, 0.72, 8), T, 18)), flip(bez(R, at(R, 0.35, -3), at(R, 0.75, -8), T, 18))];
}

function wings(b, l, f, c) {
  for (const m of [-1, 1]) {
    const [le, te] = edges(m, f);
    const row = [SAPPHIRE, c, shade(c, 0.1), mix(c, SAPPHIRE, 0.5), c, mix(c, SAPPHIRE, 0.3)]; // the leading band, deep to light
    lattice(b, l, le, te, 2, 6, (i, j) => (j ? (i % 2 ? shade(c, 0.12) : mix(c, CLEAR, 0.6)) : row[i]), 0.15, '#cfe4ff');
  }
}

// The forked tail: two streamers from the root, each two panes long, the fork wider on beat 1.
function tail(b, l, f, c) {
  for (const m of [-1, 1]) {
    const tip = [m * (13 + f * 3.5), -44];
    const outer = bez([m * 6.5, -16], [m * 11, -27], [m * (13 + f * 2), -38], tip, 10);
    const inner = bez([m * 0.8, -20], [m * 3, -29], [m * (7 + f * 2), -38], tip, 10);
    for (let i = 0; i < 2; i++) {
      const pts = [...outer.slice(i * 5, i * 5 + 6), ...inner.slice(i * 5, i * 5 + 6).reverse()];
      pane(b, l, poly(pts), i ? mix(c, CLEAR, 0.42) : mix(c, SAPPHIRE, 0.3), [(pts[0][0] + pts[11][0]) / 2, (pts[0][1] + pts[11][1]) / 2, 8], 0.14, 1.3);
    }
  }
}

function body(b, l, f, c) {
  b.beginPath();
  b.moveTo(2, -22);
  b.bezierCurveTo(3.4, -12, 7.4, 0, 7.2, 8);
  b.bezierCurveTo(7, 14, 5.6, 18, 5, 23);
  b.lineTo(-5, 23);
  b.bezierCurveTo(-5.6, 18, -7, 14, -7.2, 8);
  b.bezierCurveTo(-7.4, 0, -3.4, -12, -2, -22);
  b.closePath();
  ink(b, lin(b, -8, 0, 8, 0, [[0, shade(c, 0.4)], [0.35, mix(c, SAPPHIRE, 0.25)], [0.8, mix(c, '#101040', 0.55)], [1, mix(c, '#101040', 0.75)]]), 2.6);
  b.save();
  b.clip();
  for (let k = 0; k < 6; k++) { // lead chevrons across the body
    const y = 20 - k * 8;
    b.beginPath();
    b.moveTo(-8, y - 3.4);
    b.lineTo(0, y + 2);
    b.lineTo(8, y - 3.4);
    line(b, rgba(LEAD, 0.62), 1.2);
  }
  b.beginPath();
  b.moveTo(0, 23);
  b.lineTo(0, -22);
  line(b, rgba(LEAD, 0.55), 1.1);
  b.fillStyle = lin(b, -7, 0, 7, 0, [[0, rgba('#ffffff', 0.42)], [0.28, rgba('#ffffff', 0)]]);
  b.fillRect(-8, -22, 16, 46);
  b.restore();
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(c, 0.12);
  l.fillRect(-5, -14, 10, 34);
  l.restore();
}

// The head: a tapering dome of pale glass running into an amber beak, a hot little eye on each side.
function head(b, l, f, c) {
  const dome = (g) => {
    g.beginPath();
    g.moveTo(-5.4, 21);
    g.bezierCurveTo(-9.6, 28, -5.6, 36, 0, 37.6);
    g.bezierCurveTo(5.6, 36, 9.6, 28, 5.4, 21);
    g.closePath();
  };
  pane(b, l, (g) => { g.beginPath(); g.moveTo(-3.6, 35); g.lineTo(0, 45); g.lineTo(3.6, 35); g.closePath(); }, AMBER, [0, 38, 5], 0.3, 1.8);
  dome(b);
  b.fillStyle = rad(b, 0, 28, 0.5, 10, [[0, '#ffffff'], [0.45, shade(c, 0.5)], [1, mix(c, '#101040', 0.45)]], -2.6, 25);
  b.fill();
  came(b, 2.2);
  const crest = (g) => {
    g.beginPath();
    g.moveTo(-4.8, 22.4);
    g.quadraticCurveTo(0, 18.8, 4.8, 22.4);
    g.quadraticCurveTo(0, 25.6, -4.8, 22.4);
  };
  pane(b, l, crest, RUBY, [0, 22.2, 3.4], 0.25, 1.2);
  for (const m of [-1, 1]) {
    const [x, y] = [m * 4.2, 29.6];
    circle(b, x, y, 1.9);
    ink(b, rad(b, x, y, 0.1, 2.2, [[0, '#fff1c8'], [0.4, '#ff6a50'], [1, '#8a1030']], x - 0.6, y - 0.7), 1.2);
    eye(l, x, y, 1, '#ff6a50', 2.8 + f * 0.6);
  }
  star4(b, -3.6, 24.4, 2.4, '#ffffff', 0.85);
}

export function diver(b, l, f, c) {
  tail(b, l, f, c);
  wings(b, l, f, c);
  body(b, l, f, c);
  head(b, l, f, c);
  bloom(l, 0, 4, 34, c, 0.1 + f * 0.04);
}
