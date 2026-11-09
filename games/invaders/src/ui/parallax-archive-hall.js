// The great reading hall of Starlit Archive's far layer: a gabled front on a flight of steps, a rose
// window burning in it (gold petals, every third one teal, which the layer's lights keep breathing), twin
// campaniles either side, and behind it all the dome, ribbed in gilt, with its lantern and finial. The
// whole thing stands left of centre, clear of the galaxy (HALL_X, screen px). See parallax-shapes.js for the painter contract.
import { rgba, lin, rad, shade } from './sprites.js';
import { TAU } from '../core/math.js';
import { pick } from '../core/rng.js';
import { spire as roof } from './parallax-gothic-kit.js';
import { GOLD, NIGHT, poly, shelves, faces, casement, pinnacle } from './parallax-archive-kit.js';

export const HALL_X = 640; // screen px

// The rose window: a stone ring, twelve petals of glass (gold, amber, and teal on every third), tracery
// between them, a ring of small lights at the rim and a teal jewel at the heart.
function rose(g, out, rng, L, x, y, r) {
  g.beginPath();
  g.arc(x, y, r + 8, 0, TAU);
  g.fillStyle = L.color;
  g.fill();
  g.strokeStyle = rgba('#d8ccff', 0.4);
  g.lineWidth = 1.5;
  g.stroke();
  for (let i = 0; i < 12; i++) {
    const [a0, a1] = [(i * TAU) / 12, ((i + 1) * TAU) / 12];
    g.beginPath();
    g.moveTo(x, y);
    g.arc(x, y, r, a0, a1);
    g.closePath();
    const teal = i % 3 === 2;
    g.fillStyle = rad(g, x, y, r * 0.1, r, teal ? [[0, '#e8fffa'], [0.5, '#3ae0cc'], [1, '#12847e']] : [[0, '#fff8dc'], [0.5, i % 2 ? GOLD : '#ffb450'], [1, '#c8741a']]);
    g.fill();
  }
  g.strokeStyle = rgba('#2a1608', 0.85);
  g.lineWidth = 2.4;
  g.beginPath();
  for (let i = 0; i < 12; i++) {
    g.moveTo(x + Math.cos((i * TAU) / 12) * r * 0.2, y + Math.sin((i * TAU) / 12) * r * 0.2);
    g.lineTo(x + Math.cos((i * TAU) / 12) * r, y + Math.sin((i * TAU) / 12) * r);
  }
  g.stroke();
  for (const k of [0.46, 0.8, 1]) {
    g.beginPath();
    g.arc(x, y, r * k, 0, TAU);
    g.lineWidth = k === 1 ? 3 : 2;
    g.stroke();
  }
  for (let i = 0; i < 12; i++) { // a small round light in each petal's rim
    g.beginPath();
    g.arc(x + Math.cos(((i + 0.5) * TAU) / 12) * r * 0.9, y + Math.sin(((i + 0.5) * TAU) / 12) * r * 0.9, r * 0.075, 0, TAU);
    g.fillStyle = rgba('#2a1608', 0.8);
    g.fill();
  }
  g.beginPath();
  g.arc(x, y, r * 0.17, 0, TAU);
  g.fillStyle = rad(g, x - 2, y - 2, 0, r * 0.17, [[0, '#ffffff'], [0.5, '#4af0d8'], [1, '#0a7a76']]);
  g.fill();
  out.lights.push({ x, y, r: r * 3.4, color: GOLD, mode: 'pulse', ph: 0.2, a: 0.5 });
  out.lights.push({ x, y, r: r * 1.1, color: '#4af0d8', mode: 'steady', ph: 0, a: 0.35 });
}

// The dome: a half ellipse, ribbed along its meridians and parallels in gilt, lit from the right, with a
// lantern on its crown.
function dome(g, out, rng, L, x, base, rx, ry) {
  g.beginPath();
  g.ellipse(x, base, rx, ry, 0, Math.PI, TAU);
  g.fillStyle = L.color;
  g.fill();
  g.save();
  g.clip();
  faces(g, x - rx, base - ry, rx * 2, ry, 1.2);
  g.lineWidth = 1.6;
  for (let i = -5; i <= 5; i++) {
    g.beginPath();
    g.ellipse(x, base, rx * Math.abs(i / 6), ry, 0, Math.PI, TAU);
    g.strokeStyle = rgba(NIGHT, 0.45);
    g.stroke();
    g.beginPath();
    g.ellipse(x + 1.6, base, rx * Math.abs(i / 6), ry, 0, Math.PI, TAU);
    g.strokeStyle = rgba(i > 0 ? '#ffe2a0' : '#ffd27a', i > 0 ? 0.34 : 0.14);
    g.stroke();
  }
  for (const s of [0.34, 0.62, 0.84]) { // parallels
    const [wx, wy] = [rx * Math.sqrt(1 - s * s), base - ry * s];
    g.beginPath();
    g.moveTo(x - wx, wy);
    g.quadraticCurveTo(x, wy + 8, x + wx, wy);
    g.strokeStyle = rgba('#ffd27a', 0.25);
    g.stroke();
  }
  g.restore();
  g.fillStyle = L.color; // the cornice at its foot and the lantern, glazed, on its crown
  g.fillRect(x - rx - 6, base - 4, rx * 2 + 12, 10);
  g.fillRect(x - 17, base - ry - 38, 34, 40);
  g.fillRect(x - 21, base - ry - 42, 42, 6);
  roof(g, x, base - ry - 42, 36, 36, 4);
  for (const wx of [-10, 0, 10]) casement(g, out, rng, x + wx, base - ry - 3, 8, 28, GOLD, 'steady', wx ? 1 : 2);
  g.fillStyle = L.color;
}

// A campanile: a slim shaft, belfry arches lit, a needle spire.
function campanile(g, out, rng, L, x, base, w, h) {
  g.fillRect(x - w / 2, base - h, w, h);
  g.save();
  g.beginPath();
  g.rect(x - w / 2, base - h, w, h);
  g.clip();
  shelves(g, rng, x - w / 2, base - h, w, h, 0.26);
  faces(g, x - w / 2, base - h, w, h);
  g.restore();
  g.fillStyle = L.color;
  g.fillRect(x - w / 2 - 4, base - h - 6, w + 8, 6);
  roof(g, x, base - h - 6, w + 6, h * 0.5, 6);
  for (let y = base - 30, i = 0; y > base - h + 30; y -= 52, i++) casement(g, out, rng, x, y, w * 0.4, 24, pick(rng, L.window), 'flicker', i % 2 ? 1 : 2);
  g.fillStyle = L.color;
}

export function hall(g, out, rng, L, cx, base) {
  g.fillStyle = L.color;
  const foot = base - 386; // the dome's foot, level with the gable's tip: the drum shows either side of it
  dome(g, out, rng, L, cx, foot, 150, 130);
  g.fillRect(cx - 150, foot, 300, 70);
  for (const dx of [-124, -96, -68, 68, 96, 124]) casement(g, out, rng, cx + dx, base - 395 + 0.459 * Math.abs(dx), 9, 22, pick(rng, L.window), 'steady', Math.abs(dx) > 100 ? 2 : 1);
  g.fillStyle = L.color;
  for (const s of [-1, 1]) { // the wings, low, with a colonnade of lit arches and a balustrade
    g.fillRect(cx + s * 200 - 100, base - 112, 200, 112);
    g.fillRect(cx + s * 200 - 106, base - 118, 212, 7);
    for (let x = cx + s * 200 - 94; x < cx + s * 200 + 96; x += 20) g.fillRect(x, base - 130, 4, 12);
    for (let i = 0; i < 5; i++) casement(g, out, rng, cx + s * 200 - 80 + i * 40, base - 22, 14, 52, GOLD, 'steady', i === 2 ? 2 : 1);
    g.fillStyle = L.color;
    campanile(g, out, rng, L, cx + s * 168, base - 20, 44, 290);
  }
  poly(g, [[cx - 135, base - 330], [cx, base - 392], [cx + 135, base - 330], [cx + 135, base - 14], [cx - 135, base - 14]]); // the gabled front
  g.fill();
  g.save();
  g.clip();
  shelves(g, rng, cx - 135, base - 392, 270, 380, 0.22);
  faces(g, cx - 135, base - 392, 270, 380, 0.9);
  g.strokeStyle = rgba('#d8ccff', 0.4); // the lit raking cornice of the gable
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(cx, base - 392);
  g.lineTo(cx + 135, base - 330);
  g.stroke();
  g.restore();
  g.fillStyle = L.color;
  pinnacle(g, cx, base - 390, 14, 46);
  for (const s of [-1, 1]) pinnacle(g, cx + s * 135, base - 326, 16, 50);
  rose(g, out, rng, L, cx, base - 236, 58);
  for (const s of [-1, 1]) for (const [dx, y, h] of [[84, base - 150, 66], [100, base - 266, 46]]) casement(g, out, rng, cx + s * dx, y, 12, h, GOLD, 'pulse', 2);
  g.fillStyle = L.color;
  g.fillRect(cx - 150, base - 14, 300, 14); // the plinth and its steps
  for (let i = 0; i < 4; i++) g.fillRect(cx - 168 - i * 12, base - 6 + i * 2, 336 + i * 24, 5);
  g.fillStyle = lin(g, 0, base - 70, 0, base, [[0, rgba(shade(L.color, 0.2), 0.9)], [1, rgba(NIGHT, 0.9)]]); // the portico: a dark porch with columns
  g.fillRect(cx - 110, base - 70, 220, 56);
  g.fillStyle = L.color;
  for (let i = 0; i < 7; i++) {
    g.fillRect(cx - 108 + i * 36, base - 68, 8, 54);
    g.fillStyle = rgba('#d8ccff', 0.3);
    g.fillRect(cx - 108 + i * 36 + 5, base - 68, 2, 54);
    g.fillStyle = L.color;
  }
  g.fillRect(cx - 120, base - 78, 240, 9);
  casement(g, out, rng, cx, base - 14, 34, 62, '#ffe9b0', 'pulse', 2);
  g.fillStyle = L.color;
}
