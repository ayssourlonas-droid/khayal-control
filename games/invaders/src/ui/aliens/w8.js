// World 8, Event Horizon: forms bent by the hole's gravity. Dark glass and starlight: rings pulled
// into crescents with a lensed ghost of themselves above, a drop stretched into a comet, a cube
// pinched at every side, an obsidian shard in a tilted ring, a small sun with its own disk.
import { path, ink, lin, rad, rgba, shade, neon, eye, bloom, gloss, line, ellipse, TAU } from './kit.js';

// Dark glass: the colour at the lit edge, deep space inside.
const glass = (g, c, x, y, r) => rad(g, x, y, 0, r, [[0, '#0a0e22'], [0.6, shade(c, -0.55)], [1, shade(c, 0.1)]], x, y + r * 0.3);

// A ring pulled into a crescent, its lensed image arching faintly above it, a core in the hole.
function grunt(b, l, f, c) {
  const lift = f ? 2 : 0;
  ellipse(b, 0, 4, 22, 13);
  b.moveTo(12, 5);
  b.ellipse(0, 5, 12, 6, 0, 0, TAU);
  b.fillStyle = lin(b, 0, -9, 0, 17, [[0, shade(c, 0.4)], [0.5, shade(c, -0.25)], [1, shade(c, -0.7)]]);
  b.fill('evenodd');
  line(b, '#05060e', 2.6);
  b.beginPath();
  b.ellipse(0, 4, 21, 12, 0, Math.PI * 1.05, Math.PI * 1.95);
  line(b, rgba('#ffffff', 0.6), 1.4);
  b.beginPath();
  b.ellipse(0, -8 - lift, 18, 9, 0, Math.PI * 1.08, Math.PI * 1.92);
  line(b, rgba('#05060e', 0.9), 4);
  l.beginPath();
  l.ellipse(0, -8 - lift, 18, 9, 0, Math.PI * 1.08, Math.PI * 1.92);
  neon(l, c, 1.6, 0.8);
  eye(l, 0, 5, f ? 2.6 : 2, '#ffffff', 3.4);
}

// A drop stretched toward the hole: a long tail bending up and aside, bands of light along it.
function diver(b, l, f, c) {
  const k = f ? 1 : -1;
  const outline = () => {
    b.beginPath();
    b.moveTo(0, 26);
    b.bezierCurveTo(13, 20, 11, 2, 4, -8);
    b.quadraticCurveTo(k * 6 + 2, -24, k * 16, -32);
    b.quadraticCurveTo(k * 2 - 2, -22, -4, -8);
    b.bezierCurveTo(-11, 2, -13, 20, 0, 26);
  };
  outline();
  ink(b, glass(b, c, 0, 14, 16), 2.6);
  for (const y of [16, 6, -3]) {
    b.beginPath();
    b.ellipse(0, y + 2, 9 - (16 - y) * 0.35, 2.2, 0, 0, Math.PI);
    line(b, rgba(c, 0.6), 1.2);
  }
  gloss(b, -4, 14, 3, 6, 0.5);
  l.beginPath();
  l.moveTo(0, 26);
  l.bezierCurveTo(13, 20, 11, 2, 4, -8);
  l.quadraticCurveTo(k * 6 + 2, -24, k * 16, -32);
  neon(l, c, 1.4, 0.75);
  eye(l, 0, 15, 3, c, 3);
}

// A cube pinched at every side: bowed edges, a turned inner square, its edges burning gold.
function gunner(b, l, f, c) {
  const R = 24;
  const outer = () => {
    b.beginPath();
    for (let i = 0; i < 4; i++) {
      const a0 = (i / 4) * TAU - Math.PI / 4;
      const a1 = a0 + TAU / 4;
      const p0 = [Math.cos(a0) * R, Math.sin(a0) * R];
      const p1 = [Math.cos(a1) * R, Math.sin(a1) * R];
      if (!i) b.moveTo(...p0);
      b.quadraticCurveTo(Math.cos(a0 + TAU / 8) * 9, Math.sin(a0 + TAU / 8) * 9, ...p1);
    }
    b.closePath();
  };
  outer();
  ink(b, rad(b, 0, 0, 0, 24, [[0, shade(c, -0.2)], [0.5, shade(c, -0.65)], [1, shade(c, -0.1)]]), 2.6);
  const turn = f ? 0.25 : 0;
  const inner = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * TAU + turn;
    return [Math.cos(a) * 10, Math.sin(a) * 10];
  });
  for (const ctx of [b, l]) {
    path(ctx, inner);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU - Math.PI / 4;
      ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R);
      ctx.lineTo(...inner[(i + (f ? 0 : 3)) % 4]);
    }
  }
  line(b, '#05060e', 3);
  neon(l, c, 1.8, 0.9);
  eye(l, 0, 0, 2.6, '#ffffff', 3.6);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU - Math.PI / 4;
    eye(l, Math.cos(a) * R, Math.sin(a) * R, 1.4, c, 2.6);
  }
}

// An obsidian shard: a heavy faceted hexagon, a polar ring of light standing up through it, passing
// behind it on the left and before it on the right (the carrier's disk lies flat: they must not
// read alike).
const POLAR = [Math.PI / 2, Math.PI * 1.5]; // the half of the ring behind the shard
function armored(b, l, f, c) {
  const tilt = f ? 0.42 : 0.3;
  const ring = (from, to, color, w) => {
    b.beginPath();
    b.ellipse(0, 0, 10, 31, tilt, from, to);
    line(b, color, w);
  };
  ring(...POLAR, '#05060e', 4.4);
  ring(...POLAR, shade(c, 0.5), 2);
  const hex = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * TAU - Math.PI / 2;
    return [Math.cos(a) * 21, Math.sin(a) * 24];
  });
  path(b, hex);
  ink(b, lin(b, -21, -24, 21, 24, [[0, shade(c, 0.35)], [0.5, shade(c, -0.45)], [1, '#06070e']]), 3.2);
  for (const [i, a] of [[0, 0.22], [2, 0.08], [4, 0.14]]) {
    path(b, [[0, 0], hex[i], hex[(i + 1) % 6]]);
    b.fillStyle = rgba('#ffffff', a);
    b.fill();
  }
  for (let i = 0; i < 6; i += 2) {
    path(b, [[0, 0], hex[i]], true);
    line(b, rgba('#000000', 0.45), 1.2);
  }
  gloss(b, -8, -12, 5, 2.5, 0.5, -0.5);
  ring(-Math.PI / 2, Math.PI / 2, '#05060e', 4.4);
  ring(-Math.PI / 2, Math.PI / 2, shade(c, 0.5), 2);
  l.beginPath();
  l.ellipse(0, 0, 10, 31, tilt, 0, TAU);
  neon(l, '#c8d8ff', 1, 0.55);
  eye(l, 0, 0, 2, '#8fb8ff', 3);
}

// A small sun: a white-hot core in a tilted, glowing disk of its own.
function carrier(b, l, f, c) {
  const tilt = f ? 0.2 : 0.12;
  b.beginPath();
  b.ellipse(0, 0, 28, 7, tilt, 0, TAU);
  b.ellipse(0, 0, 15, 3.6, tilt, 0, TAU);
  b.fillStyle = lin(b, -28, 0, 28, 0, [[0, shade('#ff9a4a', -0.2)], [0.5, c], [1, shade('#ff9a4a', -0.2)]]);
  b.fill('evenodd');
  line(b, '#05060e', 2);
  ellipse(b, 0, 0, 13, 13);
  ink(b, rad(b, 0, 0, 0, 13, [[0, '#ffffff'], [0.55, c], [1, shade('#ff9a4a', -0.1)]]), 2.4);
  b.beginPath();
  b.ellipse(0, 0, 28, 7, tilt, 0, Math.PI);
  b.ellipse(0, 0, 15, 3.6, tilt, Math.PI, 0, true);
  b.fillStyle = lin(b, -28, 0, 28, 0, [[0, shade('#ff9a4a', -0.1)], [0.5, '#ffffff'], [1, shade('#ff9a4a', -0.1)]]);
  b.fill();
  bloom(l, 0, 0, 34, c, 0.55 + f * 0.1);
  l.beginPath();
  l.ellipse(0, 0, 26, 6, tilt, 0, TAU);
  neon(l, '#ffd28a', 1.4, 0.6);
}

export default { rate: 1.6, bob: 3, halo: 0.26, crack: '#c8d8ff', grunt, diver, gunner, armored, carrier };
