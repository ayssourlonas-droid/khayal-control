// World 15, Lantern Deep, the darting squid's fins, eyes and limbs (see w15-2.js for the mantle and head). The
// two flap fins are out on beat 0 and folded back along the mantle on beat 1; the eyes are huge, a gold and
// teal iris round a slit pupil under a scowling lid, ringed with a faint teal light; six short arms bundle into
// a point and two long feeding tentacles end in suckered clubs: on beat 1 everything streams into a dart, on
// beat 0 the arms fan out and the tentacles trail back along the sides, clubs up.
import { path, ink, lin, rad, rgba, shade, mix, bloom, line, circle, ellipse, strand, knob, bez, spark, TAU, GOLD, AQUA, PALE, ROSE, ABYSS, INK, SOFT } from './w15-kit.js';

// A fin's outline on the right (x > 0): the leading edge from the mantle's top out to the tip, then the
// trailing edge back in to the mantle. Beat 0 out, beat 1 folded.
const FIN = [
  [[7, -42], [14, -43], [25, -36], [26, -27], [26, -21], [18, -14], [10, -11]],
  [[7, -42], [11, -41], [16, -35], [16.5, -29], [16, -23], [13.5, -16], [10, -11]],
];
const edge = ([a, c1, c2, tip, c3, c4, end]) => [...bez(a, c1, c2, tip, 10), ...bez(tip, c3, c4, end, 10).slice(1)];

export function fins(b, l, f, c) {
  const e = edge(FIN[f]);
  const deep = mix(c, '#1a0c50', 0.5);
  for (const m of [-1, 1]) {
    b.save();
    b.scale(m, 1);
    path(b, e);
    b.fillStyle = lin(b, 8, 0, 27, 0, [[0, deep], [0.5, shade(c, -0.1)], [1, mix(c, ROSE, 0.5)]]);
    b.fill();
    b.save();
    path(b, e);
    b.clip();
    for (let i = 1; i < 10; i++) { // the fin rays fan out from the mantle
      const [x, y] = e[Math.round((i * (e.length - 1)) / 10)];
      path(b, [[9, -27], [x, y]], true);
      line(b, rgba(ABYSS, 0.3), 1.4);
      path(b, [[9, -27], [x, y]], true);
      line(b, rgba('#ffffff', 0.26), 0.6);
    }
    path(b, e, true);
    line(b, rgba(shade(c, 0.6), 0.65), 2.4); // the pale edge of the fin
    b.restore();
    path(b, e);
    line(b, INK, 2.2);
    b.restore();
    path(l, e.map(([x, y]) => [x * m, y]), true);
    line(l, rgba(AQUA, f ? 0.1 : 0.18), 1); // the edge of a fin glints faintly
    spark(l, m * e[10][0], e[10][1], 0.8, PALE, f ? 0.3 : 0.55);
  }
}

// One eye: a dark fleshy socket, a gold iris going teal at its rim, a vertical slit pupil, a glint, and a lid
// slanted into a scowl. The ring of light round the iris is on the lights layer.
function eyeAt(b, l, x, y, m, f, c) {
  const [R, r] = [8, 6.3];
  circle(b, x, y, R);
  ink(b, lin(b, x - R, y - R, x + R, y + R, [[0, shade(c, -0.35)], [1, shade(c, -0.8)]]), 2.2);
  circle(b, x, y, r);
  b.fillStyle = rad(b, x, y, 0, r, [[0, '#fff2c0'], [0.34, GOLD], [0.7, '#7fe4c0'], [1, '#17a8a0']], x - 1, y - 1);
  b.fill();
  for (let i = 0; i < 16; i++) { // streaks in the iris
    const a = (i * TAU) / 16;
    path(b, [[x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]], true);
    line(b, rgba('#1a6a60', 0.3), 0.7);
  }
  circle(b, x, y, r);
  line(b, rgba(ABYSS, 0.85), 1);
  ellipse(b, x, y + 0.6, f ? 1.2 : 2, 5.3, m * 0.12);
  b.fillStyle = '#02040c';
  b.fill();
  b.save();
  circle(b, x, y, R - 0.8);
  b.clip();
  const [lo, hi] = [y - R * 0.15, y - R * 0.6]; // the lid: low on the side toward the middle
  path(b, [[x - R, y - R], [x + R, y - R], [x + R, m > 0 ? hi : lo], [x - R, m > 0 ? lo : hi]]);
  b.fillStyle = lin(b, 0, y - R, 0, y, [[0, shade(c, -0.7)], [1, shade(c, -0.35)]]);
  b.fill();
  path(b, [[x - R, m > 0 ? lo : hi], [x + R, m > 0 ? hi : lo]], true);
  line(b, rgba(shade(c, 0.5), 0.6), 1);
  b.restore();
  ellipse(b, x - 2.4, y - 1.4, 1.5, 1.1, -0.5);
  b.fillStyle = 'rgba(255,255,255,0.9)';
  b.fill();
  circle(b, x + 2, y + 2.6, 0.7);
  b.fill();
  circle(l, x, y, r);
  line(l, rgba(AQUA, 0.5 + f * 0.1), 1.5);
  bloom(l, x, y, 13, AQUA, 0.26 + f * 0.06);
}

export function eyes(b, l, f, c) {
  for (const m of [-1, 1]) eyeAt(b, l, m * 13.5, 13, m, f, c);
}

// A club of the feeding tentacle: a swollen oval along the strand's end, three suckers on it, a tiny spark.
function club(b, l, p, q, c) {
  const a = Math.atan2(p[1] - q[1], p[0] - q[0]);
  const [x, y] = [p[0] + Math.cos(a) * 2.6, p[1] + Math.sin(a) * 2.6];
  knob(b, x, y, 4.2, 2.5, a, lin(b, x - 3, y - 3, x + 3, y + 3, [[0, shade(c, 0.35)], [1, shade(c, -0.35)]]));
  for (const k of [-1.6, 0, 1.6]) {
    circle(b, x + Math.cos(a) * k, y + Math.sin(a) * k, 0.65);
    b.fillStyle = rgba('#ffd0f0', 0.85);
    b.fill();
  }
  spark(l, x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2, 0.9, PALE, 0.7);
}

// The two long tentacles, then the six short arms in front of them.
export function limbs(b, l, f, c) {
  const skin = lin(b, 0, 18, 0, 40, [[0, shade(c, 0.15)], [1, mix(c, '#1a0c50', 0.4)]]);
  for (const m of [-1, 1]) {
    const pts = (f
      ? bez([m * 2.8, 21], [m * 3.6, 27], [m * 1.6, 32], [m * 2.4, 37], 14)
      : bez([m * 3, 21], [m * 20, 31], [m * 34, 20], [m * 29, 5], 18));
    strand(b, pts, 3.4, 2, skin, 1.5, null, 0, 1.3, 0, SOFT);
    club(b, l, pts[pts.length - 1], pts[pts.length - 2], c);
  }
  (f ? [-1.6, 1.6, -0.55, 0.55] : [-2.5, 2.5, -1.5, 1.5, -0.5, 0.5]).forEach((k) => {
    const end = f ? [k * 1.3, 34 - Math.abs(k) * 0.8] : [k * 7.4, 30 + Math.abs(k) * 0.8];
    const pts = f ? bez([k * 3.9, 20], [k * 4.2, 25], [k * 1.6, 29], end, 10) : bez([k * 3.4, 20], [k * 4.6, 25], [k * 8.2, 25], end, 10);
    strand(b, pts, f ? 6.4 : 4.8, 1, skin, 1.2, null, 0, 1.3, 0, SOFT);
    for (const i of [3, 5, 7]) { // suckers along the arm
      circle(b, pts[i][0], pts[i][1], 0.55);
      b.fillStyle = rgba('#ffd0f0', 0.7);
      b.fill();
    }
  });
}
