import { ROLES, WIDTH, EDGE } from './kinds.js';
import { addBullets, fire } from './aliens.js';
import { markShell } from './fireworks.js';
import { emitPattern } from './patterns.js';
import { bossDef } from './bosses-data.js';
import { clamp, dist2 } from './math.js';
import { emit, prune } from './util.js';

// What a boss throws. An attack is a countdown per phase entry; when it runs out the part warns
// (bossWarn, and an entry in b.warns for the renderer to draw as a charge-up), WARN s later it
// fires, and the countdown restarts. A part destroyed in between never fires. A quiet world
// (scale.fireMult 0) neither attacks nor launches minions.

export const WARN = 0.7; // s between the warning and the bullets; the rule is at least 0.6
const MINION_CAP = 8;

// How minions fly, shared with predict.js so the autopilot's lookahead is the real flight: a carrier
// bobs along y ~ CARRIER_Y at `t` s of age; the rest fall at minionSpeed(d) and, over a step of h s
// ending at age t, steer toward the ship's column while they weave.
const CARRIER_Y = 500;
export const carrierY = (t) => CARRIER_Y + 18 * Math.sin(t * 2);
export const minionSpeed = (d) => 150 + 120 * d;
export const minionX = (x, shipX, t, id, h) => clamp(x + (clamp((shipX - x) / 40, -1, 1) * 90 + Math.cos(t * 3 + id) * 60) * h, EDGE, WIDTH - EDGE);

function release(world, b, w) {
  const a = bossDef(b.kind).phases[w.phase].attacks[w.i];
  const src = b.parts.find((p) => p.id === w.part);
  if (src.hp <= 0) return;
  const from = { x: src.x, y: src.y + src.h / 2 - 6 };
  const p = { ...a.p, speed: world.scale.bulletSpeed * (a.p.speed ?? 1) };
  addBullets(world, emitPattern(a.pattern, from, world.ship, p, world.rng));
  emit(world, 'fire', { side: 'enemy', id: src.id, role: 'boss', x: from.x, y: from.y, pattern: a.pattern });
}

export function stepAttacks(world, b, def, dt) {
  const rate = world.scale.fireMult;
  if (rate <= 0) return;
  prune(b.warns, (w) => {
    w.left -= dt;
    if (w.left > 0) return true;
    release(world, b, w);
    return false;
  });
  def.phases[b.phase].attacks.forEach((a, i) => {
    b.cd[i] -= dt;
    if (b.cd[i] > 0) return;
    b.cd[i] = a.every / rate;
    const src = b.parts.find((p) => p.id === a.from);
    if (src.hp <= 0) return;
    b.warns.push({ phase: b.phase, i, part: a.from, pattern: a.pattern, left: WARN, total: WARN });
    emit(world, 'bossWarn', { kind: b.kind, part: a.from, pattern: a.pattern, x: src.x, y: src.y, warn: WARN });
  });
}

// Launch `m.count` aliens of the role from a part, unless the part is destroyed. They are ordinary
// aliens without a formation slot (slot null, minion true): divers and the rest fly at the ship, a
// carrier crosses the screen below the boss with a power-up to shoot loose. A carrier flies in from
// the side of the screen, not out of its part, so it comes whatever is left of the part (R55). In world
// 14 a minion may be a shell like any alien (markShell).
function launch(world, b, m) {
  const src = b.parts.find((p) => p.id === m.from);
  const carrier = m.role === 'carrier';
  if (src.hp <= 0 && !carrier) return;
  let live = world.aliens.reduce((n, a) => n + (a.minion ? 1 : 0), 0);
  for (let i = 0; i < m.count && live < MINION_CAP; i++, live++) {
    const id = world.nextId++;
    const hp = ROLES[m.role].hp; // minions carry no armour bonus
    const a = {
      id, role: m.role, x: carrier ? (id % 2 ? -40 : 1960) : src.x + (i - (m.count - 1) / 2) * 56,
      y: carrier ? CARRIER_Y : src.y + src.h / 2, hp, maxHp: hp, slot: null,
      mode: carrier ? 'hold' : 'dive', t: 0, dive: null, minion: true, vx: carrier ? (id % 2 ? 150 : -150) : 0,
    };
    markShell(world, a);
    world.aliens.push(a);
  }
}

// Gunner minions shoot as gunners do in a wave, plain aimed shots (a boss level has no wave pattern);
// the other roles only fly at the ship. A gunner diving at the ship holds its fire once it is within
// POINT_BLANK of it, and once it is level with it or below: a shot from there could not be dodged.
const POINT_BLANK = 180; // px
const gunnerOf = (ship) => (a) =>
  a.minion && a.role === 'gunner' && a.hp > 0 && a.y < ship.y && dist2(ship, a) >= POINT_BLANK ** 2;

export function stepMinions(world, b, def, dt) {
  if (world.scale.fireMult <= 0) return;
  fire(world, dt, 'aimed', gunnerOf(world.ship));
  const list = def.phases[b.phase].minions ?? [];
  list.forEach((m, i) => {
    b.mcd[i] -= dt;
    if (b.mcd[i] > 0) return;
    b.mcd[i] = m.every;
    launch(world, b, m);
  });
}

// Minions fly (above). Anything that leaves the screen is dropped without score.
export function moveMinions(world, dt) {
  const speed = minionSpeed(world.level.d);
  for (const a of world.aliens) {
    if (!a.minion || a.hp <= 0) continue;
    a.t += dt;
    if (a.role === 'carrier') {
      a.x += a.vx * dt;
      a.y = carrierY(a.t);
      if (a.x < -80 || a.x > 2000) a.hp = 0;
    } else {
      a.y += speed * dt;
      a.x = minionX(a.x, world.ship.x, a.t, a.id, dt);
      if (a.y > 1120) a.hp = 0;
    }
  }
}
