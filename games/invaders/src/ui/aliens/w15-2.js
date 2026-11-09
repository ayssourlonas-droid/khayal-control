// World 15, Lantern Deep, the darting squid (see w15.js): a torpedo of a mantle in deep violet with two flap
// fins, a huge-eyed head, a siphon and a point of arms with two long feeding tentacles, dived head first at the
// ship. Its skin is covered in chromatophores that change colour: scattered rosy and teal flecks on beat 0,
// two lines of spots and dark bars on beat 1. Fins, eyes and limbs are in w15-7.js.
import { fins, eyes, limbs } from './w15-7.js';
import { path, ink, lin, rgba, shade, bloom, gloss, line, ellipse, spark, freckles, ROSE, AQUA, PALE, ABYSS, INK, SOFT } from './w15-kit.js';

const TIP = -43; // y of the mantle's tail

function mantle(g) {
  g.beginPath();
  g.moveTo(0, TIP);
  g.bezierCurveTo(8, -36, 13.6, -24, 13.6, -8);
  g.bezierCurveTo(13.6, -2, 12.6, 2.5, 11.4, 5);
  g.quadraticCurveTo(0, 9, -11.4, 5);
  g.bezierCurveTo(-12.6, 2.5, -13.6, -2, -13.6, -8);
  g.bezierCurveTo(-13.6, -24, -8, -36, 0, TIP);
  g.closePath();
}

// The colour pattern of the skin on each beat, painted inside the mantle's clip.
function pattern(b, f, c) {
  if (!f) {
    freckles(b, 30, 3, 0, -20, 11, 22, [ROSE, shade(c, -0.6), AQUA, '#ffd0f0'], 0.7, 2, 0.75);
    freckles(b, 14, 8, 0, -30, 7, 12, [PALE], 0.4, 0.8, 0.7);
    return;
  }
  for (const y of [-32, -19, -6]) { // dark bars
    path(b, [[-14, y - 2], [14, y - 2], [14, y + 2], [-14, y + 2]]);
    b.fillStyle = rgba(ABYSS, 0.34);
    b.fill();
  }
  for (const m of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      ellipse(b, m * 4.6, -36 + i * 5.2, 1.5 - i * 0.05, 1.5);
      b.fillStyle = rgba(i % 2 ? AQUA : ROSE, 0.85);
      b.fill();
    }
  }
}

// Two rows of photophores down the mantle's sides, alternate beads lit and swapping on the next beat.
function photophores(b, l, f, c) {
  [-26, -19, -12, -5, 1].forEach((y, i) => {
    for (const m of [-1, 1]) {
      const on = (i + f) % 2 === 0;
      ellipse(b, m * 8.3, y, 0.95, 0.95);
      b.fillStyle = on ? shade(AQUA, 0.2) : rgba(shade(c, -0.5), 0.8);
      b.fill();
      if (on) spark(l, m * 8.3, y, 0.55, AQUA, 0.7);
    }
  });
}

// The head under the mantle's lip, with its siphon, a little funnel between the eyes.
function head(b, c) {
  ellipse(b, 0, 14.5, 12.6, 10);
  ink(b, lin(b, 0, 5, 0, 24, [[0, shade(c, -0.05)], [1, shade(c, -0.55)]]), 2);
  freckles(b, 10, 31, 0, 15, 8, 6, [shade(c, 0.5), ROSE], 0.4, 0.8, 0.6);
  path(b, [[-4.4, 14], [1.8, 14], [0.8, 20.5], [-3.4, 20.5]]);
  g2(b, lin(b, -4, 0, 2, 0, [[0, shade(c, 0.3)], [1, shade(c, -0.45)]]));
  ellipse(b, -1.3, 20.5, 2.1, 0.9);
  b.fillStyle = '#1a0c40';
  b.fill();
  line(b, SOFT, 1);
}
const g2 = (b, fill) => {
  b.fillStyle = fill;
  b.fill();
  line(b, SOFT, 1.3);
};

// A darting squid: fins out and tentacles trailing on beat 0, fins folded and everything streamlined on beat 1.
export function diver(b, l, f, c) {
  fins(b, l, f, c);
  limbs(b, l, f, c);
  head(b, c);
  mantle(b);
  b.fillStyle = lin(b, -14, 0, 14, 0, [[0, shade(c, -0.6)], [0.3, shade(c, -0.05)], [0.45, shade(c, 0.28)], [0.75, shade(c, -0.35)], [1, shade(c, -0.72)]]);
  b.fill();
  line(b, INK, 2.8);
  b.save();
  mantle(b);
  b.clip();
  b.fillStyle = lin(b, 0, TIP, 0, 8, [[0, rgba(ABYSS, 0.6)], [0.55, rgba(ABYSS, 0)], [1, rgba('#ffffff', 0.16)]]); // darker at the tail
  b.fillRect(-15, TIP - 1, 30, 54);
  for (const y of [-34, -24, -14, -4]) { // skin folds
    b.beginPath();
    b.ellipse(0, y, 14, 3, 0, 0.1, Math.PI - 0.1);
    line(b, rgba(ABYSS, 0.16), 1.2);
  }
  mantle(b); // rim light down the right-hand edge, cool from the deep's own glow
  line(b, lin(b, -14, 0, 14, 0, [[0, rgba(AQUA, 0)], [0.55, rgba(AQUA, 0)], [1, rgba(AQUA, 0.6)]]), 4);
  path(b, [[0, TIP + 2], [0, 6]], true); // the dorsal ridge
  line(b, rgba('#ffffff', 0.12), 3);
  freckles(b, 44, 21, 0, -20, 12, 22, [shade(c, 0.55), AQUA], 0.25, 0.55, 0.5); // fine iridescent flecks
  pattern(b, f, c);
  b.beginPath(); // the pale lip of the mantle
  b.moveTo(-12.5, 3.5);
  b.quadraticCurveTo(0, 7.2, 12.5, 3.5);
  line(b, rgba(shade(c, 0.5), 0.85), 3.2);
  b.restore();
  gloss(b, -6.4, -22, 1.9, 14, 0.5, 0.12);
  gloss(b, 7.4, -26, 1, 6, 0.28, -0.1);
  photophores(b, l, f, c);
  eyes(b, l, f, c);
  bloom(l, 0, -18, 26, c, 0.1);
}
