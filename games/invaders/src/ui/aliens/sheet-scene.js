// dev.html?sheet=w16scene and ?sheet=w16boss: a whole frame of one world's look, for judging it by eye (not shipped UI).
//   w16scene   sky, parallax, ambient and flourishes at time &t= (seconds, default 6), the world's first level run
//              &sim= seconds (default 4, the autopilot flying: a formation, shots, effects), and (&twin=1) the
//              mirror power running with its shots
//   (world 17: &h=0..1 pins the healing, heal.js; without it the first level is at h 0)
//   w16boss    the world's boss at rest, drawn whole: &phase=0|1|2, &t=, &hurt=wingL:0.5,heart:0 (the share of hp
//              each named part has left, to see its damage), &dead=ids (parts destroyed), &hud=0 hides the HUD
// One frame, drawn once, so a headless screenshot with --virtual-time-budget catches it.
import { levelById } from '../../core/levels.js';
import { BOSSES } from '../../core/kinds.js';
import { createWorld, stepWorld } from '../../core/world.js';
import { autopilot } from '../../core/autopilot.js';
import { TICK } from '../../core/kinds.js';
import { applyEvents } from '../../fx/react.js';
import { fxRng } from '../session.js';
import { spawnBoss } from '../../core/boss.js';
import { bossDef } from '../../core/bosses-data.js';
import { createFx, stepFx } from '../../fx/fx.js';
import { createView, drawFrame } from '../view.js';

const parts = (s) => Object.fromEntries((s ?? '').split(',').filter(Boolean).map((kv) => kv.split(':')).map(([k, v]) => [k, Number(v ?? 0)]));

function bossWorld(world, n, q) {
  const kind = BOSSES[n - 1];
  const def = bossDef(kind);
  const b = spawnBoss(world, kind);
  b.enter = 0;
  b.x = 960;
  b.y = def.y;
  b.phase = Number(q.get('phase') ?? 0);
  const hurt = parts(q.get('hurt'));
  for (const id of (q.get('dead') ?? '').split(',').filter(Boolean)) hurt[id] = 0;
  for (const p of b.parts) {
    p.x = b.x + p.dx;
    p.y = b.y + p.dy;
    if (p.id in hurt) p.hp = Math.round(p.max * hurt[p.id]);
  }
  world.aliens = [];
}

export function drawScene(canvas, n, boss) {
  const q = new URLSearchParams(location.search);
  const level = levelById(`w${n}-${boss ? 5 : 1}`) ?? { ...levelById(boss ? 'w15-5' : 'w15-1'), world: n, ...(boss ? { boss: BOSSES[n - 1] } : {}) };
  const world = createWorld(level);
  const fx = createFx();
  const rng = fxRng(level.seed);
  if (!boss) {
    for (let i = 0, m = Math.round(Number(q.get('sim') ?? 4) / TICK); i < m; i++) {
      stepWorld(world, TICK, autopilot(world));
      applyEvents(fx, world.events.splice(0), rng, world);
      stepFx(fx, TICK);
    }
  }
  const view = createView(canvas, level, true);
  view.showHud = boss ? q.get('hud') !== '0' : false;
  if (view.heal && q.has('h')) view.heal.force = Number(q.get('h')); // world 17: &h=0..1 pins the healing
  if (boss) bossWorld(world, n, q);
  if (q.get('twin') === '1') {
    world.ship.power = { kind: 'mirror', left: 6 };
    world.ship.x = 700;
    world.shots.push({ pattern: 'shot', x: 700, y: 760, vx: 0, vy: -1400, r: 5, life: 1, dmg: 1 }, { pattern: 'shot', x: 1220, y: 700, vx: 0, vy: -1400, r: 5, life: 1, dmg: 1, mirror: true });
  }
  stepFx(fx, 0.016);
  drawFrame(view, world, fx, Number(q.get('t') ?? 6));
}
