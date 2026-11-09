// The Craving's figure in smoke (World 17, Ash to Air; craving-paint.js lights it): ONE solid thunderhead, a looming giant with a head, shoulders
// and two raised arms, laid back to front on a context whose origin is the boss's centre.
//   the SOLID body: opaque charcoal discs heaped from arm to arm, whose union is the bumpy outline (below) and under which the sky never
//     shows; the sky shows only in the two V notches either side of the head
//   the BILLOWS: big lit billows (craving-puff.js) heaped over it: a pale cool crest on every upper edge, a dark belly, an ember glow
//     under the lower rims, and dark crevices where the solid body shows between them; the shading lives inside the outline
//   the SHADOWS: dark billows over the lit ones, hollows under the brows and round the maw; the STREAKS: thin ribbons flowing up and
//     round over the dome, the cheeks and the shoulders; the coal streams (craving-spill.js) rising behind the rim
// Every billow and stream takes the churn `pose` (0..1; each puff turns once round its own small ellipse as it goes round).
import { lin, hash } from '../sprites.js';
import { lay, puff } from './craving-puff.js';
import { coalStreams } from './craving-spill.js';
import { TAU } from '../../core/math.js';

export const TOP = -154; // no puff's box crosses this y
export const FB = { x: -380, y: -158, w: 760, h: 298 }; // the box the figure is painted in (boss-local; down to y 140, for the spill); craving-paint.js and the frames use it
// The SOLID body: charcoal discs [x, y, r] heaped from arm to arm into one continuous thunderhead, opaque, with the bumpy outline of
// their union (the sky never shows through inside it, only in the deliberate notches): the head's dome rising to y -150 behind the crown;
// a V notch of sky on each side of it (|x| about 165..215, down to y -62); the shoulders swelling out and up into the arms, whose tops
// stay under the hands' (y -110, the claws at x +-213..363); and the chest down to the bowl's mouth. Its discs are the left side
// and the middle; the right is mirrored.
const SOLID = [
  [0, -82, 68], [-58, -78, 64], [-110, -58, 58], [-148, -22, 50], [-186, 16, 44], [-226, -12, 44], [-266, -62, 56], [-308, -76, 46],
  [-312, -12, 40], [-306, 26, 42], [-284, 50, 48], [-240, 28, 60], [-200, 56, 54], [-150, 24, 70], [-96, 6, 78], [-40, -30, 70], [0, -30, 80], [0, 28, 96],
  [-120, 56, 60], [-60, 52, 60], [0, 54, 60],
];
// The lit billows, laid from the top down: [x, y, size]. Above y -10 they are the cool ones (no ember belly). The first rows are the
// crests of the dome and of the shoulders; then the body (bigger ones, for volume and dark crevices between).
const BILLOWS = [
  [0, -96, 144], [-62, -90, 144], [62, -90, 144], [-122, -72, 144], [122, -72, 144], [-172, 6, 144], [172, 6, 144],
  [-262, -80, 144], [262, -80, 144], [-300, -74, 144], [300, -74, 144], [-302, -34, 144], [302, -34, 144],
  [-30, -50, 200], [34, -50, 200], [-100, -30, 200], [100, -30, 200],
  [-262, -30, 200], [262, -30, 200], [-296, 6, 144], [296, 6, 144], [-206, 4, 200], [206, 4, 200],
  [-276, 40, 200], [276, 40, 200], [-236, 44, 280], [236, 44, 280], [-150, 30, 200], [150, 30, 200],
  [-60, 20, 200], [60, 20, 200], [-110, 54, 200], [110, 54, 200], [0, 52, 200],
];
// The shadows, dark rimless billows laid over the lit ones: hollows under the brows, round the maw and in the cheeks, [x, y, size].
const SHADOWS = [[-150, 22, 104], [150, 22, 104], [-98, -22, 72], [98, -22, 72], [-88, 22, 104], [88, 22, 104], [-196, -2, 104], [196, -2, 104]];
// The streaks: thin ribbons of smoke over the dome, the cheeks and the shoulders, [x, y, size, tilt]; each sways with the churn.
const STREAKS = [
  [-100, -80, 144, -0.4], [-30, -96, 144, 0.2], [60, -90, 208, -0.3], [112, -70, 144, 0.5],
  [-150, -10, 208, 0.3], [150, -10, 208, -0.3], [-250, 20, 208, -0.5], [250, 20, 208, 0.5],
];
BILLOWS.sort((p, q) => p[1] - q[1]); // top down: each lower billow lays its pale crest over the dark belly of the one above

// The solid body: the discs and their mirror, flat charcoal with a soft shaded fall (darker to the bottom).
function solid(g) {
  for (const [x, y, r] of SOLID) {
    for (const s of x ? [-1, 1] : [1]) {
      g.fillStyle = lin(g, 0, y - r, 0, y + r, [[0, '#3a373d'], [0.5, '#2b282c'], [1, '#1b181a']]);
      g.beginPath();
      g.arc(s * x, y, r, 0, TAU);
      g.fill();
    }
  }
}

// One streak: a wisp of the biggest size that, tilted, keeps its box under TOP (a tilted box is (w |sin| + h |cos|) / 2 high), drawn
// moved round a small ellipse by the pose.
function streak(g, x, y, size, tilt, i, pose) {
  const ph = TAU * (pose + hash(i * 7 + 5));
  const [cx, cy] = [x + Math.cos(ph) * 8, y + Math.sin(ph) * 6];
  const rot = tilt + 0.12 * Math.sin(ph + 1);
  const half = (w, h) => (w * Math.abs(Math.sin(rot)) + h * Math.abs(Math.cos(rot))) / 2;
  let sprite = puff('wisp', size, i);
  for (const s of [144, 96, 64]) {
    if (cy - half(sprite.width, sprite.height) >= TOP + 4) break;
    sprite = puff('wisp', Math.min(s, size - 1), i);
  }
  if (cy - half(sprite.width, sprite.height) < TOP + 4) return;
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  g.globalAlpha = 0.6;
  g.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  g.restore();
}

export function figure(g, pose) {
  g.save();
  g.beginPath();
  g.rect(FB.x, TOP, FB.w, FB.y + FB.h - TOP);
  g.clip();
  solid(g);
  coalStreams(g, pose, TOP);
  BILLOWS.forEach(([x, y, size], i) => lay(g, y < -10 ? 'cool' : 'billow', x, y, size, i, 50, pose, 13, TOP));
  SHADOWS.forEach(([x, y, size], i) => lay(g, 'core', x, y, size, i, 70, pose, 9, TOP));
  STREAKS.forEach(([x, y, size, tilt], i) => streak(g, x, y, size, tilt, i, pose));
  g.restore();
}
