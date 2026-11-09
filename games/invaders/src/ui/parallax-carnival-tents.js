// The big tops and the helter-skelter tower of Ember Carnival's mid layer. A big top is a striped canopy that
// steepens to a peak, a scalloped valance on its eaves with bulbs chasing along it, pennants and a beacon on
// the pole, a lit doorway; the whole of it dark against the sky and lit from under by the fair, edged
// magenta on one slope and gold on the other. The tower is a tapering stack with a stripe of slide spiralling
// up it, a roof, a flag and a lit door. See parallax-shapes.js for the painter contract.
import { rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { PARTY, GOLD, MAGENTA, poly, flag, uplight, bulb, bulbRow } from './parallax-carnival-kit.js';

export const GROUND = 392; // layer y of the midway's ground

// A big top at layer x, wd wide and ht tall above its walls.
export function bigtop(g, out, rng, L, x, wd, ht) {
  const wall = 46;
  const [eave, peak] = [GROUND - wall, GROUND - wall - ht];
  const build = (c, ox = 0, oy = 0) => {
    c.moveTo(x - wd / 2 + ox, GROUND + oy);
    c.lineTo(x - wd / 2 + ox, eave + oy);
    c.quadraticCurveTo(x - wd * 0.18 + ox, eave - ht * 0.35 + oy, x + ox, peak + oy);
    c.quadraticCurveTo(x + wd * 0.18 + ox, eave - ht * 0.35 + oy, x + wd / 2 + ox, eave + oy);
    c.lineTo(x + wd / 2 + ox, GROUND + oy);
    c.closePath();
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  g.save();
  g.beginPath();
  build(g);
  g.clip();
  const n = Math.round(wd / 34);
  for (let i = 0; i < n; i++) { // the panels of the canopy
    const [x0, x1] = [x - wd / 2 + (wd * i) / n, x - wd / 2 + (wd * (i + 1)) / n];
    poly(g, [[x, peak], [x0, eave + 6], [x1, eave + 6]]);
    g.fillStyle = lin(g, 0, peak, 0, eave, [[0, rgba(PARTY[i % 2 ? 0 : 3], 0)], [1, rgba(PARTY[i % 2 ? 0 : 3], 0.42)]]);
    g.fill();
  }
  g.fillStyle = lin(g, 0, eave - 30, 0, GROUND, [[0, rgba(GOLD, 0)], [1, rgba(GOLD, 0.3)]]);
  g.fillRect(x - wd / 2, eave - 30, wd, wall + 30);
  g.restore();
  for (const [s, color] of [[-1, MAGENTA], [1, GOLD]]) { // an edge of light on each slope
    g.beginPath();
    g.moveTo(x + (s * wd) / 2, eave);
    g.quadraticCurveTo(x + s * wd * 0.18, eave - ht * 0.35, x, peak);
    g.strokeStyle = rgba(color, 0.7);
    g.lineWidth = 1.8;
    g.stroke();
  }
  for (let i = 0; i < n * 2; i++) { // the valance
    g.beginPath();
    g.arc(x - wd / 2 + ((i + 0.5) * wd) / (n * 2), eave + 1, wd / (n * 4), 0, Math.PI);
    g.fillStyle = rgba(PARTY[i % 2 ? 0 : 1], 0.45);
    g.fill();
  }
  g.fillStyle = L.color; // the pole, its beacon and two pennants
  g.fillRect(x - 1.6, peak - 30, 3.2, 32);
  out.lights.push({ x, y: peak - 32, r: 50, color: MAGENTA, mode: 'pulse', ph: rng(), a: 0.9 });
  flag(out, x + 1.6, peak - 28, 24, 11, 1, PARTY[Math.floor(rng() * 5)]);
  flag(out, x - 1.6, peak - 18, 20, 9, -1, PARTY[Math.floor(rng() * 5)]);
  bulbRow(g, out, x - wd / 2 + 6, eave + 7, x + wd / 2 - 6, eave + 7, Math.round(wd / 13), 2.1, PARTY, { mode: 'blink', every: 3 });
  g.beginPath(); // the doorway
  g.moveTo(x - 20, GROUND);
  g.lineTo(x - 20, GROUND - 26);
  g.arc(x, GROUND - 26, 20, Math.PI, 0);
  g.lineTo(x + 20, GROUND);
  g.fillStyle = rad(g, x, GROUND, 2, 46, [[0, '#fff4c8'], [0.5, rgba(L.lamp, 0.95)], [1, rgba('#8a2a6a', 0.9)]]);
  g.fill();
  out.lights.push({ x, y: GROUND - 18, r: 70, color: L.lamp, mode: 'steady', ph: 0, a: 0.42 });
  g.fillStyle = L.color;
}

// The helter-skelter at layer x: h tall, a stripe of slide winding up it, bulbs up both edges, a lit door.
export function helter(g, out, rng, L, x, h) {
  const [bw, tw] = [48, 22];
  const build = (c, ox = 0, oy = 0) => {
    c.moveTo(x - bw + ox, GROUND + oy);
    c.lineTo(x - tw + ox, GROUND - h + oy);
    c.lineTo(x + tw + ox, GROUND - h + oy);
    c.lineTo(x + bw + ox, GROUND + oy);
    c.closePath();
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  g.save();
  g.beginPath();
  build(g);
  g.clip();
  for (let k = 0; k < 6; k++) { // the slide: a band sagging across the tower, each turn higher than the last
    const y = GROUND - 22 - k * (h / 6.4);
    const half = bw - ((bw - tw) * (GROUND - y)) / h;
    g.beginPath();
    g.moveTo(x - half - 4, y - 14);
    g.quadraticCurveTo(x, y + 16, x + half + 4, y - 4);
    g.strokeStyle = rgba(k % 2 ? GOLD : MAGENTA, 0.5);
    g.lineWidth = 8;
    g.stroke();
  }
  g.restore();
  uplight(g, build, GROUND - h * 0.6, GROUND, GOLD, 0.34);
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(x + s * bw, GROUND);
    g.lineTo(x + s * tw, GROUND - h);
    g.strokeStyle = rgba(s < 0 ? MAGENTA : GOLD, 0.65);
    g.lineWidth = 1.6;
    g.stroke();
  }
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
    const u = (i + 0.5) / 7.4;
    bulb(g, out, x + s * (bw - (bw - tw) * u), GROUND - h * u, 1.9, PARTY[(i + (s > 0)) % 5], i % 3 === 1 ? 'blink' : null, 1 - u, 0.6);
  }
  g.fillStyle = L.color; // the roof, the finial and the flag
  poly(g, [[x - tw - 6, GROUND - h], [x, GROUND - h - 32], [x + tw + 6, GROUND - h]]);
  g.fill();
  g.fillRect(x - 1.3, GROUND - h - 52, 2.6, 22);
  flag(out, x + 1.3, GROUND - h - 50, 20, 9, 1, MAGENTA);
  out.lights.push({ x, y: GROUND - h - 34, r: 40, color: GOLD, mode: 'pulse', ph: rng(), a: 0.8 });
  g.fillStyle = rgba(L.lamp, 0.95);
  g.fillRect(x - 6, GROUND - 22, 12, 22);
  g.beginPath();
  g.arc(x, GROUND - 22, 6, Math.PI, TAU);
  g.fill();
  out.lights.push({ x, y: GROUND - 12, r: 34, color: L.lamp, mode: 'steady', ph: 0, a: 0.4 });
  g.fillStyle = L.color;
}
