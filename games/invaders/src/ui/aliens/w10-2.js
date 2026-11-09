// World 10, Hollow Night, more of the guests (see w10.js): the jack-o'-lantern with its carved face and
// the iron-banded coffin, its seams leaking witch-fire.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK } from './kit.js';

export const FIRE = '#ffb02e'; // ember and flame
const GREEN = '#7dff5a'; // witch-fire

// A jack-o'-lantern: ribbed lobes, a curled stem and leaf, a face carved through to the candle. On
// frame 1 the jaw drops and it spits: embers fall from the mouth toward the ship.
export function gunner(b, l, f, c) {
  const open = f ? 1.35 : 1;
  const lobes = [[-17, 8.4], [17, 8.4], [-9, 11.6], [9, 11.6], [0, 14]];
  for (const [x, rx] of lobes) {
    ellipse(b, x, 4, rx, 21);
    ink(b, rad(b, x - rx * 0.3, -8, 1, 26, [[0, shade(c, 0.45)], [0.45, c], [1, shade(c, -0.6)]]), 2.6);
  }
  for (const x of [-13, -4.5, 4.5, 13]) { // the grooves between the ribs
    b.beginPath();
    b.moveTo(x, -14);
    b.quadraticCurveTo(x + (x < 0 ? -2 : 2), 4, x, 24);
    line(b, rgba('#4a1a02', 0.4), 1.8);
  }
  path(b, [[-3.4, -14], [-2, -24], [3, -24], [4.6, -14]]); // the stem, with a curl and a leaf
  ink(b, lin(b, -4, 0, 5, 0, [[0, '#7a8a38'], [1, '#2e3a12']]), 2);
  b.beginPath();
  b.moveTo(3, -22);
  b.bezierCurveTo(12, -26, 14, -17, 9, -16);
  line(b, INK, 3.4);
  line(b, '#7a9a38', 1.6);
  path(b, [[-3, -18], [-12, -24], [-17, -17], [-8, -15]]);
  ink(b, '#5a7a28', 1.6);
  gloss(b, -12, -8, 6, 11, 0.4, 0.3);
  const face = (g, k) => { // the carved face; k stretches the mouth
    const poly = (pts, mouth = false) => {
      path(g, mouth ? pts.map(([x, y]) => [x, 8 + (y - 8) * k]) : pts);
      g.fill();
    };
    for (const s of [-1, 1]) poly([[s * 17, -9], [s * 4, -3], [s * 12, 3]]);
    poly([[0, -1], [-3.6, 6], [3.6, 6]]);
    poly([[-18, 9], [-9, 7], [0, 10], [9, 7], [18, 9], [14, 18], [8, 15], [3, 21], [0, 16], [-3, 21], [-8, 15], [-14, 18]], true);
  };
  b.save(); // the far wall of the cut catches the candle along its lower lip, then the hole itself
  b.fillStyle = '#ffb060';
  b.translate(0, 1.5);
  face(b, open);
  b.restore();
  b.fillStyle = '#2a0e02';
  face(b, open);
  bloom(l, 0, 3, 34, '#ff7a14', 0.4);
  l.fillStyle = '#ffd24a';
  face(l, open);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba('#fff4b0', 0.55);
  l.translate(0, 0.4);
  l.scale(0.82, 0.82);
  face(l, open);
  l.restore();
  bloom(l, 0, 6, 12, '#ffffff', 0.35);
  for (const [x, y, r] of f ? [[-5, 27, 1.6], [3, 31, 2], [-1, 36, 1.4], [7, 38, 1.2], [-8, 40, 1]] : [[-3, 25, 1.2], [4, 28, 1.4]]) eye(l, x, y, r, FIRE, 3.4);
}

// The coffin's outline, head at the top: a hexagon, narrow at the head and the feet.
const OUTLINE = [[-11, -35], [11, -35], [23, -14], [15, 35], [-15, 35], [-23, -14]];
const half = (y) => (y < -14 ? 11 + ((y + 35) / 21) * 12 : 23 - ((y + 14) / 49) * 8); // half its width at y

// An iron-banded coffin standing on end, rattling between frames. Its seams leak green light, more so
// on the beat it rocks left; the damage (cracks.js) splits the lid in the same green.
export function armored(b, l, f, c) {
  for (const g of [b, l]) g.rotate(f ? 0.05 : -0.05);
  b.save(); // the box under the lid, a little wider
  b.scale(1.1, 1.03);
  path(b, OUTLINE);
  ink(b, shade(c, -0.7), 3);
  b.restore();
  path(b, OUTLINE);
  ink(b, lin(b, -23, 0, 23, 0, [[0, shade(c, -0.5)], [0.35, c], [0.55, shade(c, 0.14)], [1, shade(c, -0.6)]]), 3);
  b.save();
  b.clip();
  for (const x of [-16, -8, 0, 8, 16]) { // planks: grain and a seam between each
    b.beginPath();
    b.moveTo(x, -36);
    b.quadraticCurveTo(x + (x % 16 ? 1.8 : -1.8), 0, x, 36);
    line(b, rgba('#000000', 0.38), 1.3);
    b.beginPath();
    b.moveTo(x + 1.4, -36);
    b.quadraticCurveTo(x + 3.2, 0, x + 1.4, 36);
    line(b, rgba('#ffffff', 0.1), 1);
  }
  for (const [x, y, r] of [[-11, -22, 2.4], [10, 14, 2.8], [-6, 26, 2], [13, -6, 2]]) { // knots
    ellipse(b, x, y, r, r * 1.5);
    b.fillStyle = rgba('#000000', 0.45);
    b.fill();
  }
  b.save(); // the lid's raised panel, bevelled
  b.scale(0.74, 0.78);
  path(b, OUTLINE);
  line(b, rgba('#000000', 0.5), 2);
  b.translate(1.2, 1.4);
  path(b, OUTLINE);
  line(b, rgba('#ffffff', 0.16), 1.2);
  b.restore();
  for (const y of [-23, -3, 20]) { // three iron bands and the strap down the middle
    b.fillStyle = lin(b, 0, y - 3.4, 0, y + 3.4, [[0, '#6a6a7c'], [0.3, '#3a3a48'], [1, '#12121a']]);
    b.fillRect(-30, y - 3.4, 60, 6.8);
    b.fillStyle = rgba('#ffffff', 0.3);
    b.fillRect(-30, y - 3.4, 60, 1);
    b.fillStyle = rgba('#000000', 0.5);
    b.fillRect(-30, y + 3.4, 60, 1.4);
  }
  b.fillStyle = lin(b, -3, 0, 3, 0, [[0, '#14141c'], [0.4, '#5a5a6c'], [1, '#14141c']]);
  b.fillRect(-2.8, -36, 5.6, 72);
  b.restore();
  for (const y of [-23, -3, 20]) { // rivets along each band
    for (const x of [-1, 1].flatMap((s) => [s * (half(y) - 4.5), s * (half(y) / 2)])) {
      ellipse(b, x, y, 1.7, 1.7);
      b.fillStyle = '#9a9ab0';
      b.fill();
      ellipse(b, x - 0.4, y - 0.5, 0.7, 0.7);
      b.fillStyle = '#e8e8f4';
      b.fill();
    }
  }
  b.beginPath(); // a lock plate and its keyhole at the foot
  b.roundRect(-5.5, 27, 11, 8, 2);
  ink(b, '#4a4a5a', 1.8);
  ellipse(b, 0, 30, 1.6, 1.6);
  b.fillStyle = '#06020a';
  b.fill();
  both((s) => { // a ring handle each side
    ellipse(b, s * (half(-3) + 2), -3, 3.4, 5);
    line(b, INK, 4.4);
    line(b, '#7a7a90', 2);
  });
  gloss(b, -12, -16, 4.5, 11, 0.32, 0.2);
  l.save();
  l.scale(0.88, 0.9);
  path(l, OUTLINE);
  l.restore();
  l.save();
  l.globalCompositeOperation = 'lighter';
  line(l, rgba(GREEN, 0.2 + f * 0.16), 2.8);
  line(l, rgba('#d8ffd0', 0.3 + f * 0.2), 0.9);
  l.restore();
  for (const x of [-12, -4, 4, 12]) { // light between the planks
    l.beginPath();
    l.moveTo(x, -28);
    l.lineTo(x, 28);
    l.save();
    l.globalCompositeOperation = 'lighter';
    line(l, rgba(GREEN, 0.16 + f * 0.08), 1.2);
    l.restore();
  }
  eye(l, 0, 30, 1.7, GREEN, 3.4);
  bloom(l, 0, 0, 40, GREEN, 0.1 + f * 0.08);
}
