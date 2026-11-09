// A bullet the maelstrom has swallowed in Lantern Deep (world 15), drawn from its 'bubble' ring (react-maelstrom.js;
// fx-view.js calls drawBubble). For the first POP_AT of the ring's life the bubble spirals clockwise down the throat
// on a logarithmic spiral round the well, from where the bullet was to END_R, turning `turns` times, shrinking to a
// third and leaving a short comet of fainter copies behind; then it pops: a pale flash, a thin ring that opens
// and a handful of specks that fly out and fade. The bubble is the maelstrom's own sprite, the pop is a thin
// stroke and the same glow sprites the other fx use, all drawn with 'lighter'.
import { glow, rgba, hash } from './sprites.js';
import { bubble, BUBBLE_SCALE } from './flourish-maelstrom-bubble.js';
import { END_R, POP_AT } from '../fx/react-maelstrom.js';
import { TAU } from '../core/math.js';

const TRAIL = [[0.06, 0.4], [0.12, 0.18]]; // how far back along the way (a share of it) and how bright, for each ghost behind the head
const SHRINK = 0.4; // the bubble's size at the bottom, against its size at the start
const SPECKS = 6;
const POP_R = 28; // px the pop's ring and specks reach
const FLASH_R = 18; // px the pop's flash starts at (half its width)
const FLASH_FOR = 0.35; // the share of the pop the flash lasts

const P = { x: 0, y: 0 };
const ease = (v) => v * v * (3 - 2 * v);

// Where the bubble is when it has gone g (0..1) of the way down: a logarithmic spiral round the well. Fills P.
function place(r, g) {
  const d0 = Math.max(r.d0, END_R * 1.5); // a ring made by hand with no start still has a way down
  const d = d0 * (END_R / d0) ** g;
  const a = r.a0 + r.turns * TAU * g;
  P.x = r.wx + Math.cos(a) * d;
  P.y = r.wy + Math.sin(a) * d;
}

function travel(ctx, r, v, fadeIn) {
  const g = ease(v);
  const size = r.size * (1 + (SHRINK - 1) * g) * BUBBLE_SCALE;
  for (const [lag, a] of TRAIL) {
    place(r, ease(Math.max(0, v - lag)));
    ctx.globalAlpha = a * fadeIn;
    ctx.drawImage(bubble(r.color), P.x - size * 0.4, P.y - size * 0.4, size * 0.8, size * 0.8);
  }
  place(r, g);
  ctx.globalAlpha = fadeIn;
  ctx.drawImage(bubble(r.color), P.x - size / 2, P.y - size / 2, size, size);
}

function pop(ctx, r, w) {
  place(r, 1);
  const [x, y] = [P.x, P.y];
  const e = 1 - (1 - w) * (1 - w);
  if (w < FLASH_FOR) {
    const f = FLASH_R * (1 - w / FLASH_FOR);
    ctx.globalAlpha = 0.6;
    ctx.drawImage(glow('#ffffff'), x - f, y - f, f * 2, f * 2);
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 4 + (POP_R - 4) * e, 0, TAU);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = rgba(r.color, 0.95 * (1 - w * w));
  ctx.stroke();
  ctx.restore();
  const s = 8 - 5 * w; // each speck's glow, half-width
  ctx.globalAlpha = Math.min(1, 1.4 * (1 - w * w));
  for (let i = 0; i < SPECKS; i++) {
    const a = ((i + hash(r.seed + i * 3)) / SPECKS) * TAU;
    const d = 3 + (8 + 14 * hash(r.seed + i * 3 + 1)) * e;
    ctx.drawImage(glow(r.color), x + Math.cos(a) * d - s, y + Math.sin(a) * d - s, s * 2, s * 2);
  }
}

export function drawBubble(ctx, r) {
  const u = 1 - r.life / r.max;
  ctx.globalCompositeOperation = 'lighter';
  if (u < POP_AT) travel(ctx, r, u / POP_AT, Math.min(1, u / 0.08));
  else pop(ctx, r, Math.min(1, (u - POP_AT) / (1 - POP_AT)));
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
