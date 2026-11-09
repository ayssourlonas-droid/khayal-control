// The Lantern Leviathan's belly (World 15, Lantern Deep; see angler.js): a weak part 200 x 80 for the hit box,
// centred at (0, 96) in the boss's frame. The throat's pouch hanging under the jaw like a dewlap (the jaw, live,
// lies over its top, which fades into the dark): a sac of pale, mottled, translucent skin lit from above, with a
// groove down its middle and folds at its flanks, soft-edged. On it a double row of photophores following the curve
// of its foot, each a living lens in a pit of skin with a soft light round it, big in the middle and small toward the
// flanks, teal and cyan with a few violet, joined by a faint lateral line. The lights layer carries every glow.
// LIGHTS is where each lamp sits in the boss's coordinates, for the live chase (angler-fx.js).
import { line, lin, rad, rgba, ellipse } from './kit.js';
import { hash } from '../sprites.js';
import { circle, AQUA, TEAL, VIOLET, INK } from './angler-kit.js';

const Y0 = 96; // the part's centre in the boss's frame
const ROWS = [
  { y: 28, n: 9, step: 21, sag: 6, big: 6, small: 3, hues: [VIOLET, TEAL, AQUA, TEAL, AQUA, TEAL, AQUA, TEAL, VIOLET] },
  { y: 47, n: 8, step: 21, sag: 6, big: 5.2, small: 2.6, hues: [TEAL, VIOLET, AQUA, TEAL, TEAL, AQUA, VIOLET, TEAL] },
];

// Every lamp: x, y in the part's frame (the centre lowest, as the pouch's foot curves), its radius and colour, upper
// row first, left to right; the places wander a pixel or two, as living things do.
export const LAMPS = ROWS.flatMap((row, j) => Array.from({ length: row.n }, (_, i) => {
  const x = (i - (row.n - 1) / 2) * row.step + (hash(i * 5 + j * 31) - 0.5) * 3;
  const u = Math.abs(x) / 90;
  return { x, y: row.y - row.sag * u * u + (hash(i * 11 + j * 17) - 0.5) * 3, r: row.big - (row.big - row.small) * u, c: row.hues[i], row: j, i };
}));
export const LIGHTS = LAMPS.map((p) => ({ ...p, y: p.y + Y0 }));

function shape(b) {
  b.beginPath();
  b.moveTo(-108, -14);
  b.quadraticCurveTo(0, -8, 108, -14);
  b.bezierCurveTo(124, 8, 116, 40, 88, 54);
  b.bezierCurveTo(60, 64, -60, 64, -88, 54);
  b.bezierCurveTo(-116, 40, -124, 8, -108, -14);
  b.closePath();
}

const stroke = (b, f, col, w) => { // a path built by f, stroked
  b.beginPath();
  f(b);
  line(b, col, w);
};

// The skin: pale, lit from above, shaded toward the flanks and the foot, mottled, folded at the sides, a groove down
// the middle; the edge darkens softly rather than being outlined, and so does the top, under the jaw.
function skin(b) {
  shape(b);
  b.fillStyle = lin(b, 0, -14, 0, 64, [[0, '#2c4c66'], [0.25, '#6a98b0'], [0.55, '#8fb8cc'], [0.8, '#6a96ae'], [1, '#2c4c66']]);
  b.fill();
  b.save();
  shape(b);
  b.clip();
  b.fillStyle = rad(b, 0, 26, 24, 124, [[0, rgba('#ffffff', 0.12)], [0.6, rgba('#10243a', 0)], [1, rgba('#10243a', 0.62)]]);
  b.fillRect(-130, -20, 260, 90);
  for (let i = 0; i < 70; i++) { // mottling
    ellipse(b, (hash(i) - 0.5) * 230, -10 + hash(i + 99) * 70, 3 + hash(i + 7) * 6, 1.6 + hash(i + 8) * 3, hash(i + 3) - 0.5);
    b.fillStyle = rgba(i % 3 ? '#4a7088' : '#e8f6fa', 0.13);
    b.fill();
  }
  for (const s of [-1, 1]) { // folds at the flanks
    for (let k = 0; k < 3; k++) {
      const fold = (g) => {
        g.moveTo(s * (84 + k * 7), 6 + k * 5);
        g.quadraticCurveTo(s * (104 + k * 3), 28 + k * 3, s * (88 + k * 5), 50 - k * 2);
      };
      stroke(b, fold, rgba('#10243a', 0.3), 1.6);
      b.translate(s * 1.4, 0);
      stroke(b, fold, rgba('#e8f6fa', 0.18), 1);
      b.translate(s * -1.4, 0);
    }
  }
  const groove = (g) => {
    g.moveTo(0, 8);
    g.quadraticCurveTo(2, 36, 0, 62);
  };
  for (const [w, a] of [[7, 0.06], [4, 0.1], [1.6, 0.18]]) stroke(b, groove, rgba('#10243a', a), w);
  b.restore();
  b.save(); // the edge fades into the dark skin: an elliptical vignette erased from the pouch
  b.globalCompositeOperation = 'destination-out';
  b.translate(0, 26);
  b.scale(1.75, 1);
  b.fillStyle = rad(b, 0, 0, 0, 68, [[0, rgba('#000000', 0)], [0.58, rgba('#000000', 0)], [1, rgba('#000000', 1)]]);
  b.fillRect(-72, -44, 144, 92);
  b.restore();
  b.save(); // and its top, under the jaw
  b.globalCompositeOperation = 'destination-out';
  b.fillStyle = lin(b, 0, -2, 0, 22, [[0, '#000'], [1, 'rgba(0,0,0,0)']]);
  b.fillRect(-130, -20, 260, 42);
  b.restore();
}

// The faint lateral line: a thin wavering seam between the two rows, with a hair from each lamp to it.
function lateral(b, l) {
  const at = (x) => 38 - 6 * (x / 90) ** 2 + 1.4 * Math.sin(x * 0.11);
  const seam = (g) => {
    for (let x = -88; x <= 88; x += 4) g[x === -88 ? 'moveTo' : 'lineTo'](x, at(x));
  };
  stroke(b, seam, rgba('#10243a', 0.45), 1.8);
  stroke(b, seam, rgba('#f4fcff', 0.26), 0.8);
  stroke(l, seam, rgba(AQUA, 0.2), 1.2);
}

// A living lamp: a pit of dark skin, a glassy lens in it with a hot core, a wet glint; its light round it.
function lamp(b, l, p) {
  circle(b, p.x, p.y + 0.7, p.r + 2);
  b.fillStyle = rgba('#010610', 0.7);
  b.fill();
  circle(b, p.x, p.y, p.r);
  b.fillStyle = rad(b, p.x, p.y, 0, p.r, [[0, '#f4ffff'], [0.4, p.c], [1, rgba('#06283a', 1)]], p.x - p.r * 0.3, p.y - p.r * 0.3);
  b.fill();
  line(b, rgba(INK, 0.8), 1.1);
  circle(b, p.x - p.r * 0.32, p.y - p.r * 0.36, Math.max(0.6, p.r * 0.2));
  b.fillStyle = rgba('#ffffff', 0.9);
  b.fill();
  circle(l, p.x, p.y, p.r * 3);
  l.fillStyle = rad(l, p.x, p.y, 0, p.r * 3, [[0, rgba(p.c, 0.42)], [0.35, rgba(p.c, 0.16)], [1, rgba(p.c, 0)]]);
  l.fill();
  circle(l, p.x, p.y, p.r * 0.7);
  l.fillStyle = rgba('#e8ffff', 0.8);
  l.fill();
}

export function belly(b, l) {
  skin(b);
  lateral(b, l);
  for (const p of LAMPS) lamp(b, l, p);
  b.save(); // the foot of the pouch falls into shadow
  b.globalCompositeOperation = 'source-atop';
  b.fillStyle = lin(b, 0, 40, 0, 66, [[0, rgba(INK, 0)], [1, rgba(INK, 0.45)]]);
  b.fillRect(-130, 40, 260, 30);
  b.restore();
}

