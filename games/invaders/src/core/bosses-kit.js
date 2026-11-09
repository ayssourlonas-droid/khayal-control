// The shorthands the boss definitions are written in. A definition is plain data:
//   { kind, name, y, size: { w, h }, parts, phases, maxHp, bottom }
//   part  = { id, dx, dy, w, h, hp, weak, armor }  (dx, dy: centre offset from the boss's centre)
//     weak  takes full damage; armor takes 25 %; a part that is neither is a bare hull, which
//     soaks shots and takes nothing until a phase opens it (the fortress's core).
//   phase = { until, move, attacks, rate?, minions?, open? }
//     until   the hp fraction at which this phase ends (the last is 0)
//     move    'sway' | 'hover' | 'charge' | 'orbit'; rate scales the pace (default 1)
//     attacks [{ pattern, every, from, p }]: every `every` s (shorter on harder levels) the part
//             `from` warns, then fires `pattern` with p = { count?, spread?, speed? } (speed is a
//             multiplier on the level's bullet speed)
//     minions [{ role, count, every, from }]: aliens launched from a part, flying at the ship
//     open    part ids that become weak when the phase begins
//   y is the boss's resting centre; bottom the lowest edge of any part below that centre.

const part = (weak, armor) => (id, dx, dy, w, h, hp) => ({ id, dx, dy, w, h, hp, weak, armor });

export const weak = part(true, false);
export const armor = part(false, true);
export const hull = part(false, false);

export const atk = (pattern, every, from, p = {}) => ({ pattern, every, from, p });
export const minion = (role, count, every, from) => ({ role, count, every, from });
export const phase = (until, move, attacks, extra = {}) => ({ until, move, attacks, ...extra });

export function boss(kind, name, y, size, parts, phases) {
  const maxHp = parts.reduce((n, p) => n + p.hp, 0);
  const bottom = Math.max(...parts.map((p) => p.dy + p.h / 2));
  return { kind, name, y, size, parts, phases, maxHp, bottom };
}
