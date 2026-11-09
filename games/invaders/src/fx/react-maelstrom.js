// What the maelstrom does to a bullet it swallows in Lantern Deep (world 15), where world 8's gravity well is a
// whirlpool of bubbles and light: the bullet that reaches the lip turns into a bubble, which spirals down the
// throat and pops. One ring of kind 'bubble' per bullet (fx.js) carries the whole thing, and bubble-view.js draws
// it from the ring's age: the way in is a logarithmic spiral from (x, y) round the well (wx, wy), `turns` times,
// down to END_R, and the last share of the ring's life is the pop. No particles, so the cap is never touched.
// Every other world keeps the reaction it had (the steel one). Pure: randomness comes from `rng`.
import { addRing } from './fx.js';
import { between, pick } from '../core/rng.js';
import { WELL } from '../core/kinds.js';

export const MAELSTROM_WORLD = 15;
export const BUBBLE_LIFE = 0.6; // s, the spiral in and the pop
export const POP_AT = 0.72; // the share of the life at which the bubble reaches the bottom and pops
export const LIP = 41; // px, where the maelstrom draws its bright lip: just outside the 40 px at which the core swallows a bullet
export const END_R = 8; // px from the well's centre at which the bubble pops, deep in the dark throat
export const START_MIN = LIP + 4; // a bullet born inside the lip still spirals in from here, so the path always has a way to go
export const BUBBLE_COLORS = ['#5af0ff', '#9af4ff', '#3de8d0', '#b27cff']; // the maelstrom's bubbles (flourish-maelstrom.js) take any of them
const FX_COLORS = BUBBLE_COLORS.slice(0, 3); // a swallowed bullet's bubble is never violet
const TURNS = [1.4, 1.8]; // times round the well on the way down
const SIZE = [11, 13]; // px across at the start (it shrinks to two fifths on the way)

function swallow(fx, ev, rng, world) {
  const well = world.well ?? WELL;
  const [dx, dy] = [ev.x - well.x, ev.y - well.y];
  const d0 = Math.max(START_MIN, Math.hypot(dx, dy));
  addRing(fx, {
    kind: 'bubble', x: ev.x, y: ev.y, wx: well.x, wy: well.y, a0: Math.atan2(dy, dx), d0,
    r0: d0, maxR: END_R, width: 1.5, life: BUBBLE_LIFE,
    turns: between(rng, ...TURNS), size: between(rng, ...SIZE), color: pick(rng, FX_COLORS), seed: Math.floor(rng() * 1e6),
  });
}

// The reaction to a swallowed bullet: the world's own one everywhere, a bubble that spirals in and pops in world 15.
export const absorbFor = (steel) => (fx, ev, rng, world) => (world?.level?.world === MAELSTROM_WORLD ? swallow(fx, ev, rng, world) : steel(fx, ev, rng, world));
