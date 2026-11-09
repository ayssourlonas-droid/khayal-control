// The Vesper Moth's forewings, live (World 16, Glass Cathedral; moth-fx.js calls wings): each living wing is drawn from the
// baked frames of moth-frames.js, the frame for the beat's pose over the part's static body (and the next pose fading in
// over it, both drawn as the exact pose the wing is at now so the lead never doubles), then its damage layer, its white
// flash after a hit and its light; and on the glass, at the front of the wave of light, the glints. The bodies are opaque
// and so only in the boss's own pass (`own`); a destroyed wing gives nothing, and a wing the boss has cracked open
// (`cracked`) is split and hangs still, so the part's own art shows. Cached sprites only, nothing allocated per frame.
import { glow, star } from '../sprites.js';
import { alive, partStage } from './parts.js';
import { FB, POSES, wingFrame, wingFlash, crackLayer, pose } from './moth-frames.js';
import { TILT, GROW, wave } from './moth-wing.js';
import { HUB, ROWS, NV, RING, cellMid } from './moth-wing-geo.js';
import { ROSE, VIOLET, COBALT } from './moth-kit.js';

export const GLINT = '#fff0f8'; // the glints on the glass

const FLASH = 0.06;
const hits = new WeakMap(); // wing -> { hp, at }: when it last lost hp
const CAST = [[ROSE, 2], [VIOLET, 3], [COBALT, 4]]; // the colour of a row of panes and which row: the light it throws on what lies under the wing
const MID = Array.from({ length: ROWS + 1 }, (_, r) => Array.from({ length: NV - 1 }, (_, i) => (r ? cellMid(i, r) : null))); // each pane's middle, in the left wing's own coordinates

function flashed(p, t) {
  let h = hits.get(p);
  if (!h) {
    h = { hp: p.hp, at: -1e9 };
    hits.set(p, h);
  }
  if (p.hp < h.hp) h.at = t;
  h.hp = p.hp;
  return t >= h.at && t - h.at < FLASH;
}

// A frame painted at pose `from`, drawn as the pose p the wing is at now (moth-frames.js pose): the poses never double
// the lead when they cross-fade. The wing's light is the same frame's, at half the size.
function put(ctx, img, p, from, light) {
  ctx.save();
  pose(ctx, p, from);
  if (light) ctx.drawImage(img, FB.x, FB.y, FB.w, FB.h);
  else ctx.drawImage(img, FB.x, FB.y);
  ctx.restore();
}

// A forewing: the frame (or two) for the beat's pose over the part's body, its damage, its flash, and its light.
function wing(ctx, b, id, s, m, t, k, own) {
  const p = alive(b, id);
  if (!p || p.cracked) return; // a wing the boss has split open hangs still: the part's own art shows
  const x = m.pose * (POSES - 1);
  const i = Math.min(POSES - 2, Math.floor(x));
  const f = x - i;
  const [lo, hi] = [i > 0 ? wingFrame(i) : null, wingFrame(i + 1)];
  const [at0, at1] = [i / (POSES - 1), (i + 1) / (POSES - 1)];
  ctx.save();
  ctx.translate(p.x - b.x, p.y - b.y);
  ctx.scale(s, 1);
  if (own) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (lo) put(ctx, lo.body, m.pose, at0, false);
    if (f > 0.03) { // the next pose fades in over it; from the wing at rest the first frame does
      ctx.globalAlpha = f;
      put(ctx, hi.body, m.pose, at1, false);
      ctx.globalAlpha = 1;
    }
    const stage = partStage(p);
    const fl = flashed(p, t);
    if (stage || fl) {
      ctx.save();
      pose(ctx, m.pose);
      if (stage) ctx.drawImage(crackLayer(stage), FB.x, FB.y);
      if (fl) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(wingFlash(), FB.x, FB.y);
      }
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter';
  }
  if (lo) {
    ctx.globalAlpha = k * (1 - f) * 0.9;
    put(ctx, lo.lights, m.pose, at0, true);
  }
  ctx.globalAlpha = k * f * 0.9;
  put(ctx, hi.lights, m.pose, at1, true);
  ctx.restore();
}

// Glints on the glass at the front of the wave of light that runs out through the rows of panes as a wing rises, one on
// every other pane of the row it has reached (the right wing's mirrored), each twinkling in its own time.
export function glints(ctx, b, m, t, k, id, s) {
  const p = alive(b, id);
  if (!p || p.cracked) return;
  const u = 1 + m.pose * (ROWS - 1);
  const r0 = Math.min(ROWS - 1, Math.floor(u));
  const f = u - r0;
  const [c, sn] = [Math.cos(TILT * m.pose), Math.sin(TILT * m.pose)];
  for (let i = s > 0 ? 0 : 1; i < NV - 1; i += 2) {
    const [a, d] = [MID[r0][i], MID[r0 + 1][i]];
    const [dx, dy] = [(a[0] + (d[0] - a[0]) * f - HUB[0]) * (1 + GROW[0] * m.pose), (a[1] + (d[1] - a[1]) * f - HUB[1]) * (1 + GROW[1] * m.pose)];
    const [x, y] = [HUB[0] + dx * c - dy * sn, HUB[1] + dx * sn + dy * c];
    ctx.globalAlpha = k * 0.7 * Math.max(0, Math.sin(t * 7.3 + i * 2.1 + (s > 0 ? 0 : 1.3))) ** 2;
    ctx.drawImage(star(GLINT), p.x - b.x + s * x - 10, p.y - b.y + y - 10, 20, 20);
  }
}

// The coloured light a wing throws under it, as the light of a window falls on a floor: a soft patch of each row's colour
// below the row, sliding out and down with the wing as it rises and brightest as the wave of light passes the row.
function cast(ctx, b, m, k, id, s) {
  const p = alive(b, id);
  if (!p || p.cracked) return;
  for (let i = 0; i < CAST.length; i++) {
    const r = CAST[i][1];
    const x = HUB[0] + ((RING[r][2][0] + RING[r][3][0]) / 2 - HUB[0]) * (1 + GROW[0] * m.pose);
    ctx.globalAlpha = k * (0.07 + 0.2 * wave(r, m.pose));
    ctx.drawImage(glow(CAST[i][0]), p.x - b.x + s * x - 46, p.y - b.y + 82 + 6 * m.pose - 22, 92, 44);
  }
}

// Both forewings, and the light and glints on them.
export function wings(ctx, b, m, t, k, own) {
  wing(ctx, b, 'wingL', 1, m, t, k, own);
  wing(ctx, b, 'wingR', -1, m, t, k, own);
  glints(ctx, b, m, t, k, 'wingL', 1);
  glints(ctx, b, m, t, k, 'wingR', -1);
  cast(ctx, b, m, k, 'wingL', 1);
  cast(ctx, b, m, k, 'wingR', -1);
}
