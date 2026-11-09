// What stands on Starlit Archive's floating islands (parallax-archive-2.js): piles of books lying flat
// and rows standing on end, ladders leaning on them, brass reading lamps, rope bridges between the
// islands and lanterns hung under them. Everything is dark against the lamps, its top edges taken by the
// layer's gold rim; the covers show faintly, the gilt on the spines a little plainer. See
// parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { pick } from '../core/rng.js';
import { GOLD, NIGHT, PARCH, poly } from './parallax-archive-kit.js';

const COVERS = ['#3a3aa0', '#8a3a4a', '#2f6a56', '#9a6a2a', '#5a3a8a'];

// A pile of n books lying flat on the ground at (x, y), each a little askew: a cover, the pale block of
// pages showing at one end, gilt bands across the spine, a lit top edge. Returns the top of the pile.
export function pile(g, rng, L, x, y, w, n) {
  let top = y;
  for (let i = 0; i < n; i++) {
    const [bw, bh] = [w * (0.75 + rng() * 0.4), 7 + rng() * 8];
    g.save();
    g.translate(x + (rng() - 0.5) * w * 0.16, top - bh / 2);
    g.rotate((rng() - 0.5) * 0.06);
    g.fillStyle = L.color;
    g.fillRect(-bw / 2, -bh / 2, bw, bh);
    g.fillStyle = rgba(pick(rng, COVERS), 0.5);
    g.fillRect(-bw / 2, -bh / 2, bw, bh);
    g.fillStyle = rgba(PARCH, 0.5); // the leaves, at the end the spine is not
    g.fillRect(bw / 2 - 7, -bh / 2 + 1.4, 7, bh - 2.8);
    g.fillStyle = rgba(NIGHT, 0.4);
    for (let k = 0; k < bh - 3; k += 2.2) g.fillRect(bw / 2 - 7, -bh / 2 + 2 + k, 7, 0.7);
    g.fillStyle = rgba(GOLD, 0.7);
    for (const b of [0.1, 0.17, 0.62, 0.69]) g.fillRect(-bw / 2 + bw * b, -bh / 2, 1.5, bh);
    g.fillStyle = rgba('#fff1c8', 0.26);
    g.fillRect(-bw / 2, -bh / 2, bw, 1.2);
    g.strokeStyle = rgba(NIGHT, 0.7);
    g.lineWidth = 1;
    g.strokeRect(-bw / 2, -bh / 2, bw, bh);
    g.restore();
    top -= bh - 0.6;
  }
  return top;
}

// n books standing side by side from x, the last one fallen against its neighbour: spines banded in
// gilt, a pale label on each.
export function row(g, rng, L, x, y, n) {
  for (let i = 0, at = x; i < n; i++) {
    const [bw, bh] = [5 + rng() * 5, 26 + rng() * 20];
    g.save();
    g.translate(at, y);
    g.rotate(i === n - 1 ? 0.32 : (rng() - 0.5) * 0.05);
    g.fillStyle = L.color;
    g.fillRect(0, -bh, bw, bh);
    g.fillStyle = rgba(pick(rng, COVERS), 0.55);
    g.fillRect(0, -bh, bw, bh);
    g.fillStyle = rgba(GOLD, 0.7);
    for (const b of [0.08, 0.14, 0.88]) g.fillRect(0, -bh * (1 - b), bw, 1.4);
    g.fillStyle = rgba(PARCH, 0.55);
    g.fillRect(1, -bh * 0.7, bw - 2, bh * 0.2);
    g.fillStyle = rgba('#fff1c8', 0.22);
    g.fillRect(0, -bh, bw, 1.2);
    g.strokeStyle = rgba(NIGHT, 0.7);
    g.strokeRect(0, -bh, bw, bh);
    g.restore();
    at += bw + 0.6;
  }
}

// A ladder from its foot (x0, y0) up to where it leans (x1, y1): two rails, a rung every 7 px.
export function ladder(g, x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const [nx, ny] = [(-(y1 - y0) / len) * 3.6, ((x1 - x0) / len) * 3.6];
  g.lineCap = 'butt';
  g.beginPath();
  for (const s of [-1, 1]) {
    g.moveTo(x0 + nx * s, y0 + ny * s);
    g.lineTo(x1 + nx * s, y1 + ny * s);
  }
  for (let d = 5; d < len - 2; d += 7) {
    const [px, py] = [x0 + ((x1 - x0) * d) / len, y0 + ((y1 - y0) * d) / len];
    g.moveTo(px - nx, py - ny);
    g.lineTo(px + nx, py + ny);
  }
  for (const [w, c] of [[3.2, NIGHT], [1.3, rgba('#c8903a', 0.6)]]) {
    g.lineWidth = w;
    g.strokeStyle = c;
    g.stroke();
  }
}

// A brass reading lamp standing on (x, y): a weighted foot, a jointed arm, a shade lit from within, and its
// pool of light laid over whatever is beneath it.
export function readingLamp(g, out, rng, L, x, y) {
  g.beginPath();
  g.ellipse(x, y - 1, 8, 2.6, 0, 0, 6.3);
  g.fillStyle = '#c8902a';
  g.fill();
  g.beginPath();
  g.moveTo(x, y - 2);
  g.lineTo(x + 2, y - 26);
  g.quadraticCurveTo(x + 4, y - 36, x + 11, y - 35);
  for (const [w, c] of [[3.4, NIGHT], [1.6, '#c8902a']]) {
    g.lineWidth = w;
    g.strokeStyle = c;
    g.stroke();
  }
  poly(g, [[x + 3, y - 35], [x + 22, y - 35], [x + 18, y - 44], [x + 7, y - 44]]);
  g.fillStyle = lin(g, x + 3, 0, x + 22, 0, [[0, '#7a5018'], [0.5, '#e8b860'], [1, '#8a5a1a']]);
  g.fill();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, y - 35, 0, y + 12, [[0, rgba(L.lamp, 0.34)], [1, rgba(L.lamp, 0)]]);
  poly(g, [[x + 4, y - 35], [x + 21, y - 35], [x + 44, y + 12], [x - 20, y + 12]]);
  g.fill();
  g.globalCompositeOperation = 'source-over';
  g.beginPath();
  g.ellipse(x + 12.5, y - 35, 8, 2, 0, 0, 6.3);
  g.fillStyle = '#fff2c0';
  g.fill();
  out.lights.push({ x: x + 12.5, y: y - 34, r: 44, color: L.lamp, mode: 'pulse', ph: rng(), a: 0.9 });
  out.lights.push({ x: x + 12.5, y: y - 20, r: 150, color: L.lamp, mode: 'steady', ph: 0, a: 0.2 });
}

// A rope bridge from (xa, ya) to (xb, yb), sagging between: a deck of planks on two ropes, a handrail
// held by posts and upright lines, the ropes lashed to a post at each end.
export function bridge(g, xa, ya, xb, yb) {
  const sag = 12 + (xb - xa) * 0.06;
  const at = (u) => [xa + (xb - xa) * u, ya + (yb - ya) * u + sag * 4 * u * (1 - u)];
  const n = Math.round((xb - xa) / 9);
  g.beginPath();
  for (let i = 0; i <= n; i++) g.lineTo(...at(i / n));
  g.lineWidth = 3;
  g.strokeStyle = NIGHT;
  g.stroke();
  g.lineWidth = 1.2;
  g.beginPath();
  for (let i = 0; i <= n; i++) g.lineTo(at(i / n)[0], at(i / n)[1] - 17); // the handrail
  g.stroke();
  g.beginPath();
  for (let i = 0; i <= n; i += 3) { // and the lines holding it up
    g.moveTo(at(i / n)[0], at(i / n)[1] - 17);
    g.lineTo(at(i / n)[0], at(i / n)[1]);
  }
  g.stroke();
  g.fillStyle = NIGHT;
  for (let i = 0; i <= n; i++) {
    const [x, y] = at(i / n);
    g.fillRect(x - 4, y - 1, 8, 2.6);
  }
  g.fillStyle = rgba('#c8903a', 0.4);
  for (let i = 0; i <= n; i += 2) g.fillRect(at(i / n)[0] - 4, at(i / n)[1] - 1, 8, 1);
  g.fillStyle = NIGHT;
  for (const [x, y] of [[xa, ya], [xb, yb]]) g.fillRect(x - 2.5, y - 24, 5, 28);
}

// A lantern on a chain under an island, burning.
export function lantern(g, out, rng, x, y, len, color) {
  g.fillStyle = NIGHT;
  g.fillRect(x - 0.6, y, 1.2, len);
  g.fillRect(x - 5, y + len, 10, 2);
  g.fillRect(x - 5, y + len + 14, 10, 2);
  g.fillStyle = color;
  g.fillRect(x - 3.4, y + len + 2, 6.8, 12);
  g.fillStyle = '#fff6d0';
  g.fillRect(x - 1.4, y + len + 5, 2.8, 6);
  out.lights.push({ x, y: y + len + 8, r: 40, color, mode: 'flicker', ph: rng(), a: 0.8 });
}

// A banner hanging from the island's lip down its face: cloth in a deep colour on a gilt rod, a pennant's
// swallow-tail, a gilt sigil (a ring and a star) and a fringe, hanging a little askew.
export function banner(g, rng, x, y, h, color) {
  g.save();
  g.translate(x, y);
  g.rotate((rng() - 0.5) * 0.08);
  poly(g, [[-9, 0], [9, 0], [9, h], [0, h - 9], [-9, h]]);
  g.fillStyle = rgba(color, 0.85);
  g.fill();
  g.fillStyle = lin(g, -9, 0, 9, 0, [[0, rgba(NIGHT, 0.5)], [0.6, rgba(NIGHT, 0)], [1, rgba('#ffffff', 0.12)]]);
  g.fill();
  g.strokeStyle = rgba(NIGHT, 0.8);
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = rgba('#e8b860', 0.9);
  g.fillRect(-12, -2, 24, 3);
  g.fillRect(-11, h - 12, 1.6, 9);
  g.fillRect(9.4, h - 12, 1.6, 9);
  g.beginPath();
  g.arc(0, h * 0.4, 4.4, 0, 6.3);
  g.strokeStyle = rgba(GOLD, 0.9);
  g.lineWidth = 1.2;
  g.stroke();
  g.fillStyle = rgba(GOLD, 0.9);
  poly(g, [[0, h * 0.4 - 2.4], [0.8, h * 0.4 - 0.8], [2.4, h * 0.4], [0.8, h * 0.4 + 0.8], [0, h * 0.4 + 2.4], [-0.8, h * 0.4 + 0.8], [-2.4, h * 0.4], [-0.8, h * 0.4 - 0.8]]);
  g.fill();
  g.restore();
}
