// Sprites the Grand Carousel's live extras draw (World 14, Ember Carnival; carousel-fx.js), each painted once on
// first use and kept: the canopy's turning frames, cut round whatever stands over it, the pennants in eight
// waves, and the small dark horse that rides the far poles. warm() paints them all ahead of the fight.
import { cached, glow, soft, star } from '../sprites.js';
import { bossDef } from '../../core/bosses-data.js';
import { lin, rgba, shade, path } from './kit.js';
import { FRAMES, SIZE, PX, PY, paintFrame } from './carousel-canopy.js';
import { crown } from './carousel-crown.js';
import { horse } from './carousel-pole.js';
import { horseBody } from './carousel-horse.js';
import { GILT, STRIPE, STRIPE_D, CREAM, INK, CYAN, BULB, TAU } from './carousel-kit.js';

const once = (make) => { // asked for every frame: no key built, no painter made once it exists
  let sprite = null;
  return () => (sprite ??= make());
};

// A context that takes any call and does nothing: the lights layer of a painter whose lights we do not want.
const NONE = new Proxy(() => NONE, { get: (f, k) => (k === Symbol.toPrimitive ? () => 0 : NONE), apply: () => NONE, set: () => true });

// Everything that stands over the canopy, painted solid: the crown and both horses. The live canopy has this
// cut out of it, so it turns under them (they are drawn before it) instead of over them.
const cutout = once(() => cached('carCut', SIZE[0], SIZE[1], (g) => {
  g.translate(PX, PY);
  for (const p of bossDef('carousel').parts) {
    if (p.id !== 'crown' && !p.id.startsWith('horse')) continue;
    g.save();
    g.translate(p.dx, p.dy);
    if (p.dx > 0) g.scale(-1, 1);
    (p.id === 'crown' ? crown : horse)(g, NONE, p);
    g.restore();
  }
}));

const frames = [];
// Frame i of the turning canopy, with the parts cut out of it.
export const liveCanopy = (i) => (frames[i % FRAMES] ??= cached('carLive' + (i % FRAMES), SIZE[0], SIZE[1], (g, w, h) => {
  paintFrame(i)(g, w, h);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(cutout(), 0, 0);
  g.globalCompositeOperation = 'source-over';
}));

// A swallow-tailed pennant 44 x 22 flying right from its staff at the left, in wave n of eight: magenta with a
// cream stripe and a gilt edge.
export const PENNANT = [44, 22];
const waves = [];
export const pennant = (n) => (waves[n & 7] ??= cached('carPennant' + (n & 7), 44, 22, (g) => {
  const ph = ((n & 7) * TAU) / 8;
  const mid = (x) => 11 + (0.3 + x * 0.07) * Math.sin(ph - x * 0.3);
  const half = (x) => 6.4 - x * 0.04;
  const top = [];
  const bot = [];
  for (let x = 2; x <= 38; x += 4) {
    top.push([x, mid(x) - half(x)]);
    bot.unshift([x, mid(x) + half(x)]);
  }
  path(g, [...top, [41, mid(41) - half(41) + 1], [33, mid(33)], [41, mid(41) + half(41) - 1], ...bot]);
  g.fillStyle = lin(g, 0, 0, 0, 22, [[0, shade(STRIPE, 0.15)], [1, STRIPE_D]]);
  g.fill();
  g.lineJoin = 'round';
  g.lineWidth = 1.8;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 0.8;
  g.strokeStyle = rgba(GILT, 0.9);
  g.stroke();
  g.beginPath();
  for (let x = 4; x <= 31; x += 3) g[x === 4 ? 'moveTo' : 'lineTo'](x, mid(x));
  g.lineWidth = 2;
  g.strokeStyle = CREAM;
  g.stroke();
}));

// The back rider: the carved horse again at half size, dim and plain, 80 x 70 with its middle at (40, 38).
export const FAR = [80, 70];
export const farHorse = once(() => cached('carFarHorse', 80, 70, (g) => {
  g.translate(40, 38);
  g.scale(0.5, 0.5);
  horseBody(g, null, '#e8b23a', true);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = rgba('#240a52', 0.3);
  g.fillRect(0, 0, 80, 70);
}));

// Everything the live extras draw, painted now (warmBoss calls this): the sprites above and the glows, stars and
// soft discs they take from the shared caches.
export function warm() {
  for (let i = 0; i < FRAMES; i++) liveCanopy(i);
  for (let n = 0; n < 8; n++) pennant(n);
  farHorse();
  for (const c of [CYAN, BULB, '#ff9ad0', '#e8ffff', '#ffb44a', '#4be08a', '#ffd27a', '#c8a8ff']) glow(c);
  for (const c of ['#fff0c0', '#ffffff', '#e8ffff']) star(c);
  for (const c of ['#fff1e4', '#ffd8f0']) soft(c);
}
