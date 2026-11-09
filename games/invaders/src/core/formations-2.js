import { clamp, lerp, TAU, smooth, easeOut } from './math.js';
import { WIDTH, MID_X, EDGE } from './kinds.js';

// How aliens arrive (entryPosition, 1.5 s) and how a diver swoops (diveCurve, 2.2 s). Both are pure
// functions of u in 0..1 and both end exactly on the position they are given.

const side = (slot) => (slot.sx < MID_X ? -1 : 1);

// Progress of one alien: later places in line start later but all finish at u = 1.
const late = (u, k, step) => easeOut((u - Math.min(k, 5) * step) / (1 - 5 * step));

const quad = (a, b, c, e) => ({
  x: (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * b.x + e * e * c.x,
  y: (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * b.y + e * e * c.y,
});

const ENTRY = {
  // Rows slide down from above, top row first.
  grid: (s, u) => ({ x: s.sx, y: lerp(-100, s.sy, late(u, s.row, 0.06)) }),
  // Drop in from above with a sideways flourish that unwinds, column by column.
  sway: (s, u) => {
    const e = late(u, s.col, 0.04);
    return { x: s.sx + side(s) * 260 * (1 - e), y: lerp(-100, s.sy, e) };
  },
  // Swing in around a shrinking circle.
  orbit: (s, u) => {
    const e = late(u, s.col, 0.03);
    const th = (u * 1.5 + s.col * 0.5) * TAU;
    return { x: s.sx + 100 * (1 - e) * Math.cos(th), y: lerp(-160, s.sy, e) + 100 * (1 - e) * Math.sin(th) };
  },
  // Corkscrew down onto the slot: fall from above while winding two turns from side to side, the
  // swing tightening to nothing on arrival. It only ever descends, so it crosses the HUD band once
  // and never loops back up behind it (R41).
  spiral: (s, u) => {
    const e = late(u, s.col + s.row, 0.03);
    const th = 4 * Math.PI * (1 - e) * (s.col % 2 ? 1 : -1); // two turns
    return { x: s.sx + (700 + 60 * s.row) * (1 - e) * Math.sin(th), y: lerp(-160 - 60 * s.row, s.sy, e) };
  },
  // One column drops in down the middle, then fans out to the slots.
  split: (s, u) => {
    const e = late(u, s.row, 0.05);
    return { x: lerp(MID_X, s.sx, easeOut(u * 1.3 - 0.3)), y: lerp(-120 - 40 * s.row, s.sy, e) };
  },
  // Slide in from the left or right edge, level with the slot.
  escort: (s, u) => ({ x: lerp(side(s) < 0 ? -140 : 2060, s.sx, late(u, s.col, 0.05)), y: s.sy }),
  // Columns fall in from above one after another.
  rain: (s, u) => ({ x: s.sx, y: lerp(-100, s.sy, late(u, s.col, 0.09)) }),
  // A swooping dive: stream in from alternate sides on a curve that dips low before climbing to the slot.
  dive: (s, u) => {
    const left = (s.col + s.row) % 2 === 0;
    const from = { x: left ? -120 : 2040, y: 160 + s.row * 50 };
    const bend = { x: left ? 760 : 1160, y: 800 };
    return quad(from, bend, { x: s.sx, y: s.sy }, late(u, s.col + s.row, 0.03));
  },
};

export function entryPosition(formation, slot, u) {
  const enter = ENTRY[formation];
  if (!enter) throw new Error(`unknown formation: ${formation}`);
  return u >= 1 ? { x: slot.sx, y: slot.sy } : enter(slot, Math.max(u, 0));
}

// A swoop from `from` (the slot where the dive began) down toward the ship's x and as deep as its
// y, and back up. A sideways weave rides on top; it is zero at both ends. The slots keep moving
// during the 2.2 s, so the caller passes `home`, the slot's live position, and the return leg
// drifts onto it (smoothly, from the lowest point on), landing exactly on `home` at u = 1. Without
// `home` the dive closes on `from`.
export function diveCurve(from, target, u, home = from) {
  if (u <= 0) return { x: from.x, y: from.y };
  if (u >= 1) return { x: home.x, y: home.y };
  const arc = Math.sin(Math.PI * u);
  const depth = clamp(target.y - from.y, 200, 900);
  const back = smooth(2 * u - 1);
  const x = from.x + (home.x - from.x) * back + (target.x - from.x) * arc + 70 * Math.sin(4 * Math.PI * u) * arc;
  return { x: clamp(x, EDGE, WIDTH - EDGE), y: from.y + (home.y - from.y) * back + depth * arc ** 1.5 };
}
