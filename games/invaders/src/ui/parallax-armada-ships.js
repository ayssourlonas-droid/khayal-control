// The brass-and-canvas airships of Sunset Armada's mid layer (the balloon ships are in -ships-2.js). The
// sailer: a dark teak hull with a high stern castle and a forecastle, brass bands, gun ports and a row of
// portholes, lit windows in the stern, two or three masts with patched canvas sails that glow where the
// sun shines through them, a jib, rigging from the mastheads, pennants flying from them (live, flourish-9.js), lanterns and a propeller at the
// stern, on the castle, whose blades turn in flourish-9.js (a sign marks the hub). See parallax-shapes.js for the painter
// contract. Drawn facing right and mirrored for a ship that faces left.
import { rgba, lin } from './sprites.js';
import { pick } from '../core/rng.js';
import { GOLD, EMBER, NIGHT, BRASS, CANVAS, rimLight, rope, flag, pane, poly, toward } from './parallax-armada-kit.js';

export const TEAK = '#2a1a1c';
const PATCHES = ['#c8664a', '#a8483a', '#f4e4c0', '#d89a5a', '#8a4a5a'];

// The hull's outline as a builder (see rimLight), u its length.
export const hull = (u) => (g, ox = 0, oy = 0) => {
  const p = (x, y) => [x * u + ox, y * u + oy];
  const q = (cx, cy, x, y) => g.quadraticCurveTo(...p(cx, cy), ...p(x, y));
  g.moveTo(...p(-0.5, -0.19));
  g.lineTo(...p(-0.27, -0.19));
  g.lineTo(...p(-0.27, -0.1));
  g.lineTo(...p(0.34, -0.08));
  q(0.5, -0.07, 0.6, -0.17);
  q(0.56, -0.04, 0.46, 0.03);
  q(0.3, 0.1, 0.02, 0.12);
  q(-0.3, 0.12, -0.46, 0.05);
  g.lineTo(...p(-0.5, -0.02));
  g.closePath();
};

// A sail from its yard (x0..x1 at y0) down to its foot at y1, belly px out to the bow: canvas glowing
// toward the sun, seamed and reefed, a few patches stitched on, its sunward edge gilt.
function sail(g, rng, L, x0, x1, y0, y1, belly, dir) {
  const build = (c, ox = 0, oy = 0) => {
    c.moveTo(x0 + ox, y0 + oy);
    c.lineTo(x1 + ox, y0 + oy);
    c.quadraticCurveTo(x1 + belly + ox, (y0 + y1) / 2 + oy, x1 + belly * 0.3 + ox, y1 + oy);
    c.quadraticCurveTo((x0 + x1) / 2 + ox, y1 + belly * 0.4 + oy, x0 + ox, y1 + oy);
    c.quadraticCurveTo(x0 + belly * 0.7 + ox, (y0 + y1) / 2 + oy, x0 + ox, y0 + oy);
  };
  g.beginPath();
  build(g);
  g.fillStyle = lin(g, x0, 0, x1 + belly, 0, dir > 0 ? [[0, rgba('#8a5a8a', 0.95)], [0.5, rgba(L.sail, 0.95)], [1, rgba('#ffe2a8', 1)]] : [[0, rgba('#ffe2a8', 1)], [0.5, rgba(L.sail, 0.95)], [1, rgba('#8a5a8a', 0.95)]]);
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = rgba(NIGHT, 0.32);
  g.lineWidth = 1;
  const n = Math.max(2, Math.round((x1 - x0) / 11));
  for (let i = 1; i < n; i++) { // seams
    const sx = x0 + ((x1 - x0) * i) / n;
    g.beginPath();
    g.moveTo(sx, y0);
    g.quadraticCurveTo(sx + belly * 0.9, (y0 + y1) / 2, sx + belly * 0.25, y1);
    g.stroke();
  }
  g.setLineDash([3, 3]);
  for (const k of [0.34, 0.66]) { // reef bands
    g.beginPath();
    g.moveTo(x0, y0 + (y1 - y0) * k);
    g.lineTo(x1 + belly, y0 + (y1 - y0) * k);
    g.stroke();
  }
  g.setLineDash([]);
  for (let i = 0; i < 3; i++) { // patches
    const [px, py, pw] = [x0 + (x1 - x0) * rng() * 0.7, y0 + (y1 - y0) * (0.12 + rng() * 0.6), 6 + rng() * 8];
    g.fillStyle = rgba(pick(rng, PATCHES), 0.7);
    g.fillRect(px, py, pw, pw * 0.8);
    g.strokeStyle = rgba(NIGHT, 0.5);
    g.strokeRect(px, py, pw, pw * 0.8);
  }
  g.restore();
  g.strokeStyle = rgba(NIGHT, 0.85);
  g.lineWidth = 1.3;
  g.beginPath();
  build(g);
  g.stroke();
  rimLight(g, build, dir, 2.2, '#fff0c8', 0.7);
}

// Everything on a ship at (x, y), u long, facing dir, tilted by `tilt`; opts.masts is how many masts.
export function sailer(g, out, rng, L, x, y, u, dir, opts = {}) {
  const tilt = (rng() - 0.5) * 0.06;
  const [c, s] = [Math.cos(tilt), Math.sin(tilt)];
  const at = (lx, ly) => [x + dir * (lx * c - ly * s), y + lx * s + ly * c]; // a point of the ship in layer px
  const sun = toward(x) * dir; // the sun is behind: the lit flank is the one facing it, in the ship's own frame
  g.save();
  g.translate(x, y);
  g.scale(dir, 1);
  g.rotate(tilt);
  const build = hull(u);
  const masts = opts.masts ?? 2;
  const mastX = masts === 3 ? [-0.2, 0.06, 0.3] : [-0.12, 0.2];
  const tops = mastX.map((_, i) => -(0.5 + (i % 2) * 0.1) * u);
  rope(g, 0.6 * u, -0.17 * u, mastX[masts - 1] * u, tops[masts - 1] - 0.2 * u, 3, rgba(NIGHT, 0.85), 1.3); // the stays from the bowsprit and the stern
  rope(g, -0.5 * u, -0.19 * u, mastX[0] * u, tops[0] - 0.2 * u, 3, rgba(NIGHT, 0.85), 1.3);
  mastX.forEach((mx, i) => {
    const top = tops[i];
    g.fillStyle = TEAK;
    g.fillRect(mx * u - 1.8, top, 3.6, -top - 0.08 * u);
    sail(g, rng, L, (mx - 0.1) * u, (mx + 0.1) * u, top + 0.03 * u, -0.17 * u, 0.06 * u, sun);
    sail(g, rng, L, (mx - 0.07) * u, (mx + 0.07) * u, top - 0.19 * u, top - 0.02 * u, 0.04 * u, sun); // the topsail
    g.fillStyle = TEAK;
    g.fillRect((mx - 0.1) * u, top + 0.02 * u, 0.2 * u, 3); // the yards
    g.fillRect((mx - 0.07) * u, top - 0.2 * u, 0.14 * u, 2.6);
    const [gx, gy] = at((mx + 0.1 * sun) * u, top + 0.03 * u); // the sun glinting off the yard's brass tip, now and then
    out.lights.push({ x: gx, y: gy, r: 15, color: '#fff4d0', mode: 'blink', ph: rng(), a: 0.95 });
    flag(out, ...at(mx * u, top - 0.2 * u), 0.12 * u, 0.045 * u, -dir, pick(rng, PATCHES));
    g.fillStyle = rgba(GOLD, 0.9);
    g.beginPath();
    g.arc(mx * u, top - 0.21 * u, 2.4, 0, 6.3); // the truck at the masthead
    g.fill();
    for (const k of [0.3, 0.5, 0.7]) rope(g, mx * u - 3, top + (-top - 0.1 * u) * k, (mx - 0.1 * (1 - k)) * u - 6, -0.1 * u, 0, rgba(NIGHT, 0.5), 0.8); // shrouds
    if (i < masts - 1) rope(g, mx * u, top - 0.2 * u, mastX[i + 1] * u, tops[i + 1] - 0.16 * u, 4, rgba(NIGHT, 0.7), 0.9);
  });
  poly(g, [[0.6 * u, -0.17 * u], [mastX[masts - 1] * u + 3, -0.46 * u], [0.5 * u, -0.1 * u]]); // the jib
  g.fillStyle = rgba(CANVAS, 0.92);
  g.fill();
  g.strokeStyle = rgba(NIGHT, 0.8);
  g.lineWidth = 1.2;
  g.stroke();
  g.beginPath();
  build(g);
  g.fillStyle = TEAK;
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, -0.19 * u, 0, 0.12 * u, [[0, rgba(GOLD, 0.2)], [0.45, rgba('#000000', 0)], [1, rgba(EMBER, 0.34)]]); // the sea's light under the keel
  g.fillRect(-0.5 * u, -0.2 * u, 1.2 * u, 0.4 * u);
  g.strokeStyle = rgba('#000000', 0.4);
  g.lineWidth = 1;
  for (const k of [-0.04, 0, 0.04, 0.08]) { // planking
    g.beginPath();
    g.moveTo(-0.5 * u, k * u);
    g.lineTo(0.6 * u, (k - 0.06) * u);
    g.stroke();
  }
  g.restore();
  g.strokeStyle = rgba(BRASS, 0.95); // the brass band along the rail
  g.lineWidth = 2.2;
  g.beginPath();
  g.moveTo(-0.27 * u, -0.1 * u);
  g.lineTo(0.34 * u, -0.08 * u);
  g.stroke();
  for (let i = 0; i < 6; i++) { // portholes, a few of them burning
    const [px, py] = [(-0.18 + i * 0.1) * u, (-0.02 + i * 0.002) * u];
    pane(g, out, rng, px, py, Math.max(2, u * 0.014), '#ffc86a', i % 2 ? 'pulse' : null);
  }
  g.fillStyle = rgba('#000000', 0.55);
  for (let i = 0; i < 4; i++) g.fillRect((0.04 + i * 0.1) * u, 0.045 * u, 0.05 * u, 0.026 * u); // gun ports
  for (const wy of [-0.15, -0.115]) pane(g, out, rng, -0.4 * u, wy * u, Math.max(2.2, u * 0.016), '#ffd890', 'pulse'); // stern windows
  rimLight(g, build, sun, 2.6);
  g.restore();
  for (const [lx, ly] of [[-0.5 * u, -0.19 * u], [0.6 * u, -0.17 * u]]) { // lanterns at the stern and the bow
    const [wx, wy] = at(lx, ly + 6);
    out.lights.push({ x: wx, y: wy, r: 34, color: EMBER, mode: 'flicker', ph: rng(), a: 0.9 });
  }
  const [px, py] = at(-0.53 * u, -0.14 * u);
  out.signs.push({ prop: true, x: px, y: py, r: 0.075 * u, dir, n: 3 + (opts.masts ?? 2) % 2 });
}
