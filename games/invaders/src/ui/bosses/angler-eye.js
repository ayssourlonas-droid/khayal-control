// The Lantern Leviathan's eye (World 15, Lantern Deep; see angler.js): a weak part 90 x 90 for the hit box, painted
// once as the left eye and mirrored for the right. A great milky eye, wet and lens-like, set in a swollen ring of
// flesh (lumps, folds, a bag under it) with a heavy lid hanging over its top and a few ragged spines of skin at the
// lid's outer end: a pale blue-white globe veined at its edge, a glassy cyan-white lens in it, a vertical slit
// pupil with a glimmer at its foot, wet highlights, the lid's shadow across the top. No metal, no bolts: it is an
// eye. The lights layer carries the lens's ring, the glimmer and a halo in the weak colour.
import { path, line, lin, rad, rgba, ellipse, gloss, bloom, eye as lamp } from './kit.js';
import { hash } from '../sprites.js';
import { circle, lumpy, rng, PALE, TEAL, INK, FLESH, TAU } from './angler-kit.js';

const BALL = 34; // the globe's radius
const LENS = [2, 2, 21]; // the lens's middle (a little toward the face and down) and its radius
const SLIT = [4.2, 14.5]; // the pupil's half width and half height

const swelling = (b, x, y, r, a = 1) => {
  b.fillStyle = rad(b, x, y, 0, r, [[0, rgba('#7ab0d0', 0.42 * a)], [0.55, rgba(FLESH, 0.2 * a)], [1, rgba('#000610', 0.38 * a)]], x - r * 0.3, y - r * 0.35);
  circle(b, x, y, r);
  b.fill();
};

// The ring of flesh the eye sits in: lit from above, a lumpy edge, folds running out from the lids, swellings.
function socket(b) {
  lumpy(b, 0, 1, 50, 8, 22);
  b.fillStyle = rad(b, 0, 0, 24, 54, [[0, '#0a1e32'], [0.45, '#1f4868'], [1, '#122f48']], -8, -12);
  b.fill();
  line(b, INK, 2.4);
  const r = rng(29);
  for (let i = 0; i < 20; i++) { // folds
    const a = (i / 20) * TAU + r() * 0.2;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const [r0, r1] = [37 + r() * 3, 44 + r() * 5];
    path(b, [[c * r0, s * r0], [c * r1 + s * 2, s * r1 - c * 2]], true);
    line(b, rgba('#000812', 0.4), 1.5);
    path(b, [[c * r0 + s * 1.6, s * r0 - c * 1.6], [c * r1 + s * 3.4, s * r1 - c * 3.6]], true);
    line(b, rgba('#a8dcf0', 0.14), 1);
  }
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * 0.05 + i * 0.62 + r() * 0.2;
    swelling(b, Math.cos(a) * 43, Math.sin(a) * 43, 4.5 + r() * 3.5);
  }
  b.beginPath(); // the bag under the eye
  b.ellipse(0, 36, 28, 7, 0, 0.15, Math.PI - 0.15);
  line(b, rgba('#000812', 0.5), 2.6);
}

// The globe: milky, bluish toward its rim, veined where it meets the lids.
function globe(b) {
  circle(b, 0, 0, BALL);
  b.fillStyle = rad(b, 0, 0, 0, BALL, [[0, '#f4fcff'], [0.4, '#d6ecf4'], [0.75, '#98bccd'], [0.93, '#4f7c98'], [1, '#1d3d58']], -9, -11);
  b.fill();
  line(b, INK, 1.8);
  for (let k = 0; k < 12; k++) {
    const a = (k * TAU) / 12 + hash(k + 5) * 0.4;
    const pt = (rr, da) => [LENS[0] + Math.cos(a + da) * rr, LENS[1] + Math.sin(a + da) * rr];
    path(b, [pt(33, 0), pt(29.5, 0.12), pt(26, -0.05)], true);
    line(b, rgba('#8a96dc', 0.4), 0.9);
    path(b, [pt(29.5, 0.12), pt(27.5, 0.36)], true);
    line(b, rgba('#7aa6d8', 0.32), 0.7);
  }
}

// The lens: a glassy disc of cyan-white, soft fibres, a dark edge, the slit pupil with the glimmer in its foot.
function lens(b) {
  const [cx, cy, R] = LENS;
  circle(b, cx, cy, R);
  b.fillStyle = rad(b, cx, cy, 0, R, [[0, '#f6feff'], [0.45, '#cdf3f8'], [0.82, '#8adcea'], [1, '#4ab4c8']], cx - 5, cy - 6);
  b.fill();
  const r = rng(77);
  for (let i = 0; i < 26; i++) { // soft fibres
    const a = (i / 26) * TAU;
    path(b, [[cx + Math.cos(a) * (6 + r() * 3), cy + Math.sin(a) * (6 + r() * 3)], [cx + Math.cos(a) * (R - 1 - r() * 3), cy + Math.sin(a) * (R - 1 - r() * 3)]], true);
    line(b, rgba(i % 2 ? '#2a98b2' : '#ffffff', 0.22), 0.9);
  }
  circle(b, cx, cy, R);
  line(b, rgba('#14607a', 0.7), 1.7);
  b.save();
  circle(b, cx, cy, R - 1);
  b.clip();
  ellipse(b, cx, cy + 12, 18, 8);
  b.fillStyle = rgba('#7affe0', 0.28);
  b.fill();
  b.restore();
  ellipse(b, cx, cy, SLIT[0], SLIT[1]);
  b.fillStyle = lin(b, 0, cy - SLIT[1], 0, cy + SLIT[1], [[0, '#000306'], [0.7, '#02060c'], [1, '#0b3a46']]);
  b.fill();
  line(b, rgba('#0b3a46', 0.7), 1);
  ellipse(b, cx, cy + 8, 1.5, 3.8);
  b.fillStyle = rgba('#7affd8', 0.7);
  b.fill();
}

// The lid: a heavy fold of flesh hanging over the top of the globe, thick in the middle, lit along its brow, creased,
// with three ragged spines of skin at its outer end (the left, as the eye is painted); it throws a shadow on the globe.
function lid(b) {
  b.save();
  circle(b, 0, 0, BALL - 0.5);
  b.clip();
  b.fillStyle = lin(b, 0, -BALL, 0, -6, [[0, rgba('#020a14', 0.65)], [1, rgba('#020a14', 0)]]);
  b.fillRect(-BALL, -BALL, BALL * 2, BALL);
  b.restore();
  const [a0, a1] = [Math.PI * 1.04, Math.PI * 1.97];
  const outer = [];
  const inner = [];
  for (let i = 0; i <= 18; i++) {
    const a = a0 + ((a1 - a0) * i) / 18;
    const w = Math.sin((Math.PI * i) / 18) ** 0.7;
    outer.push([Math.cos(a) * (50 + 2.4 * Math.sin(i * 1.7)), Math.sin(a) * (50 + 2.4 * Math.sin(i * 1.7))]);
    inner.push([Math.cos(a) * (50 - 19 * w), Math.sin(a) * (50 - 19 * w)]);
  }
  path(b, [...outer, ...inner.reverse()]);
  b.fillStyle = lin(b, 0, -50, 0, -26, [[0, '#4a7c9c'], [0.45, '#1f4666'], [1, '#0a2034']]);
  b.fill();
  line(b, INK, 2.2);
  path(b, outer.slice(1, -1), true);
  line(b, rgba('#8cc8e4', 0.3), 1.2);
  for (const [r0, s0, s1] of [[44, 1.2, 1.5], [40, 1.3, 1.7], [36.5, 1.5, 1.8]]) { // creases across the lid
    b.beginPath();
    b.arc(0, 2, r0, Math.PI * s0, Math.PI * s1);
    line(b, rgba('#000812', 0.45), 1.6);
    b.beginPath();
    b.arc(0, 3.4, r0, Math.PI * s0, Math.PI * s1);
    line(b, rgba('#a8dcf0', 0.14), 1);
  }
  for (let k = 0; k < 6; k++) { // lumps along the lid
    const a = Math.PI * (1.14 + 0.1 * k);
    swelling(b, Math.cos(a) * 43, Math.sin(a) * 43, 4 + 2.4 * Math.sin((Math.PI * k) / 5), 0.9);
  }
  for (const [a, len] of [[1.1, 13], [1.16, 9], [1.22, 6]]) { // ragged spines of skin at the outer end
    const [x, y] = [Math.cos(Math.PI * a) * 47, Math.sin(Math.PI * a) * 47];
    const [ox, oy] = [Math.cos(Math.PI * (a - 0.07)), Math.sin(Math.PI * (a - 0.07))];
    path(b, [[x - oy * 3.2, y + ox * 3.2], [x + ox * len - 3, y + oy * len - 2], [x + oy * 3.2, y - ox * 3.2]]);
    b.fillStyle = '#4a7898';
    b.fill();
    line(b, INK, 1.2);
  }
}

function shine(b) {
  gloss(b, -12, -14, 10, 6, 0.9, -0.6);
  circle(b, 9, -18, 2.4);
  b.fillStyle = rgba('#ffffff', 0.92);
  b.fill();
  b.beginPath();
  b.arc(0, 0, BALL - 2.5, 0.35, 1.2);
  line(b, rgba('#cfffff', 0.4), 1.6);
}

export function eye(b, l) {
  socket(b);
  globe(b);
  lens(b);
  lid(b);
  shine(b);
  const [cx, cy, R] = LENS;
  bloom(l, 0, 0, 60, PALE, 0.26);
  circle(l, cx, cy, R - 1);
  line(l, rgba(PALE, 0.34), 3);
  circle(l, cx, cy, 11);
  line(l, rgba('#e8ffff', 0.2), 1.4);
  lamp(l, cx, cy + 8, 2.2, TEAL, 3.4);
  l.beginPath();
  l.arc(0, 0, BALL - 1, 0, TAU);
  line(l, rgba('#7ac8e8', 0.2), 3);
}
