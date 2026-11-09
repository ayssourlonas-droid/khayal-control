// Ambient kinds of Lantern Deep (same contract as ambient.js): marine snow, the organic flecks that rain through
// every deep sea, sinking with a lazy sway and a slow twinkle; minnows, far-off groups of tiny fish that drift
// along the water, slow down, turn at their own edge and come back; and rising ring bubbles, glass-clear with a
// thin pale rim and a glint, wobbling as they climb, swelling a little and fading out at the top. All of it is
// dim and cool on purpose: the pearls, the bullets and the maelstrom are the loudest things on screen, so no
// bubble is a filled dot and no fleck is pearl-white. What is big and slow is in flourish-12.js and -13.js.
import { W, H, hash, wrap, cached, byColor, soft, rgba, mix, shade } from './sprites.js';
import { TAU, clamp } from '../core/math.js';

const SALT = { sky: 0, mid: 4001, front: 9001, screen: 13001 }; // so one kind in two phases does not repeat its pattern
const SNOW = { cool: '#7fc4e8', coolBy: 0.3, scale: 2.4, sway: 16 }; // a fleck is `scale` times its size across; whites lean this far to blue
const MINNOW = { reach: [380, 900], len: 14, edge: 5 }; // [least, most] px a group swims from its middle; px of body per unit of size; how fast a turn is
const BUBBLE = { box: 40, ring: 34, grow: 0.35, wobble: 0.8 }; // sprite size, the ring's diameter in it, share it swells by on the way up

// A fleck of snow, 16 x 16: a little irregular clump of three soft blots and a thread of fibre, tinted cool.
export const fleck = byColor((color) => cached('deepfxFleck' + color, 16, 16, (g) => {
  const c = mix(color, SNOW.cool, SNOW.coolBy);
  for (const [x, y, r, a] of [[8, 8, 5.4, 1], [5, 9.6, 3.4, 0.7], [11, 5.7, 3, 0.7]]) {
    g.globalAlpha = a;
    g.drawImage(soft(c), x - r, y - r, r * 2, r * 2);
  }
  g.globalAlpha = 0.35;
  g.strokeStyle = c;
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(2, 12);
  g.lineTo(14, 4);
  g.stroke();
}));

// A minnow facing right, 32 x 14: a dark blue body, a forked tail, a pale stripe along the flank.
export const minnow = byColor((color) => cached('deepfxMinnow' + color, 32, 14, (g) => {
  g.fillStyle = shade(color, -0.55);
  g.beginPath();
  g.ellipse(16, 7, 11, 3.6, 0, 0, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(7, 7);
  g.lineTo(0.5, 2.4);
  g.lineTo(3, 7);
  g.lineTo(0.5, 11.6);
  g.closePath();
  g.fill();
  g.strokeStyle = rgba(color, 0.85);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(10, 6.6);
  g.lineTo(24, 6.6);
  g.stroke();
}));

// A ring bubble, 40 x 40, the ring 34 across: a clear glass body that thickens toward the rim, a rim that is
// brighter up and to the left, and one short glint on the upper left. Nothing in it is a filled bright dot.
export const bubble = byColor((color) => cached('deepfxBubble' + color, BUBBLE.box, BUBBLE.box, (g) => {
  const [c, r] = [BUBBLE.box / 2, BUBBLE.ring / 2];
  const body = g.createRadialGradient(c, c, 0, c, c, r);
  body.addColorStop(0, rgba(color, 0));
  body.addColorStop(0.7, rgba(color, 0.04));
  body.addColorStop(1, rgba(color, 0.16));
  g.fillStyle = body;
  g.beginPath();
  g.arc(c, c, r, 0, TAU);
  g.fill();
  const rim = g.createLinearGradient(c - r, c - r, c + r, c + r);
  rim.addColorStop(0, rgba(color, 0.8));
  rim.addColorStop(1, rgba(color, 0.28));
  g.strokeStyle = rim;
  g.lineWidth = 2.2;
  g.beginPath();
  g.arc(c, c, r, 0, TAU);
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.5)';
  g.lineWidth = 2;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(c, c, r - 4.2, 3.55, 4.35);
  g.stroke();
}));

// Flecks sinking at their own pace, swaying a little, each one fading up and down on a twinkle of its own and
// thinning out at the top and foot of the frame.
function marinesnow(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  ctx.save();
  for (let i = 0; i < a.n; i++) {
    const k = i * 5 + salt;
    const h = hash(k + 11);
    const ph = hash(k + 15) * TAU;
    const size = (s0 + (s1 - s0) * hash(k + 14)) * SNOW.scale;
    const y = wrap(hash(k + 13) * H + t * a.speed * (0.55 + 0.9 * h), -12, H + 12);
    const x = wrap(hash(k + 12) * (W + 200) - 100 + drift * 0.3 + Math.sin(t * 0.45 + ph) * SNOW.sway, -100, W + 100);
    const tw = Math.sin(t * (0.9 + 1.4 * h) + ph) ** 2;
    ctx.globalAlpha = a.alpha * (0.4 + 0.6 * tw) * clamp(Math.min(y + 12, H + 12 - y) / 50, 0, 1);
    ctx.drawImage(fleck(a.colors[i % a.colors.length]), x - size / 2, y - size / 2, size, size);
  }
  ctx.restore();
}

// Minnows in groups of about three, each group swimming back and forth along its own stretch of water: a
// sinusoid, so it slows toward each end, and the fish turns (narrowing to nothing, then widening the other way)
// as it does. The members of a group lag a little behind one another, so the group stretches and gathers.
function minnows(ctx, a, t) {
  const [s0, s1] = a.size;
  const groups = Math.max(1, Math.round(a.n / 3));
  ctx.save();
  for (let i = 0; i < a.n; i++) {
    const [g, m] = [i % groups, Math.floor(i / groups)];
    const reach = MINNOW.reach[0] + (MINNOW.reach[1] - MINNOW.reach[0]) * hash(g * 7 + 201);
    const phase = (a.speed / reach) * (0.7 + 0.6 * hash(g * 7 + 202)) * t + hash(g * 7 + 203) * TAU - m * 0.05;
    const x = W * (0.2 + 0.6 * hash(g * 7 + 204)) + reach * Math.sin(phase) + (hash(i * 3 + 205) - 0.5) * 40;
    if (x < -60 || x > W + 60) continue;
    const face = clamp(Math.cos(phase) * MINNOW.edge, -1, 1);
    if (Math.abs(face) < 0.04) continue;
    const y = H * (a.maxY ?? 0.6) * (0.12 + 0.8 * hash(g * 7 + 206)) + ((m % 3) - 1) * 18 + (hash(i * 3 + 207) - 0.5) * 16 + Math.sin(t * 0.6 + i) * 4;
    const k = (s0 + (s1 - s0) * hash(i * 3 + 208)) / MINNOW.len;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(face * k, k);
    ctx.globalAlpha = a.alpha * (0.55 + 0.45 * Math.abs(face));
    ctx.drawImage(minnow(a.colors[i % a.colors.length]), -16, -7);
    ctx.restore();
  }
  ctx.restore();
}

// Bubbles rising at their own pace, wobbling from side to side more the bigger they are, swelling as the water
// lets go of them, and fading in at the foot of the frame and out over the top stretch.
function deepbubbles(ctx, a, t, drift) {
  const [s0, s1] = a.size;
  const salt = SALT[a.phase] ?? 0;
  ctx.save();
  for (let i = 0; i < a.n; i++) {
    const k = i * 5 + salt;
    const h = hash(k + 11);
    const ph = hash(k + 15) * TAU;
    const size = s0 + (s1 - s0) * hash(k + 14);
    const y = wrap(hash(k + 13) * (H + 60) - t * a.speed * (0.6 + 0.8 * h), -30, H + 30);
    const d = (size * (1 + BUBBLE.grow * ((H + 30 - y) / (H + 60))) * BUBBLE.box) / BUBBLE.ring;
    const x = wrap(hash(k + 12) * (W + 200) - 100 + drift * 0.2 + Math.sin(t * (1.1 + h) + ph + y * 0.012) * (5 + size * BUBBLE.wobble), -100, W + 100);
    ctx.globalAlpha = a.alpha * clamp(Math.min((H + 30 - y) / 60, y / 170), 0, 1);
    ctx.drawImage(bubble(a.colors[i % a.colors.length]), x - d / 2, y - d / 2, d, d);
  }
  ctx.restore();
}

// Paint the sprites a look's entries draw, so none is baked mid-fight (the coordinator calls it).
export function warmDeepAmbient(look) {
  for (const a of look.ambient) {
    const make = { marinesnow: fleck, minnows: minnow, deepbubbles: bubble }[a.kind];
    if (make) a.colors.forEach((c) => make(c));
  }
}

export const AMBIENT7 = { marinesnow, minnows, deepbubbles };
