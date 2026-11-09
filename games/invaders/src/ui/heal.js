// The healing of world 17, Ash to Air: how far the city has recovered, h in 0..1 (drawing only; no rule changes with it).
//   healTarget(world) -> h the world has earned, from its level and how far the level has gone:
//     w17-1..4 run from (index - 1) x 0.2 to that + 0.2 by the waves cleared (all of them once the level is cleared);
//     w17-5 runs from 0.8 to 1 as the Craving loses its health, and is 1 once it is dying or gone.
//   createHeal() -> { h, seen, force, sky, mix, work }: the view's healing state (view.heal; null in every other world;
//     mix is the sky's composed crossfade and work the crossfades composed this frame, both heal-view.js's)
//   healOf(v) -> the view's h, 0 where it has no healing: the one way the flourishes and the ambient read it
//   stepHeal(heal, world, dt) -> h: eases heal.h toward the target (exponential, RATE per second), so the sky never
//     jumps when a wave falls or a boss part breaks; the first call snaps, so a frozen frame (dev.html?level=w17-3&t=20)
//     and a poster show the right h at once. heal.force (a number) pins h for the dev sheets (&h= in sheet-scene.js).
//   stage(h, name) -> 0..1: how far one thing has healed, a smoothstep over HEAL_STAGES[name] = [from, to] (a third entry makes
//     it a power ramp x ** that exponent instead: the smog's, which keeps the last level hazy until the Craving falls). Every painter
//     reads the healing through these, so the whole city mends in step: the smog thins and the sky turns blue, the ash
//     stops falling, the giant cigarettes go out and crumble, green returns, then the kites, the birds and the pollen.
//   heal.sky: the clean morning's sky canvas (heal-view.js builds it), crossfaded under the smog sky.
// Pure functions of the world and dt; nothing here touches a canvas.
import { clamp } from '../core/math.js';

export const HEAL_WORLD = 17;
export const RATE = 1.1; // per second: h closes 1 - e^-1.1 = 67 % of the way to its target each second

export const HEAL_STAGES = {
  smog: [0, 1, 1.25], // the smog thins and lifts: 0 thick brown-grey, 1 a clean sky (the crossfade of every layer and the sky);
  // a power ramp, so each level takes a little more away than the one before (0.13, 0.18, 0.21, 0.23, and the last 0.24 as
  // the Craving falls) and the boss level starts a quarter hazy
  ash: [0, 0.75], // 0 falling thick .. 1 stopped
  wisps: [0.05, 0.8], // drifting smoke wisps and the smoke rolling over the skyline
  green: [0.3, 0.85], // trees, lawns and flowers come back (the layers' green overlays)
  sun: [0.1, 0.9], // the sun's coin brightens and its rays grow
  beams: [0.45, 0.9], // sunbeams breaking through
  life: [0.6, 0.95], // kites, birds, pollen
};

export const stage = (h, name) => {
  const [a, b, power] = HEAL_STAGES[name];
  const x = clamp((h - a) / (b - a), 0, 1);
  return power ? x ** power : x * x * (3 - 2 * x);
};

export function healTarget(world) {
  const lv = world?.level;
  if (!lv) return 0;
  const base = ((lv.index ?? 1) - 1) * 0.2;
  if (lv.boss) {
    const b = world.boss;
    if (world.state === 'cleared' || !b || b.dying !== null) return 1;
    return 0.8 + 0.2 * (1 - clamp(b.hp / b.maxHp, 0, 1));
  }
  if (world.state === 'cleared') return base + 0.2;
  const n = lv.waves?.length || 1;
  const cleared = Math.max(0, world.wave - 1) + (world.state === 'play' && world.aliens.length === 0 ? 1 : 0);
  return base + 0.2 * clamp(cleared / n, 0, 1);
}

export const createHeal = () => ({ h: 0, seen: false, force: null, sky: null, mix: null, work: 0 });

export const healOf = (v) => (v.heal ? v.heal.h : 0);

export function stepHeal(heal, world, dt) {
  heal.work = 0; // crossfades composed this frame (heal-view.js allows one a frame)
  const target = heal.force ?? healTarget(world);
  if (!heal.seen || heal.force != null) {
    heal.seen = true;
    heal.h = target;
    return heal.h;
  }
  heal.h += (target - heal.h) * (1 - Math.exp(-dt * RATE));
  if (Math.abs(target - heal.h) < 1e-4) heal.h = target;
  return heal.h;
}
