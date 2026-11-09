// The Squall Ray's live extras (World 18, Anvil Sky; ray.js runs them): the storm inside it moving. In boss coordinates, additive, cached sprites only
// (ray-fx-bolts.js and the shared glows), nothing allocated per frame. Everything is stateless: what flickers when comes from a hash of the clock.
//   coils    the arcs that leap from each coil's toroid to its prong and from the prong to the point of the wing tip above it, flickering at about 15 Hz,
//            more often the later the phase, with a glow on the toroid that swells; a destroyed coil throws none, only a few sparks off its broken ring
//   heart    the storm heart beats (two quick beats and a rest): a violet and a cyan glow, and two rings that swell out of the orb and fade, harder in the later
//            phases; a ring and a glow flash as a phase begins
//   storm    bolts that run through the cloud of the wings and the body, rare at first, in the hover phase often, in the orbit phase crawling out from the
//            body in waves, each lighting the cloud round it with a soft pale bloom
//   maw      the fire in the mouth (violet and cyan), brighter and unsteadier as the ray fires more
//   wisps    a few pale rags of cloud drifting along the wings' trailing edges
// The phase's strength `lv` (0 sway, 1 hover, 2 orbit) rises smoothly over the first second of a phase. Nothing is drawn above y -158.
import { glow, star, hash, cached, byColor } from '../sprites.js';
import { alive } from './parts.js';
import { clamp, smooth } from '../../core/math.js';
import { PAL, PART, TOP, TAU, rgba } from './ray-kit.js';
import { ORB } from './ray-heart.js';
import { TRAIL, edgeY } from './ray-shape.js';
import { VARIANTS, STORM_PATHS, tipArc, coilArc, storm, warmBolts } from './ray-fx-bolts.js';

// A glow disc at (x, y), its radius held under the HUD's line.
function disc(ctx, color, x, y, r, a) {
  const rr = Math.min(r, y - TOP);
  if (rr <= 1) return;
  ctx.globalAlpha = a;
  ctx.drawImage(glow(color), x - rr, y - rr, rr * 2, rr * 2);
}

function spark(ctx, color, x, y, r, a) {
  const rr = Math.min(r, y - TOP);
  if (rr <= 1) return;
  ctx.globalAlpha = a;
  ctx.drawImage(star(color), x - rr, y - rr, rr * 2, rr * 2);
}

// A ring of light (a thin line with a faint halo), baked once per colour, drawn at any radius.
const ringSprite = byColor((color) => cached('rayring' + color, 128, 128, (g) => {
  for (const [w, a] of [[9, 0.2], [3, 0.9]]) {
    g.lineWidth = w;
    g.strokeStyle = rgba(color, a);
    g.beginPath();
    g.arc(64, 64, 56, 0, TAU);
    g.stroke();
  }
}));

function ring(ctx, color, x, y, r, a) {
  const rr = Math.min(r, y - TOP);
  if (rr <= 1) return;
  ctx.globalAlpha = a;
  ctx.drawImage(ringSprite(color), x - rr * 1.14, y - rr * 1.14, rr * 2.28, rr * 2.28);
}

// The arcs of one coil (side -1 left, 1 right), drawn through a mirror for the right.
function coil(ctx, b, t, k, lv, s) {
  const id = s < 0 ? 'coilL' : 'coilR';
  const slot = Math.floor(t * 15 + (s > 0 ? 7 : 0));
  const [h1, h2, h3] = [hash(slot * 31 + 1), hash(slot * 31 + 2), hash(slot * 31 + 3)];
  const p = PART[id];
  if (!alive(b, id)) { // a few sparks off the broken ring
    if (h1 < 0.3) spark(ctx, '#fff6c0', p.x + s * (h2 * 40 - 20), p.y + 22 + 8 * h3, 7 + 5 * h3, k * (0.5 + 0.5 * h2));
    return;
  }
  ctx.save();
  ctx.scale(-s, 1);
  if (h1 < 0.5 + 0.22 * lv) {
    const m = tipArc(Math.floor(h2 * VARIANTS));
    ctx.globalAlpha = k * (0.6 + 0.4 * h3);
    ctx.drawImage(m.img, m.x, m.y);
  }
  if (h2 < 0.45 + 0.25 * lv) {
    const m = coilArc(Math.floor(h3 * VARIANTS));
    ctx.globalAlpha = k * (0.55 + 0.45 * h1);
    ctx.drawImage(m.img, m.x, m.y);
  }
  ctx.restore();
  const swell = 0.5 + 0.5 * Math.sin(t * 6 + s);
  disc(ctx, PAL.violet, p.x, p.y + 24, 44 + 14 * lv, k * (0.12 + 0.08 * lv) * (0.6 + 0.4 * swell));
  disc(ctx, PAL.cyan, p.x, p.y + 24, 24 + 8 * lv, k * (0.1 + 0.07 * lv) * (0.6 + 0.4 * swell));
}

// The storm heart: two beats and a rest every 1.1 s; two rings swell out of the orb and fade as the beats come.
function heart(ctx, b, t, k, lv, since) {
  if (!alive(b, 'heart')) return;
  const [x, y] = [PART.heart.x, PART.heart.y];
  const u = (t / 1.1) % 1;
  const beat = Math.exp(-(((u - 0.06) * 12) ** 2)) + 0.65 * Math.exp(-(((u - 0.3) * 12) ** 2));
  disc(ctx, PAL.violet, x, y, 62 + 20 * beat + 16 * lv, k * (0.16 + 0.2 * beat + 0.05 * lv));
  disc(ctx, PAL.cyan, x, y, 32 + 8 * beat, k * (0.12 + 0.2 * beat));
  for (const [c, off] of [[PAL.cyan, 0], [PAL.violet, 0.5]]) { // a ring leaves the orb and fades
    const e = (u + off) % 1;
    ring(ctx, c, x, y, ORB + 4 + 40 * e, k * (1 - e) ** 1.5 * (0.45 + 0.15 * lv));
  }
  const e = clamp(1 - (t - since) / 0.8, 0, 1); // a flash as a phase begins
  if (e > 0) {
    disc(ctx, PAL.cyan, x, y, 140 * (1.2 - e), k * e * 0.4);
    ring(ctx, PAL.white, x, y, 130 * (1.2 - e), k * e * 0.6);
  }
}

// Bolts through the cloud: random flickers (more often with the phase) and, from the hover phase on, waves crawling out from the body.
function stormBolts(ctx, t, k, lv) {
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s, 1);
    STORM_PATHS.forEach((path, i) => {
      const h = hash(Math.floor(t * 9 + i * 0.37) * 17 + i * 5 + (s > 0 ? 0 : 101));
      const wave = (((t * 1.5 - i * 0.14) % 1) + 1) % 1 < 0.2 ? clamp(lv - 0.7, 0, 1) : 0;
      const on = h < 0.1 + 0.2 * lv ? 1 : wave;
      if (!on) return;
      const m = storm(i);
      ctx.globalAlpha = k * on * (0.55 + 0.45 * hash(Math.floor(t * 40) + i));
      ctx.drawImage(m.img, m.x, m.y);
      disc(ctx, '#9fb4ff', (path[0] + path[2]) / 2, (path[1] + path[3]) / 2, 70, k * on * 0.13);
    });
    ctx.restore();
  }
}

function mouth(ctx, b, t, k, lv) {
  if (!alive(b, 'maw')) return;
  const f = 0.5 + 0.5 * Math.sin(t * 5.3) * Math.sin(t * 2.9);
  disc(ctx, PAL.violet, PART.maw.x, PART.maw.y + 2, 70 + 10 * f, k * (0.1 + 0.1 * lv) * (0.7 + 0.5 * f));
  spark(ctx, PAL.cyan, PART.maw.x, PART.maw.y + 2, 24 + 10 * lv, k * (0.1 + 0.2 * lv) * f);
}

const WISPS = Array.from({ length: 6 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (110 + 48 * i), y: edgeY(TRAIL, 110 + 48 * i) - 6 + 12 * (i % 3), w: 60 + 20 * hash(i + 3), q: hash(i * 7 + 1) }));

function wisps(ctx, t, k) {
  for (const w of WISPS) {
    const a = t * 0.35 + w.q * 6.28;
    const [x, y] = [w.x + 26 * Math.sin(a), w.y + 8 * Math.sin(a * 1.7)];
    const h = w.w * 0.34;
    ctx.globalAlpha = k * (0.1 + 0.05 * Math.sin(a * 2.1));
    ctx.drawImage(glow('#9fb4ff'), x - w.w, Math.max(y - h, TOP), w.w * 2, h * 2);
  }
}

export function fx(ctx, b, t, k, own, since) {
  const ph = clamp(b.phase, 0, 2);
  const lv = ph === 0 ? 0 : ph - 1 + smooth((t - since) / 0.9);
  wisps(ctx, t, k);
  stormBolts(ctx, t, k, lv);
  coil(ctx, b, t, k, lv, -1);
  coil(ctx, b, t, k, lv, 1);
  heart(ctx, b, t, k, lv, since);
  mouth(ctx, b, t, k, lv);
  ctx.globalAlpha = 1;
}

export function warm() {
  warmBolts();
  for (const c of [PAL.cyan, PAL.violet, '#9fb4ff']) glow(c);
  for (const c of ['#fff6c0', PAL.cyan]) star(c);
  for (const c of [PAL.cyan, PAL.violet, PAL.white]) ringSprite(c);
}
