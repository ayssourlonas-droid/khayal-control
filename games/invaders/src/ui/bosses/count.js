// World 10, Hollow Night: the Crimson Count. A vampire lord towering over the ship, a black coat
// buttoned to a silk cravat, a brass chain down to the heart-amulet, and the cape spread to either
// side like a bat's wings (the body in count-body.js; the parts in count-cape.js, count-parts.js and
// count-claw.js). Each phase draws more of what he is: the hover phase lights the cape's ghost-wings
// wider than the cape itself, with crimson running down its ribs; the orbit phase breaks him into a
// swarm of bats circling the heart (art only: the divers the core sends are the same bats). The
// heart beats, the eyes redden, the claws charge.
import { bloom, neon } from './kit.js';
import { glow, hash } from '../sprites.js';
import { batBeat } from '../flourish-4.js';
import { TAU, smooth } from '../../core/math.js';
import { FACE, EYE } from './count-parts.js';
import { HAND } from './count-claw.js';
import { CAPE, SHOULDER, EDGE } from './count-cape.js';
import { body, ghost } from './count-body.js';
import { alive, glowAt } from './parts.js';

const BATS = 30;

// The phases' lights over the hull: the wings widen in light, then the swarm's orbits and the heart
// burning through the coat.
const rage = [null, (l, S) => ghost(l, S, 1.1, 0.9), (l, S) => {
  const heart = S.def.parts.find((p) => p.id === 'heart');
  ghost(l, S, 1.17, 1);
  bloom(l, heart.dx, heart.dy, 130, S.pal.weak, 0.28);
  for (const [rx, tilt] of [[92, 0.3], [150, -0.22], [200, 0.08]]) {
    l.beginPath();
    l.ellipse(heart.dx, heart.dy, rx, rx * 0.5, tilt, 0, TAU);
    neon(l, S.pal.weak, 0.8, 0.22);
  }
}];

// Bat j of the swarm at time t, grown e (0..1) of the way out of the heart: its offset from the
// heart and its size, in one scratch array (nothing is allocated per frame). Every bat has an orbit,
// a speed and a direction of its own.
const spot = [0, 0, 0];
function orbit(j, t, e) {
  const r = (78 + hash(j * 3) * 130) * e;
  const a = hash(j * 3 + 1) * TAU + t * (0.5 + hash(j * 3 + 2) * 0.9) * (j % 2 ? 1 : -1);
  spot[0] = Math.cos(a) * r;
  spot[1] = Math.sin(a) * r * 0.5;
  spot[2] = (0.55 + hash(j + 60) * 0.55) * (1 + Math.sin(a) * 0.18);
  return spot;
}

// The swarm: dark bats on elliptical orbits round the heart, spiralling out of it when the phase
// begins (`since`), each beating to its own time; every third has red eyes. Cached sprites only.
function swarm(ctx, b, t, k, own, since) {
  if (b.phase < 2) return;
  const heart = b.parts.find((p) => p.id === 'heart'); // alive or a wreck, the bats keep its place
  const e = smooth((t - since) / 2);
  const cx = heart.x - b.x;
  const cy = heart.y - b.y;
  if (own) { // the bodies in the boss's own pass only: the darkness pass is drawn over the aliens,
    ctx.globalCompositeOperation = 'source-over'; // and would black them out
    ctx.globalAlpha = e;
    for (let j = 0; j < BATS; j++) {
      const [x, y, s] = orbit(j, t, e);
      ctx.drawImage(batBeat(Math.floor(t * (8 + hash(j + 90) * 4) + j)), cx + x - 32 * s, cy + y - 20 * s, 64 * s, 40 * s);
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = k * e * 0.9;
  for (let j = 0; j < BATS; j += 3) {
    const [x, y, s] = orbit(j, t, e);
    ctx.drawImage(glow(EYE), cx + x - 4, cy + y - 12 * s, 8, 8);
  }
}

export default {
  pad: 60,
  crack: EYE,
  margins: { wingL: 50, wingR: 50, collar: 44, clawL: 50, clawR: 50, heart: 44 },
  hull: body,
  parts: { ...CAPE, ...FACE, ...HAND },
  rage,
  // The heart beating, the eyes reddening and flaring, a charge gathering in each palm, crimson
  // running down the cape's ribs, and in the last phase the swarm.
  live(ctx, b, t, k, own, since) {
    const ph = b.phase;
    const heart = alive(b, 'heart');
    if (heart) {
      const beat = Math.max(0, Math.sin(t * (4.2 + ph * 0.8))) ** 6 + 0.6 * Math.max(0, Math.sin(t * (4.2 + ph * 0.8) - 0.9)) ** 6;
      glowAt(ctx, b, heart, EYE, 0, 0, 66 + 26 * beat, k * (0.22 + 0.4 * beat));
      glowAt(ctx, b, heart, '#ffd0d8', 0, 0, 14 + 8 * beat, k * 0.5 * beat);
    }
    const head = alive(b, 'head');
    if (head) {
      for (const s of [-1, 1]) {
        const a = k * (0.28 + ph * 0.12) * (0.85 + 0.15 * Math.sin(t * 7 + s));
        glowAt(ctx, b, head, EYE, s * 17.6, -6.6, 17 + ph * 3, a);
        glowAt(ctx, b, head, '#ffb0bc', s * 17.6, -6.6, 7, a * 0.8);
      }
    }
    for (const id of ['clawL', 'clawR']) {
      const c = alive(b, id);
      if (c) glowAt(ctx, b, c, EYE, id === 'clawL' ? 10 : -10, -9, 30 + 6 * Math.sin(t * 3 + (id === 'clawR' ? 1.6 : 0)), k * 0.26);
    }
    if (ph > 0) {
      for (const id of ['wingL', 'wingR']) {
        const w = alive(b, id);
        if (!w) continue;
        const m = id === 'wingL' ? 1 : -1; // the right wing is the left one mirrored
        for (let i = 0; i < 6; i++) { // a pulse of light running out along each rib
          const u = (t * (0.28 + ph * 0.14) + i * 0.17) % 1;
          const [ex, ey] = EDGE[i + 1];
          ctx.globalAlpha = k * Math.sin(u * Math.PI) * 0.7;
          ctx.drawImage(glow(EYE), m * (SHOULDER[0] + (ex - SHOULDER[0]) * u) - 9, SHOULDER[1] + (ey - SHOULDER[1]) * u - 9, 18, 18);
        }
      }
    }
    swarm(ctx, b, t, k, own, since);
    ctx.globalAlpha = 1;
  },
};
