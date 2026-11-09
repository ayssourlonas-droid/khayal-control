// Reactions to the fight itself: shots, hits, kills, blasts, bombs, the wave and the level ending.
import { addShake } from './camera.js';
import { addFlash, addPopup, addRing, BONUS_Y, startSlowMo } from './fx.js';
import { debris, FIRE, powerColor, sparks, smoke } from './emit.js';
import { clamp } from '../core/math.js';
import { MID_X } from '../core/kinds.js';

const ROLE_COLORS = {
  grunt: ['#7dff7a', '#2fbf4a'], diver: ['#6ad6ff', '#2f8fd6'], gunner: ['#ff9a4a', '#d6502f'],
  armored: ['#c8d0e0', '#7b8499'], carrier: ['#ffe14a', '#ff9a2e'],
};
const GOLD = ['#fff6c8', '#ffe14a', '#ffc21a'];
const PALE = ['#ffffff', '#dfe8ff', '#b8c4e0'];
const HURT = ['#ff5a4a', '#ff9a8a', '#ffffff'];
const SHIELD = [powerColor('shield'), '#b8fbff', '#ffffff'];
const SHIELD_GAP = 0.15; // s between shield flares: a burning beam sends one hit per tick

// Per explode size (1 alien or part, 2 the ship, 3 the last blast of a boss).
const BLASTS = [
  null,
  { flash: 90, ring: 120, sparks: 10, smoke: 2, shake: 3 },
  { flash: 200, ring: 300, sparks: 22, smoke: 5, shake: 16 },
  { flash: 520, ring: 760, sparks: 40, smoke: 10, shake: 30 },
];

const comboColor = (mult) => (mult >= 8 ? '#ff7a3a' : mult >= 4 ? '#ffd24a' : mult >= 2 ? '#fff6c8' : '#ffffff');

function kill(fx, ev, rng) {
  const carrier = ev.role === 'carrier';
  debris(fx, rng, ev.x, ev.y, carrier ? 12 : 8, ROLE_COLORS[ev.role] ?? ROLE_COLORS.grunt, 220);
  if (carrier) sparks(fx, rng, ev.x, ev.y, 10, 300, GOLD);
  if (!ev.scored || !(ev.score > 0)) return;
  const mult = ev.mult ?? 1;
  addPopup(fx, {
    x: ev.x, y: ev.y - 18, text: '+' + ev.score, points: true, color: comboColor(mult),
    scale: 1 + Math.min(mult, 8) * 0.08,
  });
}

function explode(fx, ev, rng) {
  const b = BLASTS[clamp(ev.size | 0 || 1, 1, 3)];
  addFlash(fx, { x: ev.x, y: ev.y, r: b.flash, life: 0.18, tag: 'blast' });
  addRing(fx, { x: ev.x, y: ev.y, maxR: b.ring, life: 0.5, color: '#ffe9b0' });
  if (b === BLASTS[3]) {
    addFlash(fx, { full: true, alpha: 0.9, life: 0.5, tag: 'whiteout' });
    addRing(fx, { x: ev.x, y: ev.y, maxR: b.ring * 1.5, life: 0.8, color: '#ff9a4a', width: 8 });
  }
  addShake(fx, b.shake);
  sparks(fx, rng, ev.x, ev.y, b.sparks, 250 + b.ring);
  smoke(fx, rng, ev.x, ev.y, b.smoke, b.ring * 0.15, 8 + b.ring * 0.03);
}

function hit(fx, ev, rng) {
  const plate = ev.role === 'armored' || (ev.role === 'boss' && !ev.weak);
  const k = plate ? 6 : 4;
  sparks(fx, rng, ev.x, ev.y, k, plate ? 260 : 200, plate ? PALE : FIRE);
  addFlash(fx, { x: ev.x, y: ev.y, r: 36, life: 0.06, tag: 'hit' });
}

function fire(fx, ev) {
  if (ev.side !== 'ship') {
    addFlash(fx, { x: ev.x, y: ev.y, r: 34, color: '#ff6a4a', alpha: 0.8, life: 0.07, tag: 'muzzle' });
  } else if (ev.power === 'laser') {
    const color = powerColor('laser');
    addFlash(fx, { x: ev.x, y: ev.y, r: 110, color, life: 0.2, tag: 'muzzle' });
    addRing(fx, { x: ev.x, y: ev.y, maxR: 80, color, life: 0.25 });
  } else {
    addFlash(fx, { x: ev.x, y: ev.y, r: 28, color: '#bff4ff', life: 0.05, tag: 'muzzle' });
  }
}

function shipHit(fx, ev, rng) {
  addFlash(fx, { full: true, color: '#ff2a2a', alpha: 0.45, life: 0.25, tag: 'hurt' });
  addRing(fx, { x: ev.x, y: ev.y, maxR: 220, color: '#ff5a4a', life: 0.4 });
  sparks(fx, rng, ev.x, ev.y, 14, 380, HURT);
  addShake(fx, 14);
}

function shieldHit(fx, ev, rng) {
  if (fx.time - fx.shieldT < SHIELD_GAP) return;
  fx.shieldT = fx.time;
  const color = powerColor('shield');
  addRing(fx, { x: ev.x, y: ev.y, r0: 34, maxR: 62, width: 3, color, kind: 'shield', life: 0.25 });
  addFlash(fx, { x: ev.x, y: ev.y, r: 80, color, alpha: 0.7, life: 0.12, tag: 'shield' });
  sparks(fx, rng, ev.x, ev.y, 3, 220, SHIELD);
}

function nearMiss(fx, ev, rng) {
  addRing(fx, { x: ev.x, y: ev.y, r0: 10, maxR: 40, width: 2, color: '#bff4ff', life: 0.2 });
  sparks(fx, rng, ev.x, ev.y, 3, 160, SHIELD);
}

function bomb(fx, ev, rng) {
  addFlash(fx, { full: true, alpha: 0.9, life: 0.4, tag: 'bomb' });
  addRing(fx, { x: ev.x, y: ev.y, maxR: 1500, width: 10, color: '#ffe9b0', life: 0.7 });
  addRing(fx, { x: ev.x, y: ev.y, maxR: 900, width: 6, color: '#ff9a4a', life: 0.5 });
  sparks(fx, rng, ev.x, ev.y, 18, 420);
  addShake(fx, 20);
}

function waveClear(fx, ev) {
  startSlowMo(fx);
  addFlash(fx, { full: true, alpha: 0.25, life: 0.3, tag: 'clear' });
  if (!ev.last) addPopup(fx, { x: MID_X, y: 420, text: 'WAVE CLEAR', color: '#9dffb0', scale: 2.2, life: 1.6 });
}

function cleared(fx, ev) {
  addFlash(fx, { full: true, alpha: 0.3, life: 0.5, tag: 'clear' });
  addPopup(fx, { x: MID_X, y: BONUS_Y, text: '+' + ev.bonus + ' BONUS', points: true, color: '#ffe14a', scale: 2, life: 2 });
}

export const FIGHT = { kill, explode, hit, fire, shipHit, shieldHit, nearMiss, bomb, waveClear, cleared };
