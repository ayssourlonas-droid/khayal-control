// The look of a shell going off in Ember Carnival (world 14): a chrysanthemum of sparks, baked once for each of
// the six burst colours (react-carnival.js HUES) in two states, and drawn from the 'bloom' ring the fx
// reaction adds (fx-view.js calls drawBloom). The open state is rays of sparks with trails, long ones and
// short ones between, a bright tip on each, reaching the burst's own radius; the drooped state is the same
// rays bent down under their weight, which the burst melts into as it fades, so the flower seems to fall.
// Both are cached sprites drawn with 'lighter'. The white flash, the smoke and the falling sparks are the
// reaction's own particles.
import { cached, byColor, glow, rgba, lin, hash } from './sprites.js';
import { TAU } from '../core/math.js';
import { BURST_R } from '../core/damage.js';
import { HUES } from '../fx/react-carnival.js';

const R = BURST_R;
export const CX = R + 8; // the burst's centre in either sprite
export const CY = R + 8;
export const OPEN = { w: CX * 2, h: CY * 2 };
export const SAG = 62; // px the drooped rays' tips hang below where the open ones reach
export const DROOP = { w: CX * 2, h: CY + R + SAG + 22 };
const RAYS = 26;

// One ray from the centre out to length L at angle a, bending down by SAG * u^2 along it (droop 0..1): a
// soft wide stroke and a hot narrow one, both fading in from nothing at the centre to the tip, stamens
// along the outer half and a bright head. Drawn with the origin at the burst's centre.
function ray(g, a, L, c, hi, droop, w) {
  const at = (u) => [Math.cos(a) * L * u, Math.sin(a) * L * u + SAG * droop * u * u];
  const [tx, ty] = at(1);
  g.beginPath();
  for (let k = 0; k <= 10; k++) g.lineTo(...at(k / 10));
  for (const [lw, stops] of [ // a soft wide stroke in the colour, and a hot narrow one that turns pale only at the head
    [6 * w, [[0, rgba(c, 0)], [0.3, rgba(c, 0)], [1, rgba(c, 0.5)]]],
    [2.4 * w, [[0, rgba(c, 0)], [0.25, rgba(c, 0.6)], [0.75, rgba(c, 1)], [1, rgba(hi, 1)]]],
  ]) {
    g.strokeStyle = lin(g, 0, 0, tx, ty, stops);
    g.lineWidth = lw;
    g.stroke();
  }
  g.fillStyle = rgba(hi, 0.85);
  for (const u of [0.55, 0.7, 0.84]) {
    const [x, y] = at(u);
    g.beginPath();
    g.arc(x, y, 1.5 * w, 0, TAU);
    g.fill();
  }
  g.drawImage(glow(c), tx - 9 * w, ty - 9 * w, 18 * w, 18 * w);
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(tx, ty, 2 * w, 0, TAU);
  g.fill();
}

// The whole flower in colour c with pale tips hi, drawn about the origin; droop 0 is open, 1 hangs.
export function paintBloom(g, c, hi, droop = 0) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let i = 0; i < RAYS; i++) ray(g, ((i + (hash(i + 11) - 0.5) * 0.5) / RAYS) * TAU, R * (0.86 + hash(i + 31) * 0.1), c, hi, droop, 1);
  for (let i = 0; i < RAYS; i++) ray(g, ((i + 0.5) / RAYS) * TAU + (hash(i + 51) - 0.5) * 0.1, R * (0.44 + hash(i + 71) * 0.14), hi, '#ffffff', droop, 0.62);
  g.drawImage(glow(c), -R * 0.34, -R * 0.34, R * 0.68, R * 0.68); // the heart
  g.lineCap = 'butt'; // gives back what it set, so a context that does not keep a stack of states (line-cap.test.js) sees it too
  g.lineJoin = 'miter';
  g.restore();
}

const hiOf = (c) => HUES.find((h) => h[0] === c)?.[1] ?? '#ffffff';
const open = byColor((c) => cached('burstBloom' + c, OPEN.w, OPEN.h, (g) => { g.translate(CX, CY); paintBloom(g, c, hiOf(c), 0); }));
const drooped = byColor((c) => cached('droop' + c, DROOP.w, DROOP.h, (g) => { g.translate(CX, CY); paintBloom(g, c, hiOf(c), 1); }));

// A 'bloom' ring (fx.js): r eases from r0 to the burst's reach as it ages. The open flower grows with r and
// fades; the drooped one fades in over it about half way, once the flower has all but reached full size.
export function drawBloom(ctx, ring) {
  const f = ring.life / ring.max;
  const age = 1 - f;
  const s = Math.max(0.05, ring.r / R);
  const fade = Math.min(1, f * 2.2);
  const fall = Math.min(1, Math.max(0, (age - 0.3) / 0.35));
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = fade * (1 - fall * 0.85);
  ctx.drawImage(open(ring.color), ring.x - CX * s, ring.y - CY * s, OPEN.w * s, OPEN.h * s);
  if (fall > 0) {
    ctx.globalAlpha = fade * fall;
    ctx.drawImage(drooped(ring.color), ring.x - CX * s, ring.y - CY * s, DROOP.w * s, DROOP.h * s);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Paint every sprite the bursts draw, so none is baked mid-fight (warm-carnival.js).
export function warmBurst() {
  for (const [c] of HUES) {
    open(c);
    drooped(c);
  }
}
