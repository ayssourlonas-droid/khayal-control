// World 15, Lantern Deep, soft frills: the lantern jellyfish's trailing parts (see w15.js for the bell): the pose
// of the bell on each beat, the curtain of thin tentacles hung from its rim, each with a bead of light at its
// tip, and the four frilled oral arms under it. Relaxed, the bell is wide and the strands splay and wave;
// contracted, it is narrow and tall and everything streams straight back, longer and closer together. Then the
// pufferfish's frills and spikes (see w15-3.js): its frilled fins and tail, and the spines, on its rim and
// studded over its face, that stand out as it swells.
import { bez, strand, thread, bead, spark, spike, path, lin, rad, rgba, shade, mix, line, hash, TAU, PALE, VIOLET, AQUA, ABYSS, INK, SOFT } from './w15-kit.js';

// The bell's shape on each beat: W half width at its fullest, lip half width at the lip (the contracted bell is
// cinched in at the lip), top the crown's y, rim the lip's y at the middle, sag how much
// the lip hangs lower in the middle, spread where the strands' ends go (x of the root times it), reach how
// far they hang below the lip, sway how hard they curve, thick the thread width.
export const POSE = [
  { W: 27, lip: 30, top: -27, rim: 2, sag: 3, spread: 1.2, reach: 34, sway: 5, thick: 1.25 },
  { W: 23, lip: 17, top: -32, rim: 4, sag: 2.5, spread: 0.55, reach: 35, sway: 1.8, thick: 1.05 },
];
export const LOBES = 9; // scallops in the lip, and a thread hung from each
export const rimY = (P, x) => P.rim + P.sag * (1 - (x / P.lip) ** 2);
export const lobeX = (P, k) => -P.lip + ((k + 0.5) * 2 * P.lip) / LOBES;

// The curtain: a thread from every scallop, lengths varying, ends tipped with a glass bead; every other bead
// is lit and they swap on the next beat, so the curtain seems to twinkle.
export function curtain(b, l, f, c) {
  const P = POSE[f];
  const col = shade(mix(c, VIOLET, 0.3), 0.18);
  for (let k = 0; k < LOBES; k++) {
    const x0 = lobeX(P, k);
    const y0 = rimY(P, x0) + 1;
    const L = P.reach - 5 * hash(k + 40) - Math.abs(x0) * 0.1;
    const s = k % 2 ? 1 : -1;
    const ex = x0 * P.spread + s * P.sway * 0.5;
    const pts = bez([x0, y0], [x0 + s * P.sway, y0 + L * 0.34], [ex - s * P.sway * 1.2, y0 + L * 0.7], [ex, y0 + L]);
    const wave = pts.map(([x, y], i) => [x + Math.sin(i * 0.8 + k * 1.7) * P.sway * 0.45 * (i / 16), y]);
    thread(b, wave, P.thick, col);
    const [tx, ty] = wave[wave.length - 1];
    bead(b, l, tx, ty, 1.5, PALE, (k + f) % 2 ? 0.3 : 0.85);
  }
}

// The four oral arms, outer pair first: ribbons of gauze with ruffled edges, a pale rib down each, fading
// from rosy violet at the root to deep indigo at the tips.
export function arms(b, f, c) {
  const P = POSE[f];
  const top = mix('#d08aff', c, 0.22);
  const deep = mix('#4a2aa0', c, 0.12);
  [-9, 9, -3.6, 3.6].forEach((x0, i) => {
    const s = i % 2 ? 1 : -1;
    const y0 = P.rim - 4;
    const ex = x0 * (f ? 0.9 : 2.2) - (f ? 0 : s * 1.5);
    const ey = f ? 41 : 38;
    const pts = bez([x0, y0], [x0 + s * (f ? 2 : 8), y0 + 14], [ex - s * (f ? 3 : 7), ey - 12], [ex, ey], 30);
    strand(b, pts, i < 2 ? 7.4 : 6.2, 1.4, lin(b, 0, y0, 0, ey, [[0, shade(top, 0.2)], [0.45, top], [1, deep]]), 1.5, 'rgba(255,255,255,0.5)', 0.34, 1.1, i, SOFT);
  });
}

// A fan from the pivot (x, y), swept from angle a0 to a1 (screen angles, 0 to the right, negative up), r long,
// its rim frilled into n scallops.
function fan(g, x, y, a0, a1, r, n = 6) {
  const at = (a, k) => [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(...at(a0, 1));
  for (let j = 1; j <= n; j++) {
    const a = a0 + ((a1 - a0) * j) / n;
    g.quadraticCurveTo(...at(a - (a1 - a0) / (2 * n), 1.16), ...at(a, 1));
  }
  g.closePath();
}

function frilled(b, a0, a1, r, col, rays) {
  fan(b, 0, 0, a0, a1, r);
  b.fillStyle = rad(b, 0, 0, 1, r * 1.15, [[0, shade(col, -0.5)], [0.55, col], [1, shade(col, 0.55)]]);
  b.fill();
  b.save();
  fan(b, 0, 0, a0, a1, r);
  b.clip();
  for (let j = 1; j < rays; j++) { // the rays of the fin
    const a = a0 + ((a1 - a0) * j) / rays;
    path(b, [[0, 0], [Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2]], true);
    line(b, rgba('#ffffff', 0.38), 0.7);
  }
  b.restore();
  fan(b, 0, 0, a0, a1, r);
  line(b, INK, 1.8);
}

// The pectoral fins on the body's sides: raised on beat 0, swept down and out on beat 1.
export function pectoral(b, f, cy, rx, c) {
  for (const m of [-1, 1]) {
    b.save();
    b.translate(m * (rx - 4), cy + 3);
    b.scale(m, 1);
    frilled(b, f ? -0.5 : -1.55, f ? 0.75 : -0.25, f ? 15 : 12.5, mix(c, AQUA, 0.35), 6);
    b.restore();
  }
}

// The tail fin, a frilled fan peeking over the top of the body (the fish dives tail up), splayed wider on beat 1.
export function tail(b, f, cy, ry, c) {
  b.save();
  b.translate(0, cy - ry + 3);
  frilled(b, f ? -2.5 : -2.2, f ? -0.64 : -0.94, f ? 14 : 12, mix(c, AQUA, 0.2), 6);
  b.restore();
}

// The ring of spines round the body, short and few on beat 0, long on beat 1 with every other tip lit.
export function spines(b, l, f, cy, rx, ry, c) {
  const len = f ? 10 : 5.2;
  for (let k = 0; k < 20; k++) {
    const a = ((k + 0.5) * TAU) / 20;
    const [x, y] = [Math.cos(a) * (rx - 1), cy + Math.sin(a) * (ry - 1)];
    const L = len * (0.85 + 0.3 * hash(k + 70));
    spike(b, x, y, a, L, 2.2, '#f2ffcf');
    if (f && k % 2) spark(l, x + Math.cos(a) * L, y + Math.sin(a) * L, 0.7, shade(c, 0.5), 0.5);
  }
}

// Short studs over the face, in two rings, tilted outward like the spines at the rim.
export function studs(b, f, cy, rx, ry) {
  for (const [k0, n, off] of [[0.52, 9, 0], [0.8, 14, 0.5]]) {
    for (let i = 0; i < n; i++) {
      const a = ((i + off) * TAU) / n;
      const [x, y, L] = [Math.cos(a) * rx * k0, cy + Math.sin(a) * ry * k0, f ? 3.6 : 2.4];
      path(b, [[x - Math.sin(a) * 1.2, y + Math.cos(a) * 1.2], [x + Math.cos(a) * L, y + Math.sin(a) * L], [x + Math.sin(a) * 1.2, y - Math.cos(a) * 1.2]]);
      b.fillStyle = rgba('#f6ffd8', 0.95);
      b.fill();
      line(b, rgba(ABYSS, 0.4), 0.6);
    }
  }
}
