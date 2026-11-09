// The mending, world 7's reassemble twist drawn as shattered glass (world 16, Glass Cathedral). An armored alien
// that dies leaves a wreck for two seconds (core/twists-2.js): here a hanging, slowly turning cloud of sixteen
// pieces, stained-glass shards in the aliens' jewel colours, chips of stone and bent strips of lead (shard-sprites.js),
// each one orbiting the place the gargoyle fell at its own pace on a tilted ring, nearer ones larger and drawn over
// the farther, turning end over end, bobbing. It flies out of the body in the first third of a second (the break
// itself: fx/react-glass.js adds the flash), and in the last second the light gathers: the cloud drifts wider, the
// pieces turn faster, a faint ghost of the gargoyle comes up in it and a violet and gold glow swells, until the
// stand-up (mending-fx-view.js flies the pieces in from exactly where this left them). Every piece is a pure
// function of the wreck's age (WRECK_TIME - w.left) and of a seed taken from its slot, so the fx can pick up
// where the wreck stopped. Cached sprites only; nothing is allocated per frame (one scratch point).
import { glow, star, hash } from './sprites.js';
import { smooth, TAU } from '../core/math.js';
import { WRECK_TIME } from '../core/twists-2.js';
import { roleSprites } from './aliens/bake.js';
import { shardSprite, chipSprite, cameSprite, SHARD_SHAPES, CHIP_SHAPES, GLASSES } from './shard-sprites.js';

export const PIECES = Array.from({ length: 16 }, (_, i) => {
  const r = (j) => hash(i * 29 + j * 7 + 11);
  return {
    kind: i % 4 === 3 ? 'chip' : i === 5 || i === 12 ? 'came' : 'glass',
    shape: Math.floor(r(1) * SHARD_SHAPES) % (i % 4 === 3 ? CHIP_SHAPES : SHARD_SHAPES),
    color: [3, 0, 1, 2, 4, 5, 3, 0][Math.floor(r(2) * 8)], // the gargoyle's violet leads
    phi: r(3) * TAU, reach: 16 + r(4) * 20, omega: 0.45 + r(5) * 0.7, spin: (r(6) - 0.5) * 3.2, size: 0.7 + r(7) * 0.5, bob: 1.5 + r(8) * 2.5,
  };
});
const TILT = 0.55; // the rings are seen at a slant: y is this much of x
const OUT = 0.35; // s the pieces take to fly out of the body
const GATHER = [1.1, 1.0]; // from this age the light gathers, over this many seconds
const WIDEN = 0.55; // how much farther out the cloud drifts as it does

export const seedOf = (slot, x = 0, y = 0) => (slot ? slot.row * 31 + slot.col * 7 + 3 : Math.round(x * 0.37 + y * 0.11));

// Where piece i of a cloud with this seed is `age` s after the wreck fell, relative to the wreck's place: x, y, the
// depth z (-1 far .. 1 near), the turn, and the scale. Written into `out`.
export function pieceAt(i, seed, age, out) {
  const p = PIECES[i];
  const gather = smooth((age - GATHER[0]) / GATHER[1]);
  const reach = p.reach * (0.3 + 0.7 * smooth(age / OUT)) * (1 + WIDEN * gather);
  const a = p.phi + seed * 0.37 + p.omega * (age + 1.6 * gather * gather);
  out.z = Math.sin(a);
  out.x = Math.cos(a) * reach;
  out.y = out.z * reach * TILT + Math.sin(age * 1.7 + p.phi * 3) * p.bob - 4 * (1 - smooth(age / OUT));
  out.rot = p.spin * age + p.phi + gather * p.spin * 2;
  out.scale = p.size * (0.8 + 0.25 * out.z);
  return out;
}

export function drawPiece(ctx, i, x, y, rot, scale) {
  const p = PIECES[i];
  const img = p.kind === 'chip' ? chipSprite(p.shape) : p.kind === 'came' ? cameSprite() : shardSprite(p.shape, p.color);
  const s = 32 * scale * 0.8;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.drawImage(img, -s / 2, -s / 2, s, s);
  ctx.rotate(-rot);
  ctx.translate(-x, -y);
}

const at = { x: 0, y: 0, z: 0, rot: 0, scale: 1 };

// The ghost of the gargoyle coming up in the cloud as the light gathers, and the glow under it.
function gathering(ctx, w, look, t, gather) {
  const set = roleSprites(look, 'armored');
  const s = set.size * (0.9 + 0.1 * gather);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.14 + 0.36 * gather + 0.04 * Math.sin(t * 7 + w.x);
  ctx.drawImage(glow('#a47cff'), w.x - 50, w.y - 50, 100, 100); // always a little: something broken, held in the light
  ctx.globalAlpha = 0.45 * gather;
  ctx.drawImage(glow('#ffe9b0'), w.x - 34, w.y - 34, 68, 68);
  ctx.globalCompositeOperation = 'source-over';
  if (gather <= 0.02) return;
  ctx.globalAlpha = 0.5 * gather;
  ctx.drawImage(set.body[0], w.x - s / 2, w.y - s / 2, s, s);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.7 * gather;
  ctx.drawImage(set.lights[0], w.x - s / 2, w.y - s / 2, s, s);
  ctx.globalCompositeOperation = 'source-over';
}

export function drawMending(ctx, w, look, t) {
  const age = WRECK_TIME - w.left;
  const gather = smooth((age - GATHER[0]) / GATHER[1]);
  const seed = seedOf(w.slot, w.x, w.y);
  const tremble = gather * 2.2 * Math.sin(t * 57); // it shudders before it stands
  const fade = Math.min(1, age / 0.12);
  gathering(ctx, w, look, t, gather);
  ctx.globalCompositeOperation = 'lighter'; // the glass holds a little light of its own colour
  ctx.globalAlpha = 0.28 * fade;
  for (let i = 0; i < PIECES.length; i++) {
    if (PIECES[i].kind !== 'glass') continue;
    pieceAt(i, seed, age, at);
    const r = 12 * at.scale + 6;
    ctx.drawImage(glow(GLASSES[PIECES[i].color]), w.x + at.x + tremble - r, w.y + at.y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  for (const pass of [0, 1]) { // the far pieces first, then the near
    for (let i = 0; i < PIECES.length; i++) {
      pieceAt(i, seed, age, at);
      if (at.z >= 0 !== (pass === 1)) continue;
      ctx.globalAlpha = fade * (0.82 + 0.18 * at.z);
      drawPiece(ctx, i, w.x + at.x + tremble, w.y + at.y, at.rot, at.scale);
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < PIECES.length; i += 3) { // glints run over the glass
    const u = Math.sin(t * 2.6 + i * 1.9 + seed) - 0.82;
    if (u <= 0) continue;
    pieceAt(i, seed, age, at);
    ctx.globalAlpha = Math.min(1, u * 5) * 0.8 * fade;
    ctx.drawImage(star('#ffffff'), w.x + at.x - 8 + tremble, w.y + at.y - 8, 16, 16);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
