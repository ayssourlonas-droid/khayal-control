// Barren silhouettes: dunes over a half-buried hull and domed huts (Twin Suns), a frozen planet's
// limb and ice crags (Event Horizon). See parallax-shapes.js for the painter contract.
import { rgba, shade, lin } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { TAU } from '../core/math.js';

// Dunes, and the wedge of a giant ship sunk nose-first in the sand long ago.
function wreck(g, w, h, rng, L) {
  const f = waves(rng, 3, 0.003);
  const top = (x) => h * (0.55 - 0.25 * f(x));
  const x0 = w * (0.3 + rng() * 0.3);
  const y0 = top(x0) + 30;
  g.beginPath();
  g.moveTo(x0 - 340, y0);
  g.lineTo(x0 + 200, y0 - 200);
  g.lineTo(x0 + 260, y0 - 170);
  g.lineTo(x0 + 120, y0);
  g.fill();
  g.strokeStyle = rgba(shade(L.color, -0.4), 0.7);
  g.lineWidth = 2;
  for (let k = 1; k < 6; k++) {
    g.beginPath();
    g.moveTo(x0 - 340 + k * 70, y0 - k * 26 + 26);
    g.lineTo(x0 - 300 + k * 70, y0);
    g.stroke();
  }
  g.fillStyle = L.color;
  profile(g, w, h, top);
}

// Domed huts half in the sand, thin masts with dishes, doorways glowing.
function huts(g, w, h, rng, L, out) {
  const f = waves(rng, 2, 0.004);
  const top = (x) => h * (0.6 - 0.2 * f(x));
  profile(g, w, h, top);
  for (let x = 120; x < w; x += 300 + rng() * 300) {
    const y = top(x) + 8;
    const r = 34 + rng() * 30;
    g.beginPath();
    g.arc(x, y, r, Math.PI, 0);
    g.fill();
    g.fillRect(x + r * 0.9, y - r * 0.5, r * 0.8, r * 0.5);
    out.lights.push({ x: x - r * 0.2, y: y - 8, r: 20, color: '#ffb060', mode: 'steady', ph: 0, a: 0.6 });
    const mx = x + r * 1.6 + 20;
    g.fillRect(mx, y - 120 - rng() * 60, 3, 200);
    g.beginPath();
    g.ellipse(mx + 2, y - 140, 14, 5, -0.3, 0, TAU);
    g.fill();
  }
}

// The curved limb of a frozen planet far below: lit at its edge, banded with cloud.
function limb(g, w, h, rng, L) {
  const top = (x) => h * 0.3 + ((x - w / 2) / w) ** 2 * h * 1.3;
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, shade(L.color, 0.35)], [0.35, L.color], [1, shade(L.color, -0.75)]]);
  profile(g, w, h, top);
  g.globalCompositeOperation = 'source-atop';
  for (let k = 0; k < 7; k++) {
    g.strokeStyle = rgba('#c8dcff', 0.05 + rng() * 0.08);
    g.lineWidth = 3 + rng() * 10;
    g.beginPath();
    for (let x = 0; x <= w; x += 20) g.lineTo(x, top(x) + 16 + k * 26 + Math.sin(x * 0.004 + k) * 6);
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
}

// Ice crags: broad leaning shards, one face catching the light.
function ice(g, w, h, rng, L) {
  profile(g, w, h, (x) => h * 0.72 + Math.sin(x * 0.005) * 12);
  for (let x = -40; x < w + 40; x += 50 + rng() * 120) {
    const sh = h * (0.25 + rng() * 0.6 * L.roughness);
    const sw = 50 + rng() * 110;
    const peak = x + (rng() - 0.3) * sw * 0.6;
    const base = h * 0.76;
    g.fillStyle = L.color;
    g.beginPath();
    g.moveTo(x - sw / 2, base);
    g.lineTo(peak - sw * 0.12, base - sh * 0.8);
    g.lineTo(peak, base - sh);
    g.lineTo(x + sw / 2, base);
    g.fill();
    g.fillStyle = rgba(shade(L.color, 0.5), 0.35);
    g.beginPath();
    g.moveTo(peak, base - sh);
    g.lineTo(peak - sw * 0.12, base - sh * 0.8);
    g.lineTo(x - sw * 0.2, base);
    g.lineTo(peak + sw * 0.05, base);
    g.fill();
  }
}


export const BARREN = { wreck, huts, limb, ice };
