// The Crystal Wyrm's maw (World 11, Aurora Kingdom; see wyrm.js): the jaws hanging open under its head,
// a throat of deep blue lit white at its heart where the breath gathers, rows of icicle fangs above and
// below, a chin of ice plates. A weak point. The frost curling out of it is live (wyrm-fx.js).
import { path, ink, lin, rad, rgba, shade, eye, bloom, neon, both, ellipse } from './kit.js';
import { mix, hash } from '../sprites.js';
import { EYE } from './wyrm-head.js';

export function maw(b, l, p, S) {
  const { plate } = S.pal;
  const base = mix(plate, '#2a62b8', 0.42);
  both((s) => { // cheek plates either side, with a crystal on each
    path(b, [[s * 40, -30], [s * 58, -24], [s * 58, 16], [s * 46, 32], [s * 38, 10]]);
    ink(b, lin(b, 0, -30, 0, 32, [[0, shade(base, 0.3)], [1, shade(base, -0.4)]]), 2.4);
    path(b, [[s * 52, -8], [s * 76, 2], [s * 55, 14]]);
    ink(b, shade(base, 0.3), 1.8);
  });
  path(b, [[-46, 20], [-34, 40], [34, 40], [46, 20], [0, 30]]); // the chin
  ink(b, lin(b, 0, 20, 0, 40, [[0, shade(base, 0.2)], [1, shade(base, -0.5)]]), 2.6);
  for (let x = -24; x <= 24; x += 12) {
    path(b, [[x, 34], [x + 5, 34], [x + 1, 52 - Math.abs(x) * 0.25]]);
    ink(b, '#d8f2ff', 1.2);
  }
  ellipse(b, 0, 2, 45, 28); // the opening
  ink(b, rad(b, 0, 4, 2, 46, [[0, '#9fe4ff'], [0.35, '#2a78c8'], [0.75, '#0e2a50'], [1, '#04101e']]), 3.4);
  b.save();
  b.clip();
  b.lineCap = 'round';
  for (let i = 0; i < 5; i++) { // frost swirling in the throat
    b.beginPath();
    b.ellipse(0, 4, 8 + i * 8, 4 + i * 4.4, i * 0.4, hash(i) * 3, hash(i) * 3 + 2.4);
    b.strokeStyle = rgba('#ffffff', 0.32 - i * 0.04);
    b.lineWidth = 1.6;
    b.stroke();
  }
  b.restore();
  for (let x = -38; x <= 38; x += 10) { // upper fangs, longest at the corners
    const len = 9 + Math.abs(x) * 0.28 + hash(x) * 5;
    path(b, [[x - 4, -23 + Math.abs(x) * 0.1], [x + 4, -23 + Math.abs(x) * 0.1], [x + 0.6, -23 + len + Math.abs(x) * 0.1]]);
    ink(b, '#f0fbff', 1.3);
  }
  for (let x = -34; x <= 34; x += 12) { // lower ones, shorter, pointing up
    const len = 8 + hash(x + 9) * 6;
    path(b, [[x - 3.4, 27 - Math.abs(x) * 0.12], [x + 3.4, 27 - Math.abs(x) * 0.12], [x, 27 - len - Math.abs(x) * 0.12]]);
    ink(b, '#e0f4ff', 1.2);
  }
  ellipse(l, 0, 4, 34, 18); // the throat's light
  l.fillStyle = rad(l, 0, 4, 0, 34, [[0, rgba('#ffffff', 0.85)], [0.45, rgba(S.pal.weak, 0.5)], [1, rgba(S.pal.weak, 0)]]);
  l.fill();
  ellipse(l, 0, 2, 45, 28);
  neon(l, '#5ad0ff', 1, 0.4);
  for (let x = -38; x <= 38; x += 20) eye(l, x, -14 + Math.abs(x) * 0.1, 1.3, EYE, 3);
  bloom(l, 0, 4, 80, S.pal.weak, 0.35);
}
