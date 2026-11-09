// The renderer. createView bakes everything static for a level (sky, parallax) and the level's
// aliens and boss with all their damage art; drawFrame draws one frame of world + fx, then the HUD.
//   createView(canvas, level) -> view   view.look: the look (looks/), view.quality: the
//     auto-quality state (main feeds sampleFrame(view.quality, workMs, intervalMs) every frame, work
//     = performance.now() around its core steps + fx + drawFrame, and sets fx.density from it),
//     view.showHud: false hides the HUD (title backdrop); view.named: the species whose name is
//     being said (voice.saying(), set by scenes.js), whose aliens and giant light up
//   drawFrame(view, world, fx, t)   t: seconds, any monotonic clock (animation only)
// The canvas is sized to its CSS box; the 1920 x 1080 world is letterboxed into it, and the backing
// store never exceeds 1:1 with the world (Pi 4 fill rate). No camera: only fx shake moves the field.
import { W, H } from './sprites.js';
import { LOOK } from './looks/index.js';
import { buildSky } from './sky.js';
import { buildLayers, drawLayers } from './parallax.js';
import { drawAmbient } from './ambient.js';
import { drawWeather } from './weather.js';
import { drawFlourishes } from './flourish.js';
import { drawPickups } from './pickups-view.js';
import { drawAliens } from './aliens/index.js';
import { warmAliens } from './aliens/bake.js';
import { drawBoss } from './bosses/index.js';
import { warmBoss } from './bosses/bake.js';
import { drawBullets } from './bullets-view.js';
import { drawLasers, drawBeam, drawShots } from './lasers-view.js';
import { drawShip } from './ship-view.js';
import { drawFx, drawPopups } from './fx-view.js';
import { drawScreenFx } from './screen-view.js';
import { drawHud } from './hud.js';
import { createQuality } from './quality.js';

export function createView(canvas, level) {
  const look = LOOK;
  warmAliens(look);
  warmBoss(look, level.boss);
  return {
    canvas, ctx: canvas.getContext('2d'), level, look,
    sky: buildSky(look), layers: buildLayers(look, level),
    quality: createQuality(), hud: { lag: null }, showHud: true, named: null, weather: { since: null },
    reduced: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    fit: { w: 0, h: 0, dpr: 0, s: 1, ox: 0, oy: 0 },
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

// Everything in the world, shaken by fx.shake: parallax, field weather (rain), boss, aliens, bullets, ship, fx.
function field(ctx, v, world, fx, t) {
  const { look } = v;
  const q = v.quality.level;
  ctx.save();
  ctx.translate(fx.shakeX, fx.shakeY);
  drawLayers(ctx, v.layers, world.ship.x, t, q);
  drawWeather(ctx, v, world, t, 'field');
  drawBoss(ctx, world, look, t, q, v.named); // under the aliens: minions launch from it and fly over it (R27)
  drawAliens(ctx, world, look, t, v.named);
  drawPickups(ctx, world, look, t);
  drawLasers(ctx, world, look, t);
  drawBullets(ctx, world, look, t, q);
  drawBeam(ctx, world, look, t);
  drawShots(ctx, world, look);
  drawShip(ctx, world, look, t);
  drawFx(ctx, fx);
  drawPopups(ctx, fx, world.level);
  ctx.restore();
}

export function drawFrame(v, world, fx, t = 0) {
  const f = fit(v);
  const ctx = v.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  letterbox(v, f);
  ctx.setTransform(f.s, 0, 0, f.s, f.ox, f.oy);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  ctx.drawImage(v.sky, 0, 0);
  drawAmbient(ctx, v.look, 'sky', t);
  drawFlourishes(ctx, v.look, t);
  drawWeather(ctx, v, world, t, 'sky');
  field(ctx, v, world, fx, t);
  drawScreenFx(ctx, fx);
  drawAmbient(ctx, v.look, 'screen', t, v.quality.level);
  if (v.showHud) drawHud(ctx, world, v.look, v.hud, t);
  ctx.restore();
}
