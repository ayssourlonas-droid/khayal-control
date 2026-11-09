// World 17's sky flourishes (contract in flourish.js), all pure functions of t and the healing h = env.v.heal.h (0 without one):
//   smokeroll (sky)    six slow banks of dark smoke rolling across above the skyline at different speeds and heights, faint, calm,
//                      fading away with the smog (1 - stage(h, 'wisps')) so a healed sky is clear
//   sunbeams  (sky)    five wide soft shafts of golden-white light fanning down from the sun (SUN, sky-bodies-9.js), additive and
//                      faint, swaying and breathing; they break through from h 0.45 ('beams') and are full by 0.9
//   skybirds  (sky)    two flocks in loose V's and four stragglers crossing the clean sky, wings beating in three poses, small and dark;
//                      more and more of them as the city comes back ('life', h 0.6 to 0.95)
//   cigarettes (far)   the giant cigarettes (flourish-smog-sky-cig.js)
// Sprites: flourish-smog-sky-sprites.js and flourish-smog-sky-cig-sprites.js, baked by warmSkyFx(), which the view calls
// (warm-breath.js) so no frame of the fight pays for one. Nothing is allocated in a frame.
import { W, hash, wrap } from './sprites.js';
import { stage, healOf } from './heal.js';
import { SUN } from './sky-bodies-9-kit.js';
import { BANK, BEAM, BIRD, bankSprite, beamSprite, birdSprite, warmSkyFxSprites } from './flourish-smog-sky-sprites.js';
import { FLOURISH_CIGS } from './flourish-smog-sky-cig.js';
import { warmCigs } from './flourish-smog-sky-cig-sprites.js';

export const ROLL = { n: 6, alpha: [0.1, 0.22], speed: [6, 17], rows: [140, 540] }; // banks; the least and most alpha; px a second; the y of the rows
export const BEAMS = { n: 5, alpha: 0.075, fan: [1.7, 3.0], swing: 0.045 }; // shafts; the peak alpha of each; the fan's angles from +x, clockwise (rad)
export const BIRDS = { flocks: [{ n: 7, y: 172, speed: 46, dir: 1, gap: 40 }, { n: 5, y: 470, speed: 38, dir: -1, gap: 46 }], stragglers: 4, alpha: 0.72, beat: 0.55 };

function smokeroll(ctx, env) {
  const k = 1 - stage(healOf(env.v), 'wisps');
  if (k < 0.01) return;
  const t = env.t;
  const n = env.quality < 1 ? 3 : ROLL.n;
  for (let i = 0; i < n; i++) {
    const sc = 0.8 + 0.6 * hash(i * 5 + 700);
    const [w, h] = [BANK.w * sc, BANK.h * sc];
    const speed = ROLL.speed[0] + (ROLL.speed[1] - ROLL.speed[0]) * hash(i * 5 + 701);
    const x = wrap(hash(i * 5 + 702) * (W + w) + t * speed, -w, W + w);
    const y = ROLL.rows[0] + ((i + 0.5) / ROLL.n) * (ROLL.rows[1] - ROLL.rows[0]) + Math.sin(t * 0.07 + i * 2.1) * 12;
    ctx.globalAlpha = k * (ROLL.alpha[0] + (ROLL.alpha[1] - ROLL.alpha[0]) * hash(i * 5 + 703)) * (0.85 + 0.15 * Math.sin(t * 0.11 + i));
    ctx.drawImage(bankSprite(i % BANK.n), x - w, y - h / 2, w, h);
  }
  ctx.globalAlpha = 1;
}

function sunbeams(ctx, env) {
  const k = stage(healOf(env.v), 'beams');
  if (k < 0.01) return;
  const t = env.t;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < BEAMS.n; i += env.quality < 1 ? 2 : 1) {
    const a = BEAMS.fan[0] + ((i + 0.5) / BEAMS.n) * (BEAMS.fan[1] - BEAMS.fan[0]) + Math.sin(t * (0.1 + 0.03 * i) + i * 2.3) * BEAMS.swing;
    const breath = 0.55 + 0.45 * Math.sin(t * (0.17 + 0.05 * hash(i + 720)) + hash(i + 721) * 6.28);
    ctx.save();
    ctx.translate(SUN.x, SUN.y);
    ctx.rotate(a - Math.PI / 2);
    ctx.globalAlpha = k * BEAMS.alpha * breath;
    const wd = BEAM.w * (0.8 + 0.5 * hash(i + 722));
    ctx.drawImage(beamSprite(), -wd / 2, 0, wd, BEAM.h);
    ctx.restore();
  }
  ctx.restore();
}

// One bird at (x, y), the wing pose by its own beat; facing right (dir 1) or left.
function bird(ctx, x, y, dir, t, ph) {
  const pose = [0, 1, 2, 1][Math.floor(((t / BIRDS.beat + ph) % 1) * 4)];
  if (dir > 0) {
    ctx.drawImage(birdSprite(pose), x - BIRD.w / 2, y - BIRD.h / 2);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-1, 1);
  ctx.drawImage(birdSprite(pose), -BIRD.w / 2, -BIRD.h / 2);
  ctx.restore();
}

// Flock fi: a loose V, each bird behind the leader and to one side, a little out of line, wings on beats of their own.
function flock(ctx, f, fi, shown, t) {
  const lead = f.dir > 0 ? -80 + wrap(t * f.speed + fi * 640, 0, W + 400) : W + 80 - wrap(t * f.speed + fi * 640, 0, W + 400);
  for (let j = 0; j < shown; j++) {
    const row = Math.ceil(j / 2);
    const x = lead - f.dir * row * f.gap * 0.8 + (hash(j + fi * 9 + 730) - 0.5) * 10;
    const y = f.y + (j ? (j % 2 ? 1 : -1) * row * 16 : 0) + Math.sin(t * 0.8 + j * 1.3) * 5;
    if (x > -40 && x < W + 40) bird(ctx, x, y, f.dir, t, hash(j + fi * 9 + 731));
  }
}

function skybirds(ctx, env) {
  const life = stage(healOf(env.v), 'life');
  if (life < 0.01) return;
  const t = env.t;
  const share = env.quality < 1 ? 0.5 : 1;
  ctx.save();
  ctx.globalAlpha = BIRDS.alpha * Math.min(1, life * 1.4);
  for (let fi = 0; fi < BIRDS.flocks.length; fi++) flock(ctx, BIRDS.flocks[fi], fi, Math.ceil(BIRDS.flocks[fi].n * life * share), t);
  for (let s = 0; s < Math.ceil(BIRDS.stragglers * life * share); s++) {
    const dir = s % 2 ? -1 : 1;
    const speed = 30 + hash(s + 740) * 26;
    const x = dir > 0 ? wrap(t * speed + hash(s + 741) * W, -60, W + 60) : W - wrap(t * speed + hash(s + 741) * W, -60, W + 60);
    bird(ctx, x, 250 + hash(s + 742) * 220 + Math.sin(t * 0.6 + s * 2) * 14, dir, t, hash(s + 743));
  }
  ctx.restore();
}

export const FLOURISH_SKY = { smokeroll: { sky: smokeroll }, sunbeams: { sky: sunbeams }, skybirds: { sky: skybirds }, ...FLOURISH_CIGS };

// Bakes every sprite these flourishes draw, so no frame of the fight pays for one (warm-breath.js calls it). The sprites are the same
// for any level, so it takes nothing.
export function warmSkyFx() {
  warmSkyFxSprites();
  warmCigs();
}
