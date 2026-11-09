// The drowned masonry of Lantern Deep's mid layer (parallax-deep-mid.js): a coral arch, its ring broken on one
// side and a pier cracked short, and a chimney of an old tower leaning in the silt, a window in it still
// lit. Flat dark stone with joints drawn at a low alpha, coral growing on the crowns in dusky rose and violet,
// fur of weed along the tops. See parallax-shapes.js for the painter contract.
import { rgba, mix } from './sprites.js';
import { TAU } from '../core/math.js';
import { lump, fur, lit, spark, coralTree, crust, pane, tint, STONE, ROSE, VIOLET, TEAL } from './parallax-deep-kit-2.js';

// An arch of width w and height h standing on the bed at (x, fy). The ring is broken a little right of its
// crown, the right pier cracked short, blocks lie where they fell.
export function arch(g, out, rng, L, x, fy, w, h) {
  const [ro, a1] = [w / 2, Math.PI * 1.7];
  const ri = ro * 0.6;
  const cy = fy - (h - ro);
  g.fillStyle = L.color;
  g.beginPath();
  g.arc(x, cy, ro, Math.PI, a1);
  g.arc(x, cy, ri, a1, Math.PI, true);
  g.closePath();
  g.fill();
  g.fillRect(x - ro, cy, ro - ri, fy - cy);
  g.beginPath(); // the right pier, cracked off short in steps
  g.moveTo(x + ri, fy);
  [[x + ri, cy + 34], [x + ri + 9, cy + 26], [x + ri + 14, cy + 42], [x + ro - 7, cy + 30], [x + ro, cy + 38], [x + ro, fy]].forEach(([px, py]) => g.lineTo(px, py));
  g.closePath();
  g.fill();
  g.fillRect(x - ro - 8, fy - 13, ro - ri + 14, 13); // plinths
  g.fillRect(x + ri - 6, fy - 13, ro - ri + 14, 13);
  g.save(); // joints: the ring's voussoirs and the piers' courses
  g.strokeStyle = rgba(STONE, 0.15);
  g.lineWidth = 1;
  g.beginPath();
  for (let a = Math.PI + 0.12; a < a1; a += 0.16) {
    g.moveTo(x + Math.cos(a) * ri, cy + Math.sin(a) * ri);
    g.lineTo(x + Math.cos(a) * ro, cy + Math.sin(a) * ro);
  }
  g.moveTo(x - ro + 7, cy);
  g.arc(x, cy, ro - 7, Math.PI, a1);
  for (let y = cy + 12; y < fy - 13; y += 15) {
    g.moveTo(x - ro, y);
    g.lineTo(x - ri, y);
    g.moveTo(x + ri, y + 6);
    g.lineTo(x + ro, y + 6);
  }
  g.stroke();
  g.restore();
  lit(g, x, cy, ro, ro, L.rim, 0.24, Math.PI * 1.05, Math.PI * 1.5);
  for (const [a, tintCol] of [[1.22, ROSE], [1.42, VIOLET], [1.6, ROSE]]) { // coral on the crown, growing outward
    const [px, py] = [x + Math.cos(Math.PI * a) * ro, cy + Math.sin(Math.PI * a) * ro];
    coralTree(g, rng, px, py + 2, Math.PI * a + (rng() - 0.5) * 0.4, 13 + rng() * 6, tint(L, tintCol, 0.5), 0.8, 3);
    if (a > 1.4) spark(g, out, rng, px + Math.cos(Math.PI * a) * 20, py + Math.sin(Math.PI * a) * 20, tintCol, 11, 0.26);
  }
  fur(g, rng, x, cy, ro, ro, 22, 10, mix(L.kelp, '#38d6b8', 0.2), 0.7, Math.PI * 1.02, a1);
  for (let k = 0; k < 4; k++) { // blocks that fell
    const [bx, bw] = [x + ri + 24 + k * 15 + rng() * 8, 9 + rng() * 9];
    g.fillStyle = L.color;
    g.fillRect(bx, fy - bw * 0.6, bw, bw * 0.6);
    lit(g, bx + bw / 2, fy - bw * 0.3, bw / 2, bw * 0.3, L.rim, 0.18);
  }
  crust(g, rng, x - ro, fy - 30, x - ri, fy - 30, 8, 0.22);
}

// The chimney of a sunken tower: a tapering shaft of stone courses (h tall, w across at the foot) leaning
// `lean` rad, its top broken, a lit flue in it, weed and a coral on the crown.
export function chimney(g, out, rng, L, x, fy, w, h, lean) {
  const [c, s] = [Math.cos(lean), Math.sin(lean)];
  const half = (y) => w * (0.5 - 0.14 * (y / h)); // half the width y px up the shaft
  g.save();
  g.translate(x, fy);
  g.rotate(lean);
  g.fillStyle = L.color;
  g.beginPath();
  g.moveTo(-w * 0.5, 4);
  g.lineTo(-half(h * 0.5), -h * 0.5);
  g.lineTo(-half(h), -h);
  [[-0.2, -12], [-0.06, 4], [0.1, -16], [0.26, -3]].forEach(([u, d]) => g.lineTo(w * u, -h + d)); // the broken top
  g.lineTo(half(h), -h + 6);
  g.lineTo(half(h * 0.5), -h * 0.5);
  g.lineTo(w * 0.5, 4);
  g.closePath();
  g.fill();
  g.fillRect(-w * 0.64, -13, w * 1.28, 17); // the plinth it stands on
  g.strokeStyle = rgba(STONE, 0.15);
  g.lineWidth = 1;
  g.beginPath();
  for (let i = 0, y = 26; y < h - 6; i++, y += 15) { // courses, the joints between stones shifted on every other one
    g.moveTo(-half(y), -y);
    g.lineTo(half(y), -y);
    for (const u of i % 2 ? [0] : [-0.2, 0.2]) {
      g.moveTo(u * w, -y);
      g.lineTo(u * w, -y - 15);
    }
  }
  g.stroke();
  const wy = -h * 0.55; // the flue: a dark arched opening with a pane of light behind it
  g.fillStyle = rgba('#000000', 0.5);
  g.beginPath();
  g.moveTo(-w * 0.12, wy + h * 0.1);
  g.lineTo(-w * 0.12, wy);
  g.arc(0, wy, w * 0.12, Math.PI, TAU);
  g.lineTo(w * 0.12, wy + h * 0.1);
  g.closePath();
  g.fill();
  g.restore();
  const at = (lx, ly) => [x + lx * c - ly * s, fy + lx * s + ly * c];
  pane(g, out, rng, ...at(0, wy + h * 0.02), 3.2, L.lamp, 'pulse', 0.36);
  g.save();
  g.translate(x, fy);
  g.rotate(lean);
  lit(g, 0, -h * 0.5, half(h * 0.5), h * 0.5, L.rim, 0.2, Math.PI * 1.05, Math.PI * 1.35);
  fur(g, rng, 0, -h, w * 0.3, 8, 14, 12, mix(L.kelp, '#38d6b8', 0.2), 0.7);
  coralTree(g, rng, w * 0.12, -h + 2, -Math.PI / 2 + 0.3, 11, tint(L, VIOLET, 0.5), 0.8, 3);
  crust(g, rng, -half(30), -30, half(30), -30, 6, 0.2);
  g.restore();
  const [tx, ty] = at(w * 0.12, -h - 16);
  spark(g, out, rng, tx, ty, TEAL, 10, 0.26);
}

// A rubble mound where a wall fell: lumps of stone with weed, for the feet of the arch and the chimney.
export function rubble(g, rng, L, x, fy, w) {
  for (let i = 0; i < 5; i++) {
    const [rx, ry] = [x + (rng() - 0.5) * w, 4 + rng() * 6];
    g.fillStyle = L.color;
    lump(g, rng, rx, fy - ry * 0.4, ry * 1.5, ry, 0.3, 6);
    g.fill();
    fur(g, rng, rx, fy - ry * 0.4, ry * 1.5, ry, 4, 7, L.kelp, 0.6);
  }
}
