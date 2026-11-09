// The Lantern Leviathan's maw (World 15, Lantern Deep; see angler.js): the weak part, 180 x 100 for the hit box,
// the dark gullet at the heart of the face. It paints the chamber (angler-kit.js CH): a black cavern whose throat
// burns pale cyan-white far back, ridges across the roof of the mouth, the gill arches glimmering deep inside, the
// tongue's hump behind the jaw and the upper needles that hang in the chamber (angler-teeth.js). The slot beyond
// the chamber, out to the corners, is the hull's, and the chamber's sides fade out into it. The lower jaw and its
// needles stand in front of it (angler-jaw-sprite.js). The throat is the brightest thing on the boss but the lure: a
// pale glow, a white-hot core and a few rays, all on the lights layer.
// Painted in boss coordinates (the part's centre is (0, -15)); its canvas is margined 44 px for the arch.
import { path, line, lin, rad, rgba, shade, ellipse } from './kit.js';
import { mouthPath, upper, CH, SOCKET, GLOOM, PALE, SKIN_L, VIOLET, INK, circle, TAU } from './angler-kit.js';
import { TEETH, fang } from './angler-teeth.js';

export const THROAT = { x: 0, y: -26 }; // where the light comes from

const along = (f, x0, x1, dy = 0, step = 6) => {
  const pts = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, f(x) + dy]);
  return pts;
};

// The cavern: black at the edges, a teal throat going pale at the heart.
function cavern(b) {
  b.fillStyle = rad(b, THROAT.x, THROAT.y, 4, 118, [[0, '#4ab8c8'], [0.14, '#157a8e'], [0.34, '#0a3444'], [0.66, '#03121c'], [1, GLOOM]]);
  b.fillRect(-CH - 2, -80, CH * 2 + 4, 130);
  for (let k = 1; k <= 4; k++) { // the ridges (rugae) of the palate, following the roof
    const pts = along(upper, -CH * 0.86, CH * 0.86, 7 * k + 3);
    path(b, pts, true);
    line(b, rgba('#000a12', 0.55), 2.6);
    path(b, pts.map(([x, y]) => [x, y + 2]), true);
    line(b, rgba(SKIN_L, 0.22), 1);
  }
}

// The gill arches far back in the throat: nested cups of fine bars with a comb of rakers on each, glimmering.
function arches(b, l) {
  for (let i = 0; i < 4; i++) {
    const rx = 15 + i * 11;
    const ry = 9 + i * 7;
    for (const [g, c, w] of [[b, rgba('#00141e', 0.6), 2.6], [l, rgba(PALE, 0.5 - i * 0.08), 1.2]]) {
      g.beginPath();
      g.ellipse(THROAT.x, THROAT.y + 8, rx, ry, 0, 0.12 * Math.PI, 0.88 * Math.PI);
      line(g, c, w);
    }
    for (let a = 0.2; a < 0.85; a += 0.07) { // the rakers
      const [x, y] = [THROAT.x + Math.cos(a * Math.PI) * rx, THROAT.y + 8 + Math.sin(a * Math.PI) * ry];
      l.beginPath();
      l.moveTo(x, y);
      l.lineTo(x * 0.9, y - 5);
      line(l, rgba('#e8ffff', 0.3 - i * 0.05), 0.8);
    }
  }
}

// The tongue: a dark violet hump on the floor, the jaw's lip hiding all but its top, a lit edge.
function tongue(b, l) {
  ellipse(b, 0, 34, 62, 20);
  b.fillStyle = lin(b, 0, 14, 0, 54, [[0, '#33407a'], [0.5, '#1a2352'], [1, '#080c20']]);
  b.fill();
  b.beginPath();
  b.ellipse(0, 34, 62, 20, 0, Math.PI * 1.08, Math.PI * 1.92);
  line(b, rgba(VIOLET, 0.35), 1.6);
  for (let i = -5; i <= 5; i++) { // papillae
    circle(b, i * 10, 22 + Math.abs(i) * 1.1, 1.5);
    b.fillStyle = rgba('#8aa0e8', 0.3);
    b.fill();
  }
  l.beginPath();
  l.ellipse(0, 34, 62, 20, 0, Math.PI * 1.15, Math.PI * 1.85);
  line(l, rgba(VIOLET, 0.22), 2.4);
}

// The throat's light, on the lights layer: a wide pale glow, a white-hot disc and a few rays fanning out.
function light(l) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.translate(THROAT.x, THROAT.y);
  l.scale(1, 0.74);
  for (const [r, c, a] of [[92, PALE, 0.5], [56, '#c8fbff', 0.65], [28, '#ffffff', 0.9]]) {
    l.fillStyle = rad(l, 0, 0, 0, r, [[0, rgba(c, a)], [0.5, rgba(c, a * 0.4)], [1, rgba(c, 0)]]);
    l.fillRect(-r, -r, r * 2, r * 2);
  }
  l.restore();
  l.save();
  l.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { // rays
    const a = (i / 7) * TAU + 0.3;
    l.beginPath();
    l.moveTo(THROAT.x, THROAT.y);
    l.lineTo(THROAT.x + Math.cos(a) * 84, THROAT.y + Math.sin(a) * 60);
    line(l, rgba('#d8fbff', 0.08), 5);
  }
  l.restore();
}

export function maw(b, l, p) {
  for (const g of [b, l]) {
    g.save();
    g.translate(-p.dx, -p.dy);
  }
  b.save();
  mouthPath(b, -CH, CH);
  b.clip();
  cavern(b);
  arches(b, l);
  tongue(b, l);
  for (const t of TEETH.up.filter((q) => Math.abs(q.x) < CH - 8)) fang(b, l, t); // the hull's own stand under the fading sides
  path(b, along(upper, -CH, CH, 0, 4), true); // the roof's lip shades into the dark where the chamber opens
  line(b, rgba(INK, 0.9), 7);
  path(b, along(upper, -CH, CH, 3.5, 4), true);
  line(b, rgba(shade(SKIN_L, 0.2), 0.55), 1.3);
  b.restore();
  b.save();
  b.globalCompositeOperation = 'destination-out';
  b.fillStyle = lin(b, -CH, 0, CH, 0, [[0, '#000'], [0.14, 'rgba(0,0,0,0)'], [0.86, 'rgba(0,0,0,0)'], [1, '#000']]); // the sides fade into the hull's own mouth beneath
  b.fillRect(-CH - 2, -80, CH * 2 + 4, 140);
  b.fillStyle = '#000'; // the eye sockets stand in front of the mouth's upper corners
  for (const x of [-SOCKET.x, SOCKET.x]) {
    const pts = Array.from({ length: 28 }, (_, i) => [Math.max(-CH - 2, Math.min(CH + 2, x + Math.cos((i / 28) * TAU) * (SOCKET.r + 10))), SOCKET.y + Math.sin((i / 28) * TAU) * (SOCKET.r + 10)]);
    path(b, pts);
    b.fill();
  }
  b.restore();
  light(l);
  for (const g of [b, l]) g.restore();
}
