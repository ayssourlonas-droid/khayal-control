import { bossDef } from './bosses-data.js';
import { emit } from './util.js';
import { awardBoss } from './scoring.js';

// A boss's health and the story it tells: phases begin as hp falls through their thresholds, and
// at 0 hp the boss dies. Everything here runs after anything that can change a part's hp.

export const CHAIN = 3; // s of destruction chain between the death and the clear

// Begin phase `i`: fresh attack and minion countdowns, and the parts it opens (those become weak).
// Returns the ids of the parts it opened.
export function beginPhase(b, i) {
  const ph = bossDef(b.kind).phases[i];
  b.phase = i;
  b.cd = ph.attacks.map((a, k) => a.every * (0.55 + 0.2 * (k % 3)));
  b.mcd = (ph.minions ?? []).map((m) => m.every * 0.5);
  const opened = ph.open ?? [];
  for (const p of b.parts) {
    if (opened.includes(p.id)) {
      p.weak = true;
      p.open = true;
    }
  }
  return opened;
}

// The boss is dead: its points (awardBoss), an end to everything it was throwing, and the chain begins.
function die(world, b) {
  b.dying = CHAIN;
  b.blast = 0;
  b.warns.length = 0;
  const score = awardBoss(world);
  world.bullets.length = 0; // a wipe, not a dodge: no near miss (R37)
  for (const a of world.aliens) {
    if (a.minion && a.hp > 0) {
      a.hp = 0;
      emit(world, 'explode', { x: a.x, y: a.y, size: 1 });
    }
  }
  emit(world, 'bossDeath', { kind: b.kind, x: b.x, y: b.y, score });
}

// When no weak point is left alive the plates crack open: every live armor part becomes weak (and
// is no longer armor), so a fight never turns into a grind at 25 % with nothing to aim at. One
// bossExpose per occurrence names the parts. A bare hull is not a plate and stays shut.
function crack(world, b) {
  if (b.parts.some((p) => p.hp > 0 && p.weak)) return;
  const plates = b.parts.filter((p) => p.hp > 0 && p.armor);
  if (!plates.length) return;
  for (const p of plates) {
    p.weak = true;
    p.armor = false;
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
    const open = beginPhase(b, b.phase + 1);
    emit(world, 'bossPhase', { kind: b.kind, phase: b.phase, x: b.x, y: b.y, hp: b.hp, open });
  }
  if (b.hp <= 0) die(world, b);
  else crack(world, b);
}
