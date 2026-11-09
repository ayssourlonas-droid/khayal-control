// The glitch twist in Starlit Archive (world 12), told in the library's idiom: an alien that blinks between
// slots dissolves into a whirl of loose pages and gold dust where it was and re-forms from the same where
// it lands, the frame smearing like gilt ink under a turning page (the 'ink' slices screen-view.js draws),
// and bullet time is the ink holding its breath: a warm swell and a ring from the ship. Code Rain's own
// green glitch stays as it was (react-world.js). Pure: randomness comes from `rng`.
import { addFlash, addRing, addSlice } from './fx.js';
import { addParticle } from './particles.js';
import { between, pick } from '../core/rng.js';
import { TAU } from '../core/math.js';
import { count } from './emit.js';

export const INK_WORLD = 12;
const PAGES = ['#efe0b4', '#d9c38a', '#f6ecd0'];
const GILT = ['#ffd27a', '#fff0c0', '#ffb450'];
const FORM = 0.3; // s the pages take to fly together into the new slot

// Where the alien was: sheets of paper flung out in a whirl, slowing and floating, and gold dust rising.
function dissolve(fx, x, y, rng) {
  for (let i = 0, m = count(fx, 9); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, 90, 260);
    addParticle(fx, {
      x, y, vx: Math.cos(a) * v - Math.sin(a) * v * 0.7, vy: Math.sin(a) * v + Math.cos(a) * v * 0.7 - 40,
      life: between(rng, 0.5, 0.9), size: between(rng, 11, 18), color: pick(rng, PAGES), kind: 'page', drag: 1.6, gravity: -20,
    });
  }
  for (let i = 0, m = count(fx, 12); i < m; i++) {
    const a = rng() * TAU;
    const v = between(rng, 40, 180);
    addParticle(fx, {
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: between(rng, 0.5, 1), size: between(rng, 2, 4),
      color: pick(rng, GILT), kind: 'ember', additive: true, drag: 2, gravity: -50,
    });
  }
  addFlash(fx, { x, y, r: 46, color: '#ffd27a', life: 0.15, tag: 'glitch' });
}

// Where it lands: the same pages and dust drawn in from a ring round the slot on straight lines, each
// arriving as its life ends, and a gold ring closing on the spot.
function reform(fx, x, y, rng) {
  for (let i = 0, m = count(fx, 9); i < m; i++) {
    const a = rng() * TAU;
    const r = between(rng, 50, 90);
    const size = between(rng, 11, 18);
    addParticle(fx, {
      x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: (-Math.cos(a) * r) / FORM, vy: (-Math.sin(a) * r) / FORM,
      life: FORM, size, grow: -size / FORM, color: pick(rng, PAGES), kind: 'page',
    });
  }
  for (let i = 0, m = count(fx, 12); i < m; i++) {
    const a = rng() * TAU;
    const r = between(rng, 40, 80);
    addParticle(fx, {
      x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: (-Math.cos(a) * r) / FORM, vy: (-Math.sin(a) * r) / FORM,
      life: FORM, size: 3, color: pick(rng, GILT), kind: 'ember', additive: true,
    });
  }
  addRing(fx, { x, y, r0: 80, maxR: 8, width: 3, color: '#ffd27a', kind: 'charge', life: FORM });
  addFlash(fx, { x, y, r: 52, color: '#ffd27a', ramp: 0.7, life: FORM, tag: 'glitch' });
}

// A blink: the old slot dissolves, the new one forms, and a tall strip of the frame turns over like a page at each.
function teleport(fx, ev, rng) {
  dissolve(fx, ev.fromX, ev.fromY, rng);
  reform(fx, ev.x, ev.y, rng);
  for (const [x, y] of [[ev.fromX, ev.fromY], [ev.x, ev.y]]) {
    addSlice(fx, {
      x: x - between(rng, 60, 100), y: y - between(rng, 180, 260), w: between(rng, 100, 150), h: between(rng, 380, 520),
      dx: (rng() < 0.5 ? -1 : 1) * between(rng, 40, 80), color: '#ffc850', kind: 'ink', life: 0.4,
    });
  }
}

// Bullet time begins with the ink holding its breath: a warm swell over the whole frame and a ring
// from the ship, and lets go with a smaller one.
function breath(fx, ev, world) {
  fx.bulletTime = !!ev.on;
  addFlash(fx, { full: true, color: '#ffc660', alpha: ev.on ? 0.34 : 0.16, ramp: ev.on ? 0.4 : 0, life: ev.on ? 0.5 : 0.3, tag: 'bullettime' });
  const ship = world?.ship;
  if (ship && ev.on) addRing(fx, { x: ship.x, y: ship.y, r0: 20, maxR: 260, width: 3, color: '#ffd27a', life: 0.7 });
}

// The reactions to the blink and to bullet time: Code Rain's green ones everywhere, the library's in world 12.
const inInk = (world) => world?.level?.world === INK_WORLD;
export const teleportFor = (glitch) => (fx, ev, rng, world) => (inInk(world) ? teleport(fx, ev, rng) : glitch(fx, ev, rng, world));
export const bulletTimeFor = (green) => (fx, ev, rng, world) => (inInk(world) ? breath(fx, ev, world) : green(fx, ev, rng, world));
