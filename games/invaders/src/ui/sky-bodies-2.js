// Sky painters for worlds 5-8 (see sky-bodies.js).
import { W, H, glow, hash, rgba, shade, addGlow, lin } from './sprites.js';
import { blobs, stars, sun, horizonGlow } from './sky-paint.js';
import { glyphAtlas, drawGlyph } from './glyphs.js';
import { WELL } from '../core/kinds.js';
import { TAU } from '../core/math.js';

// A tapered band along points `pts`, `w0` wide at the first and `w1` at the last.
export function taper(g, pts, w0, w1) {
  const left = [];
  const right = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)];
    const [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
    left.push([x - ((by - ay) / len) * w, y + ((bx - ax) / len) * w]);
    right.push([x + ((by - ay) / len) * w, y - ((bx - ax) / len) * w]);
  });
  g.beginPath();
  for (const [x, y] of left) g.lineTo(x, y);
  for (const [x, y] of right.toReversed()) g.lineTo(x, y);
  g.fill();
}

const quad = (x0, y0, cx, cy, x1, y1, n = 20) => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n;
  return [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1];
});

// A cavern roof of bone: ribs curving down from a spine, wet sheen on their edges, drips.
function hive(g) {
  addGlow(g, glow('#2a8a5a'), 960, 1220, 1200, 0.45);
  blobs(g, [[400, 700, 700, '#14382a', 0.35, 0.3], [1500, 760, 800, '#103024', 0.35, 0.3]]);
  for (let pass = 0; pass < 2; pass++) {
    for (let k = -6; k <= 6; k++) {
      const dir = k < 0 ? -1 : 1;
      const x0 = 960 + k * 150;
      const reach = 160 + Math.abs(k) * 22;
      const pts = quad(x0, -40, x0 + dir * reach * 0.9, 150, x0 + dir * reach, 330 + Math.abs(k) * 26);
      g.fillStyle = pass ? '#17241e' : '#0a120e';
      if (pass) taper(g, pts, 46, 6);
      else taper(g, pts.map(([x, y]) => [x + dir * 6, y + 8]), 58, 10);
      if (!pass) continue;
      g.strokeStyle = rgba('#7aa894', 0.35);
      g.lineWidth = 2;
      g.beginPath();
      for (const [x, y] of pts.slice(2, -3)) g.lineTo(x - dir * 12, y);
      g.stroke();
    }
  }
  // the spine: a row of vertebrae
  for (let x = 120; x < W - 100; x += 46) {
    g.fillStyle = '#1c2a24';
    g.beginPath();
    g.ellipse(x, 18 + Math.sin(x * 0.01) * 6, 22, 16, 0, 0, TAU);
    g.fill();
    g.fillStyle = rgba('#8ab8a0', 0.22);
    g.fillRect(x - 10, 10 + Math.sin(x * 0.01) * 6, 20, 3);
  }
  g.strokeStyle = rgba('#1c2a24', 0.9);
  g.lineWidth = 2;
  for (let i = 0; i < 26; i++) { // strands of slime with a drop at the end
    const x = hash(i + 70) * W;
    const len = 60 + hash(i + 71) * 220;
    g.beginPath();
    g.moveTo(x, 30);
    g.quadraticCurveTo(x + 8, len * 0.5, x, len);
    g.stroke();
    addGlow(g, glow('#9ad67a'), x, len + 4, 7, 0.4);
  }
}

// Columns of dim glyphs behind everything, brightest at each run's foot.
function code(g) {
  const dim = glyphAtlas('#1aff5a');
  for (let c = 0; c < 82; c++) {
    const x = c * 23.5 + (hash(c + 80) - 0.5) * 6;
    for (let run = 0; run < 2; run++) {
      const y0 = hash(c * 3 + run + 81) * H * 0.8 - 100;
      const n = 6 + Math.floor(hash(c * 3 + run + 82) * 22);
      const size = 18 + Math.floor(hash(c + 83) * 3) * 4;
      for (let i = 0; i < n; i++) {
        g.globalAlpha = 0.04 + 0.2 * (i / n) ** 2;
        drawGlyph(g, dim, Math.floor(hash(c * 97 + run * 13 + i) * 48), x, y0 + i * size, size);
      }
    }
  }
  g.globalAlpha = 1;
  addGlow(g, glow('#0aff5a'), 960, 1200, 1100, 0.25);
  horizonGlow(g, '#0aff5a', 0.12);
}

// A war sky: smoke banks lit from beneath by fires, a red sun low in the murk.
function warfire(g) {
  addGlow(g, glow('#ff5a1a'), 480, 1160, 1000, 0.6);
  addGlow(g, glow('#ff7a2a'), 1480, 1140, 900, 0.5);
  sun(g, 1450, 420, 58, '#ff6a3a', '#ff3a1a', 6, 0.5);
  for (let i = 0; i < 34; i++) {
    const x = hash(i + 90) * (W + 400) - 200;
    const y = 60 + hash(i + 91) * 520;
    const r = 160 + hash(i + 92) * 240;
    const lit = y > 300 ? 0.4 : 0.15;
    g.globalAlpha = 0.85;
    g.drawImage(glow(shade('#1a1012', hash(i + 93) * 0.1)), x - r, y - r * 0.45, r * 2, r * 0.9);
    g.globalAlpha = 0.7;
    g.drawImage(glow('#140c0e'), x - r * 0.8, y - r * 0.4, r * 1.6, r * 0.7);
    addGlow(g, glow('#ff6a2a'), x, y + r * 0.32, r * 0.7, lit * 0.35, 0.25);
  }
  horizonGlow(g, '#ff6a1a', 0.5, 600);
}

// How strongly the sky's black hole is drawn: on the boss level (the Singularity) it steps back to
// faint lensing, about 35 %, so the boss is the one black hole that reads as the target (ruling
// R29); the bending of the bullets stays visible as its faint arcs. level null: full (the sheet).
export const wellLight = (level) => (level?.boss ? 0.35 : 1);

// The black hole above the formation (the well, 960, 300): its far disk lensed into a halo round
// the shadow, the near disk crossing in front, Doppler-brighter on the left.
const HOLE = { ...WELL, r: 78 };
function blackhole(g, look, level) {
  blobs(g, [[380, 260, 700, '#2a1a5a', 0.12, 0.5], [1500, 420, 800, '#0a2a5a', 0.12, 0.45], [960, 820, 900, '#1a1440', 0.1, 0.4]]);
  stars(g, 520, 61, H, 0.95, false, { x: HOLE.x, y: HOLE.y, r: 210 });
  const { x, y, r } = HOLE;
  const k = wellLight(level);
  addGlow(g, glow('#ffb060'), x, y, 520, 0.35 * k);
  addGlow(g, glow('#ffd8a0'), x, y, 240, 0.55 * k);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { // the lensed halo: the far side of the disk bent over and under
    g.strokeStyle = rgba(i < 8 ? '#fff4e0' : '#ffb868', (0.08 + (i < 8 ? 0.07 : 0)) * k);
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(x, y + 4, r + 8 + i * 2.2, r * 0.9 + i * 2.6, 0, 0, TAU);
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = rgba('#000000', k);
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = k;
  for (let i = 0; i < 18; i++) { // the near disk, edge-on
    g.strokeStyle = lin(g, x - 470, 0, x + 470, 0, [
      [0, rgba('#ff9a4a', 0)], [0.3, rgba('#fff2d8', 0.2)], [0.5, rgba('#ffe0a8', 0.12)],
      [0.75, rgba('#ff9a4a', 0.08)], [1, rgba('#ff6a2a', 0)],
    ]);
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(x, y + 6, 150 + i * 18, 10 + i * 1.6, 0, 0, Math.PI);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  horizonGlow(g, '#3a5aa8', 0.25);
}

export const BODIES2 = { hive, code, warfire, blackhole };
