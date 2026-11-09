// The sky of world 14 (see sky-bodies.js for the contract). Painted once per level into the sky canvas: a
// festival night. Stars at the top, a slim crescent moon behind drifting smoke, the faded remains of
// firework bursts still hanging high up, banks of smoke lit from beneath by the fair and tinted by the
// last bursts, and the glow of the midway on the horizon. The live shows, rockets and searchlights are in
// flourish-10.js.
import { W, glow, addGlow, rgba, hash, lin, soft } from './sprites.js';
import { blobs, stars, horizonGlow } from './sky-paint.js';
import { TAU } from '../core/math.js';
import { bloom, HUES } from './flourish-carnival-sprites.js';

export const MOON = { x: 610, y: 118, r: 38 };
// The bursts that hang in the baked sky: [x, y, kind, hue, scale].
export const HANGING = [
  [330, 300, 'willow', 0, 0.95], [800, 190, 'chrys', 1, 1.05], [1210, 330, 'ring', 2, 0.9],
  [1560, 150, 'chrys', 3, 1.0], [1800, 380, 'willow', 1, 0.78], [70, 120, 'ring', 4, 0.7],
];
// Smoke banks: [x, y, width, height, colour]. Long, flat, billowing, at three heights, the lowest lit from the fair.
const SMOKE = [
  [220, 230, 760, 70, '#1c0c48'], [900, 140, 900, 80, '#160a3c'], [1560, 270, 820, 80, '#26124e'], [1800, 70, 600, 60, '#1c0c48'],
  [600, 420, 900, 90, '#2c1458'], [1250, 500, 1000, 100, '#34185e'], [1750, 560, 700, 90, '#2c1458'], [80, 520, 640, 90, '#34185e'],
];

// A slim crescent: the disc less a disc nudged up and away, in pale gold with a wide soft halo.
function moon(g) {
  const { x, y, r } = MOON;
  addGlow(g, glow('#ffe2a8'), x, y, r * 4.4, 0.4);
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.clip();
  g.beginPath();
  g.rect(x - r - 2, y - r - 2, r * 2 + 4, r * 2 + 4);
  g.arc(x + r * 0.5, y - r * 0.18, r * 0.9, 0, TAU);
  g.fillStyle = lin(g, x - r, y, x + r * 0.2, y, [[0, '#fffbe8'], [1, '#ffe39a']]);
  g.fill('evenodd');
  g.restore();
}

// The bursts that are left of the evening's shows: faint traces, wide, each with a halo that tints the sky
// round it. Kept dim so they never pass for a live burst, the shells' (the twist) above all.
function hanging(g) {
  for (const [x, y, kind, hue, s] of HANGING) {
    const c = HUES[hue];
    addGlow(g, glow(c), x, y, 330 * s, 0.12);
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.15;
    g.drawImage(bloom(kind, c), x - 170 * s, y - 170 * s, 340 * s, 420 * s);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }
}

// Smoke over everything: each bank a row of overlapping puffs, and a lit belly under the lower ones where the
// fair's light and the last bursts reach it.
function smoke(g) {
  SMOKE.forEach(([x, y, w, h, color], k) => {
    const n = Math.round(w / 80);
    const puffs = Array.from({ length: n }, (_, i) => [x - w / 2 + ((i + 0.5) / n) * w + (hash(k * 40 + i) - 0.5) * 70, y + (hash(k * 40 + i + 20) - 0.5) * h * 0.5, h * (0.9 + hash(k * 40 + i + 10) * 0.6), color, 0.62, 0.5]);
    blobs(g, puffs);
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = y > 350 ? 0.24 : 0.14;
    g.drawImage(soft(y > 350 ? '#ff5aa8' : HUES[k % HUES.length]), x - w * 0.5, y + h * 0.1, w, h * 0.9);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  });
}

function carnival(g) {
  stars(g, 150, 1401, 560, 0.85);
  moon(g);
  hanging(g);
  smoke(g);
  addGlow(g, glow('#ff4aa0'), 700, 1090, 900, 0.3, 0.7); // the fair on the horizon: magenta, gold and a cool lake
  addGlow(g, glow('#ffc060'), 1250, 1080, 760, 0.3, 0.6);
  addGlow(g, glow('#7a5aff'), 260, 1080, 600, 0.22, 0.6);
  horizonGlow(g, '#ff5aa0', 0.14, 600);
  g.fillStyle = lin(g, 0, 0, 0, 340, [[0, rgba('#000000', 0.34)], [1, rgba('#000000', 0)]]); // the zenith falls away to black
  g.fillRect(0, 0, W, 340);
}

export const BODIES6 = { carnival };
