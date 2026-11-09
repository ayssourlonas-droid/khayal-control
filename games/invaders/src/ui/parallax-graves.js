// The graveyard of Hollow Night (the near layer, the one the ship flies over): mounded earth, an iron
// fence between stone posts, headstones of every shape tilted in the ground, tufts of dead grass and
// jack-o'-lanterns lit on the ground, each carved face five layer lights that burn through
// the dark. L.lamp is the pumpkins' colour. See parallax-shapes.js for the painter contract.
import { rgba, shade } from './sprites.js';
import { path } from './aliens/kit.js';
import { pick } from '../core/rng.js';
import { profile, waves } from './parallax-kit.js';
import { TAU } from '../core/math.js';

const MOON_EDGE = rgba('#b8a0e0', 0.2);

// Carved faces in pumpkin radii from its centre: the left eye (mirrored for the right), the nose and
// the mouth, each a polygon of points; a grin, a wide jagged mouth, a fanged scowl.
const FACES = [
  [[[-0.5, -0.18], [-0.14, -0.3], [-0.26, 0.08]], [[0, -0.02], [-0.1, 0.16], [0.1, 0.16]],
    [[-0.62, 0.22], [-0.2, 0.3], [0.2, 0.3], [0.62, 0.22], [0.5, 0.5], [0.34, 0.4], [0.18, 0.58], [0, 0.44], [-0.18, 0.58], [-0.34, 0.4], [-0.5, 0.5]]],
  [[[-0.52, -0.3], [-0.12, -0.14], [-0.4, 0.06]], [[0, -0.04], [-0.12, 0.14], [0.12, 0.14]],
    [[-0.55, 0.26], [-0.28, 0.2], [0, 0.3], [0.28, 0.2], [0.55, 0.26], [0.4, 0.46], [0.22, 0.38], [0, 0.54], [-0.22, 0.38], [-0.4, 0.46]]],
  [[[-0.5, -0.3], [-0.16, -0.1], [-0.46, -0.02]], [[0, -0.02], [-0.08, 0.14], [0.08, 0.14]],
    [[-0.6, 0.36], [-0.3, 0.26], [0.3, 0.26], [0.6, 0.36], [0.4, 0.5], [0.26, 0.4], [0.14, 0.58], [0, 0.46], [-0.14, 0.58], [-0.26, 0.4], [-0.4, 0.5]]],
];

// A jack-o'-lantern of radius r on the ground at (x, y): ribs, stem and the face cut out dark, with
// lights where it is cut: the glow of the candle, two eyes, two points along the grin.
function pumpkin(g, rng, out, L, x, y, r) {
  const cy = y - r * 0.8;
  const [eye, nose, mouth] = FACES[Math.floor(rng() * FACES.length)];
  g.save();
  for (const [dx, k] of [[-0.55, 0.62], [0.55, 0.62], [0, 1]]) { // the outer lobes first, then the middle
    g.beginPath();
    g.ellipse(x + dx * r, cy, r * k * 0.8, r * 0.82, 0, 0, TAU);
    g.fillStyle = shade(L.lamp, dx ? -0.55 : -0.35);
    g.fill();
  }
  g.strokeStyle = rgba('#2a0c02', 0.7);
  g.lineWidth = 1.4;
  for (const dx of [-0.42, 0.42]) {
    g.beginPath();
    g.ellipse(x + dx * r, cy, r * 0.4, r * 0.8, 0, 0, TAU);
    g.stroke();
  }
  g.fillStyle = rgba('#ffd09a', 0.2); // a sheen on the lit side
  g.beginPath();
  g.ellipse(x + r * 0.45, cy - r * 0.35, r * 0.16, r * 0.34, 0.5, 0, TAU);
  g.fill();
  g.fillStyle = '#3a4a1c'; // the stem, curled
  g.fillRect(x - 2.5, cy - r * 0.98, 5, r * 0.3);
  g.beginPath();
  g.moveTo(x + 2, cy - r * 0.95);
  g.quadraticCurveTo(x + r * 0.3, cy - r * 1.25, x + r * 0.15, cy - r * 1.4);
  g.lineWidth = 2.4;
  g.strokeStyle = '#3a4a1c';
  g.stroke();
  const cut = (pts, sx) => {
    path(g, pts.map(([px, py]) => [x + px * sx * r, cy + py * r]));
    g.fillStyle = '#ffd24a';
    g.fill();
  };
  for (const s of [-1, 1]) cut(eye, s);
  cut(nose, 1);
  cut(mouth, 1);
  g.restore();
  const ph = rng();
  const light = (px, py, lr, a) => out.lights.push({ x: x + px * r, y: cy + py * r, r: lr, color: '#ffb02e', mode: 'flicker', ph, a });
  out.lights.push({ x, y: cy, r: r * 3, color: L.lamp, mode: 'flicker', ph, a: 0.55 });
  const [ex, ey] = [0, 1].map((k) => (eye[0][k] + eye[1][k] + eye[2][k]) / 3);
  for (const s of [-1, 1]) light(s * ex, ey, r * 0.5, 0.95); // the eyes
  for (const mx of [-0.32, 0.32]) light(mx, 0.4, r * 0.42, 0.85); // and the grin
}

// A headstone at (x, y) on the ground, h tall, leaning: a slab, a cross, a ringed cross, an obelisk.
function stone(g, rng, x, y, h, kind) {
  g.save();
  g.translate(x, y + 4);
  g.rotate((rng() - 0.5) * 0.3);
  const w = h * (0.5 + rng() * 0.12);
  g.beginPath();
  if (kind === 0) { // a rounded slab, a chip out of one shoulder
    g.moveTo(-w / 2, 0);
    g.lineTo(-w / 2, -h * 0.7);
    g.quadraticCurveTo(-w / 2, -h, 0, -h);
    g.quadraticCurveTo(w / 2, -h, w / 2, -h * 0.7);
    g.lineTo(w / 2, 0);
  } else if (kind === 1) { // a cross
    g.rect(-3.5, -h, 7, h);
    g.rect(-w * 0.45, -h * 0.72, w * 0.9, 7);
  } else if (kind === 2) { // a ringed cross
    g.rect(-4, -h, 8, h);
    g.rect(-w * 0.4, -h * 0.7, w * 0.8, 7);
    g.moveTo(w * 0.28, -h * 0.7 + 3.5);
    g.arc(0, -h * 0.7 + 3.5, w * 0.28, 0, TAU);
  } else { // an obelisk on a plinth
    g.rect(-w * 0.5, -h * 0.16, w, h * 0.16);
    g.moveTo(-w * 0.28, -h * 0.16);
    g.lineTo(-w * 0.2, -h * 0.9);
    g.lineTo(0, -h);
    g.lineTo(w * 0.2, -h * 0.9);
    g.lineTo(w * 0.28, -h * 0.16);
  }
  g.fill();
  g.strokeStyle = MOON_EDGE;
  g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(w * 0.22, -h * 0.92);
  g.lineTo(w * 0.26, -h * 0.2);
  g.stroke();
  g.restore();
}

// Fence between two stone posts: two rails, spear-topped pickets (a few broken or gone), a post cap
// with a ball on it.
function fence(g, rng, x0, x1, y) {
  const rail = (ry) => g.fillRect(x0, ry, x1 - x0, 3);
  rail(y - 62);
  rail(y - 22);
  for (let x = x0 + 8; x < x1 - 6; x += 11) {
    const r = rng();
    if (r < 0.07) continue;
    const top = y - 78 + (r < 0.16 ? 26 : 0);
    g.fillRect(x - 1.3, top, 2.6, y - top + 6);
    if (r >= 0.16) {
      g.beginPath();
      g.moveTo(x - 3.4, top + 1);
      g.lineTo(x, top - 11);
      g.lineTo(x + 3.4, top + 1);
      g.fill();
    }
  }
  for (const px of [x0, x1]) {
    g.fillRect(px - 8, y - 84, 16, 92);
    g.fillRect(px - 11, y - 90, 22, 7);
    g.beginPath();
    g.arc(px, y - 98, 6, 0, TAU);
    g.fill();
  }
}

function graveyard(g, w, h, rng, L, out) {
  const f = waves(rng, 3, 0.006);
  const ground = (x) => h * (0.6 + 0.045 * f(x)) + Math.sin(x * 0.07) * 2.5;
  let x = 30;
  while (x < w - 260) { // the fence in runs, with gaps where it fell
    const run = 220 + rng() * 120;
    fence(g, rng, x, x + run, ground(x + run / 2) - 10);
    x += run + (rng() < 0.4 ? 90 + rng() * 120 : 0);
  }
  profile(g, w, h, ground, 3);
  for (let mx = 40; mx < w; mx += 120 + rng() * 140) { // graves mounded in the earth
    g.beginPath();
    g.ellipse(mx, ground(mx) + 3, 44 + rng() * 22, 7 + rng() * 5, 0, Math.PI, TAU);
    g.fill();
  }
  for (let sx = 70; sx < w - 40; sx += 70 + rng() * 150) stone(g, rng, sx, ground(sx), 38 + rng() * 52, Math.floor(rng() * 4));
  for (let gx = 20; gx < w; gx += 10 + rng() * 26) { // dead grass
    const gy = ground(gx);
    g.lineWidth = 1.6;
    g.strokeStyle = L.color;
    g.beginPath();
    for (let b = 0; b < 3; b++) {
      g.moveTo(gx + b * 3, gy + 3);
      g.quadraticCurveTo(gx + b * 3 + (rng() - 0.5) * 8, gy - 8, gx + b * 5 - 4 + rng() * 8, gy - 12 - rng() * 12);
    }
    g.stroke();
  }
  for (let px = 150; px < w - 100; px += 280 + rng() * 80) {
    const sz = 17 + rng() * 14;
    pumpkin(g, rng, out, L, px, ground(px) + 4, sz);
  }
  for (let i = 0; i < 4; i++) { // a pale will-o'-wisp low over the graves
    const wx = pick(rng, [0.2, 0.4, 0.6, 0.8]) * w + rng() * 100;
    out.lights.push({ x: wx, y: ground(wx) - 26 - rng() * 30, r: 20, color: '#7dff5a', mode: 'pulse', ph: rng(), a: 0.4 });
  }
}

export const GRAVES = { graveyard };
