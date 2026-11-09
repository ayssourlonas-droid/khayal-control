// Built silhouettes: the megacity (towers, rooftops), the ruined city (ruins, rubble) and the data
// towers of Code Rain. See parallax-shapes.js for the painter contract.
import { rgba, shade, hash } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { pick } from '../core/rng.js';

// Lit windows in rows, sparse: `cell` [w, h, pitchX, pitchY].
function windows(g, rng, x, top, bw, h, colors, density, cell = [3, 4, 7, 9]) {
  const [cw, ch, px, py] = cell;
  for (let wy = top + 10; wy < h - 6; wy += py) {
    const row = rng() < 0.3 ? 0 : density;
    for (let wx = x + 5; wx < x + bw - 6; wx += px) {
      if (rng() > row) continue;
      g.fillStyle = rgba(pick(rng, colors), 0.35 + rng() * 0.6);
      g.fillRect(wx, wy, cw, ch);
    }
  }
}

// Towers with setbacks, lit windows, vertical neon strips (neon: false: none) and antenna beacons;
// the mid layer also frames billboards (out.signs) for the holo flourish.
function skyline(g, w, h, rng, L, out) {
  const neon = L.neon || ['#ff4fd8', '#2ef2ff'];
  for (let x = -20; x < w; ) {
    const bw = 40 + rng() * 120;
    const bh = h * (0.35 + rng() * 0.65 * L.roughness);
    const top = h - bh;
    g.fillStyle = L.color;
    g.fillRect(x, top, bw - 3, bh);
    if (rng() < 0.5) g.fillRect(x + bw * 0.2, top - bh * 0.08, bw * 0.55, bh * 0.08 + 1);
    windows(g, rng, x, top, bw, h, L.windows, L.density ?? 0.3);
    if (rng() < 0.35) {
      const ax = x + bw / 2;
      g.fillStyle = L.color;
      g.fillRect(ax - 1.5, top - 50, 3, 50);
      out.lights.push({ x: ax, y: top - 52, r: 9, color: '#ff3a3a', mode: 'blink', ph: rng() });
    }
    if (L.neon !== false && rng() < 0.45) { // neon: false leaves the towers plain (Tidal Siege has no signage)
      const c = pick(rng, neon);
      const sx = rng() < 0.5 ? x + 4 : x + bw - 10;
      const sh = 40 + rng() * 140;
      const sy = top + 20 + rng() * Math.max(10, bh * 0.4);
      g.fillStyle = c;
      g.fillRect(sx, sy, 4, sh);
      for (let k = 0; k < sh / 26; k++) out.lights.push({ x: sx + 2, y: sy + k * 26 + 10, r: 22, color: c, mode: 'flicker', ph: rng(), a: 0.45 });
    }
    if (L.signs && bw > 90 && rng() < 0.45) out.signs.push({ x: x + 10, y: top + 30, w: bw - 24, h: Math.min(110, bh * 0.3), c: pick(rng, neon), ph: rng() });
    x += bw + (rng() < 0.15 ? 20 : 0);
  }
}

// Low roofs crowded with tanks, vents, antennas and pipes; neon strips on the facades.
function rooftops(g, w, h, rng, L, out) {
  for (let x = -10; x < w; ) {
    const bw = 80 + rng() * 200;
    const top = h * (0.2 + rng() * 0.45);
    g.fillRect(x, top, bw - 2, h - top);
    const kit = Math.floor(rng() * 3);
    if (kit === 0) { // water tank on legs
      const tx = x + 20 + rng() * (bw - 70);
      g.fillRect(tx, top - 60, 44, 40);
      g.beginPath();
      g.moveTo(tx - 4, top - 60);
      g.lineTo(tx + 22, top - 78);
      g.lineTo(tx + 48, top - 60);
      g.fill();
      for (const lx of [tx + 4, tx + 36]) g.fillRect(lx, top - 22, 4, 22);
    } else if (kit === 1) { // vents and a mast
      for (let k = 0; k < 3; k++) g.fillRect(x + 10 + k * 30, top - 14 - rng() * 12, 22, 30);
      g.fillRect(x + bw - 30, top - 110, 3, 110);
      out.lights.push({ x: x + bw - 28, y: top - 112, r: 8, color: '#ff3a3a', mode: 'blink', ph: rng() });
    } else g.fillRect(x + 8, top - 8, bw - 20, 8);
    if (rng() < 0.6) {
      const c = pick(rng, L.neon);
      const ny = top + 20 + rng() * 40;
      g.fillStyle = c;
      g.fillRect(x + 12, ny, bw - 30, 3);
      out.lights.push({ x: x + bw / 2, y: ny, r: Math.min(70, bw / 2), color: c, mode: 'flicker', ph: rng(), a: 0.4 });
      g.fillStyle = L.color;
    }
    windows(g, rng, x, top, bw, h, L.windows, 0.12, [5, 6, 12, 14]);
    g.fillStyle = L.color;
    x += bw;
  }
}

// Broken towers: jagged tops, holes punched through, bare girders; fires at their feet.
function ruins(g, w, h, rng, L, out) {
  for (let x = -20; x < w; ) {
    const bw = 60 + rng() * 140;
    const top = h * (0.05 + rng() * 0.55);
    g.fillStyle = L.color;
    g.beginPath();
    g.moveTo(x, h);
    g.lineTo(x, top + rng() * 40);
    for (let k = 1; k < 6; k++) g.lineTo(x + (bw * k) / 6, top + rng() * 70 * (k % 2 ? 1 : 0.3));
    g.lineTo(x + bw, top + rng() * 50);
    g.lineTo(x + bw, h);
    g.fill();
    g.strokeStyle = L.color;
    g.lineWidth = 3;
    for (let k = 0; k < 3; k++) { // girders sticking out of the break
      const gx = x + rng() * bw;
      g.beginPath();
      g.moveTo(gx, top + 30);
      g.lineTo(gx + (rng() - 0.5) * 50, top - 20 - rng() * 50);
      g.stroke();
    }
    g.globalCompositeOperation = 'destination-out';
    for (let wy = top + 50; wy < h - 30; wy += 26) {
      for (let wx = x + 8; wx < x + bw - 14; wx += 18) if (rng() < 0.25) g.fillRect(wx, wy, 8, 12);
    }
    g.globalCompositeOperation = 'source-over';
    if (rng() < 0.55) out.lights.push({ x: x + rng() * bw, y: h - 10 - rng() * 60, r: 50 + rng() * 60, color: '#ff6a1a', mode: 'flicker', ph: rng(), a: 0.55 });
    x += bw + rng() * 40;
  }
}

// Mounds of debris, twisted beams and rebar; pairs of red eyes watching from the dark.
function rubble(g, w, h, rng, L, out) {
  const f = waves(rng, 4, 0.006);
  profile(g, w, h, (x) => h * (0.5 + 0.22 * f(x)) + hash(Math.floor(x / 9)) * 10);
  g.strokeStyle = L.color;
  for (let i = 0; i < 40; i++) {
    const x = rng() * w;
    const y = h * (0.45 + rng() * 0.2);
    g.lineWidth = 2 + rng() * 5;
    g.beginPath();
    g.moveTo(x, y + 20);
    g.quadraticCurveTo(x + (rng() - 0.5) * 60, y - 40, x + (rng() - 0.5) * 120, y - 30 - rng() * 70);
    g.stroke();
  }
  for (let i = 0; i < (L.eyes ?? 0); i++) {
    const x = 100 + rng() * (w - 200);
    const y = h * (0.62 + rng() * 0.25);
    const ph = rng();
    for (const dx of [-7, 7]) out.lights.push({ x: x + dx, y, r: 9, color: '#ff2a1a', mode: 'pulse', ph, a: 0.95 });
  }
}

// Monoliths with columns of glyph cells lit from inside.
function towers(g, w, h, rng, L, out) {
  for (let x = -10; x < w; ) {
    const bw = 50 + rng() * 110;
    const top = h * (0.05 + rng() * 0.6);
    g.fillStyle = L.color;
    g.fillRect(x, top, bw - 6, h - top);
    for (let cx = x + 6; cx < x + bw - 12; cx += 9) {
      if (rng() < 0.45) continue;
      const len = 4 + Math.floor(rng() * 18);
      const cy0 = top + 8 + rng() * (h - top) * 0.6;
      for (let k = 0; k < len; k++) {
        g.fillStyle = rgba(L.glyph, (0.15 + 0.6 * (k / len) ** 2) * (L.glow ?? 1));
        g.fillRect(cx, cy0 + k * 9, 5, 6);
      }
      if (rng() < 0.08) out.lights.push({ x: cx + 2, y: cy0 + len * 9, r: 16, color: L.glyph, mode: 'pulse', ph: rng(), a: 0.5 });
    }
    g.fillStyle = rgba(shade(L.glyph, 0.3), 0.25 * (L.glow ?? 1));
    g.fillRect(x, top, 2, h - top);
    x += bw + rng() * 26;
  }
}

export const CITY = { skyline, rooftops, ruins, rubble, towers };
