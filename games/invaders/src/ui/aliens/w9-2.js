// World 9, Tidal Siege, the other half of the brood (see w9.js): the turtle-crab and the jellyfish,
// and what the sea painters share, the beast's own cyan, jointed limbs and lit hide.
import { path, ink, lin, rad, rgba, shade, eye, bloom, gloss, line, ellipse, both, INK, TAU } from './kit.js';

export const MARK = '#4ff3ff'; // the beast's own cyan: eyes, lures and seams

// A jointed limb through pts: an INK outline, then the colour.
export function limb(b, pts, c, w) {
  path(b, pts, true);
  line(b, INK, w + 3);
  path(b, pts, true);
  line(b, c, w);
}

// A shell or hide lit from above: light crown, the colour, a deep underside.
export const hide = (g, c, y0, y1) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.4)], [0.45, c], [1, shade(c, -0.6)]]);

// A turtle-crab: a domed shell of barnacled plates with the cyan showing in its seams, two small
// pincers in front, a head under the shell's rim, flippers paddling at the sides.
export function armored(b, l, f, c) {
  const dark = shade(c, -0.55);
  both((s) => {
    const row = f ? 3 : -3;
    path(b, [[s * 18, -2], [s * 36, -8 + row], [s * 30, 6 + row], [s * 18, 8]]);
    ink(b, dark, 2.4);
    limb(b, [[s * 14, 16], [s * 23, 26], [s * 20, 33 - f * 3]], dark, 4);
    path(b, [[s * 17, 32 - f * 3], [s * 27, 36 - f * 3 + (f ? 2 : 0)], [s * 22, 27 - f * 3]]);
    ink(b, shade(c, 0.05), 2);
  });
  ellipse(b, 0, 24, 8, 6.5);
  ink(b, dark, 2.4);
  both((s) => {
    ellipse(b, s * 3.5, 26, 2, 2);
    b.fillStyle = '#06121a';
    b.fill();
    eye(l, s * 3.5, 26, 1.1, MARK, 2.6);
  });
  ellipse(b, 0, -1, 25, 23);
  ink(b, rad(b, -6, -10, 0, 34, [[0, shade(c, 0.5)], [0.5, c], [1, shade(c, -0.7)]]), 3.4);
  const hex = [0, 1, 2, 3, 4, 5].map((i) => [Math.cos((i / 6) * TAU) * 10, Math.sin((i / 6) * TAU) * 9 - 2]);
  for (let i = 0; i < 6; i++) { // plates: a hexagon in the crown and seams out to the rim
    const a = (i / 6) * TAU;
    path(b, [hex[i], [Math.cos(a) * 24, Math.sin(a) * 22 - 1]], true);
    line(b, rgba('#000000', 0.5), 1.6);
    path(l, [hex[i], [Math.cos(a) * 24, Math.sin(a) * 22 - 1]], true);
    l.save();
    l.globalCompositeOperation = 'lighter';
    line(l, rgba(MARK, 0.35 + f * 0.15), 1);
    l.restore();
  }
  path(b, hex);
  line(b, rgba('#000000', 0.55), 1.8);
  for (const [x, y, r] of [[-15, 4, 2.6], [-11, 10, 2], [16, -6, 2.4], [12, 12, 2.8], [-4, 15, 1.8], [5, -17, 2.2], [-17, -9, 2]]) { // barnacles
    ellipse(b, x, y, r, r * 0.8);
    ink(b, '#d8d4c0', 1.2);
  }
  gloss(b, -10, -14, 7, 2.6, 0.5, -0.5);
  bloom(l, 0, -2, 22, MARK, 0.14);
}

// A jellyfish: a violet bell that opens and closes as it swims, lit from inside, a ring of
// tentacles streaming below it with a bright bead at the end of each.
export function carrier(b, l, f, c) {
  const open = f ? 1 : 0; // frame 1: bell wide and flat, frame 0: bell drawn in tall
  const rx = 22 + open * 5;
  const ry = 21 - open * 4;
  for (let i = 0; i < 5; i++) { // tentacles, drawn first so the bell covers their roots
    const x = -16 + i * 8;
    const sway = (i % 2 ? 1 : -1) * (f ? 5 : 2);
    b.beginPath();
    b.moveTo(x, 4);
    b.bezierCurveTo(x + sway, 16, x - sway, 26, x + sway * 0.6, 34 + (i % 2) * 5);
    line(b, INK, 4.4);
    b.beginPath();
    b.moveTo(x, 4);
    b.bezierCurveTo(x + sway, 16, x - sway, 26, x + sway * 0.6, 34 + (i % 2) * 5);
    line(b, shade(c, -0.15), 2);
    eye(l, x + sway * 0.6, 34 + (i % 2) * 5, 1.3, c, 3);
  }
  b.beginPath(); // the bell: a dome with a scalloped lip
  b.moveTo(-rx, 6);
  b.bezierCurveTo(-rx, -ry * 1.5, rx, -ry * 1.5, rx, 6);
  for (let i = 3; i >= -3; i--) b.quadraticCurveTo(i * (rx / 3.5) + rx / 7, 11 - (i % 2) * 1.5, (i - 1) * (rx / 3.5) + rx / 7, 6);
  b.closePath();
  ink(b, lin(b, 0, -ry, 0, 10, [[0, shade(c, 0.1)], [0.6, shade(c, -0.45)], [1, shade(c, -0.7)]]), 3);
  b.beginPath(); // the inner glow, an organ in the bell
  b.ellipse(0, -2, rx * 0.5, ry * 0.45, 0, 0, TAU);
  b.fillStyle = rgba(shade(c, 0.5), 0.35);
  b.fill();
  gloss(b, -8, -ry * 0.55, 9, 3.2, 0.55, -0.4);
  for (const k of [-0.5, 0, 0.5]) { // ribs of the bell
    b.beginPath();
    b.moveTo(0, -ry * 0.9);
    b.quadraticCurveTo(k * rx * 1.6, -ry * 0.4, k * rx * 1.9, 5);
    line(b, rgba('#000000', 0.3), 1.2);
  }
  bloom(l, 0, -3, 34, c, 0.55 + open * 0.15);
  eye(l, 0, -2, 4 + open, shade(c, 0.5), 3);
  l.beginPath();
  l.ellipse(0, -2, rx * 0.6, ry * 0.55, 0, Math.PI * 1.1, Math.PI * 1.9);
  l.save();
  l.globalCompositeOperation = 'lighter';
  line(l, rgba(MARK, 0.55), 1.4);
  l.restore();
}
