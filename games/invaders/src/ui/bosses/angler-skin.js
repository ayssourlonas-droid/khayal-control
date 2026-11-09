// The Lantern Leviathan's skin (World 15, Lantern Deep; see angler.js): the textures laid over the head and the
// parts of it, all seeded: soft mottling in blues, violet and black; lumps of flesh, lit on one side and shaded on
// the other; a fine speckle; folds; the sheen of mucus. Bake-time only, painted under the caller's clip. There are
// no scales: this fish is naked, warty and wet.
import { path, line, rad, rgba, gloss } from './kit.js';
import { rng, SKIN_L, TEAL, circle } from './angler-kit.js';

// The default patch of skin the textures cover: the whole head.
export const ALL = [-256, -146, 256, 146];

// Soft blotches over a box: paler blue-grey, deep black, a violet and a teal tint; k scales their strength.
export function mottle(g, seed = 3, box = ALL, k = 1) {
  const r = rng(seed);
  const [x0, y0, x1, y1] = box;
  const tints = [[SKIN_L, 0.36], ['#010610', 0.62], ['#3a2a80', 0.34], ['#0c4a5a', 0.26], ['#000000', 0.42], ['#5a2a86', 0.24], ['#4a3a98', 0.22]];
  const n = Math.ceil(((x1 - x0) * (y1 - y0)) / 2600);
  for (let i = 0; i < n; i++) {
    const [c, a] = tints[i % tints.length];
    const rr = Math.min(16 + r() * 52, (y1 - y0) / 2, (x1 - x0) / 2);
    const x = x0 + rr + r() * (x1 - x0 - rr * 2);
    const y = y0 + rr + r() * (y1 - y0 - rr * 2);
    g.fillStyle = rad(g, x, y, 0, rr, [[0, rgba(c, a * k)], [1, rgba(c, 0)]]);
    g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
}

// Lumps of flesh: n round swellings, mostly small, each a light on its upper left fading to a shaded rim, so the
// hide reads warty and soft. A few have a dark pore at their crown.
export function lumps(g, seed = 7, box = ALL, n = 40, k = 1, rmin = 5, rmax = 29) {
  const r = rng(seed);
  const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) {
    const rr = rmin + r() ** 2 * (rmax - rmin);
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    g.fillStyle = rad(g, x, y, 0, rr, [[0, rgba('#6aa0c0', 0.3 * k)], [0.5, rgba(SKIN_L, 0.12 * k)], [1, rgba('#000610', 0.3 * k)]], x - rr * 0.32, y - rr * 0.36);
    circle(g, x, y, rr);
    g.fill();
    if (r() < 0.25) {
      circle(g, x - rr * 0.1, y - rr * 0.1, 1.2 + r());
      g.fillStyle = rgba('#000308', 0.55);
      g.fill();
    }
  }
}

// A fine speckle in three batches (light, dark, teal), a pixel or two each, and a scatter of pale freckles.
export function speckle(g, seed = 5, box = ALL, k = 1) {
  const r = rng(seed);
  const [x0, y0, x1, y1] = box;
  const n = Math.ceil(((x1 - x0) * (y1 - y0)) / 60) * k;
  for (const [c, a, s] of [['#9ad0e8', 0.16, 1.5], ['#000000', 0.34, 1.9], [TEAL, 0.12, 1.3]]) {
    g.fillStyle = rgba(c, a);
    for (let i = 0; i < n; i++) g.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), s, s);
  }
  for (let i = 0; i < n / 12; i++) { // freckles
    const rr = 1 + r() * 1.7;
    circle(g, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), rr);
    g.fillStyle = rgba(r() < 0.5 ? '#8ac0d8' : '#6a9ad0', 0.1 + 0.12 * r());
    g.fill();
  }
}

// Short folds of skin: curved dark strokes with a lit lip, a few in a patch.
export function wrinkles(g, seed = 9, box = ALL, n = 30) {
  const r = rng(seed);
  const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    const len = 8 + r() * 14;
    const a = (r() - 0.5) * 1.2;
    for (const [dy, c, w] of [[0, rgba('#000812', 0.3), 1.5], [1.6, rgba('#9ad0e8', 0.1), 0.9]]) {
      g.beginPath();
      g.moveTo(x - len, y + dy);
      g.quadraticCurveTo(x, y + dy + len * a, x + len, y + dy);
      line(g, c, w);
    }
  }
}

// All of the textures at once over a box, under the caller's clip.
export function texture(g, seed, box = ALL, k = 1) {
  const area = (box[2] - box[0]) * (box[3] - box[1]);
  const inset = (d) => [box[0] + d, box[1] + d, box[2] - d, box[3] - d]; // lumps and folds stay inside the box
  mottle(g, seed, box, k);
  lumps(g, seed + 3, inset(24), Math.ceil(area * 0.00067), k, 5, 24);
  speckle(g, seed + 1, box, k);
  wrinkles(g, seed + 2, inset(14), 12 + Math.round(area * 0.00025));
}

// The wet sheen of the dome, the brow and the cheeks: long pale gloss streaks.
export function sheen(g) {
  for (const [x, y, rx, ry, a, rot] of [[-62, -112, 66, 9, 0.24, -0.1], [122, -104, 40, 6, 0.16, 0.35], [-206, -40, 8, 46, 0.14, 0.3], [208, -30, 7, 38, 0.1, -0.25], [-8, 124, 78, 8, 0.12, 0]]) {
    gloss(g, x, y, rx, ry, a, rot);
  }
}

// A few pale scars across the cheek, healed long ago.
export function scars(g) {
  for (const pts of [[[-226, 4], [-212, 24], [-202, 46]], [[-220, 10], [-206, 28], [-196, 50]], [[204, 72], [216, 56], [230, 40]]]) {
    path(g, pts, true);
    line(g, rgba('#9ac4d8', 0.2), 1.6);
  }
}
