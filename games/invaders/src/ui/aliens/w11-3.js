// World 11, Aurora Kingdom, the last of the guard (see w11.js): the narwhal that carries the power-ups,
// swimming head down at the ship, its tusk a lamp.
import { path, ink, lin, rgba, shade, eye, bloom, gloss, line, ellipse, both } from './kit.js';
import { hash } from '../sprites.js';

const SKIN = '#c4d4e8';

// The narwhal's body, tapering to the root of the tusk.
function body(g) {
  g.beginPath();
  g.moveTo(-3.5, -25);
  g.bezierCurveTo(-6, -10, -18, -4, -17, 8);
  g.bezierCurveTo(-16, 18, -10, 24, 0, 25);
  g.bezierCurveTo(10, 24, 16, 18, 17, 8);
  g.bezierCurveTo(18, -4, 6, -10, 3.5, -25);
  g.closePath();
}

// A narwhal: a mottled grey-blue hide with patches of aurora light glowing in its spots, flukes
// beating at the top, two flippers, a small smiling face, and a tusk of spiralling ivory whose light
// runs from its root to a burning tip. Its c (the palette's colour) is the light's.
export function carrier(b, l, f, c) {
  const beat = f ? 0.3 : -0.3;
  for (const g of [b, l]) { // everything but the tusk is a little broader than it is long
    g.save();
    g.scale(1.22, 1);
  }
  b.save(); // the flukes: a broad crescent either side of the tail stock, tilting with the beat
  b.translate(0, -23);
  both((s) => {
    path(b, [[0, 3], [s * 6, -1], [s * 13, -3 + beat * s * 3], [s * 21, -1 + beat * s * 5], [s * 17, 2 + beat * s * 2], [s * 10, 4], [s * 3, 9]]);
    ink(b, lin(b, 0, -4, 0, 9, [[0, shade(SKIN, 0.05)], [1, shade(SKIN, -0.4)]]), 2.2);
    path(b, [[s * 2, 3], [s * 11, -1 + beat * s * 2], [s * 19, 0 + beat * s * 4]], true);
    line(b, rgba('#ffffff', 0.55), 1.1);
  });
  b.restore();
  both((s) => { // flippers
    b.save();
    b.translate(s * 15, 4);
    b.rotate(s * (0.5 + beat * 0.7));
    ellipse(b, 0, 7, 4.4, 10);
    ink(b, shade(SKIN, -0.38), 2.2);
    b.restore();
  });
  body(b);
  ink(b, lin(b, -17, 0, 17, 0, [[0, '#f4f8ff'], [0.35, SKIN], [0.8, shade(SKIN, -0.4)], [1, shade(SKIN, -0.65)]]), 3);
  b.save();
  b.clip();
  l.save();
  body(l); // the lit spots keep inside the body too
  l.clip();
  for (let i = 0; i < 20; i++) { // the mottling, and in some spots the aurora's light
    const x = (hash(i * 3) - 0.5) * 32;
    const y = -20 + hash(i * 3 + 1) * 42;
    const r = 1.4 + hash(i * 3 + 2) * 3.2;
    ellipse(b, x, y, r * 1.2, r);
    b.fillStyle = rgba('#4a5a7c', 0.45);
    b.fill();
    if (i % 3 === 0) {
      ellipse(l, x, y, r * 0.9, r * 0.75);
      l.fillStyle = rgba(c, 0.55 + 0.25 * ((i + f) % 2));
      l.fill();
      bloom(l, x, y, r * 4, c, 0.14);
    }
  }
  l.restore();
  b.fillStyle = lin(b, 0, -26, 0, 26, [[0, rgba('#06304a', 0.45)], [0.35, rgba('#06304a', 0)], [1, rgba('#ffffff', 0.15)]]);
  b.fillRect(-20, -28, 40, 56);
  b.restore();
  both((s) => { // eyes, a pale ring round each
    ellipse(b, s * 9.4, 13, 2.6, 2.8);
    ink(b, '#0a1424', 1.2);
    eye(l, s * 9.6, 12.4, 0.9, '#ffffff', 2.6);
  });
  b.beginPath(); // a smile
  b.moveTo(-6, 21);
  b.quadraticCurveTo(0, 24.4, 6, 21);
  line(b, rgba('#1a2a44', 0.7), 1.3);
  gloss(b, -8, -4, 3.4, 11, 0.5, 0.15);
  for (const g of [b, l]) g.restore();
  const tusk = [[-3.4, 24], [3.4, 24], [0.9, 47], [-0.9, 47]]; // the tusk, root to tip
  path(b, tusk);
  ink(b, lin(b, -3, 0, 3, 0, [[0, '#fffaf0'], [0.5, '#e8dcc0'], [1, '#a89878']]), 2.2);
  const ridge = (g, color, a, w, shift) => {
    for (let i = 0; i < 6; i++) {
      const y = 26.4 + i * 3.6 + shift;
      const half = 3.4 - ((y - 24) / 23) * 2.5;
      path(g, [[-half, y + 1.6], [half, y - 1.6]], true);
      line(g, rgba(color, a), w);
    }
  };
  ridge(b, '#8a7a58', 0.7, 1, 0);
  path(l, tusk); // the light: faint at the root, burning at the tip
  l.fillStyle = lin(l, 0, 24, 0, 47, [[0, rgba(c, 0.1)], [0.5, rgba(c, 0.5)], [1, rgba('#ffffff', 0.95)]]);
  l.fill();
  ridge(l, c, 0.8, 1.1, f * 1.8);
  eye(l, 0, 45, 2.2, '#ffffff', 1.4); // the glows stop at the sprite's bottom edge (y 48), never cut flat by it
  bloom(l, 0, 34, 14, c, 0.4 + f * 0.1);
  bloom(l, 0, 2, 36, c, 0.13);
  b.beginPath();
  b.moveTo(-2.6, 24);
  b.lineTo(-0.5, 46);
  line(b, rgba('#ffffff', 0.55), 1);
}
