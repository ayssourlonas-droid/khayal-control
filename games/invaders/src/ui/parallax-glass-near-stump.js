// The stump of a carved arch in the corner of Glass Cathedral's near layer (parallax-glass-near.js, the other pieces are in
// parallax-glass-near-parts.js): dark stone with the dawn's rim on its right-hand edges, behind the ship and the bullets.
import { rgba } from './sprites.js';
import { TAU } from '../core/math.js';
import { trace, toward, rimLight, ribArc, ragged, DAWN } from './parallax-glass-kit.js';

// The stump of a carved arch at x (a cluster of piers w wide and h tall on a stepped plinth, its foot on y): the left half snapped
// off ragged, the right half still carrying its capital of carved leaves and the springing of an arch that rises out of it
// to the right and breaks off, with blocks fallen at its foot.
export function stump(g, out, rng, L, x, y, w, h) {
  const [hw, top] = [w / 2, y - h];
  const cap = top + 30; // the standing capital's top
  g.fillStyle = L.color;
  const snap = ragged(rng, x - hw, x + hw * 0.1, top + 96, 12, 8); // the snapped left half's edge, drawn once so every pass of body() agrees
  const body = (c, ox = 0, oy = 0) => trace(c, [[x - hw - 16, y], [x - hw - 16, y - 12], [x - hw - 7, y - 12], [x - hw - 7, y - 26], [x - hw, y - 26],
    ...snap, [x + hw * 0.1, cap + 16], [x + hw * 0.18, cap + 14], [x + hw * 0.18, cap + 8], [x + hw * 1.25, cap + 8], [x + hw * 1.25, cap + 22], [x + hw * 0.9, cap + 44],
    [x + hw, y - 26], [x + hw + 7, y - 26], [x + hw + 7, y - 12], [x + hw + 16, y - 12], [x + hw + 16, y]], ox, oy);
  g.beginPath();
  body(g);
  g.fill();
  rimLight(g, body, toward(x), 2.6, DAWN, 0.55);
  g.strokeStyle = rgba('#c8a0d8', 0.13); // the shafts of the cluster
  g.lineWidth = 1.4;
  g.beginPath();
  for (const dx of [-hw * 0.5, 0, hw * 0.5]) {
    g.moveTo(x + dx, y - 28);
    g.lineTo(x + dx, top + 108 - (dx > 0 ? 80 : 0));
  }
  g.stroke();
  g.fillStyle = rgba('#c8a0d8', 0.12); // carved leaves on the capital: a row of lobes
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.ellipse(x + hw * (0.34 + i * 0.26), cap + 28, 7, 13, (i - 1.5) * 0.12, 0, TAU);
    g.fill();
  }
  g.save(); // the springing of the arch, broken off
  g.strokeStyle = L.color;
  g.lineWidth = 30;
  g.lineCap = 'butt';
  g.beginPath();
  g.moveTo(x + hw * 0.7, cap + 14);
  ribArc(g, x + hw * 0.7, cap + 4, 96, 1, 0.58, 0.62);
  g.stroke();
  g.strokeStyle = rgba(DAWN, 0.3);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x + hw * 0.7 + 12, cap - 10);
  ribArc(g, x + hw * 0.7 + 12, cap - 10, 96, 1, 0.56, 0.62);
  g.stroke();
  g.restore();
  g.fillStyle = L.color;
  for (let i = 0; i < 5; i++) g.fillRect(x + hw + 22 + i * 22 + rng() * 8, y - 8 - rng() * 14, 14 + rng() * 14, 12 + rng() * 6);
}
