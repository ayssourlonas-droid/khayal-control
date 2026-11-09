// The clean sky of world 17 at h 1 (cleansky; sky-bodies-9.js registers it): a fresh morning over the blue gradient. A
// bright sun with a white-gold core, a soft gold halo and a ring of very faint rays, standing on the same spot as the smog
// sky's coin (SUN) so the crossfade reads as the smog thinning away from one sun. A few puffy white cumulus (sky-bodies-9-cloud.js)
// kept to the upper left, the left centre, a low bank on the horizon and one small cloud by the sun, so the middle top, where
// the Craving and the aliens fight, stays a calm blue; thin high cirrus; a pale warm haze along the horizon. Bright and
// airy, and nothing in it is a small saturated orb like a bullet.
import { glow, rgba, lin, rad, addGlow, hash } from './sprites.js';
import { brush } from './sky-paint.js';
import { cumulus } from './sky-bodies-9-cloud.js';
import { W, SUN } from './sky-bodies-9-kit.js';
import { TAU } from '../core/math.js';

export const SUN_R = 64; // the clean sun's disc
export const RAYS = { n: 16, alpha: 0.022, len: [760, 1180] }; // the faint ring of rays: how many, how strong each, how long

// The clouds: [x, y of the cloud's base left, width, height, seed, name], and the side its sun is on.
const CLOUDS = [
  [70, 330, 520, 170, 11, 'a'], [90, 560, 330, 100, 23, 'b'], [1730, 470, 230, 74, 31, 'c'],
  [620, 676, 360, 84, 41, 'd'], [1130, 700, 420, 90, 47, 'e'], [1520, 654, 340, 78, 53, 'f'],
];

function sun(g) {
  addGlow(g, glow('#ffe9a8'), SUN.x, SUN.y, 560, 0.34, 0.9);
  addGlow(g, glow('#ffe08a'), SUN.x, SUN.y, 260, 0.4);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < RAYS.n; i++) {
    const a = (i / RAYS.n) * TAU + 0.2 * hash(i);
    const len = RAYS.len[0] + (RAYS.len[1] - RAYS.len[0]) * hash(i + 30);
    const half = 0.016 + 0.02 * hash(i + 60);
    g.fillStyle = lin(g, SUN.x, SUN.y, SUN.x + Math.cos(a) * len, SUN.y + Math.sin(a) * len, [[0, rgba('#fff2c0', RAYS.alpha * 1.6)], [1, rgba('#fff2c0', 0)]]);
    g.beginPath();
    g.moveTo(SUN.x, SUN.y);
    g.lineTo(SUN.x + Math.cos(a - half) * len, SUN.y + Math.sin(a - half) * len);
    g.lineTo(SUN.x + Math.cos(a + half) * len, SUN.y + Math.sin(a + half) * len);
    g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = rad(g, SUN.x, SUN.y, SUN_R * 0.2, SUN_R * 1.18, [[0, '#ffffff'], [0.66, '#fffcee'], [0.84, rgba('#fff0b8', 0.85)], [1, rgba('#ffe48e', 0)]]);
  g.beginPath();
  g.arc(SUN.x, SUN.y, SUN_R * 1.18, 0, TAU);
  g.fill();
}

// Thin high cirrus: long wisps of white, fading at both ends, in the upper left and by the sun, none over the middle top.
function cirrus(g) {
  const lanes = [[40, 70, 760, 3], [180, 150, 640, 5], [90, 235, 480, 4], [1380, 90, 520, 6], [1500, 168, 400, 7], [1320, 392, 440, 8]];
  for (const [x, y, len, s] of lanes) {
    for (let k = 0; k < 5; k++) brush(g, x + k * 46 + hash(s + k) * 40, y + k * 9 - 14 + hash(s * 7 + k) * 18, len * (0.55 + 0.5 * hash(s + k * 3)), 2.4 + hash(s + k * 5) * 5, rgba('#ffffff', 0.12 + 0.12 * hash(s + k * 2)), s * 10 + k);
  }
}

export function cleansky(g) {
  g.save();
  g.fillStyle = lin(g, 0, 520, 0, 1000, [[0, rgba('#fff2d0', 0)], [1, rgba('#fff0cc', 0.4)]]); // the warm haze low down
  g.fillRect(0, 520, W, 560);
  sun(g);
  cirrus(g);
  for (const [x, y, w, h, s, name] of CLOUDS) {
    const dir = x + w / 2 < SUN.x ? 1 : -1;
    const c = cumulus(w, h, s, dir, name);
    g.drawImage(c, x - 24, y - h - 24);
  }
  g.restore();
}
