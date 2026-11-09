// What grows back on World 17's near layer (the 'over' pass, faded in by stage(h, 'green')): the park behind the railings
// turns to lawn (a green that darkens toward the foot, uneven blades along its top, clover and a few small flowers, low
// shrubs with blossom), and the railings and piers are drawn again over it, so the lawn lies behind the bars; then, in front,
// a bed of low shrubs and flowers along the plinth, tufts of grass pushing up through the cracks of the paving and along
// the kerb and round the bench and the bollards, ivy up the fence, the pier and the lamp stump, and the leaves of the sapling in
// its tree pit. Flowers are tiny and muted (cream, soft yellow, pale blue); the greens are darker low in the frame (the shade of
// the lower floors) so the bullets stay readable.
import { fade, seeded, strokes } from './parallax-smog-kit.js';
import { rgba } from './sprites.js';
import { LEAF, shrub, ivyPatch, flowers, crown } from './parallax-smog-mid-leaves.js';
import { Y, FENCE, SECTIONS, STUMP, BENCH, BOLLARDS } from './parallax-smog-near-plan.js';
import { fence } from './parallax-smog-near-fence.js';
import { SAPLING } from './parallax-smog-near-props.js';
import { CRACKS, gatePath } from './parallax-smog-near-ground.js';

// n blades of grass from (x, y), h tall, leaning a little, in the lawn's greens.
function tuft(g, r, x, y, h, n = 4) {
  const blades = [[], [], []];
  for (let i = 0; i < n; i++) blades[i % 3].push([x + (i - n / 2) * 1.6, y, x + (i - n / 2) * 2.6 + (r() - 0.5) * 5, y - h * (0.6 + r() * 0.5)]);
  [LEAF.dark, LEAF.mid, LEAF.lit].forEach((c, k) => strokes(g, c, 1.3, blades[k]));
}

function lawn(g, r, w) {
  fade(g, 0, Y.soil - 6, w, Y.pave - Y.soil + 6, [[0, '#3a7440'], [0.4, '#2d5a35'], [1, '#18331f']]);
  for (let x = 0; x < w; x += 5 + r() * 6) tuft(g, r, x, Y.soil - 2 + r() * 8, 6 + r() * 9, 3);
  for (let x = 20; x < w; x += 60 + r() * 70) shrub(g, r, x, Y.soil + 16, 36 + r() * 30, 22 + r() * 20);
  flowers(g, r, 0, Y.soil + 4, w, 24, 120);
  for (let i = 0; i < 60; i++) { // clover
    g.fillStyle = rgba(LEAF.lit, 0.7);
    g.fillRect(r() * w, Y.soil + 6 + r() * 20, 3, 2);
  }
}

export function nearGreen(g, P, w) {
  const r = seeded(404);
  g.save();
  lawn(g, r, w);
  fade(g, 0, Y.soil - 14, w, Y.pave - Y.soil + 14, [[0, rgba('#0c2014', 0.1)], [1, rgba('#0c2014', 0.42)]]); // the park lies in the shade of the fence's lee
  gatePath(g, P); // the path through the gate keeps its flags
  fence(g, P, seeded(1)); // the railings over the lawn: the same bars the base layer stands on
  for (const [a, b] of SECTIONS) {
    if (r() < 0.6) ivyPatch(g, r, a + r() * (b - a - 80), FENCE.top + 16, 60 + r() * 30, FENCE.base - FENCE.top - 14);
  }
  for (let x = 30; x < w; x += 46 + r() * 50) { // the bed along the plinth
    shrub(g, r, x, Y.pave + 3, 26 + r() * 18, 12 + r() * 9);
    flowers(g, r, x, Y.pave - 16, 30, 14, 3);
  }
  for (const seg of CRACKS) for (const [x, y] of seg.filter((_, k) => k % 2 === 0)) tuft(g, r, x, y + 1, 5 + r() * 5, 3);
  for (let x = 6; x < w; x += 18 + r() * 40) tuft(g, r, x, Y.kerb + 1, 4 + r() * 4, 3);
  for (const x of [BENCH.x - 56, BENCH.x + 54, ...BOLLARDS.map((b) => b.x + 8), STUMP.x + 12]) tuft(g, r, x, STUMP.base + 1, 9 + r() * 5, 5);
  ivyPatch(g, r, STUMP.x - 8, STUMP.base - 70, 16, 62);
  crown(g, SAPLING, 0.55);
  g.globalCompositeOperation = 'source-atop'; // the lower floors' shade: calm behind the player's zone
  fade(g, 0, Y.pave, w, 130, [[0, rgba(P.joint, 0)], [1, rgba(P.joint, 0.28)]]);
  g.restore();
}
