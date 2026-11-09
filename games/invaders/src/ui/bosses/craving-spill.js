// The Craving's smoke over the ashtray's rim and out of its bowl (World 17, Ash to Air; craving-figure.js, craving-paint.js):
//   spill(g, pose)    smoke pouring over the rim: big lit billows at the rim's far ends (|x| 250 to 370), solid, and a thin haze of
//                     smaller ones along the front arc at about a third of their strength, so that the heaps of ash, the rests and the
//                     lit butts of the rim stay readable through it (they are the cues that this is an ashtray); then fading
//                     down the lip and the wall (fadeSpill), so the throne looks half immersed in smoke. Drawn LAST, over the rim:
//                     it is part of the live frames, which are drawn over the hull (the hull's own frozen frame has none).
//   coalStreams(g, pose)  tendrils streaming up out of the coals, wavy rising bands either side of the tray; they start behind the rim
//                     (the figure is cut away above the bowl's mouth) and rise to the cheeks.
// Boss coordinates, from the throne's numbers (craving-throne-geo.js).
import { lin } from '../sprites.js';
import { lay } from './craving-puff.js';
import { tendril } from './craving-smoke.js';
import { rimFront, lipBottom } from './craving-throne-geo.js';

const FAR = 380; // the box's half width
// The spill: [x, size, strength], mirrored. A billow sits on the rim's front arc at x, a little above its middle.
const SPILL = [[296, 144, 1], [262, 104, 0.8], [226, 144, 0.34], [172, 144, 0.34], [126, 104, 0.3]];
const STREAMS = [[[-96, 76, -126, 40, -88, -4], 30, 14, 41], [[96, 76, 126, 40, 88, -4], 30, 14, 42], [[-176, 70, -204, 30, -170, -26], 34, 16, 43], [[176, 70, 204, 30, 170, -26], 34, 16, 44]];
const FADE = 38; // px over which the spill dissolves down the wall, from just under the lip

export function coalStreams(g, pose, top) {
  for (const [path, r0, r1, seed] of STREAMS) tendril(g, path, r0, r1, seed, { pose, top, n: 8, amp: 8, wave: 0.4 });
}

export function spill(g, pose) {
  g.save();
  SPILL.forEach(([x, size, a], i) => {
    g.globalAlpha = a;
    for (const s of [-1, 1]) lay(g, 'billow', s * x, rimFront(x) - size * 0.1, size, i * 2 + (s > 0 ? 1 : 0), 60, pose, 9, -1e9);
  });
  g.restore();
}

// The spill dissolves downward: column by column, clear from FADE px under the lip's lower edge down.
export function fadeSpill(g, bottom) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  for (let x = -FAR; x < FAR; x += 8) {
    const y = lipBottom(Math.max(-340, Math.min(340, x + 4))) - 4;
    g.fillStyle = lin(g, 0, y, 0, y + FADE, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
    g.fillRect(x, y, 8, bottom - y);
  }
  g.restore();
}
