// Reactions to pickups and to bullet time.
import { addFlash, addPopup, addRing, BONUS_Y } from './fx.js';
import { addParticle } from './particles.js';
import { count, powerColor, smoke, sparks } from './emit.js';

const POINTS = '#fff6c8'; // a pickup's points, in the score's pale gold
const STREAK = 0.5; // s a pickup swept up at the clear takes to fly into the ship
const TAIL = 5; // glows behind its head
const LAG = 0.03; // s between two of them
const FADE = 0.35; // s the ship's glow takes to fade once they have landed
const GLOW_R = 70; // px the ship's glow starts at, then grows by GLOW_R_STEP for each pickup after the first
const GLOW_R_STEP = 7;
const GLOW_R_MAX = 1.5 * GLOW_R;
const GLOW_ALPHA = 0.7; // and brightens by GLOW_ALPHA_STEP, to a peak of 1
const GLOW_ALPHA_STEP = 0.1;

const BONUS_GAP = 64; // px

// Where a swept pickup's points pop up: where it was, unless that is on the bonus row (the two pop-ups
// rise at the same speed, so clear at the start is clear throughout), in which case BONUS_GAP above or below it.
const offBonus = (y) => (Math.abs(y - BONUS_Y) >= BONUS_GAP ? y : y < BONUS_Y ? BONUS_Y - BONUS_GAP : BONUS_Y + BONUS_GAP);

// A pickup caught: a ring and sparks in its colour, its name and, above it, its points.
function pickup(fx, ev, rng) {
  const color = powerColor(ev.kind);
  addRing(fx, { x: ev.x, y: ev.y, maxR: 90, color, life: 0.4 });
  sparks(fx, rng, ev.x, ev.y, 8, 260, [color, '#ffffff']);
  const text = ev.kind === 'bomb' ? '+1 BOMB' : String(ev.kind).toUpperCase();
  addPopup(fx, { x: ev.x, y: ev.y - 24, text, color, scale: 1.3, life: 1.2 });
  addPopup(fx, { x: ev.x, y: ev.y - 70, text: '+' + ev.points, points: true, color: POINTS, life: 1.2 });
}

// Swept up at the clear (R51): its points pop up where it was, and a comet in its colour flies from
// there into the ship, which glows as it lands. The tail glows start further back on the same line
// and live longer by as much, so every one of them lands on the ship.
function sweep(fx, ev, rng, world) {
  const color = powerColor(ev.kind);
  addPopup(fx, { x: ev.x, y: offBonus(ev.y - 24), text: '+' + ev.points, points: true, color: POINTS, scale: 1.2, life: 1.4 });
  const ship = world?.ship;
  if (!ship) return;
  const vx = (ship.x - ev.x) / STREAK;
  const vy = (ship.y - ev.y) / STREAK;
  addParticle(fx, { x: ev.x, y: ev.y, vx, vy, life: STREAK, size: 4, color: '#ffffff', kind: 'spark', additive: true });
  for (let i = 0, m = count(fx, TAIL); i < m; i++) {
    const lag = (i + 1) * LAG;
    addParticle(fx, {
      x: ev.x - vx * lag, y: ev.y - vy * lag, vx, vy, life: STREAK + lag, size: 3.4 - i * 0.5,
      color, kind: 'ember', additive: true,
    });
  }
  shipGlow(fx, ship, color, ev.nth);
}

// The glow for the sweep's nth pickup (0 first): bigger and brighter for each, up to a cap.
const glowAt = (nth) => ({
  r: Math.min(GLOW_R_MAX, GLOW_R + GLOW_R_STEP * nth), alpha: Math.min(1, GLOW_ALPHA + GLOW_ALPHA_STEP * nth),
});

// The whole sweep lands on one tick, so the ship gets one glow (R52): the first pickup makes it and each
// one after grows it. It brightens as the comets fly in, then fades.
function shipGlow(fx, ship, color, nth) {
  const glow = nth > 0 && fx.flashes.find((f) => f.tag === 'sweep');
  if (glow) {
    Object.assign(glow, glowAt(nth));
    return;
  }
  const life = STREAK + FADE;
  addFlash(fx, { x: ship.x, y: ship.y, ...glowAt(nth), color, ramp: STREAK / life, life, tag: 'sweep' });
}

// A power-up starting rings out from the ship; one running out fizzles into smoke.
function power(fx, ev, rng, world) {
  const ship = world?.ship;
  if (!ship) return;
  if (ev.on) addRing(fx, { x: ship.x, y: ship.y, maxR: 140, color: powerColor(ev.kind), life: 0.5 });
  else smoke(fx, rng, ship.x, ship.y, 3, 14, 10);
}

function bulletTime(fx, ev) {
  fx.bulletTime = !!ev.on;
  addFlash(fx, { full: true, color: '#3affc8', alpha: ev.on ? 0.3 : 0.15, life: 0.3, tag: 'bullettime' });
}

export const WORLD = { pickup, sweep, power, bulletTime };
