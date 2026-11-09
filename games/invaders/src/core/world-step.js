import { stepShip } from './ship.js';
import { stepAliens, spawnWave } from './aliens.js';
import { stepBoss } from './boss.js';
import { applyTwist } from './twists.js';
import { enemyDt } from './twists-2.js';
import { stepPickups, sweepPickups, tickPower } from './powerups.js';
import { stepBeam, stepBomb } from './weapons.js';
import { collide } from './collide.js';
import { stepBullet } from './patterns.js';
import { tickCombo, awardClear, stars } from './scoring.js';
import { emit, prune } from './util.js';
import { WIDTH, HEIGHT } from './kinds.js';

// One tick of play, in the order that decides ties:
//   combo -> projectiles move -> ship moves and shoots -> aliens and the boss move, dive, shoot ->
//   power-ups, bomb and beam -> collisions -> the world's twist -> the dead are pruned -> wave flow
//   -> win or lose.
// New projectiles stay where they were fired until the next tick. Projectiles move before anything
// is fired and collisions run after every kill and hit is possible, so a shot in flight still kills
// the last alien on the tick the ship loses its last life, and settle() then favours the player.

const WAVE_GAP = 1.2; // s between a wave's last death and the next wave

const MARGIN = 60; // how far off screen a projectile may fly before it is dropped
const inside = (b) => b.x > -MARGIN && b.x < WIDTH + MARGIN && b.y > -MARGIN && b.y < HEIGHT + MARGIN;

function cull(world) {
  prune(world.shots, (s) => s.life > 0 && inside(s));
  prune(world.bullets, (b) => b.life > 0 && inside(b));
  prune(world.aliens, (a) => a.hp > 0);
}

// A field with no alien, no wreck standing and no fuse still lit (world 14) is empty, so the last
// shell of a level bursts before the clear.
const empty = (world) => world.aliens.length === 0 && world.wrecks.length === 0 && !world.twist.fuses?.length;

// An empty field ends the wave: waveClear on that very tick, then the gap, then the next wave.
// Boss levels have no waves (boss.js runs the fight).
function stepWave(world, dt) {
  const waves = world.level.waves;
  if (!waves) return;
  if (world.gap !== null) {
    world.gap -= dt;
    if (world.gap <= 0) {
      world.gap = null;
      spawnWave(world);
    }
  } else if (empty(world)) {
    const last = world.wave >= waves.length;
    emit(world, 'waveClear', { wave: world.wave, last });
    if (!last) world.gap = WAVE_GAP;
  }
}

// The last wave gone, or the boss's destruction chain over.
function won(world) {
  const { waves } = world.level;
  if (world.boss) return world.boss.dying === 0;
  return Boolean(waves) && world.wave >= waves.length && world.gap === null && empty(world);
}

// Cleared beats failed: the last wave gone is a clear even if the ship died that same tick. A clear
// first sweeps up the pickups still falling (their sweep events, then `cleared` with every point in).
function settle(world) {
  if (won(world)) {
    sweepPickups(world);
    const { bonus, medal } = awardClear(world); // the whole tally stays on world.tally
    world.state = 'cleared';
    emit(world, 'cleared', { score: world.score, bonus, stars: stars(world), medal });
  } else if (world.ship.lives <= 0) {
    world.state = 'failed';
    emit(world, 'failed');
  }
}

export function stepPlay(world, dt, input) {
  const slow = enemyDt(world, dt); // enemy bullets, aliens and the boss move in this time
  tickCombo(world, dt);
  for (const s of world.shots) stepBullet(s, dt, world);
  for (const b of world.bullets) stepBullet(b, slow, world);
  stepShip(world, dt, input);
  stepAliens(world, slow);
  stepBoss(world, slow);
  tickPower(world, dt);
  stepPickups(world, dt);
  stepBomb(world);
  stepBeam(world, dt, input);
  collide(world, dt, slow);
  applyTwist(world, dt);
  cull(world);
  stepWave(world, dt);
  settle(world);
}
