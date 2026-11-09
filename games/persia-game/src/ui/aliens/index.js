// Everything alien-shaped on the playfield, in the sprites aliens/animals.js paints and bake.js
// bakes once: world.aliens (formation and boss minions), each drawn as its species.
//   drawAliens(ctx, world, look, t, named)   world space, after the boss (minions fly over
//                                     the boss they launch from); `named` is the species whose name
//                                     is being said: its aliens light up, a big pulsing halo and a
//                                     white lift on the body
//   crackStage(alien)                 0 | 1 | 2, how cracked an alien is drawn (a.maxHp)
//   HALO_R, blit(ctx, img, set, x, y, rot)   the halo's radius in play and how a sprite is put on
//                                     the canvas, for the parade, which draws the animals the same way
//   namedLight(t) -> { halo, lift }   how bright a named species is at t (alphas), for its giant too
// Per alien: a halo (cached glow, 'lighter'), the body (cracked once it has lost hp; a white
// silhouette for FLASH s after a hit) and its lights ('lighter'); frames alternate at the art's
// rate, swoopers lean into the swoop. The flash is the renderer's own memory: a WeakMap of the hp
// each alien had when last drawn. Nothing on world or fx is written.
import { glow } from '../sprites.js';
import { clamp } from '../../core/math.js';
import { isSwooping } from '../../core/aliens.js';
import { RATE, HALO } from './animals.js';
import { speciesSprites } from './bake.js';
import { cracked } from './cracks.js';

const FLASH = 0.09; // s
const seen = new WeakMap(); // alien -> { hp, at }

function flashing(a, t) {
  let m = seen.get(a);
  if (!m) {
    m = { hp: a.hp, at: -Infinity };
    seen.set(a, m);
  }
  if (a.hp < m.hp) m.at = t;
  m.hp = a.hp;
  return t >= m.at && t - m.at < FLASH;
}

// 0 unhurt, 1 hurt, 2 badly hurt, from the hp lost out of the alien's own maxHp (set by the core
// where it was made; ruling R25). An alien without one is drawn whole. Exported for tests.
export function crackStage(a) {
  const max = a.maxHp ?? a.hp;
  if (a.hp >= max) return 0;
  return Math.min(2, Math.ceil((2 * (max - a.hp)) / max - 1e-9));
}

const frameOf = (t) => Math.floor(t * RATE) & 1; // the whole formation steps in time

// A swooping alien leans into its swoop (sprites face down): toward its aim on the way out, a little
// back the other way on the return; a boss minion leans toward the ship it is falling on.
function lean(world, a) {
  if (!isSwooping(a)) return 0;
  const dx = a.dive ? a.dive.ax - a.dive.fx : a.minion ? world.ship.x - a.x : 0;
  return clamp(-dx / 500, -0.55, 0.55) * (a.mode === 'return' ? -0.6 : 1);
}

export function blit(ctx, img, set, x, y, rot = 0) {
  const s = set.size;
  if (!rot) {
    ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.drawImage(img, -s / 2, -s / 2, s, s);
  ctx.restore();
}

export const HALO_R = 44; // px, an alien's halo at scale 1
const NAMED_R = 78; // px, the halo of an alien whose name is being said
// How bright a named species is at t, its aliens here and its giant in bosses/index.js: the big
// halo's alpha and the white lift's, on a beat about twice a second.
export function namedLight(t) {
  const p = 0.5 + 0.5 * Math.sin(t * 14);
  return { halo: 0.65 + 0.35 * p, lift: 0.2 + 0.3 * p };
}

function halos(ctx, list, look, t, named, light) {
  const colors = look.palette.alien;
  ctx.globalCompositeOperation = 'lighter';
  for (const a of list) {
    let r = HALO_R;
    ctx.globalAlpha = HALO;
    if (a.species === named) {
      r = NAMED_R;
      ctx.globalAlpha = light.halo;
    } else if (a.role === 'carrier') {
      r = 62;
      ctx.globalAlpha = 0.42 + 0.18 * Math.sin(t * 5 + a.id);
    }
    ctx.drawImage(glow(colors[a.species]), a.x - r, a.y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function drawAliens(ctx, world, look, t, named) {
  const f = frameOf(t);
  const light = namedLight(t);
  halos(ctx, world.aliens, look, t, named, light);
  for (const a of world.aliens) {
    const set = speciesSprites(look, a.species);
    const k = crackStage(a);
    const img = flashing(a, t) ? set.flash[f] : k ? cracked(set, f, k) : set.body[f];
    blit(ctx, img, set, a.x, a.y, lean(world, a));
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const a of world.aliens) {
    const set = speciesSprites(look, a.species);
    blit(ctx, set.lights[f], set, a.x, a.y, lean(world, a));
  }
  if (named) {
    const set = speciesSprites(look, named);
    ctx.globalAlpha = light.lift;
    for (const a of world.aliens) {
      if (a.species === named) blit(ctx, set.flash[f], set, a.x, a.y, lean(world, a));
    }
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
}
