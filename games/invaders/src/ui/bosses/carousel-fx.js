// The Grand Carousel's live extras (World 14, Ember Carnival; carousel.js runs them): the canopy turning, its
// rim of bulbs chasing round, the pennants on the crown and the horses' poles rippling, the two small riders
// bobbing on the far poles, the organ's pipe mouths playing in cyan and breathing steam, the drum's bulbs
// chasing the other way, the lanterns' flames flickering, glints on the gilt. In boss coordinates; cached
// sprites only, nothing allocated per frame. Everything opaque (canopy, riders, pennants, steam) is drawn
// only in the boss's own pass (`own`): the darkness pass runs again over the aliens. A destroyed part takes
// what hangs on it along: no pennant, no flame, no pipe light, no chase.
import { glow, soft, star } from '../sprites.js';
import { clamp } from '../../core/math.js';
import { alive } from './parts.js';
import { TAU, CYAN, BULB } from './carousel-kit.js';
import { FRAMES, PX, PY, eaveY } from './carousel-canopy.js';
import { BULBS as RIM } from './carousel-valance.js';
import { POLE_X } from './carousel-column.js';
import { PIPES } from './carousel-organ.js';
import { LENS } from './carousel-organ-front.js';
import { BULBS as DRUM, CORE } from './carousel-drum.js';
import { FLAME } from './carousel-lamp.js';
import { POLE, DROP } from './carousel-pole.js';
import { liveCanopy, pennant, farHorse } from './carousel-sprites.js';

const OMEGA = [0.5, 1.3, 2.2]; // rad/s the canopy turns, by phase
const PAIR = TAU / 12; // the canopy looks the same after one pair of gores
const CHASE = [3, 6.5, 11]; // bulbs a second
const PINK = '#ff9ad0';
export const SPARK = ['#4be08a', PINK, '#ffd27a', '#c8a8ff']; // the last phase's falling sparks
const GLINTS = [[0, -146, 'crown'], [-259, -109, 'horseL'], [259, -109, 'horseR'], [-120, -60], [120, -60], [-300, -66], [300, -66], [-60, 52, 'drum'], [60, 52, 'drum']]; // [x, y, the part it sits on]

// A comet of light running round n bulbs at `speed` a second, `dir` 1 or -1: how bright bulb i is.
const comet = (t, i, n, speed, dir) => {
  const d = (((t * speed * dir - i * dir) % n) + n) % n; // how far behind the head bulb i is, 0..n
  return d < 4 ? (1 - d / 4) ** 1.6 : 0;
};

function bulbs(ctx, list, ox, oy, t, k, ph, dir) {
  for (let i = 0; i < list.length; i++) {
    const a = comet(t, i, list.length, CHASE[ph], dir);
    if (a <= 0.03) continue;
    ctx.globalAlpha = k * a;
    ctx.drawImage(glow(i % 2 ? PINK : BULB), ox + list[i].x - 11, oy + list[i].y - 11, 22, 22);
    if (a > 0.75) {
      ctx.globalAlpha = k * (a - 0.75) * 3;
      ctx.drawImage(star('#ffffff'), ox + list[i].x - 8, oy + list[i].y - 8, 16, 16);
    }
  }
}

// The canopy turns under the crown and the horses (their shapes are cut out of the frames). Its angle
// is summed frame by frame per boss, so a faster phase speeds it up without a jump.
const spin = new WeakMap(); // boss -> { a: the canopy's angle, t: when it was last drawn }
function canopy(ctx, b, t, ph) {
  const m = spin.get(b) ?? { a: t * OMEGA[ph], t };
  m.a += OMEGA[ph] * clamp(t - m.t, 0, 0.1);
  m.t = t;
  spin.set(b, m);
  const i = Math.floor((m.a % PAIR) / PAIR * FRAMES);
  ctx.globalAlpha = 1;
  ctx.drawImage(liveCanopy(i), -PX, -PY);
}

// A pennant flying right from (x, y), `flip` -1 for one flying left, `s` its scale.
function flag(ctx, x, y, n, flip, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip * s, s);
  ctx.drawImage(pennant(n), 0, -11);
  ctx.restore();
}

// The two small riders on the far poles, bobbing in turn.
function riders(ctx, t, ph) {
  for (const side of [-1, 1]) {
    const y = -22 + 7 * Math.sin(t * (1.6 + 1.1 * ph) + (side > 0 ? Math.PI : 0));
    ctx.save();
    ctx.translate(side * POLE_X, y);
    ctx.scale(side < 0 ? 1 : -1, 1);
    ctx.drawImage(farHorse(), -40, -38);
    ctx.restore();
  }
}

// The organ's pipe mouths: each lights cyan on a beat of its own, like the bars of a level meter; the lens
// at the medallion's heart breathes. The own pass adds the steam that rises from three pipes once it is
// loud (the second phase and the third).
function organ(ctx, b, t, k, own, ph) {
  const p = alive(b, 'organ');
  if (!p) return;
  const [ox, oy] = [p.x - b.x, p.y - b.y];
  if (own) {
    if (ph) for (const i of [2, 5, 8]) for (let j = 0; j < 3; j++) {
      const u = (t * 0.45 + j / 3 + i * 0.19) % 1;
      const r = 3 + 8 * u;
      ctx.globalAlpha = (1 - u) * Math.min(1, u * 6) * (0.4 + 0.1 * ph);
      ctx.drawImage(soft('#ffd8f0'), ox + PIPES[i].x + 6 * u + Math.sin(u * 6 + j + i) * 3 - r, oy + PIPES[i].top - 30 * u - r, r * 2, r * 1.6);
    }
    return;
  }
  for (const q of PIPES) {
    const beat = Math.max(0, Math.sin(t * (4 + 2.2 * ph) + q.i * 1.7)) ** 2;
    ctx.globalAlpha = k * (0.18 + 0.5 * beat);
    ctx.drawImage(glow(CYAN), ox + q.x - 13, oy + q.mouth + 3 - 13, 26, 26);
  }
  ctx.globalAlpha = k * (0.3 + 0.18 * Math.sin(t * 5.4));
  ctx.drawImage(glow('#e8ffff'), ox + LENS[0] - 22, oy + LENS[1] - 22, 44, 44);
}

// The drum's core pulsing and its two rings of bulbs chasing the way opposite to the canopy's.
function drum(ctx, b, t, k, ph) {
  const p = alive(b, 'drum');
  if (!p) return;
  const [ox, oy] = [p.x - b.x, p.y - b.y];
  ctx.globalAlpha = k * (0.28 + 0.2 * Math.sin(t * 6.3));
  ctx.drawImage(glow(CYAN), ox + CORE[0] - 38, oy + CORE[1] - 38, 76, 76);
  bulbs(ctx, DRUM.slice(0, 9), ox, oy, t, k, ph, -1);
  bulbs(ctx, DRUM.slice(9), ox, oy, t, k, ph, 1);
}

// The lanterns' flames: a cyan glow that flickers, swinging a little on its chain.
function lamps(ctx, b, t, k) {
  [['lampL', 0], ['lampR', 1]].forEach(([id, i]) => {
    const p = alive(b, id);
    if (!p) return;
    const x = p.x - b.x + 3 * Math.sin(t * 1.6 + i * 2.2);
    ctx.globalAlpha = k * (0.34 + 0.12 * Math.sin(t * 9 + i * 2) + 0.08 * Math.sin(t * 23 + i));
    ctx.drawImage(glow(CYAN), x - 26, p.y - b.y + FLAME[1] - 26, 52, 52);
  });
}

// The horses: a pennant on each pole in the own pass, the jewel at the breast pulsing, a glint on the ball.
function horses(ctx, b, t, k, own) {
  const n = Math.floor(t * 9);
  [['horseL', 1], ['horseR', -1]].forEach(([id, side], i) => {
    const p = alive(b, id);
    if (!p) return;
    const [px, py] = [p.x - b.x, p.y - b.y];
    if (own) {
      flag(ctx, px + side * (POLE + 0.5), py - 57, n + i * 3, side, 0.6);
      return;
    }
    ctx.globalAlpha = k * (0.4 + 0.2 * Math.sin(t * 4 + i * 2));
    ctx.drawImage(glow(PINK), px - side * 30 - 12, py + DROP + 2 - 12, 24, 24);
  });
}

// The crown: a long pennant on its finial, the lantern windows' light breathing.
function crown(ctx, b, t, k, own) {
  const p = alive(b, 'crown');
  if (!p) return;
  if (own) {
    flag(ctx, p.x - b.x + 3, p.y - b.y - 29.5, Math.floor(t * 9), 1, 0.85);
    return;
  }
  ctx.globalAlpha = k * (0.26 + 0.08 * Math.sin(t * 2.6));
  ctx.drawImage(glow('#ffb44a'), p.x - b.x - 40, p.y - b.y + 4 - 40, 80, 80);
}

// The last phase: sparks of every firework colour shed from the valance, falling a little and fading, each fall
// starting over at a new place along the rim.
function sparks(ctx, t, k) {
  for (let i = 0; i < 18; i++) {
    const n = t * 0.62 + i * 0.173;
    const u = n % 1;
    const x = -300 + ((i * 0.618 + Math.floor(n) * 0.37) % 1) * 600;
    ctx.globalAlpha = k * Math.sin(Math.PI * u) * 0.9;
    ctx.drawImage(glow(SPARK[i & 3]), x - 7, eaveY(x) + 24 + u * 64 - 7, 14, 14);
  }
}

// Twinkles on the gilt: the finial, the pole tops, the moulding, the drum hoops.
function glints(ctx, b, t, k) {
  for (let i = 0; i < GLINTS.length; i++) {
    if (GLINTS[i][2] && !alive(b, GLINTS[i][2])) continue;
    ctx.globalAlpha = k * Math.max(0, Math.sin(t * (0.8 + 0.13 * i) + i * 2.1)) ** 12;
    ctx.drawImage(star('#fff0c0'), GLINTS[i][0] - 9, GLINTS[i][1] - 9, 18, 18);
  }
}

export function fx(ctx, b, t, k, own) {
  const ph = clamp(b.phase, 0, 2);
  if (own) {
    ctx.globalCompositeOperation = 'source-over'; // opaque things, in the live pass's additive state
    canopy(ctx, b, t, ph);
    riders(ctx, t, ph);
    horses(ctx, b, t, k, true);
    crown(ctx, b, t, k, true);
    organ(ctx, b, t, k, true, ph);
    ctx.globalCompositeOperation = 'lighter';
  }
  bulbs(ctx, RIM, 0, 0, t, k, ph, 1);
  organ(ctx, b, t, k, false, ph);
  drum(ctx, b, t, k, ph);
  lamps(ctx, b, t, k);
  horses(ctx, b, t, k, false);
  crown(ctx, b, t, k, false);
  if (ph > 1) sparks(ctx, t, k);
  glints(ctx, b, t, k);
  ctx.globalAlpha = 1;
}
