// The sprites of Lantern Deep's swaying growth (flourish-deep-sway.js draws them), each painted once: three
// segments of a kelp strand in each of three palettes (a stipe with blades, hung one above the other and
// swayed as a chain), an anemone's tentacle with a bead of light at its tip, a tuft of sea grass, and a tube
// worm's crown of feathers. Every sprite stands on its pivot (the foot, or the tube's mouth). The kelp is
// opaque dark weed with a faint teal edge; the beads and barbs are small cool points of light, never white.
import { cached, rgba, mix, hash } from './sprites.js';
import { TAU } from '../core/math.js';

export const SEG = { w: 80, h: 100, px: 40, py: 100, n: 3, overlap: 4 }; // a kelp segment, 3 to a strand
export const TENT = { w: 36, h: 96, px: 18, py: 94 }; // an anemone's tentacle
export const TUFT = { w: 60, h: 84, px: 30, py: 82 }; // a tuft of sea grass
export const CROWN = { w: 72, h: 56, px: 36, py: 50 }; // a worm's crown, open

export const KELP_COLORS = ['#082e30', '#0a3a2c', '#0b2c44'];
export const TENT_COLORS = ['#4e3a9a', '#8c3560', '#1b7f76']; // dusky violet, rose and teal
export const BEADS = ['#d08aff', '#ff8ab0', '#7af0d8'];
const EDGE = '#38d6b8';
const DEEPER = '#0e5a78'; // the water's haze, which the baked layer is washed with and the strands must match

// One sprite per palette index, made on first use; a bare array lookup in the hot path.
const byIndex = (make) => {
  const list = [];
  return (k) => (list[k] ??= make(k));
};

// A blade standing out of the stipe at (x, y) toward `side` (-1 left, 1 right), len long, rising steeply: a
// lens with its belly outward, and now and then a float (a bladder) at its foot.
function blade(g, x, y, side, len, fill, bladder = false) {
  const [tx, ty] = [x + side * len * 0.42, Math.max(3, y - len * 0.92)];
  g.beginPath();
  g.moveTo(x, y);
  g.quadraticCurveTo(x + side * len * 0.66, y - len * 0.32, tx, ty);
  g.quadraticCurveTo(x + side * len * 0.08, y - len * 0.5, x, y);
  g.fillStyle = fill;
  g.fill();
  g.strokeStyle = rgba(EDGE, 0.14);
  g.lineWidth = 0.8;
  g.stroke();
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(tx, ty);
  g.strokeStyle = rgba(EDGE, 0.1);
  g.stroke();
  if (bladder) {
    g.beginPath();
    g.ellipse(x + side * 2.2, y + 1, 2, 3.2, side * 0.3, 0, TAU);
    g.fillStyle = mix(fill, EDGE, 0.12);
    g.fill();
  }
}

const WIDTHS = [[6.4, 5.2], [5.2, 3.8], [3.8, 1.4]]; // the stipe's width at the foot and head of each segment
const BLADES = [[4, 24, 36], [5, 20, 34], [5, 12, 28]]; // count, then the shortest and longest blade

// Segment i of a strand in palette k: the stipe from the foot (x 40, y 100) to the head (x 40, y 1), blades
// alternating up its length. The weed is lifted toward the water's haze with height, like the baked layer.
function segment(g, i, k) {
  const color = mix(KELP_COLORS[k], DEEPER, i * 0.07);
  const [w0, w1] = WIDTHS[i];
  const bow = i % 2 ? -3 : 3;
  g.beginPath();
  g.moveTo(40 - w0 / 2, 100);
  g.quadraticCurveTo(40 + bow - (w0 + w1) / 4, 50, 40 - w1 / 2, 1);
  g.lineTo(40 + w1 / 2, 1);
  g.quadraticCurveTo(40 + bow + (w0 + w1) / 4, 50, 40 + w0 / 2, 100);
  g.closePath();
  g.fillStyle = color;
  g.fill();
  const [n, lo, hi] = BLADES[i];
  for (let j = 0; j < n; j++) {
    const y = 100 - (j + 0.5 + hash(i * 17 + j + k * 5) * 0.3) * (96 / n);
    const len = Math.min(lo + hash(i * 31 + j * 7 + k) * (hi - lo), (y - 3) / 0.92);
    blade(g, 40 + bow * (1 - y / 100) * 0.6, y, j % 2 ? 1 : -1, len, mix(color, EDGE, 0.03 + 0.04 * (j % 3)), j % 3 === 1);
  }
  if (i === 2) { // the strand's tip: two small curling blades and a speck of light
    blade(g, 40, 14, 1, 14, color);
    blade(g, 40, 9, -1, 12, color);
    g.beginPath();
    g.arc(40, 3, 1.2, 0, TAU);
    g.fillStyle = rgba('#3de8d0', 0.6);
    g.fill();
  }
}

export const kelpSegs = byIndex((k) => [0, 1, 2].map((i) => cached(`deepKelpSeg${k}-${i}`, SEG.w, SEG.h, (g) => segment(g, i, k))));

// A tentacle of colour k, foot at (18, 94), curving gently up to a bead of light at the tip.
export const tentacle = byIndex((k) => cached(`deepTentacle${k}`, TENT.w, TENT.h, (g) => {
  const color = TENT_COLORS[k];
  g.beginPath();
  g.moveTo(18 - 2.4, 94);
  g.quadraticCurveTo(10, 56, 22 - 0.7, 14);
  g.lineTo(22 + 0.7, 14);
  g.quadraticCurveTo(14, 56, 18 + 2.4, 94);
  g.closePath();
  g.fillStyle = rgba(color, 0.92);
  g.fill();
  g.beginPath();
  g.moveTo(18, 92);
  g.quadraticCurveTo(12, 56, 22, 16);
  g.strokeStyle = rgba(BEADS[k], 0.3);
  g.lineWidth = 0.9;
  g.stroke();
  const halo = g.createRadialGradient(22, 11, 0, 22, 11, 8);
  halo.addColorStop(0, rgba(BEADS[k], 0.7));
  halo.addColorStop(0.4, rgba(BEADS[k], 0.3));
  halo.addColorStop(1, rgba(BEADS[k], 0));
  g.fillStyle = halo;
  g.fillRect(12, 1, 20, 20);
}));

// A tuft of sea grass in palette k (0 green, 1 blue): five blades fanning from the foot (30, 82).
export const tuft = byIndex((k) => cached(`deepTuft${k}`, TUFT.w, TUFT.h, (g) => {
  const color = ['#0b4a3a', '#10405a'][k];
  for (let j = 0; j < 5; j++) {
    const lean = (j - 2) * 0.17 + (hash(j + k * 9) - 0.5) * 0.12;
    const len = 46 + hash(j * 5 + k) * 28;
    const [tx, ty] = [30 + Math.sin(lean) * len, 82 - Math.cos(lean) * len];
    const bx = 30 + (j - 2) * 3;
    g.beginPath();
    g.moveTo(bx - 2.1, 82);
    g.quadraticCurveTo(bx + Math.sin(lean) * len * 0.3 - 1.6 + lean * 8, 82 - len * 0.55, tx, ty);
    g.quadraticCurveTo(bx + Math.sin(lean) * len * 0.3 + 2.4 + lean * 8, 82 - len * 0.5, bx + 2.1, 82);
    g.fillStyle = mix(color, EDGE, 0.06 * (j % 3));
    g.fill();
    g.strokeStyle = rgba(EDGE, 0.18);
    g.lineWidth = 0.7;
    g.stroke();
  }
}));

// A tube worm's crown of colour k (0 teal, 1 violet, 2 pale green): eleven barbs fanning from the mouth at
// (36, 50), each tipped with a small bead, a faint veil between them, a ring of light at the base.
export const crown = byIndex((k) => cached(`deepCrown${k}`, CROWN.w, CROWN.h, (g) => {
  const color = ['#3de8d0', '#b27cff', '#7af0b8'][k];
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(36, 50);
  for (let j = 0; j <= 10; j++) {
    const a = -Math.PI / 2 + (j / 10 - 0.5) * 2.3;
    g.lineTo(36 + Math.cos(a) * 24, 50 + Math.sin(a) * 24);
  }
  g.closePath();
  g.fillStyle = rgba(color, 0.12);
  g.fill();
  for (let j = 0; j <= 10; j++) {
    const a = -Math.PI / 2 + (j / 10 - 0.5) * 2.3;
    const len = 26 + hash(j * 3 + k) * 5;
    const [tx, ty] = [36 + Math.cos(a) * len, 50 + Math.sin(a) * len];
    g.beginPath();
    g.moveTo(36, 50);
    g.quadraticCurveTo(36 + Math.cos(a) * len * 0.5 + Math.sin(a) * 3, 50 + Math.sin(a) * len * 0.5 - 3, tx, ty);
    g.strokeStyle = rgba(color, 0.75);
    g.lineWidth = 1.4;
    g.stroke();
    g.beginPath();
    g.arc(tx, ty, 1.5, 0, TAU);
    g.fillStyle = rgba(mix(color, '#ffffff', 0.3), 0.8);
    g.fill();
  }
  g.beginPath();
  g.ellipse(36, 50, 7, 2.4, 0, 0, TAU);
  g.fillStyle = rgba(color, 0.55);
  g.fill();
}));

// Paint every sprite above, so none is baked in the middle of a fight.
export function warmSprites() {
  for (let k = 0; k < 3; k++) {
    kelpSegs(k);
    tentacle(k);
    crown(k);
  }
  tuft(0);
  tuft(1);
}
