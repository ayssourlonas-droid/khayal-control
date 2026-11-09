// The Lantern Leviathan's lamps (World 15, Lantern Deep; see angler.js): photophores scattered over its skin (a
// loose sprinkle along the back and the brow, round the eyes, over the cheeks and under the jaw, small and dim, a few
// of them bright; the two sides are not the same), the thin cold rim light along the head, and the two rage layers
// the later phases fade in over the hull (the hover phase lights the upper teeth and the throat, the orbit phase
// lights every lamp and wraps the head in violet and teal currents). All of it stays on the hull's canvas and
// under y -158.
import { line, lin, rgba, bloom } from './kit.js';
import { HALF, SOCKET, headPath, photophore, rng, upper, TEAL, VIOLET, AQUA, PALE, TAU } from './angler-kit.js';
import { chin } from './angler-jaw-sprite.js';
import { hullFangs } from './angler-jaw.js';
import { litFang } from './angler-teeth.js';
import { THROAT } from './angler-maw.js';

const inward = ([x, y], k) => [x * (1 - k), y + (-6 - y) * k]; // toward the middle of the head, k of the way

// Every lamp: { x, y, c, big }, both sides, each side from its own seed.
export const SITES = (() => {
  const out = [];
  [-1, 1].forEach((s, side) => {
    const r = rng(60 + side * 7);
    const add = (x, y, big = r() < 0.16) => out.push({ x: s * x, y, c: r() < 0.3 ? VIOLET : TEAL, big });
    for (let i = 0; i < 26; i++) { // along the back and the shoulder, a loose sprinkle
      const u = 1.6 + r() * 6.4;
      const [a, b] = [HALF[Math.floor(u)], HALF[Math.floor(u) + 1]];
      const [x, y] = inward([a[0] + (b[0] - a[0]) * (u % 1), a[1] + (b[1] - a[1]) * (u % 1)], 0.05 + 0.18 * r());
      add(x + (r() - 0.5) * 10, y + (r() - 0.5) * 8);
    }
    for (let i = 0; i < 9; i++) { // over the brow
      const a = Math.PI * (1.05 + i * 0.1) + (r() - 0.5) * 0.1;
      const R = SOCKET.r + 16 + r() * 8;
      add(SOCKET.x + Math.cos(a) * R, SOCKET.y + 3 + Math.sin(a) * R);
    }
    for (let i = 0; i < 7; i++) add(150 + r() * 80, upper(150) + 14 + r() * 40 + (i % 2) * 10); // the cheek under the eye
    for (let i = 0; i < 9; i++) { // under the jaw
      const x = 60 + r() * 150;
      add(x, chin(x) + 10 + r() * 24);
    }
  });
  return out;
})();

export function lamps(b, l) {
  for (const s of SITES) photophore(b, l, s.x, s.y, s.big ? 3.1 : 1.6, s.c, s.big ? 1 : 0.5);
}

// The cold rim: the head's outline, brighter along the top where the surface light falls.
export function rim(l) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  headPath(l);
  line(l, lin(l, 0, -137, 0, 143, [[0, rgba(AQUA, 0.3)], [0.5, rgba(AQUA, 0.14)], [1, rgba(TEAL, 0.08)]]), 2.4);
  l.restore();
}

// Every lamp burning harder, with a halo (the orbit phase).
function flare(l) {
  for (const s of SITES) bloom(l, s.x, s.y, s.big ? 18 : 10, s.c, s.big ? 0.55 : 0.34);
}

// The hover phase: the throat hotter, the slot of the mouth glowing and every upper needle outside the chamber lit.
function hover(l, a = 1) {
  bloom(l, THROAT.x, THROAT.y, 128, PALE, 0.4 * a);
  for (const s of [-1, 1]) bloom(l, s * 160, 6, 72, PALE, 0.3 * a);
  for (const t of hullFangs()) litFang(l, t, 0.8 * a);
}

// Currents of violet and teal round the head: tapering arcs of light, a few in each colour.
function swirls(l) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  [[300, 158, 0.1, 0.6, VIOLET], [286, 150, 0.85, 0.55, TEAL], [312, 160, 1.55, 0.6, VIOLET], [292, 152, 2.35, 0.5, TEAL], [276, 140, 3.3, 0.5, VIOLET], [302, 156, 4.1, 0.55, TEAL], [290, 148, 4.85, 0.5, VIOLET], [310, 158, 5.5, 0.5, TEAL]].forEach(([rx, ry, a0, span, c]) => {
    for (let i = 0; i < 8; i++) {
      const u = i / 8;
      const a = Math.sin(Math.PI * (u + 0.06)); // fades in and out along the arc
      l.beginPath();
      l.ellipse(0, 8, rx, ry, 0, (a0 + span * u) % TAU, (a0 + span * (u + 0.13)) % TAU);
      line(l, rgba(c, 0.13 * a), 15);
      line(l, rgba(c, 0.3 * a), 6);
      line(l, rgba(c, 0.62 * a), 1.8);
    }
  });
  l.restore();
}

export const rage = [null, (l) => hover(l), (l) => {
  hover(l, 1.5);
  flare(l);
  swirls(l);
}];
