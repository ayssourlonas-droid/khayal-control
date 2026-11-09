import { layoutBunkers } from './bunkers.js';
import { hurtAlien } from './aliens.js';
import { burstAt } from './damage.js';
import { ALIEN_R, HUD_BOTTOM, WELL, EPS } from './kinds.js';
import { sweepDist2 } from './math.js';
import { randBetween } from './rng.js';
import { emit, prune } from './util.js';
import { pushAll, acid, glitch, reassemble, gravity } from './twists-2.js';
import { breath, breathState } from './twists-3.js';

// Each world's one small rule of its own. A level's rule is `level.twist`; applyTwist(world, dt)
// runs it once per tick, after collisions (twists-2.js has worlds 5-8 and says why that order); the
// shuriken's cut is the exception, collide() runs it (cutShuriken).
// The state is plain data on the world, the same fields in every world:
//   wind     px/s^2 pushing every bullet and shot sideways (gusts); 0 elsewhere
//   slow     seconds of bullet time left (glitch); 0 when off
//   saucer   null or the bonus carrier crossing the top (bunkers): alien-shaped, saucer true
//   wrecks   [{ x, y, hp, left, slot, hold, maxHp, wreck: true }] (reassemble; hold: it hangs in its
//            slot; maxHp: the fallen alien's, handed on to the one that stands up)
//   well     { x, y } or null (gravity)
//   twist    { timer, cool, wave, sent, drips } private: the countdown to the next lightning, gust,
//            blink, saucer or breath; the bullet-time cooldown; the wave bunkers were last laid for; the
//            saucers sent; acid in the making; fuses, the lit fireworks fuses (fireworks.js), made
//            for world 14 alone; rise, seconds since the breath's front left the bottom or null
//            (twists-3.js), made for world 17 alone

const SAUCER_EVERY = 20; // s
const SAUCER_Y = HUD_BOTTOM + 8; // just under the HUD band, so it is never behind a panel
const SAUCER_SPEED = 260;
const SAUCER_R = ALIEN_R + 8;
const GUST = 120; // px/s^2, either way

export function createTwist(level, rng) {
  const kind = level.twist;
  const twist = { timer: 0, cool: 0, wave: 0, sent: 0, drips: [] };
  const state = { wind: 0, slow: 0, saucer: null, wrecks: [], well: null, twist };
  if (kind === 'bunkers') twist.timer = SAUCER_EVERY;
  if (kind === 'darkness') twist.timer = randBetween(rng, 6, 10);
  if (kind === 'glitch') twist.timer = randBetween(rng, 3, 5);
  if (kind === 'gusts') {
    state.wind = randBetween(rng, -GUST, GUST);
    twist.timer = randBetween(rng, 4, 7);
  }
  if (kind === 'gravity') state.well = { ...WELL };
  if (kind === 'fireworks') twist.fuses = [];
  if (kind === 'breath') Object.assign(twist, breathState());
  return state;
}

// Bunkers: cover is laid fresh for every wave (the level must have it), and every 20 s a carrier
// saucer crosses the top, alternating sides; shoot it down for a power-up. It never counts as part
// of a wave.
function bunkers(world, dt) {
  const t = world.twist;
  if (t.wave !== world.wave) {
    if (t.wave > 0 && world.level.bunkers) world.bunkers = layoutBunkers();
    t.wave = world.wave;
  }
  t.timer -= dt;
  if (t.timer <= 0 && !world.saucer) {
    const dir = t.sent++ % 2 ? -1 : 1;
    const id = world.nextId++;
    world.saucer = {
      id, role: 'carrier', x: dir > 0 ? -40 : 1960, y: SAUCER_Y, hp: 1, maxHp: 1, vx: dir * SAUCER_SPEED,
      saucer: true, mode: 'hold', t: 0, slot: null, dive: null,
    };
    t.timer = SAUCER_EVERY;
    emit(world, 'saucer', { x: world.saucer.x, y: SAUCER_Y, dir });
  }
  const s = world.saucer;
  if (!s) return;
  s.x += s.vx * dt;
  s.t += dt;
  for (const shot of world.shots) {
    if (s.hp <= 0) break;
    if (shot.life > 0 && sweepDist2(shot, dt, s) <= (SAUCER_R + shot.r) ** 2) {
      shot.life = 0;
      hurtAlien(world, s, shot.dmg ?? 1);
    }
  }
  if (s.hp <= 0 || s.x < -80 || s.x > 2000) world.saucer = null;
}

// Darkness: a flash of lightning every 6 to 10 s lights the whole screen (the drawing's job; the
// core only says when and where).
function darkness(world, dt) {
  const t = world.twist;
  t.timer -= dt;
  if (t.timer > 0) return;
  t.timer = randBetween(world.rng, 6, 10);
  emit(world, 'lightning', { x: randBetween(world.rng, 100, 1820), strength: randBetween(world.rng, 0.6, 1) });
}

// Gusts: every 4 to 7 s the wind is rolled again, within +-120 px/s^2, and pushes every bullet
// and shot of both sides.
function gusts(world, dt) {
  const t = world.twist;
  t.timer -= dt;
  if (t.timer <= 0) {
    t.timer = randBetween(world.rng, 4, 7);
    world.wind = randBetween(world.rng, -GUST, GUST);
    emit(world, 'gust', { wind: world.wind });
  }
  pushAll(world, dt, (p, out) => {
    out.x = world.wind;
    out.y = 0;
  });
}

// Shuriken: a ship shot that touches a shuriken cuts it, and is spent doing so. Unlike the other
// rules it runs inside collide(), before the bullets meet the ship (collide.js says why).
export function cutShuriken(world, dt) {
  for (const s of world.shots) {
    if (s.life <= 0) continue;
    for (const b of world.bullets) {
      if (b.life <= 0 || b.pattern !== 'shuriken') continue;
      if (sweepDist2(s, dt, b) > (s.r + b.r) ** 2) continue;
      s.life = 0;
      b.life = 0;
      b.near = true; // settled: a cut is not a dodge, even inside the near band (R37)
      emit(world, 'cut', { x: b.x, y: b.y });
      break;
    }
  }
}

// Fireworks (world 14): each fuse that has burned down goes off, in the order it was lit: a 'burst'
// event, then its damage (burstAt). A burst that kills shells lights their fuses one link deeper;
// those are not due yet, so a chain goes off pop, pop, pop, FUSE s apart. A wave is not clear while a
// fuse is still lit (world-step.js), so the last shell's burst plays before the clear.
function fireworks(world) {
  const fuses = world.twist.fuses;
  if (!fuses.length) return;
  const due = fuses.filter((f) => f.at <= world.t + EPS);
  if (!due.length) return;
  prune(fuses, (f) => f.at > world.t + EPS);
  for (const f of due) {
    emit(world, 'burst', { x: f.x, y: f.y, depth: f.depth, kind: f.kind });
    burstAt(world, f.x, f.y, f.depth);
  }
}

// shuriken: cutShuriken. broadside (world 13) has no per-tick rule here: a pickup caught opens the ship's
// side guns (collect, powerups.js), tickPower counts them down, and shoot (ship.js) fires them.
const RULES = { bunkers, darkness, gusts, acid, glitch, reassemble, gravity, fireworks, breath };

export function applyTwist(world, dt) {
  RULES[world.level.twist]?.(world, dt);
}
