// The far layer of Aurora Kingdom: three ranges of glacier peaks, blue in their shadows and snowed
// over, and in front of them the ice castle on its crag, nine crystal towers whose tips catch the
// aurora (lights that follow it) and whose windows burn pale gold. L.window is the windows' colours,
// L.tip the colour the aurora lights the spires with; the mid layer (parallax-ice-2.js) and the near
// one (parallax-ice-3.js) are registered with this one. See parallax-shapes.js for the painter contract.
import { W, rgba, shade, lin, soft } from './sprites.js';
import { pick } from '../core/rng.js';
import { profile, waves } from './parallax-kit.js';
import { peak, obelisk, icicles, lamp, LIT, SHADE, SNOW } from './parallax-ice-kit.js';
import { ICE2 } from './parallax-ice-2.js';
import { ICE3 } from './parallax-ice-3.js';

export const CASTLE_X = 700; // where the castle stands on the screen

// A range of n peaks along the layer standing on `base`, hw half-width and ht height each as [lo, hi].
function range(g, rng, w, base, n, hw, ht, k) {
  for (let i = 0; i < n; i++) {
    const x = (i + 0.1 + rng() * 0.8) * (w / n);
    peak(g, rng, x, base, hw[0] + rng() * (hw[1] - hw[0]), ht[0] + rng() * (ht[1] - ht[0]), k);
  }
  g.fillRect(0, base, w, 400);
}

// Towers of the castle: [dx, width, height, lean], measured from the crag's top.
const TOWERS = [[-215, 38, 120, -3], [-165, 26, 175, 2], [-108, 46, 210, -4], [-52, 16, 238, 1], [0, 74, 262, 0], [56, 14, 230, -2], [112, 44, 205, 4], [166, 28, 170, -2], [222, 38, 118, 3]];

// The rock the castle stands on: a plateau between jagged flanks, frozen waterfalls and strata down its faces.
function crag(g, rng, cx, top, base) {
  const flank = (dir) => Array.from({ length: 7 }, (_, i) => {
    const u = (i + 1) / 7;
    return [cx + dir * (236 + 118 * u ** 1.4 + (rng() - 0.5) * 18), top + (base - top) * u ** 1.5 + (rng() - 0.5) * 8];
  });
  g.beginPath();
  g.moveTo(cx - 236, top);
  for (const p of flank(-1)) g.lineTo(...p);
  g.lineTo(cx + 360, base + 6);
  for (const p of flank(1).toReversed()) g.lineTo(...p);
  g.lineTo(cx + 236, top);
  g.closePath();
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, top, 0, base, [[0, rgba(LIT, 0.34)], [1, rgba(LIT, 0.04)]]);
  g.fillRect(cx - 380, top, 380, base - top);
  g.fillStyle = rgba('#020a18', 0.38);
  g.fillRect(cx, top, 380, base - top);
  g.lineCap = 'round';
  for (let i = 0; i < 30; i++) { // frozen falls pouring over the edge, and strata
    const x = cx - 300 + rng() * 600;
    const y = top + 4 + rng() * (base - top) * 0.6;
    g.strokeStyle = rgba(i % 3 ? '#cfeaff' : '#020a18', i % 3 ? 0.18 + rng() * 0.16 : 0.3);
    g.lineWidth = 1.5 + rng() * 3;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rng() - 0.5) * 10, y + 16 + rng() * 48);
    g.stroke();
  }
  g.restore();
}

// One tower: the obelisk, a ring of balcony, windows up its face, the aurora on its tip.
function tower(g, out, rng, L, cx, top, [dx, w, h, lean]) {
  const x = cx + dx;
  const tip = obelisk(g, x, top + 8, w, h, lean);
  if (w >= 26) {
    for (let y = top - 38, i = 0; y > top - h * 0.62; y -= 46 + rng() * 14, i++) {
      lamp(g, out, rng, x + (rng() - 0.5) * w * 0.3, y, Math.min(11, w * 0.2), Math.min(26, w * 0.5 + 6), pick(rng, L.window), i % 3 ? 'steady' : 'flicker');
    }
    g.fillStyle = rgba('#bfe6ff', 0.4); // the balcony's ring, and the icicles under it
    g.fillRect(x - w / 2 - 5, top - h * 0.36, w + 10, 3);
    icicles(g, rng, x - w / 2 - 4, x + w / 2 + 4, () => top - h * 0.36 + 3, 5, 5, 16, 0.5);
  }
  g.fillStyle = L.color;
  if (h > 190) out.lights.push({ x: tip[0], y: tip[1] + 14, r: 30, color: L.tip, mode: 'aurora', ph: rng(), a: 0.9 });
}

// The castle: walls and bridges between the towers, the keep's great window, the gate.
function castle(g, out, rng, L, cx, top) {
  g.globalAlpha = 0.34; // the aurora-lit air behind it, so its spires stand out against the peaks
  g.drawImage(soft('#9fd8ff'), cx - 340, 0, 680, top + 30);
  g.globalAlpha = 1;
  crag(g, rng, cx, top, top + 120);
  g.fillStyle = L.color;
  g.fillRect(cx - 250, top - 40, 500, 46); // the curtain wall, with ice teeth along its top
  for (let x = cx - 250; x < cx + 246; x += 14) {
    g.beginPath();
    g.moveTo(x, top - 40);
    g.lineTo(x + 5, top - 53 - rng() * 6);
    g.lineTo(x + 10, top - 40);
    g.fill();
  }
  g.fillStyle = lin(g, 0, top - 40, 0, top + 6, [[0, rgba(LIT, 0.3)], [1, rgba('#020a18', 0.3)]]);
  g.fillRect(cx - 250, top - 40, 500, 46);
  g.fillStyle = L.color;
  g.lineCap = 'round';
  for (const [a, b, rise] of [[-165, -108, 150], [-52, 0, 190], [56, 112, 170], [112, 166, 120]]) { // bridges between towers
    g.beginPath();
    g.moveTo(cx + a, top - rise);
    g.quadraticCurveTo(cx + (a + b) / 2, top - rise + 18, cx + b, top - rise);
    g.strokeStyle = L.color;
    g.lineWidth = 7;
    g.stroke();
    g.strokeStyle = rgba(SNOW, 0.38);
    g.lineWidth = 1.5;
    g.stroke();
  }
  for (const t of TOWERS) tower(g, out, rng, L, cx, top, t);
  lamp(g, out, rng, cx, top - 70, 22, 54, L.window[0], 'flicker'); // the great hall
  lamp(g, out, rng, cx - 24, top + 4, 22, 44, L.window[1]); // the gate, lit from within
  g.fillStyle = rgba('#020a18', 0.9);
  g.fillRect(cx - 120, top - 22, 3, 16);
  g.fillRect(cx + 150, top - 22, 3, 16);
  out.lights.push({ x: cx, y: top - 150, r: 120, color: '#9affd6', mode: 'aurora', ph: 0.3, a: 0.16 });
}

function glacier(g, w, h, rng, L, out) {
  const cx = CASTLE_X + (w - W) / 2;
  g.fillStyle = shade(L.color, 0.1);
  range(g, rng, w, 380, 15, [70, 130], [170, 280], 0.45);
  g.fillStyle = shade(L.color, 0.04);
  range(g, rng, w, 420, 13, [90, 170], [190, 340], 0.75);
  for (let i = 0; i < 7; i++) out.lights.push({ x: 120 + rng() * (w - 240), y: 130 + rng() * 120, r: 40 + rng() * 30, color: '#9affd6', mode: 'aurora', ph: rng(), a: 0.18 });
  g.fillStyle = L.color;
  const hills = waves(rng, 3, 0.0032);
  profile(g, w, h, (x) => h * (0.53 + 0.035 * hills(x)));
  castle(g, out, rng, L, cx, 300);
  g.globalCompositeOperation = 'source-atop'; // the feet of the ranges sink into the dark
  g.fillStyle = lin(g, 0, 250, 0, 440, [[0, rgba(SHADE, 0)], [1, rgba(SHADE, 0.55)]]);
  g.fillRect(0, 250, w, h);
  g.globalCompositeOperation = 'source-over';
}

export const ICE = { glacier, ...ICE2, ...ICE3 };
