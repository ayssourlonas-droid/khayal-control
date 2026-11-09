// More flourishes (contract in flourish.js): Sunset Armada's sky. Shafts of light turning slowly from the
// sun (the baked rays are in sky-bodies-5.js; these are the live ones over them), a flock of gulls crossing
// the glare now and then, a far airship sailing across the sky, and cannon fire flashing inside the cloud
// sea, broadsides from a fleet out of sight. What moves on the layers (the water, the propellers, the
// windmills, the balloons) is in flourish-9.js.
import { W, hash, cached, byColor, glow, lighter, normal, lin, rgba } from './sprites.js';
import { makeRng } from '../core/rng.js';
import { SUN } from './cloud-kit.js';
import { RAYS } from './sky-bodies-5.js';
import { sailer } from './parallax-armada-ships.js';
import { gullSet } from './ambient-5.js';

// A tall wedge of light, its apex at the bottom middle, fading toward the top: one ray, drawn rotated.
const shaft = () => cached('armadaShaft', 96, 1700, (g, w, h) => {
  g.fillStyle = lin(g, 0, h, 0, 0, [[0, rgba('#fff0c0', 0.5)], [0.35, rgba('#ffd890', 0.22)], [1, rgba('#ffc890', 0)]]);
  g.beginPath();
  g.moveTo(w / 2 - 2, h);
  g.lineTo(0, 0);
  g.lineTo(w, 0);
  g.lineTo(w / 2 + 2, h);
  g.fill();
  g.globalCompositeOperation = 'destination-in'; // feathered at both sides
  g.fillStyle = lin(g, 0, 0, w, 0, [[0, 'rgba(0,0,0,0)'], [0.3, 'rgba(0,0,0,1)'], [0.7, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
  g.fillRect(0, 0, w, h);
});

// Six of the baked rays' angles each carry a live shaft that swells and fades on a beat of its own, a little
// brighter than the rest, so the light seems to move through the haze.
function godrays(ctx, { t, quality }) {
  const s = shaft();
  lighter(ctx);
  for (let i = 0; i < RAYS.length; i += quality < 1 ? 6 : 3) { // half as many on a struggling frame rate
    const { a, w } = RAYS[i];
    const k = Math.max(0, Math.sin(t * (0.22 + hash(i + 800) * 0.2) + i * 1.9));
    ctx.save();
    ctx.translate(SUN.x, SUN.y);
    ctx.rotate(a + Math.PI / 2);
    ctx.globalAlpha = 0.1 + 0.32 * k * k;
    ctx.drawImage(s, -w * 1700 * 0.5 * 0.9, -1700, w * 1700 * 0.9, 1700);
    ctx.restore();
  }
  ctx.globalAlpha = 0.25 + 0.08 * Math.sin(t * 0.9); // and the sun's own halo breathes
  if (quality >= 1) ctx.drawImage(glow('#ffd890'), SUN.x - 420, SUN.y - 340, 840, 680);
  normal(ctx);
}

const WING = [0, 1, 2, 1];
const FLOCK = gullSet('#2a1a48'); // dark against the glare
const SLOWEST = 150; // px/s, the slowest of the flock; the others add up to 40 more
const FLIGHT = (W + 240) / SLOWEST + 6 * 0.2 + 0.8;

// A flock of seven in a loose V crossing the glare from one side, now and then, each beating to its own time.
function birds(ctx, { t }) {
  const PERIOD = 41;
  const slot = Math.floor(t / PERIOD);
  const lt = t - slot * PERIOD - 3;
  if (lt < 0 || lt > FLIGHT || hash(slot * 5 + 90) > 0.7) return;
  const dir = hash(slot * 5 + 91) < 0.5 ? 1 : -1;
  const y0 = 240 + hash(slot * 5 + 92) * 200;
  for (let i = 0; i < 7; i++) {
    const age = lt - Math.ceil(i / 2) * 0.2 - hash(slot * 17 + i) * 0.3;
    const x = dir > 0 ? -80 + age * (SLOWEST + hash(i + 140) * 40) : W + 80 - age * (SLOWEST + hash(i + 140) * 40);
    if (x < -90 || x > W + 90) continue;
    const s = i ? 0.75 + hash(i + 141) * 0.25 : 1.1;
    ctx.save();
    ctx.translate(x, y0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 30 + Math.sin(age * 1.2 + i) * 12);
    ctx.scale(dir * s, s);
    ctx.rotate(Math.sin(age * 1.5 + i) * 0.07);
    ctx.drawImage(FLOCK[WING[Math.floor(t * 3.4 + i * 1.3) & 3]], -28, -17);
    ctx.restore();
  }
}

const SHIP = [300, 240]; // the far ship's sprite
const AT = [150, 205]; // where the ship sits in it: the sailer reaches 197 px above that (its mastheads), 145 to either side and 28 below
// The far airship, a full sailer painted small into a sprite once (hull, sails glowing with the sun behind
// them, rigging, lit portholes), one facing each way, the sun on the right in both.
const farSprite = byColor((dir) => cached('farship' + dir, SHIP[0], SHIP[1], (g) => {
  const L = { color: '#2e2260', sail: '#e8b878', lamp: '#ffd27a' };
  sailer(g, { lights: [], signs: [] }, makeRng(77), L, AT[0], AT[1], 240, dir, { masts: 3 });
}));

// Every so often an airship sails across the sky far off, a little hazed and smaller than the ones of the
// mid layer, rising and sinking gently on the air, a glow at its stern lamp.
function farship(ctx, { t }) {
  const [PERIOD, LEN] = [97, 36];
  const slot = Math.floor(t / PERIOD);
  const lt = t - slot * PERIOD - 20;
  if (lt < 0 || lt > LEN || hash(slot * 7 + 300) > 0.75) return;
  const dir = hash(slot * 7 + 301) < 0.5 ? 1 : -1;
  const u = lt / LEN;
  const x = dir > 0 ? -220 + u * (W + 440) : W + 220 - u * (W + 440);
  const y = 250 + hash(slot * 7 + 302) * 90 + Math.sin(lt * 0.5) * 7;
  ctx.globalAlpha = 0.82;
  ctx.drawImage(farSprite(dir), x - AT[0] * 0.6, y - AT[1] * 0.6, SHIP[0] * 0.6, SHIP[1] * 0.6);
  ctx.globalAlpha = 1;
  lighter(ctx);
  ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 5);
  ctx.drawImage(glow('#ff9a4a'), x - dir * 150 * 0.6 - 14, y - 7, 28, 28);
  normal(ctx);
}

const SALVO = 6.5; // s between one chance of a broadside and the next
// Cannon fire inside the cloud sea, after the far layer: a broadside is four to seven flashes in a row, each
// a hot white core with an orange bloom that lights the cloud round it for a heartbeat, a ring of smoke
// following, a little off the beat of the last.
function cannonfire(ctx, { t, quality }, x0, top) {
  const slot = Math.floor(t / SALVO);
  const lt = t - slot * SALVO;
  if (hash(slot * 3 + 500) > 0.55) return;
  const n = 4 + Math.floor(hash(slot * 3 + 501) * 4);
  const [bx, by] = [x0 + 300 + hash(slot * 3 + 502) * 1500, top + 330 + hash(slot * 3 + 503) * 80];
  lighter(ctx);
  for (let i = 0; i < n; i++) {
    const age = lt - 0.3 - i * (0.13 + hash(slot * 9 + i) * 0.06);
    if (age < 0 || age > 0.7) continue;
    const k = Math.max(0, 1 - age / 0.7);
    const [x, y] = [bx + i * (60 + hash(slot * 9 + i + 20) * 30), by + (hash(slot * 9 + i + 40) - 0.5) * 36];
    const r = 40 + 80 * Math.min(1, age * 6);
    ctx.globalAlpha = 0.3 * k;
    if (quality >= 1) ctx.drawImage(glow('#ff9a4a'), x - r * 2.6, y - r * 2.2, r * 5.2, r * 4.4); // the cloud lit round it
    ctx.globalAlpha = 0.95 * Math.min(1, k * 2.4);
    ctx.drawImage(glow('#ffd890'), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = k * k;
    ctx.drawImage(glow('#ffffff'), x - r * 0.4, y - r * 0.4, r * 0.8, r * 0.8);
  }
  normal(ctx);
}

// Paint the sprites these draw, so none is baked mid-fight (warm-armada.js).
export function warmSky() {
  shaft();
  farSprite(1);
  farSprite(-1);
}

export const FLOURISH8 = {
  godrays: { sky: godrays }, birds: { sky: birds }, farship: { sky: farship }, cannonfire: { far: cannonfire },
};