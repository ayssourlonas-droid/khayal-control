// The Vesper Moth's hindwing (World 16, Glass Cathedral; see moth.js), part of the hull: the left one, in boss
// coordinates; the hull mirrors it for the right. It is a rose window round the eyespot (the spot part sits at EYE_AT, 120 x
// 106): sixteen spokes of lead run out from the spot's stone ring, cutting a ring of pointed-arch panes, jewel glass in
// the colours of the dawn going round (the same glass as the forewing, moth-kit.js pane), the margin a row of cusps with
// a fringe of glass scales, and a long glass tail (a swallowtail's) hanging from its lower edge. Toward the body the
// wing runs on under the thorax, so its panes there are long. The forewing lies over its top edge. The lights carry a
// bloom in each pane. Bake-time only.
import { line, rgba, bloom } from './kit.js';
import { came, pane, solder, rng, LEAD, ROSE, COBALT, AMBER, VIOLET, GREEN } from './moth-kit.js';
import { shard, streamer } from './moth-fur.js';
import { NV, veinPath } from './moth-wing-geo.js';

export const EYE_AT = [-200, 82];
const RIN = [62, 55]; // the spot's stone ring (the panes begin here): x and y radius
const N = 16;
const OFF = Math.PI / N; // a pane is centred straight down
const DEG = Math.PI / 180;
const REACH = [128, 122, 108, 94, 86, 82, 82, 84, 78, 74, 76, 82, 86, 88, 86, 82, 78, 74, 68, 72, 84, 98, 112, 124]; // the margin's radius every 15 degrees, from the body side round by the bottom (y down)
const GLASS = [COBALT, VIOLET, ROSE, AMBER, ROSE, VIOLET, COBALT, GREEN]; // one dark emerald pane, a small accent
const ARCH = [9, 13]; // the margin cusps' height: low toward the body, tall at the outside

const reach = (a) => {
  const u = ((((a / (15 * DEG)) % 24) + 24) % 24);
  const [i, f] = [Math.floor(u), u - Math.floor(u)];
  const s = f * f * (3 - 2 * f);
  return REACH[i] * (1 - s) + REACH[(i + 1) % 24] * s;
};
const at = (a, r) => [EYE_AT[0] + Math.cos(a) * r * (RIN[0] / 62), EYE_AT[1] + Math.sin(a) * r * (RIN[1] / 62)];
const inner = (a) => [EYE_AT[0] + Math.cos(a) * RIN[0], EYE_AT[1] + Math.sin(a) * RIN[1]];

// The margin point at angle a within pane k, u 0..1 across it: the lancet arch on the margin.
function edge(k, u) {
  const a = OFF + (k + u) * ((2 * Math.PI) / N);
  const h = ARCH[0] + (ARCH[1] - ARCH[0]) * (0.5 - 0.5 * Math.cos(a));
  const r = reach(a) + h * Math.max(0, 1 - Math.abs(2 * u - 1)) ** 0.7;
  return at(a, r);
}

function cell(g, k) {
  const a0 = OFF + k * ((2 * Math.PI) / N);
  g.beginPath();
  g.moveTo(...inner(a0));
  g.lineTo(...edge(k, 0));
  for (let s = 1; s <= 8; s++) g.lineTo(...edge(k, s / 8));
  const a1 = a0 + (2 * Math.PI) / N;
  g.lineTo(...inner(a1));
  for (let s = 6; s >= 0; s--) g.lineTo(...inner(a0 + ((a1 - a0) * s) / 6));
  g.closePath();
}

function mid(k) {
  const a = OFF + (k + 0.5) * ((2 * Math.PI) / N);
  const r = (62 + reach(a)) / 2;
  const [x, y] = at(a, r);
  return [x, y - 3, 0.55 * Math.hypot(reach(a) + ARCH[1] - 62, (2 * Math.PI * r) / N) + 5];
}

function tail(b) { // the swallowtail: two streamers of glass hanging from the lower margin
  for (const [dx, dy, a, len, w, c, bend] of [[-22, 64, 2.15, 44, 15, COBALT, -10], [-48, 58, 2.55, 34, 10, VIOLET, -7]]) {
    b.save();
    b.translate(EYE_AT[0] + dx, EYE_AT[1] + dy);
    b.rotate(a);
    streamer(b, len, w, c, bend);
    b.restore();
  }
}

function fringe(b) {
  const r = rng(61);
  for (let k = 0; k < N; k++) {
    const a = OFF + k * ((2 * Math.PI) / N);
    if (Math.sin(a) < -0.5) continue; // hidden under the forewing
    const [x, y] = edge(k, 0);
    b.save();
    b.translate(x, y);
    b.rotate(a + (r() - 0.5) * 0.25);
    b.translate(-3, 0);
    shard(b, 11 + r() * 6, 5.5, GLASS[(k + 3) % 8]);
    b.restore();
  }
}

// The shadow the forewing throws on the glass: soft strokes along its lower edge, inside the hindwing only.
function shadow(b) {
  b.save();
  b.beginPath();
  for (let k = 0; k < N; k++) for (let s = 0; s <= 8; s++) b[k + s ? 'lineTo' : 'moveTo'](...edge(k, s / 8));
  b.closePath();
  b.clip();
  b.translate(-245, -58 + 6);
  for (const [w, a] of [[30, 0.1], [20, 0.13], [11, 0.17]]) {
    b.beginPath();
    veinPath(b, NV - 1);
    line(b, rgba('#08021e', a), w);
  }
  b.restore();
}

export function hind(b, l) {
  tail(b);
  fringe(b);
  for (let k = 0; k < N; k++) {
    cell(b, k);
    b.fillStyle = LEAD;
    b.fill();
  }
  for (let k = 0; k < N; k++) {
    const a = OFF + (k + 0.5) * ((2 * Math.PI) / N);
    pane(b, () => cell(b, k), GLASS[k % 8], mid(k), 600 + k * 13, 0.6, a + Math.PI / 2);
  }
  came(b, () => { // the spokes and the margin's lead
    b.beginPath();
    for (let k = 0; k < N; k++) {
      b.moveTo(...inner(OFF + k * ((2 * Math.PI) / N)));
      b.lineTo(...edge(k, 0));
    }
  }, 3, 0.45);
  came(b, () => {
    b.beginPath();
    for (let k = 0; k < N; k++) for (let s = 0; s <= 8; s++) b[k + s ? 'lineTo' : 'moveTo'](...edge(k, s / 8));
    b.closePath();
  }, 4, 0.55);
  came(b, () => {
    b.beginPath();
    b.ellipse(EYE_AT[0], EYE_AT[1], RIN[0], RIN[1], 0, 0, 6.2832);
  }, 3.6, 0.45);
  shadow(b);
  for (let k = 0; k < N; k++) solder(b, ...edge(k, 0), 2.2);
  for (let k = 0; k < N; k++) {
    const a = OFF + (k + 0.5) * ((2 * Math.PI) / N);
    bloom(l, ...at(a, (62 + reach(a)) / 2), Math.max(26, reach(a) * 0.4), GLASS[k % 8], 0.2);
  }
  b.beginPath();
  for (let k = 0; k < N; k++) {
    const a = OFF + k * ((2 * Math.PI) / N);
    if (Math.sin(a) > 0.2) for (let s = 0; s <= 8; s++) b[s ? 'lineTo' : 'moveTo'](...edge(k, s / 8));
  }
  line(b, rgba('#ffd2ec', 0.35), 1);
}
