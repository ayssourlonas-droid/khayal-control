// World 6, Code Rain: squid drones of the code world. Gunmetal heads, rows of burning eyes,
// segmented tentacles trailing behind them (up, since they hunt downward) that sway between frames,
// edges caught in green code-light.
import { path, sym, ink, lin, rad, rgba, shade, neon, eye, bloom, gloss, line, circle, both, TAU } from './kit.js';

const RIM = '#33ff66';

// Gunmetal: a cold sheen up-left, dark steel, black at the rim.
const metal = (g, x, y, r) => rad(g, x, y, 0, r, [[0, '#a8b8b2'], [0.35, '#3c4a46'], [1, '#070b0c']], x - r * 0.35, y - r * 0.45);

// The rim of the current path of b caught in code-light.
function edge(b, a = 0.55) {
  line(b, rgba(RIM, a), 1.4);
}

// A segmented tentacle from (x, y) toward angle a (radians, 0 = right), curling by `bend`: a
// tapering tube (outline, steel, a lit ridge) ringed every segment, an eye every `eyeEvery`.
function tentacle(b, l, x, y, a, len, bend, r0, eyeEvery = 0) {
  const n = Math.max(4, Math.round(len / 4.5));
  const pts = [[x, y]];
  for (let i = 1; i <= n; i++) {
    const ang = a + bend * (i / n) ** 2;
    const [px, py] = pts[i - 1];
    pts.push([px + Math.cos(ang) * (len / n), py + Math.sin(ang) * (len / n)]);
  }
  const r = (i) => r0 * (1 - (i / n) * 0.65);
  for (const [w, c, dx] of [[2.6, '#030606', 0], [0, '#3c4a46', 0], [-0.55, '#8a9a94', -0.5]]) {
    for (let i = 0; i < n; i++) {
      path(b, [[pts[i][0] + dx, pts[i][1] + dx], [pts[i + 1][0] + dx, pts[i + 1][1] + dx]], true);
      line(b, c, w < 0 ? r(i) * -w * 2 : r(i) * 2 + w);
    }
  }
  for (let i = 1; i < n; i++) {
    circle(b, pts[i][0], pts[i][1], r(i) * 0.9);
    line(b, rgba('#000000', 0.5), 0.9);
    if (eyeEvery && i % eyeEvery === 0) eye(l, pts[i][0], pts[i][1], 0.9, RIM, 2.2);
  }
  eye(l, pts[n][0], pts[n][1], 0.7, RIM, 2);
}

const UP = -Math.PI / 2;

// A small squid drone: a round head, three eyes in a row, a fan of six tentacles.
function grunt(b, l, f, c) {
  const sway = f ? 0.35 : -0.35;
  for (const k of [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]) {
    tentacle(b, l, k * 3, 2, UP + k * 0.28, 26, sway * (k > 0 ? 1 : -1) + k * 0.1, 3);
  }
  circle(b, 0, 8, 13);
  ink(b, metal(b, 0, 8, 13), 2.6);
  b.beginPath();
  b.arc(0, 8, 12, 0.2, Math.PI - 0.2);
  edge(b);
  path(b, [[-9, 12], [9, 12]], true);
  line(b, '#020504', 5);
  for (const x of [-6, 0, 6]) eye(l, x, 12, 1.8, c, 3);
}

// A hunter: a long pointed head, two long tentacles streaming out behind, short front claws.
function diver(b, l, f, c) {
  const sway = f ? 0.5 : -0.2;
  both((s) => tentacle(b, l, s * 4, -10, UP + s * 0.35, 30, s * sway, 3.4, 3));
  both((s) => {
    path(b, [[s * 6, 14], [s * 11, 24], [s * 6, 30]], true);
    line(b, '#05080a', 4);
    path(b, [[s * 6, 14], [s * 11, 24], [s * 6, 30]], true);
    edge(b, 0.5);
  });
  path(b, sym([[0, 30], [6, 18], [9, 2], [8, -10], [4, -16], [0, -17]]));
  ink(b, metal(b, 0, 2, 22), 2.6);
  path(b, [[-8, -6], [-9, 2], [-6, 18], [0, 30]], true);
  edge(b);
  for (const y of [8, 14]) eye(l, 0, y, 1.8, c, 3);
  gloss(b, -3, -6, 2, 5, 0.35);
}

// A many-eyed squid drone: a wide dome, a crescent of white-hot eyes, two pairs of claws below.
function gunner(b, l, f, c) {
  for (const k of [-1.5, -0.5, 0.5, 1.5]) tentacle(b, l, k * 7, -8, UP + k * 0.3, 18, (f ? 0.3 : -0.3) * k, 3.2);
  both((s) => [[10, 18, 26], [5, 20, 30]].forEach(([x0, x1, y1]) => {
    const claw = [[s * x0, 6], [s * x1, 14 + f * 2], [s * (x1 - 6), y1]];
    path(b, claw, true);
    line(b, '#05080a', 4.4);
    path(b, claw, true);
    line(b, '#3a4844', 2);
  }));
  b.beginPath();
  b.ellipse(0, 0, 24, 15, 0, Math.PI, 0);
  b.quadraticCurveTo(0, 16, -24, 0);
  ink(b, metal(b, 0, -2, 24), 2.8);
  b.beginPath();
  b.ellipse(0, 0, 23, 14, 0, Math.PI + 0.25, -0.25);
  edge(b, 0.45);
  for (let i = 0; i < 7; i++) { // a cluster of eyes arched across the brow, the middle pair largest
    const a = Math.PI * (1.18 + (0.64 * i) / 6);
    const big = i === 2 || i === 4;
    const x = Math.cos(a) * 14;
    const y = 6 + Math.sin(a) * 8 + (big ? 3 : 0);
    circle(b, x, y, big ? 3.6 : 2.6);
    b.fillStyle = '#020504';
    b.fill();
    eye(l, x, y, big ? 2.2 : 1.4, big ? c : RIM, 2.6);
  }
}

// A heavy squid drone: a ringed spherical shell, one great lens, four thick armoured tentacles.
function armored(b, l, f, c) {
  for (const k of [-1.5, -0.5, 0.5, 1.5]) tentacle(b, l, k * 9, -10, UP + k * 0.45, 20, (f ? 0.25 : -0.25), 4.6);
  circle(b, 0, 2, 22);
  ink(b, metal(b, 0, 2, 22), 3.2);
  for (const r of [17, 11]) {
    circle(b, 0, 4, r);
    line(b, rgba('#000000', 0.55), 2);
  }
  b.beginPath();
  b.arc(0, 2, 21, Math.PI * 1.1, Math.PI * 1.6);
  edge(b, 0.6);
  circle(b, 0, 6, 8);
  ink(b, '#020504', 2);
  circle(l, 0, 6, 6.4);
  neon(l, c, 1.6);
  eye(l, 0, 6, f ? 3.4 : 2.6, c, 3.4);
  gloss(b, -8, -9, 5, 3, 0.4, -0.5);
}

// A data core: a burning lime crystal in a cage of four thin arms, code ticks around it.
function carrier(b, l, f, c) {
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4 + f * 0.2;
    const arm = [[Math.cos(a) * 9, Math.sin(a) * 9], [Math.cos(a + 0.5) * 22, Math.sin(a + 0.5) * 22],
      [Math.cos(a + 0.9) * 18, Math.sin(a + 0.9) * 18]];
    path(b, arm, true);
    line(b, '#05080a', 4.6);
    path(b, arm, true);
    line(b, '#4a5a54', 2);
  }
  const gem = [[0, -17], [11, 0], [0, 17], [-11, 0]];
  path(b, gem);
  ink(b, lin(b, -11, -17, 11, 17, [[0, '#ffffff'], [0.4, c], [1, shade(c, -0.5)]]), 2.6);
  path(b, [[0, -17], [0, 17]], true);
  line(b, rgba('#203006', 0.5), 1.2);
  path(b, [[-11, 0], [11, 0]], true);
  line(b, rgba('#203006', 0.5), 1.2);
  bloom(l, 0, 0, 30, c, 0.55);
  path(l, gem);
  neon(l, c, 1.4, 0.8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + (f ? 0.2 : 0);
    path(l, [[Math.cos(a) * 25, Math.sin(a) * 25], [Math.cos(a) * 28, Math.sin(a) * 28]], true);
    neon(l, RIM, 1, 0.6);
  }
}

export default { rate: 2.4, bob: 2.5, halo: 0.28, crack: RIM, grunt, diver, gunner, armored, carrier };
