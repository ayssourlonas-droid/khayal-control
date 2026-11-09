// The Crystal Wyrm's crest and gems (World 11, Aurora Kingdom; see wyrm.js): a fan of crystal spikes
// along the top of its head, and a great gem in each coil held in a collar of ice claws. The gems are
// the weak points: they burn with frost, and flare brighter as the fight goes on (wyrm-fx.js).
import { path, ink, line, lin, rad, rgba, shade, eye, bloom, neon, TAU } from './kit.js';
import { mix } from '../sprites.js';
import { EYE } from './wyrm-head.js';

export const SPIKES = Array.from({ length: 9 }, (_, i) => {
  const d = i - 4;
  return { x: d * 25, h: 56 - Math.abs(d) * 8, w: 20 - Math.abs(d), lean: d * 0.14 }; // x, height, width, lean in radians
});
export const BASE_Y = 10; // the crest's spikes stand on this line, in its own frame

// One spike: a prism with a pointed top, a lit face and a shaded one, a ridge down the middle.
function spike(b, { x, h, w, lean }, base, y0 = BASE_Y) {
  const tip = [x + Math.sin(lean) * h, y0 - Math.cos(lean) * h];
  const neck = [x + Math.sin(lean) * h * 0.72, y0 - Math.cos(lean) * h * 0.72];
  const [l, r] = [[x - w / 2, y0], [x + w / 2, y0]];
  const [nl, nr] = [[neck[0] - w * 0.46, neck[1]], [neck[0] + w * 0.46, neck[1]]];
  path(b, [l, nl, tip, nr, r]);
  ink(b, shade(base, -0.1), 2.4);
  path(b, [l, nl, tip, neck, [x, y0]]);
  b.fillStyle = lin(b, 0, tip[1], 0, y0, [[0, rgba('#ffffff', 0.7)], [1, rgba('#9fd8f0', 0.2)]]);
  b.fill();
  path(b, [[x, y0], neck, tip, nr, r]);
  b.fillStyle = rgba('#02101e', 0.3);
  b.fill();
  path(b, [tip, neck, [x, y0]], true);
  line(b, rgba('#ffffff', 0.55), 1.1);
}

export function crest(b, l, p, S) {
  const base = mix(S.pal.plate, '#2a62b8', 0.3);
  b.beginPath(); // the bar the spikes grow from, a band of ice scutes
  b.moveTo(-118, BASE_Y + 12);
  b.quadraticCurveTo(0, BASE_Y - 8, 118, BASE_Y + 12);
  b.lineTo(100, BASE_Y + 20);
  b.quadraticCurveTo(0, BASE_Y + 4, -100, BASE_Y + 20);
  b.closePath();
  ink(b, lin(b, 0, BASE_Y - 8, 0, BASE_Y + 20, [[0, shade(base, 0.3)], [1, shade(base, -0.5)]]), 2.6);
  for (const s of SPIKES) spike(b, { ...s, x: s.x * 0.96, h: s.h * 0.55, w: s.w * 0.6, lean: s.lean * 1.5 }, shade(base, -0.2), BASE_Y + 6); // the small ones behind
  for (const s of SPIKES) spike(b, s, base);
  for (const s of SPIKES) {
    const tx = s.x + Math.sin(s.lean) * s.h;
    const ty = BASE_Y - Math.cos(s.lean) * s.h;
    eye(l, tx, ty + 3, 1.3, EYE, 3.2);
    path(l, [[s.x, BASE_Y], [tx, ty]], true);
    neon(l, '#5ad0ff', 0.6, 0.35);
  }
  bloom(l, 0, 0, 120, '#5ad0ff', 0.12);
}

// A gem: a hexagonal crystal, point up, in a collar of six ice claws, its heart burning.
export function gem(b, l, p, S) {
  const { weak } = S.pal;
  for (let i = 0; i < 6; i++) { // the claws
    const a = (i / 6) * TAU + 0.26;
    const [c, sn] = [Math.cos(a), Math.sin(a)];
    path(b, [[c * 22 - sn * 5, sn * 22 + c * 5], [c * 36 - sn * 3, sn * 36 + c * 3], [c * 40 + sn * 4 - c * 8, sn * 40 - c * 4 - sn * 8], [c * 22 + sn * 5, sn * 22 - c * 5]]);
    ink(b, lin(b, 0, -36, 0, 36, [[0, '#d8f2ff'], [1, '#3a78b4']]), 2);
  }
  const hex = (r) => Array.from({ length: 6 }, (_, i) => [Math.sin((i / 6) * TAU) * r, -Math.cos((i / 6) * TAU) * r]);
  const [outer, inner] = [hex(27), hex(13)];
  path(b, outer);
  ink(b, '#0e3a6c', 3);
  outer.forEach((o, i) => { // six facets, outer ring to inner, lit from the upper left
    const [a, c] = [inner[i], inner[(i + 1) % 6]];
    const q = outer[(i + 1) % 6];
    path(b, [o, q, c, a]);
    b.fillStyle = shade(weak, [0.3, 0.05, -0.2, -0.4, -0.15, 0.2][i] - 0.1);
    b.fill();
    line(b, rgba('#02101e', 0.5), 1);
  });
  path(b, inner);
  b.fillStyle = rad(b, -3, -3, 0, 14, [[0, '#ffffff'], [0.6, shade(weak, 0.1)], [1, '#5ad0ff']]);
  b.fill();
  line(b, rgba('#ffffff', 0.7), 1.2);
  path(l, inner);
  l.fillStyle = rad(l, 0, 0, 0, 14, [[0, rgba('#ffffff', 0.9)], [0.6, rgba(weak, 0.55)], [1, rgba(weak, 0.2)]]);
  l.fill();
  path(l, outer);
  neon(l, weak, 1.2, 0.5);
  eye(l, 0, 0, 5, '#ffffff', 5);
  bloom(l, 0, 0, 52, '#5ad0ff', 0.4);
}
