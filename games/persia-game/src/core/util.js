// Small helpers every world module shares.

// A cleared or failed world is over and no longer moves.
export const finished = (world) => world.state === 'cleared' || world.state === 'failed';

// Queue an event for main to drain: { type, tick, ...fields }. The core only ever pushes.
export function emit(world, type, fields) {
  world.events.push({ type, tick: world.tick, ...fields });
}

// Keep the items of `list` that pass `keep`, in order, in place (the array stays the same object).
export function prune(list, keep) {
  let n = 0;
  for (const item of list) if (keep(item)) list[n++] = item;
  list.length = n;
}

// Checks for plain data read back from storage: an object (not null, not an array), a whole number
// in 0..max, a finite score of at least 0.
export const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
export const isCount = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
export const validScore = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
