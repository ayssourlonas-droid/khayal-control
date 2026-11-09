// The Squall Ray's maw (World 18, Anvil Sky; see ray.js): a weak part 160 x 80 at the front of its head, between the cephalic lobes. A manta's mouth is a wide flat
// slot across the front of its head, and so is this one, 144 wide and about twenty px tall (ray-shape.js MOUTH, UP and DN its lips), with the hull's lips of cloud
// rolled round it (ray-seat.js); in the part itself an upper and a lower jaw plate of riveted iron follow the slot's edges, each with a row of small iron teeth along
// its inner edge, two clamps hold the slot's ends, and in the slot a hollow that is electric cyan at its sides and a pale blue at its middle. The body layer holds
// the hollow's dull glow, the plates, the teeth and the clamps; the lights layer is the fire in the hollow (cyan and violet, white only at a small core), thin bolts
// crackling from tooth to tooth across the gap, the slot's rim burning and a bloom round the whole mouth. The ray's shots start here, so it is built to look like it.
// Part coordinates (the part's centre is the origin). Bake-time only.
import { PAL, rng, path, line, rad, rgba, shade, bloom } from './ray-kit.js';
import { glare, rivet } from '../aliens/w18-kit.js';
import { fork, strike } from './ray-bolt.js';
import { UP, DN, MOUTH, MOUTH_X } from './ray-shape.js';
import { slab, rivetsOn } from './ray-iron.js';

const JAW = 14; // the jaw plates' thickness

function opening(b) {
  path(b, MOUTH);
  b.fillStyle = rad(b, 0, 2, 0, 74, [[0, '#c4ecff'], [0.2, '#4a8cff'], [0.55, '#18206a'], [1, '#050824']]);
  b.fill();
}

// A jaw plate: the band along one lip, as a clockwise polygon (its slot edge and its outer edge, each from the lip's own curve).
function jaws(b) {
  const xs = MOUTH_X.slice(1, -1);
  slab(b, [...xs.map((x) => [x, UP(x) - JAW]), ...xs.toReversed().map((x) => [x, UP(x) - 1])], PAL.iron, { lw: 2, wear: 0.4, rust: 0.2, seed: 8 });
  slab(b, [...xs.map((x) => [x, DN(x) + 1]), ...xs.toReversed().map((x) => [x, DN(x) + JAW - 2])], PAL.iron, { lw: 2, wear: 0.4, rust: 0.2, seed: 9 });
  rivetsOn(b, xs.filter((_, i) => i % 2).flatMap((x) => [[x, UP(x) - JAW / 2 - 1], [x, DN(x) + JAW / 2 - 1]]), 1.6);
}

// A tooth: an iron spike of half-width w from the plate's edge at (x, y0) to its tip at y1.
function tooth(b, x, y0, y1, w) {
  slab(b, [[x - w, y0], [x + w, y0], [x + w * 0.15, y1], [x - w * 0.15, y1]], PAL.steel, { lw: 1.1, wear: 0.5, rust: 0, seed: Math.round(x + y1) });
}

function teeth(b) {
  for (const x of MOUTH_X.slice(1, -1)) {
    const k = 1 - Math.abs(x) / 90;
    tooth(b, x, UP(x) - 1, UP(x) + 6 + 5 * k, 3.4);
    if (x % 18) tooth(b, x, DN(x) + 1, DN(x) - 4 - 4 * k, 3);
  }
}

function clamps(b) {
  for (const s of [-1, 1]) {
    slab(b, [[s * 62, -17], [s * 80, -12], [s * 80, 14], [s * 62, 19]], PAL.iron, { lw: 2, wear: 0.4, rust: 0.2, seed: s + 8 });
    rivetsOn(b, [[s * 68, -7], [s * 75, -5], [s * 68, 11], [s * 75, 9]], 1.8);
    rivet(b, s * 71, 3, 3, shade(PAL.steel, 0.2));
  }
}

function fire(l) {
  l.save();
  path(l, MOUTH);
  l.clip();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rad(l, 0, 2, 0, 76, [[0, rgba(PAL.white, 0.9)], [0.12, rgba(PAL.cyan, 0.8)], [0.5, rgba(PAL.electric, 0.5)], [1, rgba(PAL.violet, 0)]]);
  l.fillRect(-80, -30, 160, 60);
  l.restore();
  const r = rng(37);
  for (let i = 0; i < 7; i++) {
    const x = -54 + i * 18 + 4 * r();
    strike(l, fork(i + 1, x, UP(x) + 6, x + (r() - 0.5) * 10, DN(x) - 4, 4, 3, 0), i % 2 ? PAL.cyan : PAL.violet, 1.1, 0.8);
  }
  for (const f of [UP, DN]) {
    path(l, MOUTH_X.map((x) => [x, f(x)]), true);
    line(l, rgba(PAL.cyan, 0.5), 2.4);
  }
  bloom(l, 0, 2, 80, PAL.violet, 0.34);
  bloom(l, 0, 2, 46, PAL.cyan, 0.3);
  glare(l, 0, 2, 6, PAL.white, 0.9);
}

export function maw(b, l) {
  b.save();
  l.save();
  opening(b);
  jaws(b);
  teeth(b);
  clamps(b);
  fire(l);
  b.restore();
  l.restore();
}
