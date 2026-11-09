// World 15, Lantern Deep, the armoured one (see w15.js): a hermit crab that has moved into an old diving
// helmet. A big spiral shell stands up behind it, the brass helmet sits on its wide rose carapace with the
// crab looking out of the porthole, two heavy claws trade places (one high and open, one lowered and shut)
// and six legs step in two groups. It is the only one that cracks; the helmet is the big opaque dome the
// cracks run across. The shell is in w15-whelk.js, the helmet in w15-8.js, claws and legs in w15-claw.js.
import { ink, rad, rgba, shade, bloom, ellipse, circle, line } from './w15-kit-2.js';
import { hash } from '../sprites.js';
import { whelk } from './w15-whelk.js';
import { helmet } from './w15-8.js';
import { claws, legs } from './w15-claw.js';

// The crab's wide carapace behind the helmet's foot: flesh-coloured, pitted, with the mouthparts under the
// breastplate.
function carapace(b, c) {
  ellipse(b, 0, 16, 28, 11);
  ink(b, rad(b, 0, 16, 2, 30, [[0, shade(c, 0.5)], [0.45, c], [1, shade(c, -0.62)]], -8, 8), 3);
  b.save();
  ellipse(b, 0, 16, 28, 11);
  b.clip();
  for (let i = 0; i < 30; i++) { // pits and pale beads over the shell of the back
    const [x, y] = [(hash(i * 3 + 1) - 0.5) * 56, 6 + hash(i * 3 + 2) * 20];
    circle(b, x, y, 0.7 + hash(i * 3 + 3) * 0.8);
    b.fillStyle = i % 3 ? rgba(shade(c, -0.7), 0.35) : rgba(shade(c, 0.6), 0.5);
    b.fill();
  }
  b.beginPath();
  b.ellipse(0, 16, 24, 8.4, 0, 0.2, 2.94);
  line(b, rgba(shade(c, -0.7), 0.4), 1);
  b.restore();
  for (const m of [-1, 1]) { // the mouthparts, small and busy
    ellipse(b, m * 3.4, 26, 3.2, 2);
    ink(b, shade(c, -0.25), 1.1);
  }
}

// A hermit crab in a diving helmet: shell, legs, carapace, claws, then the helmet over them.
export function armored(b, l, f, c) {
  whelk(b, l, f);
  legs(b, f, c);
  carapace(b, c);
  claws(b, f, c);
  helmet(b, l, f, c);
  bloom(l, 0, 6, 42, c, 0.09 + f * 0.03);
}
