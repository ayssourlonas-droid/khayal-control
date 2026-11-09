// More flourishes (contract in flourish.js): what moves on Sunset Armada's layers, each found through the
// signs its layer left (parallax-armada-isle.js, -ships.js, -mid.js, -clouds.js). The waterfalls shimmer
// and their mist swells, with a rainbow in the spray of the great ones; the airships' propellers turn (the
// blades seen edge-on, a blur between them) and the windmills' sails go round; and the mooring balloons ride
// their cables above the cloud sea, swaying, a lantern burning in each basket; and the flags ripple. The sky's own are in
// flourish-8.js.
import { W, hash, glow, soft, lighter, normal } from './sprites.js';
import { layerX } from './parallax.js';
import { TAU } from '../core/math.js';
import { streak, rainbow, sails, balloonSprite } from './flourish-armada-sprites.js';

const signs = (v, layer, key) => (v.cache[key + layer] ??= v.layers[layer]?.signs.filter((s) => s[key]) ?? []);

// Streaks of light sliding down each fall at their own speeds, the mist at its foot swelling and sinking.
const falls = (layer) => (ctx, { v, t }, x0, top) => {
  const list = signs(v, layer, 'fall');
  if (!list.length) return;
  const s = streak();
  const bow = rainbow();
  lighter(ctx);
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    const x = x0 + f.x;
    if (x < -120 || x > W + 120) continue;
    const h = f.y1 - f.y0;
    for (let k = 0; k < 4; k++) {
      const u = (t * (0.45 + hash(i * 4 + k) * 0.3) + hash(i * 4 + k + 50)) % 1;
      ctx.globalAlpha = Math.sin(Math.PI * u) * 0.9;
      ctx.drawImage(s, x + (hash(i * 4 + k + 90) - 0.5) * f.w * (0.6 + u), top + f.y0 + u * h * 0.9, 6, 44);
    }
    const swell = 0.7 + 0.3 * Math.sin(t * 1.3 + i * 2);
    ctx.globalAlpha = 0.34 * swell;
    ctx.drawImage(soft('#fff0dc'), x - f.w * 5, top + f.y1 - f.w * 3, f.w * 10, f.w * 6);
    if (f.w > 10) { // the great ones have a rainbow in the spray, drifting a little
      ctx.globalAlpha = 0.5 + 0.2 * Math.sin(t * 0.5 + i);
      ctx.drawImage(bow, x - 75 + Math.sin(t * 0.3 + i) * 6, top + f.y1 - 76, 150, 80);
    }
  }
  normal(ctx);
};

const wave = (ph, h, k) => Math.sin(ph - k * 1.3) * h * 0.35 * (k / 4); // how far the cloth at k quarters along has risen or fallen

// Flags flying from the mastheads and the watchtower, rippling: a wave runs from the pole to the swallow-tailed
// end of each and grows as it goes.
const flags = (layer) => (ctx, { v, t }, x0, top) => {
  const list = signs(v, layer, 'flag');
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    const [x, y] = [x0 + f.x, top + f.y];
    if (x < -120 || x > W + 120) continue;
    const ph = t * 7 + i * 1.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 1; k <= 4; k++) ctx.lineTo(x + f.dir * f.len * (k / 4), y + wave(ph, f.h, k));
    ctx.lineTo(x + f.dir * f.len * 0.8, y + wave(ph, f.h, 4) + f.h * 0.45); // the swallow tail's notch
    ctx.lineTo(x + f.dir * f.len, y + wave(ph, f.h, 4) + f.h * 0.9);
    for (let k = 3; k >= 1; k--) ctx.lineTo(x + f.dir * f.len * (k / 4), y + wave(ph, f.h, k) + f.h * (1 - 0.2 * (k / 4)));
    ctx.lineTo(x, y + f.h);
    ctx.closePath();
    ctx.fillStyle = f.color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(18,10,48,0.7)';
    ctx.stroke();
  }
};

// Propellers: the blades seen edge-on from the side, each a line from the hub whose length is the cosine of
// its turn, a faint blur between them; windmill sails turning slowly against the sky.
function props(ctx, { v, t }, x0, top) {
  const mills = signs(v, 1, 'mill');
  const sp = sails();
  for (let i = 0; i < mills.length; i++) {
    const m = mills[i];
    const x = x0 + m.x;
    if (x < -120 || x > W + 120) continue;
    ctx.save();
    ctx.translate(x, top + m.y);
    ctx.rotate(t * (0.5 + hash(i + 600) * 0.3) + i * 1.3);
    ctx.drawImage(sp, -m.r, -m.r, m.r * 2, m.r * 2);
    ctx.restore();
  }
  const list = signs(v, 1, 'prop');
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const x = x0 + p.x;
    if (x < -120 || x > W + 120) continue;
    ctx.globalAlpha = 0.3;
    ctx.drawImage(soft('#ffe2b0'), x - p.r * 0.35, top + p.y - p.r * 1.1, p.r * 0.7, p.r * 2.2);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let k = 0; k < p.n; k++) {
      const a = t * 16 + (k * TAU) / p.n + i;
      ctx.moveTo(x, top + p.y);
      ctx.lineTo(x + Math.cos(a) * p.r * 0.2 * -p.dir, top + p.y + Math.sin(a) * p.r);
    }
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#c8902a';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, top + p.y, 2.8, 0, TAU);
    ctx.fillStyle = '#ffd890';
    ctx.fill();
  }
}

// The mooring balloons: each on its cable from the cloud sea, leaning with the air and bobbing, the basket's
// lantern a glow that flickers; the cable's end is a cleat sunk in the cloud.
function tether(ctx, { v, t, world }) {
  const list = signs(v, 2, 'balloon');
  const x0 = layerX(v.layers[2], world.ship?.x ?? W / 2);
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    const ax = x0 + b.x;
    if (ax < -100 || ax > W + 100) continue;
    const ay = v.layers[2].top + b.y;
    const lean = Math.sin(t * 0.55 + b.k * 1.7) * 9;
    const [bx, by] = [ax + lean, ay - b.h + Math.sin(t * 0.9 + b.k * 2.3) * 4];
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(ax + lean * 0.2, (ay + by) / 2 + 6, bx, by + b.r * 1.5);
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = 'rgba(18,10,48,0.85)';
    ctx.stroke();
    const s = b.r / 28;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(lean * 0.006);
    ctx.drawImage(balloonSprite(b.k & 1), -40 * s, -40 * s, 80 * s, 118 * s);
    ctx.restore();
    lighter(ctx);
    ctx.globalAlpha = 0.6 + 0.3 * Math.sin(t * 9 + b.k * 3);
    ctx.drawImage(glow('#ffb054'), bx - 20 * s, by + 39.5 * s, 40 * s, 40 * s);
    normal(ctx);
  }
}

// Paint the sprites these draw, so none is baked mid-fight (warm-armada.js).
export function warmMotion() {
  streak();
  rainbow();
  sails();
  balloonSprite(0);
  balloonSprite(1);
}

export const FLOURISH9 = { falls: { far: falls(0), mid: falls(1) }, flags: { far: flags(0), mid: flags(1) }, props: { mid: props }, tether: { near: tether } };
