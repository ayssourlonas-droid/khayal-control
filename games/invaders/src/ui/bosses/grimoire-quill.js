// The Grand Grimoire's quills (World 12, Starlit Archive; see grimoire.js): the pens that write its
// attacks, drawn once as the left one and mirrored for the right. A long dark feather leaning out from
// the page corner, its barbs swept back and edged in gold light, a pale quill barrel, a bronze nib
// with a drop of teal ink gathering on its point. A weak point, 70 x 100 for the hit box.
import { path, ink, line, lin, rad, rgba, shade, neon, bloom, eye } from './kit.js';
import { GOLD, GILT, GOLD_D } from './grimoire-kit.js';

export const NIB = [14, 46]; // where the nib ends, in the quill's own frame, the drop hanging from it
const TIP = [-24, -48];
const BEND = [-4, 8];

// The shaft: a quadratic bow from the nib to the feather's tip, its point and unit tangent at u.
const at = (u, k) => (1 - u) ** 2 * NIB[k] + 2 * (1 - u) * u * BEND[k] + u * u * TIP[k];
const slope = (u, k) => 2 * (1 - u) * (BEND[k] - NIB[k]) + 2 * u * (TIP[k] - BEND[k]);

// The vane's edge on one side (side = +1 right, -1 left) from u0 to the tip, as points.
function edge(side, from, n = 26) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = from + ((1.02 - from) * i) / n;
    const d = Math.hypot(slope(u, 0), slope(u, 1));
    const w = 19 * Math.sin(Math.PI * Math.min(1, (u - from) / (1 - from)) ** 0.78) ** 0.7 * (side > 0 ? 1 : 0.78);
    return [at(u, 0) - (slope(u, 1) / d) * w * side, at(u, 1) + (slope(u, 0) / d) * w * side];
  });
}

export function quill(b, l, p, S) {
  const { weak } = S.pal;
  const [left, right] = [edge(-1, 0.2), edge(1, 0.2)];
  path(b, [...left, ...right.toReversed()]);
  ink(b, lin(b, NIB[0], NIB[1], TIP[0], TIP[1], [[0, '#1c1238'], [0.5, '#35286a'], [1, '#5a4a96']]), 2.6);
  b.save();
  b.clip();
  for (let i = 1; i < 24; i++) { // barbs, swept back toward the tip: light and dark in turn
    const u = 0.2 + (0.82 * i) / 26;
    for (const e of [left[Math.min(26, i + 3)], right[Math.min(26, i + 3)]]) {
      path(b, [[at(u, 0), at(u, 1)], e], true);
      line(b, i % 2 ? rgba('#c8b8ff', 0.34) : rgba('#06020f', 0.5), 0.9);
    }
  }
  b.beginPath(); // the split in the vane
  const split = [at(0.62, 0), at(0.62, 1)];
  b.moveTo(...split);
  b.lineTo(right[15][0], right[15][1] - 2);
  line(b, rgba('#06020f', 0.8), 1.8);
  b.restore();
  path(b, left, true); // the leading edge, gilded
  line(b, rgba(GOLD, 0.75), 1);
  path(b, right, true);
  line(b, rgba(GILT, 0.4), 0.8);
  b.beginPath(); // the barrel, pale, and the rachis in gold along the vane
  b.moveTo(...NIB);
  b.quadraticCurveTo(...BEND, ...TIP);
  line(b, '#06020f', 5.4);
  line(b, '#e8d8a8', 3.6);
  line(b, rgba('#ffffff', 0.7), 1);
  b.beginPath();
  for (let u = 0.2; u <= 1; u += 0.04) b.lineTo(at(u, 0), at(u, 1));
  line(b, GOLD_D, 2.8);
  line(b, GOLD, 1.6);
  const [nx, ny] = [slope(0, 0), slope(0, 1)];
  const d = Math.hypot(nx, ny);
  const tip = [NIB[0] - (nx / d) * 11, NIB[1] - (ny / d) * 11];
  path(b, [[NIB[0] - 3.2, NIB[1] + 1], [NIB[0] + 3.2, NIB[1] - 1], tip]); // the nib, bronze, slit down the middle
  ink(b, lin(b, NIB[0] - 3, 0, NIB[0] + 3, 0, [[0, shade(S.pal.plate, 0.6)], [1, shade(S.pal.plate, -0.5)]]), 1.6);
  path(b, [[NIB[0], NIB[1]], tip], true);
  line(b, rgba('#06020f', 0.8), 0.9);
  b.beginPath(); // the ferrule where the nib meets the barrel
  b.moveTo(NIB[0] - 4.6, NIB[1] - 4);
  b.lineTo(NIB[0] + 4.6, NIB[1] - 6);
  line(b, GOLD_D, 4);
  line(b, GILT, 2);
  const drop = [tip[0], tip[1] + 3.4];
  b.beginPath();
  b.moveTo(drop[0], drop[1] - 4.5);
  b.quadraticCurveTo(drop[0] + 4.2, drop[1] + 1.6, drop[0], drop[1] + 4);
  b.quadraticCurveTo(drop[0] - 4.2, drop[1] + 1.6, drop[0], drop[1] - 4.5);
  ink(b, rad(b, drop[0], drop[1] + 1, 0, 5, [[0, '#d8fff6'], [0.5, weak], [1, '#0a5a58']], drop[0] - 1.2, drop[1]), 1.2);
  l.beginPath(); // ink in the hollow barrel and the feather's gold edge, lit
  l.moveTo(...NIB);
  for (let u = 0.04; u <= 0.5; u += 0.04) l.lineTo(at(u, 0), at(u, 1));
  neon(l, weak, 1.2, 0.8);
  path(l, left, true);
  neon(l, GOLD, 0.7, 0.4);
  eye(l, drop[0], drop[1] + 1, 2.8, weak, 5);
  bloom(l, ...tip, 26, weak, 0.45);
  bloom(l, 0, -8, 60, weak, 0.1);
}
