// The renderer. createView bakes everything static for a level (sky, parallax); drawFrame draws one
// frame of world + fx, then the HUD and, in the trailer, the film look.
//   createView(canvas, level, warm?) -> view   view.look: the world's look (looks/), view.quality: the
//     auto-quality state (main feeds sampleFrame(view.quality, workMs, intervalMs) every frame, work
//     = performance.now() around its core steps + fx + drawFrame, and sets fx.density from it),
//     view.showHud: false hides the HUD (trailer, title backdrop); view.lift: px the sky and the
//     field are drawn higher (the trailer frames the ship above its letterbox bar; 0 in play)
//   drawFrame(view, world, fx, t, film?)   t: seconds, any monotonic clock (animation only)
// The canvas is sized to its CSS box; the 1920 x 1080 world is letterboxed into it, and the backing
// store never exceeds 1:1 with the world (Pi 4 fill rate). No camera: only fx shake moves the field.
import { W, H } from './sprites.js';
import { clamp } from '../core/math.js';
import { lookFor } from './looks/index.js';
import { buildSky } from './sky.js';
import { buildLayers, drawLayers } from './parallax.js';
import { drawAmbient } from './ambient.js';
import { drawFlourishes } from './flourish.js';
import { drawBunkers } from './bunkers-view.js';
import { drawPickups } from './pickups-view.js';
import { drawAliens } from './aliens/index.js';
import { warmAliens } from './aliens/bake.js';
import { drawBoss } from './bosses/index.js';
import { warmBoss } from './bosses/bake.js';
import { warmArmada } from './warm-armada.js';
import { warmCarnival } from './warm-carnival.js';
import { warmDeep } from './warm-deep.js';
import { warmGlass } from './warm-glass.js';
import { warmBreath } from './warm-breath.js';
import { warmStorm } from './warm-storm.js';
import { createHeal, stepHeal, healOf } from './heal.js';
import { buildHealLayers } from './heal-layers.js';
import { drawHealSky, healSkies } from './heal-view.js';
import { drawBreathWake, drawBreath } from './breath-view.js';
import { drawBullets } from './bullets-view.js';
import { drawLasers, drawBeam, drawShots } from './lasers-view.js';
import { drawShip } from './ship-view.js';
import { drawFx, drawPopups } from './fx-view.js';
import { drawDarkness, drawScreenFx, drawSlices } from './screen-view.js';
import { drawFilm } from './film-view.js';
import { drawHud } from './hud.js';
import { createQuality } from './quality.js';

// warm (default true) bakes the level's aliens and boss with all their damage art (and world 13's, 14's, 15's and 16's
// sprites, warm-armada.js, warm-carnival.js, warm-deep.js and warm-glass.js, world 17's, warm-breath.js, and world 18's arc bolts and dragged bullets, warm-storm.js); a poster, which draws one frame and has baked what it draws, passes false.
export function createView(canvas, level, warm = true) {
  const look = lookFor(level);
  if (warm) {
    warmAliens(look);
    warmBoss(look, level.boss);
    warmArmada(look);
    warmCarnival(look);
    warmDeep(look);
    warmGlass(look);
    warmBreath(look);
    warmStorm(look);
  }
  const heal = look.heal ? createHeal() : null; // world 17: the healing city, a smog and a clean twin of the sky and layers (heal.js)
  const skies = heal && healSkies(look, level); // the smog sky and the clean one, baked once per look (heal-view.js)
  if (heal) heal.sky = skies.clean;
  return {
    canvas, ctx: canvas.getContext('2d'), level, look,
    sky: skies ? skies.smog : buildSky(look, level), layers: heal ? buildHealLayers(look, level.seed ?? 1, heal) : buildLayers(look, level.seed ?? 1), heal,
    quality: createQuality(), cache: {}, hud: { lag: null }, showHud: true,
    lastT: null, drift: 0, fit: { w: 0, h: 0, dpr: 0, s: 1, ox: 0, oy: 0 }, lift: 0,
  };
}

// Match the backing store to the CSS box (capped at world resolution) and refit the world.
function fit(v) {
  const c = v.canvas;
  const cssW = c.clientWidth || c.width;
  const cssH = c.clientHeight || c.height;
  const dpr = globalThis.devicePixelRatio || 1;
  const f = v.fit;
  if (cssW === f.w && cssH === f.h && dpr === f.dpr) return f;
  const rawW = cssW * dpr;
  const rawH = cssH * dpr;
  const fitRaw = Math.min(rawW / W, rawH / H);
  const s = Math.min(1, fitRaw);
  c.width = Math.max(1, Math.round((rawW * s) / fitRaw));
  c.height = Math.max(1, Math.round((rawH * s) / fitRaw));
  v.fit = { w: cssW, h: cssH, dpr, s, ox: (c.width - W * s) / 2, oy: (c.height - H * s) / 2 };
  return v.fit;
}

// The bars beside the world, in the sky's top colour; nothing when the world fills the canvas.
function letterbox(v, f) {
  const { ctx, canvas: c } = v;
  if (f.ox < 1e-3 && f.oy < 1e-3) return;
  ctx.fillStyle = v.look.sky[0][1];
  ctx.fillRect(0, 0, c.width, c.height);
}

// Everything in the world, shaken by fx.shake: parallax, cover, boss, aliens, bullets, ship, fx.
function field(ctx, v, world, fx, t, env, amb) {
  const { look } = v;
  const q = v.quality.level;
  ctx.save();
  ctx.translate(fx.shakeX, fx.shakeY);
  drawLayers(ctx, v.layers, world.ship.x, t, q, (i, x0, top) => {
    if (i === 0) {
      drawFlourishes(ctx, env, 'far', x0, top);
      drawAmbient(ctx, look, 'mid', amb);
    }
    if (i === 1) drawFlourishes(ctx, env, 'mid', x0, top);
  });
  drawFlourishes(ctx, env, 'near');
  drawBreathWake(ctx, v, world, t); // world 17: the smog parts where the breath has passed (breath-view.js)
  drawBunkers(ctx, world, look);
  drawBoss(ctx, world, look, t, q); // under the aliens: minions launch from it and fly over it (R27)
  drawAliens(ctx, world, look, t);
  drawDarkness(ctx, env);
  drawPickups(ctx, world, look, t);
  drawLasers(ctx, world, look, t);
  drawBullets(ctx, world, look, t, q);
  drawBeam(ctx, world, look, t);
  drawShots(ctx, world, look, t);
  drawBreath(ctx, v, world, t); // world 17: the front of fresh air and the craft that lead it
  drawShip(ctx, world, look, t);
  drawFx(ctx, fx);
  drawAmbient(ctx, look, 'front', amb);
  drawFlourishes(ctx, env, 'front');
  drawPopups(ctx, fx);
  ctx.restore();
}

export function drawFrame(v, world, fx, t = 0, film = null) {
  const dt = v.lastT == null ? 0 : clamp(t - v.lastT, 0, 0.1);
  v.lastT = t;
  v.drift += (world.wind || 0) * dt * 0.9;
  if (v.heal) stepHeal(v.heal, world, dt);
  const f = fit(v);
  const ctx = v.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  letterbox(v, f);
  ctx.setTransform(f.s, 0, 0, f.s, f.ox, f.oy);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  const env = { v, world, fx, t, quality: v.quality.level };
  const amb = { t, drift: v.drift, wind: world.wind || 0, world, heal: healOf(v) };
  ctx.translate(0, -v.lift);
  if (v.heal) drawHealSky(ctx, v.sky, v.heal);
  else ctx.drawImage(v.sky, 0, 0);
  drawAmbient(ctx, v.look, 'sky', amb);
  drawFlourishes(ctx, env, 'sky');
  field(ctx, v, world, fx, t, env, amb);
  ctx.translate(0, v.lift);
  drawScreenFx(ctx, fx, v.look);
  drawAmbient(ctx, v.look, 'screen', amb);
  drawFlourishes(ctx, env, 'screen');
  drawSlices(ctx, v.canvas, f, fx);
  if (v.showHud) drawHud(ctx, world, v.look, v.hud, t);
  drawFilm(ctx, film, v.quality.level);
  ctx.restore();
}
