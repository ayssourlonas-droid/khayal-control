import { stepScale } from './math.js';

// The autopilot plays with a mouse, and a mouse is a hand (R68): the ship now stands wherever the pointer
// does, so the autopilot must not teleport it. Its pointer target, and every flight dodge.js plans, stay
// within what a hand can carry the pointer in the time between them.

export const HAND = 1800; // px/s: a quick human wrist; 2.5 times the keys' top speed (ship.js SHIP_SPEED)

// `to`, or the farthest point toward it that a hand reaches from `from` in `dt` seconds.
export function handToward(from, to, dt) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const k = stepScale(dx, dy, HAND * dt);
  return { x: from.x + dx * k, y: from.y + dy * k };
}

// The same step as a pointer target, which is whole pixels (the input is quantized, input-codec.js). Rounding
// a point moves it up to SQRT1_2 px (half a px each way), so the hand is held that much short of its reach and
// the rounded target is never farther from `from` than HAND x dt.
export function handTarget(from, to, dt) {
  const p = handToward(from, to, dt - Math.SQRT1_2 / HAND);
  return { x: Math.round(p.x), y: Math.round(p.y) };
}
