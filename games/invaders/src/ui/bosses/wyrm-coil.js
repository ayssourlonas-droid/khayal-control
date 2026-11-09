// The Crystal Wyrm's coils (World 11, Aurora Kingdom; see wyrm.js): the lower half of each great loop of
// its body, armoured in plates of ice with a crystal on every other one, sinking into the glacier where
// it meets it. Drawn once, as the left one, and mirrored for the right (bosses/bake.js). The loop's
// centre, in this part's frame, is LOOP shifted by the part's own offset.
import { path, ink, lin, rgba, shade, neon } from './kit.js';
import { mix } from '../sprites.js';
import { LOOP } from './wyrm-body.js';
import { surface } from './wyrm-ice.js';

const AT = [LOOP.x + 270, LOOP.y - 90]; // the loop's centre in the part's frame: the part sits at (-270, 90)
const ring = (d, a) => [AT[0] + Math.cos(a) * (LOOP.rx + d), AT[1] + Math.sin(a) * (LOOP.ry + d)];

export function coil(b, l, p, S) {
  const base = mix(S.pal.plate, '#2a62b8', 0.35);
  b.save();
  b.beginPath(); // everything above the glacier's surface, and no lower: the loop goes into the ice
  b.moveTo(-90, -70);
  for (let x = -90; x <= 90; x += 4) b.lineTo(x, surface(x - 270) - 90 + 7);
  b.lineTo(90, -70);
  b.closePath();
  b.clip();
  for (let i = 0; i < 11; i++) { // plates across the loop, each a little arched, the next overlapping it
    const a = 0.05 + i * 0.285;
    const [a0, a1] = [a - 0.17, a + 0.17];
    const quad = [ring(-23, a0), ring(23, a0 + 0.05), ring(24, a1), ring(-22, a1 - 0.05)];
    path(b, quad);
    ink(b, lin(b, 0, -60, 0, 20, [[0, shade(base, 0.6 - (i % 3) * 0.08)], [0.5, shade(base, 0.12)], [1, shade(base, -0.45)]]), 2.2);
    path(b, [ring(-17, a0 + 0.06), ring(18, a0 + 0.08)], true);
    b.strokeStyle = rgba('#ffffff', 0.6);
    b.lineWidth = 1.4;
    b.stroke();
    path(b, [ring(-13, a - 0.02), ring(14, a - 0.01)], true);
    b.strokeStyle = rgba('#06304a', 0.4);
    b.lineWidth = 1;
    b.stroke();
    if (i % 3 === 1) { // a crystal on the outer rim
      const [x, y] = ring(24, a);
      const [dx, dy] = [Math.cos(a), Math.sin(a)];
      path(b, [[x - dy * 6, y + dx * 6], [x + dx * 21, y + dy * 21], [x + dy * 6, y - dx * 6]]);
      ink(b, shade(base, 0.65), 1.8);
    }
  }
  b.restore();
  for (let i = 0; i < 7; i++) { // seams of cold light between the plates
    const a = 0.2 + i * 0.4;
    path(l, [ring(-20, a), ring(20, a)], true);
    neon(l, S.pal.weak, 0.7, 0.28);
  }
}
