// The white moon, the weather of a level that has it (levels.js weatherOf, ui/weather.js): the blood
// moon the sky baked (sky-bodies.js) swells, about a fifth larger, and turns white as the weather fades
// in, the ink clouds still drawn across it. Drawn in the sky phase, before the parallax layers, so the
// mountains and the landmark stand in front of it.
// The disc is one sprite baked once, pixel art like the sky: opaque (pixelate leaves no soft edge, so
// the halo is not in it) and square, its side a whole number of PIXEL blocks with the moon's centre in
// the middle, so once settled it is drawn at scale 1 with every block on the sky's grid. The halo is
// its own sprite, the glow baked once at full size and drawn live under the disc at scale 1.
//   drawMoon(ctx, k, t, quality, reduced)   k 0..1 how far it has faded in; the disc is drawn at alpha
//     k and grows from the red moon's size to its own as k rises; under reduced motion it only
//     brightens, and the quality changes nothing (the voice has named the moon)
import { PIXEL, cached, pixelate, glow, addGlow } from './sprites.js';
import { moon } from './sky-paint.js';
import { MOON, clouds } from './sky-bodies.js';
import { TAU, lerp } from '../core/math.js';

const R = Math.round(MOON.r * 1.22); // the white moon's radius
const SIDE = Math.ceil((2 * R) / (4 * PIXEL)) * 4 * PIXEL; // 512: its top left lands on multiples of 8
const FROM = MOON.r / R; // the scale that makes it the red moon's size
const HALO = { r: 620, a: 0.7 };

// The opaque white disc, lit from the upper left like the red one, the clouds clipped to it.
function paintDisc(g) {
  const c = SIDE / 2;
  moon(g, c, c, R, '#ffffff', '#aebbd6', '#8798bd', 29);
  g.save();
  g.beginPath();
  g.arc(c, c, R, 0, TAU);
  g.clip();
  g.translate(c - MOON.x, c - MOON.y);
  clouds(g);
  g.restore();
  pixelate(g.canvas);
}

// The halo at full strength: the glow scaled to its radius, centred in a canvas of its own.
function paintHalo(g) {
  addGlow(g, glow('#ffffff'), HALO.r, HALO.r, HALO.r, HALO.a);
}

export function drawMoon(ctx, k, _t, _quality, reduced) {
  if (k <= 0) return;
  const scale = reduced ? 1 : lerp(FROM, 1, k);
  const size = SIDE * scale;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = k;
  ctx.drawImage(cached('moonHalo', 2 * HALO.r, 2 * HALO.r, paintHalo), MOON.x - HALO.r, MOON.y - HALO.r);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalAlpha = k;
  if (scale < 1) ctx.imageSmoothingEnabled = false; // a scaled pixel-art sprite keeps its hard blocks
  ctx.drawImage(cached('moon', SIDE, SIDE, paintDisc), MOON.x - size / 2, MOON.y - size / 2, size, size);
  ctx.restore();
}
