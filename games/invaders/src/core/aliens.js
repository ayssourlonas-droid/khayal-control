import { ROLES, ALIEN_R } from './kinds.js';
import { segDist2 } from './math.js';
import { makeSlots, slotPosition, entryPosition, diveCurve, clockRate } from './formations.js';
import { emitPattern } from './patterns.js';
import { rand, randBetween, randPick } from './rng.js';
import { awardKill } from './scoring.js';
import { dropOnKill } from './powerups.js';
import { markShell, lightFuse } from './fireworks.js';
import { emit } from './util.js';

// A wave of aliens: spawn, fly in, hold the formation, swoop, shoot back.
//   alien = { id, role, x, y, hp, maxHp, slot, mode, t, dive }  (+ shell: true on a world 14 shell)
//   maxHp the hp of the alien whole, set once where it is made (here, boss minions, the reborn
//         wrecks of reassemble, the saucer) so nothing downstream has to work it out again
//   mode 'enter' (ENTER_TIME s, the same for the whole wave) -> 'hold' -> 'dive' (first half of a
//         swoop) -> 'return' (second half) -> 'hold' again. t is seconds in the current mode; in
//         'hold' it is the wave's hold clock. dive is { fx, fy, ax, ay } while swooping (where it
//         left, where it is aiming), else null.
//   world.march = { age, clock, dir, speed, total, dive } is the wave's own state: seconds since it
//   spawned, the hold clock (restarts at 0 when the entry ends; for a grid it runs at marchRate),
//   the sideways direction, the formation speed, the size it spawned with, and seconds to the next dive.

export const ENTER_TIME = 1.5; // formations-2.js: entryPosition's length
export const DIVE_TIME = 2.2; // formations-2.js: diveCurve's length
const MAX_BULLETS = 400;

// Is the alien swooping (out on a dive, or on its way home)?
export const isSwooping = (a) => a.mode === 'dive' || a.mode === 'return';

// Push enemy bullets, in order, while there is room under the cap.
export function addBullets(world, list) {
  for (const b of list) if (world.bullets.length < MAX_BULLETS) world.bullets.push(b);
}

// The wave in play (null on a boss level), and where a slot of it will be `tau` s from now (now by
// default): the grid's clock runs at its march rate, every other formation's at wall time.
export const waveSpec = (world) => world.level.waves?.[world.wave - 1];
export function slotAt(world, slot, tau = 0) {
  const spec = waveSpec(world);
  const m = world.march;
  if (!spec || !m || !slot) return null;
  const rate = clockRate(spec.formation, world.aliens.length / m.total);
  return slotPosition(spec.formation, slot, m.clock + tau * rate, { dir: m.dir, speed: m.speed });
}

const place = (a, p) => {
  a.x = p.x;
  a.y = p.y;
};

// Spawn the next wave (world.wave counts the waves spawned so far). R2: armorBonus is extra hp for
// armored and gunner aliens only.
export function spawnWave(world) {
  const spec = world.level.waves[world.wave];
  world.wave += 1;
  const slots = makeSlots(spec);
  for (const slot of slots) {
    const bonus = slot.role === 'armored' || slot.role === 'gunner' ? world.scale.armorBonus : 0;
    const hp = ROLES[slot.role].hp + bonus;
    const a = {
      id: world.nextId++, role: slot.role, x: 0, y: 0, hp, maxHp: hp,
      slot, mode: 'enter', t: 0, dive: null,
    };
    markShell(world, a);
    place(a, entryPosition(spec.formation, slot, 0));
    world.aliens.push(a);
  }
  world.march = {
    age: 0, clock: 0, dir: world.wave % 2 ? 1 : -1, speed: spec.speed * world.scale.formationSpeed,
    total: slots.length, dive: randBetween(world.rng, 2, 4),
  };
}

// Damage an alien; at 0 hp it dies (scored), and it may leave a pickup where it fell: always for a
// carrier, by chance for the others (dropOnKill, R54). A dead shell lights its fuse (world 14,
// fireworks.js), however it died. The caller removes the dead from world.aliens.
export function hurtAlien(world, a, dmg) {
  if (a.hp <= 0) return;
  a.hp -= dmg;
  if (a.hp > 0) {
    emit(world, 'hit', { id: a.id, role: a.role, x: a.x, y: a.y, hp: a.hp, dmg });
    return;
  }
  awardKill(world, a);
  dropOnKill(world, a);
  if (a.shell) lightFuse(world, a);
}

// One swoop tick: along diveCurve onto the slot's live position, landing exactly on it at the end.
function swoop(a, dt, home, clock) {
  a.t += dt;
  const u = a.t / DIVE_TIME;
  if (u >= 1) {
    a.mode = 'hold';
    a.t = clock;
    a.dive = null;
    place(a, home);
    return;
  }
  const d = a.dive;
  a.mode = u < 0.5 ? 'dive' : 'return';
  place(a, diveCurve({ x: d.fx, y: d.fy }, { x: d.ax, y: d.ay }, u, home));
}

// Every 2 to 4 s one holding diver leaves for the ship; one at a time at d = 0, up to 3 at d = 1.
function startDives(world, dt) {
  const m = world.march;
  m.dive -= dt;
  if (m.dive > 0) return;
  m.dive = randBetween(world.rng, 2, 4);
  let busy = 0;
  const ready = [];
  for (const a of world.aliens) {
    if (isSwooping(a)) busy++;
    else if (a.mode === 'hold' && a.role === 'diver') ready.push(a);
  }
  if (busy >= Math.round(1 + 2 * world.level.d) || !ready.length) return;
  const a = randPick(world.rng, ready);
  a.mode = 'dive';
  a.t = 0;
  a.dive = { fx: a.x, fy: a.y, ax: world.ship.x, ay: world.ship.y };
}

// Each alien (each that `shoots`, for boss minions) fires ROLES[role].fire * fireMult times a
// second, `pattern` at the ship: the wave's pattern, or a boss level's plain aimed shot.
export function fire(world, dt, pattern, shoots = null) {
  const { bullets, ship, scale } = world;
  for (const a of world.aliens) {
    const rate = ROLES[a.role].fire * scale.fireMult;
    if (rate <= 0 || (shoots && !shoots(a)) || bullets.length >= MAX_BULLETS || rand(world.rng) >= rate * dt) continue;
    addBullets(world, emitPattern(pattern, a, ship, { speed: scale.bulletSpeed }, world.rng));
    emit(world, 'fire', { side: 'enemy', id: a.id, role: a.role, x: a.x, y: a.y, pattern });
  }
}

// Move the wave: fly in, hold, swoop. Dives and shooting happen in play only (the first wave flies
// in during the intro).
export function stepAliens(world, dt) {
  const m = world.march;
  if (!m) return;
  const spec = waveSpec(world);
  m.age += dt;
  if (m.age < ENTER_TIME) {
    for (const a of world.aliens) {
      a.t = m.age;
      place(a, entryPosition(spec.formation, a.slot, m.age / ENTER_TIME));
    }
    return;
  }
  for (const a of world.aliens) {
    if (a.mode === 'enter') a.mode = 'hold';
  }
  m.clock += dt * clockRate(spec.formation, world.aliens.length / m.total);
  const ctx = { dir: m.dir, speed: m.speed };
  for (const a of world.aliens) {
    const home = slotPosition(spec.formation, a.slot, m.clock, ctx);
    if (a.mode === 'hold') {
      a.t = m.clock;
      place(a, home);
    } else swoop(a, dt, home, m.clock);
  }
  if (world.state !== 'play') return;
  startDives(world, dt);
  fire(world, dt, spec.pattern);
}

// The live alien that projectile `p` met first along its path this tick (the nearest to where the path
// started), or null.
export function firstAlien(world, p, dt) {
  const px = p.x - p.vx * dt;
  const py = p.y - p.vy * dt;
  const reach = (ALIEN_R + p.r) ** 2;
  let best = null;
  let bestD = Infinity;
  for (const a of world.aliens) {
    if (a.hp <= 0 || segDist2(px, py, p.x, p.y, a.x, a.y) > reach) continue;
    const d = (a.x - px) ** 2 + (a.y - py) ** 2;
    if (d < bestD) {
      best = a;
      bestD = d;
    }
  }
  return best;
}
