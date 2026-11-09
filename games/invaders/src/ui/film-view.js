// The trailer's film look, drawn from the film state (src/fx/film.js): colour grade toward the
// world's tint, vignette, grain (cached noise tiles, one per film frame) and letterbox bars.
// quality: the view's auto-quality level; at 0.5 the grain is skipped (R46).
import { W, H, cached, hash, rad } from './sprites.js';

const BAR = 138; // px per bar at full letterbox: 1920 x 804 inside, about 2.39 : 1
const TILES = 4;
const TILE = 256;

const vignette = () => cached('vignette', W, H, (g) => {
  g.fillStyle = rad(g, W / 2, H / 2, H * 0.35, H * 0.95, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.95)']]);
  g.fillRect(0, 0, W, H);
});

const grainTile = (i) => cached('grain' + i, TILE, TILE, (g) => {
  const img = g.createImageData(TILE, TILE);
  for (let p = 0; p < TILE * TILE; p++) {
    const v = hash(p * 7 + i * 104729) * 255;
    img.data[p * 4] = v;
    img.data[p * 4 + 1] = v;
    img.data[p * 4 + 2] = v;
    img.data[p * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
});

const patterns = new WeakMap(); // ctx -> [pattern per grain tile], made on first use
function grainPattern(ctx, i) {
  let list = patterns.get(ctx);
  if (!list) patterns.set(ctx, (list = []));
  return (list[i] ??= ctx.createPattern(grainTile(i), 'repeat'));
}

export function drawFilm(ctx, film, quality = 1) {
  if (!film || film.k <= 0) return;
  if (film.grade > 0) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = film.grade;
    ctx.fillStyle = film.tint;
    ctx.fillRect(0, 0, W, H);
  }
  if (film.grain > 0 && quality >= 1) {
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = film.grain;
    ctx.fillStyle = grainPattern(ctx, (film.seed + film.frame) % TILES);
    const ox = hash(film.frame) * TILE;
    ctx.translate(-ox, 0);
    ctx.fillRect(ox, 0, W, H);
    ctx.translate(ox, 0);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = film.vignette;
  ctx.drawImage(vignette(), 0, 0);
  ctx.globalAlpha = 1;
  const bar = BAR * film.letterbox;
  if (bar > 0.5) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, bar);
    ctx.fillRect(0, H - bar, W, bar);
  }
}
