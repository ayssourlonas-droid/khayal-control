// The near layer of Sunset Armada: the sea of cloud tops rolling in front of everything, in two ranks, darker
// and richer than the far sea (it stands against the glare: violet-rose on the shaded sides, gold on every
// rim that faces the sun, an ember glow rising in the valleys between its lobes), a mooring mast or two
// poking out of it with a lamp blinking, and the anchors of the mooring balloons that ride on their cables
// above it (flourish-9.js draws the balloons live, swaying, from the signs). See parallax-shapes.js for the
// painter contract.
import { rgba, lin } from './sprites.js';
import { bank, lobes } from './cloud-kit.js';
import { GOLD, EMBER, NIGHT, poly } from './parallax-armada-kit.js';

const DUSK = { lit: '#ffe0a8', gold: '#e88a7a', rose: '#a24e80', dusk: '#5c3a84', shade: '#241a58' }; // the clouds in front, against the sun
const [BACK, FRONT] = [150, 215]; // layer y of each rank's crest

// A mooring mast: a lattice of two posts and cross-braces, a platform with a rail, a lamp blinking on top.
function mast(g, out, rng, L, x, y, h) {
  g.strokeStyle = NIGHT;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x - 6, y);
  g.lineTo(x - 3, y - h);
  g.moveTo(x + 6, y);
  g.lineTo(x + 3, y - h);
  g.stroke();
  g.lineWidth = 1.4;
  g.beginPath();
  for (let k = 0; k < 7; k++) {
    const [y0, y1] = [y - (h * k) / 7, y - (h * (k + 1)) / 7];
    g.moveTo(x - 6 + k * 0.4, y0);
    g.lineTo(x + 3, y1);
    g.moveTo(x + 6 - k * 0.4, y0);
    g.lineTo(x - 3, y1);
  }
  g.stroke();
  g.fillStyle = NIGHT;
  g.fillRect(x - 13, y - h, 26, 4);
  g.fillRect(x - 12, y - h - 8, 1.6, 8);
  g.fillRect(x + 10.4, y - h - 8, 1.6, 8);
  poly(g, [[x - 5, y - h], [x, y - h - 12], [x + 5, y - h]]);
  g.fill();
  g.fillStyle = rgba(GOLD, 0.9);
  g.fillRect(x - 1.5, y - h - 15, 3, 3);
  out.lights.push({ x, y: y - h - 14, r: 44, color: GOLD, mode: 'blink', ph: rng(), a: 0.95 });
  out.lights.push({ x, y: y - h * 0.5, r: 16, color: EMBER, mode: 'flicker', ph: rng(), a: 0.7 });
}

// One rank of banks across the layer, its crests at `crest`; `detail` is how plainly each lobe's contours show.
function ranks(g, rng, w, crest, detail) {
  for (let x = -140; x < w; x += 200 + rng() * 120) {
    bank(g, lobes(rng, x, crest + 110, 320 + rng() * 200, 90 + rng() * 60), DUSK, { x: 1400, y: -200 }, 1, detail);
  }
}

function cloudsea(g, w, h, rng, L, out) {
  ranks(g, rng, w, BACK, 0.5);
  for (let x = 260 + rng() * 200; x < w - 120; x += 520 + rng() * 520) mast(g, out, rng, L, x, BACK + 50, 80 + rng() * 40);
  ranks(g, rng, w, FRONT, 0.7);
  ranks(g, rng, w, FRONT + 70, 0.8);
  g.fillStyle = lin(g, 0, FRONT + 120, 0, h, [[0, rgba('#5c3a84', 0)], [1, rgba('#2a1c5c', 1)]]);
  g.fillRect(0, FRONT + 120, w, h);
  for (let x = 120; x < w - 100; x += 420 + rng() * 300) { // a mooring balloon's anchor in the front rank
    const [bx, by] = [x, FRONT + 8 + rng() * 14];
    out.signs.push({ balloon: true, x: bx, y: by, h: 70 + rng() * 60, r: 18 + rng() * 10, k: out.signs.length });
  }
  for (let i = 0; i < 9; i++) { // the ember glow rising in the valleys
    out.lights.push({ x: 80 + i * (w / 9) + rng() * 120, y: FRONT + 40 + rng() * 30, r: 90 + rng() * 60, color: EMBER, mode: 'pulse', ph: rng(), a: 0.22 });
  }
}

export const CLOUDS = { cloudsea };
