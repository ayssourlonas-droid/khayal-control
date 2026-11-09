import { clamp } from './math.js';
import { WIDTH, HEIGHT, MID_X } from './kinds.js';

// The inputs of a run, one per tick, as a short string.
//   input  { dx, dy, fire, bomb, target }  dx, dy in -1..1, target null or { x, y } in whole pixels
// A pointer target wins over the keys in the ship's movement, so an input with a target carries no
// dx or dy (quantizeInput zeroes them).
//
// The text is a list of tokens, one per run of identical ticks:
//   <head>[<dx><dy>][*<count>]       "A*120knBA*3C"
// <head> is one letter. A to Z and a to j: no pointer, keys and flags = (dx + 1) * 12 + (dy + 1) * 4 +
// fire * 2 + bomb. k to n: a pointer target, flags = fire * 2 + bomb, and two numbers follow: how far the
// pointer moved since the last tick it was seen on (x, then y; the first time, from the middle of the
// screen). Ticks without a pointer leave that memory alone, so a pointer that comes back is coded as the
// short hop from where it left. A number is a variable-length integer in base 64 (the "VLQ" of source
// maps): groups of 5 bits, least significant first, a 6th bit meaning "more follows", the sign in the
// lowest bit; -15 to 15 is one character, up to 511 two, and any move on the screen at most three. A
// count repeats the token: for a pointer token the same move again and again, i.e. a steady sweep.
// Keyboard runs cost about 1 character per change; a pointer moving every tick about 3 per tick.

export const MAX_TICKS = 60 * 60 * 30; // half an hour of play: more than any level, small enough to bound a corrupt count
const HEADS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn'; // 36 without a pointer, then 4 with
const POINTER = 36;
const DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const START = { x: MID_X, y: 960 }; // where the pointer is taken to be before it first appears

// The input of a tick with nothing pressed.
export const IDLE = Object.freeze({ dx: 0, dy: 0, fire: false, bomb: false, target: null });

// The one shape the core is fed and the encoder writes: keys signed (and dropped under a pointer),
// flags boolean, the pointer rounded to whole pixels and held on the screen (the ship's zone lies
// inside it, so the clamp changes nothing the ship does).
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

function put(n) {
  let v = n < 0 ? (-n << 1) | 1 : n << 1;
  let out = '';
  do {
    const group = v & 31;
    v >>>= 5;
    out += DIGITS[group | (v ? 32 : 0)];
  } while (v);
  return out;
}

// The number written at `pos` (at most three characters, in the form `put` writes) and where it
// ends, or null.
function take(text, pos) {
  let v = 0;
  for (let k = 0; k < 3; k++) {
    const c = DIGITS.indexOf(text[pos + k]);
    if (c < 0) return null;
    v |= (c & 31) << (5 * k);
    if (c & 32) continue;
    const value = v & 1 ? -(v >> 1) : v >> 1;
    return put(value) === text.slice(pos, pos + k + 1) ? { value, end: pos + k + 1 } : null;
  }
  return null;
}

export function encodeInputs(inputs) {
  let out = '';
  let last = '';
  let run = 0;
  let at = START;
  for (const raw of inputs) {
    const i = quantizeInput(raw);
    const flags = (i.fire ? 2 : 0) + (i.bomb ? 1 : 0);
    let t;
    if (i.target) {
      t = HEADS[POINTER + flags] + put(i.target.x - at.x) + put(i.target.y - at.y);
      at = i.target;
    } else {
      t = HEADS[(i.dx + 1) * 12 + (i.dy + 1) * 4 + flags];
    }
    if (t === last) {
      run++;
      continue;
    }
    out += run > 1 ? `${last}*${run}` : last;
    last = t;
    run = 1;
  }
  return out + (run > 1 ? `${last}*${run}` : last);
}

// The inputs back, or null for anything that is not what encodeInputs writes: an unknown head, a
// number that is cut short, too long or not in the form `put` writes, a count under 2, a pointer
// that leaves the screen, more than `max` inputs in all.
export function decodeInputs(text, max = MAX_TICKS) {
  if (typeof text !== 'string') return null;
  const count = /\*(\d{1,9})/y;
  const out = [];
  let at = START;
  let pos = 0;
  while (pos < text.length) {
    const head = HEADS.indexOf(text[pos++]);
    if (head < 0) return null;
    let move = null;
    if (head >= POINTER) {
      const a = take(text, pos);
      const b = a && take(text, a.end);
      if (!b) return null;
      move = { x: a.value, y: b.value };
      pos = b.end;
    }
    let n = 1;
    if (text[pos] === '*') {
      count.lastIndex = pos;
      const m = count.exec(text);
      n = m ? Number(m[1]) : 0;
      if (n < 2) return null;
      pos += m[0].length;
    }
    if (out.length + n > max) return null;
    const flags = move ? head - POINTER : head;
    const fire = (flags & 2) !== 0;
    const bomb = (flags & 1) !== 0;
    for (let i = 0; i < n; i++) {
      if (move) {
        at = { x: at.x + move.x, y: at.y + move.y };
        if (at.x < 0 || at.x > WIDTH || at.y < 0 || at.y > HEIGHT) return null;
        out.push({ dx: 0, dy: 0, fire, bomb, target: { ...at } });
      } else {
        out.push({ dx: Math.floor(head / 12) - 1, dy: Math.floor((head % 12) / 4) - 1, fire, bomb, target: null });
      }
    }
  }
  return out;
}
