import { ALIEN_R, EPS } from './kinds.js';
import { DIVE_TIME, addBullets, waveSpec, slotAt } from './aliens.js';
import { makeSlots } from './formations.js';
import { sweepDist2 } from './math.js';
import { randBetween, randPick } from './rng.js';
import { emit, prune } from './util.js';

// The rules of worlds 5-8 (twists.js has 1-4 and the dispatcher), plus the two helpers every
// twist that touches bullets uses. They run once per tick, after collisions and before the dead
// are pruned: a dead alien is still in world.aliens then, which is how acid and reassemble see it.

const SLOW = 0.5; // bullet time: enemy bullets, aliens and boss step at this fraction of real time
const SLOW_TIME = 2; // s it lasts
const SLOW_COOL = 8; // s from its start until a near miss can start it again

// The time an enemy bullet, an alien or the boss moves in this tick: slowed by the glitch world's
// bullet time and by the ship's slow power, never twice over.
export const enemyDt = (world, dt) => (world.slow > 0 || world.ship.power?.kind === 'slow' ? dt * SLOW : dt);

// Push every ship shot and enemy bullet (not a laser: its vx, vy are the aim). `accel(p, out, dt)`
// writes the acceleration in px/s^2 into out.x, out.y; dt is the time that projectile just moved.
export function pushAll(world, dt, accel) {
  const out = { x: 0, y: 0 };
  const slow = enemyDt(world, dt);
  for (const [list, step] of [[world.shots, dt], [world.bullets, slow]]) {
    for (const p of list) {
      if (p.life <= 0 || p.pattern === 'laser') continue;
      accel(p, out, step);
      p.vx += out.x * step;
      p.vy += out.y * step;
    }
  }
}

// Acid: an armored death drips 3 slow bullets over 2 s from where it fell.
const DRIPS = 3;
const DRIP_GAP = 2 / 3;
const ACID_SPEED = 100;

export function acid(world, dt) {
  const drips = world.twist.drips;
  for (const a of world.aliens) if (a.hp <= 0 && a.role === 'armored') drips.push({ x: a.x, y: a.y, t: 0, n: 0 });
  prune(drips, (d) => {
    d.t += dt;
    while (d.n < DRIPS && d.t >= d.n * DRIP_GAP - EPS) {
      d.n += 1;
      addBullets(world, [{ pattern: 'acid', x: d.x, y: d.y, vx: 0, vy: ACID_SPEED, r: 10, life: 10 }]);
      emit(world, 'acid', { x: d.x, y: d.y });
    }
    return d.n < DRIPS;
  });
}

// Glitch: a holding alien blinks to a free slot every 3 to 5 s; a near miss starts bullet time.
function blink(world) {
  const spec = waveSpec(world);
  if (!spec || !world.march) return;
  const free = makeSlots(spec).filter((s) => !world.aliens.some((a) => a.hp > 0 && a.slot.row === s.row && a.slot.col === s.col));
  const holding = world.aliens.filter((a) => a.hp > 0 && a.mode === 'hold');
  if (!free.length || !holding.length) return;
  const a = randPick(world.rng, holding);
  const s = randPick(world.rng, free);
  const [fromX, fromY] = [a.x, a.y];
  a.slot = { ...s, role: a.slot.role };
  Object.assign(a, slotAt(world, a.slot));
  emit(world, 'teleport', { id: a.id, fromX, fromY, x: a.x, y: a.y });
}

// Did a near miss happen earlier in this very tick? (Events of this tick are the last ones.)
function nearMissNow(world) {
  const ev = world.events;
  for (let i = ev.length - 1; i >= 0 && ev[i].tick === world.tick; i--) if (ev[i].type === 'nearMiss') return true;
  return false;
}

export function glitch(world, dt) {
  const t = world.twist;
  if (world.slow > 0) {
    world.slow = Math.max(0, world.slow - dt);
    if (world.slow === 0) emit(world, 'bulletTime', { on: false });
  }
  t.cool = Math.max(0, t.cool - dt);
  if (t.cool === 0 && nearMissNow(world)) {
    world.slow = SLOW_TIME;
    t.cool = SLOW_COOL;
    emit(world, 'bulletTime', { on: true, left: SLOW_TIME });
  }
  t.timer -= dt;
  if (t.timer > 0) return;
  t.timer = randBetween(world.rng, 3, 5);
  blink(world);
}

// Reassemble: an armored death leaves a wreck (hp 1) for 2 s, which hangs in the formation where the
// alien held, or lies where it fell if it fell out of the formation (mid-dive). A shot, the beam or a
// bomb breaks it for good; left alone it stands up again as an armored alien with 2 hp, once
// (`reborn`): in its slot, or where it fell, flying home on the second half of a swoop. It keeps
// the fallen alien's maxHp, so it is a hurt alien (2 of 3 or more), not a new one.
export const WRECK_TIME = 2;
const REBORN_HP = 2;
const RISE = 200; // px: the depth of the homeward swoop's curve (diveCurve's least)

// Standing up where it is (a hold), or on the way home: the swoop that is at the wreck halfway
// through (diveCurve at u = 0.5 is the aim, the curve's depth below its start) and ends in the slot.
function standUp(w) {
  if (w.hold) return { mode: 'hold', dive: null };
  return { mode: 'return', t: DIVE_TIME / 2, dive: { fx: w.x, fy: w.y - RISE, ax: w.x, ay: w.y } };
}

// Damage a wreck (the damage seam, damage.js). It is removed in reassemble(). 'wreckDown' names the wreck's slot
// and the time it had left, so a drawing of the hanging wreck can break up from where its pieces were.
export function hurtWreck(world, w, dmg) {
  if (w.hp <= 0) return;
  w.hp -= dmg;
  if (w.hp <= 0) emit(world, 'wreckDown', { x: w.x, y: w.y, row: w.slot.row, col: w.slot.col, left: w.left });
}

export function reassemble(world, dt) {
  for (const a of world.aliens) {
    if (a.hp <= 0 && a.role === 'armored' && a.slot && !a.reborn) {
      world.wrecks.push({
        x: a.x, y: a.y, hp: 1, left: WRECK_TIME, slot: a.slot, hold: a.mode === 'hold', maxHp: a.maxHp, wreck: true,
      });
      emit(world, 'wreck', { x: a.x, y: a.y });
    }
  }
  for (const s of world.shots) {
    if (s.life <= 0) continue;
    for (const w of world.wrecks) {
      if (w.hp <= 0 || sweepDist2(s, dt, w) > (ALIEN_R + s.r) ** 2) continue;
      s.life = 0;
      hurtWreck(world, w, s.dmg ?? 1);
      break;
    }
  }
  prune(world.wrecks, (w) => {
    if (w.hp <= 0) return false;
    if (w.hold) Object.assign(w, slotAt(world, w.slot));
    w.left -= dt;
    if (w.left > 0) return true;
    const id = world.nextId++;
    world.aliens.push({
      id, role: 'armored', x: w.x, y: w.y, hp: REBORN_HP, maxHp: w.maxHp, slot: w.slot,
      t: world.march?.clock ?? 0, reborn: true, ...standUp(w),
    });
    emit(world, 'reassemble', { id, x: w.x, y: w.y });
    return false;
  });
}

// Gravity: the well pulls every bullet and shot with a = 9e6 / max(d^2, 120^2) toward it, and
// swallows whatever comes within 40 px of it.
const PULL = 9e6;
const PULL_MIN = 120;
const ABSORB = 40;

export function gravity(world, dt) {
  const well = world.well;
  pushAll(world, dt, (p, out, step) => {
    const dx = well.x - p.x;
    const dy = well.y - p.y;
    if (sweepDist2(p, step, well) <= ABSORB * ABSORB) {
      p.life = 0;
      emit(world, 'absorb', { x: p.x, y: p.y });
      out.x = 0;
      out.y = 0;
      return;
    }
    const d = Math.hypot(dx, dy);
    const a = PULL / Math.max(d * d, PULL_MIN * PULL_MIN);
    out.x = (dx / d) * a;
    out.y = (dy / d) * a;
  });
}
