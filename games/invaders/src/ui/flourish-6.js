// More flourishes (contract in flourish.js): Starlit Archive's sky. The galaxy's core breathing, constellations that draw themselves in
// gold from star to star and fade again, a slow comet with a dust tail and a teal ion one, and a gust of
// loose pages sweeping across the frame. The cranes, the orrery and what moves on the gallery are in
// flourish-7.js.
import { W, hash, glow, star, lighter, normal } from './sprites.js';
import { CONSTELLATIONS, GALAXY } from './sky-bodies-4.js';
import { pageSprite } from './ambient-4.js';
import { clamp } from '../core/math.js';

// The galaxy's heart breathing over the baked one: a warm glow swelling and sinking, and a long glint on
// the core that sways a little with the tilt of the disc.
function galaxy(ctx, { t }) {
  lighter(ctx);
  ctx.globalAlpha = 0.16 + 0.1 * Math.sin(t * 0.7);
  ctx.drawImage(glow('#ffe6b0'), GALAXY.x - 100, GALAXY.y - 64, 200, 128);
  ctx.save();
  ctx.translate(GALAXY.x, GALAXY.y);
  ctx.rotate(GALAXY.tilt + Math.sin(t * 0.23) * 0.08);
  ctx.globalAlpha = 0.4 + 0.2 * Math.sin(t * 1.1 + 1);
  ctx.drawImage(star('#fff4d0'), -70, -70, 140, 140);
  ctx.restore();
  normal(ctx);
}

const CYCLE = 26; // s one constellation takes: a wait, the drawing, a hold, the fade

// Each constellation on a time of its own: gilt lines running from star to star, a bright head at the end
// of the one being drawn, the stars flaring as the last line closes, and the lot fading away. Plain loops
// over the data: nothing is allocated per frame.
function constellation(ctx, { t }) {
  lighter(ctx);
  ctx.lineCap = 'round';
  for (let ci = 0; ci < CONSTELLATIONS.length; ci++) {
    const { stars, links } = CONSTELLATIONS[ci];
    const lt = (t + ci * 7.3) % CYCLE;
    const p = clamp((lt - 3) / 9, 0, 1);
    const fade = lt < 19 ? 1 : Math.max(0, 1 - (lt - 19) / 5);
    const n = links.length;
    for (let i = 0; i < stars.length; i++) { // the stars themselves, glinting all the time, burning once joined
      ctx.globalAlpha = 0.16 + 0.1 * Math.sin(t * 1.3 + i * 2.1) + (p >= 1 ? 0.4 * fade : 0);
      ctx.drawImage(glow('#ffd98a'), stars[i][0] - 20, stars[i][1] - 20, 40, 40);
    }
    if (p <= 0 || fade <= 0) continue;
    ctx.beginPath();
    for (let j = 0; j < n; j++) {
      const u = clamp(p * n - j, 0, 1);
      if (u <= 0) continue;
      const [a, b] = [stars[links[j][0]], stars[links[j][1]]];
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u);
    }
    ctx.strokeStyle = '#ffd98a';
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.1 * fade;
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.62 * fade;
    ctx.stroke();
    if (p < 1) { // the pen: the head of the line being drawn
      const j = Math.min(n - 1, Math.floor(p * n));
      const u = p * n - j;
      const [a, b] = [stars[links[j][0]], stars[links[j][1]]];
      ctx.globalAlpha = fade;
      ctx.drawImage(glow('#fff4d0'), a[0] + (b[0] - a[0]) * u - 13, a[1] + (b[1] - a[1]) * u - 13, 26, 26);
    }
  }
  ctx.lineCap = 'butt'; // as found: the HUD's power ring strokes after the sky
  normal(ctx);
}

const COMET = 61; // s between one chance of a comet and the next
const DUR = 11; // s one takes to cross
const spot = [0, 0]; // scratch for the comet's path: where it is, with no allocation

// A comet crossing slowly, high: a white nucleus in a gold coma, a curved dust tail of glows laid back
// along its path, and a long straight teal one pointing away from where it is going.
function comet(ctx, { t }) {
  const slot = Math.floor(t / COMET);
  const lt = t - slot * COMET - 5 - hash(slot * 7) * 35;
  if (lt < 0 || lt > DUR || hash(slot * 7 + 1) > 0.6) return;
  const dir = hash(slot * 7 + 2) < 0.5 ? 1 : -1;
  const y0 = 140 + hash(slot * 7 + 3) * 150;
  const at = (u) => {
    spot[0] = dir > 0 ? -160 + u * (W + 320) : W + 160 - u * (W + 320);
    spot[1] = y0 + 70 * u + 28 * Math.sin(u * 4);
    return spot;
  };
  const u = lt / DUR;
  const env = Math.sin(Math.PI * u) ** 0.6;
  const [hx, hy] = at(u);
  lighter(ctx);
  for (let k = 34; k >= 0; k--) { // the dust, curving up as it trails
    const [x, y] = at(u - k * 0.009);
    const s = 50 - k * 1.2;
    ctx.globalAlpha = env * (1 - k / 35) ** 1.3 * 0.7;
    ctx.drawImage(glow(k % 3 ? '#ffc860' : '#ffe8b0'), x - s, y - k * k * 0.1 - s, s * 2, s * 2);
  }
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(Math.atan2(70, dir * (W + 320)) + Math.PI); // the tail lies back along the way it came
  ctx.globalAlpha = env * 0.7;
  ctx.drawImage(glow('#4af0d8'), 0, -11, 760, 22);
  ctx.globalAlpha = env * 0.8;
  ctx.drawImage(glow('#d8fff8'), 0, -3, 420, 6);
  ctx.restore();
  ctx.globalAlpha = env * 0.9;
  ctx.drawImage(glow('#ffc860'), hx - 80, hy - 80, 160, 160);
  ctx.globalAlpha = env;
  ctx.drawImage(glow('#ffffff'), hx - 26, hy - 26, 52, 52);
  normal(ctx);
}

const GUST = 53; // s between one chance of a gust and the next
const LEN = 5; // s one takes to cross
const PAGES = 28;

// A gust: a stream of loose pages swept across the whole frame on a sine of wind, each turning over and
// over, the front of them quick and the stragglers slow. Never solid enough to hide a bullet.
function gust(ctx, { t, quality }) {
  const slot = Math.floor(t / GUST);
  const lt = t - slot * GUST - 4 - hash(slot * 3) * 22;
  if (lt < 0 || lt > LEN + 2 || hash(slot * 3 + 1) > 0.75) return;
  const dir = hash(slot * 3 + 2) < 0.5 ? 1 : -1;
  const lane = 150 + hash(slot * 3 + 4) * 450;
  for (let i = 0, n = quality < 1 ? PAGES / 2 : PAGES; i < n; i++) {
    const age = lt - hash(i + 200) * 1.6;
    if (age < 0 || age > LEN) continue;
    const u = age / LEN;
    const x = dir > 0 ? -60 + u * (W + 120) : W + 60 - u * (W + 120);
    const y = lane + (hash(i + 201) - 0.5) * 300 + Math.sin(u * 7 + i) * (60 + 70 * hash(i + 202)) + u * 120;
    const flip = Math.cos(age * (5 + hash(i + 203) * 5) + i);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(age * (1.5 + hash(i + 204) * 2) * dir + i);
    ctx.scale((0.55 + hash(i + 205) * 0.4) * flip, 0.55 + hash(i + 205) * 0.4);
    ctx.globalAlpha = Math.sin(Math.PI * u) ** 0.5 * (flip > 0 ? 0.55 : 0.35); // pale enough that a bullet under one still reads
    ctx.drawImage(pageSprite('#efe0b4'), -16, -20);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

export const FLOURISH6 = { galaxy: { sky: galaxy }, constellation: { sky: constellation }, comet: { sky: comet }, gust: { front: gust } };
