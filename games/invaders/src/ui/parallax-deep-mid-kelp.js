// The kelp of Lantern Deep's mid layer (parallax-deep-mid.js). Two kinds: the back rows are thin dark ribbons
// baked into the silhouette, standing still in the murk; the hero strands in front are only marked here, a
// holdfast of roots and rocks baked at the foot and a sign left for each (kelp: base x/y, height, phase,
// palette), and flourish-deep-sway.js draws the strands themselves swaying with a wave that runs through the
// forest. L.kelp is the strands' colour. See parallax-shapes.js for the painter contract.
import { mix } from './sprites.js';
import { TAU } from '../core/math.js';
import { lump, fur, dot, TEAL } from './parallax-deep-kit-2.js';

export const BACK_ALPHA = 0.5; // how solid the back rows are: the layer's teal rim takes its alpha from them, so it keeps them in the murk
export const STRANDS = 3; // palettes the hero strands come in (flourish-deep-sway-sprites.js KELP_COLORS)

// Rows of ribbons standing back: n strands within `spread` px of x, each up to `tall` px, fraying into blades.
export function backKelp(g, rng, L, x, floor, n, spread, tall) {
  g.save();
  for (let i = 0; i < n; i++) {
    const bx = x + (rng() - 0.5) * spread;
    const by = floor(bx) + 6;
    const hh = tall * (0.45 + rng() * 0.65);
    const [drift, curl, N] = [(rng() - 0.5) * 80, rng() * TAU, 13];
    const pts = Array.from({ length: N + 1 }, (_, j) => {
      const u = j / N;
      return [bx + drift * u * u + Math.sin(u * 4.6 + curl) * 9 * u, by - hh * u];
    });
    const half = (j) => 3 * (1 - j / N) + 0.5;
    g.beginPath();
    pts.forEach(([px, py], j) => (j ? g.lineTo(px - half(j), py) : g.moveTo(px - half(j), py)));
    for (let j = N; j >= 0; j--) g.lineTo(pts[j][0] + half(j), pts[j][1]);
    g.closePath();
    g.fillStyle = mix(L.color, L.kelp, 0.3 + rng() * 0.3);
    g.globalAlpha = BACK_ALPHA;
    g.fill();
    for (let j = 2; j < N - 1; j += 2) { // blades, alternating
      const [px, py] = pts[j];
      const [dir, l] = [j % 4 ? 1 : -1, 12 + 16 * (1 - j / N) + rng() * 8];
      g.beginPath();
      g.moveTo(px, py);
      g.quadraticCurveTo(px + dir * l * 0.8, py - l * 0.1, px + dir * l, py - l * 0.75);
      g.quadraticCurveTo(px + dir * l * 0.3, py - l * 0.5, px, py);
      g.fill();
    }
  }
  g.restore();
}

// A holdfast: the knot of roots and rocks a strand grows from, 14 px across.
function holdfast(g, rng, L, x, y) {
  g.fillStyle = L.color;
  for (let k = 0; k < 4; k++) {
    lump(g, rng, x + (k - 1.5) * 4.6, y - 2 - rng() * 3, 4 + rng() * 3.5, 3 + rng() * 2.5, 0.3, 6);
    g.fill();
  }
  g.save();
  g.lineCap = 'round';
  g.lineWidth = 1.5;
  g.strokeStyle = mix(L.color, L.kelp, 0.7);
  g.beginPath();
  for (let k = 0; k < 6; k++) {
    const dir = (k / 5 - 0.5) * 2;
    g.moveTo(x + dir * 3, y - 3);
    g.quadraticCurveTo(x + dir * 9, y - 1, x + dir * (12 + rng() * 6), y + 3 + rng() * 2);
  }
  g.stroke();
  g.restore();
}

// A stand of n hero strands over `spread` px at x, each with its holdfast, a few rocks and a fringe of growth round
// them; marks every strand for the sway flourish. `floor(x)` is the sea bed's y.
export function stand(g, out, rng, L, x, floor, n, spread, tall = 120) {
  for (let i = 0; i < n; i++) {
    const bx = x + (n > 1 ? i / (n - 1) - 0.5 : 0) * spread + (rng() - 0.5) * 18;
    const by = floor(bx) + 3;
    holdfast(g, rng, L, bx, by);
    out.signs.push({ kelp: true, x: bx, y: by, h: tall + rng() * tall, ph: rng() * TAU, k: Math.floor(rng() * STRANDS) });
  }
  for (let i = 0; i < 4; i++) { // rocks among them, furred
    const [rx, ry] = [x + (rng() - 0.5) * spread * 1.2, 6 + rng() * 9];
    const rock = [rx, floor(rx) - ry * 0.4, ry * 1.6, ry];
    g.fillStyle = L.color;
    lump(g, rng, ...rock, 0.25, 7);
    g.fill();
    fur(g, rng, ...rock, 7, 9, L.kelp, 0.75);
  }
  for (let i = 0; i < 3; i++) { // a few specks of living light down among the stems
    const sx = x + (rng() - 0.5) * spread;
    const sy = floor(sx) - 6 - rng() * 22;
    dot(g, sx, sy, 1.1, TEAL, 0.7);
    out.lights.push({ x: sx, y: sy, r: 9 + rng() * 5, color: TEAL, mode: rng() < 0.3 ? 'blink' : 'pulse', ph: rng(), a: 0.3 });
  }
  g.fillStyle = L.color;
}
