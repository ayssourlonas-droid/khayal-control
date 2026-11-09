// The far layer of Glass Cathedral: a vast cathedral standing half ruined on a terrace, seen across the dawn. On the
// left the transept's end wall with its triple lancet and round window; then the nave, five bays of tall piers,
// pinnacles and flying buttresses, a clerestory of paired stained lancets in each whole bay and a hole where one
// wall has gone; in the middle the west front with the great rose window in its broken wall, three portals
// glowing with the dawn and two towers, the left with a bell in its belfry; to the right a free-standing window frame
// still holding a few panes, and an arcade of pointed arches. A faint cloister stands in the haze behind it all.
// Every window is lit from behind and carries a halo, so the glass reads as colour and the stone as shadow with
// the sun's rim on its right-hand edges. Files: parallax-glass-kit.js (shared shapes and colours), -window, -rose,
// -front, -nave, -ruin; the mid layer (parallax-glass-mid.js) and the near one (parallax-glass-near.js) are
// registered with this one. See parallax-shapes.js for the painter contract.
// Signs for the live art: { rose, x, y, r } (the turning fan of light), { bell, x, y, len, hw }.
import { rgba, lin } from './sprites.js';
import { profile } from './parallax-kit.js';
import { lancetPath } from './parallax-glass-kit.js';
import { skyline, transept, tracery, arcade, rubble } from './parallax-glass-ruin.js';
import { nave, BAY } from './parallax-glass-nave.js';
import { front, spill } from './parallax-glass-front.js';
import { MID } from './parallax-glass-mid.js';
import { NEAR } from './parallax-glass-near.js';

export const BASE = 470; // the terrace's top in the layer (the layer is 700 tall)
const HAZE = '#6a2a7a'; // the dawn haze (look.haze)
const FRONT_X = 1330; // the west front's centre, under the sun (SUN_X in the kit)
const BAYS = ['half', 'whole', 'open', 'whole', 'whole'];

function glassnave(g, w, h, rng, L, out) {
  g.save();
  skyline(g, rng, w, BASE, L, HAZE);
  g.fillStyle = L.color;
  transept(g, out, rng, L, 300, BASE);
  nave(g, out, rng, L, FRONT_X - 214 - 43 - BAYS.length * BAY, BASE, BAYS);
  front(g, out, rng, L, FRONT_X, BASE);
  tracery(g, out, rng, L, 1760, BASE);
  arcade(g, rng, L, 1900, BASE, ['whole', 'half', 'gone']);
  g.fillStyle = L.color; // the terrace and what has fallen on it
  const ground = (x) => BASE + 3 + 3 * Math.sin(x * 0.006);
  profile(g, w, h, ground);
  g.fillStyle = rgba('#06030f', 0.4); // a blind arcade of pointed recesses along the terrace's face
  for (let x = 150; x < w - 60; x += 58) {
    lancetPath(g, x, BASE + 70, 13, 52, 1.2);
    g.fill();
  }
  g.fillStyle = lin(g, 0, BASE, 0, BASE + 160, [[0, rgba('#0a0618', 0)], [1, rgba('#0a0618', 0.88)]]);
  profile(g, w, h, ground);
  g.fillStyle = rgba('#c8a0d8', 0.1);
  g.fillRect(0, BASE + 3, w, 2.4);
  g.fillStyle = L.color;
  rubble(g, rng, L, 160, w - 100, BASE);
  spill(g, FRONT_X, BASE);
  g.restore();
}

export const GLASS = { glassnave, ...MID, ...NEAR };
