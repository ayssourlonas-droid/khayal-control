// The boss sprite cache. A boss's painter module (bosses/<kind>.js) is run once per level into
// offscreen canvases; per frame the game only blits them (bosses/index.js).
//   bossArt(look, kind)   -> { mod, S, hull, parts } (baked on first call, kept until another boss)
//     hull  = { body, lights, flash, rage: [canvas | null per phase], x0, y0 } boss-local top-left
//             (flash: null until hullFlash(B) bakes it; only the dying boss needs it)
//     parts = { [id]: set }, set = { body, lights, flash, open?, w, h, m, seed, crack, cracks, ... }
//             drawn at the part's centre; the damage states (cracks.js) are baked on first use
//   warmBoss(look, kind)  bossArt plus everything the fight will need, the damage states and the hull
//                         flash included, so nothing is baked mid-fight (createView, on a boss level;
//                         a poster only draws the boss whole and calls bossArt)
//   hullFlash(B)          the hull's white silhouette (the collapse), baked on first use
//   stageOf(look, kind)   S, the stage the boss's painters draw on (below)
//   painterFor(mod, id)   [painter, mirror] for a part: its own painter, or its left twin's
//                         mirrored for an id ending in R (gunR from gun), or null
// A module is { pad?, margin?, margins?: { [id]: px }, crack?, hull(b, l, S),
//   parts: { [id | base]: (b, l, p, S) } (margin: px of canvas round a part's rect for art that
//   overhangs it, 34 by default; margins overrides it per part id),
//   opened?: { [id]: painter } (art once a phase opens the part), rage?: [(l, S) | null per phase]
//   (extra hull lights that fade in with that phase), behind?(ctx, boss, t) (a live body drawn right after the
//   hull and under the hull's lights and the parts: opaque, own pass only, cached sprites; the Craving's churning smoke),
//   live?(ctx, boss, t, k, own, since)
//   (per-frame extras in boss coordinates, 'lighter', cached sprites only; k is the light
//   strength, since when the phase began; anything opaque only when `own`, the boss's own pass,
//   since the darkness pass runs live again over the aliens), warm?() (paints the cached sprites
//   live() draws, which warmBoss calls so that none is baked mid-fight) }.
// S = { def, pal: look.palette.boss, look, W, H, pad }; b, l are the body and lights contexts.
import { makeCanvas, white } from '../sprites.js';
import { bossDef } from '../../core/bosses-data.js';
import { cracked, exposed, wreck } from './cracks.js';
import mothership from './mothership.js';
import pyramid from './pyramid.js';
import fortress from './fortress.js';
import shogun from './shogun.js';
import queen from './queen.js';
import agent from './agent.js';
import titan from './titan.js';
import singularity from './singularity.js';
import behemoth from './behemoth.js';
import count from './count.js';
import wyrm from './wyrm.js';
import grimoire from './grimoire.js';
import galleon from './galleon.js';
import carousel from './carousel.js';
import angler from './angler.js';
import moth from './moth.js';
import craving from './craving.js';
import ray from './ray.js';

export const BOSS_ART = { mothership, pyramid, fortress, shogun, queen, agent, titan, singularity, behemoth, count, wyrm, grimoire, galleon, carousel, angler, moth, craving, ray };
const cache = new Map();

export function painterFor(mod, id) {
  if (mod.parts[id]) return [mod.parts[id], 1];
  const base = id.replace(/[LR]$/, '');
  if (base !== id && mod.parts[base]) return [mod.parts[base], id.endsWith('R') ? -1 : 1];
  return null;
}

// A w x h canvas with the origin at (ox, oy), mirrored when flip is -1; pair = body and lights.
function layer(w, h, ox, oy, flip = 1) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  g.translate(ox, oy);
  g.scale(flip, 1);
  return [c, g];
}
const pair = (w, h, ox, oy, flip) => [layer(w, h, ox, oy, flip), layer(w, h, ox, oy, flip)];

function bakePart(mod, p, S, i) {
  const m = mod.margins?.[p.id] ?? mod.margin ?? 34;
  const w = p.w + m * 2;
  const h = p.h + m * 2;
  const [paint, flip] = painterFor(mod, p.id);
  const [[body, b], [lights, l]] = pair(w, h, w / 2, h / 2, flip);
  paint(b, l, p, S);
  const set = { body, lights, flash: white(body), w: p.w, h: p.h, m, seed: 31 + i * 17, crack: mod.crack ?? null, cracks: {} };
  const open = mod.opened?.[p.id];
  if (open) {
    const [[ob, obg], [ol, olg]] = pair(w, h, w / 2, h / 2, flip);
    open(obg, olg, p, S);
    set.open = { body: ob, lights: ol };
  }
  return set;
}

// The stage: the boss's definition, palette and look, and its hull canvas, the boss's size with `pad` px round it
// (padY up and down: a boss whose art reaches further up or down than across).
export function stageOf(look, kind) {
  const mod = BOSS_ART[kind];
  const def = bossDef(kind);
  const pad = mod.pad ?? 60;
  return { def, pal: look.palette.boss, look, W: def.size.w + pad * 2, H: def.size.h + (mod.padY ?? pad) * 2, pad };
}

function bake(look, kind) {
  const mod = BOSS_ART[kind];
  const S = stageOf(look, kind);
  const { def, W, H } = S;
  const [[body, b], [lights, l]] = pair(W, H, W / 2, H / 2);
  mod.hull(b, l, S);
  const rage = (mod.rage ?? []).map((paint) => {
    if (!paint) return null;
    const [c, g] = layer(W, H, W / 2, H / 2);
    paint(g, S);
    return c;
  });
  const parts = {};
  def.parts.forEach((p, i) => {
    parts[p.id] = bakePart(mod, p, S, i);
  });
  return { mod, S, hull: { body, lights, flash: null, rage, x0: -W / 2, y0: -H / 2 }, parts };
}

// Only the current boss is kept: a boss is several MB of canvases, and a kiosk session that plays
// all the boss levels must not hold them all (Pi 4 memory).
export function bossArt(look, kind) {
  const k = `${look.world}:${kind}`;
  let a = cache.get(k);
  if (!a) {
    cache.clear();
    a = bake(look, kind);
    cache.set(k, a);
  }
  return a;
}

export const hullFlash = (B) => (B.hull.flash ??= white(B.hull.body));

export function warmBoss(look, kind) {
  if (!kind) return null;
  const B = bossArt(look, kind);
  for (const p of B.S.def.parts) {
    const set = B.parts[p.id];
    cracked(set, 1);
    cracked(set, 2);
    if (p.armor) exposed(set, look.palette.boss.weak); // a plate cracks open once no weak part is left
    wreck(set);
    if (set.open) wreck(set, true);
  }
  hullFlash(B);
  B.mod.warm?.();
  return B;
}
