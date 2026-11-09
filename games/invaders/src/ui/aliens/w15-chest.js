// World 15, Lantern Deep, what the sea turtle carries (see w15-5.js): a small iron-banded treasure chest in
// old dark wood with brass corners, a lock plate and a pale ribbon bow on its lid, which lifts a sliver
// on one beat and lets a thread of pale light out; and a lit lantern on a curved wooden pole lashed to the
// shell, hung on a short chain from the pole's hook and swinging between the beats. Lights: the lantern's
// pale gold-white flame and its teal glow, and the thread of light under the lid.
import { path, ink, lin, rgba, shade, bloom, eye, line, ellipse, circle, INK } from './w15-kit-2.js';
import { BRASS, IRON, WICK, GLOW, brassV, rivet, glint } from './w15-kit-2.js';

const WOOD = '#6a4a3a';
const STRAP = [-6.8, 6.8]; // x of the two iron bands

// y of the lid's top edge at x: a shallow dome over the box.
const lidY = (x) => -0.5 - 5.4 * (1 - (x / 11) ** 2);

function strap(b, x, top, bottom, w) {
  path(b, [[x - w, bottom], [x - w, top + 0.4], [x + w, top + 0.4], [x + w, bottom]]);
  ink(b, lin(b, x - w, 0, x + w, 0, [[0, shade(IRON, 0.35)], [0.5, IRON], [1, shade(IRON, -0.5)]]), 1.2);
}

// The chest at its own centre; beat f lifts the lid a sliver (and a thread of light) on beat 1.
export function chest(b, l, f) {
  const open = f ? 1.8 : 0;
  b.save();
  b.rotate(f ? -0.04 : 0.04);
  path(b, [[-11, -0.5], [11, -0.5], [11, 9], [-11, 9]]); // the box
  ink(b, lin(b, -11, 0, 11, 0, [[0, shade(WOOD, 0.3)], [0.5, WOOD], [1, shade(WOOD, -0.55)]]), 2.2);
  for (const x of [-3.7, 0, 3.7]) { // planks
    path(b, [[x + 1.8, 0], [x + 1.8, 9]], true);
    line(b, rgba('#1a0e08', 0.5), 0.8);
  }
  if (open) {
    path(b, [[-10.4, -0.5 - open], [10.4, -0.5 - open], [10.4, -0.5], [-10.4, -0.5]]); // the gap under the lid
    b.fillStyle = '#120a06';
    b.fill();
    l.save();
    l.globalCompositeOperation = 'lighter';
    l.fillStyle = lin(l, 0, -0.5 - open, 0, -0.5, [[0, rgba(WICK, 0.15)], [1, rgba(WICK, 0.7)]]);
    l.fillRect(-9.6, -0.5 - open + 0.3, 19.2, open - 0.2);
    l.restore();
    bloom(l, 0, -1.4, 12, WICK, 0.35);
  }
  strap(b, STRAP[0], 0, 9, 1.7);
  strap(b, STRAP[1], 0, 9, 1.7);
  b.save();
  b.translate(0, -open);
  b.beginPath(); // the lid
  b.moveTo(-11, -0.5);
  for (let i = 0; i <= 16; i++) b.lineTo(-11 + i * 1.375, lidY(-11 + i * 1.375));
  b.lineTo(11, -0.5);
  b.closePath();
  ink(b, lin(b, -11, -6, 11, 0, [[0, shade(WOOD, 0.5)], [0.5, shade(WOOD, 0.12)], [1, shade(WOOD, -0.5)]]), 2.2);
  for (const x of STRAP) {
    path(b, [[x - 1.7, -0.5], [x - 1.7, lidY(x - 1.7) + 0.3], [x + 1.7, lidY(x + 1.7) + 0.3], [x + 1.7, -0.5]]);
    ink(b, lin(b, x - 1.7, 0, x + 1.7, 0, [[0, shade(IRON, 0.35)], [0.5, IRON], [1, shade(IRON, -0.5)]]), 1.1);
    rivet(b, x, lidY(x) + 2, 0.75, IRON);
  }
  path(b, [[-9, lidY(-9) + 1.4], [9, lidY(9) + 1.4]], true);
  line(b, rgba('#ffffff', 0.22), 0.9);
  b.restore();
  for (const x of [-9.8, 9.8]) { // brass corners
    path(b, [[x - 1.2, 3.6], [x + 1.2, 3.6], [x + 1.2, 9.6], [x - 1.2, 9.6]]);
    ink(b, brassV(b, 3.6, 9.6), 0.9);
  }
  path(b, [[-2.6, 0.8], [2.6, 0.8], [2.6, 5.2], [-2.6, 5.2]]); // the lock plate
  ink(b, brassV(b, 0.8, 5.2, shade(BRASS, 0.1)), 1.1);
  ellipse(b, 0, 2.6, 0.6, 0.6);
  b.fillStyle = '#120a06';
  b.fill();
  path(b, [[0, 3], [0, 4.2]], true);
  line(b, '#120a06', 0.8);
  bow(b, 0, lidY(0) - open + 0.6);
  b.restore();
}

// A small ribbon bow in pale gold: two loops, two tails, a knot.
function bow(b, x, y) {
  for (const m of [-1, 1]) {
    path(b, [[x, y], [x + m * 3.8, y - 2.8], [x + m * 5.2, y - 0.4], [x + m * 3.6, y + 1.6]]);
    ink(b, '#f4e8c0', 0.9);
    path(b, [[x, y], [x + m * 1.2, y + 3.4], [x + m * 2.6, y + 2.8]]);
    ink(b, shade('#f4e8c0', -0.2), 0.8);
  }
  circle(b, x, y, 1.2);
  ink(b, '#fff6d8', 0.8);
}

// The lantern hanging from (0, 0) in the current transform, as long as it is tall: ring, cap, glass, base.
function lamp(b, l) {
  path(b, [[0, 0], [0, 3.2]], true);
  line(b, INK, 2.2);
  line(b, '#8a98a4', 1);
  circle(b, 0, 3.6, 1.5);
  line(b, INK, 2);
  line(b, '#aab6c0', 0.8);
  path(b, [[-2.4, 5.4], [2.4, 5.4], [4.6, 8.4], [-4.6, 8.4]]);
  ink(b, lin(b, -4.6, 0, 4.6, 0, [[0, shade(IRON, 0.3)], [0.5, IRON], [1, shade(IRON, -0.5)]]), 1.2);
  path(b, [[-4, 8.4], [4, 8.4], [4, 17.4], [-4, 17.4]]);
  ink(b, lin(b, -4, 0, 4, 0, [[0, shade(WICK, -0.15)], [0.45, '#ffffff'], [1, shade(WICK, -0.3)]]), 1.1);
  for (const x of [-4, -1.3, 1.3, 4]) { // the frame's bars
    path(b, [[x, 8.4], [x, 17.4]], true);
    line(b, rgba(IRON, 0.9), 0.9);
  }
  path(b, [[-4.8, 17.4], [4.8, 17.4], [3.6, 19.6], [-3.6, 19.6]]);
  ink(b, lin(b, -4.8, 0, 4.8, 0, [[0, shade(IRON, 0.3)], [0.5, IRON], [1, shade(IRON, -0.5)]]), 1.2);
  bloom(l, 0, 13, 13, GLOW, 0.34);
  eye(l, 0, 13, 2.4, WICK, 3.2);
  glint(l, 1.6, 10.6, 1.8, '#ffffff', 0.7);
}

// The pole from its bracket on the shell up and over in a hook; the lantern swings from the hook.
export function pole(b, l, f) {
  const sway = f ? 0.8 : -0.8;
  const [ax, ay] = [26.4 + sway, -35];
  b.beginPath();
  b.moveTo(15, -12);
  b.bezierCurveTo(13, -30, 17 + sway, -43, ax + 1, -39.4);
  b.lineTo(ax, ay);
  line(b, INK, 4.4);
  line(b, '#5a4636', 2.8);
  b.beginPath();
  b.moveTo(14.2, -13);
  b.bezierCurveTo(12.2, -30, 16.2 + sway, -42, ax, -40.4);
  line(b, rgba('#b8a080', 0.4), 0.9);
  for (const y of [-18, -26]) { // lashings
    path(b, [[12.4, y], [17, y + 1.6]], true);
    line(b, '#d6c49a', 1.3);
  }
  path(b, [[12, -14], [18.4, -14], [18.4, -10], [12, -10]]); // the bracket on the shell
  ink(b, lin(b, 12, 0, 18.4, 0, [[0, shade(IRON, 0.3)], [1, shade(IRON, -0.5)]]), 1.2);
  rivet(b, 13.6, -12, 0.6, IRON);
  rivet(b, 16.8, -12, 0.6, IRON);
  for (const g of [b, l]) {
    g.save();
    g.translate(ax, ay);
    g.rotate(f ? -0.2 : 0.22);
  }
  lamp(b, l);
  for (const g of [b, l]) g.restore();
}
