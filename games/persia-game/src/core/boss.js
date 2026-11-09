import { bossDef } from './bosses-data.js';
import { beginPhase, syncBoss } from './boss-phase.js';
import { stepMove, startAt, ENTER } from './boss-move.js';
import { stepAttacks, stepMinions, moveMinions } from './boss-attack.js';
import { rand, randPick } from './rng.js';
import { emit } from './util.js';

// A boss fight. world.boss holds only data (the static layout is looked up by kind in bossDef):
//   { kind, x, y, hp, maxHp, phase, parts, clock, enter, dying, blast, cd, mcd, warns }
//   parts[] = { id, dx, dy, w, h, hp, max, weak, cracked, x, y, part: true, burn }
//     (x, y is the part's absolute centre, kept current every tick; cracked marks a plate that
//     became weak because no weak point was left: boss-phase.js)
//   clock the boss's own movement clock; enter seconds of flying in left (0 = fighting);
//   dying null while alive, then the seconds of destruction chain left; blast the countdown to the
//   next blast of that chain; cd/mcd the countdowns of this phase's attacks and minion launches;
//   warns the attacks in their telegraph [{ phase, i, part, pattern, left, total }].
const BLAST_EVERY = 0.12; // s between the blasts of the chain

const place = (b) => {
  for (const p of b.parts) {
    p.x = b.x + p.dx;
    p.y = b.y + p.dy;
  }
};

// Bring the boss in and say so: `species` is the animal it is a giant of.
export function spawnBoss(world, kind) {
  const def = bossDef(kind);
  const b = {
    kind, ...startAt(def), hp: def.maxHp, maxHp: def.maxHp, phase: 0,
    parts: def.parts.map((p) => ({ ...p, max: p.hp, cracked: false, x: 0, y: 0, part: true, burn: 0 })),
    clock: 0, enter: ENTER, dying: null, blast: 0, cd: [], mcd: [], warns: [],
  };
  beginPhase(b, 0);
  place(b);
  world.boss = b;
  emit(world, 'boss', { kind, species: def.species });
  return b;
}

// The destruction chain: staggered blasts over the parts, and one great one at the end.
function chain(world, b, dt) {
  const was = b.dying;
  b.dying = Math.max(0, was - dt);
  b.blast -= dt;
  while (b.blast <= 0 && b.dying > 0) {
    b.blast += BLAST_EVERY;
    const p = randPick(world.rng, b.parts);
    emit(world, 'explode', {
      x: p.x + (rand(world.rng) - 0.5) * p.w, y: p.y + (rand(world.rng) - 0.5) * p.h, size: rand(world.rng) < 0.25 ? 2 : 1,
    });
  }
  if (was > 0 && b.dying === 0) emit(world, 'explode', { x: b.x, y: b.y, size: 3 });
}

// One tick: fly or fight, then re-add the hp (a part's hp may have been changed from outside).
export function stepBoss(world, dt) {
  const b = world.boss;
  if (!b) return;
  if (b.dying !== null) {
    chain(world, b, dt);
    return;
  }
  const def = bossDef(b.kind);
  b.enter = Math.max(0, b.enter - dt);
  stepMove(b, def, dt, world.ship);
  place(b);
  syncBoss(world);
  moveMinions(world, dt);
  if (world.state !== 'play' || b.enter > 0 || b.dying !== null) return;
  stepAttacks(world, b, def, dt);
  stepMinions(world, b, def, dt);
}
