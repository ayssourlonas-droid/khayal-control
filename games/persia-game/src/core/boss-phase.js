import { bossDef } from './bosses-data.js';
import { emit } from './util.js';

// A boss's health and the story it tells: phases begin as hp falls through their thresholds, and
// at 0 hp the boss dies. Everything here runs after anything that can change a part's hp.

const BOSS_SCORE = 10000;
export const CHAIN = 3; // s of destruction chain between the death and the clear

// Begin phase `i`: fresh attack and minion countdowns.
export function beginPhase(b, i) {
  const ph = bossDef(b.kind).phases[i];
  b.phase = i;
  b.cd = ph.attacks.map((a, k) => a.every * (0.55 + 0.2 * (k % 3)));
  b.mcd = (ph.minions ?? []).map((m) => m.every * 0.5);
}

// The boss is dead: its score, an end to everything it was throwing, and the chain begins.
function die(world, b) {
  b.dying = CHAIN;
  b.blast = 0;
  b.warns.length = 0;
  world.score += BOSS_SCORE;
  world.bullets.length = 0; // a wipe, not a dodge: no near miss (R37)
  for (const a of world.aliens) {
    if (a.minion && a.hp > 0) {
      a.hp = 0;
      emit(world, 'explode', { x: a.x, y: a.y, size: 1 });
    }
  }
  emit(world, 'bossDeath', { kind: b.kind, x: b.x, y: b.y, score: BOSS_SCORE });
}

// When no weak point is left alive the plates crack open: every live armor part (one that is not
// weak) becomes weak, so a fight never turns into a grind at 25 % with nothing to aim at. One
// bossExpose per occurrence names the parts.
function crack(world, b) {
  if (b.parts.some((p) => p.hp > 0 && p.weak)) return;
  const plates = b.parts.filter((p) => p.hp > 0 && !p.weak);
  if (!plates.length) return;
  for (const p of plates) {
    p.weak = true;
    p.cracked = true;
  }
  emit(world, 'bossExpose', { kind: b.kind, parts: plates.map((p) => p.id), x: b.x, y: b.y });
}

// Re-add the parts' hp, then cross every threshold that hp has fallen through (one bossPhase each,
// in order, so a big hit lands in the later phase), then crack the plates if no weak point is left,
// then die at 0.
export function syncBoss(world) {
  const b = world.boss;
  if (!b || b.dying !== null) return;
  b.hp = b.parts.reduce((n, p) => n + p.hp, 0);
  const phases = bossDef(b.kind).phases;
  while (b.phase < phases.length - 1 && b.hp / b.maxHp <= phases[b.phase].until) {
    beginPhase(b, b.phase + 1);
    emit(world, 'bossPhase', { kind: b.kind, phase: b.phase, x: b.x, y: b.y, hp: b.hp });
  }
  if (b.hp <= 0) die(world, b);
  else crack(world, b);
}
