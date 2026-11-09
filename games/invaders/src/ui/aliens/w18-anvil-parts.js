// The parts of World 18's anvil-plated hulk that are not its iron (w18-anvil.js): the two jets it hovers on, the vents in
// its base and the face-plate on its waist with two angry slits.
import { path, ink, lin, rgba, bloom, line, both, IRON_D, STEEL, COPPER, FORGE, HOT, VOLT, rivets, round } from './w18-kit.js';

// The jets under the base: an iron bell with a copper lip each, and a flame of blue-white plasma that gutters with the beat.
export function jets(b, l, f) {
  both((s) => {
    const x = s * 16;
    path(b, [[x - 5.4, 27], [x + 5.4, 27], [x + 3.6, 35], [x - 3.6, 35]]);
    ink(b, round(b, x - 5.4, x + 5.4, IRON_D, 0.5), 2.2);
    b.beginPath();
    b.rect(x - 4.4, 33.6, 8.8, 2.6);
    ink(b, round(b, x - 4.4, x + 4.4, COPPER, 0.5), 1.4);
    const len = (f ? 6 : 11) + (s > 0 ? 1.5 : 0);
    bloom(l, x, 39, 10, VOLT, f ? 0.4 : 0.55);
    for (const [w, c, a] of [[3.6, VOLT, 0.7], [2.2, '#d8f0ff', 0.9], [1, '#ffffff', 1]]) {
      l.save();
      l.globalCompositeOperation = 'lighter';
      l.beginPath();
      l.moveTo(x - w, 36);
      l.quadraticCurveTo(x - w * 0.6, 36 + len * 0.6, x, 36 + len);
      l.quadraticCurveTo(x + w * 0.6, 36 + len * 0.6, x + w, 36);
      l.closePath();
      l.fillStyle = rgba(c, a);
      l.fill();
      l.restore();
    }
  });
}

// The base's front: a dark band of vents with the forge's heat leaking through four slits, riveted above and below.
export function base(b, l, f) {
  b.beginPath();
  b.rect(-26, 21.4, 52, 5.6);
  ink(b, lin(b, 0, 21, 0, 27, [[0, '#070912'], [1, '#161a28']]), 1.6);
  rivets(b, -25, 19.6, 25, 19.6, 8, 0.9, STEEL);
  rivets(b, -25, 28, 25, 28, 8, 0.9, STEEL);
  [-21, -10.5, 10.5, 21].forEach((x, i) => {
    b.beginPath();
    b.rect(x - 3.6, 22.8, 7.2, 2.8);
    b.fillStyle = '#2a0c04';
    b.fill();
    const hot = (i + (f ? 1 : 0)) % 2 ? 1 : 0.6; // the heat shifts from slit to slit with the beat
    bloom(l, x, 24.2, 11, FORGE, 0.35 * hot);
    l.fillStyle = rgba(FORGE, 0.9 * hot);
    l.fillRect(x - 3.4, 23, 6.8, 2.4);
    l.fillStyle = rgba(HOT, 0.8 * hot);
    l.fillRect(x - 2.4, 23.7, 4.8, 1);
  });
}

// The face-plate over the waist: bolted iron with a brow and a slit eye each side, and a grille under them.
export function faceplate(b, l, f) {
  path(b, [[-11, -8.4], [11, -8.4], [10.2, 8], [-10.2, 8]]);
  ink(b, lin(b, -11, -8, 11, 8, [[0, '#4a5470'], [0.5, '#262c40'], [1, '#12151f']]), 2);
  b.beginPath();
  b.moveTo(-10, -7.4);
  b.lineTo(10, -7.4);
  line(b, rgba('#ffffff', 0.35), 0.9);
  rivets(b, -8.6, -6, 8.6, -6, 2, 0.9, STEEL);
  rivets(b, -8.2, 6.4, 8.2, 6.4, 2, 0.9, STEEL);
  both((s) => {
    path(b, [[s * 11, -6.6], [s * 1.2, -1.6], [s * 1.2, -4.2], [s * 11, -9.2]]); // the brow, heavy and slanting
    ink(b, lin(b, 0, -9, 0, -2, [[0, '#6a7690'], [1, '#161a28']]), 1.6);
    const eye = [[s * 9.4, -2.4], [s * 2.8, 0.8], [s * 2.8, 3.4], [s * 9.4, 0.4]]; // the slit, deepest toward the middle
    path(b, eye);
    ink(b, '#1a0804', 1.4);
    path(l, eye);
    l.save();
    l.globalCompositeOperation = 'lighter';
    l.fillStyle = rgba(FORGE, f ? 0.7 : 0.92);
    l.fill();
    l.restore();
    path(l, [[s * 8.6, -1.2], [s * 3.4, 1.2]], true);
    l.save();
    l.globalCompositeOperation = 'lighter';
    l.lineWidth = 1.1;
    l.strokeStyle = rgba(HOT, 0.95);
    l.stroke();
    l.restore();
    bloom(l, s * 5.6, 0.8, 11, FORGE, f ? 0.35 : 0.55);
  });
  for (const x of [-4.5, -1.5, 1.5, 4.5]) { // the grille, backlit
    b.beginPath();
    b.rect(x - 0.9, 3.8, 1.8, 3);
    b.fillStyle = '#05060c';
    b.fill();
  }
  bloom(l, 0, 5.4, 8, FORGE, 0.18);
}
