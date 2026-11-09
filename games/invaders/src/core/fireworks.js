import { rand } from './rng.js';

// World 14's twist, the fireworks (R62): every alien made there may be a shell, a toy stuffed with
// powder. A shell that dies lights a fuse, and when the fuse burns out it bursts where the shell
// fell and hurts what is near it, which can kill more shells and light theirs in turn.
//   alien.shell        true on a shell; no other alien, in any world, has the field
//   world.twist.fuses  [{ x, y, depth, kind, at }] the lit fuses in the order they were lit, made for
//                      the fireworks twist alone. `at` is the world time (world.t) it goes off, `kind`
//                      the dead shell's role, `depth` how many bursts came before it in its chain
//                      (0 when a shot, the beam or a bomb killed the shell).
// This file makes shells and lights fuses. twists.js sets them off (fireworks) and damage.js deals the
// burst (burstAt); damage.js imports aliens.js, which imports this, so this file imports neither.

export const SHELL_SHARE = 0.22; // chance that an alien made in world 14 is a shell
export const FUSE = 0.12; // s from a shell's death to its burst

// A new alien (a wave's, or a boss minion). In world 14 alone one draw on the world rng makes it a
// shell; in every other world nothing is drawn and the alien gets no `shell` field.
export function markShell(world, a) {
  if (world.level.twist === 'fireworks' && rand(world.rng) < SHELL_SHARE) a.shell = true;
}

// A shell has just died where it stood: its fuse is lit, at depth 0. The burst that killed it, if one
// did, deepens it (burstAt).
export function lightFuse(world, a) {
  world.twist.fuses.push({ x: a.x, y: a.y, depth: 0, kind: a.role, at: world.t + FUSE });
}
