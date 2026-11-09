// "Watch, then try", DOM-free. The autopilot plays DEMO_LEVEL while captions explain the game; each
// caption is keyed to the event that shows it (the first shot, the first power-up, the bomb, the
// clear) and stays up at least DWELL seconds, so a burst of events never flashes past. Then the
// demo hands the same level over to the player.
//   createDirector() -> d          once per watch
//   directInput(d, world) -> input the autopilot's, with the few nudges the lesson needs (below)
//   noteEvents(d, events)          every tick's events, after the world stepped
//   stepDirector(d, dt)            every frame (real seconds); d.caption is the index shown, d.done
//                                  turns true once the last caption has been read
// The nudges, so the lesson always has its moments on this level: while a carrier lives the ship
// keeps one shot in flight at a time (no second shot can carry on into the grunt behind it); once
// the carrier is down it holds fire until its pickup is taken and the power-up has been explained,
// then it drops the smart bomb on the last aliens (the ship starts every level with one).
import { autopilot } from '../../core/autopilot.js';

export const DEMO_SEED = 2; // its carrier drops a power-up, not a bomb (demo-script.test.js holds it to that; 8 until R70)
export const DWELL = 3.4; // s a caption stays up at least
const LAST_DWELL = 4.6; // s for the stars, before the hand-over
const BOMB_AFTER = DWELL + 0.3; // s of the power-up caption before the bomb drops (its caption follows at once)

export const CAPTIONS = [
  { id: 'move', on: null, title: 'Fly',
    text: 'Fly with {←}{↑}{↓}{→} or {W}{A}{S}{D}, or just point the mouse.' },
  { id: 'fire', on: 'fire', title: 'Fire',
    text: 'Hold {Space} or the left mouse button to keep firing.' },
  { id: 'power', on: 'pickup', title: 'Power-ups',
    text: 'Shoot a glowing carrier: spread, laser, rapid fire, shield, homing or slow time.' },
  { id: 'bomb', on: 'bomb', title: 'Smart bomb',
    text: '{B}, {Shift} or right-click: clears every bullet, hurts everything.' },
  { id: 'stars', on: 'cleared', title: 'Stars',
    text: 'Clear a level: ★. Lose one life at most: ★★. No hits at all: ★★★.' },
];
const POWER = CAPTIONS.findIndex((c) => c.id === 'power'); // the bomb waits on this caption

export const createDirector = () => ({
  caption: 0, shown: 0, seen: [], done: false, carrierDown: false, bombed: false, powerShown: -1, stars: 0,
});

// The events each caption waits for, in caption order; the first is up from the start.
const triggered = (d, i) => !CAPTIONS[i].on || d.seen.includes(CAPTIONS[i].on);

export function noteEvents(d, events) {
  for (const e of events) {
    if (e.type === 'fire' && e.side !== 'ship') continue;
    if (e.type === 'kill' && e.role === 'carrier') d.carrierDown = true;
    if (e.type === 'cleared') d.stars = e.stars;
    if (!d.seen.includes(e.type)) d.seen.push(e.type);
  }
}

export function stepDirector(d, dt) {
  d.shown += dt;
  if (d.caption === POWER && d.powerShown < 0) d.powerShown = 0;
  if (d.powerShown >= 0) d.powerShown += dt;
  const last = d.caption === CAPTIONS.length - 1;
  if (last) {
    if (d.shown >= LAST_DWELL) d.done = true;
    return;
  }
  if (d.shown >= DWELL && triggered(d, d.caption + 1)) {
    d.caption += 1;
    d.shown = 0;
  }
}

// The lesson's input for this tick.
export function directInput(d, world) {
  const input = autopilot(world);
  const carrier = world.aliens.some((a) => a.role === 'carrier');
  if (carrier) input.fire = input.fire && world.shots.length === 0;
  if (!d.carrierDown || d.bombed) return input;
  input.fire = false; // the last aliens wait for the bomb
  if (d.caption >= POWER && d.powerShown >= BOMB_AFTER && world.state === 'play' && !world.ship.bombHeld) {
    input.bomb = true;
    d.bombed = true;
  }
  return input;
}
