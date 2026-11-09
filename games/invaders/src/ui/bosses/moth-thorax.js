// The Vesper Moth's thorax (World 16, Glass Cathedral; moth-hull.js paints it): the furry body the heart is set in,
// carved stone in lead. A dark core, then rings of leaf-shaped tufts lying outward from the heart, the outer rings
// first and each inner ring over them like the shingles of a roof, the dawn catching the tufts that point up and
// leaving the ones below in shadow, the innermost gilded at their tips; round the heart a gilt sunburst, thirty-two rays
// long and short like the rays of a monstrance, with a thin gilt ring where it springs from the fur. Boss
// coordinates. The lights carry the dawn on the upper edge and a glow in the sunburst. Bake-time only.
import { line, rad, rgba, shade, bloom } from './kit.js';
import { LEAD, STONE, STONE_M, GOLD, TAU } from './moth-kit.js';
import { tuft } from './moth-fur.js';

export const THORAX = { x: 0, y: -6, rx: 104, ry: 70 };
export const HEART_AT = [0, -10]; // where the heart sits (its part's centre)
const RINGS = [[1, 30, 26, 15], [0.87, 26, 22, 13], [0.73, 22, 19, 12], [0.6, 18, 15, 11]]; // scale, tufts, length, width

const ray = (g, k, r0, r1) => {
  const [a, da] = [(k * TAU) / 32, (TAU / 32) * 0.62];
  g.beginPath();
  g.moveTo(Math.cos(a - da) * r0, Math.sin(a - da) * r0);
  g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
  g.lineTo(Math.cos(a + da) * r0, Math.sin(a + da) * r0);
  g.closePath();
};

// The sunburst round the heart: long rays and short, gilt, each outlined in lead, a bright edge on the left of each.
function sunburst(b, l) {
  b.save();
  b.translate(...HEART_AT);
  b.scale(1, 0.94);
  for (let k = 0; k < 32; k++) {
    const long = k % 2 === 0;
    ray(b, k, 44, long ? 84 : 68);
    b.fillStyle = rad(b, 0, 0, 44, long ? 84 : 68, [[0, '#8a6428'], [0.45, '#e8c470'], [1, '#fff0c0']]);
    b.fill();
    line(b, LEAD, 1.6);
    const [a, da] = [(k * TAU) / 32, (TAU / 32) * 0.62];
    b.beginPath(); // the lit side of the ray
    b.moveTo(Math.cos(a - da) * 47, Math.sin(a - da) * 47);
    b.lineTo(Math.cos(a) * (long ? 82 : 66), Math.sin(a) * (long ? 82 : 66));
    line(b, rgba('#ffffff', 0.5), 0.8);
  }
  b.restore();
  l.save();
  l.translate(...HEART_AT);
  for (let k = 0; k < 16; k++) {
    const a = (k * TAU) / 16;
    bloom(l, Math.cos(a) * 70, Math.sin(a) * 66, 14, GOLD, 0.2);
  }
  l.restore();
}

export function thorax(b, l) {
  const { x, y, rx, ry } = THORAX;
  b.beginPath();
  b.ellipse(x, y, rx * 0.97, ry * 0.97, 0, 0, TAU);
  b.fillStyle = LEAD;
  b.fill();
  b.beginPath();
  b.ellipse(x, y, rx * 0.93, ry * 0.93, 0, 0, TAU);
  b.fillStyle = rad(b, x, y, 20, rx, [[0, STONE_M], [1, STONE]]);
  b.fill();
  RINGS.forEach(([k, n, len, w], ring) => {
    for (let i = 0; i < n; i++) {
      const a = ((i + (ring % 2) * 0.5) * TAU) / n;
      const [c, s] = [Math.cos(a), Math.sin(a)];
      const lit = Math.max(0, Math.min(0.75, 0.3 - s * 0.55));
      tuft(b, x + c * rx * 0.74 * k, y + s * ry * 0.74 * k, Math.atan2(s * ry, c * rx), len, w, lit, ring % 2 ? STONE_M : shade(STONE_M, 0.06));
    }
  });
  sunburst(b, l);
  b.beginPath();
  b.ellipse(x, y, rx * 0.97, ry * 0.97, 0, Math.PI * 1.1, Math.PI * 1.9);
  line(b, rgba('#e8d8ff', 0.4), 1.3);
  b.beginPath();
  b.ellipse(HEART_AT[0], HEART_AT[1], 45.5, 43, 0, 0, TAU);
  line(b, rgba('#fff0c0', 0.7), 1.6);
  bloom(l, x, y - 30, 110, '#ffb8e0', 0.12);
}
