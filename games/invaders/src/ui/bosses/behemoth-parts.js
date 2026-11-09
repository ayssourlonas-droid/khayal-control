// The Abyssal behemoth's parts (World 9, Tidal Siege; the hull and the rest are in behemoth.js):
// a crest of barnacled spines, an armoured skull with amber eyes, an open maw lit cyan from the
// gullet, two frilled gills with glowing slits, two raised claws. gill and claw are drawn as the
// left ones and mirrored for the right. Colours come from the look's boss palette (S.pal).
import { path, sym, both, ink, lin, rad, line, eye, bloom, gloss, neon, rgba, shade, ellipse, TAU } from './kit.js';
import { hash } from '../sprites.js';

export const EYE = '#ff9a3a'; // the beast's eyes at rest; behemoth.js reddens them as the fight goes on

// Wet hide lit from above.
export const hide = (g, c, y0, y1) => lin(g, 0, y0, 0, y1, [[0, shade(c, 0.45)], [0.4, c], [1, shade(c, -0.6)]]);

// Barnacles: small pale cones in clusters round each [x, y, spread] centre, placed by hash.
export function barnacles(b, spots, seed = 1) {
  spots.forEach(([cx, cy, spread], k) => {
    for (let i = 0; i < 4; i++) {
      const x = cx + (hash(seed * 97 + k * 13 + i) - 0.5) * spread;
      const y = cy + (hash(seed * 89 + k * 17 + i) - 0.5) * spread * 0.7;
      const r = 2.2 + hash(seed * 83 + k * 7 + i) * 2.4;
      ellipse(b, x, y, r, r * 0.8);
      ink(b, '#c8ccc0', 1.2);
      ellipse(b, x, y - r * 0.15, r * 0.4, r * 0.3);
      b.fillStyle = '#10181c';
      b.fill();
    }
  });
}

// A row of spines rising from a ridged band: the crest, a fan, tallest in the middle.
function crest(b, l, p, S) {
  const { plate } = S.pal;
  for (let i = -3; i <= 3; i++) {
    const x = i * 34;
    const len = 56 - Math.abs(i) * 8;
    const tip = [x + i * 5, 8 - len];
    path(b, [[x - 15, 12], tip, [x + 15, 12]]);
    ink(b, lin(b, x - 15, 0, x + 15, 0, [[0, shade(plate, 0.2)], [0.5, plate], [1, shade(plate, -0.6)]]), 2.8);
    path(b, [[x, 12], tip], true);
    line(b, rgba('#000000', 0.4), 1.4);
    eye(l, tip[0], tip[1] + 3, 1.8, S.pal.weak, 3);
  }
  b.beginPath();
  b.roundRect(-112, 6, 224, 22, 8);
  ink(b, hide(b, plate, 6, 28), 3);
  barnacles(b, [[-80, 17, 40], [-20, 18, 30], [40, 17, 40], [90, 18, 30]], 2);
  gloss(b, -40, 10, 60, 3, 0.4);
}

// The head, seen front on: a domed skull under a heavy brow, two deep sockets with amber eyes,
// flared nostrils, barnacles crusted on the cheeks.
function skull(b, l, p, S) {
  const { hull, plate } = S.pal;
  path(b, sym([[0, -54], [58, -50], [90, -28], [98, 8], [84, 36], [48, 54], [0, 56]]));
  ink(b, hide(b, shade(hull, 0.12), -54, 56), 3.5);
  path(b, sym([[0, -52], [56, -48], [88, -27], [86, -12], [44, -22], [0, -16]])); // the brow plate
  ink(b, lin(b, 0, -52, 0, -12, [[0, shade(plate, 0.2)], [1, shade(plate, -0.5)]]), 2.8);
  both((s) => {
    path(b, [[s * 12, -2], [s * 62, -14], [s * 68, 4], [s * 28, 14]]);
    ink(b, '#04080b', 2.4);
    eye(l, s * 40, -1, 6.2, EYE, 3.6);
    eye(l, s * 40, -1, 2.2, '#ffffff', 1.6);
    path(b, [[s * 7, 26], [s * 14, 20], [s * 16, 28]]);
    ink(b, '#04080b', 1.4);
    path(b, [[s * 46, -40], [s * 52, -26], [s * 50, -12]], true); // scars
    line(b, rgba('#000000', 0.4), 1.6);
  });
  path(b, [[0, -48], [0, -16]], true);
  line(b, rgba('#000000', 0.4), 2);
  barnacles(b, [[-70, 26, 24], [70, 26, 24], [-30, -38, 30], [34, -40, 24]], 3);
  gloss(b, -30, -34, 28, 6, 0.5, -0.25);
}

// A mouth thrown open at the ship: a thick lip, a gullet that burns cyan, teeth in two rows.
function maw(b, l, p, S) {
  const { hull, weak } = S.pal;
  ellipse(b, 0, 0, 58, 33);
  ink(b, hide(b, shade(hull, 0.15), -33, 33), 3.5);
  ellipse(b, 0, 2, 46, 24);
  ink(b, rad(b, 0, 4, 0, 48, [[0, shade(weak, 0.2)], [0.5, shade(weak, -0.45)], [1, '#03181c']]), 2.5);
  for (let i = -5; i <= 5; i++) {
    const x = i * 8.4;
    const e = Math.sqrt(Math.max(0, 1 - (x / 46) ** 2)) * 24;
    const big = Math.abs(i) === 3 ? 4 : 0;
    for (const d of [-1, 1]) { // upper row hangs down, lower row stands up
      path(b, [[x - 3.4, 2 + d * -e], [x, 2 + d * -e + d * (8 + big - Math.abs(i) * 0.5)], [x + 3.4, 2 + d * -e]]);
      ink(b, '#e6efea', 1.3);
    }
  }
  bloom(l, 0, 4, 54, weak, 0.3);
  l.beginPath();
  l.ellipse(0, 2, 40, 18, 0, 0, TAU);
  neon(l, weak, 1.4, 0.45);
  gloss(b, -26, -22, 22, 3.4, 0.45, -0.1);
}

// A gill (the left one): a plate of hide, a frill of fin spines streaming out to the side, four
// slanted slits with the cyan burning in them.
function gill(b, l, p, S) {
  const { hull, plate, weak } = S.pal;
  for (let i = 0; i < 5; i++) {
    const y = -34 + i * 17;
    path(b, [[-20, y - 7], [-52 - (i % 2) * 8, y - 12 + i * 2], [-22, y + 7]]);
    ink(b, lin(b, -52, 0, -20, 0, [[0, shade(plate, -0.4)], [1, plate]]), 2);
  }
  ellipse(b, 2, 0, 34, 42);
  ink(b, hide(b, shade(hull, 0.18), -42, 42), 3.4);
  for (let i = 0; i < 4; i++) {
    const y = -24 + i * 16;
    path(b, [[-20, y + 6], [24, y - 6], [24, y - 1], [-20, y + 11]]);
    ink(b, '#03181c', 1.8);
    path(l, [[-17, y + 8], [21, y - 3]], true);
    neon(l, weak, 2.4, 0.9);
  }
  barnacles(b, [[20, -30, 10], [14, 32, 12]], 5);
  bloom(l, 0, 0, 44, weak, 0.35);
  gloss(b, -4, -28, 14, 3, 0.4, -0.3);
}

// A raised claw (the left one): an arm climbing out of the water in barnacled segments, a heavy
// pincer on top, the big jaw outside and the small one in.
function claw(b, l, p, S) {
  const { hull, plate, weak } = S.pal;
  for (const [x, y, rx, ry] of [[2, 62, 27, 24], [-1, 36, 23, 20], [-2, 10, 24, 20]]) { // joints, low to high
    ellipse(b, x, y, rx, ry);
    ink(b, hide(b, shade(hull, 0.1), y - ry, y + ry), 3);
    path(b, [[x - rx * 0.7, y + ry * 0.35], [x, y + ry * 0.55], [x + rx * 0.7, y + ry * 0.35]], true);
    line(b, rgba('#000000', 0.4), 2);
  }
  path(b, [[-36, 2], [-30, -34], [-10, -62], [8, -72], [-2, -50], [-4, -30], [-2, -6], [28, -6], [34, 2], [30, 14], [-24, 20]]);
  ink(b, hide(b, plate, -72, 20), 3.2); // the big jaw, with the palm
  path(b, [[34, -2], [38, -24], [24, -52], [12, -62], [14, -38], [10, -14]]);
  ink(b, hide(b, shade(plate, -0.15), -62, 0), 3); // the small jaw
  path(b, [[-30, -28], [-8, -58]], true);
  line(b, rgba('#ffffff', 0.35), 2);
  barnacles(b, [[-4, 52, 40], [10, 10, 30], [-22, -20, 14]], 7);
  eye(l, 0, -8, 2.6, weak, 3); // a seam burning at the joint
  bloom(l, 0, -8, 24, weak, 0.25);
  gloss(b, -12, 40, 6, 12, 0.3, 0.1);
}

export const PARTS = { crest, skull, maw, gill, claw };
