import { wrapAngle, segBoxDist2 } from './math.js';
import { SHIP_R, hitShip, fromOf } from './ship.js';
import { hurtAlien, firstAlien } from './aliens.js';
import { liveParts, hurtPart, firstPart } from './boss-hit.js';
import { emit } from './util.js';

// The collisions only a free level has (R67: every world from 18 on), run by collide.js after the cover:
//   the boss's body rams: a ship that touches a live part loses a life (hitShip 'ram'), and the boss
//     takes nothing; a blinking ship passes, and a shielded one grazes it unharmed and silent (a
//     shield hit would sound every tick it stays on the boss). The ship is tested along the path it flew
//     this tick (R68), so one that crossed a part in a single move rammed it.
//   the enemy's homing fire turns on its own side: a homing bullet notes its heading the first tick it
//     is seen here; once the chase has turned it DRAG_TURN away from that, it is `dragged` for good,
//     and a dragged bullet is spent on the first live alien it crosses, or else the first live boss
//     part, hurting it 1 (a kill scores and drops as any other; a part takes it by its own rule, weak
//     100 %, armor 25 %), with a `backfire`. On its first course it passes its own side.

export const DRAG_TURN = Math.PI / 4;

function bossRams(world) {
  const s = world.ship;
  if (!s.alive || s.invuln > 0 || s.power?.kind === 'shield') return;
  const { x, y } = fromOf(s);
  const touches = (p) => segBoxDist2(x, y, s.x, s.y, p.x, p.y, p.w, p.h) <= SHIP_R * SHIP_R;
  if (liveParts(world).some(touches)) hitShip(world, 'ram');
}

function dragBullets(world, dt) {
  const parts = liveParts(world);
  for (const b of world.bullets) {
    if (b.life <= 0 || !b.turn) continue;
    const heading = Math.atan2(b.vy, b.vx);
    if (b.h0 === undefined) b.h0 = heading;
    else if (!b.dragged && Math.abs(wrapAngle(heading - b.h0)) >= DRAG_TURN) b.dragged = true;
    if (!b.dragged) continue;
    const a = firstAlien(world, b, dt);
    const p = a ? null : firstPart(parts, b, dt);
    if (!a && !p) continue;
    b.life = 0;
    if (a) {
      emit(world, 'backfire', { id: a.id, role: a.role, x: a.x, y: a.y });
      hurtAlien(world, a, 1);
    } else {
      emit(world, 'backfire', { id: p.id, role: 'boss', x: b.x, y: b.y });
      hurtPart(world, p, 1, b);
    }
  }
}

export function collideFree(world, slow) {
  bossRams(world);
  dragBullets(world, slow);
}
