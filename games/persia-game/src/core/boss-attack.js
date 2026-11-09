import { ROLES, WIDTH, EDGE } from './kinds.js';
import { addBullets } from './aliens.js';
import { emitPattern } from './patterns.js';
import { bossDef } from './bosses-data.js';
import { clamp } from './math.js';
import { emit, prune } from './util.js';

// What a boss throws. An attack is a countdown per phase entry; when it runs out the part warns
// (bossWarn, and an entry in b.warns for the renderer to draw as a charge-up), WARN s later it
// fires, and the countdown restarts. A part destroyed in between never fires. A quiet world
// (scale.fireMult 0) does not attack.

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

// Launch `m.count` aliens of the species from a part, unless the part is destroyed. They are
// ordinary aliens without a formation slot (slot null, minion true), each fighting as its species'
// role: divers and the rest fly at the ship, a carrier crosses the screen below the boss with a
// power-up to shoot loose. A launch of at least one emits 'minion' { species }, so the giant
// names what it sends; none when the part is gone or the cap leaves no room.
function launch(world, b, m) {
  const src = b.parts.find((p) => p.id === m.from);
  if (src.hp <= 0) return;
  const live = world.aliens.reduce((n, a) => n + (a.minion ? 1 : 0), 0);
  const n = Math.min(m.count, MINION_CAP - live);
  for (let i = 0; i < n; i++) {
    const id = world.nextId++;
    const carrier = m.role === 'carrier';
    const hp = ROLES[m.role].hp; // minions carry no armour bonus
    world.aliens.push({
      id, role: m.role, species: m.species, x: carrier ? (id % 2 ? -40 : 1960) : src.x + (i - (m.count - 1) / 2) * 56,
      y: carrier ? CARRIER_Y : src.y + src.h / 2, hp, maxHp: hp, slot: null,
      mode: carrier ? 'hold' : 'dive', t: 0, dive: null, minion: true, vx: carrier ? (id % 2 ? 150 : -150) : 0,
    });
  }
  if (n > 0) emit(world, 'minion', { species: m.species });
}

// Each minion group of the phase launches when its countdown runs out. Minions never shoot.
export function stepMinions(world, b, def, dt) {
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
