// Silhouette painters for the parallax layers, one per layer kind (adapted from Barrage). Each fills
// `g` (w x h, the band standing on the frame's bottom) in the layer colour; `rng` is seeded, `out`
// collects lights ({ x, y, r, color, mode, ph, a? }) and sign frames for the flourishes.
import { rgba, shade, lin } from './sprites.js';
import { pick } from '../core/rng.js';
import { profile, waves, ridgeTop } from './parallax-kit.js';
import { CITY } from './parallax-city.js';
import { WILD } from './parallax-wild.js';
import { BARREN } from './parallax-barren.js';
import { HARBOUR } from './parallax-harbour.js';
import { GOTHIC } from './parallax-gothic.js';
import { ICE } from './parallax-ice.js';
import { ARCHIVE } from './parallax-archive.js';
import { ARMADA } from './parallax-armada.js';
import { CARNIVAL } from './parallax-carnival.js';
import { DEEP } from './parallax-deep.js';
import { GLASS } from './parallax-glass.js';
import { STORM } from './parallax-storm.js';

// Flat-topped buttes with steep sides and a talus skirt.
function mesas(g, w, h, rng, L) {
  const base = waves(rng, 2, 0.004);
  profile(g, w, h, (x) => h * (0.78 + 0.06 * base(x)));
  for (let x = rng() * 120; x < w; x += 260 + rng() * 360) {
    const top = h * (0.08 + rng() * 0.45 * (0.5 + L.roughness));
    const wd = 120 + rng() * 300;
    const lean = (rng() - 0.5) * 30;
    g.beginPath();
    g.moveTo(x - wd * 0.2, h * 0.85);
    g.lineTo(x + 6, top + 20);
    g.lineTo(x + 18 + lean, top);
    g.lineTo(x + wd - 18 + lean, top + rng() * 10);
    g.lineTo(x + wd - 4, top + 26);
    g.lineTo(x + wd * 1.25, h * 0.85);
    g.fill();
    g.fillStyle = rgba(shade(L.color, -0.3), 0.3); // strata on the face
    for (let k = 1; k < 3; k++) g.fillRect(x + 12, top + k * (h * 0.85 - top) * 0.3, wd - 18, 2);
    g.fillStyle = L.color;
  }
}

// Stepped blocks on a 16 px grid, with pixel windows: a city in an old cabinet's art.
function blocks(g, w, h, rng, L, out) {
  for (let x = 0; x < w; ) {
    const bw = 48 + Math.floor(rng() * 6) * 16;
    const bh = Math.round((h * (0.3 + rng() * 0.65)) / 16) * 16;
    g.fillStyle = L.color;
    g.fillRect(x, h - bh, bw, bh);
    if (rng() < 0.4) g.fillRect(x + 16, h - bh - 32, bw - 32, 32);
    for (let wy = h - bh + 16; wy < h - 8; wy += 24) {
      for (let wx = x + 8; wx < x + bw - 8; wx += 16) {
        if (rng() > 0.18) continue;
        const c = pick(rng, L.lights);
        g.fillStyle = rgba(c, 0.55 + rng() * 0.4);
        g.fillRect(wx, wy, 8, 8);
        if (rng() < 0.08) out.lights.push({ x: wx + 4, y: wy + 4, r: 14, color: c, mode: 'pulse', ph: rng(), a: 0.6 });
      }
    }
    x += bw;
  }
}

// A flat floor whose top is one glowing line (the arcade's ground line).
function ground(g, w, h, rng, L, out) {
  g.fillRect(0, h * 0.3, w, h);
  g.fillStyle = L.line;
  g.fillRect(0, h * 0.3, w, 4);
  for (let x = 40; x < w; x += 180 + rng() * 120) out.lights.push({ x, y: h * 0.3 + 2, r: 34, color: L.line, mode: 'pulse', ph: rng(), a: 0.5 });
}

// Ink-wash peaks: tall and sharp, fading into mist at their feet, with dry-brush streaks.
function ink(g, w, h, rng, L) {
  const top = ridgeTop(rng, w, h, L.roughness, 0.25, 2.2);
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, L.color], [0.55, L.color], [1, rgba(L.color, L.mist ?? 0.25)]]);
  profile(g, w, h, top);
  g.globalCompositeOperation = 'source-atop';
  g.strokeStyle = rgba(shade(L.color, -0.5), 0.35);
  for (let i = 0; i < 160; i++) {
    const x = rng() * w;
    const y = top(x) + 6 + rng() * 40;
    g.lineWidth = 1 + rng() * 2;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rng() - 0.5) * 30, y + 30 + rng() * 90);
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
}

const GENERIC = {
  mountains: (g, w, h, rng, L) => profile(g, w, h, ridgeTop(rng, w, h, L.roughness)),
  dunes: (g, w, h, rng) => {
    const f = waves(rng, 3, 0.003);
    profile(g, w, h, (x) => h * (0.42 - 0.34 * f(x)));
  },
  mesas, blocks, ground, ink,
};

export function paintLayer(g, w, h, rng, L, out) {
  g.fillStyle = L.color;
  const paint = GENERIC[L.kind] ?? CITY[L.kind] ?? WILD[L.kind] ?? BARREN[L.kind] ?? HARBOUR[L.kind] ?? GOTHIC[L.kind] ?? ICE[L.kind] ?? ARCHIVE[L.kind] ?? ARMADA[L.kind] ?? CARNIVAL[L.kind] ?? DEEP[L.kind] ?? GLASS[L.kind] ?? STORM[L.kind];
  paint(g, w, h, rng, L, out);
}
