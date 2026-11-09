import { clamp, TAU, smooth } from './math.js';
import { HUD_BOTTOM, ALIEN_R, MID_X, SPECIES } from './kinds.js';

// Where aliens hold, as pure functions of time. Every formation moves a slot around its home
// (sx, sy) by an offset that is exactly zero at t = 0, so the entry (formations-2.js) joins the hold
// without a seam. Amplitudes do not depend on ctx.speed (it scales frequency only), which is what
// keeps every slot inside x 0..1920, y 0..600 at any speed.
//
//   t    seconds since the alien began to HOLD, not since the wave started: the caller restarts it at
//        0 the moment entry ends (entryPosition reaches u = 1). Every offset is 0 at t = 0, so entry
//        and hold join without a seam; counting from the wave start would skip 1.5 s of the motion
//        and make the alien jump when it settles. For 'grid' it is the wave's march clock (below).
//   ctx  { dir, speed }: dir +1 or -1 (mirrors the wave's sideways motion), speed the wave speed x
//        scaled(d).formationSpeed, constant within a wave. aliveFrac never reaches a formation; its
//        one effect, the grid speeding up, is marchRate(aliveFrac).

export { entryPosition, diveCurve } from './formations-2.js';

const COL_GAP = 120;
const ROW_GAP = 84;
const TOP = 140;
// The HUD band ends at HUD_BOTTOM and a sprite reaches about ALIEN_R from its centre, so no alien
// centre may rise above HUD_CLEAR (R41). REACH is the most each formation's hold motion lifts a slot
// above its home (from the amplitudes below); a wave's top row starts low enough that even its
// highest point clears.
export const HUD_CLEAR = HUD_BOTTOM + ALIEN_R;
const SPIRAL_Y = 8;
const DIVE_Y = 14;
const SWAY_Y = 22;
const ESCORT_R = 40;
const REACH = { grid: 0, spiral: 2 * SPIRAL_Y, dive: 2 * DIVE_Y, sway: 2 * SWAY_Y, escort: 2 * ESCORT_R };
const HALF_MAX = 560; // widest half-width of a wave: the rest is the grid's sideways room
const SPAN_Y = 3 * ROW_GAP; // tallest block of rows, so even a deep wave stays above the floor

const GRID_AMP = 240; // the march sweeps 960 +/- (HALF_MAX + 240) = 160..1760 at most
const GRID_SPEED = 80; // px/s at speed 1 with every alien alive
const GRID_DROP = 24;
const GRID_SLIDE = 24; // px of sideways travel a drop is spread over, so it slides rather than pops
const FLOOR = 560;
const MAX_DROP = FLOOR - (TOP + SPAN_Y);

// Home positions, row by row, centred; `species` gives each row its animal, and the animal its role
// (SPECIES). The top row sits at TOP, or lower for a formation that lifts its aliens (REACH), so that
// none rises above HUD_CLEAR.
export function makeSlots(wave) {
  const { cols, species } = wave;
  const rows = species.length;
  const gx = cols > 1 ? Math.min(COL_GAP, (2 * HALF_MAX) / (cols - 1)) : 0;
  const gy = rows > 1 ? Math.min(ROW_GAP, SPAN_Y / (rows - 1)) : 0;
  const top = Math.max(TOP, HUD_CLEAR + REACH[wave.formation]);
  const slots = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = MID_X + (col - (cols - 1) / 2) * gx;
      slots.push({ row, col, role: SPECIES[species[row]], species: species[row], sx, sy: top + row * gy });
    }
  }
  return slots;
}

// How much faster the grid marches when only `aliveFrac` of it is left: 1x full, 3.5x for the last.
export const marchRate = (aliveFrac) => 1 + 2.5 * (1 - clamp(aliveFrac, 0, 1)) ** 2;

// How fast a formation's hold clock runs: the grid's at its march rate, every other at wall time.
export const clockRate = (formation, aliveFrac) => (formation === 'grid' ? marchRate(aliveFrac) : 1);

// a * (sin(w t + phase) - sin(phase)): a sine that is zero at t = 0 whatever its phase.
const swing = (a, w, t, phase) => a * (Math.sin(w * t + phase) - Math.sin(phase));
// An ellipse through the origin: rx, ry radii, th the angle gone since t = 0, phase where on it the
// slot starts.
const loop = (rx, ry, th, phase) =>
  ({ x: rx * (Math.cos(th + phase) - Math.cos(phase)), y: ry * (Math.sin(th + phase) - Math.sin(phase)) });

// The classic march: sweep to an edge, drop 24 px while turning, sweep back. The drop is spread over
// GRID_SLIDE px of travel and capped, so the lowest row of any wave never goes below y 560.
// Here `t` is the wave's march clock and aliveFrac plays no part: the caller advances
// `clock += dt * marchRate(aliveFrac)` each tick and passes the clock as t. The position for a given
// t is then the same however many aliens are left, so a kill speeds the march up from where it is
// instead of teleporting the grid.
function grid(slot, t, ctx) {
  const x = (t * GRID_SPEED * ctx.speed) / GRID_AMP; // in half-sweeps: the edges are at 1, 3, 5...
  const lap = x % 4;
  const tri = lap <= 1 ? lap : lap <= 3 ? 2 - lap : lap - 4;
  const edges = Math.floor((x + 1) / 2);
  const slid = clamp(((x - (2 * edges - 1)) * GRID_AMP) / GRID_SLIDE, 0, 1); // of the latest drop
  const drop = edges ? GRID_DROP * (edges - 1 + smooth(slid)) : 0;
  return { x: slot.sx + ctx.dir * GRID_AMP * tri, y: slot.sy + Math.min(drop, MAX_DROP) };
}

// A snake of rows swaying side to side, each row a little behind the one above.
function sway(slot, t, ctx) {
  const w = TAU * 0.22 * ctx.speed;
  return { x: slot.sx + ctx.dir * swing(130, w, t, -slot.row * 0.5), y: slot.sy + swing(SWAY_Y, 2 * w, t, slot.col * 0.7) };
}

// Carriers sit in the middle and bob; everyone else circles them while the group sways.
function escort(slot, t, ctx) {
  const x = slot.sx + ctx.dir * swing(110, TAU * 0.18 * ctx.speed, t, 0);
  if (slot.role === 'carrier') return { x, y: slot.sy + swing(12, TAU * 0.6 * ctx.speed, t, 0) };
  const th = -ctx.dir * TAU * 0.45 * ctx.speed * t;
  const phase = slot.col * 2.1 + slot.row * 1.1;
  const o = loop(ESCORT_R, ESCORT_R, th, phase);
  return { x: x + o.x, y: slot.sy + o.y };
}

// Divers hover; the actual swoop is diveCurve, driven by the aliens module.
function dive(slot, t, ctx) {
  return { x: slot.sx + ctx.dir * swing(70, TAU * 0.2 * ctx.speed, t, 0), y: slot.sy + swing(DIVE_Y, TAU * 0.5 * ctx.speed, t, slot.col * 0.8) };
}

// Arrives along a spiral (formations-2.js), then settles into a light shimmer.
function spiral(slot, t, ctx) {
  return { x: slot.sx + ctx.dir * swing(24, TAU * 0.15 * ctx.speed, t, 0), y: slot.sy + swing(SPIRAL_Y, TAU * 0.4 * ctx.speed, t, slot.col * 0.6) };
}

// Every formation there is, by name: the hold motions the waves of levels.js fly.
export const MOTION = { grid, sway, dive, spiral, escort };

export function slotPosition(formation, slot, t, ctx) {
  const move = MOTION[formation];
  if (!move) throw new Error(`unknown formation: ${formation}`);
  return move(slot, t, { speed: ctx.speed || 1, dir: ctx.dir < 0 ? -1 : 1 });
}
