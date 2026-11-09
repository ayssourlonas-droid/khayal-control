// The far layer of Lantern Deep: the drowned kingdom seen across dark water. Three ridges of seabed slope, the
// farthest paler in the haze, with a skyline of slim spires on it; on the middle ridge the kingdom proper
// (towers under cone and onion roofs, the cathedral palace with its rose window, a collapsed bridge); on the
// nearest the broken great hall, an aqueduct marching down the slope on its arches, and the giant whale's
// skeleton lying across it. All of it crusted with coral and furred with sea growth; a few windows are
// still lit in warm gold or teal, there are teal glows in the arches and lights in the whale's eye socket,
// all small and dim: it is far away and nothing here may outshine a bullet. Files: parallax-deep-kit.js (shared
// shapes), -ridge, -towers, -hall, -span (aqueduct and bridge), -palace and -nave, -whale. The mid layer
// (parallax-deep-mid.js) and the near one (parallax-deep-reef.js) are registered with this one. See
// parallax-shapes.js for the painter contract. L.lamp is the windows' colour, L.bone the skeleton's.
// Signs for the live art: { spire, x, y } on every roof's tip, { rose, x, y, r } and { skull, x, y, r }.
import { mix } from './sprites.js';
import { tint } from './parallax-deep-kit.js';
import { ridges, slope, streaks, growth, GROWTH } from './parallax-deep-ridge.js';
import { tower, spire } from './parallax-deep-towers.js';
import { hall } from './parallax-deep-hall.js';
import { aqueduct, bridge } from './parallax-deep-span.js';
import { palace } from './parallax-deep-palace.js';
import { whale } from './parallax-deep-whale.js';
import { MID } from './parallax-deep-mid.js';
import { REEF } from './parallax-deep-reef.js';

const HAZE = '#0e5a78'; // the water's colour in the distance (look.haze)
const BACK_HAZE = 0.3;
const BACK_ALPHA = 0.5; // the skyline's opacity: faint, so the rim of light on its tops is dim too // how far the skyline's spires are washed toward the haze: tune for how plainly they show
const FAR_HAZE = 0.15; // and the kingdom on the middle ridge

// The kingdom's towers on the middle ridge: [x, height to the gallery, width, roof].
const TOWERS = [
  [60, 140, 32, 'broken'], [180, 205, 34, 'onion'], [300, 165, 28, 'cone'], [405, 120, 30, 'flat'],
  [545, 190, 34, 'cone'], [660, 150, 30, 'onion'], [780, 215, 36, 'cone'],
  [1475, 160, 30, 'onion'], [1565, 205, 34, 'cone'], [2040, 170, 30, 'cone'],
];
const PALACE_X = 1030;
const BRIDGE_X = 1700;
const WHALE = [980, 1640]; // from the tail tip to the skull's back
const AQUEDUCT = { x: 560, n: 8, span: 50, fallen: [3, 4, 6] };

function sunkenkingdom(g, w, h, rng, L, out) {
  g.save();
  const { back, far, near } = ridges(rng, w);
  const [skyline, middle] = [mix(L.color, HAZE, BACK_HAZE), mix(L.color, HAZE, FAR_HAZE)];
  const L2 = { ...L, color: middle };
  const grow = GROWTH((c, k) => tint(L, c, k));

  g.globalAlpha = BACK_ALPHA;
  slope(g, w, h, back, skyline); // the farthest ridge and its skyline of slim spires
  for (let x = -20; x < w - 50; x += 44 + rng() * 58) spire(g, rng, x, back(x) + 6, 12 + rng() * 13, 60 + rng() * 130, skyline);
  g.globalAlpha = 1;

  slope(g, w, h, far, middle); // the middle ridge and the kingdom on it
  streaks(g, rng, w, far, 70);
  for (const [x, th, tw, roof] of TOWERS) tower(g, out, rng, L2, x, far(x) + 4, tw, th, roof, { odds: 0.14, stair: roof === 'flat' });
  palace(g, out, rng, L2, PALACE_X, far(PALACE_X) + 4);
  bridge(g, out, rng, L2, BRIDGE_X, far(BRIDGE_X + 150) - 128, far);
  growth(g, rng, w, far, grow, 0.7);

  const { x: ax, n, span, fallen } = AQUEDUCT; // the nearest ridge: hall, aqueduct, whale
  hall(g, out, rng, L, 190, near);
  tower(g, out, rng, L, ax - 14, near(ax) + 6, 28, 76, 'flat', { odds: 0.06, stair: true }); // the pump-house the aqueduct starts from
  aqueduct(g, out, rng, L, ax, n, span, near(ax) - 118, near(ax + n * span) - 84, near, fallen);
  whale(g, out, rng, L, WHALE[0], WHALE[1], near);
  slope(g, w, h, near, L.color);
  streaks(g, rng, w, near, 60);
  growth(g, rng, w, near, grow);
  g.restore();
}

export const DEEP = { sunkenkingdom, ...MID, ...REEF };
