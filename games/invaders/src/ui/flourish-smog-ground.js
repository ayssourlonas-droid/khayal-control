// World 17's flourishes that live on the ground (contract in flourish.js; pure functions of t and the healing h in env.v.heal.h):
//   kites     phase 'mid': once the air is clean (stage(h, 'life'): none before), six kites sail over the roofs and the park, each
//             tied by a taut string to a post with a reel on a roof (the places of KITE_POSTS in the mid layer, parallax-smog-mid-
//             plan.js, drawn by its 'over' pass): five diamond kites and a box kite in muted fabric (sky blue, sun yellow, white,
//             leaf green, terracotta), each with a tail of bows swaying by phase, rising into place as the life stage begins, swaying
//             and dipping on a slow wind. Small (at most about 60 px) and above y 440, so they hardly cross the player's zone.
//   smogbank  phase 'near': low banks of smog hugging the street behind the player's zone (y > 760), soft, slow, at most 0.14 alpha,
//             thinning as 1 - stage(h, 'smog') and gone when the sky is clean. Quiet.
// Sprites are flourish-smog-ground-sprites.js (warmGroundFx bakes them ahead of the fight); nothing is allocated per frame.
import { W, hash, wrap } from './sprites.js';
import { TAU } from '../core/math.js';
import { stage, healOf } from './heal.js';
import { KITE_POSTS } from './parallax-smog-mid-plan.js';
import { FABRIC, KITE, BOW, BANK, diamond, boxKite, bow, bank } from './flourish-smog-ground-sprites.js';

export const KITES = [ // the post it is tied to, where it flies relative to the post's foot (dx, rise), scale, fabric, a box kite or not, phase
  { post: 0, dx: 40, rise: 360, s: 1, k: 0, box: false, ph: 0.1 },
  { post: 0, dx: 130, rise: 470, s: 0.8, k: 1, box: false, ph: 0.55 },
  { post: 1, dx: -60, rise: 330, s: 1.1, k: 3, box: true, ph: 0.8 },
  { post: 2, dx: -30, rise: 410, s: 1, k: 4, box: false, ph: 0.3 },
  { post: 2, dx: 70, rise: 330, s: 0.85, k: 3, box: false, ph: 0.95 },
  { post: 3, dx: 90, rise: 470, s: 1, k: 2, box: false, ph: 0.65 },
];
export const TAIL = { bows: 4, gap: 12, swing: 2.4 }; // bows a tail carries, px between them, how far they swing
export const STRING = { color: 'rgba(236,228,208,0.55)', width: 1, belly: 22 };
export const BANKS = { rows: [872, 918, 962, 1004], speed: [5, 12], alpha: 0.14 }; // y of each bank's middle; px/s; its strongest alpha

// Where kite i hangs at time t, and how far it leans: o = { x, y, a } (screen px, rad); one scratch object.
export function kiteAt(i, t, x0, top, o = {}) {
  const [K, P] = [KITES[i], KITE_POSTS[KITES[i].post]];
  const ph = K.ph * TAU;
  o.ax = x0 + P[0];
  o.ay = top + P[1] - 14;
  o.x = o.ax + K.dx + Math.sin(t * 0.3 + ph) * 36 + Math.sin(t * 0.71 + ph * 3) * 8;
  o.y = o.ay - K.rise + Math.sin(t * 0.23 + ph * 2) * 20;
  o.a = Math.sin(t * 0.4 + ph) * 0.22;
  return o;
}
const AT = {};

// Where the j-th bow of a kite's tail hangs sideways: down the lean of the kite, swaying more the further down.
const tailX = (p, K, kx, t, j, sh) => kx - Math.sin(p.a) * (sh * 0.5 * K.s + 6 + j * TAIL.gap) + Math.sin(t * 1.7 + j * 0.9 + K.ph * 7) * (TAIL.swing + j * 1.4);

function kites(ctx, env, x0, top) {
  const h = healOf(env.v);
  const life = stage(h, 'life');
  if (life <= 0.001) return;
  const t = env.t;
  ctx.save();
  ctx.strokeStyle = STRING.color;
  ctx.lineWidth = STRING.width;
  for (let i = 0; i < KITES.length; i++) {
    if (env.quality < 1 && i % 2) continue;
    const K = KITES[i];
    const p = kiteAt(i, t, x0, top, AT);
    const sw = K.box ? KITE.boxW : KITE.w;
    const sh = K.box ? KITE.boxH : KITE.h;
    const kx = p.x;
    const ky = p.y + (1 - life) * 140; // they rise into place as the life stage begins
    ctx.globalAlpha = life;
    ctx.beginPath();
    ctx.moveTo(p.ax, p.ay);
    ctx.quadraticCurveTo((p.ax + kx) / 2 + STRING.belly * Math.sin(t * 0.4 + K.ph * 9), (p.ay + ky) / 2 + STRING.belly, kx + Math.sin(p.a) * sh * 0.4 * K.s, ky + Math.cos(p.a) * sh * 0.4 * K.s);
    ctx.stroke();
    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(p.a);
    ctx.scale(K.s, K.s);
    ctx.drawImage(K.box ? boxKite(K.k) : diamond(K.k), -sw / 2, -sh / 2);
    ctx.restore();
    ctx.beginPath(); // the tail: a cord down the wind, a bow every few px
    ctx.moveTo(kx - Math.sin(p.a) * sh * 0.5 * K.s, ky + Math.cos(p.a) * sh * 0.5 * K.s);
    for (let j = 0; j < TAIL.bows; j++) ctx.lineTo(tailX(p, K, kx, t, j, sh), ky + Math.cos(p.a) * (sh * 0.5 * K.s + 6 + j * TAIL.gap));
    ctx.stroke();
    for (let j = 0; j < TAIL.bows; j++) ctx.drawImage(bow(K.k + j), tailX(p, K, kx, t, j, sh) - BOW.w / 2, ky + Math.cos(p.a) * (sh * 0.5 * K.s + 6 + j * TAIL.gap) - BOW.h / 2);
  }
  ctx.restore();
}

function smogbank(ctx, env) {
  const h = healOf(env.v);
  const thick = 1 - stage(h, 'smog');
  if (thick <= 0.001) return;
  const t = env.t;
  ctx.save();
  for (let i = 0; i < BANKS.rows.length; i++) {
    if (env.quality < 1 && i % 2) continue;
    const k = 1400 + i * 9;
    const w = BANK.w * (0.9 + 0.5 * hash(k));
    const x = wrap(hash(k + 1) * (W + w) + t * (BANKS.speed[0] + (BANKS.speed[1] - BANKS.speed[0]) * hash(k + 2)), -w, W + w);
    ctx.globalAlpha = BANKS.alpha * thick * (0.62 + 0.38 * Math.sin(t * 0.11 + hash(k + 3) * TAU));
    ctx.drawImage(bank(), x - w / 2, BANKS.rows[i] - (BANK.h * w) / BANK.w / 2, w, (BANK.h * w) / BANK.w);
  }
  ctx.restore();
}

// Paint the sprites these draw, so none is baked mid-fight (warm-breath.js calls it).
export function warmGroundFx() {
  FABRIC.forEach((c, k) => {
    diamond(k);
    boxKite(k);
    bow(k);
  });
  bank();
}

export const FLOURISH_GROUND = { kites: { mid: kites }, smogbank: { near: smogbank } };
