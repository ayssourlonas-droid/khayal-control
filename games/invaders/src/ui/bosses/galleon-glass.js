// What glows or is lettered on the Thunder Galleon (World 13, Sunset Armada; bosses/galleon*.js): an arched
// window with a brass frame and amber glass, a lantern, and the few block letters of its name plate.
// Bake-time only: nothing here runs per frame.
import { path, ink, line, lin, rgba, bloom, eye } from './kit.js';
import { BRASS_L, BRASS_D, TEAK_D, WARM, FIRE } from './galleon-kit.js';

const INK_ROPE = '#1a0e06';

// An arched window path, x, y its top left.
export function arch(g, x, y, w, h) {
  g.beginPath();
  g.moveTo(x, y + h);
  g.lineTo(x, y + w / 2);
  g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
  g.lineTo(x + w, y + h);
  g.closePath();
}

// A window with a brass frame, amber glass and a cross of bars; the light goes on `l`.
export function window(b, l, x, y, w, h, a = 1) {
  arch(b, x - 1.5, y - 1.5, w + 3, h + 3);
  ink(b, lin(b, 0, y, 0, y + h, [[0, BRASS_L], [1, BRASS_D]]), 1.6);
  arch(b, x, y, w, h);
  b.fillStyle = lin(b, 0, y, 0, y + h, [[0, '#ffb340'], [0.5, '#ffe49a'], [1, '#ffcf6a']]);
  b.fill();
  b.save();
  b.clip();
  b.fillStyle = rgba('#7a2a08', 0.35);
  b.fillRect(x, y + h * 0.7, w, h * 0.3);
  b.restore();
  b.beginPath();
  b.moveTo(x + w / 2, y);
  b.lineTo(x + w / 2, y + h);
  b.moveTo(x, y + h * 0.55);
  b.lineTo(x + w, y + h * 0.55);
  line(b, rgba(TEAK_D, 0.85), 1.1);
  arch(l, x, y, w, h);
  l.fillStyle = rgba(WARM, 0.4 * a);
  l.fill();
  bloom(l, x + w / 2, y + h / 2, Math.max(w, h) * 1.3, WARM, 0.26 * a);
}

// A lantern 12 wide, hung from (x, y): a cap and ring above, a cage of brass round a lit glass, a foot.
export function lantern(b, l, x, y, s = 1) {
  b.save();
  b.translate(x, y);
  b.scale(s, s);
  b.beginPath();
  b.moveTo(0, 0);
  b.lineTo(0, 4);
  line(b, INK_ROPE, 1.4);
  path(b, [[-4, 9], [-2.5, 4], [2.5, 4], [4, 9]]);
  ink(b, lin(b, -4, 0, 4, 0, [[0, BRASS_D], [0.4, BRASS_L], [1, BRASS_D]]), 1.2);
  b.beginPath();
  b.roundRect(-5, 9, 10, 12, 2);
  ink(b, lin(b, 0, 9, 0, 21, [[0, '#ffe9a8'], [0.6, '#ffc050'], [1, '#e88a28']]), 1.4);
  b.beginPath();
  b.moveTo(0, 9);
  b.lineTo(0, 21);
  line(b, rgba('#3a2208', 0.75), 1);
  path(b, [[-5, 21], [-3.5, 24.5], [3.5, 24.5], [5, 21]]);
  ink(b, lin(b, -5, 0, 5, 0, [[0, BRASS_D], [0.4, BRASS_L], [1, BRASS_D]]), 1.2);
  b.restore();
  eye(l, x, y + 15 * s, 3.6 * s, WARM, 3.4);
  bloom(l, x, y + 15 * s, 26 * s, FIRE, 0.22);
}
// Block letters on a 4 x 6 grid: the few the name plate wants.
const LETTERS = {
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
  U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  D: [[[0, 0], [0, 6], [2.5, 6], [4, 4.5], [4, 1.5], [2.5, 0], [0, 0]]],
  E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
  R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2], [3, 3], [0, 3]], [[2, 3], [4, 6]]],
};

// `word` in block letters, `size` px tall, centred on (cx, cy): the strokes of every letter added to g's path.
export function letters(g, word, cx, cy, size) {
  const k = size / 6;
  const pitch = 5.6 * k;
  const x0 = cx - ((word.length - 1) * pitch + 4 * k) / 2;
  g.beginPath();
  [...word].forEach((ch, i) => {
    for (const s of LETTERS[ch] ?? []) s.forEach(([x, y], j) => g[j ? 'lineTo' : 'moveTo'](x0 + i * pitch + x * k, cy - size / 2 + y * k));
  });
}
