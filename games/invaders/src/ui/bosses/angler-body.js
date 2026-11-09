// The Lantern Leviathan's head (World 15, Lantern Deep; see angler.js): the dome, cheeks and throat as one lumpy
// mass of blue-black skin. A faintly lit back fading to a black underside, mottling, lumps and speckle
// (angler-skin.js), the light from the surface pooling on the dome and the brow, the edges rolled into shadow so the
// head reads round and a thin cold rim along the outline; ragged tags of skin hanging from its edge. Everything else
// on the face is laid over this.
import { line, lin, rad, rgba } from './kit.js';
import { HEAD, headPath, skinV, needlePath, rng, circle, SKIN_L, INK } from './angler-kit.js';
import { texture, lumps, sheen, scars } from './angler-skin.js';

// Tags of skin along the edge of the head, standing out from it: long and ragged under the cheeks, small spines
// along the shoulders. Painted before the head, so that the head's edge overlaps their roots.
export function frills(b) {
  const r = rng(11);
  for (let i = 0; i < HEAD.length; i++) {
    const [x0, y0] = HEAD[i];
    const [x1, y1] = HEAD[(i + 1) % HEAD.length];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (Math.abs(x0) < 100 && y0 > 100) continue; // the throat has the belly's pouch over it
    const n = Math.round(len / (y0 > 40 ? 15 : 22));
    for (let k = 0; k < n; k++) {
      const u = (k + 0.3 + r() * 0.4) / n;
      const a = Math.atan2(-(x1 - x0), y1 - y0) + (r() - 0.5) * 0.7; // outward, ragged
      const down = y0 > 20;
      b.save();
      b.translate(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u);
      b.rotate(a);
      needlePath(b, (down ? 10 : 6) + r() * (down ? 16 : 8), down ? 7 + 4 * r() : 4.5, (r() - 0.5) * 8);
      b.fillStyle = lin(b, 0, -4, 0, 4, [[0, '#26567a'], [1, '#07182a']]);
      b.fill();
      line(b, INK, 1.2);
      b.restore();
    }
  }
}

// Warts and swellings on the outline itself: round lumps of flesh set on the edge of the head, so that its silhouette is
// not a smooth curve. Painted before the head, which overlaps their roots.
export function bumps(b) {
  const r = rng(19);
  for (let i = 2; i < HEAD.length - 2; i++) {
    if (r() < 0.45 || (Math.abs(HEAD[i][0]) < 90 && HEAD[i][1] > 100)) continue;
    const [x, y] = HEAD[i];
    const rr = 6 + r() * 7;
    const [ox, oy] = [x * 0.03 + (r() - 0.5) * 4, y > 0 ? 3 : -2];
    b.fillStyle = rad(b, x + ox, y + oy, 0, rr, [[0, '#2a5878'], [0.6, '#0f2c46'], [1, '#07182a']], x + ox - rr * 0.3, y + oy - rr * 0.35);
    circle(b, x + ox, y + oy, rr);
    b.fill();
    line(b, INK, 1.8);
  }
}

export function body(b) {
  headPath(b);
  b.fillStyle = skinV(b, -137, 143);
  b.fill();
  b.save();
  headPath(b);
  b.clip();
  texture(b, 3);
  lumps(b, 77, [-226, -116, 226, 20], 16, 1.7, 14, 24); // and a few big swellings on the dome and the cheeks
  b.fillStyle = rad(b, -40, -112, 0, 210, [[0, rgba(SKIN_L, 0.4)], [0.6, rgba(SKIN_L, 0.1)], [1, rgba(SKIN_L, 0)]]); // the surface light on the dome
  b.fillRect(-256, -146, 512, 210);
  b.fillStyle = rad(b, 0, -6, 120, 310, [[0, 'rgba(0,3,8,0)'], [0.6, 'rgba(0,3,8,0.3)'], [1, 'rgba(0,3,8,0.72)']]); // the edges roll away
  b.fillRect(-256, -146, 512, 296);
  scars(b);
  sheen(b);
  b.restore();
  headPath(b);
  line(b, INK, 5);
  headPath(b);
  line(b, lin(b, 0, -137, 0, 143, [[0, rgba('#8ad8f0', 0.6)], [0.4, rgba('#4a90b0', 0.3)], [0.75, rgba('#2a5878', 0.14)], [1, rgba('#2a5878', 0.06)]]), 1.6);
}
