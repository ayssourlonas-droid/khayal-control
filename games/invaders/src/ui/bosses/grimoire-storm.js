// The Grand Grimoire's turning leaf and its storm (World 12, Starlit Archive; grimoire-fx.js runs them):
// a leaf that turns across the spread now and then, and, in the last phase, torn pages circling the
// book on wide orbits. Opaque art, so only in the boss's own pass (`own`); the glows of the storm are
// light. Cached sprites only, nothing allocated per frame.
import { glow, hash } from '../sprites.js';
import { TAU, smooth, clamp } from '../../core/math.js';
import { alive } from './parts.js';
import { torn, leafFace, leafBack } from './grimoire-sprites.js';

export const PAGES = [['pageL', 1], ['pageR', -1]]; // the part and which way its frame runs (the right is the left mirrored)
const spot = [0, 0, 0]; // scratch for orbit()
const STORM = 20;

// A leaf turning across the spread, one way then the other, every 7.5 s (own pass): the face lies on one
// page and swings up to the spine edge-on, then the back comes down on the other.
const TURN = 7.5;
const TURN_FOR = 1.7;

export function turning(ctx, b, t, own) {
  if (!own) return;
  const slot = Math.floor(t / TURN);
  const lt = t - slot * TURN - 1.2;
  if (lt < 0 || lt > TURN_FOR) return;
  const from = PAGES[slot % 2 ? 0 : 1];
  const pg = alive(b, from[0]);
  if (!pg || !alive(b, PAGES[slot % 2 ? 1 : 0][0])) return;
  const phi = Math.PI * smooth(lt / TURN_FOR);
  const cos = Math.cos(phi);
  const w = 200 * Math.abs(cos);
  const h = 190 * (1 - 0.06 * Math.sin(phi));
  const y = pg.y - b.y - 95 - 9 * Math.sin(phi);
  const side = cos > 0 ? -from[1] : from[1]; // + is the right-hand page; past edge-on the back comes down on the other one
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = Math.min(1, lt * 5, (TURN_FOR - lt) * 5); // it lies down on the page it came from, and fades into the other
  ctx.save();
  ctx.scale(side, 1);
  ctx.drawImage(cos > 0 ? leafFace() : leafBack(), 86, y, w, h);
  ctx.fillStyle = 'rgba(255,246,208,0.55)'; // the free edge catching the light
  ctx.fillRect(86 + w - 1, y + 6, 2, h - 12);
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
}

// Torn page j of the storm at time t, grown e (0..1) of the way out of the eye: its offset from the
// eye and its size, in the scratch array. Each has an orbit, a speed and a direction of its own.
function orbit(j, t, e) {
  const rx = (225 + hash(j * 3) * 115) * e; // wide of the book's middle
  const a = hash(j * 3 + 1) * TAU + t * (0.3 + hash(j * 3 + 2) * 0.55) * (j % 2 ? 1 : -1);
  spot[0] = Math.cos(a) * rx;
  spot[1] = Math.sin(a) * rx * (0.14 + hash(j + 70) * 0.09) + 5;
  spot[2] = (0.55 + hash(j + 60) * 0.4) * (1 + Math.sin(a) * 0.25);
  return spot;
}

// A page crossing the middle of the book fades out and back, as if it passed behind the spine, so the eye
// and the clasp (the weak points) are never hidden.
const clear = (x) => clamp((Math.abs(x) - 70) / 50, 0, 1);

// The storm: pages torn loose circling the book on wide orbits, spiralling out of the eye when the phase
// begins (`since`), turning over as they go, a gold ember trailing each.
export function storm(ctx, b, t, k, own, since) {
  if (b.phase < 2) return;
  const eye = b.parts.find((p) => p.id === 'eye'); // alive or a wreck, the storm keeps its place
  const e = smooth((t - since) / 2.4);
  const [cx, cy] = [eye.x - b.x, eye.y - b.y];
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    for (let j = 0; j < STORM; j++) {
      const [x, y, s] = orbit(j, t, e);
      ctx.globalAlpha = e * clear(x);
      const flip = 0.45 + 0.55 * Math.abs(Math.cos(t * (1 + hash(j + 80) * 1.6) + j));
      ctx.drawImage(torn(j & 1, Math.floor(t * (1.5 + hash(j + 85) * 2.5) + j)), cx + x - 32 * s * flip, cy + y - 32 * s, 64 * s * flip, 64 * s);
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let j = 0; j < STORM; j++) {
    const [x, y, s] = orbit(j, t, e);
    ctx.globalAlpha = k * e * 0.42 * clear(x);
    ctx.drawImage(glow(j % 3 ? '#ffc65a' : '#fff0c0'), cx + x - 13 * s, cy + y - 13 * s, 26 * s, 26 * s);
  }
}
