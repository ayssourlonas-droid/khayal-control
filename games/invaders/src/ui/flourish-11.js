// More flourishes (contract in flourish.js): what moves on Ember Carnival's layers, each found through the signs
// its layer left (parallax-carnival-coaster.js, -wheel.js, -booths.js). A little train of three cars runs the
// coaster's circuit, up the lift hill, round the loop upside down; the Ferris wheel turns with its gondolas
// hanging upright and swaying and a chase of bulbs running round the rim; strings of bulbs sway between the
// lamp posts, colours chasing along them; and party balloons ride on their strings from the booths. The sky's
// shows are in flourish-10.js; the sprites in flourish-carnival-rides.js.
import { W, glow, lighter, normal } from './sprites.js';
import { layerX } from './parallax.js';
import { TAU } from '../core/math.js';
import { PARTY } from './parallax-carnival-kit.js';
import { bulbSprite } from './flourish-carnival-sprites.js';
import { wheelSprite, WHEEL_BOX, cabin, CABIN, car, CAR, cluster, CLUSTER, warmRides } from './flourish-carnival-rides.js';

const signs = (v, layer, key) => (v.cache[key + layer] ??= v.layers[layer]?.signs.filter((s) => s[key]) ?? []);
const [SPEED, GAP] = [260, 34]; // coaster: px a second along the track, px between cars

// The cumulative length along a sign's path, kept with the sign.
function lengths(s) {
  if (!s.cum) {
    s.cum = [0];
    for (let i = 1; i < s.pts.length; i++) s.cum.push(s.cum[i - 1] + Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]));
  }
  return s.cum;
}

// The coaster's train: a lap takes the track's length at SPEED and a pause at the station; each car is drawn at its
// own distance along the track, turned to face the way it runs, fading in and out at the two ends.
function coaster(ctx, { v, t }, x0, top) {
  const s = signs(v, 0, 'coaster')[0];
  if (!s) return;
  const cum = lengths(s);
  const d0 = (t * SPEED) % (s.len + 400);
  for (let j = 0; j < 3; j++) {
    const d = d0 - j * GAP;
    if (d < 0 || d > s.len) continue;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < d) i++;
    const [p, q] = [s.pts[i - 1], s.pts[i]];
    const k = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    ctx.save();
    ctx.translate(x0 + p[0] + (q[0] - p[0]) * k, top + p[1] + (q[1] - p[1]) * k - 3);
    ctx.rotate(Math.atan2(q[1] - p[1], q[0] - p[0]));
    ctx.globalAlpha = Math.min(1, d / 50, (s.len - d) / 50);
    ctx.drawImage(car(PARTY[j ? 0 : 1]), -CAR.w / 2, -CAR.h + 1);
    ctx.restore();
  }
}

// The wheel: the rim and spokes turning slowly, a gondola at each pin hanging upright and swaying, and lights
// chasing round the rim (a bright run of bulbs going round, with the spokes' bulbs breathing after it).
function wheel(ctx, { v, t, quality }, x0, top) {
  for (const s of signs(v, 1, 'wheel')) {
    const [x, y] = [x0 + s.x, top + s.y];
    if (x < -260 || x > W + 260) continue;
    const rot = t * 0.11;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(wheelSprite(), -WHEEL_BOX / 2, -WHEEL_BOX / 2);
    ctx.restore();
    for (let i = 0; i < s.n; i++) {
      const a = rot + (i * TAU) / s.n;
      ctx.save();
      ctx.translate(x + Math.cos(a) * s.r, y + Math.sin(a) * s.r);
      ctx.rotate(Math.sin(t * 1.3 + i * 0.9) * 0.07);
      ctx.drawImage(cabin(PARTY[i % PARTY.length]), -CABIN.px, -CABIN.py);
      ctx.restore();
    }
    lighter(ctx);
    for (let k = 0; k < 32; k += quality < 1 ? 2 : 1) {
      const a = rot + (k * TAU) / 32;
      ctx.globalAlpha = 0.3 + 0.7 * Math.max(0, Math.sin(t * 7 - k * 0.55)) ** 2;
      ctx.drawImage(bulbSprite(PARTY[k % PARTY.length]), x + Math.cos(a) * (s.r + 5) - 12, y + Math.sin(a) * (s.r + 5) - 12, 24, 24);
    }
    for (let k = 0; k < s.n; k += quality < 1 ? 2 : 1) {
      const a = rot + (k * TAU) / s.n;
      ctx.globalAlpha = 0.25 + 0.5 * Math.max(0, Math.sin(t * 3 - k * 0.8));
      ctx.drawImage(bulbSprite('#ffe9a0'), x + Math.cos(a) * s.r * 0.55 - 7, y + Math.sin(a) * s.r * 0.55 - 7, 14, 14);
    }
    ctx.globalAlpha = 0.5 + 0.25 * Math.sin(t * 2);
    ctx.drawImage(glow('#ffc86a'), x - 34, y - 34, 68, 68);
    normal(ctx);
  }
}

// Strings of bulbs between the lamp posts, each a dark cord swaying a little, a bulb every few px, the colours
// running along it in waves.
function strings(ctx, { v, t, world, quality }) {
  const list = signs(v, 2, 'string');
  const [layer, x0] = [v.layers[2], layerX(v.layers[2], world.ship?.x ?? W / 2)];
  const bulbs = [];
  ctx.save();
  ctx.strokeStyle = 'rgba(10,5,36,0.9)';
  ctx.lineWidth = 1.4;
  for (const s of list) {
    const [ax, bx] = [x0 + s.x0, x0 + s.x1];
    if (bx < -80 || ax > W + 80) continue;
    const [ay, by] = [layer.top + s.y0, layer.top + s.y1];
    const sag = s.sag + Math.sin(t * 0.8 + s.k * 1.3) * 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag * 2, bx, by);
    ctx.stroke();
    for (let i = 0; i < s.n; i += quality < 1 ? 2 : 1) {
      const u = (i + 0.5) / s.n;
      bulbs.push([ax + (bx - ax) * u, ay + (by - ay) * u + sag * 4 * u * (1 - u), PARTY[(i + s.k) % PARTY.length], 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 5 - i * 0.9 + s.k))]);
    }
  }
  ctx.restore();
  lighter(ctx);
  for (const [x, y, color, a] of bulbs) {
    ctx.globalAlpha = a;
    ctx.drawImage(bulbSprite(color), x - 8, y - 5, 16, 16);
  }
  normal(ctx);
}

// Party balloons tied to the booths' awnings, each cluster on its string leaning with the air and bobbing.
function balloons(ctx, { v, t, world }) {
  const list = signs(v, 2, 'balloon');
  const [layer, x0] = [v.layers[2], layerX(v.layers[2], world.ship?.x ?? W / 2)];
  ctx.save();
  ctx.strokeStyle = 'rgba(10,5,36,0.8)';
  ctx.lineWidth = 1;
  for (const b of list) {
    const ax = x0 + b.x;
    if (ax < -120 || ax > W + 120) continue;
    const ay = layer.top + b.y;
    const lean = Math.sin(t * 0.55 + b.k * 1.7) * 10;
    const [hx, hy] = [ax + lean, ay - b.h * 0.55 + Math.sin(t * 0.9 + b.k * 2.3) * 4];
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(ax + lean * 0.2, (ay + hy) / 2, hx, hy);
    ctx.stroke();
    const s = b.r / 22;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(lean * 0.006);
    ctx.scale(s, s);
    ctx.drawImage(cluster(b.k % PARTY.length), -CLUSTER.w / 2, -CLUSTER.h + 2);
    ctx.restore();
  }
  ctx.restore();
}

// Paint the sprites these draw, so none is baked mid-fight (warm-carnival.js).
export const warmMotion = warmRides;

export const FLOURISH11 = { coaster: { far: coaster }, wheel: { mid: wheel }, strings: { near: strings }, balloons: { near: balloons } };
