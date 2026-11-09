import { stepShip } from './ship.js';
import { stepAliens, spawnWave } from './aliens.js';
import { spawnBoss, stepBoss } from './boss.js';
import { stepBulletTime, enemyDt } from './bullet-time.js';
import { stepPickups, sweepPickups, tickPower } from './powerups.js';
import { stepBeam, stepBomb } from './weapons.js';
import { collide } from './collide.js';
import { stepBullet } from './patterns.js';
import { tickCombo, clearBonus, stars } from './scoring.js';
import { emit, prune } from './util.js';
import { WIDTH, HEIGHT } from './kinds.js';

// One tick of play, in the order that decides ties:
//   combo -> projectiles move -> ship moves and shoots -> aliens and the boss move, dive, shoot ->
//   power-ups, bomb and beam -> collisions -> bullet time -> the dead are pruned -> wave flow
//   -> win or lose.
// New projectiles stay where they were fired until the next tick. Projectiles move before anything
// is fired and collisions run after every kill and hit is possible, so a shot in flight still kills
// the last alien on the tick the ship loses its last life, and settle() then favours the player.

const WAVE_GAP = 1.2; // s between a wave's last death and the next wave
export const BOSS_GAP = 2.5; // s between the last wave's last death and the boss
const DONE = 1e-9; // a gap counted down in TICKs is over on its last tick, float error or not

const MARGIN = 60; // how far off screen a projectile may fly before it is dropped
const inside = (b) => b.x > -MARGIN && b.x < WIDTH + MARGIN && b.y > -MARGIN && b.y < HEIGHT + MARGIN;

function cull(world) {
  prune(world.shots, (s) => s.life > 0 && inside(s));
  prune(world.bullets, (b) => b.life > 0 && inside(b));
  prune(world.aliens, (a) => a.hp > 0);
}

// A field with no alien standing is empty.
const empty = (world) => world.aliens.length === 0;

// An empty field ends the wave: waveClear on that very tick, then the gap, then the next wave, or
// after the last wave the boss (its fight is boss.js's, and its minions are no wave). `last` says
// the level ends with this wave.
function stepWave(world, dt) {
  const { waves, boss } = world.level;
  if (!waves || world.boss) return;
  if (world.gap !== null) {
    world.gap -= dt;
    if (world.gap > DONE) return;
    world.gap = null;
    if (world.wave < waves.length) spawnWave(world);
    else {
      world.march = null;
      spawnBoss(world, boss);
    }
  } else if (empty(world)) {
    const last = world.wave >= waves.length;
    emit(world, 'waveClear', { wave: world.wave, last: last && !boss });
    if (!last) world.gap = WAVE_GAP;
    else if (boss) world.gap = BOSS_GAP;
  }
}

// The last wave gone, or on a level with a boss its destruction chain over.
function won(world) {
  const { waves, boss } = world.level;
  if (boss) return world.boss?.dying === 0;
  return world.wave >= waves.length && world.gap === null && empty(world);
}

// Cleared beats failed: the last wave gone is a clear even if the ship died that same tick. A clear
// first sweeps up the pickups still falling (their sweep events, then `cleared` with every point in).
function settle(world) {
  if (won(world)) {
    sweepPickups(world);
    const bonus = clearBonus(world);
    world.score += bonus;
    world.state = 'cleared';
    emit(world, 'cleared', { score: world.score, bonus, stars: stars(world) });
  } else if (world.ship.lives <= 0) {
    world.state = 'failed';
    emit(world, 'failed', { score: world.score });
  }
}

export function stepPlay(world, dt, input) {
  const slow = enemyDt(world, dt); // enemy bullets, aliens and the boss move in this time
  tickCombo(world, dt);
  for (const s of world.shots) stepBullet(s, dt);
  for (const b of world.bullets) stepBullet(b, slow);
  stepShip(world, dt, input);
  stepAliens(world, slow);
  stepBoss(world, slow);
  tickPower(world, dt);
  stepPickups(world, dt);
  stepBomb(world);
  stepBeam(world, dt, input);
  collide(world, dt, slow);
  stepBulletTime(world, dt);
  cull(world);
  stepWave(world, dt);
  settle(world);
}
