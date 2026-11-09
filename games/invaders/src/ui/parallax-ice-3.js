// The near layer of Aurora Kingdom: black water at the foot of the screen with floes of ice drifting in
// three rows, wind-carved snowdrifts piled at its sides, and on a rock of ice at the right a frozen
// lighthouse, its lantern lit. The water's shimmer and the lighthouse beam are flourishes
// (flourish-5.js), which find the surface and the lantern in the layer's signs. L.lamp is the lantern's
// colour. See parallax-shapes.js for the painter contract.
import { rgba, lin } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { icicles, lamp, LIT, SHADE, SNOW } from './parallax-ice-kit.js';

const SURFACE = 0.49; // the water's surface, as a share of the layer's height
const TOWER_X = 1760; // layer-local x of the lighthouse

// A floe on the water, wd wide with its top surface at y and th thick: a trapezoid tapering under the
// water, ragged on top with a hummock or two of snow, its front face blue in its depths with bubbles
// frozen in it and cracks through it, and a thin line of light where it meets the water.
function floe(g, rng, x, y, wd, th) {
  const n = Math.max(4, Math.round(wd / 46));
  const top = Array.from({ length: n + 1 }, (_, i) => [x + (wd * i) / n + (rng() - 0.5) * 12, y + (rng() - 0.5) * 4 - (rng() < 0.22 ? 5 + rng() * 9 : 0)]);
  const bot = [[x + 8 + rng() * 16, y + th], [x + wd * 0.3, y + th + 3 + rng() * 4], [x + wd * 0.62, y + th + rng() * 3], [x + wd - 8 - rng() * 16, y + th]];
  g.beginPath();
  g.moveTo(x - 4 - rng() * 6, y + th * 0.35);
  for (const p of top) g.lineTo(...p);
  g.lineTo(x + wd + 4 + rng() * 6, y + th * 0.4);
  for (const p of bot.toReversed()) g.lineTo(...p);
  g.closePath();
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, y, 0, y + th, [[0, rgba(LIT, 0.55)], [0.6, rgba('#2a74b8', 0.4)], [1, rgba(SHADE, 0.5)]]);
  g.fillRect(x - 12, y - 16, wd + 24, th + 24);
  g.fillStyle = rgba(SNOW, 0.85); // the snow on top, its lower edge ragged
  g.beginPath();
  g.moveTo(x - 12, y - 20);
  for (let i = 0; i <= 16; i++) g.lineTo(x - 12 + ((wd + 24) * i) / 16, y + 1 + rng() * 4);
  g.lineTo(x + wd + 12, y - 20);
  g.fill();
  for (let i = 0; i < wd / 22; i++) { // bubbles frozen in the face
    g.beginPath();
    g.arc(x + rng() * wd, y + th * (0.45 + rng() * 0.45), 0.8 + rng() * 1.5, 0, 6.3);
    g.fillStyle = rgba('#e8f8ff', 0.35);
    g.fill();
  }
  g.strokeStyle = rgba('#031a3a', 0.6);
  g.lineWidth = 1.2;
  g.beginPath();
  for (let i = 0; i < wd / 80; i++) {
    const cx = x + rng() * wd;
    g.moveTo(cx, y + 3);
    g.lineTo(cx + (rng() - 0.5) * 10, y + th * 0.5);
    g.lineTo(cx + (rng() - 0.5) * 14, y + th);
  }
  g.stroke();
  g.restore();
  g.beginPath();
  for (const [px, py] of [bot[0], bot[1], bot[2], bot[3]]) g.lineTo(px, py + 1);
  g.strokeStyle = rgba('#7ad0ff', 0.28);
  g.lineWidth = 1.4;
  g.stroke();
}

// A drift: a long snow bank with a wind-carved crest, bluish where the aurora reaches it.
function drift(g, rng, x0, x1, base, hgt) {
  const crest = waves(rng, 3, 0.012);
  const top = (x) => {
    const u = (x - x0) / (x1 - x0);
    return base - hgt * Math.sin(Math.PI * u) ** 0.8 * (0.8 + 0.2 * crest(x));
  };
  g.beginPath();
  g.moveTo(x0, base + 80);
  for (let x = x0; x <= x1; x += 6) g.lineTo(x, top(x));
  g.lineTo(x1, base + 80);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, base - hgt, 0, base + 10, [[0, rgba(SNOW, 0.6)], [0.5, rgba(LIT, 0.22)], [1, rgba(SHADE, 0.3)]]);
  g.fillRect(x0, base - hgt, x1 - x0, hgt + 80);
  g.strokeStyle = rgba('#ffffff', 0.4); // the sharp crest the wind cut
  g.lineWidth = 1.6;
  g.beginPath();
  for (let x = x0; x <= x1; x += 6) g.lineTo(x, top(x) + 3);
  g.stroke();
  g.strokeStyle = rgba(SHADE, 0.3);
  g.lineWidth = 1.2;
  for (let i = 0; i < (x1 - x0) / 30; i++) { // ripples the wind left on the lee face
    const x = x0 + rng() * (x1 - x0);
    g.beginPath();
    g.moveTo(x, top(x) + 8 + rng() * 14);
    g.quadraticCurveTo(x + 18, top(x) + 12 + rng() * 14, x + 34, top(x) + 9 + rng() * 14);
    g.stroke();
  }
  g.restore();
}

// The lighthouse on its rock: a stout tower banded in frost with three lit slits and a door, the
// gallery with its icicles, the lantern room and its cap, ice flung up the rock in frozen spray. Its
// lantern is a sign for the beam (flourish-5.js).
function lighthouse(g, out, rng, L, x, base) {
  const top = base - 170;
  g.beginPath(); // the rock, with spray frozen to spikes round its foot
  g.moveTo(x - 170, base + 70);
  g.lineTo(x - 124, base + 30);
  g.lineTo(x - 78, base + 6);
  g.lineTo(x - 44, base - 4);
  g.lineTo(x + 48, base - 6);
  g.lineTo(x + 92, base + 8);
  g.lineTo(x + 140, base + 36);
  g.lineTo(x + 190, base + 70);
  g.fill();
  for (let i = 0; i < 20; i++) {
    const sx = x - 140 + i * 15 + rng() * 8;
    g.beginPath();
    g.moveTo(sx - 4, base + 24 + rng() * 8);
    g.lineTo(sx + (rng() - 0.5) * 10, base + 2 - rng() * 26);
    g.lineTo(sx + 5, base + 28);
    g.fill();
  }
  g.beginPath(); // the tower
  g.moveTo(x - 42, base);
  g.lineTo(x - 27, top);
  g.lineTo(x + 27, top);
  g.lineTo(x + 42, base);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, x - 42, 0, x + 42, 0, [[0, rgba(LIT, 0.4)], [0.45, rgba(LIT, 0.08)], [0.6, rgba(SHADE, 0.2)], [1, rgba(SHADE, 0.5)]]);
  g.fillRect(x - 50, top, 100, base - top);
  for (let y = base - 24; y > top; y -= 46) { // bands of rime, slanting
    g.fillStyle = rgba(SNOW, 0.5);
    g.beginPath();
    g.moveTo(x - 50, y);
    g.lineTo(x + 50, y - 14);
    g.lineTo(x + 50, y - 32);
    g.lineTo(x - 50, y - 18);
    g.fill();
  }
  g.restore();
  for (const wy of [base - 60, base - 108]) lamp(g, out, rng, x + 6, wy, 9, 18, '#ffd98a', 'flicker'); // slits lit from within
  g.fillStyle = L.color;
  g.fillRect(x - 30, top - 6, 60, 7); // the gallery, its rail and icicles
  g.fillRect(x - 38, top - 8, 76, 5);
  g.fillRect(x - 36, top - 22, 2, 15);
  g.fillRect(x + 34, top - 22, 2, 15);
  g.fillRect(x - 36, top - 23, 72, 2);
  icicles(g, rng, x - 37, x + 37, () => top - 3, 6, 6, 32, 0.6);
  g.fillStyle = rgba(L.lamp, 0.95); // the lantern room, glazed, lit
  g.fillRect(x - 17, top - 52, 34, 29);
  g.fillStyle = rgba('#ffffff', 0.85);
  g.fillRect(x - 8, top - 48, 16, 21);
  g.fillStyle = L.color;
  for (const gx of [-17, -6, 5, 16]) g.fillRect(x + gx - 1, top - 52, 2, 29);
  g.fillRect(x - 20, top - 55, 40, 4);
  g.beginPath(); // the cap, a ball and a vane
  g.moveTo(x - 21, top - 53);
  g.quadraticCurveTo(x - 8, top - 68, x, top - 86);
  g.quadraticCurveTo(x + 8, top - 68, x + 21, top - 53);
  g.fill();
  g.fillRect(x - 1, top - 102, 2, 18);
  g.fillRect(x - 11, top - 98, 22, 2);
  g.fillStyle = rgba(SNOW, 0.55);
  g.fillRect(x - 18, top - 57, 36, 2);
  g.fillRect(x - 36, top - 24, 72, 2);
  const lampY = top - 37;
  out.signs.push({ lamp: true, x, y: lampY });
  out.lights.push({ x, y: lampY, r: 60, color: L.lamp, mode: 'steady', ph: 0, a: 0.9 });
  out.lights.push({ x, y: lampY, r: 190, color: L.lamp, mode: 'pulse', ph: 0.4, a: 0.2 });
}

function floes(g, w, h, rng, L, out) {
  const wy = h * SURFACE;
  const swell = waves(rng, 3, 0.006);
  profile(g, w, h, (x) => wy + 2 * swell(x), 4);
  out.signs.push({ water: true, y: wy });
  g.fillStyle = L.color;
  const rows = [[wy + 6, 120, 260, 8, 14, 60], [wy + 44, 200, 380, 13, 22, 120], [wy + 96, 280, 520, 20, 32, 200]]; // y, widths, thickness, gap
  rows.forEach(([y, w0, w1, t0, t1, gap], r) => {
    for (let x = rng() * 90 - 40; x < w; ) {
      const wd = w0 + rng() * (w1 - w0);
      floe(g, rng, x, y + (rng() - 0.5) * 12, wd, t0 + rng() * (t1 - t0));
      g.fillStyle = L.color;
      if (rng() < 0.35) out.lights.push({ x: x + wd / 2, y: y + 2, r: wd * 0.36, color: '#9affd6', mode: 'aurora', ph: rng(), a: 0.18 });
      x += wd + gap * (0.4 + rng());
    }
    for (let i = 0; i < w / 160; i++) { // broken pieces between the floes
      floe(g, rng, rng() * w, y + 6 + rng() * 34, 24 + rng() * 40, 4 + rng() * 5);
      g.fillStyle = L.color;
    }
    if (r === 1) lighthouse(g, out, rng, L, TOWER_X, h * 0.86);
    g.fillStyle = L.color;
  });
  for (const [x0, x1, hgt] of [[-40, 460, 78], [380, 760, 40], [w - 520, w + 40, 84], [1020, 1400, 34]]) {
    drift(g, rng, x0, x1, h - 8, hgt);
    g.fillStyle = L.color;
  }
}

export const ICE3 = { floes };
