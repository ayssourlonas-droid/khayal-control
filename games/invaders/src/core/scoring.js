import { ROLES, INTRO } from './kinds.js';
import { emit } from './util.js';
import { clamp } from './math.js';
import { parOf } from './pars.js';

// Points, the combo and stars: every point the score gets is awarded here, by the same rules in every
// level of every world. world.combo = { mult, timer }: every kill within COMBO_WINDOW of the last
// raises mult by 1 (up to COMBO_MAX); timer counts down and mult falls back to 1 at 0. A pickup is
// worth a flat PICKUP_POINTS, caught or swept up at the clear (R51), and a boss's death a flat
// BOSS_POINTS: no multiplier, the combo untouched, so they read the same every time. The clear tallies
// the round (R66): the clear bonus, BOMB_POINTS for each bomb held when none was fired, LIFE_POINTS for
// each life held, and then the whole round times its speed (speedOf). A clear without a power-up
// caught earns the level's medal (ranks.js).

export const COMBO_WINDOW = 1.5;
export const COMBO_MAX = 8;
export const COMBO_HOT = 4; // from this multiplier the combo runs hot: the meter pulses, pop-ups turn gold, the kill sound sizzles
const PICKUP_POINTS = 500;
const BOSS_POINTS = 10000;
const CLEAR_BONUS = 2000;
const FLAWLESS_BONUS = 3000; // on top of CLEAR_BONUS when the ship was never hit
export const BOMB_POINTS = 2000; // a bomb held at the clear, when not one was fired
export const LIFE_POINTS = 3000; // a life held at the clear

// An alien is dead (its hp is already 0). `scored` false is a ram: no points, the combo untouched.
// The caller removes it from world.aliens.
export function awardKill(world, alien, scored = true) {
  const c = world.combo;
  let points = 0;
  if (scored) {
    c.mult = c.timer > 0 ? Math.min(COMBO_MAX, c.mult + 1) : 1;
    c.timer = COMBO_WINDOW;
    points = ROLES[alien.role].score * c.mult;
    world.score += points;
  }
  const { id, role, x, y } = alien;
  emit(world, 'kill', { id, role, x, y, score: points, mult: c.mult, scored });
  emit(world, 'explode', { x, y, size: 1 });
}

// A pickup collected: its points go on the score. Returns the fields of the event that announces it,
// which the caller emits: `pickup` (the ship caught it) or `sweep` (the clear swept it up).
export function awardPickup(world, p) {
  world.score += PICKUP_POINTS;
  return { kind: p.kind, x: p.x, y: p.y, points: PICKUP_POINTS };
}

export function tickCombo(world, dt) {
  const c = world.combo;
  if (c.timer <= 0) return;
  c.timer = Math.max(0, c.timer - dt);
  if (c.timer === 0) c.mult = 1;
}

// A boss is dead: its points go on the score. Returns them, for the event that announces the death.
export function awardBoss(world) {
  world.score += BOSS_POINTS;
  return BOSS_POINTS;
}

// The round's speed multiplier, `time` s of play against the level's `par`: x2 at half the par or
// faster, x1 at the par or slower, straight between, to two decimals.
export const speedOf = (time, par) => Math.round(100 * (1 + clamp((par - time) / (par / 2), 0, 1))) / 100;

// The level is cleared, wave level or boss alike: the round is tallied and the score becomes its total
// (to the nearest 10). world.tally = { time, par, speed, base, bonus, bombBonus, lifeBonus, total,
// medal }: base is what play earned, bonus the clear (and flawless) bonus. Returns the tally.
export function awardClear(world) {
  const { ship } = world;
  const time = world.t - INTRO;
  const par = parOf(world.level);
  const speed = speedOf(time, par);
  const base = world.score;
  const bonus = CLEAR_BONUS + (world.hits === 0 ? FLAWLESS_BONUS : 0);
  const bombBonus = ship.bombsUsed === 0 ? BOMB_POINTS * ship.bombs : 0;
  const lifeBonus = LIFE_POINTS * ship.lives;
  const total = Math.round(((base + bonus + bombBonus + lifeBonus) * speed) / 10) * 10;
  world.score = total;
  world.tally = { time, par, speed, base, bonus, bombBonus, lifeBonus, total, medal: ship.powersUsed === 0 };
  return world.tally;
}

export const MAX_STARS = 3;

// 0 unless cleared; 3 with no hits, 2 after losing one life, 1 after more.
export const stars = (world) => (world.state === 'cleared' ? Math.max(1, MAX_STARS - world.hits) : 0);
