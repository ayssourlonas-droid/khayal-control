// Effect state. Everything a renderer draws on top of the world lives on one `fx` object (world px,
// y down; the frame is 1920x1080):
//   particles [see particles.js]
//   rings     shockwaves   { x, y, r, r0, maxR, width, color, kind, life, max }
//             r eases from r0 to maxR; r0 > maxR is an inward ring. kind 'ring'|'charge'|'shield'
//   flashes   glow flashes { x, y, r, color, alpha, full, ramp, tag, life, max }
//             full: lights the whole frame (x, y, r unused); ramp: the share of its life spent
//             brightening before it fades (0 fades from the start, 1 a charge that peaks at its end);
//             alpha is the peak; tag names the cause
//   popups    floating text { x, y, vy, text, color, scale, life, max, points? } (points: the text is
//             a score, written in the level's digits)
//   shake     screen-shake amplitude in px; shakeX/shakeY the offset to apply this frame
//   slow      1, or SLOW_FACTOR during slow motion: main multiplies the logic dt by it
//   bulletTime true while bullet time runs (tint the frame)
//   density   1, or less when the quality scaler halves particle spawns
//   shieldT   fx.time of the last shield flare (react-fight throttles on it); time = real seconds run
// stepFx takes real frame time. Particles, rings, flashes and pop-ups follow `slow` so slow motion
// shows; the shake does not.
import { stepParticles } from './particles.js';
import { stepShake } from './camera.js';
import { prune } from '../core/util.js';
import { MID_X, MID_Y } from '../core/kinds.js';

const SLOW_FACTOR = 0.3;
const SLOWMO_SECS = 0.8; // real seconds
const CAP = 64; // per list, oldest dropped

export function createFx() {
  return {
    particles: [], rings: [], flashes: [], popups: [],
    shake: 0, shakeX: 0, shakeY: 0, slow: 1, slowLeft: 0, time: 0,
    bulletTime: false, density: 1, shieldT: -1,
  };
}

export function startSlowMo(fx, secs = SLOWMO_SECS) {
  fx.slowLeft = secs;
  fx.slow = SLOW_FACTOR;
}

function push(list, e) {
  if (list.length >= CAP) list.shift();
  list.push({ ...e, max: e.life });
}

export const addFlash = (fx, f) => push(fx.flashes, {
  x: MID_X, y: MID_Y, r: 100, color: '#ffffff', alpha: 1, full: false, ramp: 0, tag: 'glow', life: 0.15, ...f,
});

export const addRing = (fx, r) => {
  const ring = { x: MID_X, y: MID_Y, r0: 0, maxR: 100, width: 4, color: '#ffffff', kind: 'ring', life: 0.5, ...r };
  push(fx.rings, { ...ring, r: ring.r0 });
};

export const addPopup = (fx, p) => push(fx.popups, {
  x: MID_X, y: MID_Y, vy: -60, text: '', color: '#ffffff', scale: 1, life: 1, ...p,
});

// The row the clear's "+N BONUS" pops up on (react-fight.js; react-world.js keeps swept points off it).
export const BONUS_Y = 500;

// How strong a flash is now, 0..1: brightening through the first `ramp` of its life, fading after.
export function flashK(f) {
  const t = 1 - f.life / f.max;
  if (t < f.ramp) return t / f.ramp;
  return f.ramp < 1 ? (1 - t) / (1 - f.ramp) : 1; // a charge at its very end (life rounding) stays at its peak
}

// Count every entry's life down, drop the spent ones and step the rest.
const stepTimed = (list, dt, onStep) => prune(list, (e) => {
  e.life -= dt;
  if (e.life <= 0) return false;
  onStep?.(e, dt);
  return true;
});

export function stepFx(fx, dt) {
  fx.time += dt;
  fx.slowLeft = Math.max(0, fx.slowLeft - dt);
  fx.slow = fx.slowLeft > 0 ? SLOW_FACTOR : 1;
  const sdt = dt * fx.slow;

  stepParticles(fx.particles, sdt);
  stepTimed(fx.rings, sdt, (r) => {
    const t = 1 - r.life / r.max;
    r.r = r.r0 + (r.maxR - r.r0) * (1 - (1 - t) * (1 - t)); // ease-out
  });
  stepTimed(fx.flashes, sdt);
  stepTimed(fx.popups, sdt, (p, d) => { p.y += p.vy * d; });
  stepShake(fx, dt);
}
