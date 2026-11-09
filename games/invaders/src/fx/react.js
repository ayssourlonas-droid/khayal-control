// Turns core events into effects. Pure: randomness comes from `rng` (a makeRng closure of its own,
// never world.rng), nothing is drawn, and `world` is only read (for the ship or a boss part's
// position). Events with no entry here, like `failed`, are left to the screens.
import { FIGHT } from './react-fight.js';
import { BOSS } from './react-boss.js';
import { WORLD } from './react-world.js';
import { ARMADA } from './react-armada.js';
import { CARNIVAL } from './react-carnival.js';
import { DEEP } from './react-deep.js';
import { GLASS } from './react-glass.js';
import { BREATH } from './react-breath.js';
import { STORM } from './react-storm.js';

const HANDLERS = { ...FIGHT, ...BOSS, ...WORLD, ...ARMADA, ...CARNIVAL, ...DEEP, ...GLASS, ...BREATH, ...STORM }; // DEEP wraps fire, hit, kill and absorb, GLASS wraps fire again, power and the wreck's three; BREATH adds two events of its own (world 17's breath and its wiped bullets), wrapping nothing; STORM wraps ARMADA's sideShot and broadside (world 18 borrows the broadside) and adds backfire

// Every event type fx reacts to.
export const REACTS = Object.keys(HANDLERS);

export function applyEvent(fx, ev, rng, world) {
  if (Object.hasOwn(HANDLERS, ev.type)) HANDLERS[ev.type](fx, ev, rng, world);
}

export function applyEvents(fx, events, rng, world) {
  for (const ev of events) applyEvent(fx, ev, rng, world);
}
