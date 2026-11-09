// Everything alien-shaped on the playfield, in each world's own sprites (aliens/w1.js .. w15.js,
// baked once by bake.js): world.aliens (formation and boss minions), world.saucer (the bonus carrier,
// or null) and world.wrecks (armored wrecks waiting to reassemble).
//   drawAliens(ctx, world, look, t)          world space, after the bunkers and the boss (minions
//                                            fly over the boss they launch from)
//   drawAlienLights(ctx, world, look, t, k)  the lights again at strength k: Neon Rain's darkness
//                                            pass dims the scene, then calls this so the neon survives
//                                            (and a hurt alien's cracks glow faintly, cracks.js)
//   crackStage(alien)                        0 | 1 | 2, how cracked an alien is drawn (a.maxHp)
// A reborn armored (Iron Dawn) keeps the fallen one's maxHp, so it stands up drawn cracked.
// Per alien: a halo (cached glow, 'lighter'), the body (cracked once it has lost hp; a white
// silhouette for FLASH s after a hit) and its lights ('lighter'); frames alternate at the world's
// rate, some worlds bob, swoopers lean into the swoop. The flash is the renderer's own memory: a
// WeakMap of the hp each alien had when last drawn. Nothing on world or fx is written. In world 14 a shell
// (alien.shell) wears a lit fuse and a glow on top of its sprite (shell-view.js); in world 16 a wreck is a cloud of
// glass shards (mending-view.js).
import { glow } from '../sprites.js';
import { clamp } from '../../core/math.js';
import { WRECK_TIME } from '../../core/twists-2.js';
import { isSwooping } from '../../core/aliens.js';
import { art, roleSprites, extraSprites } from './bake.js';
import { cracked, crackLights } from './cracks.js';
import { drawShells } from '../shell-view.js';
import { drawMending } from '../mending-view.js';
import { GLASS_WORLD } from '../glass-kit.js';

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

const frameOf = (A, a, t) => Math.floor(t * A.rate + (A.sync ? 0 : a.id * 0.37)) & 1;
const bobOf = (A, a, t) => (A.bob ? Math.sin(t * 2.3 + a.id * 1.7) * A.bob : 0);

// A swooping alien leans into its swoop (sprites face down): toward its aim on the way out, a little
// back the other way on the return; a boss minion leans toward the ship it is falling on.
function lean(world, a) {
  if (!isSwooping(a)) return 0;
  const dx = a.dive ? a.dive.ax - a.dive.fx : a.minion ? world.ship.x - a.x : 0;
  return clamp(-dx / 500, -0.55, 0.55) * (a.mode === 'return' ? -0.6 : 1);
}

function blit(ctx, img, set, x, y, a = 1, rot = 0) {
  const s = set.size;
  ctx.globalAlpha = a;
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

function halos(ctx, list, look, A, t) {
  const colors = look.palette.alien;
  ctx.globalCompositeOperation = 'lighter';
  for (const a of list) {
    const carrier = a.role === 'carrier';
    const r = carrier ? 62 : 44;
    ctx.globalAlpha = carrier ? 0.42 + 0.18 * Math.sin(t * 5 + a.id) : A.halo;
    ctx.drawImage(glow(colors[a.role]), a.x - r, a.y + bobOf(A, a, t) - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function wreck(ctx, w, look, t) {
  if (look.world === GLASS_WORLD) { // world 16: a cloud of glass shards that mends itself (mending-view.js)
    drawMending(ctx, w, look, t);
    return;
  }
  const hurry = WRECK_TIME - w.left; // 0 just fell .. 2 about to rise
  const pulse = 0.5 + 0.5 * Math.sin(t * (5 + hurry * 9));
  const own = extraSprites(look, 'wreck');
  const set = own ?? roleSprites(look, 'armored');
  const jx = hurry > 1.4 ? Math.sin(t * 61) * (hurry - 1.4) * 4 : 0; // it shudders before it rises
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.35 + 0.35 * pulse;
  ctx.drawImage(glow('#ff3a1a'), w.x - 40, w.y - 34, 80, 80);
  ctx.globalCompositeOperation = 'source-over';
  blit(ctx, own ? own.body[0] : cracked(set, 0, 2), set, w.x + jx, w.y, 0.9);
  ctx.globalCompositeOperation = 'lighter';
  blit(ctx, set.lights[0], set, w.x + jx, w.y, 0.3 + 0.7 * pulse);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function saucer(ctx, s, look, t) {
  const set = extraSprites(look, 'saucer') ?? roleSprites(look, 'carrier');
  const f = Math.floor(t * 6) & 1;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.5 + 0.15 * Math.sin(t * 9);
  ctx.drawImage(glow(look.palette.alien.carrier), s.x - 90, s.y - 50, 180, 100);
  ctx.globalCompositeOperation = 'source-over';
  blit(ctx, set.body[f], set, s.x, s.y); // 1 hp: it never lives to flash
  ctx.globalCompositeOperation = 'lighter';
  blit(ctx, set.lights[f], set, s.x, s.y);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

const spot = { x: 0, y: 0, rot: 0, f: 0 }; // where an alien's sprite is drawn this frame, for what rides on it (shell-view.js)
function shellSpot(world, A, a, t) {
  spot.x = a.x;
  spot.y = a.y + bobOf(A, a, t);
  spot.rot = lean(world, a);
  spot.f = frameOf(A, a, t);
  return spot;
}

export function drawAliens(ctx, world, look, t) {
  const A = art(look);
  halos(ctx, world.aliens, look, A, t);
  for (const w of world.wrecks) wreck(ctx, w, look, t);
  for (const a of world.aliens) {
    const set = roleSprites(look, a.role);
    const f = frameOf(A, a, t);
    const k = crackStage(a);
    const img = flashing(a, t) ? set.flash[f] : k ? cracked(set, f, k) : set.body[f];
    blit(ctx, img, set, a.x, a.y + bobOf(A, a, t), 1, lean(world, a));
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const a of world.aliens) {
    const set = roleSprites(look, a.role);
    blit(ctx, set.lights[frameOf(A, a, t)], set, a.x, a.y + bobOf(A, a, t), 1, lean(world, a));
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  if (world.level?.twist === 'fireworks') drawShells(ctx, world.aliens, look, t, (a) => shellSpot(world, A, a, t)); // world 14: a lit fuse on every shell
  if (world.saucer) saucer(ctx, world.saucer, look, t);
}

export function drawAlienLights(ctx, world, look, t, k) {
  const A = art(look);
  const colors = look.palette.alien;
  ctx.globalCompositeOperation = 'lighter';
  for (const a of world.aliens) {
    const y = a.y + bobOf(A, a, t);
    ctx.globalAlpha = 0.45 * k;
    ctx.drawImage(glow(colors[a.role]), a.x - 46, y - 46, 92, 92);
    const set = roleSprites(look, a.role);
    const f = frameOf(A, a, t);
    const rot = lean(world, a);
    blit(ctx, set.lights[f], set, a.x, y, k, rot);
    const stage = crackStage(a);
    if (stage) blit(ctx, crackLights(set, f, stage), set, a.x, y, k * 0.8, rot);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
