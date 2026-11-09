// Reactions to the boss fight: a telegraphed charge, a phase change, plates cracking open, a part
// breaking off and the death. The explode events of the destruction chain are react-fight's.
import { addShake } from './camera.js';
import { addFlash, addPopup, addRing, startSlowMo } from './fx.js';
import { debris, METAL, sparks, smoke } from './emit.js';

const CHARGE = '#ff3a3a';
const CRACK = ['#ffffff', '#fff6c8', '#ffd24a'];

// The warned part glows brighter until it fires (ev.warn s later), and a ring closes in on it.
function bossWarn(fx, ev) {
  addFlash(fx, { x: ev.x, y: ev.y, r: 90, color: CHARGE, ramp: 1, life: ev.warn, tag: 'charge' });
  addRing(fx, { x: ev.x, y: ev.y, r0: 120, maxR: 10, width: 3, color: '#ff5a4a', kind: 'charge', life: ev.warn });
}

function bossPhase(fx, ev, rng) {
  addFlash(fx, { full: true, alpha: 0.6, life: 0.45, tag: 'phase' });
  addRing(fx, { x: ev.x, y: ev.y, maxR: 900, width: 8, color: '#ffe9b0', life: 0.7 });
  sparks(fx, rng, ev.x, ev.y, 30, 480);
  smoke(fx, rng, ev.x, ev.y, 6, 80, 14);
  addShake(fx, 22);
}

// The plates the event names crack open where they sit (the world knows where); with no world the
// burst is at the boss centre.
function bossExpose(fx, ev, rng, world) {
  const parts = world?.boss?.parts ?? [];
  const at = (ev.parts ?? []).map((id) => parts.find((p) => p.id === id)).filter(Boolean).slice(0, 6);
  for (const p of at.length ? at : [ev]) {
    addRing(fx, { x: p.x, y: p.y, maxR: 90, color: '#ffe14a', life: 0.3 });
    addFlash(fx, { x: p.x, y: p.y, r: 120, life: 0.15, tag: 'crack' });
    sparks(fx, rng, p.x, p.y, 10, 340, CRACK);
  }
  addShake(fx, 8);
}

function partDown(fx, ev, rng) {
  debris(fx, rng, ev.x, ev.y, ev.weak ? 10 : 7, METAL, 260);
}

function bossDeath(fx, ev, rng) {
  startSlowMo(fx);
  addFlash(fx, { full: true, alpha: 1, life: 1, tag: 'whiteout' });
  addRing(fx, { x: ev.x, y: ev.y, maxR: 1400, width: 12, color: '#ffffff', life: 0.9 });
  addRing(fx, { x: ev.x, y: ev.y, maxR: 800, width: 8, color: '#ffb14a', life: 0.7 });
  addPopup(fx, { x: ev.x, y: ev.y, text: '+' + ev.score, points: true, color: '#ffe14a', scale: 3, life: 2.4 });
  debris(fx, rng, ev.x, ev.y, 20, METAL, 400);
  sparks(fx, rng, ev.x, ev.y, 30, 520);
  addShake(fx, 28);
}

export const BOSS = { bossWarn, bossPhase, bossExpose, partDown, bossDeath };
