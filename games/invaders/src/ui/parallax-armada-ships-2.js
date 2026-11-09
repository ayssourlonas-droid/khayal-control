// The rest of Sunset Armada's fleet. The balloon ship of the mid layer: a great envelope of patched canvas,
// roped in a net, glowing where the sun comes through it, a gondola slung beneath on lines with lit
// portholes, tail fins and a propeller that turns in flourish-9.js. And the far fleet of the far layer: the
// same two kinds of ship hull-down in the glare, seen only as dark shapes edged in gold with a lamp or two.
// See parallax-shapes.js for the painter contract. Drawn facing right and mirrored for one that faces left.
import { rgba, lin, rad } from './sprites.js';
import { pick } from '../core/rng.js';
import { TAU } from '../core/math.js';
import { GOLD, EMBER, NIGHT, BRASS, rimLight, rope, flag, pane, poly, toward } from './parallax-armada-kit.js';
import { TEAK, hull } from './parallax-armada-ships.js';

const STRIPES = ['#c8664a', '#a8483a', '#8a4a5a'];

const envelope = (u) => (g, ox = 0, oy = 0) => {
  g.moveTo(0.52 * u + ox, -0.3 * u + oy);
  g.bezierCurveTo(0.5 * u + ox, -0.5 * u + oy, 0.2 * u + ox, -0.52 * u + oy, -0.1 * u + ox, -0.5 * u + oy);
  g.bezierCurveTo(-0.34 * u + ox, -0.49 * u + oy, -0.56 * u + ox, -0.4 * u + oy, -0.6 * u + ox, -0.3 * u + oy);
  g.bezierCurveTo(-0.56 * u + ox, -0.2 * u + oy, -0.34 * u + ox, -0.1 * u + oy, -0.1 * u + ox, -0.09 * u + oy);
  g.bezierCurveTo(0.2 * u + ox, -0.08 * u + oy, 0.5 * u + ox, -0.1 * u + oy, 0.52 * u + ox, -0.3 * u + oy);
  g.closePath();
};

// The balloon ship at (x, y), u long, facing dir.
export function blimp(g, out, rng, L, x, y, u, dir) {
  const sun = toward(x) * dir;
  g.save();
  g.translate(x, y);
  g.scale(dir, 1);
  const env = envelope(u);
  for (const s of [-1, 1]) { // tail fins, then the lines the gondola hangs by
    poly(g, [[-0.5 * u, -0.3 * u], [-0.66 * u, -0.3 * u + s * 0.17 * u], [-0.6 * u, -0.3 * u + s * 0.02 * u]]);
    g.fillStyle = TEAK;
    g.fill();
  }
  for (const k of [-0.3, -0.1, 0.1, 0.3]) rope(g, k * u, -0.1 * u, k * u * 0.8, 0, 0, rgba(NIGHT, 0.85), 1.2);
  g.beginPath();
  env(g);
  g.fillStyle = rad(g, sun * 0.2 * u, -0.34 * u, 0.04 * u, 0.62 * u, [[0, '#fff2cc'], [0.4, rgba('#ffd9a0', 1)], [0.75, rgba('#e8908a', 1)], [1, rgba('#7a4a8a', 1)]]);
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = rgba(NIGHT, 0.3); // the net: meridians and hoops
  g.lineWidth = 1;
  for (let k = -3; k <= 3; k++) {
    g.beginPath();
    g.moveTo(-0.6 * u, -0.3 * u);
    g.quadraticCurveTo(0, -0.3 * u + k * 0.1 * u, 0.52 * u, -0.3 * u);
    g.stroke();
  }
  for (let k = -5; k <= 5; k++) {
    g.beginPath();
    g.ellipse(k * 0.1 * u, -0.3 * u, 0.04 * u, 0.22 * u, 0, 0, TAU);
    g.stroke();
  }
  g.fillStyle = rgba(pick(rng, STRIPES), 0.55); // a broad stripe round the middle, and patches
  g.fillRect(-0.7 * u, -0.34 * u, 1.4 * u, 0.045 * u);
  for (let i = 0; i < 4; i++) {
    const [px, py, pw] = [(rng() - 0.6) * u, (-0.42 + rng() * 0.26) * u, (0.03 + rng() * 0.03) * u];
    g.fillStyle = rgba(pick(rng, ['#f4e4c0', '#c8664a', '#8a4a5a']), 0.6);
    g.fillRect(px, py, pw, pw * 0.8);
    g.strokeStyle = rgba(NIGHT, 0.45);
    g.strokeRect(px, py, pw, pw * 0.8);
  }
  g.fillStyle = lin(g, 0, -0.52 * u, 0, -0.08 * u, [[0, rgba('#ffffff', 0.18)], [0.5, rgba(NIGHT, 0)], [1, rgba(NIGHT, 0.5)]]);
  g.fillRect(-0.7 * u, -0.55 * u, 1.4 * u, 0.5 * u);
  g.restore();
  g.strokeStyle = rgba(NIGHT, 0.9);
  g.lineWidth = 1.6;
  g.beginPath();
  env(g);
  g.stroke();
  rimLight(g, env, sun, 3, '#fff0c8', 0.8);
  const gon = hull(u * 0.55); // the gondola, a small hull slung under the envelope
  g.save();
  g.translate(0.02 * u, 0.05 * u);
  g.beginPath();
  gon(g);
  g.fillStyle = TEAK;
  g.fill();
  g.strokeStyle = rgba(BRASS, 0.95);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-0.27 * 0.55 * u, -0.1 * 0.55 * u);
  g.lineTo(0.34 * 0.55 * u, -0.08 * 0.55 * u);
  g.stroke();
  for (let i = 0; i < 4; i++) pane(g, out, rng, (-0.12 + i * 0.1) * 0.55 * u * 1.6, -0.01 * u, Math.max(2, u * 0.014), '#ffc86a', i % 2 ? 'pulse' : null);
  rimLight(g, gon, sun, 2.2);
  g.restore();
  g.restore();
  out.lights.push({ x: x + dir * sun * 0.3 * u, y: y - 0.42 * u, r: 18, color: '#fff4d0', mode: 'blink', ph: rng(), a: 0.95 }); // a glint on the envelope's crown
  flag(out, x + dir * 0.1 * u, y - 0.5 * u, 0.12 * u, 0.045 * u, -dir, '#c8664a');
  const [lx, ly] = [x + dir * 0.28 * u, y + 0.05 * u];
  out.lights.push({ x: lx, y: ly, r: 30, color: EMBER, mode: 'flicker', ph: rng(), a: 0.9 });
  out.signs.push({ prop: true, x: x - dir * 0.66 * u, y: y - 0.3 * u, r: 0.085 * u, dir, n: 4 }); // behind the tail, between the fins
}

// A far airship, hull-down in the glare: a dark shape in L.fleet with two or three slim sails or a
// balloon, edged in gold, one lamp lit. `u` is its length (80 to 150 px).
export function ghost(g, out, rng, L, x, y, u, dir) {
  const sun = toward(x) * dir;
  g.save();
  g.translate(x, y);
  g.scale(dir, 1);
  g.fillStyle = L.fleet;
  if (rng() < 0.5) {
    const hl = hull(u);
    for (const mx of [-0.15, 0.15]) {
      g.fillRect(mx * u - 0.8, -0.55 * u, 1.6, 0.45 * u);
      poly(g, [[(mx - 0.09) * u, -0.5 * u], [(mx + 0.09) * u, -0.5 * u], [(mx + 0.13) * u, -0.14 * u], [(mx - 0.09) * u, -0.14 * u]]);
      g.fill();
    }
    g.beginPath();
    hl(g);
    g.fill();
    rimLight(g, hl, sun, 2, GOLD, 0.75);
  } else {
    const env = envelope(u * 0.9);
    g.beginPath();
    env(g);
    g.fill();
    g.fillRect(-0.1 * u, -0.08 * u, 0.3 * u, 0.1 * u);
    rimLight(g, env, sun, 2.2, GOLD, 0.75);
  }
  g.restore();
  out.lights.push({ x: x + dir * 0.1 * u, y, r: 16, color: GOLD, mode: 'pulse', ph: rng(), a: 0.7 });
  g.fillStyle = L.color;
}
