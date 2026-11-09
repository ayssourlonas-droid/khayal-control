// Natural and alien silhouettes: crooked pines and a temple gate (Ronin Moon), bone columns,
// chitin spires and eggs (Hive). See parallax-shapes.js for the painter contract.
import { rgba, shade } from './sprites.js';
import { profile, waves, ridgeTop } from './parallax-kit.js';
import { taper } from './sky-bodies-2.js';
import { TAU } from '../core/math.js';

// A crooked pine: a bent trunk and flat clouds of needles, ink style.
function pine(g, x, base, s, rng) {
  const lean = (rng() - 0.5) * 0.8;
  const pts = [];
  for (let i = 0; i <= 10; i++) pts.push([x + Math.sin(i * 0.5 + lean * 3) * 10 * s + lean * i * 8 * s, base - i * 11 * s]);
  taper(g, pts, 9 * s, 2 * s);
  for (let k = 0; k < 4; k++) { // flat clouds of needles, scalloped, reaching out from the trunk
    const [px, py] = pts[4 + k * 2] ?? pts[pts.length - 1];
    const side = k % 2 ? 1 : -1;
    const reach = (26 + rng() * 22) * s * (1 - k * 0.15);
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(px + side * reach, py - 2 * s);
    g.lineWidth = 3 * s;
    g.stroke();
    for (let j = 0; j < 4; j++) {
      g.beginPath();
      g.ellipse(px + side * reach * (0.25 + j * 0.25), py - 4 * s - (j % 2) * 3 * s, 11 * s, 5 * s, 0, 0, TAU);
      g.fill();
    }
  }
}

function pines(g, w, h, rng, L) {
  const top = ridgeTop(rng, w, h, L.roughness, 0.2, 1.6);
  profile(g, w, h, top);
  g.strokeStyle = L.color;
  for (let x = 30; x < w; x += 70 + rng() * 200) pine(g, x, top(x) + 6, 0.7 + rng() * 0.8, rng);
}

// Low hills, a temple gate and a pagoda, stone lanterns lit warm.
function gate(g, w, h, rng, L, out) {
  const f = waves(rng, 2, 0.004);
  const top = (x) => h * (0.55 + 0.12 * f(x));
  profile(g, w, h, top);
  for (let k = 0; k < 2; k++) {
    const gx = w * (0.22 + k * 0.5) + rng() * 80;
    const gy = top(gx) + 4;
    g.fillRect(gx - 70, gy - 140, 11, 140); // posts
    g.fillRect(gx + 59, gy - 140, 11, 140);
    g.fillRect(gx - 84, gy - 116, 168, 9); // lower beam
    g.beginPath(); // upper beam with upturned ends
    g.moveTo(gx - 106, gy - 160);
    g.quadraticCurveTo(gx, gy - 146, gx + 106, gy - 160);
    g.lineTo(gx + 96, gy - 146);
    g.quadraticCurveTo(gx, gy - 136, gx - 96, gy - 146);
    g.fill();
    const px = gx + 260 + rng() * 120; // pagoda
    let py = top(px) + 4;
    for (let tier = 0; tier < 4; tier++) {
      const tw = 90 - tier * 16;
      g.fillRect(px - tw * 0.32, py - 34, tw * 0.64, 34);
      g.beginPath();
      g.moveTo(px - tw * 0.75, py - 30);
      g.quadraticCurveTo(px, py - 46, px + tw * 0.75, py - 30);
      g.lineTo(px + tw * 0.4, py - 50);
      g.lineTo(px - tw * 0.4, py - 50);
      g.fill();
      py -= 48;
    }
    g.fillRect(px - 2, py - 40, 4, 40);
    for (const lx of [gx - 150, gx + 150]) {
      const ly = top(lx) + 2;
      g.fillRect(lx - 4, ly - 30, 8, 30);
      g.fillRect(lx - 12, ly - 46, 24, 16);
      g.fillRect(lx - 16, ly - 50, 32, 5);
      out.lights.push({ x: lx, y: ly - 38, r: 26, color: '#ffb04a', mode: 'flicker', ph: rng(), a: 0.8 });
    }
  }
  for (let x = 0; x < w; x += 5) { // grass blades
    const y = top(x) + 3;
    g.fillRect(x, y - 4 - rng() * 14, 2, 18);
  }
}

// A wall of bone: tall columns swelling at each vertebra, ribs arching between.
function ribs(g, w, h, rng, L) {
  for (let x = 20; x < w; x += 110 + rng() * 90) {
    const cw = 22 + rng() * 22;
    const top = h * (rng() * 0.25);
    g.fillRect(x - cw / 2, top, cw, h - top);
    for (let y = top + 20; y < h; y += 34 + rng() * 10) {
      g.beginPath();
      g.ellipse(x, y, cw * 0.75, 12, 0, 0, TAU);
      g.fill();
    }
  }
  g.strokeStyle = L.color;
  for (let i = 0; i < 16; i++) {
    const x = rng() * w;
    const y = h * (0.15 + rng() * 0.5);
    g.lineWidth = 6 + rng() * 8;
    g.beginPath();
    g.arc(x, y + 120, 90 + rng() * 80, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
  }
}

// Curved spires of chitin, ridged, rising from a resin floor.
function spires(g, w, h, rng) {
  profile(g, w, h, (x) => h * 0.78 + Math.sin(x * 0.013) * 10);
  for (let x = 0; x < w; x += 50 + rng() * 120) {
    const tall = h * (0.35 + rng() * 0.6);
    const bend = (rng() - 0.5) * 120;
    const pts = Array.from({ length: 12 }, (_, i) => [x + bend * (i / 11) ** 2, h * 0.82 - (tall * i) / 11]);
    taper(g, pts, 26 + rng() * 26, 2);
  }
}

// A clutch of leathery eggs, each with a cross-cut crown that glows faintly.
function eggs(g, w, h, rng, L, out) {
  profile(g, w, h, (x) => h * 0.68 + Math.sin(x * 0.02) * 6 + Math.sin(x * 0.007) * 12);
  for (let x = 30; x < w; x += 55 + rng() * 90) {
    const s = 0.7 + rng() * 0.6;
    const y = h * 0.7;
    g.fillStyle = L.color;
    g.beginPath();
    g.ellipse(x, y - 34 * s, 24 * s, 36 * s, 0, 0, TAU);
    g.fill();
    g.strokeStyle = rgba(shade(L.color, 0.45), 0.7);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x - 14 * s, y - 62 * s);
    g.lineTo(x + 14 * s, y - 54 * s);
    g.moveTo(x + 12 * s, y - 64 * s);
    g.lineTo(x - 12 * s, y - 52 * s);
    g.stroke();
    if (rng() < 0.4) out.lights.push({ x, y: y - 58 * s, r: 22 * s, color: L.glow, mode: 'pulse', ph: rng(), a: 0.55 });
  }
}

export const WILD = { pines, gate, ribs, spires, eggs };
