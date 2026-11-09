// The near layer of Lantern Deep: the reef. It lies behind the ship and the bullets, so it is dark and low
// in contrast, with its brightest and tallest things at the sides and in the upper half: the old stone gate on
// the left with its lanterns burning gold, a broken twin pier to the right, anemones, bunches of glowing tube
// worms, tufts of sea grass, brain coral, sponge tubes, urchins and rocks. The bottom of the layer is a
// bed of darkness, the middle of the screen's foot kept low and bare. What moves (anemone tentacles, grass,
// the worms' crowns) is marked here as signs and drawn in flourish-deep-sway.js. L.lamp is the lanterns'
// colour, L.glow the worms' teal. Pieces are in parallax-deep-reef-arch.js and -life.js, helpers in
// parallax-deep-kit-2.js; the mid layer and the far one are parallax-deep.js's. See parallax-shapes.js for the
// painter contract.
import { profile, waves } from './parallax-kit.js';
import { gate, pier } from './parallax-deep-reef-arch.js';
import { anemone, worms, sponges, urchin, grass, rock } from './parallax-deep-reef-life.js';
import { brain } from './parallax-deep-mid-growth.js';
import { spark, TEAL, VIOLET } from './parallax-deep-kit-2.js';

export const BED = 270; // the bed's mean y in the layer (the layer is 320 tall: its lower third starts at 213)

function reef(g, w, h, rng, L, out) {
  const wave = waves(rng, 3, 0.006);
  const floor = (x) => BED + 5 * wave(x);
  gate(g, out, rng, L, 440, floor(440), 122, 240);
  pier(g, out, rng, L, 1890, floor(1890), 44, 186);
  g.fillStyle = L.color;
  for (const [x, r] of [[160, 26], [700, 20], [1700, 28], [2120, 22]]) rock(g, rng, L, x, floor(x), r);
  brain(g, rng, L, 650, floor(650) + 3, 38);
  brain(g, rng, L, 1300, floor(1300) + 3, 30, VIOLET);
  sponges(g, rng, L, 790, floor(790), 5);
  sponges(g, rng, L, 1620, floor(1620), 4, VIOLET);
  g.fillStyle = L.color; // the bed
  profile(g, w, h, floor);
  for (const [x, r, k] of [[215, 34, 0], [730, 30, 1], [1790, 36, 2], [2060, 32, 0]]) anemone(g, out, rng, L, x, floor(x), r, k);
  for (const [x, n, spread, k] of [[110, 3, 44, 0], [1420, 3, 44, 1], [1990, 2, 30, 2]]) worms(g, out, rng, L, x, floor(x), n, spread, k);
  for (const [x, hh, k] of [[130, 68, 0], [570, 60, 1], [880, 52, 0], [1010, 70, 1], [1150, 58, 0], [1250, 48, 1], [1470, 74, 0], [1780, 64, 1], [1950, 62, 0], [2160, 58, 1]]) grass(out, rng, x, floor(x), hh, k);
  for (const x of [915, 1190, 1380]) urchin(g, rng, L, x, floor(x), 8 + rng() * 3);
  for (let i = 0; i < 9; i++) { // sparks of small living things, small and cool
    const x = 120 + rng() * 2040;
    spark(g, out, rng, x, floor(x) - 10 - rng() * 70, rng() < 0.7 ? TEAL : VIOLET, 8 + rng() * 4, 0.2 + rng() * 0.1, rng() < 0.3 ? 'blink' : 'pulse');
  }
  g.fillStyle = L.color;
}

export const REEF = { reef };
