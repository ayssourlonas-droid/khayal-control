// The harbour of Tidal Siege: a quay of container stacks and gantry cranes under sodium lamps, and
// the dark sea in front of it with foam on its crests. See parallax-shapes.js for the painter
// contract (the far city is the skyline kind, parallax-city.js, with neon: false).
import { rgba, shade } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { pick } from '../core/rng.js';

const RED = '#ff3a3a';

// Rows of containers stacked up to four high, each box a shade of its own, ribbed down its face.
function stacks(g, rng, L, x0, x1, qy) {
  for (let x = x0; x < x1; ) {
    const cw = 64 + Math.floor(rng() * 3) * 14;
    const n = 1 + Math.floor(rng() * 4);
    for (let k = 0; k < n; k++) {
      const y = qy - (k + 1) * 27;
      g.fillStyle = shade(L.color, (rng() - 0.35) * 0.3);
      g.fillRect(x, y, cw - 3, 25);
      g.fillStyle = rgba('#000000', 0.35);
      for (let rx = x + 6; rx < x + cw - 8; rx += 7) g.fillRect(rx, y + 3, 1.5, 19);
    }
    x += cw + (rng() < 0.2 ? 36 : 0);
  }
  g.fillStyle = L.color;
}

// A ship-to-shore crane: two braced legs, a deck girder, an A-frame with stays and a long boom out
// over the water (dir -1 left, 1 right), a container hanging from its trolley; a red lamp on the apex.
function crane(g, out, rng, L, x, qy, s, dir) {
  const top = qy - 190 * s;
  const tower = x + 36 * s;
  g.strokeStyle = L.color;
  g.lineCap = 'butt';
  for (const lx of [x, x + 72 * s]) { // legs
    g.lineWidth = 9 * s;
    g.beginPath();
    g.moveTo(lx, qy);
    g.lineTo(lx + 4 * s, top);
    g.stroke();
  }
  g.lineWidth = 3 * s;
  g.beginPath(); // X bracing
  for (const y of [qy - 70 * s, qy - 140 * s]) {
    g.moveTo(x + 2 * s, y);
    g.lineTo(x + 74 * s, y - 70 * s);
    g.moveTo(x + 74 * s, y);
    g.lineTo(x + 2 * s, y - 70 * s);
  }
  g.stroke();
  g.fillRect(x - 24 * s, top - 8 * s, 124 * s, 14 * s); // deck girder
  g.fillRect(x + 8 * s, top - 40 * s, 56 * s, 32 * s); // machinery house
  g.beginPath(); // A-frame
  g.moveTo(x + 6 * s, top - 8 * s);
  g.lineTo(tower, qy - 290 * s);
  g.lineTo(x + 70 * s, top - 8 * s);
  g.fill();
  const tip = tower + dir * 290 * s;
  const by = top - 14 * s;
  g.lineWidth = 6 * s; // boom, a truss: two chords and a zig-zag
  g.beginPath();
  g.moveTo(tower, by);
  g.lineTo(tip, by - 22 * s);
  g.stroke();
  g.lineWidth = 2 * s;
  g.beginPath();
  g.moveTo(tower, by + 16 * s);
  for (let i = 1; i <= 12; i++) g.lineTo(tower + dir * ((290 * s * i) / 12), by - ((22 * s * i) / 12) + (i % 2 ? 0 : 16 * s));
  g.stroke();
  g.lineWidth = 1.6 * s; // stays from the apex
  g.beginPath();
  g.moveTo(tower, qy - 290 * s);
  g.lineTo(tip, by - 22 * s);
  g.moveTo(tower, qy - 290 * s);
  g.lineTo(x - dir * 40 * s, top);
  g.stroke();
  const tx = tower + dir * (170 + rng() * 80) * s; // the trolley and its load
  const ty = by - 22 * s * ((tx - tower) / (tip - tower));
  g.lineWidth = 1.4 * s;
  g.beginPath();
  g.moveTo(tx - 9 * s, ty);
  g.lineTo(tx - 12 * s, ty + 62 * s);
  g.moveTo(tx + 9 * s, ty);
  g.lineTo(tx + 12 * s, ty + 62 * s);
  g.stroke();
  g.fillRect(tx - 18 * s, ty + 60 * s, 36 * s, 17 * s);
  out.lights.push({ x: tower, y: qy - 296 * s, r: 11, color: RED, mode: 'blink', ph: rng() });
  out.lights.push({ x: tip, y: by - 24 * s, r: 8, color: RED, mode: 'blink', ph: rng() });
  out.lights.push({ x: tx, y: ty + 44 * s, r: 40 * s, color: L.lamp, mode: 'flicker', ph: rng(), a: 0.35 }); // work lamp
}

// A lamp post leaning over the quay: a sodium lamp and the pool of light under it.
function lamp(g, out, rng, L, x, qy) {
  g.fillRect(x - 2, qy - 120, 4, 120);
  g.fillRect(x - 2, qy - 122, 22, 4);
  out.lights.push({ x: x + 18, y: qy - 114, r: 34, color: L.lamp, mode: 'steady', ph: 0, a: 0.85 });
  out.lights.push({ x: x + 18, y: qy - 70, r: 110, color: L.lamp, mode: 'flicker', ph: rng(), a: 0.16 });
}

// A long low shed with its row of windows lit.
function shed(g, rng, L, x, qy) {
  const sw = 150 + rng() * 120;
  g.beginPath();
  g.moveTo(x, qy);
  g.lineTo(x, qy - 46);
  g.lineTo(x + sw / 2, qy - 66);
  g.lineTo(x + sw, qy - 46);
  g.lineTo(x + sw, qy);
  g.fill();
  g.fillStyle = rgba(L.lamp, 0.7);
  for (let wx = x + 14; wx < x + sw - 22; wx += 22) g.fillRect(wx, qy - 34, 11, 7);
  g.fillStyle = L.color;
}

function cranes(g, w, h, rng, L, out) {
  const qy = h * 0.72;
  g.fillRect(0, qy, w, h - qy);
  let x = 40;
  for (let i = 0; x < w - 200; i++) {
    const room = 200 + rng() * 160;
    stacks(g, rng, L, x, x + room, qy);
    x += room;
    if (i % 3 === 0) crane(g, out, rng, L, x, qy, 0.7 + rng() * 0.25, rng() < 0.5 ? -1 : 1);
    else if (i % 3 === 1) shed(g, rng, L, x, qy);
    else lamp(g, out, rng, L, x, qy);
    x += 150 + rng() * 60;
  }
}

// Dark swell: crests along the top with foam on them, bands of wave across the body, a few glints.
function sea(g, w, h, rng, L, out) {
  const f = waves(rng, 4, 0.0042);
  const top = (x) => h * (0.3 + 0.16 * f(x)) + Math.sin(x * 0.045) * 3;
  profile(g, w, h, top, 3);
  g.globalCompositeOperation = 'source-atop';
  for (let k = 0; k < 5; k++) { // swell lines below the surface
    g.strokeStyle = rgba(L.foam, 0.05 + 0.02 * k);
    g.lineWidth = 2 + k;
    g.beginPath();
    for (let x = 0; x <= w; x += 12) g.lineTo(x, top(x) + 18 + k * 30 + Math.sin(x * 0.011 + k * 2) * 7);
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  g.lineCap = 'round';
  for (let x = 6; x < w - 6; x += 3) { // foam on every crest: a bright streak breaking down its lee
    if (f(x) < f(x - 3) || f(x) < f(x + 3) || f(x) < 0.25) continue;
    const len = 30 + rng() * 70;
    g.strokeStyle = rgba(L.foam, 0.45 + rng() * 0.35);
    g.lineWidth = 2 + rng() * 2.5;
    g.beginPath();
    g.moveTo(x - len * 0.4, top(x - len * 0.4) + 3);
    g.quadraticCurveTo(x, top(x) - 1, x + len * 0.6, top(x + len * 0.6) + 5);
    g.stroke();
    g.fillStyle = rgba(L.foam, 0.5);
    for (let i = 0; i < 5; i++) g.fillRect(x + (rng() - 0.3) * len, top(x) + 6 + rng() * 22, 2, 2);
    if (rng() < 0.25) out.lights.push({ x, y: top(x), r: 26, color: L.foam, mode: 'pulse', ph: rng(), a: 0.3 });
  }
  for (let i = 0; i < 6; i++) { // lamplight laid on the water
    const x = rng() * w;
    out.lights.push({ x, y: top(x) + 14, r: 60 + rng() * 40, color: pick(rng, [L.lamp, '#4ff3ff']), mode: 'flicker', ph: rng(), a: 0.12 });
  }
  g.lineCap = 'butt';
}

export const HARBOUR = { cranes, sea };
