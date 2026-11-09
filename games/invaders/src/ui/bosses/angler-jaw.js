// The Lantern Leviathan's mouth, the hull's share (World 15, Lantern Deep; see angler.js): the pale throat under the
// jaw, the dark of the mouth running out under the eyes to the corners (the chamber in the middle is the maw part's,
// angler-maw.js, which fades into it at its sides), the upper lip, a swollen roll of flesh, with the needles that
// hang from it (all but the middle ones, which are the maw's), the baked jaw under the live one (angler-jaw-sprite.js)
// and the barbels that dangle from it, each tipped with a small lamp. Painted in boss coordinates.
import { path, line, lin, rad, rgba } from './kit.js';
import { mouthPath, upper, needlePath, photophore, rng, CH, CORNER, GLOOM, TEAL, INK, AQUA, FLESH, headPath, circle } from './angler-kit.js';
import { TEETH, fang } from './angler-teeth.js';
import { chin } from './angler-jaw-sprite.js';
import { wrinkles } from './angler-skin.js';

export { jawBase } from './angler-jaw-sprite.js';

const sweep = (f, x0, x1, step = 6) => {
  const pts = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, f(x)]);
  return pts;
};

// The pale throat: the underside is a lighter, smoother blue-grey where the belly lights are set, with the soft
// pleats a throat that swallows whole fish needs, curving under the jaw.
export function throat(b) {
  b.save();
  headPath(b);
  b.clip();
  b.fillStyle = rad(b, 0, 124, 10, 180, [[0, rgba('#8cbcd0', 0.5)], [0.5, rgba('#4a7c9c', 0.3)], [1, rgba('#3a6a8c', 0)]]);
  b.fillRect(-256, 50, 512, 100);
  wrinkles(b, 53, [-150, 70, 150, 122], 14); // the soft folds a throat that swallows whole fish needs
  b.restore();
}

// The mouth's dark, a faint teal deep inside where the throat's light reaches along the slot.
export function cavity(b) {
  mouthPath(b);
  b.fillStyle = rad(b, 0, -20, 30, 220, [[0, '#031820'], [0.5, '#020c14'], [1, GLOOM]]);
  b.fill();
}

// The upper lip: a swollen roll of flesh above the mouth's edge, lumpy where the skin gathers, lit on top, dark
// under it where it shades the mouth, the edge itself inked.
export function lip(b) {
  const r = rng(41);
  for (const s of [-1, 1]) {
    for (let x = 6; x < CORNER; x += 11 + r() * 5) {
      const [px, py, rr] = [s * x, upper(x) - 6 - r() * 3, 7 + r() * 5];
      b.fillStyle = rad(b, px, py, 0, rr, [[0, rgba('#6aa0c0', 0.34)], [0.55, rgba(FLESH, 0.2)], [1, rgba('#000610', 0.34)]], px - rr * 0.3, py - rr * 0.35);
      circle(b, px, py, rr);
      b.fill();
    }
    const edge = sweep(upper, 0, CORNER).map(([x, y]) => [s * x, y]);
    path(b, edge, true);
    line(b, INK, 4.4);
    path(b, edge.map(([x, y]) => [x, y - 3.5]), true);
    line(b, rgba('#8cc8e0', 0.36), 1.4);
    path(b, edge.map(([x, y]) => [x, y + 4]), true);
    line(b, rgba('#000812', 0.4), 3);
  }
}

// The needles beyond the chamber: the upper row hangs from the lip.
export const hullFangs = () => TEETH.up.filter((t) => Math.abs(t.x) >= CH - 36); // from where the maw's sides fade out
export function fangsHull(b, l) {
  for (const t of hullFangs()) fang(b, l, t);
}

// A barbel: a thin fleshy filament hanging from (x, y) at angle `a`, with a small lamp at its tip.
export function barbel(b, l, x, y, a, len, c = TEAL) {
  for (const g of [b, l]) {
    g.save();
    g.translate(x, y);
    g.rotate(a);
  }
  const bend = len * 0.3 * (x < 0 ? -1 : 1);
  needlePath(b, len, 3.8, bend);
  b.fillStyle = lin(b, 0, -2, 0, 2, [[0, '#2a5878'], [1, '#0a1c30']]);
  b.fill();
  line(b, INK, 0.9);
  photophore(b, l, len, bend, 2.4, c, 0.8);
  for (const g of [b, l]) g.restore();
}

export function barbels(b, l) {
  for (const s of [-1, 1]) {
    [[204, 0.62, 26], [178, 0.85, 30], [150, 1.1, 34], [118, 1.3, 28], [80, 1.45, 24]].forEach(([x, a, len], i) => {
      barbel(b, l, s * x, chin(x) + 1, s > 0 ? a + 0.4 : Math.PI - a - 0.4, len, i % 2 ? '#8ad8ff' : TEAL);
    });
  }
  barbel(b, l, -26, chin(26) + 2, 1.7, 24, AQUA);
  barbel(b, l, 26, chin(26) + 2, 1.45, 28, AQUA);
}
