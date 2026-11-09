// The Vesper Moth's crown (World 16, Glass Cathedral; see moth.js): an armour part 200 x 92, the head. A broad head of
// carved stone fur in lead, a gilt lancet crest with a rose pane in it between the roots of the two feathered antennae
// (moth-antenna.js, mirrored here), brows and cheeks of fur tufts, two great compound eyes of faceted glass (a lattice
// of hexagonal cells, each its own colour, the dawn's gold at the top, then amber, rose, violet and the cobalt of the
// shadow, with a glint) and a short muzzle with a coiled tongue of gold, and a ruff of fur lying over the thorax.
// The lights carry the eyes' glow and the antennae's tips. EYES is shared with the live glints (moth-fx.js). Nothing is
// drawn above y -43 (the HUD).
import { line, rad, rgba, shade, bloom } from './kit.js';
import { came, curve, circle, pane, rng, LEAD, STONE, STONE_M, STONE_L, ROSE, COBALT, AMBER, VIOLET, GOLD, WEAK, TAU } from './moth-kit.js';
import { tuft } from './moth-fur.js';
import { beads } from './moth-rose.js';
import { antenna, TIP } from './moth-antenna.js';

export const EYES = [[-30, 4, 24], [30, 4, 24]]; // x, y, radius (the crown's coordinates)
const HEAD = [[-54, 6], [-50, -10], [-32, -23], [0, -27], [32, -23], [50, -10], [54, 6], [46, 28], [24, 38], [0, 40], [-24, 38], [-46, 28]];
const FACET = [GOLD, AMBER, ROSE, VIOLET, shade(COBALT, -0.25)];

function eye(b, [x, y, R], side) {
  b.save();
  b.translate(x, y);
  circle(b, 0, 1.2, R + 3.6);
  b.fillStyle = LEAD;
  b.fill();
  circle(b, 0, 0, R + 1.6);
  b.fillStyle = rad(b, 0, 0, R * 0.7, R + 1.6, [[0, STONE_M], [1, STONE_L]], -5, -8);
  b.fill();
  b.save();
  circle(b, 0, 0, R);
  b.clip();
  b.fillStyle = '#1a1450';
  b.fillRect(-R, -R, R * 2, R * 2);
  const s = 6.6;
  const r = rng(212 + side);
  const [gx, gy] = [-side * 5, -R * 0.55]; // where the dawn's sky is reflected
  for (let j = -5; j <= 5; j++) {
    for (let i = -5; i <= 5; i++) {
      const [cx, cy] = [i * s * 1.73 + (j % 2) * s * 0.866, j * s * 1.5];
      if (Math.hypot(cx, cy) > R + 4) continue;
      const t = Math.hypot(cx - gx, cy - gy) / R;
      const c = FACET[Math.min(4, Math.floor(t * 3.1 + r() * 0.5))];
      b.beginPath();
      for (let k = 0; k < 6; k++) b[k ? 'lineTo' : 'moveTo'](cx + Math.cos((k * TAU) / 6 + 0.52) * s * 1.02, cy + Math.sin((k * TAU) / 6 + 0.52) * s * 1.02);
      b.closePath();
      b.fillStyle = rad(b, cx, cy, 0, s, [[0, shade(c, 0.4 - t * 0.2)], [1, shade(c, -0.4)]], cx - 1.2, cy - 1.8);
      b.fill();
      line(b, rgba(LEAD, 0.85), 1);
    }
  }
  b.fillStyle = rad(b, 0, 0, R * 0.45, R, [[0, 'rgba(10,6,40,0)'], [1, 'rgba(10,6,40,0.55)']], 0, -4); // the dome's shading
  b.fillRect(-R, -R, R * 2, R * 2);
  b.restore();
  b.beginPath(); // the glint
  b.arc(0, 0, R - 4.5, Math.PI * (side > 0 ? 1.1 : 1.15), Math.PI * (side > 0 ? 1.4 : 1.45));
  line(b, rgba('#ffffff', 0.9), 2.4);
  circle(b, -side * 8, -10, 2.4);
  b.fillStyle = '#ffffff';
  b.fill();
  came(b, () => circle(b, 0, 0, R + 0.4), 2.2, 0.5);
  beads(b, 22, R + 2.8, side * 0.1, 1.3);
  b.restore();
}

function crest(b) { // a gilt lancet with a rose pane in it, between the antennae's roots
  const arch = (k) => () => {
    b.beginPath();
    b.moveTo(-9 * k, -18);
    b.lineTo(-9 * k, -29 + (1 - k) * 4);
    b.quadraticCurveTo(-8 * k, -37 + (1 - k) * 4, 0, -42 + (1 - k) * 6);
    b.quadraticCurveTo(8 * k, -37 + (1 - k) * 4, 9 * k, -29 + (1 - k) * 4);
    b.lineTo(9 * k, -18);
    b.closePath();
  };
  arch(1)();
  b.fillStyle = LEAD;
  b.fill();
  arch(0.86)();
  b.fillStyle = rad(b, 0, -30, 0, 14, [[0, '#fff0c0'], [0.5, '#e8c470'], [1, '#6a4a1c']], -3, -34);
  b.fill();
  pane(b, arch(0.6), ROSE, [0, -29, 12], 515, 1, Math.PI / 2);
  came(b, arch(0.6), 1.8, 0.5);
  line(b, rgba('#fff0c0', 0.6), 0.8);
}

export function crown(b, l) {
  for (const s of [-1, 1]) { // the antennae, behind the head
    b.save();
    b.scale(s, 1);
    antenna(b);
    b.restore();
  }
  const r = rng(5);
  for (const s of [-1, 1]) { // brows of fur sweeping out over the eyes
    for (let i = 0; i < 4; i++) tuft(b, s * (8 + i * 11), -19 - (i === 3 ? 1 : 0), -Math.PI / 2 + s * (0.5 + i * 0.25), 17 - i * 1.5, 8, 0.9, i % 2 ? STONE_M : STONE, -s * 1.5);
  }
  curve(b, HEAD);
  b.fillStyle = LEAD;
  b.fill();
  b.save();
  curve(b, HEAD.map(([x, y]) => [x * 0.965, y * 0.95 + 0.5]));
  b.fillStyle = rad(b, 0, 6, 8, 56, [[0, STONE_L], [0.55, STONE_M], [1, STONE]], -10, -14);
  b.fill();
  b.clip();
  for (let i = 0; i < 38; i++) { // fur: short tufts over the head
    const [x, y] = [(r() - 0.5) * 100, -20 + r() * 56];
    tuft(b, x, y, Math.atan2(y - 2, x) + (r() - 0.5) * 0.5, 8 + r() * 6, 4.6, 0.6 + (y < 6 ? 0.3 : 0));
  }
  b.restore();
  curve(b, HEAD);
  line(b, LEAD, 2.6);
  for (const s of [-1, 1]) { // cheeks
    for (let i = 0; i < 3; i++) tuft(b, s * (44 + i * 3), 14 + i * 9, Math.PI / 2 - s * (0.9 - i * 0.25), 15, 8, 0.4, STONE_M, s * 2);
  }
  for (const e of EYES) eye(b, e, Math.sign(e[0]));
  crest(b);
  circle(b, 0, 24, 8); // the muzzle
  b.fillStyle = rad(b, 0, 23, 0, 9, [[0, STONE_L], [1, STONE_M]], -2, 20);
  b.fill();
  line(b, LEAD, 2);
  b.beginPath(); // the coiled tongue
  for (let a = 0; a < 9.4; a += 0.3) b[a ? 'lineTo' : 'moveTo'](Math.cos(a) * (1.2 + a * 0.55), 31 + Math.sin(a) * (1.2 + a * 0.55) * 0.8);
  line(b, LEAD, 3.2);
  line(b, GOLD, 1.5);
  [-56, -45, -34, -23, -12, 0, 12, 23, 34, 45, 56].forEach((x, i) => tuft(b, x, 33 + (i % 2) * 2 + Math.abs(x) * 0.07, Math.PI / 2 + x * 0.012, 14 + (i % 2) * 3, 8.5, 0.5, i % 2 ? STONE : STONE_M, -x * 0.03)); // the ruff
  for (const e of EYES) {
    bloom(l, e[0], e[1], 48, AMBER, 0.3);
    bloom(l, e[0] + Math.sign(e[0]) * -4, e[1] - 12, 18, WEAK, 0.4);
  }
  for (const s of [-1, 1]) bloom(l, s * TIP[0], TIP[1], 14, GOLD, 0.45);
  bloom(l, 0, -28, 13, ROSE, 0.35);
}
