// What each world bakes into its sky beyond the gradient, one painter per look.body (worlds 1-4;
// sky-bodies-2.js has 5-8, sky-bodies-3.js 9-11, sky-bodies-4.js 12, sky-bodies-5.js 13, sky-bodies-6.js 14, sky-bodies-7.js 15, sky-bodies-8.js 16, sky-bodies-9.js 17, sky-bodies-10.js 18). Painted once per level into the sky canvas; nothing here animates.
import { W, glow, hash, rgba, noise2, addGlow } from './sprites.js';
import { blobs, stars, sun, moon, brush, horizonGlow } from './sky-paint.js';
import { clamp, TAU } from '../core/math.js';
import { BODIES2 } from './sky-bodies-2.js';
import { BODIES3 } from './sky-bodies-3.js';
import { BODIES4 } from './sky-bodies-4.js';
import { BODIES5 } from './sky-bodies-5.js';
import { BODIES6 } from './sky-bodies-6.js';
import { BODIES7 } from './sky-bodies-7.js';
import { BODIES8 } from './sky-bodies-8.js';
import { BODIES9 } from './sky-bodies-9.js';
import { BODIES10 } from './sky-bodies-10.js';

const BAYER = [0, 2, 3, 1]; // 2x2 ordered dither

// A planet in 8 px blocks, lit from the upper left, shading quantised and dithered like an old
// cabinet's artwork. pal: night .. lit.
function pixelPlanet(g, cx, cy, r, block, pal, seed) {
  for (let by = -r; by <= r; by += block) {
    for (let bx = -r; bx <= r; bx += block) {
      const nx = (bx + block / 2) / r;
      const ny = (by + block / 2) / r;
      const rr = nx * nx + ny * ny;
      if (rr > 1) continue;
      const nz = Math.sqrt(1 - rr);
      const band = noise2(bx * 0.6, by * 2.2, 40, seed) * 0.35;
      const l = clamp(-0.55 * nx - 0.5 * ny + 0.68 * nz + band - 0.12, 0, 0.999);
      const d = BAYER[((bx / block) & 1) * 2 + ((by / block) & 1)] / 4;
      g.fillStyle = pal[Math.min(pal.length - 1, Math.floor(l * (pal.length - 1) + d))];
      g.fillRect(cx + bx, cy + by, block, block);
    }
  }
}

function arcade(g) {
  blobs(g, [
    [420, 330, 620, '#3a1a8a', 0.12, 0.6], [1320, 220, 700, '#0a4a7a', 0.1, 0.5],
    [900, 760, 900, '#6a1a7a', 0.12, 0.45], [1700, 600, 500, '#1a2a8a', 0.1],
  ]);
  stars(g, 300, 11, 1000, 1, true);
  addGlow(g, glow('#3affc8'), 1540, 250, 260, 0.35);
  pixelPlanet(g, 1540, 250, 128, 8, ['#06202a', '#0a3a44', '#127060', '#22b088', '#6affc0', '#d8ffe8'], 3);
  // a tilted ring of blocks round the planet; its far half hides behind the disc
  g.fillStyle = 'rgba(255,170,230,0.8)';
  const tilt = -0.32;
  for (let a = 0; a < TAU; a += 0.03) {
    const px = Math.cos(a) * 236;
    const py = Math.sin(a) * 52;
    const x = px * Math.cos(tilt) - py * Math.sin(tilt);
    const y = px * Math.sin(tilt) + py * Math.cos(tilt);
    if (py < 0 && Math.hypot(x, y) < 132) continue;
    g.fillRect(Math.round((1540 + x) / 6) * 6, Math.round((250 + y) / 6) * 6, 6, 6);
  }
  pixelPlanet(g, 1250, 120, 28, 4, ['#3a1440', '#8a3a8a', '#ff9ad8', '#ffe0f4'], 9);
  horizonGlow(g, '#ff3ad8', 0.22);
}

function megacity(g) {
  stars(g, 40, 21, 360, 0.35);
  // a low ceiling of smog, lit from beneath by the city
  blobs(g, [
    [300, 160, 520, '#2a1240', 0.5, 0.35], [980, 120, 640, '#1e0e34', 0.55, 0.3], [1650, 190, 560, '#2a1240', 0.5, 0.35],
    [600, 420, 700, '#4a1440', 0.35, 0.25], [1400, 470, 760, '#5a1a48', 0.35, 0.25],
    [960, 640, 1100, '#8a2a5a', 0.3, 0.25],
  ]);
  addGlow(g, glow('#ff3a8a'), 960, 1180, 1250, 0.55);
  addGlow(g, glow('#ff8a3a'), 1500, 1120, 700, 0.35);
  addGlow(g, glow('#2ae0ff'), 380, 1120, 600, 0.22);
  horizonGlow(g, '#ff4f9a', 0.3);
}

function twinsuns(g) {
  stars(g, 70, 31, 330, 0.5);
  g.globalAlpha = 0.55;
  moon(g, 330, 170, 44, '#f4eef8', '#9a8aa8', '#7a6a88', 4);
  moon(g, 222, 238, 16, '#f0e4e8', '#a08890', '#806870', 8);
  g.globalAlpha = 1;
  // long thin clouds caught by the low suns
  for (let i = 0; i < 9; i++) {
    const y = 260 + hash(i + 40) * 280;
    g.globalAlpha = 0.16 + hash(i + 41) * 0.14;
    g.drawImage(glow(i % 2 ? '#ffc8a8' : '#ffe0c0'), hash(i + 42) * W - 500, y - 10, 900 + hash(i + 43) * 500, 20);
  }
  g.globalAlpha = 1;
  sun(g, 925, 612, 70, '#ffe8a8', '#ff8a3a', 5, 0.55);
  sun(g, 1068, 548, 38, '#ffc080', '#ff5a2a', 4.5, 0.55);
  for (let i = 0; i < 4; i++) addGlow(g, glow('#ffd8a8'), 960, 620 + i * 30, 1100, 0.05, 0.04);
}

function redmoon(g) {
  stars(g, 70, 41, 520, 0.45);
  addGlow(g, glow('#ff2a1a'), 640, 360, 640, 0.65);
  addGlow(g, glow('#ff6a4a'), 640, 360, 300, 0.5);
  moon(g, 640, 360, 205, '#ff7a5a', '#a01818', '#6a0a0a', 17);
  // brush strokes of cloud across the moon and the dusk
  const strokes = [
    [180, 300, 700, 26], [520, 430, 760, 34], [260, 520, 520, 18], [900, 250, 620, 14],
    [1150, 380, 680, 22], [1300, 560, 620, 30], [80, 640, 560, 20], [700, 600, 900, 24],
  ];
  strokes.forEach(([x, y, len, w], i) => brush(g, x, y, len, w, rgba('#0b0607', 0.82 - (i % 3) * 0.12), i + 1));
  horizonGlow(g, '#c83a2a', 0.35, 560);
}

export const BODIES = { arcade, megacity, twinsuns, redmoon, ...BODIES2, ...BODIES3, ...BODIES4, ...BODIES5, ...BODIES6, ...BODIES7, ...BODIES8, ...BODIES9, ...BODIES10 };
