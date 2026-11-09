// The Vesper Moth's eyespot (World 16, Glass Cathedral; see moth.js): a weak part 120 x 106 in the middle of each
// hindwing's rose window, painted once as the left one and mirrored for the right. Great concentric rings of coloured
// glass, a peacock's eye: a carved stone ring set with beads, rings of cobalt, rose and amber panes between lead spokes,
// and a lens of white-hot gold at the heart with a glint, so the eye blazes toward its middle like a target and is dark
// at its edge. The lights carry the halo in the weak colour, the hot rings and the lens. The geometry is shared with
// the live light that runs round its rings (moth-light.js).
import { line, rad, rgba, shade, bloom } from './kit.js';
import { came, circle, LEAD, STONE_M, STONE_L, ROSE, COBALT, AMBER, VIOLET, GOLD, WEAK } from './moth-kit.js';
import { band, beads } from './moth-rose.js';

export const SPOT = { rx: 59.5, ry: 52.5, ring: 51 };
const SQ = SPOT.ry / SPOT.rx;

export function spot(b, l) {
  b.save();
  b.scale(1, SQ);
  circle(b, 0, 1.6, SPOT.rx + 0.6); // its shadow on the wing
  b.fillStyle = rgba('#000000', 0.4);
  b.fill();
  circle(b, 0, 0, SPOT.rx);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, 0, 0, SPOT.rx - 1.8);
  b.fillStyle = rad(b, 0, 0, 36, SPOT.rx, [[0, STONE_M], [0.6, STONE_L], [1, shade(STONE_M, -0.3)]], -10, -16);
  b.fill();
  beads(b, 30, 55.4, 0.05, 1.6);
  band(b, 41, SPOT.ring, 18, [COBALT, VIOLET], 700, 0.7, 0.05);
  band(b, 31, 41, 14, [ROSE, '#ff8ac4'], 730, 0.85, 0.1);
  band(b, 21.5, 31, 10, [AMBER, GOLD], 760, 1, 0.15);
  circle(b, 0, 0, 22);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, 0, 0, 20.4);
  b.fillStyle = rad(b, 0, 0, 0, 20.4, [[0, '#ffffff'], [0.22, '#fff6d8'], [0.55, WEAK], [0.85, '#f4c060'], [1, '#d8903a']], -3, -4);
  b.fill();
  b.save();
  circle(b, 0, 0, 20);
  b.clip();
  b.beginPath(); // the fibres of the lens, running out from its heart
  for (let k = 0; k < 28; k++) {
    const a = (k * 2 * Math.PI) / 28;
    b.moveTo(Math.cos(a) * 7, Math.sin(a) * 7);
    b.lineTo(Math.cos(a + 0.06) * 21, Math.sin(a + 0.06) * 21);
  }
  line(b, rgba('#c07820', 0.3), 0.8);
  b.restore();
  circle(b, 0, 0, 9);
  b.fillStyle = rad(b, 0, 0, 0, 9, [[0, '#ffffff'], [0.7, '#fff8e0'], [1, rgba('#fff0c0', 0)]]);
  b.fill();
  circle(b, 0, 0, 13.5);
  line(b, rgba('#d8903a', 0.4), 1);
  b.beginPath(); // a crescent of reflected sky on the lens
  b.arc(0, 0, 16.5, Math.PI * 1.05, Math.PI * 1.62);
  line(b, rgba('#ffffff', 0.85), 2.6);
  circle(b, -6.5, -7, 2.5);
  b.fillStyle = '#ffffff';
  b.fill();
  came(b, () => circle(b, 0, 0, SPOT.rx - 0.8), 2.6, 0.5);
  b.restore();
  l.save();
  l.scale(1, SQ);
  bloom(l, 0, 0, 104, WEAK, 0.34);
  for (const [r, c, a] of [[46, COBALT, 0.14], [36, ROSE, 0.22], [26, AMBER, 0.34]]) {
    circle(l, 0, 0, r);
    line(l, rgba(c, a), 9);
  }
  for (const [r, n, c, a, k] of [[26, 10, GOLD, 0.2, 14], [36, 14, ROSE, 0.15, 12], [46, 18, COBALT, 0.1, 10]]) { // each pane of the rings glows
    for (let i = 0; i < n; i++) {
      const th = ((i + 0.5) * 2 * Math.PI) / n;
      bloom(l, Math.cos(th) * r, Math.sin(th) * r, k, i % 2 ? c : AMBER, a);
    }
  }
  bloom(l, 0, 0, 30, '#ffffff', 0.22);
  l.restore();
}
