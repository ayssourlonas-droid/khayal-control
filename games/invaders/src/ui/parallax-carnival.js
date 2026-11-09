// The far layer of Ember Carnival: the far shore across the lake. Two ridges of dark hills, the nearer one
// edged by the fair's glow, a roller coaster outlined in light on the right and a drop tower on the left (both
// in parallax-carnival-coaster.js), little tents and lit windows at the foot of the hills with a string of
// bulbs along the waterline, and below them the lake with all of it reflected (parallax-carnival-lake.js).
// The mid layer (parallax-carnival-mid.js) and the near one (parallax-carnival-booths.js) are registered
// with this one. See parallax-shapes.js for the painter contract. L.lamp is the windows' colour, L.track the
// coaster's.
import { rgba, mix } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { PARTY, GOLD, BULB, SHORE, poly, flag, uplight, bulbRow } from './parallax-carnival-kit.js';
import { coaster, dropTower } from './parallax-carnival-coaster.js';
import { lake } from './parallax-carnival-lake.js';
import { MID } from './parallax-carnival-mid.js';
import { BOOTHS } from './parallax-carnival-booths.js';

// A little tent on the shore at (x, SHORE - 8), lit from inside and under, a pennant on its peak.
function tent(g, out, rng, L, x, wd, ht, spots) {
  const y = SHORE - 8;
  const build = (c, ox = 0, oy = 0) => poly(c, [[x - wd / 2 + ox, y + oy], [x + ox, y - ht + oy], [x + wd / 2 + ox, y + oy]]);
  g.fillStyle = L.color;
  build(g);
  g.fill();
  uplight(g, build, y - ht, y, GOLD, 0.32);
  g.fillStyle = rgba(L.lamp, 0.95);
  g.fillRect(x - 2, y - 7, 4, 7);
  out.lights.push({ x, y: y - 3, r: 22, color: L.lamp, mode: rng() < 0.4 ? 'flicker' : 'steady', ph: rng(), a: 0.7 });
  flag(out, x, y - ht, 11, 6, rng() < 0.5 ? 1 : -1, PARTY[Math.floor(rng() * PARTY.length)]);
  spots.push([x, L.lamp, 0.8]);
}

function farshore(g, w, h, rng, L, out) {
  const [hill, back] = [waves(rng, 3, 0.0042), waves(rng, 3, 0.0031)];
  g.fillStyle = mix(L.color, '#5a2a8a', 0.3); // the farther ridge, paler in the haze
  profile(g, w, h, (x) => 205 + 46 * back(x));
  coaster(g, out, rng, L);
  dropTower(g, out, rng, L, 330);
  g.fillStyle = L.color;
  profile(g, w, h, (x) => (x > 1050 ? 262 + 8 * hill(x) : 248 + 36 * hill(x)));
  const spots = [];
  for (let x = 70; x < 1040; x += 60 + rng() * 120) tent(g, out, rng, L, x, 26 + rng() * 32, 16 + rng() * 24, spots);
  for (let i = 0; i < 90; i++) { // windows of the town behind the tents
    const [x, y] = [40 + rng() * 1000, 262 + rng() * 26];
    g.fillStyle = rgba(rng() < 0.7 ? L.lamp : PARTY[i % PARTY.length], 0.7 + rng() * 0.3);
    g.fillRect(x, y, 2.2, 2.2);
  }
  bulbRow(g, out, 30, SHORE - 3, 1060, SHORE - 3, 62, 1.7, PARTY.concat(BULB), { sag: 6, mode: 'blink', every: 5 });
  for (let i = 0; i < 12; i++) spots.push([60 + i * 90, PARTY[i % PARTY.length], 0.7]);
  for (const x of [1290, 1560, 1760, 1950]) spots.push([x, L.track, 0.55]); // the coaster's humps
  lake(g, w, h, rng, out, spots);
  g.fillStyle = L.color;
}

export const CARNIVAL = { farshore, ...MID, ...BOOTHS };
