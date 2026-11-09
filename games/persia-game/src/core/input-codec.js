import { clamp } from './math.js';
import { WIDTH, HEIGHT } from './kinds.js';

// The input of one tick.
//   input  { dx, dy, fire, bomb, target }  dx, dy in -1..1, target null or { x, y } in whole pixels
// A pointer target wins over the keys in the ship's movement, so an input with a target carries no
// dx or dy (quantizeInput zeroes them).

// The input of a tick with nothing pressed.
export const IDLE = Object.freeze({ dx: 0, dy: 0, fire: false, bomb: false, target: null });

// The one shape the core is fed: keys signed (and dropped under a pointer), flags boolean, the
// pointer rounded to whole pixels and held on the screen (the ship's zone lies inside it, so the
// clamp changes nothing the ship does).
export function quantizeInput(raw = {}) {
  const t = raw.target;
  const aimed = t && Number.isFinite(t.x) && Number.isFinite(t.y);
  return {
    dx: aimed ? 0 : Math.sign(raw.dx) || 0,
    dy: aimed ? 0 : Math.sign(raw.dy) || 0,
    fire: Boolean(raw.fire),
    bomb: Boolean(raw.bomb),
    target: aimed ? { x: clamp(Math.round(t.x), 0, WIDTH), y: clamp(Math.round(t.y), 0, HEIGHT) } : null,
  };
}
