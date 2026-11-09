// The Thunder Galleon's fire (World 13, Sunset Armada; galleon.js runs it after galleon-fx.js): the furnace in
// the keel banked low in the first phase and roaring from the second, flames pouring out of the nozzle, the
// door's light flickering, heat shimmering up the boiler and embers falling, and in the last phase the
// broadside: muzzle flashes along both gun decks, each followed by a puff of smoke, and banks of
// smoke rolling along the belly. In boss coordinates; cached sprites only, nothing allocated per frame;
// the smoke is opaque, so only in the boss's own pass. A destroyed part's fire goes out with it.
import { glow, soft, star, hash } from '../sprites.js';
import { alive } from './parts.js';
import { smooth } from '../../core/math.js';
import { DOOR, GAUGE, NOZZLE_Y } from './galleon-keel.js';
import { GUNS, FEED } from './galleon-gun.js';
import { flame, billow, needle } from './galleon-sprites.js';

const FIRE = '#ff8a2a';
const AETHER = '#4de3ff'; // the world's weak colour, the cyan the feed pipes carry

// Aether running along each deck's feed pipe: two sparks of cyan light chasing each other the length of it.
function feeds(ctx, b, t, k) {
  for (let n = 0; n < 2; n++) {
    const dir = n ? -1 : 1;
    const p = alive(b, n ? 'gunR' : 'gunL');
    if (!p) continue;
    for (let j = 0; j < 2; j++) {
      const u = (t * 0.5 + j * 0.5 + n * 0.23) % 1;
      ctx.globalAlpha = k * Math.sin(Math.PI * u) * 0.85;
      ctx.drawImage(glow(AETHER), p.x - b.x + dir * (FEED[0] + (FEED[1] - FEED[0]) * u) - 10, p.y - b.y + FEED[2] - 10, 20, 20);
    }
  }
}

// The door's light, the tongues from the nozzle (one banked, three roaring, five in the last phase; opaque,
// so in the own pass), heat veiling the boiler, embers dropping.
function furnace(ctx, b, t, k, ph, own) {
  const p = alive(b, 'keel');
  if (!p) return;
  const kx = p.x - b.x;
  const ky = p.y - b.y;
  const fl = 0.07 * Math.sin(t * 9.3) + 0.04 * Math.sin(t * 17.1);
  const n = ph === 0 ? 1 : ph === 1 ? 3 : 5;
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    for (let j = 0; j < n; j++) {
      const s = [0.4, 0.95, 1.15][ph] * (0.86 + 0.14 * Math.sin(t * (11 + j * 3) + j));
      const w = n === 1 ? 1.7 : 0.9 + 0.2 * Math.sin(t * 6 + j);
      ctx.globalAlpha = [0.8, 0.92, 1][ph];
      ctx.drawImage(flame(Math.floor(t * 14 + j * 1.7)), kx + (j - (n - 1) / 2) * 14 - 22 * w * s, ky + NOZZLE_Y - 2, 44 * w * s, 72 * s);
    }
    for (let j = 0; j < 4 + 5 * ph && ph > 0; j++) { // embers dropping
      const u = (t * (0.4 + 0.2 * hash(j + 3)) + hash(j)) % 1;
      ctx.globalAlpha = (1 - u) * 0.95;
      ctx.drawImage(soft('#ff9a2a'), kx + (hash(j + 9) - 0.5) * 56 + Math.sin(t * 2 + j) * 7 - 3.5, ky + NOZZLE_Y + 8 + u * 62 - 3.5, 7, 7);
    }
    ctx.globalCompositeOperation = 'lighter';
  }
  const r = 48 + 8 * ph;
  ctx.globalAlpha = k * (0.22 + 0.1 * ph + fl);
  ctx.drawImage(glow(FIRE), kx + DOOR[0] - r, ky + DOOR[1] - r, r * 2, r * 2);
  ctx.globalAlpha = k * (0.1 + 0.08 * ph + fl * 0.5);
  ctx.drawImage(glow(FIRE), kx - 60, ky + NOZZLE_Y - 30, 120, 90);
  for (let j = 0; j < 6 && ph > 0; j++) { // heat rising off the boiler
    const u = (t * 0.4 + j / 6) % 1;
    ctx.globalAlpha = k * Math.sin(Math.PI * u) * 0.1 * ph;
    ctx.drawImage(soft('#ffc880'), kx + Math.sin(j * 2.3 + t * 0.7) * 44 - 8, ky + 36 - u * 78, 16, 36);
  }
}

// One gun's cycle: a flash for its first 0.16 s, then smoke for the rest; `u` seconds into it.
const CYCLE = 2.7;
const turn = (t, i, dir) => (t + i * 0.43 + (dir > 0 ? 0 : 0.95) + 0.3 * (i % 2)) % CYCLE;

function broadside(ctx, b, t, k, own) {
  for (let n = 0; n < 2; n++) {
    const dir = n ? -1 : 1; // the deck's frame faces left (as drawn) or right (mirrored)
    const p = alive(b, n ? 'gunR' : 'gunL');
    if (!p) continue;
    for (let i = 0; i < GUNS.length; i++) {
      const u = turn(t, i, dir);
      const x = p.x - b.x + dir * GUNS[i][0];
      const y = p.y - b.y + GUNS[i][1];
      if (own) {
        if (u < 0.05) continue;
        const v = u / CYCLE;
        const r = 10 + 30 * v;
        ctx.globalAlpha = (1 - v) * Math.min(1, u * 8) * 0.85;
        ctx.drawImage(billow(i), x - dir * 24 * v - r, y - 36 * v - r * 0.6, r * 2, r * 1.17);
      } else if (u < 0.16) {
        const f = 1 - u / 0.16;
        ctx.globalAlpha = k * f;
        ctx.drawImage(star('#ffd070'), x - 22 * (0.6 + f), y - 22 * (0.6 + f), 44 * (0.6 + f), 44 * (0.6 + f));
        ctx.globalAlpha = k * f * 0.8;
        ctx.drawImage(glow('#ff9a3a'), x - 30, y - 30, 60, 60);
      }
    }
  }
}

// Banks of smoke rolling along the belly from one side to the other, lit gold on their upper edge.
function banks(ctx, t, k, own) {
  for (let j = 0; j < 8; j++) {
    const u = (t * (0.05 + 0.012 * (j % 3)) + j / 8) % 1;
    const x = -330 + 660 * u;
    const y = 130 + 26 * Math.sin(j * 2.1 + t * 0.5);
    const w = 120 + 30 * Math.sin(j * 5.3);
    const a = Math.sin(Math.PI * u) * (x > -90 && x < 90 ? 0.5 : 1); // thinner over the keel, which is the thing to shoot
    if (own) {
      ctx.globalAlpha = a * 0.6;
      ctx.drawImage(billow(j), x - w / 2, y - w * 0.29, w, w * 0.58);
    } else {
      ctx.globalAlpha = k * a * 0.14;
      ctx.drawImage(glow('#ff9a5a'), x - w * 0.4, y - w * 0.36, w * 0.8, w * 0.4);
    }
  }
}

// The pressure gauge's needle (own pass): creeping up into the red as the furnace is fed, trembling.
function gauge(ctx, b, t, ph, since) {
  const p = alive(b, 'keel');
  if (!p) return;
  const rise = ph === 0 ? 0 : ph === 1 ? smooth((t - since) / 1.5) : 1 + smooth((t - since) / 1.5);
  const a = Math.PI * 0.75 + Math.PI * 1.5 * (0.5 + 0.25 * Math.min(rise, 1) + 0.15 * Math.max(rise - 1, 0) + 0.008 * rise * Math.sin(t * 23));
  ctx.save();
  ctx.translate(p.x - b.x + GAUGE[0], p.y - b.y + GAUGE[1]);
  ctx.rotate(a);
  ctx.drawImage(needle(), -6, -4);
  ctx.restore();
}

export function fire(ctx, b, t, k, own, since) {
  const ph = b.phase;
  furnace(ctx, b, t, k, ph, own);
  feeds(ctx, b, t, k);
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    gauge(ctx, b, t, ph, since);
    ctx.globalCompositeOperation = 'lighter';
  }
  if (ph > 1) {
    if (own) {
      ctx.globalCompositeOperation = 'source-over';
      broadside(ctx, b, t, k, true);
      banks(ctx, t, k, true);
      ctx.globalCompositeOperation = 'lighter';
    }
    broadside(ctx, b, t, k, false);
    banks(ctx, t, k, false);
  }
  ctx.globalAlpha = 1;
}
