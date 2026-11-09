// A fingerprint of a world, for the one question replays ask: is this the same state? Everything
// that moves or counts goes in (positions rounded to 0.01 px, so float dust cannot tell two
// identical runs apart), including the rng state, which any divergence in the draws changes, and
// the bunker masks byte by byte (a Uint8Array does not survive JSON.stringify).

const round = (v) => Math.round(v * 100);

// cyrb53: 53 bits of a string, as 16 hex digits.
function digest(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

function maskSum(mask) {
  let h = 0;
  for (let i = 0; i < mask.length; i++) h = (Math.imul(h, 31) + mask[i]) | 0;
  return h;
}

const points = (list) => list.map((p) => `${round(p.x)},${round(p.y)}`);

// The lit fireworks fuses (world 14), when any: how many, then where, how deep and when each goes off.
const fuseParts = ({ twist }) =>
  (twist.fuses?.length ? [twist.fuses.length, ...twist.fuses.map((f) => `${round(f.x)},${round(f.y)},${f.depth},${round(f.at)}`)] : []);

// The breath (world 17), when it is that world: the countdown to the next one and how far the front has risen.
const breathParts = ({ twist }) => (twist.rise === undefined ? [] : [round(twist.timer), twist.rise === null ? '-' : round(twist.rise)]);

export function stateHash(world) {
  const { ship, boss } = world;
  const parts = [
    world.tick, world.state, world.score, world.hits, world.wave, world.combo.mult, world.rng.s,
    round(ship.x), round(ship.y), ship.lives, round(ship.invuln), ship.bombs, ship.power?.kind, round(ship.power?.left ?? 0),
    ship.reserve?.kind, round(ship.reserve?.left ?? 0),
    ...(ship.broadside > 0 ? [round(ship.broadside)] : []), // world 13's side guns; shut elsewhere, so nothing is added
    ...fuseParts(world), // world 14's lit fuses; none elsewhere, so nothing is added
    ...breathParts(world), // world 17's breath; no rise elsewhere, so nothing is added
    world.aliens.length, ...world.aliens.map((a) => `${a.id},${round(a.x)},${round(a.y)},${a.hp},${a.mode}`),
    world.shots.length, ...points(world.shots),
    world.bullets.length, ...points(world.bullets),
    world.pickups.length, ...world.pickups.map((p) => `${p.kind},${round(p.x)},${round(p.y)}`),
    ...world.bunkers.map((b) => maskSum(b.mask)),
    world.wrecks.length, round(world.slow), round(world.wind), world.saucer ? round(world.saucer.x) : '-',
    world.march ? round(world.march.clock) : '-',
  ];
  if (boss) {
    parts.push(round(boss.x), round(boss.y), round(boss.clock), round(boss.hp), boss.phase, round(boss.enter),
      boss.dying === null ? '-' : round(boss.dying), ...boss.parts.map((p) => round(p.hp)));
  }
  return `${world.tick}:${world.score}:${digest(parts.join(';'))}`;
}
